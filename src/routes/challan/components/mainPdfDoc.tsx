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

// ========== CALCULATION FUNCTIONS ==========
const calculateLineTotals = (
  product: challanProductAddingType,
  batchItem: ChallanBatchInfo,
  productDetails: Database["public"]["Tables"]["products"]["Row"] | undefined,
  totalActualQty: number
) => {
  const sellingPrice = product.selling_price || 0;
  const discountPercent = product.discount || 0;
  
  // Use BATCH QUANTITY only (exclude free_q completely)
  const batchQty = batchItem.quantity || 0;
  
  // Total discount for entire product (based on actual_q)
  const totalSellingValue = sellingPrice * totalActualQty;
  const totalDiscountAmount = totalSellingValue * (discountPercent / 100);
  
  // Distribute discount proportionally across batches
  const batchProportion = totalActualQty ? batchQty / totalActualQty : 0;
  const batchDiscount = totalDiscountAmount * batchProportion;
  
  // Line totals (GST inclusive)
  const lineGross = sellingPrice * batchQty;
  const lineNet = lineGross - batchDiscount; // Final amount for this batch
  
  const gstSlab = Number(productDetails?.gst_slab ?? 0);
  const taxableValue = gstSlab > 0 ? lineNet / (1 + gstSlab / 100) : lineNet;
  const taxAmount = lineNet - taxableValue;
  const sgstAmount = taxAmount / 2;
  const cgstAmount = taxAmount / 2;
  
  return {
    lineNet,
    taxableValue,
    sgstAmount,
    cgstAmount,
    gstSlab,
    batchDiscount
  };
};

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
  // ========== AGGREGATORS ==========
  const gstSummary: Record<string, { taxable: number; sgst: number; cgst: number; totalTax: number }> = {};
  let subtotalTaxable = 0;
  let totalSGST = 0;
  let totalCGST = 0;
  let grandTotal = 0;

  // ========== BUILD TABLE ROWS ==========
  const tableRows: React.ReactNode[] = [];

  (billInfo ?? []).forEach((product, prodIdx) => {
    // Get all batches for this product
    const matchingBatchRows = (challanBatchInfo ?? []).filter(
      (b) => Number(b.product_id) === Number(product.product_id)
    );
    
    const batchListAll: ChallanBatchInfo[] = [];
    matchingBatchRows.forEach((b) => {
      const parsed = safeParseBatchInfo(b.batch_info);
      parsed.forEach((bi) => batchListAll.push(bi));
    });

    const totalActualQty = batchListAll.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const productDetails = products?.find(p => Number(p.id) === Number(product.product_id));

    // Create row for each batch
    batchListAll.forEach((batchItem, itemIdx) => {
      const stock = stocksDetails?.find(s => s.id === batchItem.batch_id);
      
      // Calculate line totals (FREE_Q EXCLUDED)
      const totals = calculateLineTotals(product, batchItem, productDetails, totalActualQty);
      
      // Update aggregators
      const slabKey = String(totals.gstSlab);
      if (!gstSummary[slabKey]) {
        gstSummary[slabKey] = { taxable: 0, sgst: 0, cgst: 0, totalTax: 0 };
      }
      gstSummary[slabKey].taxable += totals.taxableValue;
      gstSummary[slabKey].sgst += totals.sgstAmount;
      gstSummary[slabKey].cgst += totals.cgstAmount;
      gstSummary[slabKey].totalTax += (totals.sgstAmount + totals.cgstAmount);

      subtotalTaxable += totals.taxableValue;
      totalSGST += totals.sgstAmount;
      totalCGST += totals.cgstAmount;
      grandTotal += totals.lineNet;

      // Add table row
      tableRows.push(
        <View key={`${prodIdx}-${itemIdx}`} style={styles.tableRow}>
          <View style={[styles.tableCell, styles.colQty]}>
            <Text>{batchItem.quantity}</Text>
          </View>
          
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
            <Text>{stock?.expiry_date ? dayjs(stock.expiry_date).format("DD/MM/YY") : ""}</Text>
          </View>
          
          <View style={[styles.tableCell, styles.colMRP]}>
            <Text>{productDetails?.mrp ? toTwo(Number(productDetails.mrp)) : ""}</Text>
          </View>
          
          <View style={[styles.tableCell, styles.colRate]}>
            <Text>{toTwo(product.selling_price ?? 0)}</Text>
          </View>
          
          <View style={[styles.tableCell, styles.colDis]}>
            <Text>{product.discount ?? 0}%</Text>
          </View>
          
          <View style={[styles.tableCell, styles.colSGST]}>
            <Text>{toTwo(totals.gstSlab ? totals.gstSlab / 2 : 0)}</Text>
          </View>
          
          <View style={[styles.tableCell, styles.colCGST]}>
            <Text>{toTwo(totals.gstSlab ? totals.gstSlab / 2 : 0)}</Text>
          </View>
          
          <View style={[styles.tableCell, styles.colAmount]}>
            <Text>{toTwo(totals.lineNet)}</Text>
          </View>
        </View>
      );
    });
  });

  const totalItems = billInfo?.length ?? 0;
  const totalQty = billInfo?.reduce((sum, p) => sum + (p.actual_q ?? 0), 0) ?? 0;
  const totalInWords = amountToWords(grandTotal);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* SECTION 1: HEADER */}
          <View style={styles.section1}>
            <View style={styles.headerCol}>
              <Text style={styles.companyName}>{distributor.full_name}</Text>
              <Text style={styles.companyDetail}>{distributor.address ?? "Address not provided"}</Text>
              <Text style={styles.companyDetail}>
                {distributor.city ?? ""} PIN-{distributor.pin ?? ""}
              </Text>
              <Text style={styles.companyDetail}>Phone: {distributor.phone ?? "N/A"}</Text>
            </View>
            <View style={styles.headerColRight}>
              <Text style={styles.companyName}>{customer.full_name}</Text>
              <Text style={styles.companyDetail}>Address: {customer.address ?? "N/A"}</Text>
              <Text style={styles.companyDetail}>Phone: {customer.phone ?? "N/A"}</Text>
              <Text style={styles.companyDetail}>GST: {customer.gst_no ?? "N/A"}</Text>
            </View>
          </View>

          {/* SECTION 2: LICENSE/INVOICE INFO */}
          <View style={styles.section2}>
            <View style={[styles.section2Col, styles.section2Divider]}>
              <Text style={styles.labelSmall}>License No: 20B/19922/2026, 21B/19923/2026</Text>
              <Text style={styles.labelSmall}>TIN No: 22741405978</Text>
              <Text style={styles.valueSmall}>GSTIN: 22ANYPJIS34E1Z1</Text>
            </View>
            <View style={styles.section2Col}>
              <Text style={styles.labelSmall}>Invoice No. {challanData.id}</Text>
              <Text style={styles.labelSmall}>
                Date: {dayjs(challanData.created_at).format("DD-MM-YYYY")}
              </Text>
              <Text style={styles.valueSmall}>Sales Man: {salesName ?? "N/A"}</Text>
            </View>
          </View>

          {/* SECTION 3: PRODUCTS TABLE */}
          <View style={styles.section3}>
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableCell, styles.colQty]}><Text style={{ fontWeight: "bold" }}>Qty</Text></View>
                <View style={[styles.tableCell, styles.colFree]}><Text style={{ fontWeight: "bold" }}>Free</Text></View>
                <View style={[styles.tableCell, styles.colItem]}><Text style={{ fontWeight: "bold" }}>Item Name</Text></View>
                <View style={[styles.tableCell, styles.colHSN]}><Text style={{ fontWeight: "bold" }}>HSN</Text></View>
                <View style={[styles.tableCell, styles.colBatch]}><Text style={{ fontWeight: "bold" }}>Batch</Text></View>
                <View style={[styles.tableCell, styles.colExp]}><Text style={{ fontWeight: "bold" }}>Exp</Text></View>
                <View style={[styles.tableCell, styles.colMRP]}><Text style={{ fontWeight: "bold" }}>MRP</Text></View>
                <View style={[styles.tableCell, styles.colRate]}><Text style={{ fontWeight: "bold" }}>Rate</Text></View>
                <View style={[styles.tableCell, styles.colDis]}><Text style={{ fontWeight: "bold" }}>Dis%</Text></View>
                <View style={[styles.tableCell, styles.colSGST]}><Text style={{ fontWeight: "bold" }}>SGST</Text></View>
                <View style={[styles.tableCell, styles.colCGST]}><Text style={{ fontWeight: "bold" }}>CGST</Text></View>
                <View style={[styles.tableCell, styles.colAmount]}><Text style={{ fontWeight: "bold" }}>Amount</Text></View>
              </View>
              
              {/* Table Rows */}
              {tableRows}
            </View>
            
            {/* Total Items & Qty */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 7, marginTop: 4 }}>
              <Text>TOTAL ITEM: {totalItems} | TOTAL QTY: {totalQty}</Text>
            </View>
          </View>

          {/* SECTION 4: GST SUMMARY & TOTALS */}
          <View style={styles.section4}>
            {/* GST Summary */}
            <View style={styles.gstSummaryBox}>
              <View style={[styles.gstRow, styles.gstRowHeader]}>
                <View style={styles.gstLabel}><Text style={{ fontWeight: "bold" }}>CLASS</Text></View>
                <View style={styles.gstValue}><Text style={{ fontWeight: "bold" }}>SGST</Text></View>
                <View style={styles.gstValue}><Text style={{ fontWeight: "bold" }}>CGST</Text></View>
                <View style={styles.gstValue}><Text style={{ fontWeight: "bold" }}>Total</Text></View>
              </View>
              
              {/* All GST slabs (5%, 12%, 18%) */}
              {[5, 12, 18].map(slab => {
                const data = gstSummary[String(slab)] || { taxable: 0, sgst: 0, cgst: 0, totalTax: 0 };
                return (
                  <View key={slab} style={styles.gstRow}>
                    <View style={styles.gstLabel}><Text>GST {slab}%</Text></View>
                    <View style={styles.gstValue}><Text>{toTwo(data.sgst)}</Text></View>
                    <View style={styles.gstValue}><Text>{toTwo(data.cgst)}</Text></View>
                    <View style={styles.gstValue}><Text>{toTwo(data.totalTax)}</Text></View>
                  </View>
                );
              })}
              
              <View style={[styles.gstRow, styles.gstRowHeader]}>
                <View style={styles.gstLabel}><Text style={{ fontWeight: "bold" }}>TOTAL</Text></View>
                <View style={styles.gstValue}><Text style={{ fontWeight: "bold" }}>{toTwo(totalSGST)}</Text></View>
                <View style={styles.gstValue}><Text style={{ fontWeight: "bold" }}>{toTwo(totalCGST)}</Text></View>
                <View style={styles.gstValue}><Text style={{ fontWeight: "bold" }}>{toTwo(totalSGST + totalCGST)}</Text></View>
              </View>
            </View>

            {/* Totals Box */}
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}><Text>SUBTOTAL</Text></View>
                <View style={styles.totalValue}><Text>{toTwo(subtotalTaxable)}</Text></View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}><Text>SGST</Text></View>
                <View style={styles.totalValue}><Text>{toTwo(totalSGST)}</Text></View>
              </View>
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}><Text>CGST</Text></View>
                <View style={styles.totalValue}><Text>{toTwo(totalCGST)}</Text></View>
              </View>
              <View style={[styles.totalRow, styles.totalRowLast]}>
                <View style={[styles.totalLabel, { justifyContent: "center", fontSize: 10 }]}>
                  <Text style={{ fontWeight: "bold" }}>GRAND TOTAL</Text>
                </View>
                <View style={[styles.totalValue, { justifyContent: "center", paddingRight: 4, fontSize: 10 }]}>
                  <Text style={{ fontWeight: "bold" }}>{toTwo(grandTotal)}</Text>
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
