import React, { useEffect, useState } from "react";
import { usePDF } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Button } from "antd";
import { ShareAltOutlined as IconShare } from "@ant-design/icons";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// ============ STYLES - SINGLE PAGE ============
const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: 16,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },

  // ========== SECTION 1: HEADER WITH 2 COLUMNS ==========
  section1: {
    borderBottom: "1px solid #333333",
    paddingBottom: 10,
    marginBottom: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerCol: {
    flex: 1,
    paddingRight: 15,
  },
  headerColRight: {
    flex: 1,
    paddingLeft: 15,
    borderLeft: "1px solid #999999",
  },
  companyName: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 3,
  },
  companyDetail: {
    fontSize: 7,
    lineHeight: 1.3,
    marginBottom: 1,
  },

  // ========== SECTION 2: LICENSE/GST/INVOICE - 3 COLUMNS ==========
  section2: {
    display: "flex",
    flexDirection: "row",
    borderBottom: "1px solid #cccccc",
    paddingBottom: 8,
    marginBottom: 8,
    gap: 10,
  },
  section2Col: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    paddingRight: 10,
  },
  section2Divider: {
    borderRight: "1px solid #cccccc",
  },
  labelSmall: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 1,
  },
  valueSmall: {
    fontSize: 7,
    marginBottom: 2,
  },

  // ========== SECTION 3: PRODUCTS TABLE ==========
  section3: {
    marginBottom: 8,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#333333",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#f0f0f0",
    minHeight: 16,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#cccccc",
    minHeight: 14,
  },
  tableCell: {
    fontSize: 7,
    padding: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  tableCellLeft: {
    justifyContent: "flex-start",
    textAlign: "left",
    paddingLeft: 4,
  },
  tableCellRight: {
    justifyContent: "flex-end",
    textAlign: "right",
    paddingRight: 4,
  },

  colQty: { width: "5%" },
  colFree: { width: "5%" },
  colItem: { width: "24%" },
  colHSN: { width: "8%" },
  colBatch: { width: "10%" },
  colExp: { width: "7%" },
  colMRP: { width: "7%" },
  colRate: { width: "7%" },
  colDis: { width: "7%" },
  colSGST: { width: "7%" },
  colCGST: { width: "7%" },
  colAmount: { width: "6%" },

  // ========== SECTION 4: GST SUMMARY & TOTALS - 2 COLUMNS ==========
  section4: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  gstSummaryBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333333",
  },
  totalsBox: {
    flex: 0.8,
    borderWidth: 1,
    borderColor: "#333333",
  },
  gstRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#cccccc",
    minHeight: 12,
    paddingHorizontal: 4,
  },
  gstRowHeader: {
    backgroundColor: "#f0f0f0",
  },
  gstLabel: {
    flex: 0.6,
    fontSize: 7,
    fontWeight: "bold",
    display: "flex",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  gstValue: {
    flex: 0.4,
    fontSize: 7,
    display: "flex",
    justifyContent: "flex-end",
    paddingRight: 4,
    paddingTop: 2,
  },
  totalRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#cccccc",
    minHeight: 12,
    paddingHorizontal: 4,
  },
  totalRowLast: {
    backgroundColor: "#f0f0f0",
  },
  totalLabel: {
    flex: 0.6,
    fontSize: 7,
    fontWeight: "bold",
    display: "flex",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  totalValue: {
    flex: 0.4,
    fontSize: 7,
    fontWeight: "bold",
    display: "flex",
    justifyContent: "flex-end",
    paddingRight: 4,
    paddingTop: 2,
  },

  // ========== SECTION 5: FOOTER - AMOUNT IN WORDS & SIGNATURE ==========
  section5: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #cccccc",
    paddingTop: 6,
  },
  amountInWords: {
    flex: 1,
    fontSize: 7,
    fontStyle: "italic",
  },
  signatureBox: {
    flex: 1,
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingRight: 10,
  },
  signatureText: {
    fontSize: 7,
    fontWeight: "bold",
  },
});

