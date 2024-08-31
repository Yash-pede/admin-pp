import { Database } from "@/utilities";
import {
  DateField,
  FilterDropdown,
  getDefaultSortOrder,
  List,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { useGo, useList } from "@refinedev/core";
import { Input, Select, Table } from "antd";
import React from "react";

export const StocksPast = () => {
  const { tableProps, tableQueryResult, sorter } = useTable<
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

  const { selectProps } = useSelect<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
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
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                style={{ minWidth: 200 }}
                mode="multiple"
                placeholder="Filter products"
                {...selectProps}
              />
            </FilterDropdown>
          )}
          render={(value) => (
            <div>{productsData?.data.find((p) => p.id === value)?.name}</div>
          )}
        />
        <Table.Column
          dataIndex="id"
          title="Batch Id"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorter)}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input />
            </FilterDropdown>
          )}
          render={(value) => <div>{value}</div>}
        />
        <Table.Column
          dataIndex="ordered_quantity"
          title="Ordered Quantity"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorter)}
          render={(value) => <div>{value}</div>}
        />
        <Table.Column
          dataIndex="expiry_date"
          title="Expiry"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorter)}
          render={(value) => <DateField value={value} />}
        />
        <Table.Column
          dataIndex="created_at"
          title="Created At"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorter)}
          render={(value) => <DateField value={value} />}
        />
      </Table>
    </List>
  );
};
