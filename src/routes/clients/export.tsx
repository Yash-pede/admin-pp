// path: src/components/ExportDistroSalesData.tsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { DistributorShow } from "./distributors";
import { SalesShow } from "./sales";
import { DatePicker, Drawer, Form } from "antd";
import {
  CrudFilters,
  useExport,
  useGo,
  useList,
  useOne,
} from "@refinedev/core";
import { Edit } from "@refinedev/antd";
import dayjs from "dayjs";
import { Database } from "@/utilities";

const ExportDistroSalesData: React.FC = () => {
  const { pathname } = useLocation();
  const go = useGo();
  const recordId = pathname.split("/").pop() || "";
  const isDistributor = pathname.includes("distributors");

  // Fetch profile (either distributor or sales depending on route)
  const { data: profileData, isLoading: profileLoading } = useOne({
    resource: "profiles",
    id: recordId,
    queryOptions: { enabled: !!recordId },
  });

  const ExportData: React.FC = () => {
    const [form] = Form.useForm();
    const [month, setMonth] = useState<dayjs.Dayjs | null>(null);

    // Build shared filters for challans (month + status + current entity)
    const challanFilters: CrudFilters = month
      ? [
          {
            field: "created_at",
            operator: "gte",
            value: dayjs(month).startOf("month").toISOString(),
          },
          {
            field: "created_at",
            operator: "lte",
            value: dayjs(month).endOf("month").toISOString(),
          },
          { field: "status", operator: "eq", value: "BILLED" },
          {
            field: isDistributor ? "distributor_id" : "sales_id",
            operator: "eq",
            value: recordId,
          },
        ]
      : [];

    // Fetch challans based on month and current entity (distributor/sales)
    const { data: challansData } = useList<
      Database["public"]["Tables"]["challan"]["Row"]
    >({
      resource: "challan",
      filters: challanFilters,
      meta: {
        fields: [
          "id",
          "distributor_id",
          "sales_id",
          "customer_id",
          "status",
          "total_amt",
          "pending_amt",
          "received_amt",
          "bill_amt",
          "created_at",
        ],
      },
      queryOptions: { enabled: !!month && !profileLoading },
      pagination: { pageSize: 1000 },
    });

    // ---- Lookups ----
    // Sales lookup (only when viewing a distributor)
    const salesIds = challansData?.data?.map((c) => c.sales_id);

    const { data: salesData } = useList<
      Database["public"]["Tables"]["profiles"]["Row"]
    >({
      resource: "profiles",
      filters:
        isDistributor && salesIds?.length
          ? [
              { field: "id", operator: "in", value: salesIds },
              { field: "role", operator: "eq", value: "sales" },
            ]
          : [],
      meta: { fields: ["id", "full_name"] },
      queryOptions: { enabled: isDistributor && !!salesIds?.length },
      pagination: { pageSize: 1000 },
    });

    // Distributor lookup (only when viewing a sales profile)
    const distributorIds = challansData?.data?.map((c) => c.distributor_id);

    const { data: distributorsData } = useList<
      Database["public"]["Tables"]["profiles"]["Row"]
    >({
      resource: "profiles",
      filters:
        !isDistributor && distributorIds?.length
          ? [
              { field: "id", operator: "in", value: distributorIds },
              { field: "role", operator: "eq", value: "distributor" },
            ]
          : [],
      meta: { fields: ["id", "full_name"] },
      queryOptions: { enabled: !isDistributor && !!distributorIds?.length },
      pagination: { pageSize: 1000 },
    });

    // Customers lookup (common)
    const customerIds = challansData?.data?.map((c) => c.customer_id);

    const { data: customersData } = useList({
      resource: "customers",
      filters: customerIds?.length
        ? [{ field: "id", operator: "in", value: customerIds }]
        : [],
      meta: { fields: ["id", "full_name"] },
      queryOptions: { enabled: !!customerIds?.length },
      pagination: { pageSize: 1000 },
    });
    // console.log("CUSTOMER KA DATA",JSON.stringify(customersData,null,2));
    const customerMap = new Map(
      customersData?.data?.map((c) => [c.id, c.full_name])
    );
    const salesMap = new Map(salesData?.data?.map((s) => [s.id, s.full_name]));
    const distributorMap = new Map(
      distributorsData?.data?.map((d) => [d.id, d.full_name])
    );

    // Export logic
    const { triggerExport, isLoading: exportLoading } = useExport({
      resource: "challan",
      download: true,
      onError(error) {
        console.error("Export error:", error);
      },
      filters: challanFilters,
      mapData: (record: Database["public"]["Tables"]["challan"]["Row"]) => ({
        id: record.id,
        distributor_name: isDistributor
          ? profileData?.data?.full_name
          : distributorMap.get(record.distributor_id) || "",
        sales_name: isDistributor
          ? salesMap.get(record.sales_id ?? "") || ""
          : profileData?.data?.full_name,
        customer_name: customerMap.get(record.customer_id) || "",
        total: record.total_amt,
        received: record.received_amt,
        pending: record.pending_amt,
        // billed: record.bill_amt,
        date: dayjs(record.created_at).format("DD-MM-YYYY"),
      }),
      sorters: [{ field: "created_at", order: "desc" }],
      exportOptions: {
        filename: `${
          profileData?.data?.full_name ||
          (isDistributor ? "Distributor" : "Sales")
        }_${month ? dayjs(month).format("YYYY_MM") : "Report"}`,
      },
    });

    const handleExport = async () => {
      try {
        await form.validateFields();
        await triggerExport();
      } catch (err) {
        console.error("Validation failed:", err);
      }
    };

    return (
      <Drawer
        open
        title="Export Data"
        onClose={() =>
          go({
            to: {
              action: "show",
              id: recordId,
              resource: isDistributor ? "distributors" : "sales",
            },
          })
        }
      >
        <Edit
          isLoading={exportLoading || profileLoading}
          title="Export Data Month Wise"
          saveButtonProps={{ onClick: handleExport }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Month"
              name="month"
              rules={[{ required: true, message: "Please select a month" }]}
            >
              <DatePicker
                picker="month"
                minDate={dayjs("2025-01-01")}
                maxDate={dayjs("2030-12-31")}
                onChange={(val) => setMonth(val)}
              />
            </Form.Item>
          </Form>
        </Edit>
      </Drawer>
    );
  };

  if (isDistributor) {
    return (
      <DistributorShow>
        <ExportData />
      </DistributorShow>
    );
  } else if (pathname.includes("sales")) {
    return (
      <SalesShow>
        <ExportData />
      </SalesShow>
    );
  }

  return null;
};

export default ExportDistroSalesData;