// ============ DUMMY DATA ============
const dummyData = {
  distributor: {
    name: "PHARMA ENTERPRISES",
    address: "8-A, NEW MEDICAL COMPLEX",
    city: "RAIPUR (C.G)",
    pin: "492001",
    phone: "0771-4072317",
    licenseNo: "20B/19922/2026, 21B/19923/2026",
    tinNo: "22741405978",
    gstin: "22ANYPJ1834E1Z1",
  },
  customer: {
    name: "M/s DR LAXMI PINJRANI",
    address: "SHREE NAGAR",
    state: "22",
    phone: "7089878218",
    gst: "XX XXXXXXXXXXX",
  },
  challanInfo: {
    invoiceNo: "D-005211",
    date: "30-05-2024",
    dueDate: "30-05-2024",
    creditType: "CREDIT",
    salesPerson: "GAURAV PANDEY",
  },
  products: [
    {
      qty: 10,
      free: 2,
      itemName: "CVPURE 625 TAB",
      pack: "10'S",
      hsn: "30042034",
      batch: "TA240630",
      exp: "7/25",
      mrp: 195.0,
      rate: 139.29,
      dis: 0.0,
      sch: 0.0,
      gstSlab: 12,
      sgst: 83.57,
      cgst: 83.57,
      amount: 1392.9,
    },
    {
      qty: 5,
      free: 1,
      itemName: "PRO WAL",
      pack: "1'S",
      hsn: "29369000",
      batch: "APP-860A",
      exp: "1/25",
      mrp: 290.0,
      rate: 196.61,
      dis: 0.0,
      sch: 0.0,
      gstSlab: 18,
      sgst: 88.47,
      cgst: 88.47,
      amount: 983.05,
    },
  ],
  totals: {
    subTotal: 2375.95,
    sgstPayable: 172.04,
    cgstPayable: 172.04,
    crDrNote: 0.0,
    grandTotal: 2720.0,
  },
  bank: {
    name: "INDUSLAND BANK",
    accNo: "259981645800",
    ifscCode: "INDB0000027",
  },
};

