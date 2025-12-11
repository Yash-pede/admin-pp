import { StyleSheet } from "@react-pdf/renderer";

export const mainPdfDocStyles = StyleSheet.create({
  page: {
    padding: 5,
    // backgroundColor: "#f5f5f5",
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  container: {
    backgroundColor: "#ffffff",
    padding: 5,
    height: "100%",
    display: "flex",
    border: "1px solid #000000",
    flexDirection: "column",
  },
  // ========== TOP HEADER (LIKE SAMPLE IMAGE) ==========
  topHeader: {
    borderWidth: 1,
    borderColor: "#000000",
    flexDirection: "row",
    marginBottom: 8,
  },

  topHeaderLeft: {
    flex: 1.6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#000000",
  },

  topHeaderMiddle: {
    flex: 0.9,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#000000",
    alignItems: "center",
  },

  topHeaderRight: {
    flex: 1.6,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  // LEFT BOX TEXT
  topCompanyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold", // PUREPRIDE PHARMA PVT LTD bold
    marginBottom: 3,
  },
  topCompanyLine: {
    fontSize: 7,
    marginBottom: 1.2,
  },

  // MIDDLE BOX TEXT
  topMiddleTitle: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold", // GST INVOICE bold
    textDecoration: "underline", // line under GST INVOICE
    marginBottom: 4,
  },
  topMiddleSub: {
    fontSize: 8,
    marginBottom: 2,
  },
  topMiddleLabel: {
    fontSize: 8,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold", // Invoice No / Bill Date labels bold
    marginTop: 6,
    marginBottom: 1,
  },
  topMiddleValue: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold", // PP‑105, 15/11/2025 bold
    marginBottom: 2,
  },

  // RIGHT BOX TEXT
  topBuyerLabel: {
    fontSize: 7,
    fontStyle: "italic", // “Buyer Name:-” small & italic
    marginBottom: 1,
  },
  topBuyerName: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold", // buyer name bold
    marginBottom: 2,
  },
  topBuyerLine: {
    fontSize: 7,
    marginBottom: 1.2,
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
    minHeight: 14,
  },
  tableCell: {
    fontSize: 7,
    padding: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderRightWidth: 1,
    borderRightColor: "#333333",
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
  colHSN: { width: "15%" },
  colBatch: { width: "10%" },
  colExp: { width: "7%" },
  colMRP: { width: "7%" },
  colRate: { width: "7%" },
  colDis: { width: "7%" },
  colSGST: { width: "7%" },
  colCGST: { width: "7%" },
  colAmount: { width: "6%", borderRightWidth: 0 },

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
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica-Bold",
    display: "flex",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  totalValue: {
    flex: 0.4,
    fontSize: 7,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica-Bold",
  },
});
