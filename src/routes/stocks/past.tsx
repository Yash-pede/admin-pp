import { Database } from "@/utilities";
import { DateField, List, useTable } from "@refinedev/antd";
import { useGo, useList } from "@refinedev/core";
import { Table } from "antd";
import React from "react";

export const StocksPast = () => {
  const go = useGo();
  const { tableProps, tableQueryResult, filters, sorter } = useTable<
    Database["public"]["Tables"]["stocks"]["Row"]
  >({
    resource: "stocks",
    pagination: {
      pageSize: 12,
    },
    filters: {
      permanent: [
        {
          field: "available_quantity",
          operator: "eq",
          value: "0",
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "asc",
        },
      ],
    },
  });
  const { data: productsData, isLoading: isLoadingProducts } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult?.data?.data?.map((item) => item.product_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult?.data?.data,
    },
  });
  return (
    <List title="Past Stocks" canCreate={false}>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="product_id"
          title="Product"
          render={(value) => <div>{productsData?.data.find((p) => p.id === value)?.name}</div>}
        />
        <Table.Column
          dataIndex="available_quantity"
          title="Available Quantity"
          render={(value) => <div>{value}</div>}
        />
        <Table.Column
          dataIndex="ordered_quantity"
          title="Ordered Quantity"
          render={(value) => <div>{value}</div>}
        />
        <Table.Column
          dataIndex="expiry_date"
          title="Expiry"
          render={(value) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex="created_at"
          title="Created At"
          render={(value) => <DateField value={value} />}
        />
      </Table>
    </List>
  );
};