// ============ PDF DOCUMENT COMPONENT ============
const MyDoc = ({ data }: any) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* ========== SECTION 1: HEADER (2-COLUMN GRID) ========== */}
          <View style={styles.section1}>
            {/* LEFT: PHARMA ENTERPRISES */}
            <View style={styles.headerCol}>
              <Text style={styles.companyName}>{data.distributor.name}</Text>
              <Text style={styles.companyDetail}>
                {data.distributor.address}
              </Text>
              <Text style={styles.companyDetail}>
                {data.distributor.city} PIN-{data.distributor.pin}
              </Text>
              <Text style={styles.companyDetail}>
                Phone: {data.distributor.phone}
              </Text>
            </View>

            {/* RIGHT: DR LAXMI */}
            <View style={styles.headerColRight}>
              <Text style={styles.companyName}>{data.customer.name}</Text>
              <Text style={styles.companyDetail}>
                Address: {data.customer.address}
              </Text>
              <Text style={styles.companyDetail}>
                State: {data.customer.state}
              </Text>
              <Text style={styles.companyDetail}>
                Ph. No.: {data.customer.phone}
              </Text>
              <Text style={styles.companyDetail}>GST: {data.customer.gst}</Text>
            </View>
          </View>

          {/* ========== SECTION 2: LICENSE/GST/INVOICE (3-COLUMN GRID) ========== */}
          <View style={styles.section2}>
            {/* Column 1: License & TIN */}
            <View style={[styles.section2Col, styles.section2Divider]}>
              <Text style={styles.labelSmall}>License No.</Text>
              <Text style={styles.valueSmall}>
                {data.distributor.licenseNo}
              </Text>
              <Text style={styles.labelSmall}>TIN No.</Text>
              <Text style={styles.valueSmall}>{data.distributor.tinNo}</Text>
            </View>

            {/* Column 2: GST */}
            {/* <View style={[styles.section2Col, styles.section2Divider]}>
              <Text style={styles.labelSmall}>GSTIN</Text>
              <Text style={styles.valueSmall}>{data.distributor.gstin}</Text>
              <Text style={styles.labelSmall}>Type</Text>
              <Text style={styles.valueSmall}>
                {data.challanInfo.creditType}
              </Text>
            </View> */}

            {/* Column 3: Invoice Details */}
            <View style={styles.section2Col}>
              <Text style={styles.labelSmall}>Invoice No.</Text>
              <Text style={styles.valueSmall}>
                {data.challanInfo.invoiceNo}
              </Text>
              <Text style={styles.labelSmall}>Date</Text>
              <Text style={styles.valueSmall}>{data.challanInfo.date}</Text>
              <Text style={styles.labelSmall}>Due Date</Text>
              <Text style={styles.valueSmall}>{data.challanInfo.dueDate}</Text>
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
                <View
                  style={[
                    styles.tableCell,
                    styles.colItem,
                    styles.tableCellLeft,
                  ]}
                >
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
                  <Text style={{ fontWeight: "bold" }}>Dis</Text>
                </View>
                <View style={[styles.tableCell, styles.colSGST]}>
                  <Text style={{ fontWeight: "bold" }}>SGST</Text>
                </View>
                <View style={[styles.tableCell, styles.colCGST]}>
                  <Text style={{ fontWeight: "bold" }}>CGST</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.colAmount,
                    styles.tableCellRight,
                  ]}
                >
                  <Text style={{ fontWeight: "bold" }}>Amount</Text>
                </View>
              </View>

              {/* PRODUCT ROWS */}
              {data.products.map((product: any, idx: number) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.colQty]}>
                    <Text>{product.qty}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.colFree]}>
                    <Text>{product.free}</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colItem,
                      styles.tableCellLeft,
                      { textAlign: "left" },
                    ]}
                  >
                    <Text>{product.itemName}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.colHSN]}>
                    <Text>{product.hsn}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.colBatch]}>
                    <Text>{product.batch}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.colExp]}>
                    <Text>{product.exp}</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colMRP,
                      styles.tableCellRight,
                    ]}
                  >
                    <Text>{product.mrp.toFixed(2)}</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colRate,
                      styles.tableCellRight,
                    ]}
                  >
                    <Text>{product.rate.toFixed(2)}</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colDis,
                      styles.tableCellRight,
                    ]}
                  >
                    <Text>{product.dis.toFixed(2)}</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colSGST,
                      styles.tableCellRight,
                    ]}
                  >
                    <Text>{product.sgst.toFixed(2)}</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colCGST,
                      styles.tableCellRight,
                    ]}
                  >
                    <Text>{product.cgst.toFixed(2)}</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.colAmount,
                      styles.tableCellRight,
                    ]}
                  >
                    <Text>{product.amount.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* TOTAL ITEMS & QTY */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: 7,
                marginTop: 2,
              }}
            >
              <Text>
                TOTAL ITEM: {data.products.length} | TOTAL QTY:{" "}
                {data.products.reduce((sum: number, p: any) => sum + p.qty, 0)}
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

              {/* GST Rows */}
              {[5, 12, 18].map((gstRate) => {
                const products = data.products.filter(
                  (p: any) => p.gstSlab === gstRate
                );
                const sgst = products.reduce(
                  (sum: number, p: any) => sum + p.sgst,
                  0
                );
                const cgst = products.reduce(
                  (sum: number, p: any) => sum + p.cgst,
                  0
                );

                return (
                  <View key={gstRate} style={styles.gstRow}>
                    <View style={styles.gstLabel}>
                      <Text>GST {gstRate}%</Text>
                    </View>
                    <View style={styles.gstValue}>
                      <Text>{sgst.toFixed(2)}</Text>
                    </View>
                    <View style={styles.gstValue}>
                      <Text>{cgst.toFixed(2)}</Text>
                    </View>
                    <View style={styles.gstValue}>
                      <Text>{(sgst + cgst).toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })}

              {/* Total GST Row */}
              <View style={[styles.gstRow, styles.gstRowHeader]}>
                <View style={styles.gstLabel}>
                  <Text style={{ fontWeight: "bold" }}>TOTAL</Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>
                    {data.totals.sgstPayable.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>
                    {data.totals.cgstPayable.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.gstValue}>
                  <Text style={{ fontWeight: "bold" }}>
                    {(
                      data.totals.sgstPayable + data.totals.cgstPayable
                    ).toFixed(2)}
                  </Text>
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
                  <Text>{data.totals.subTotal.toFixed(2)}</Text>
                </View>
              </View>

              {/* SGST Row */}
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>SGST</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{data.totals.sgstPayable.toFixed(2)}</Text>
                </View>
              </View>

              {/* CGST Row */}
              <View style={styles.totalRow}>
                <View style={styles.totalLabel}>
                  <Text>CGST</Text>
                </View>
                <View style={styles.totalValue}>
                  <Text>{data.totals.cgstPayable.toFixed(2)}</Text>
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
                    {data.totals.grandTotal.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ========== SECTION 5: FOOTER (AMOUNT IN WORDS & SIGNATURE) ========== */}
          <View style={styles.section5}>
            <View style={styles.amountInWords}>
              <Text>
                Rs {numberToWords(Math.floor(data.totals.grandTotal))} Only
              </Text>
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

// ============ UTILITY FUNCTIONS ============
const numberToWords = (num: number): string => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const convertTwoDigits = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
  };

  const convertThreeDigits = (n: number): string => {
    let result = "";
    if (Math.floor(n / 100) > 0) {
      result += ones[Math.floor(n / 100)] + " Hundred";
      if (n % 100 !== 0) result += " " + convertTwoDigits(n % 100);
    } else {
      result = convertTwoDigits(n);
    }
    return result;
  };

  if (num < 1000) {
    return convertThreeDigits(num);
  } else if (num < 1000000) {
    return (
      convertThreeDigits(Math.floor(num / 1000)) +
      " Thousand " +
      convertThreeDigits(num % 1000)
    ).trim();
  } else if (num < 1000000000) {
    return (
      convertThreeDigits(Math.floor(num / 1000000)) +
      " Million " +
      convertThreeDigits(num % 1000000)
    ).trim();
  }

  return num.toString();
};

// ============ MAIN COMPONENT ============
export const ChallanMainPdf: React.FC = () => {
  const [instance, updateInstance] = usePDF({
    document: <MyDoc data={dummyData} />,
  });
  const [loading, setLoading] = useState(true);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    updateInstance(<MyDoc data={dummyData} />);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (instance.error) {
      console.error("PDF Generation Error:", instance.error);
    }
  }, [instance.error]);

  const handleShare = async () => {
    if (!instance.url) return alert("PDF not ready yet");

    try {
      const response = await fetch(instance.url);
      const blob = await response.blob();

      const file = new File(
        [blob],
        `challan-${dummyData.challanInfo.invoiceNo}.pdf`,
        {
          type: "application/pdf",
        }
      );

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Challan ${dummyData.challanInfo.invoiceNo}`,
          text: `Here's the challan PDF for customer: ${dummyData.customer.name}`,
          files: [file],
        });
      } else {
        alert("Sharing not supported on this device/browser.");
      }
    } catch (error) {
      console.error("Sharing failed", error);
      alert("Something went wrong while sharing.");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        gap: "1rem",
        flexDirection: "column",
        padding: "1rem",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Share Button */}
      <Button
        type="primary"
        variant="filled"
        style={{ marginLeft: "auto" }}
        onClick={handleShare}
        disabled={loading || !instance.url}
      >
        <IconShare /> Share
      </Button>

      {/* PDF Viewer */}
      {loading || !instance.url ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>Loading PDF...</div>
        </div>
      ) : (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            enableSmoothScroll
            fileUrl={instance.url}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      )}
    </div>
  );
};

export default ChallanMainPdf;
