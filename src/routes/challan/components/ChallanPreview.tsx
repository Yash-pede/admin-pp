// File Path: src/components/PdfLayout.tsx

import {
  Document,
  Image,
  Page,
  StyleSheet,
  View,
  Text,
  PDFViewer,
} from "@react-pdf/renderer";
import { challanProductAddingType } from "@/utilities/constants";
import { PurePrideInvoiceLogo, PurePrideSignature } from "@/images/index";
import { useList, useOne } from "@refinedev/core";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import { Database } from "@/utilities";

type PdfProps = {
  customerId: string;
  billInfo: challanProductAddingType[];
  invoiceId?: number;
};

export const PdfLayout: React.FC<PdfProps> = ({
  customerId,
  billInfo,
  invoiceId,
}) => {
  const { data: products, isLoading } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: billInfo.map(
          (bill: challanProductAddingType) => bill.product_id
        ),
      },
    ],
  });
  const { data: customer, isLoading: customerLoading } = useOne<
    Database["public"]["Tables"]["customers"]["Row"]
  >({
    resource: "customers",
    id: customerId,
    queryOptions: {
      enabled: !!customerId,
    },
  });
  if (isLoading || customerLoading)
    return (
      <div style={{ display: "grid", width: "100%", height: "100%" }}>
        <Loading3QuartersOutlined
          style={{
            animation: "spin 1s linear infinite",
            width: "100%",
            height: "100%",
            transition: "all 1s ease-in-out",
          }}
        />
      </div>
    );
  const date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const totalAmount = billInfo.reduce((total, item) => {
    const product = products?.data.find(
      (product: any) => product.id === item.product_id
    );
    if (product) {
      const subtotal = item.quantity * (product.selling_price || 0);
      const discountAmount = subtotal * (item.discount * 0.01 || 0);
      return total + subtotal - discountAmount;
    }
    return total;
  }, 0);

  return (
    <PDFViewer style={styles.viewer}>
      <Document>
        <Page style={styles.page} size="A4">
          <View style={styles.invoiceHeader}>
            <View style={styles.companyInfo}>
              <Text style={styles.invoiceHeadingText}>Purepride</Text>
              <Text style={styles.invoiceLineSpacing}>Mob: 9876540123</Text>
              <Text style={styles.invoiceLineSpacing}>Address: Raipur</Text>
            </View>
            <Image style={styles.logo} src={PurePrideInvoiceLogo} />
          </View>
          <View style={styles.invoiceBody}>
            <Text style={styles.invoiceText}>INVOICE</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={styles.billTo}>
              <Text style={{ fontStyle: "italic", fontSize: 14 }}>
                Bill To:
              </Text>
              <Text style={{ fontSize: 14 }}>{customer?.data?.full_name}</Text>
              <Text style={{ fontSize: 14 }}>+91 {customer?.data.phone}</Text>
              <Text style={{ fontSize: 14 }}>{customer?.data.address}</Text>
            </View>
            <View style={styles.billTo}>
              <Text style={{ textAlign: "right", margin: "auto" }}>
                Invoice No: {invoiceId ?? "-"}
              </Text>
              <Text
                style={{ textAlign: "right" }}
              >{`${day}/${month}/${year}`}</Text>
            </View>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderItem}>S NO.</Text>
              <Text style={styles.tableHeaderItem}>Item Name</Text>
              <Text style={styles.tableHeaderItem}>Quantity</Text>
              <Text style={styles.tableHeaderItem}>Price/Unit</Text>
              <Text style={styles.tableHeaderItem}>SubTotal</Text>
              <Text style={styles.tableHeaderItem}>Discount</Text>
              <Text style={styles.tableHeaderItem}>Amount</Text>
            </View>
            {billInfo.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol}>{index + 1}</Text>
                <Text style={styles.tableCol}>
                  {
                    products?.data.find(
                      (product: any) => product.id === item.product_id
                    )?.name
                  }
                </Text>
                <Text style={styles.tableCol}>{item.quantity}</Text>
                <Text style={styles.tableCol}>
                  {
                    products?.data.find(
                      (product: any) => product.id === item.product_id
                    )?.selling_price
                  }
                </Text>
                <Text style={styles.tableCol}>
                  {item.quantity *
                    (products?.data.find(
                      (product: any) => product.id === item.product_id
                    )?.selling_price || 0)}
                </Text>
                <Text style={styles.tableCol}>{item.discount}%</Text>
                <Text style={styles.tableCol}>
                  {(
                    item.quantity *
                      (products?.data.find(
                        (product: any) => product.id === item.product_id
                      )?.selling_price || 0) -
                    item.quantity *
                      (products?.data.find(
                        (product: any) => product.id === item.product_id
                      )?.selling_price || 0) *
                      (item.discount * 0.01 || 0)
                  ).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.subtotalTable}>
            <View style={styles.subtotalTableRow}>
              <Text style={styles.subtotalTableCol}>TOTAL:</Text>
              <Text style={styles.subtotalTableCol}>
                {totalAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.subtotalTableRow}>
              <Text style={styles.subtotalTableCol}>RECEIVED:</Text>
              <Text style={styles.subtotalTableCol}>0</Text>
            </View>
            <View style={styles.subtotalTableRow}>
              <Text style={styles.subtotalTableCol}>BALANCE:</Text>
              <Text style={styles.subtotalTableCol}>0</Text>
            </View>
          </View>

          <View>
            <Text>For, Purepride</Text>
            <Image
              src={PurePrideSignature}
              style={{ width: "150px", height: "auto", paddingLeft: "-50px" }}
            />
            <Text>Authorized Signatory</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

const styles = StyleSheet.create({
  viewer: {
    paddingTop: 32,
    width: "100%",
    height: "80vh",
    border: "none",
  },
  page: {
    display: "flex",
    padding: "0.4in 0.4in",
    fontSize: 12,
    color: "#333",
    backgroundColor: "#fff",
  },
  invoiceHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyInfo: {
    marginRight: 20, // Adjust as needed
  },
  invoiceHeadingText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
  invoiceLineSpacing: {
    marginVertical: 1,
  },
  logo: {
    width: 100,
    height: 100,
  },
  invoiceBody: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  invoiceText: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 16,
  },
  billTo: {
    marginTop: 20, // Adjust as needed
    fontSize: 14,
  },
  invoiceDetails: {
    marginTop: 20, // Adjust as needed
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "right",
  },
  table: {
    marginTop: 32,
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#e5e5e5",
    textAlign: "center",
  },
  tableHeaderItem: {
    flex: 1,
    paddingVertical: 8,
    border: "1px solid #000",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
  },
  tableCol: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    border: "1px solid #000",
  },
  subtotalTable: {
    marginLeft: "auto",
    textAlign: "right",
    marginTop: 32,
    borderCollapse: "collapse",
  },
  subtotalTableRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #000",
  },
  subtotalTableCol: {
    marginRight: 8,
    fontWeight: "bold",
    padding: "8px",
  },
});
