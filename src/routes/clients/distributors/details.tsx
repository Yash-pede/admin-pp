import React from "react";
import { Database } from "@/utilities";
import {
  DateField,
  FilterDropdown,
  getDefaultSortOrder,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { List, Select, Skeleton, Table } from "antd";
import { useLocation } from "react-router-dom";

export const InventoryDetails = () => {
  const user = useLocation().pathname.split("/").pop();
  const { tableProps, tableQueryResult,sorters } = useTable<
    Database["public"]["Tables"]["inventory"]["Row"]
  >({
    resource: "inventory",
    filters: {
      mode: "server",
      permanent: [
        {
          field: "distributor_id",
          operator: "eq",
          value: user,
        },
      ],
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data.map((item) => item.product_id),
      },
    ],
    queryOptions: {
      enabled: !!user && !tableProps.loading,
    },
  });

  const { selectProps: productSelectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data.map((item) => item.product_id),
      },
    ],
    defaultValue: tableQueryResult.data?.data.map((item) => item.product_id),
  });

  return (
    <List header={<h1>Inventory Details</h1>}>
      <Table {...tableProps} rowKey={"id"}>
        <Table.Column dataIndex="id" title="ID" hidden />
        <Table.Column
          dataIndex="product_id"
          title="Product ID"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                mode="multiple"
                style={{ minWidth: 200 }}
                placeholder="Select Products"
                {...productSelectProps}
              />
            </FilterDropdown>
          )}
          render={(value) => {
            if (isLoadingProducts) {
              return <Skeleton.Input style={{ width: 100 }} />;
            }
            const product = products?.data?.find(
              (item) => item.id === value
            ) as Database["public"]["Tables"]["products"]["Row"];
            return product?.name;
          }}
        />
        <Table.Column
          dataIndex="quantity"
          title="Quantity"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorters)}
        />
        <Table.Column dataIndex="batch_id" title="Batch ID" />
        <Table.Column
          dataIndex="created_at"
          title="Created"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorters)}
          render={(value) => <DateField value={value} />}
        />
      </Table>
    </List>
  );
};
