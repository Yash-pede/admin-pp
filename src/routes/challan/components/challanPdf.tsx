import React, { useContext, useEffect } from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  usePDF,
} from "@react-pdf/renderer";
import { PurePrideInvoiceLogo, PurePrideSignature } from "@/images/index";
import { HttpError, useOne } from "@refinedev/core";
import { Database } from "@/utilities";
import { useLocation } from "react-router-dom";
import { supabaseServiceRoleClient } from "@/utilities";
import dayjs from "dayjs";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { ColorModeContext } from "@/contexts/color-mode";

export const ChallanPdf = () => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const challanId = useLocation().pathname.split("/").pop();
  type challanProductAddingType = {
    product_id: string;
    quantity: number;
    discount: number;
  };
  const { data: challanData, isLoading: challanLoading } = useOne<
    Database["public"]["Tables"]["challan"]["Row"],
    HttpError
  >({
    resource: "challan",
    id: challanId,
  });

  const [billInfo, setBillInfo] = React.useState<challanProductAddingType[]>();

  const [customer, setCustomer] = React.useState<any>();
  const [distributor, setDistributor] =
    React.useState<Database["public"]["Tables"]["profiles"]["Row"]>();

  const [products, setProducts] = React.useState<any>();

  const [totalAmount, setTotalAmount] = React.useState<any>();

  useEffect(() => {
    if (challanData) {
      const fetchCustomer = async () => {
        const { data: Customer, error: CustomerError } =
          await supabaseServiceRoleClient
            .from("customers")
            .select("*")
            .eq("id", challanData?.data.customer_id);
        // console.log(Customer[0]);
        setCustomer(Customer?.[0]);
      };
      const fetchDistributor = async () => {
        const { data } = await supabaseServiceRoleClient
          .from("profiles")
          .select("*")
          .eq("id", challanData?.data.distributor_id);
        // console.log(Customer[0]);
        setDistributor(data?.[0]);
      };
      const fetchProducts = async () => {
        const { data: products, error: productsError } =
          await supabaseServiceRoleClient
            .from("products")
            .select("*")
            .in(
              "id",
              challanData?.data?.product_info &&
                Array.isArray(challanData?.data?.product_info)
                ? challanData?.data?.product_info.map(
                    (item: any) => item.product_id
                  )
                : []
            );
        setProducts(products);
      };
      fetchCustomer();
      fetchProducts();
      fetchDistributor();
      if (challanData) {
        setBillInfo(challanData?.data.product_info as any);
      }
    }
  }, [challanData]);

  useEffect(() => {
    if (billInfo && products) {
      const total = billInfo.reduce((total, item) => {
        const product = products.find(
          (product: { id: string }) => product.id === item.product_id
        );
        if (product) {
          const subtotal = item.quantity * (product.selling_price || 0);
          const discountAmount = subtotal * (item.discount * 0.01 || 0);
          return total + subtotal - discountAmount;
        }
        return total;
      }, 0);
      setTotalAmount(total);
    }
  }, [billInfo, products]);

  const MyDoc = () => {
    if (!customer || !products) {
      return <div>Loading...</div>;
    }
    return (
      <Document>
        <Page style={styles.page} size="A4">
          <View style={styles.invoiceHeader}>
            <View style={styles.companyInfo}>
              <Text style={styles.invoiceHeadingText}>
                {distributor?.full_name}
              </Text>
              <Text style={styles.invoiceLineSpacing}>
                Mob: {distributor?.phone}
              </Text>
              <Text style={styles.invoiceLineSpacing}>
                Email: {distributor?.email}
              </Text>
            </View>
            <Image style={styles.logo} src={PurePrideInvoiceLogo} />
          </View>
          <View style={styles.invoiceBody}>
            <Text style={[styles.invoiceText, styles.bold]}>INVOICE</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={styles.billTo}>
              <Text style={{ fontStyle: "italic", fontSize: 14 }}>
                Bill To:
              </Text>
              <Text style={{ fontSize: 14 }}>{customer.full_name}</Text>
              <Text style={{ fontSize: 14 }}>+91 {customer.phone}</Text>
              <Text style={{ fontSize: 14 }}>{customer.address}</Text>
            </View>
            <View style={styles.billTo}>
              <Text style={{ textAlign: "right", margin: "auto" }}>
                Challan No: {challanId}
              </Text>
              <Text style={{ textAlign: "right" }}>
                Date :{" "}
                {dayjs(challanData?.data.created_at).format("DD/MM/YYYY")}
              </Text>
            </View>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderItem, { flex: 0.3 }]}>#</Text>
              <Text style={styles.tableHeaderItem}>Item Name</Text>
              <Text style={styles.tableHeaderItem}>Quantity</Text>
              <Text style={styles.tableHeaderItem}>Price/Unit</Text>
              <Text style={styles.tableHeaderItem}>SubTotal</Text>
              <Text style={styles.tableHeaderItem}>Discount</Text>
              <Text style={styles.tableHeaderItem}>Amount</Text>
            </View>
            {billInfo?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCol, { flex: 0.23 }]}>
                  {index + 1}
                </Text>
                <Text style={styles.tableCol}>
                  {
                    products.find(
                      (product: any) => product.id === item.product_id
                    )?.name
                  }
                </Text>
                <Text style={styles.tableCol}>
                  {item.quantity -
                    (products.find(
                      (product: any) => product.id === item.product_id
                    )?.free_q ?? 0) *
                      (item.quantity /
                        ((products.find(
                          (product: any) => product.id === item.product_id
                        )?.base_q ?? 0) +
                          (products.find(
                            (product: any) => product.id === item.product_id
                          )?.free_q ?? 0))) +
                    "  +  " +
                    (item.quantity /
                      ((products.find(
                        (product: any) => product.id === item.product_id
                      )?.base_q ?? 0) +
                        (products.find(
                          (product: any) => product.id === item.product_id
                        )?.free_q ?? 0))) *
                      (products.find(
                        (product: any) => product.id === item.product_id
                      )?.free_q ?? 0)}
                </Text>
                <Text style={styles.tableCol}>
                  {
                    products.find(
                      (product: any) => product.id === item.product_id
                    )?.selling_price
                  }
                </Text>
                <Text style={styles.tableCol}>
                  {item.quantity *
                    (products.find(
                      (product: any) => product.id === item.product_id
                    )?.selling_price || 0)}
                </Text>
                <Text style={styles.tableCol}>{item.discount}%</Text>
                <Text style={styles.tableCol}>
                  {(
                    item.quantity *
                      (products.find(
                        (product: any) => product.id === item.product_id
                      )?.selling_price || 0) -
                    item.quantity *
                      (products.find(
                        (product: any) => product.id === item.product_id
                      )?.selling_price || 0) *
                      (item.discount * 0.01 || 0)
                  ).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.subtotalTable}>
            <View
              style={[
                styles.subtotalTableRow,
                {
                  backgroundColor: "#a01c9a",
                  textAlign: "center",
                  color: "#ffff",
                },
              ]}
            >
              <Text style={styles.subtotalTableCol}>TOTAL:</Text>
              <Text style={styles.subtotalTableCol}>
                {totalAmount?.toFixed(2)}
              </Text>
            </View>
            <View style={styles.subtotalTableRow}>
              <Text style={styles.subtotalTableCol}>RECEIVED:</Text>
              <Text style={styles.subtotalTableCol}>
                {challanData?.data.received_amt}
              </Text>
            </View>
            <View style={styles.subtotalTableRow}>
              <Text style={styles.subtotalTableCol}>BALANCE:</Text>
              <Text style={styles.subtotalTableCol}>
                {challanData?.data.pending_amt}
              </Text>
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
    );
  };
  const [instance, updateInstance] = usePDF({ document: <MyDoc /> });
  useEffect(() => {
    updateInstance(<MyDoc />);
  }, [billInfo, customer, challanData, totalAmount, challanId]);
  const { mode } = useContext(ColorModeContext);

  return (
    <div>
      {instance.loading || !instance.url ? (
        "Loading"
      ) : (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            enableSmoothScroll
            theme={mode}
            fileUrl={instance.url}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      )}
    </div>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontFamily: "Times-Bold",
  },
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
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
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
    fontWeight: "extrabold",
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
    backgroundColor: "#a01c9a",
    textAlign: "center",
    color: "#ffff",
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
