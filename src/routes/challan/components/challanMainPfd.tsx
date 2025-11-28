// challanMainPdf.tsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Document, Page, Text, usePDF } from "@react-pdf/renderer";
import { Button } from "antd";
import { ShareAltOutlined as IconShare } from "@ant-design/icons";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { ColorModeContext } from "@/contexts/color-mode";
import { useLocation } from "react-router-dom";
import { Database, supabaseServiceRoleClient } from "@/utilities";
import {
  ChallanBatchInfo,
  challanProductAddingType,
} from "@/utilities/constants";
import { HttpError, useOne } from "@refinedev/core";
import { MainPdfDoc } from "./mainPdfDoc";

export const ChallanMainPdf: React.FC = () => {
  const location = useLocation();
  const challanId = useMemo(
    () => location.pathname.split("/").pop()!,
    [location.pathname]
  );

  const { mode } = useContext(ColorModeContext);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const { data: challanData, isLoading: challanLoading } = useOne<
    Database["public"]["Tables"]["challan"]["Row"],
    HttpError
  >({
    resource: "challan",
    id: challanId,
  });

  const [billInfo, setBillInfo] = useState<challanProductAddingType[]>();
  const [customer, setCustomer] = useState<
    Database["public"]["Tables"]["customers"]["Row"] | null
  >(null);
  const [distributor, setDistributor] = useState<
    Database["public"]["Tables"]["profiles"]["Row"] | null
  >(null);
  const [salesPerson, setSalesPerson] = useState<{
    full_name: any;
    id: any;
  } | null>(null);

  const [products, setProducts] = useState<
    Database["public"]["Tables"]["products"]["Row"][] | null
  >(null);

  const [totalAmount, setTotalAmount] = useState<number>(0);

  const [challanBatchInfo, setChallanBatchInfo] = useState<
    Database["public"]["Tables"]["challan_batch_info"]["Row"][] | null
  >(null);

  const [stocksDetails, setStocksDetails] = useState<
    Database["public"]["Tables"]["stocks"]["Row"][]
  >([]);

  // -------------------------------
  // FETCH ALL CHALLAN RELATED DATA
  // -------------------------------
  useEffect(() => {
    if (!challanData?.data) return;

    const loadAll = async () => {
      try {
        const challan = challanData.data;

        setBillInfo(challan.product_info as any);

        const productIds = Array.isArray(challan.product_info)
          ? challan.product_info.map((item: any) => item.product_id)
          : [];

        const [
          customerRes,
          distributorRes,
          productsRes,
          batchInfoRes,
          salesRes,
        ] = await Promise.all([
          supabaseServiceRoleClient
            .from("customers")
            .select("*")
            .eq("id", challan.customer_id)
            .single(),

          supabaseServiceRoleClient
            .from("profiles")
            .select("*")
            .eq("id", challan.distributor_id)
            .single(),

          supabaseServiceRoleClient
            .from("products")
            .select("*")
            .in("id", productIds),

          supabaseServiceRoleClient
            .from("challan_batch_info")
            .select("*")
            .eq("challan_id", challan.id),

          challan.sales_id
            ? supabaseServiceRoleClient
                .from("profiles")
                .select("full_name,id")
                .eq("id", challan.sales_id)
                .single()
            : { data: null },
        ]);

        setCustomer(customerRes.data ?? null);
        setDistributor(distributorRes.data ?? null);
        setProducts(productsRes.data ?? null);
        setChallanBatchInfo(batchInfoRes.data ?? null);
        setSalesPerson(salesRes.data ?? null);
      } catch (err) {
        console.error("Error loading challan info:", err);
      }
    };

    loadAll();
  }, [challanData]);

  // -------------------------------
  // FETCH STOCK DETAILS FOR BATCHES
  // -------------------------------
  useEffect(() => {
    if (!challanBatchInfo || challanBatchInfo.length === 0) return;

    const loadStockDetails = async () => {
      try {
        const batchIds = (challanBatchInfo ?? [])
          .map((row) => {
            // safe handle if batch_info is stored as JSON string or object
            const batchInfo = row.batch_info as any;
            if (typeof batchInfo === "string") {
              try {
                return JSON.parse(batchInfo).map((b: any) => b.batch_id);
              } catch {
                return [];
              }
            }
            if (Array.isArray(batchInfo)) {
              return batchInfo.map((b: any) => b.batch_id);
            }
            return [];
          })
          .flat();

        const { data } = await supabaseServiceRoleClient
          .from("stocks")
          .select("expiry_date, id")
          .in("id", batchIds);

        setStocksDetails(data ?? []);
      } catch (err) {
        console.error("Error loading stock details:", err);
      }
    };

    loadStockDetails();
  }, [challanBatchInfo]);

  // -------------------------------
  // TOTAL AMOUNT CALCULATION (simple pre-calc)
  // -------------------------------
  useEffect(() => {
    if (!billInfo || !products) return;

    const total = billInfo.reduce((total, item) => {
      const price = item.selling_price || 0;
      const subtotal = item.actual_q * price;
      const discount = subtotal * ((item.discount || 0) / 100);
      return total + subtotal - discount;
    }, 0);

    setTotalAmount(total);
  }, [billInfo, products]);

  // -------------------------------
  // PDF INSTANCE
  // -------------------------------
  const [instance, updateInstance] = usePDF({
    document: (
      <Document>
        <Page size="A4">
          <Text>Loading...</Text>
        </Page>
      </Document>
    ),
  });

  useEffect(() => {
    if (
      distributor &&
      customer &&
      challanData &&
      billInfo &&
      products &&
      challanBatchInfo
    ) {
      updateInstance(
        <MainPdfDoc
          distributor={distributor}
          customer={customer}
          challanData={challanData.data}
          salesName={salesPerson?.full_name}
          products={products}
          billInfo={billInfo}
          challanBatchInfo={challanBatchInfo}
          stocksDetails={stocksDetails}
        />
      );
    }
  }, [
    distributor,
    customer,
    challanData,
    billInfo,
    products,
    challanBatchInfo,
    salesPerson,
    stocksDetails,
    updateInstance,
  ]);

  // -------------------------------
  // SHARE HANDLER
  // -------------------------------
  const handleShare = async () => {
    if (!instance.url) return alert("PDF not ready yet!");

    try {
      const response = await fetch(instance.url);
      const blob = await response.blob();

      const file = new File([blob], `challan-${challanId}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Challan ${challanId}`,
          files: [file],
        });
      } else {
        alert("Sharing is not supported on this device.");
      }
    } catch (err) {
      console.error("Share failed:", err);
      alert("Unable to share PDF.");
    }
  };

  // -------------------------------
  // LOADING STATE
  // -------------------------------
  if (
    challanLoading ||
    !billInfo ||
    !customer ||
    !distributor ||
    !products ||
    !challanData
  ) {
    return <div>Loading...</div>;
  }

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <Button
        type="primary"
        style={{ marginLeft: "auto" }}
        onClick={handleShare}
      >
        <IconShare /> Share
      </Button>

      {!instance.url ? (
        <div>Loading PDF...</div>
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

export default ChallanMainPdf;
