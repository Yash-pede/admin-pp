import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  usePDF,
  Image,
} from "@react-pdf/renderer";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useContext, useEffect, useState } from "react";
import { ColorModeContext } from "@/contexts/color-mode";
import { Database, supabaseServiceRoleClient } from "@/utilities";
import { HttpError, useOne } from "@refinedev/core";
import { useLocation } from "react-router-dom";
import { challanProductAddingType } from "@/utilities/constants";
import { PurePrideInvoiceLogo, PurePrideSignature } from "@/images";
import dayjs from "dayjs";
import { Button } from "antd";
import { IconShare } from "@tabler/icons-react";

export const ChallanPdf = () => {
  const challanId = useLocation().pathname.split("/").pop();

  const { data: challanData, isLoading: challanLoading } = useOne<
    Database["public"]["Tables"]["challan"]["Row"],
    HttpError
  >({
    resource: "challan",
    id: challanId,
  });

  const [billInfo, setBillInfo] = useState<challanProductAddingType[]>();

  const [customer, setCustomer] = useState<any>();
  const [distributor, setDistributor] =
    useState<Database["public"]["Tables"]["profiles"]["Row"]>();

  const [products, setProducts] = useState<any>();

  const [totalAmount, setTotalAmount] = useState<any>();

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
            .select("id, name")
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
        const subtotal = item.actual_q * (item.selling_price || 0);
        const discountAmount = subtotal * (item.discount * 0.01 || 0);
        return total + subtotal - discountAmount;
      }, 0);
      setTotalAmount(total);
    }
  }, [billInfo, products]);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const MyDoc = () => {
    if (!customer || !products) {
      return <div>Loading...</div>;
    }
    return (
      <Document>
        <Page size="A4" style={styles.page}>
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
            <Text style={styles.invoiceText}>CHALLAN</Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Text style={{ ...styles.invoiceLineSpacing, ...styles.billTo }}>
                Bill To:
              </Text>
              <Text style={styles.bold}>{customer.full_name}</Text>
              <Text>Mob: {customer.phone}</Text>
              <Text>{customer.address}</Text>
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
              <Text style={{ paddingHorizontal: 3 }}>#</Text>
              <Text
                style={{
                  ...styles.tableHeaderItem,
                  flex: 4.42,
                  textAlign: "left",
                }}
              >
                Item Name
              </Text>
              <Text style={styles.tableHeaderItem}>Quantity</Text>
              <Text style={styles.tableHeaderItem}>Free Q</Text>
              <Text style={styles.tableHeaderItem}>Price/Unit</Text>
              <Text style={styles.tableHeaderItem}>Discount</Text>
              <Text style={styles.tableHeaderItem}>Amount</Text>
            </View>
            {billInfo?.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={{ paddingVertical: 3, paddingHorizontal: 3 }}>
                  {index + 1}
                </Text>
                <Text
                  style={{ ...styles.tableCol, flex: 5, textAlign: "left" }}
                >
                  {
                    products.find(
                      (product: any) => product.id === item.product_id
                    )?.name
                  }
                </Text>
                <Text style={styles.tableCol}>{item.actual_q}</Text>
                <Text style={styles.tableCol}>{item.free_q}</Text>
                <Text style={styles.tableCol}>
                  {item.selling_price?.toFixed(2)}
                </Text>
                <Text style={styles.tableCol}>{item.discount}%</Text>
                <Text style={styles.tableCol}>
                  {(
                    item.actual_q * item.selling_price -
                    item.actual_q *
                      item.selling_price *
                      (item.discount * 0.01 || 0)
                  ).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.subtotalTable}>
            <View style={styles.subtotalTableRow}>
              <Text
                style={[
                  styles.subtotalTableCol,
                  {
                    backgroundColor: "#a01c9a",
                    textAlign: "center",
                    color: "#ffff",
                  },
                ]}
              >
                TOTAL:
              </Text>
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
  const { mode } = useContext(ColorModeContext);

  useEffect(() => {
    updateInstance(<MyDoc />);
  }, [billInfo, customer, challanData, totalAmount, challanId]);

  useEffect(() => {
    if (instance.error) {
      console.error("PDF Generation Error:", instance.error);
    }
  }, [instance.error]);

  if (!billInfo || !customer || !products || !distributor || !challanData) {
    return <div>Loading...</div>;
  }

  const handleShare = async () => {
    if (!instance.url) return alert("PDF not ready yet");

    try {
      const response = await fetch(instance.url);
      const blob = await response.blob();

      const file = new File([blob], `challan-${challanId}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Challan ${challanId}`,
          text: `Here's the challan PDF for customer: ${customer.full_name}`,
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
        height: "100%",
        display: "flex",
        gap: "1rem",
        flexDirection: "column",
      }}
    >
      {/* 🟣 Share Button */}
      <Button
        type="primary"
        color="primary"
        variant="filled"
        style={{ marginLeft: "auto" }}
        onClick={handleShare}
      >
        <IconShare /> Share
      </Button>

      {/* 🟢 PDF Viewer */}
      {instance.loading || !instance.url ? (
        "Loading"
      ) : (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            enableSmoothScroll
            fileUrl={instance.url}
            plugins={[defaultLayoutPluginInstance]}
            theme={mode}
          />
        </Worker>
      )}
    </div>
  );
};

const styles = StyleSheet.create({
  page: {
    display: "flex",
    padding: "0.4in 0.4in",
    fontSize: 12,
    color: "#333",
    backgroundColor: "#fff",
  },
  section: {
    marginBottom: 10,
  },
  invoiceHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyInfo: {
    marginRight: 20,
  },
  invoiceHeadingText: {
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
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
    fontFamily: "Helvetica-Bold",
    color: "#a01c9a",
  },
  invoiceText: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 16,
  },
  billTo: {
    marginTop: 20,
    fontSize: 14,
  },
  invoiceDetails: {
    marginTop: 20,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "right",
  },
  bold: {
    fontFamily: "Helvetica-Bold",
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
    paddingVertical: 2,
    // border: "1px solid #000",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
  },
  tableCol: {
    flex: 1,
    paddingVertical: 3,
    textAlign: "center",
    paddingHorizontal: 4,
    // border: "1px solid #000",
  },
  subtotalTable: {
    marginLeft: "auto",
    textAlign: "right",
    marginTop: 10,
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
    padding: 3,
  },
});
