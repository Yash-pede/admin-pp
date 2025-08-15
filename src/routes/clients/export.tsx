import React from "react";
import { useLocation } from "react-router-dom";
import { DistributorShow } from "./distributors";
import { SalesShow } from "./sales";
import { DatePicker, Drawer, Form, Input } from "antd";
import { useExport, useGo, useOne } from "@refinedev/core";
import { Edit } from "@refinedev/antd";
import dayjs from "dayjs";

const ExportDistroSalesData = () => {
  const { pathname } = useLocation();
  const go = useGo();
  const { data: profileData, isLoading: profileLoading } = useOne({
    resource: "profiles",
    id: pathname.split("/").pop(),
    queryOptions: {
      enabled: !!pathname.split("/").pop(),
    },
  });
  const ExportData = () => {
    const [form] = Form.useForm();
    const { triggerExport, isLoading: exportLoading } = useExport({
      resource: "challans",
      filters: [
        {
          field: pathname.includes("distributors")
            ? "distributor_id"
            : "sales_id",
          operator: "eq",
          value: pathname.split("/").pop(),
        },
        {
          field: "created_at",
          operator: "gte",
          value: dayjs(form.getFieldValue("month"))
            .startOf("month")
            .toISOString(),
        },
      ],
      download: true,
      onError(error) {
        console.error(error);
      },
      mapData: (record) => {
        return {
          product_id: record.product_id,
          id: record.id,
          available_quantity: record.available_quantity,
          ordered_quantity: record.ordered_quantity,
          expiry_date: dayjs(record.expiry_date).format("DD-MM-YYYY"),
          created_at: dayjs(record.created_at).format("DD-MM-YYYY"),
        };
      },
      exportOptions: {
        filename: profileData?.data?.full_name,
      },
      pageSize: 100000,
    });
    form.submit = async () => {
      const month: dayjs.Dayjs = form.getFieldValue("month");
      console.log("Exporting data with month:", month.format("YYYY-MM"));
      triggerExport();
    };

    return (
      <Drawer
        open
        title="Export Data"
        onClose={() =>
          go({
            to: {
              action: "show",
              id: pathname.split("/").pop() || "",
              resource: pathname.includes("distributors")
                ? "distributors"
                : "sales",
            },
          })
        }
      >
        <Edit
          title="Export Data Month Wise"
          saveButtonProps={{ onClick: () => form.submit(), htmlType: "submit" }}
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
              />
            </Form.Item>
          </Form>
        </Edit>
      </Drawer>
    );
  };
  if (pathname.includes("distributors")) {
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
