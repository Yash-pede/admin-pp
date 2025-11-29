// mainPdfDoc.tsx
import { Database } from "@/utilities";
import {
  ChallanBatchInfo,
  challanProductAddingType,
} from "@/utilities/constants";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import dayjs from "dayjs";
import numberToWords from "number-to-words";
import { mainPdfDocStyles as styles } from "../components/pdfStyles/mainPdfDocStyles";

type Props = {
  distributor: Database["public"]["Tables"]["profiles"]["Row"];
  customer: Database["public"]["Tables"]["customers"]["Row"];
  challanData: Database["public"]["Tables"]["challan"]["Row"];
  salesName?: string;
  products: Database["public"]["Tables"]["products"]["Row"][];
  billInfo: challanProductAddingType[];
  challanBatchInfo: Database["public"]["Tables"]["challan_batch_info"]["Row"][];
  stocksDetails: Database["public"]["Tables"]["stocks"]["Row"][];
};

// --------- helpers ----------
function safeParseBatchInfo(input: any): ChallanBatchInfo[] {
  if (!input) return [];
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (Array.isArray(input)) return input;
  return [];
}

function toTwo(num: number) {
  return Number.isFinite(num) ? num.toFixed(2) : "0.00";
}

function amountToWords(amount: number) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const rupeeWords =
    rupees > 0 ? numberToWords.toWords(rupees).replace(/,/g, "") + " Rupees" : "";
  const paiseWords =
    paise > 0 ? numberToWords.toWords(paise).replace(/,/g, "") + " Paise" : "";
  const joined =
    rupeeWords && paiseWords
      ? `${rupeeWords} and ${paiseWords} Only`
      : (rupeeWords || paiseWords) + " Only";
  return joined || "Zero Only";
}

// selling_price already includes GST
// gstSlab is like 5 / 12 / 18
function calculateLineTotalsInclusive(
  sellingPrice: number,
  billedQty: number,
  totalBilledQtyForProduct: number,
  discountPercent: number,
  gstSlab: number
) {
  const effectiveBilledQty = billedQty > 0 ? billedQty : 0;

  // total product value (only billed qty, NOT including free) for discount base
  const totalSellingValue = sellingPrice * totalBilledQtyForProduct;
  const totalDiscountAmount = totalSellingValue * (discountPercent / 100);

  // proportion of this batch in total billed qty
  const batchProportion = totalBilledQtyForProduct
    ? effectiveBilledQty / totalBilledQtyForProduct
    : 0;

  const batchDiscount = totalDiscountAmount * batchProportion;

  const lineGross = sellingPrice * effectiveBilledQty; // GST inclusive
  const lineNet = lineGross - batchDiscount; // after discount, GST inclusive

  // reverse-calc GST
  const taxableValue =
    gstSlab > 0 ? lineNet / (1 + gstSlab / 100) : lineNet;
  const taxAmount = lineNet - taxableValue;
  const sgstAmount = taxAmount / 2;
  const cgstAmount = taxAmount / 2;

  return {
    lineNet,
    taxableValue,
    sgstAmount,
    cgstAmount,
  };
}

