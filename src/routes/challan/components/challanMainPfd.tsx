// challanMainPdf.tsx
import React, { useContext, useCallback, useEffect } from "react";
import { usePDF } from "@react-pdf/renderer";
import { Button, Spin } from "antd";
import { ShareAltOutlined as IconShare } from "@ant-design/icons";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import { ColorModeContext } from "@/contexts/color-mode";
import { useLocation } from "react-router-dom";
import { Database } from "@/utilities";
import { HttpError, useOne, useList } from "@refinedev/core";
import { MainPdfDoc } from "./mainPdfDoc";

export const ChallanMainPdf: React.FC = () => {
  const location = useLocation();
  const challanId = location.pathname.split("/").pop();

  const { mode } = useContext(ColorModeContext);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  /* ---------------- Fetch challan ---------------- */
  const {
    data: challanData,
    isLoading: challanLoading,
    error: challanError,
  } = useOne<Database["public"]["Tables"]["challan"]["Row"], HttpError>({
    resource: "challan",
    id: challanId,
    queryOptions: { enabled: !!challanId },
  });

  /* ---------------- Fetch batch info ---------------- */
  const { data: batchInfoData, isLoading: batchLoading } = useList<
    Database["public"]["Tables"]["challan_batch_info"]["Row"]
  >({
    resource: "challan_batch_info",
    filters: [
      {
        field: "challan_id",
        operator: "eq",
        value: challanData?.data?.id,
      },
    ],
    pagination: { current: 1, pageSize: 1000 },
    queryOptions: {
      enabled: !!challanData?.data?.id,
    },
  });

  const challanBatchInfo = batchInfoData?.data ?? [];

  const isReady = !!challanData?.data && !challanLoading && !batchLoading;

  /* ---------------- PDF ---------------- */
  const [instance, updateInstance] = usePDF({
    document: isReady ? (
      <MainPdfDoc
        challanData={challanData!.data}
        challanBatchInfo={challanBatchInfo}
      />
    ) : undefined,
  });
  useEffect(() => {
    if (isReady) {
      updateInstance(
        <MainPdfDoc
          challanData={challanData!.data}
          challanBatchInfo={challanBatchInfo}
        />
      );
    }
  }, [isReady, challanData?.data, challanBatchInfo, updateInstance]);
  /* ---------------- Share ---------------- */
  const handleShare = useCallback(async () => {
    if (!instance.url) return alert("PDF not ready yet!");

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
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `challan-${challanId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [instance.url, challanId]);

  /* ---------------- UI STATES ---------------- */
  if (challanLoading || batchLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (challanError || !challanData?.data) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>
        Error loading challan data
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      <Button type="primary" onClick={handleShare} disabled={!instance.url}>
        <IconShare /> {instance.url ? "Share PDF" : "Generating PDF..."}
      </Button>

      {!instance.url ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
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
