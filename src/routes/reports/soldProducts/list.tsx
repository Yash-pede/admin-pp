// path: src/routes/reports/ReportPayments.tsx
import { Database } from "@/utilities";
import { List, useSelect, useTable } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Button, Form, Grid, Select, Space, Table } from "antd";
import dayjs from "dayjs";
import { debounce } from "lodash";
import React, { useState } from "react";

interface Challan {
  id: number;
  created_at: string;
  total_amt: number;
  received_amt: number;
  pending_amt: number;
  product_info: {
    product_id: number;
    actual_q: number;
    free_q: number;
    discount: number;
    quantity: number;
    selling_price: number;
  }[];
}

export const SoldProducts: React.FC = () => {
  const screens = Grid.useBreakpoint();

  const [year, setYear] = useState(dayjs().year());
  const [distributorId, setDistributorId] = useState<string | null>(null);
  const [salesId, setSalesId] = useState<string | null>(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const { tableProps } = useTable<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    meta: { select: "id, name" },
    sorters: { initial: [{ field: "id", order: "asc" }] },
    pagination: { pageSize: 1000, mode: "off" },
  });

  const {
    data: challanProducts,
    isLoading: isLoadingChallanProducts,
    refetch: refetchChallanProducts,
    isRefetching: isRefetchingChallanProducts,
  } = useList<Challan>({
    resource: "challan",
    pagination: { current: 1, pageSize: 100000 },
    filters: distributorId
      ? [
          {
            field: "created_at",
            operator: "gte",
            value: `${year}-01-01 00:00:00`,
          },
          {
            field: "created_at",
            operator: "lt",
            value: `${year + 1}-01-01 00:00:00`,
          },
          { field: "distributor_id", operator: "eq", value: distributorId },
          { field: "status", operator: "eq", value: "BILLED" },
        ]
      : salesId
      ? [
          {
            field: "created_at",
            operator: "gte",
            value: `${year}-01-01 00:00:00`,
          },
          {
            field: "created_at",
            operator: "lt",
            value: `${year + 1}-01-01 00:00:00`,
          },
          { field: "sales_id", operator: "eq", value: salesId },
          { field: "status", operator: "eq", value: "BILLED" },
        ]
      : [
          {
            field: "created_at",
            operator: "gte",
            value: `${year}-01-01 00:00:00`,
          },
          {
            field: "created_at",
            operator: "lt",
            value: `${year + 1}-01-01 00:00:00`,
          },
          { field: "status", operator: "eq", value: "BILLED" },
        ],
    meta: {
      select:
        "id, created_at, total_amt, received_amt, pending_amt, product_info",
    },
  });

  const { selectProps: distributorSelectProps } = useSelect({
    resource: "profiles",
    optionLabel: "username",
    optionValue: "id",
    filters: [{ field: "role", operator: "eq", value: "distributor" }],
    debounce: 500,
  });

  const { selectProps: salesSelectProps } = useSelect({
    resource: "profiles",
    optionLabel: "username",
    optionValue: "id",
    filters: [{ field: "role", operator: "eq", value: "sales" }],
    debounce: 500,
  });

  const setYearFn = (newYear: number) => {
    setYear(newYear);
    refetchChallanProducts();
  };
  const debouncedOnChange = debounce(setYearFn, 500);

  const yearOptions = Array.from({ length: 5 }, (_, index) => 2023 + index).map(
    (year) => ({ value: year, label: year })
  );

  const handleSalesChange = (value: any) => {
    if (!value) setSalesId(null);
    else {
      setSalesId(value);
      setDistributorId(null);
      refetchChallanProducts();
    }
  };

  const handleDistributorChange = (value: any) => {
    if (!value) setDistributorId(null);
    else {
      setDistributorId(value);
      setSalesId(null);
      refetchChallanProducts();
    }
  };
  const renderCell = (received: number, pending: number, total: number) => (
    <Space size="small">
      <span>{received}</span>
      <span>+</span>
      <span>{pending}</span>
      <span>=</span>
      <b>{total}</b>
    </Space>
  );

  return (
    <List
      headerButtons={() => (
        <Space style={{ marginTop: screens.xs ? "1.6rem" : undefined }}>
          <Form layout="inline">
            <Form.Item name="sales" noStyle>
              <Select
                {...salesSelectProps}
                style={{ minWidth: 200 }}
                placeholder="Filter sales"
                onChange={handleSalesChange}
                allowClear
              />
            </Form.Item>
          </Form>
          <Form layout="inline">
            <Form.Item name="distributor" noStyle>
              <Select
                {...distributorSelectProps}
                style={{ minWidth: 200 }}
                placeholder="Filter distributors"
                onChange={handleDistributorChange}
                allowClear
              />
            </Form.Item>
          </Form>
          <Form layout="inline">
            <Form.Item name="year" noStyle>
              <Select
                defaultValue={year}
                style={{ width: 120 }}
                onChange={debouncedOnChange}
                options={yearOptions}
                loading={
                  isLoadingChallanProducts || isRefetchingChallanProducts
                }
              />
            </Form.Item>
          </Form>
        </Space>
      )}
    >
      <div style={{ marginBottom: 8, fontWeight: "bold" }}>
        Sub-columns: Received + Pending = Total
      </div>

      <Table {...tableProps} scroll={{ x: "max-content" }}>
        <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
          dataIndex="id"
          title="ID"
        />
        <Table.Column dataIndex="name" title="Name" />

        {months.map((month, index) => (
          <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
            key={index}
            title={month}
            render={(_, record) => {
              let total = 0;
              let received = 0;
              let pending = 0;

              challanProducts?.data.forEach((challan) => {
                if (dayjs(challan.created_at).month() === index) {
                  challan.product_info?.forEach((item) => {
                    if (item.product_id === record.id) {
                      total += challan.total_amt || 0;
                      received += challan.received_amt || 0;
                      pending += challan.pending_amt || 0;
                    }
                  });
                }
              });

              return renderCell(received, pending, total);
            }}
          />
        ))}

        <Table.Column<Database["public"]["Tables"]["products"]["Row"]>
          key="yearly-total"
          title="Total"
          render={(_, record) => {
            let total = 0;
            let received = 0;
            let pending = 0;

            challanProducts?.data.forEach((challan) => {
              challan.product_info?.forEach((item) => {
                if (item.product_id === record.id) {
                  total += challan.total_amt || 0;
                  received += challan.received_amt || 0;
                  pending += challan.pending_amt || 0;
                }
              });
            });

            return renderCell(received, pending, total);
          }}
        />
      </Table>
    </List>
  );
};
