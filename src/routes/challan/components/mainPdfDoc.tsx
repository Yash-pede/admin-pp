// mainPdfDoc.tsx - COMPLETE REPLACEMENT (UI UNCHANGED, LOGIC FIXED)

import { Database } from "@/utilities";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import dayjs, { Dayjs } from "dayjs";
import numberToWords from "number-to-words";
import { mainPdfDocStyles as styles } from "../components/pdfStyles/mainPdfDocStyles";

type Props = {
  challanData: Database["public"]["Tables"]["challan"]["Row"];
  challanBatchInfo: Database["public"]["Tables"]["challan_batch_info"]["Row"][];
};

function safeParseBatchInfo(input: any): BatchInfo[] {
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
    rupees > 0
      ? numberToWords.toWords(rupees).replace(/,/g, "") + " Rupees"
      : "";
  const paiseWords =
    paise > 0 ? numberToWords.toWords(paise).replace(/,/g, "") + " Paise" : "";
  const joined =
    rupeeWords && paiseWords
      ? `${rupeeWords} and ${paiseWords} Only`
      : (rupeeWords || paiseWords) + " Only";
  return joined || "Zero Only";
}

// ---------- GST-INCLUSIVE CALCULATION ----------
function calculateInclusiveGST(
  sellingPrice: number,
  billedQty: number,
  gstSlab: number
) {
  const gross = sellingPrice * billedQty; // GST INCLUDED
  const taxable = gross / (1 + gstSlab / 100);
  const gstAmount = gross - taxable;
  return {
    taxable,
    sgst: gstAmount / 2,
    cgst: gstAmount / 2,
    gross,
  };
}

