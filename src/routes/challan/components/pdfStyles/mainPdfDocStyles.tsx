import { StyleSheet } from "@react-pdf/renderer";

export const mainPdfDocStyles = StyleSheet.create({
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
  colHSN: { width: "15%" },
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