// ========== MAIN COMPONENT ==========
export const MainPdfDoc: React.FC<Props> = ({
  distributor,
  customer,
  challanData,
  salesName,
  products,
  billInfo,
  challanBatchInfo,
  stocksDetails,
}) => {
  // GST summary per slab
  const gstSummary: Record<
    string,
    { taxable: number; sgst: number; cgst: number; totalTax: number }
  > = {};

  let subtotalTaxable = 0;
  let totalSGST = 0;
  let totalCGST = 0;
  let grandTotal = 0;

  const tableRows: React.ReactNode[] = [];

  (billInfo ?? []).forEach((product, prodIdx) => {
    const productDetails = products?.find(
      (p) => Number(p.id) === Number(product.product_id)
    );
    const gstSlab = Number(productDetails?.gst_slab ?? 0);
    const sellingPrice = product.selling_price || 0;
    const discountPercent = product.discount || 0;
    let remainingFree = product.free_q || 0;

    // All challan_batch_info rows for this product
    const matchingBatchRows = (challanBatchInfo ?? []).filter(
      (b) => Number(b.product_id) === Number(product.product_id)
    );

    // Flatten all batch_info arrays
    const batchListAll: ChallanBatchInfo[] = [];
    matchingBatchRows.forEach((b) => {
      const parsed = safeParseBatchInfo(b.batch_info);
      parsed.forEach((bi) => batchListAll.push(bi));
    });

    // First pass: compute billedQty per batch by consuming free from earliest batch
    type PerBatchCalc = {
      batch: ChallanBatchInfo;
      billedQty: number; // qty to bill for money
      freeTakenFromThisBatch: number;
    };

    const perBatch: PerBatchCalc[] = batchListAll.map((batch) => {
      const batchQty = batch.quantity || 0;
      let batchFree = 0;

      if (remainingFree > 0) {
        if (remainingFree >= batchQty) {
          batchFree = batchQty;
          remainingFree -= batchQty;
        } else {
          batchFree = remainingFree;
          remainingFree = 0;
        }
      }

      const billedQty = batchQty - batchFree;

      return {
        batch,
        billedQty: billedQty > 0 ? billedQty : 0,
        freeTakenFromThisBatch: batchFree,
      };
    });

    const totalBilledQtyForProduct = perBatch.reduce(
      (sum, b) => sum + b.billedQty,
      0
    );

    // Second pass: build rows and accumulate GST / totals
    perBatch.forEach((pb, itemIdx) => {
      const batchItem = pb.batch;
      const stock = stocksDetails?.find((s) => s.id === batchItem.batch_id);

      const { lineNet, taxableValue, sgstAmount, cgstAmount } =
        calculateLineTotalsInclusive(
          sellingPrice,
          pb.billedQty,
          totalBilledQtyForProduct,
          discountPercent,
          gstSlab
        );

      // accumulate GST summary
      const slabKey = String(gstSlab || 0);
      if (!gstSummary[slabKey]) {
        gstSummary[slabKey] = {
          taxable: 0,
          sgst: 0,
          cgst: 0,
          totalTax: 0,
        };
      }
      gstSummary[slabKey].taxable += taxableValue;
      gstSummary[slabKey].sgst += sgstAmount;
      gstSummary[slabKey].cgst += cgstAmount;
      gstSummary[slabKey].totalTax += sgstAmount + cgstAmount;

      subtotalTaxable += taxableValue;
      totalSGST += sgstAmount;
      totalCGST += cgstAmount;
      grandTotal += lineNet;

      tableRows.push(
        <View key={`${prodIdx}-${itemIdx}`} style={styles.tableRow}>
          {/* Qty = full physical batch qty */}
          <View style={[styles.tableCell, styles.colQty]}>
            <Text>{batchItem.quantity}</Text>
          </View>

          {/* Free column: show total free only on first batch row of product */}
          <View style={[styles.tableCell, styles.colFree]}>
            {itemIdx === 0 && <Text>{product.free_q ?? 0}</Text>}
          </View>

          <View style={[styles.tableCell, styles.colItem, styles.tableCellLeft]}>
            <Text>{productDetails?.name ?? "N/A"}</Text>
          </View>

          <View style={[styles.tableCell, styles.colHSN]}>
            <Text>{productDetails?.HSN_code ?? ""}</Text>
          </View>

          <View style={[styles.tableCell, styles.colBatch]}>
            <Text>{batchItem.batch_id ?? ""}</Text>
          </View>

          <View style={[styles.tableCell, styles.colExp]}>
            <Text>
              {stock?.expiry_date
                ? dayjs(stock.expiry_date).format("DD/MM/YY")
                : ""}
            </Text>
          </View>

          <View style={[styles.tableCell, styles.colMRP]}>
            <Text>
              {productDetails?.mrp ? toTwo(Number(productDetails.mrp)) : ""}
            </Text>
          </View>

          <View style={[styles.tableCell, styles.colRate]}>
            <Text>{toTwo(sellingPrice)}</Text>
          </View>

          <View style={[styles.tableCell, styles.colDis]}>
            <Text>{discountPercent ?? 0}%</Text>
          </View>

          <View style={[styles.tableCell, styles.colSGST]}>
            <Text>{toTwo(gstSlab ? gstSlab / 2 : 0)}</Text>
          </View>

          <View style={[styles.tableCell, styles.colCGST]}>
            <Text>{toTwo(gstSlab ? gstSlab / 2 : 0)}</Text>
          </View>

          <View style={[styles.tableCell, styles.colAmount]}>
            <Text>{toTwo(lineNet)}</Text>
          </View>
        </View>
      );
    });
  });

  const totalItems = billInfo?.length ?? 0;
  // totalQty = total physical qty (batches), not billed qty
  const totalQty =
    billInfo?.reduce((sum, p) => sum + (p.actual_q ?? 0), 0) ?? 0;
  const totalInWords = amountToWords(grandTotal);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* SECTION 1: HEADER */}
          <View style={styles.section1}>
            <View style={styles.headerCol}>
              <Text style={styles.companyName}>{distributor.full_name}</Text>
              <Text style={styles.companyDetail}>
                {distributor.address ?? "Address not provided"}
              </Text>
              <Text style={styles.companyDetail}>
                {distributor.city ?? ""} PIN-{distributor.pin ?? ""}
              </Text>
              <Text style={styles.companyDetail}>
                Phone: {distributor.phone ?? "N/A"}
              </Text>
            </View>
            <View style={styles.headerColRight}>
              <Text style={styles.companyName}>{customer.full_name}</Text>
              <Text style={styles.companyDetail}>
                Address: {customer.address ?? "N/A"}
              </Text>
              <Text style={styles.companyDetail}>
                Phone: {customer.phone ?? "N/A"}
              </Text>
              <Text style={styles.companyDetail}>
                GST: {customer.gst_no ?? "N/A"}
              </Text>
            </View>
          </View>

          {/* SECTION 2: LICENSE/INVOICE INFO */}
          <View style={styles.section2}>
            <View style={[styles.section2Col, styles.section2Divider]}>
              <Text style={styles.labelSmall}>
                License No: 20B/19922/2026, 21B/19923/2026
              </Text>
              <Text style={styles.labelSmall}>TIN No: 22741405978</Text>
              <Text style={styles.valueSmall}>GSTIN: 22ANYPJIS34E1Z1</Text>
            </View>
            <View style={styles.section2Col}>
              <Text style={styles.labelSmall}>Invoice No. {challanData.id}</Text>
              <Text style={styles.labelSmall}>
                Date: {dayjs(challanData.created_at).format("DD-MM-YYYY")}
              </Text>
              <Text style={styles.valueSmall}>
                Sales Man: {salesName ?? "N/A"}
              </Text>
            </View>
          </View>

          {/* SECTION 3: PRODUCTS TABLE */}
          <View style={styles.section3}>
            <View style={styles.tableContainer}>
              {/* Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableCell, styles.colQty]}>
                  <Text style={{ fontWeight: "bold" }}>Qty</Text>
                </View>
                <View style={[styles.tableCell, styles.colFree]}>
                  <Text style={{ fontWeight: "bold" }}>Free</Text>
                </View>
                <View style={[styles.tableCell, styles.colItem]}>
                  <Text style={{ fontWeight: "bold" }}>Item Name</Text>
                </View>
                <View style={[styles.tableCell, styles.colHSN]}>
                  <Text style={{ fontWeight: "bold" }}>HSN</Text>
                </View>
                <View style={[styles.tableCell, styles.colBatch]}>
                  <Text style={{ fontWeight: "bold" }}>Batch</Text>
                </View>
                <View style={[styles.tableCell, styles.colExp]}>
                  <Text style={{ fontWeight: "bold" }}>Exp</Text>
                </View>
                <View style={[styles.tableCell, styles.colMRP]}>
                  <Text style={{ fontWeight: "bold" }}>MRP</Text>
                </View>
                <View style={[styles.tableCell, styles.colRate]}>
                  <Text style={{ fontWeight: "bold" }}>Rate</Text>
                </View>
                <View style={[styles.tableCell, styles.colDis]}>
                  <Text style={{ fontWeight: "bold" }}>Dis%</Text>
                </View>
                <View style={[styles.tableCell, styles.colSGST]}>
                  <Text style={{ fontWeight: "bold" }}>SGST</Text>
                </View>
                <View style={[styles.tableCell, styles.colCGST]}>
                  <Text style={{ fontWeight: "bold" }}>CGST</Text>
                </View>
                <View style={[styles.tableCell, styles.colAmount]}>
                  <Text style={{ fontWeight: "bold" }}>Amount</Text>
                </View>
              </View>

              {/* Rows */}
              {tableRows}
            </View>

            {/* TOTAL ITEMS & QTY */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: 7,
                marginTop: 4,
              }}
            >
              <Text>
                TOTAL ITEM: {totalItems} | TOTAL QTY: {totalQty}
              </Text>
            </View>
          </View>

          {/* SECTION 4: GST SUMMARY & TOTALS */}
          <View style={styles.section4}>
            {/* GST SUMMARY BOX */}
            <View style={styles.gstSummaryBox}>
              <View style={[styles.gstRow, styles.gstRowHeader]}>
                <View style={styles.gstLabel}>
                  <Text style={{ fontWeight: "bold" }}>CLASS</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>SGST</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>CGST</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>Total</Text>
                </View>
              </View>

              {[5, 12, 18].map((slab) => {
                const data =
                  gstSummary[String(slab)] || {
                    taxable: 0,
                    sgst: 0,
                    cgst: 0,
                    totalTax: 0,
                  };
                return (
                  <View key={slab} style={styles.gstRow}>
                    <View style={styles.gstLabel}>
                      <Text>GST {slab}%</Text>
                    </View>
                    <View style={styles.gstValue}>
                      <Text>{toTwo(data.sgst)}</Text>
                    </View>
                    <View style={styles.gstValue}>
                      <Text>{toTwo(data.cgst)}</Text>
                    </View>
                    <View style={styles.gstValue}>
                      <Text>{toTwo(data.totalTax)}</Text>
                    </View>
                  </View>
                );
              })}

              <View style={[styles.gstRow, styles.gstRowHeader]}>
                <View style={styles.gstLabel}>
                  <Text style={{ fontWeight: "bold" }}>TOTAL</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>
                    {toTwo(totalSGST)}
                  </Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>
                    {toTwo(totalCGST)}
                  </Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>
                    {toTwo(totalSGST + totalCGST)}
                  </Text>
                </View>
              </View>
            </View>

            {/* TOTALS BOX */}
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>SUBTOTAL</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{toTwo(subtotalTaxable)}</Text>
                </View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>SGST</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{toTwo(totalSGST)}</Text>
                </View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>CGST</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{toTwo(totalCGST)}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.totalRow,
                  styles.totalRowLast,
                  { minHeight: 24 },
                ]}
              >
                <View
                  style={[
                    styles.totalLabel,
                    { justifyContent: "center", fontSize: 10 },
                  ]}
                >
                  <Text style={{ fontWeight: "bold" }}>GRAND TOTAL</Text>
                </View>
                <View
                  style={[
                    styles.totalValue,
                    {
                      justifyContent: "center",
                      paddingRight: 4,
                      fontSize: 10,
                    },
                  ]}
                >
                  <Text style={{ fontWeight: "bold" }}>
                    {toTwo(grandTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* SECTION 5: FOOTER */}
          <View style={styles.section5}>
            <View style={styles.amountInWords}>
              <Text>{totalInWords}</Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureText}>Authorized Sign</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default MainPdfDoc;
