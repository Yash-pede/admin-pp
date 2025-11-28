// mainPdfDoc.tsx
import { Database } from "@/utilities";
import {
  ChallanBatchInfo,
  challanProductAddingType,
} from "@/utilities/constants";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
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
    rupeeWords && paiseWords ? `${rupeeWords} and ${paiseWords} Only` : (rupeeWords || paiseWords) + " Only";
  return joined || "Zero Only";
}

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
  // aggregators
  const gstSummaryMap: Record<
    string,
    { taxable: number; sgst: number; cgst: number; totalTax: number }
  > = {};

  let subtotalTaxable = 0;
  let totalSGST = 0;
  let totalCGST = 0;
  let grandTotal = 0;

  // Build rows data by iterating billInfo and matching batches
  const rows: {
    productIdx: number;
    batchIdx: number;
    itemIdx: number;
    product: challanProductAddingType;
    batchItem: ChallanBatchInfo;
    productDetails?: Database["public"]["Tables"]["products"]["Row"];
    stockExpiry?: string | null;
    lineNet: number; // selling_price * qty - distributed discount
    taxableValue: number; // net / (1+gst/100)
    taxAmount: number; // net - taxableValue
    sgstAmount: number;
    cgstAmount: number;
  }[] = [];

  // iterate each bill product
  (billInfo ?? []).forEach((product, prodIdx) => {
    // find challan_batch_info rows for this product
    const matchingBatchRows = (challanBatchInfo ?? []).filter(
      (b) => Number(b.product_id) === Number(product.product_id)
    );

    // aggregate batchList across all matchingBatchRows
    const batchListAll: ChallanBatchInfo[] = [];
    matchingBatchRows.forEach((b) => {
      const parsed = safeParseBatchInfo(b.batch_info);
      parsed.forEach((bi) => batchListAll.push(bi));
    });

    // total actual qty for this product (sum of batch quantities)
    const totalActualQty = batchListAll.reduce((s, it) => s + (it.quantity || 0), 0);
    const totalSellingValue = (product.selling_price || 0) * totalActualQty;
    const totalDiscountAmount = totalSellingValue * ((product.discount || 0) / 100);

    // per-batch rows
    batchListAll.forEach((batchItem, itemIdx) => {
      const productDetails = (products ?? []).find(
        (p) => Number(p.id) === Number(product.product_id)
      );

      // stock expiry lookup
      const stock = (stocksDetails ?? []).find((s) => s.id === batchItem.batch_id);

      // distribute discount proportionally across batches
      const batchProportion = totalActualQty ? batchItem.quantity / totalActualQty : 0;
      const batchDiscount = totalDiscountAmount * batchProportion;

      const lineGross = (product.selling_price || 0) * batchItem.quantity; // GST inclusive
      const lineNet = lineGross - batchDiscount; // after discount (GST inclusive)

      const gstSlab = Number(productDetails?.gst_slab ?? 0);
      const gstRate = gstSlab;
      const taxableValue = gstRate > 0 ? (lineNet / (1 + gstRate / 100)) : lineNet;
      const taxAmount = lineNet - taxableValue;
      const sgstAmount = taxAmount / 2;
      const cgstAmount = taxAmount / 2;

      // accumulate for summary
      const slabKey = String(gstSlab);
      if (!gstSummaryMap[slabKey]) {
        gstSummaryMap[slabKey] = { taxable: 0, sgst: 0, cgst: 0, totalTax: 0 };
      }
      gstSummaryMap[slabKey].taxable += taxableValue;
      gstSummaryMap[slabKey].sgst += sgstAmount;
      gstSummaryMap[slabKey].cgst += cgstAmount;
      gstSummaryMap[slabKey].totalTax += taxAmount;

      subtotalTaxable += taxableValue;
      totalSGST += sgstAmount;
      totalCGST += cgstAmount;
      grandTotal += lineNet; // net is inclusive of taxes, so sum of net lines = final amount

      rows.push({
        productIdx: prodIdx,
        batchIdx: 0, // not used visually except maybe grouping
        itemIdx,
        product,
        batchItem,
        productDetails,
        stockExpiry: stock?.expiry_date ?? null,
        lineNet,
        taxableValue,
        taxAmount,
        sgstAmount,
        cgstAmount,
      });
    });
  });

  // formatting totals
  const subtotalFormatted = Number.isFinite(subtotalTaxable) ? subtotalTaxable : 0;
  const sgstFormatted = Number.isFinite(totalSGST) ? totalSGST : 0;
  const cgstFormatted = Number.isFinite(totalCGST) ? totalCGST : 0;
  const grandTotalFormatted = Number.isFinite(grandTotal) ? grandTotal : 0;

  const totalInWords = amountToWords(Number(grandTotalFormatted));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* ========== SECTION 1: HEADER (2-COLUMN GRID) ========== */}
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
              <Text style={styles.companyDetail}>GST: {customer.full_name ?? "N/A"}</Text>
            </View>
          </View>

          {/* ========== SECTION 2: LICENSE/GST/INVOICE (3-COLUMN GRID) ========== */}
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
                Sales Man: {salesName ? salesName : "N/A"}
              </Text>
            </View>
          </View>

          {/* ========== SECTION 3: PRODUCTS TABLE ========== */}
          <View style={styles.section3}>
            <View style={styles.tableContainer}>
              {/* TABLE HEADER */}
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

              {/* PRODUCT ROWS */}
              {(() => {
                // We need to render grouped by product and include free only on first row
                const elements: React.ReactNode[] = [];
                const grouped = (billInfo ?? []).map((product) => {
                  const matchingBatchRows = (challanBatchInfo ?? []).filter(
                    (b) => Number(b.product_id) === Number(product.product_id)
                  );
                  const batchListAll: ChallanBatchInfo[] = [];
                  matchingBatchRows.forEach((b) => {
                    const parsed = safeParseBatchInfo(b.batch_info);
                    parsed.forEach((bi) => batchListAll.push(bi));
                  });
                  return { product, batchListAll };
                });

                grouped.forEach(({ product, batchListAll }, prodIdx) => {
                  const totalActualQty = batchListAll.reduce((s, it) => s + (it.quantity || 0), 0);
                  // render each batch as row
                  batchListAll.forEach((batchItem, itemIdx) => {
                    const productDetails = (products ?? []).find(
                      (p) => Number(p.id) === Number(product.product_id)
                    );
                    const stock = (stocksDetails ?? []).find((s) => s.id === batchItem.batch_id);

                    const totalSellingValue = (product.selling_price || 0) * totalActualQty;
                    const totalDiscountAmount = totalSellingValue * ((product.discount || 0) / 100);
                    const batchProportion = totalActualQty ? batchItem.quantity / totalActualQty : 0;
                    const batchDiscount = totalDiscountAmount * batchProportion;

                    const lineGross = (product.selling_price || 0) * batchItem.quantity;
                    const lineNet = lineGross - batchDiscount;
                    const gstSlab = Number(productDetails?.gst_slab ?? 0);
                    const taxableValue = gstSlab > 0 ? (lineNet / (1 + gstSlab / 100)) : lineNet;
                    const taxAmount = lineNet - taxableValue;
                    const sgstAmount = taxAmount / 2;
                    const cgstAmount = taxAmount / 2;

                    elements.push(
                      <View style={styles.tableRow} key={`${prodIdx}-${itemIdx}`}>
                        <View style={[styles.tableCell, styles.colQty]}>
                          <Text>{batchItem.quantity}</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colFree]}>
                          {itemIdx === 0 && (
                            <Text>{product.free_q ?? 0}</Text>
                          )}
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
                          <Text>{stock?.expiry_date ? dayjs(stock.expiry_date).format("DD/MM/YY") : ""}</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colMRP]}>
                          <Text>{productDetails?.mrp ? toTwo(Number(productDetails.mrp)) : ""}</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colRate]}>
                          <Text>{product.selling_price ? toTwo(product.selling_price) : ""}</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colDis]}>
                          <Text>{product.discount ?? 0}</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colSGST]}>
                          <Text>{toTwo(gstSlab ? (gstSlab / 2) : 0)}</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colCGST]}>
                          <Text>{toTwo(gstSlab ? (gstSlab / 2) : 0)}</Text>
                        </View>

                        <View style={[styles.tableCell, styles.colAmount]}>
                          <Text>{toTwo(lineNet)}</Text>
                        </View>
                      </View>
                    );
                  });
                });

                return elements;
              })()}
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
                TOTAL ITEM: {(billInfo ?? []).length} | TOTAL QTY:{" "}
                {(billInfo ?? []).reduce((sum, p) => sum + (p.actual_q || 0), 0)}
              </Text>
            </View>
          </View>

          {/* ========== SECTION 4: GST SUMMARY & TOTALS (2-COLUMN) ========== */}
          <View style={styles.section4}>
            {/* GST SUMMARY BOX */}
            <View style={styles.gstSummaryBox}>
              {/* Header Row */}
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

              {/* GST Rows from gstSummaryMap */}
              {Object.keys(gstSummaryMap).length === 0 ? (
                <View style={styles.gstRow}>
                  <View style={styles.gstLabel}><Text>No GST rows</Text></View>
                </View>
              ) : (
                Object.entries(gstSummaryMap).map(([slab, vals]) => {
                  return (
                    <View key={slab} style={styles.gstRow}>
                      <View style={styles.gstLabel}>
                        <Text>GST {slab}%</Text>
                      </View>
                      <View style={styles.gstValue}>
                        <Text>{toTwo(vals.sgst)}</Text>
                      </View>
                      <View style={styles.gstValue}>
                        <Text>{toTwo(vals.cgst)}</Text>
                      </View>
                      <View style={styles.gstValue}>
                        <Text>{toTwo(vals.totalTax)}</Text>
                      </View>
                    </View>
                  );
                })
              )}

              {/* Total GST Row */}
              <View style={[styles.gstRow, styles.gstRowHeader]}>
                <View style={styles.gstLabel}>
                  <Text style={{ fontWeight: "bold" }}>TOTAL</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>{toTwo(totalSGST)}</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>{toTwo(totalCGST)}</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>{toTwo(totalSGST + totalCGST)}</Text>
                </View>
              </View>
            </View>

            {/* TOTALS BOX */}
            <View style={styles.totalsBox}>
              {/* Subtotal Row */}
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>SUBTOTAL</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{toTwo(subtotalFormatted)}</Text>
                </View>
              </View>

              {/* SGST Row */}
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>SGST</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{toTwo(sgstFormatted)}</Text>
                </View>
              </View>

              {/* CGST Row */}
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>CGST</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{toTwo(cgstFormatted)}</Text>
                </View>
              </View>

              {/* Grand Total Row */}
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
                    { justifyContent: "center", paddingRight: 4, fontSize: 10 },
                  ]}
                >
                  <Text style={{ fontWeight: "bold" }}>
                    {toTwo(grandTotalFormatted)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ========== SECTION 5: FOOTER (AMOUNT IN WORDS & SIGNATURE) ========== */}
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
