import { type FC } from "react";

import {
  FilterDropdown,
  getDefaultSortOrder,
  TextField,
  useSelect,
} from "@refinedev/antd";
import {
  CrudFilters,
  type CrudSorting,
  getDefaultFilter,
  useGo,
  useList,
} from "@refinedev/core";

import { Button, Input, Select, Table, type TableProps } from "antd";
import { PaginationTotal } from "@/components";
import { Database } from "@/utilities";

type Props = {
  tableProps: TableProps<Database["public"]["Tables"]["customers"]["Row"]>;
  sorters: CrudSorting;
  filters: CrudFilters;
  tableQueryResult: any;
};

export const CustomersTableView: FC<Props> = ({
  tableProps,
  sorters,
  filters,
  tableQueryResult,
}) => {
  const go = useGo();
  const { data: distributorsProfile, isLoading: isLoadingDistributorsProfile } =
    useList<Database["public"]["Tables"]["profiles"]["Row"]>({
      resource: "profiles",
      filters: [
        {
          field: "role",
          operator: "eq",
          value: "distributor",
        },
        {
          field: "id",
          operator: "in",
          value: tableQueryResult?.data
            ?.filter((item: any) => !!item.distributor_id)
            .map((item: any) => item.distributor_id),
        },
      ],
      queryOptions: {
        enabled: !!tableQueryResult,
      },
    });
  const { data: salesProfile, isLoading: isLoadingSalesProfile } = useList<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "sales",
      },
      {
        field: "id",
        operator: "in",
        value: tableQueryResult?.data
          ?.filter((item: any) => !!item.sales_id)
          .map((item: any) => item.sales_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult,
    },
  });

  const { selectProps: distributorSelectProps } = useSelect({
    resource: "profiles",
    optionLabel: "username",
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "distributor",
      },
      {
        field: "id",
        operator: "in",
        value: tableQueryResult?.data
          ?.filter((item: any) => !!item.distributor_id)
          .map((item: any) => item.distributor_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult,
    },
  });

  const { selectProps: salesSelectProps } = useSelect({
    resource: "profiles",
    optionLabel: "username",
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "sales",
      },
      {
        field: "id",
        operator: "in",
        value: tableQueryResult?.data
          ?.filter((item: any) => !!item.sales_id)
          .map((item: any) => item.sales_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult,
    },
  });

  return (
    <Table
      {...tableProps}
      pagination={{
        ...tableProps.pagination,
        pageSizeOptions: ["12", "24", "48", "96"],
        showTotal: (total) => (
          <PaginationTotal total={total} entityName="customers" />
        ),
      }}
      rowKey="id"
    >
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="id"
        title="ID"
        sorter={{ multiple: 2 }}
        defaultSortOrder={getDefaultSortOrder("id", sorters)}
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="full_name"
        title="Name"
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="email"
        title="email"
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="full_name"
        title="Full Name"
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="phone"
        title="phone"
        defaultFilteredValue={getDefaultFilter("phone", filters)}
        filterDropdown={(props) => (
          <FilterDropdown {...props}>
            <Input placeholder="Search Phone" />
          </FilterDropdown>
        )}
        render={(value) => <TextField value={"+91 " + value} />}
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="distributor_id"
        title="Distributor"
        filterDropdown={(props) => (
          <FilterDropdown {...props}>
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              placeholder="Filter products"
              {...distributorSelectProps}
            />
          </FilterDropdown>
        )}
        render={(value) =>
          distributorsProfile?.data.find((item) => item.id === value)
            ?.username || "-"
        }
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="sales_id"
        title="Sales"
        filterDropdown={(props) => (
          <FilterDropdown {...props}>
            <Select
              style={{ minWidth: 200 }}
              mode="multiple"
              placeholder="Filter products"
              {...salesSelectProps}
            />
          </FilterDropdown>
        )}
        render={(value) =>
          salesProfile?.data.find((item) => item.id === value)?.username || "-"
        }
      />
      <Table.Column
        dataIndex="action"
        render={(_, record) => (
          <Button
            type="primary"
            onClick={() =>
              go({
                to: `/challan`,
                query: {
                  filters: [
                    {
                      field: "customer_id",
                      operator: "eq",
                      value: JSON.parse(JSON.stringify(record)).id,
                    },
                  ],
                },
              })
            }
          >
            Challan's
          </Button>
        )}
      />
    </Table>
  );
};
