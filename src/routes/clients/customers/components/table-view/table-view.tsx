import { type FC } from "react";

import {
  EditButton,
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
import { PaginationTotal, Text } from "@/components";
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

  const { selectProps: distributorSelectProps, query: distributorQueryResult } =
    useSelect({
      resource: "profiles",
      optionLabel: "username",
      optionValue: "id",
      filters: [
        {
          field: "role",
          operator: "eq",
          value: "distributor",
        },
        // {
        //   field: "id",
        //   operator: "in",
        //   value: tableQueryResult?.data
        //     ?.filter((item: any) => !!item.distributor_id)
        //     .map((item: any) => item.distributor_id),
        // },
      ],
      meta: {
        select: "id, username",
      },
      queryOptions: {
        enabled: !!tableQueryResult,
      },
    });

  const { selectProps: salesSelectProps, query: salesQueryResult } = useSelect({
    resource: "profiles",
    optionLabel: "username",
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "sales",
      },
      // {
      //   field: "id",
      //   operator: "in",
      //   value: tableQueryResult?.data
      //     ?.filter((item: any) => !!item.sales_id)
      //     .map((item: any) => item.sales_id),
      // },
    ],
    meta: {
      select: "id, username",
    },
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
              placeholder="Filter Distributors"
              {...distributorSelectProps}
            />
          </FilterDropdown>
        )}
        render={(value) =>
          (distributorQueryResult?.data &&
            distributorQueryResult?.data.data.find((item) => item.id === value)
              ?.username) ||
          "-"
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
              placeholder="Filter sales"
              {...salesSelectProps}
            />
          </FilterDropdown>
        )}
        render={(value) =>
          (salesQueryResult?.data &&
            salesQueryResult?.data.data.find((item) => item.id === value)
              ?.username) ||
          "-"
        }
      />

      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="total_amt"
        title="Total"
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="pending_amt"
        title="Pending"
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="received_amt"
        title="Received"
        render={(value) => <div>{value}</div>}
      />

      <Table.Column
        dataIndex="action"
        render={(_, record) => (
          <Button
            type="primary"
            onClick={() =>
              go({
                to: `/clients/customers/challans/${record.id}`,
              })
            }
          >
            Challan's
          </Button>
        )}
      />
      <Table.Column
        dataIndex="action"
        render={(_, record) => (
          <EditButton hideText resource="customers" recordItemId={record.id} />
        )}
      />
    </Table>
  );
};