// ========== MAIN COMPONENT ==========
export const MainPdfDoc: React.FC<Props> = ({
  challanData,
  challanBatchInfo,
}) => {
  const productInfo = challanData.product_info || [];
  const metadata = challanData.metadata || {};
  const customer = metadata?.customer || {};
  const distributor = metadata?.distributor || {};

  const gstSummary: Record<
    string,
    { taxable: number; sgst: number; cgst: number; total: number }
  > = {};

  let subtotalTaxable = 0;
  let totalSGST = 0;
  let totalCGST = 0;
  let grandTotal = 0;

  const tableRows: React.ReactNode[] = [];

  productInfo.forEach((product: any, prodIdx: number) => {
    const productId = Number(product.product_id);
    const gstSlab = Number(product.gst_slab || 0);
    const sellingPrice = Number(product.selling_price || 0);
    const totalFreeQty = Number(product.free_q || 0);

    let remainingFree = totalFreeQty;

    const matchingBatchRows = challanBatchInfo.filter(
      (b) => Number(b.product_id) === productId
    );

    const batchList: BatchInfo[] = [];
    matchingBatchRows.forEach((b) => {
      batchList.push(...safeParseBatchInfo(b.batch_info));
    });

    batchList.forEach((batch, itemIdx) => {
      const batchQty = batch.quantity || 0;

      let freeUsed = 0;
      if (remainingFree > 0) {
        freeUsed = Math.min(batchQty, remainingFree);
        remainingFree -= freeUsed;
      }

      const billedQty = batchQty - freeUsed;
      if (billedQty <= 0) return;

      const { taxable, sgst, cgst, gross } = calculateInclusiveGST(
        sellingPrice,
        billedQty,
        gstSlab
      );

      subtotalTaxable += taxable;
      totalSGST += sgst;
      totalCGST += cgst;
      grandTotal += gross;

      const slabKey = String(gstSlab);
      if (!gstSummary[slabKey]) {
        gstSummary[slabKey] = { taxable: 0, sgst: 0, cgst: 0, total: 0 };
      }

      gstSummary[slabKey].taxable += taxable;
      gstSummary[slabKey].sgst += sgst;
      gstSummary[slabKey].cgst += cgst;
      gstSummary[slabKey].total += sgst + cgst;

      tableRows.push(
        <View key={`${prodIdx}-${itemIdx}`} style={styles.tableRow}>
          <View style={[styles.tableCell, styles.colQty]}>
            <Text>{billedQty}</Text>
          </View>

          <View style={[styles.tableCell, styles.colFree]}>
            {itemIdx === 0 && <Text>{totalFreeQty}</Text>}
          </View>

          <View
            style={[styles.tableCell, styles.colItem, styles.tableCellLeft]}
          >
            <Text>{product.name ?? "N/A"}</Text>
          </View>

          <View style={[styles.tableCell, styles.colHSN]}>
            <Text>{product.HSN_code ?? ""}</Text>
          </View>

          <View style={[styles.tableCell, styles.colBatch]}>
            <Text>{batch.batch_id ?? ""}</Text>
          </View>

          <View style={[styles.tableCell, styles.colExp]}>
            <Text>{dayjs(batch?.expiry_date).format("MM/YY") ?? ""}</Text>
          </View>

          <View style={[styles.tableCell, styles.colMRP]}>
            <Text>{product.mrp ? toTwo(Number(product.mrp)) : ""}</Text>
          </View>

          <View style={[styles.tableCell, styles.colRate]}>
            <Text>{toTwo(sellingPrice)}</Text>
          </View>

          <View style={[styles.tableCell, styles.colDis]}>
            <Text>0%</Text>
          </View>

          <View style={[styles.tableCell, styles.colSGST]}>
            <Text>{toTwo(gstSlab / 2)}</Text>
          </View>

          <View style={[styles.tableCell, styles.colCGST]}>
            <Text>{toTwo(gstSlab / 2)}</Text>
          </View>

          {/* AMOUNT = TAXABLE (GST REMOVED) */}
          <View style={[styles.tableCell, styles.colAmount]}>
            <Text>{toTwo(taxable)}</Text>
          </View>
        </View>
      );
    });
  });

  const totalItems = productInfo.length;
  const totalQty = productInfo.reduce(
    (sum: number, p: any) => sum + (p.actual_q || 0),
    0
  );
  const totalInWords = amountToWords(grandTotal);

  const dlNo1 = customer?.metadata?.dl_no?.[0] || "-";
  const dlNo2 = customer?.metadata?.dl_no?.[1] || "-";
  const gstNo = customer?.metadata?.gst_no || "-";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* ===== TOP HEADER (UNCHANGED) ===== */}
          <View style={styles.topHeader}>
            <View style={styles.topHeaderLeft}>
              <Text style={styles.topCompanyName}>
                PUREPRIDE PHARMA PVT LTD
              </Text>
              <Text style={styles.topCompanyLine}>
                E-54 1ST FLOOR MANSI BEAUTI PARLOUR RADHASWAMI
              </Text>
              <Text style={styles.topCompanyLine}>
                NAGAR BHATAGAON CHOWK WARD NO 65 RAIPUR CG 492001
              </Text>
              <Text style={styles.topCompanyLine}>PHONE - : 9770384950</Text>
              <Text style={styles.topCompanyLine}>
                GSTIN - : 22AALCP1548E1ZN
              </Text>
              <Text style={styles.topCompanyLine}>PAN - : AALCP1548E</Text>
              <Text style={styles.topCompanyLine}>
                D.L. No : WLF20B2023CT000059, WLF21B2023CT000057
              </Text>
            </View>

            <View style={styles.topHeaderMiddle}>
              <Text style={styles.topMiddleTitle}>GST INVOICE</Text>
              <Text style={styles.topMiddleSub}>
                {distributor.full_name || ""}
              </Text>
              <Text style={styles.topMiddleLabel}>Invoice No.</Text>
              <Text style={styles.topMiddleValue}>{challanData.id}</Text>
              <Text style={styles.topMiddleLabel}>Bill Date</Text>
              <Text style={styles.topMiddleValue}>
                {dayjs(challanData.created_at).format("DD/MM/YYYY")}
              </Text>
            </View>

            <View style={styles.topHeaderRight}>
              <Text style={styles.topBuyerLabel}>Buyer Name:-</Text>
              <Text style={styles.topBuyerName}>
                {customer.full_name || ""}
              </Text>
              <Text style={[styles.topBuyerLine, { height: 40 }]}>
                Address : {customer.address}
              </Text>

              <Text style={styles.topBuyerLine}>
                PHONE - +91 {customer.phone || ""}
              </Text>
              <Text style={styles.topBuyerLine}>GST NO - {gstNo}</Text>
              <Text style={styles.topBuyerLine}>DL NO 1 - {dlNo1}</Text>
              <Text style={styles.topBuyerLine}>DL NO 2 - {dlNo2}</Text>
            </View>
          </View>

          {/* ===== PRODUCTS TABLE ===== */}
          <View style={styles.section3}>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <View style={[styles.tableCell, styles.colQty]}>
                  <Text>Qty</Text>
                </View>
                <View style={[styles.tableCell, styles.colFree]}>
                  <Text>Free</Text>
                </View>
                <View style={[styles.tableCell, styles.colItem]}>
                  <Text>Item Name</Text>
                </View>
                <View style={[styles.tableCell, styles.colHSN]}>
                  <Text>HSN</Text>
                </View>
                <View style={[styles.tableCell, styles.colBatch]}>
                  <Text>Batch</Text>
                </View>
                <View style={[styles.tableCell, styles.colExp]}>
                  <Text>Exp</Text>
                </View>
                <View style={[styles.tableCell, styles.colMRP]}>
                  <Text>MRP</Text>
                </View>
                <View style={[styles.tableCell, styles.colRate]}>
                  <Text>Rate</Text>
                </View>
                <View style={[styles.tableCell, styles.colDis]}>
                  <Text>Dis%</Text>
                </View>
                <View style={[styles.tableCell, styles.colSGST]}>
                  <Text>SGST</Text>
                </View>
                <View style={[styles.tableCell, styles.colCGST]}>
                  <Text>CGST</Text>
                </View>
                <View style={[styles.tableCell, styles.colAmount]}>
                  <Text>Amount</Text>
                </View>
              </View>
              {tableRows}
            </View>

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

          {/* ===== GST SUMMARY & TOTALS ===== */}
          <View style={styles.section4}>
            <View style={styles.gstSummaryBox}>
              {[5, 12, 18].map((slab) => {
                const d = gstSummary[String(slab)] || {
                  taxable: 0,
                  sgst: 0,
                  cgst: 0,
                  total: 0,
                };
                return (
                  <View key={slab} style={styles.gstRow}>
                    <View style={styles.gstLabel}>
                      <Text>GST {slab}%</Text>
                    </View>
                    <View style={styles.gstValue}>
                      <Text>{toTwo(d.sgst)}</Text>
                    </View>
                    <View style={styles.gstValue}>
                      <Text>{toTwo(d.cgst)}</Text>
                    </View>
                    <View style={styles.gstValue}>
                      <Text>{toTwo(d.total)}</Text>
                    </View>
                  </View>
                );
              })}

              <View style={[styles.gstRow, styles.gstRowHeader]}>
                <View style={styles.gstLabel}>
                  <Text>TOTAL</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text>{toTwo(totalSGST)}</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text>{toTwo(totalCGST)}</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text>{toTwo(totalSGST + totalCGST)}</Text>
                </View>
              </View>
            </View>

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

              <View style={[styles.totalRow, styles.totalRowLast]}>
                <View style={styles.totalLabel}>
                  <Text style={{ fontWeight: "bold" }}>GRAND TOTAL</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text style={{ fontWeight: "bold" }}>
                    {toTwo(grandTotal)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ===== FOOTER ===== */}
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
