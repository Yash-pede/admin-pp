import { type FC } from "react";

import { FilterDropdown, TextField } from "@refinedev/antd";
import {
  type CrudFilters,
  type CrudSorting,
  getDefaultFilter,
  useList,
} from "@refinedev/core";

import { SearchOutlined } from "@ant-design/icons";
import { Input, Table, type TableProps } from "antd";
import { PaginationTotal } from "@/components";
import { Database } from "@/utilities";
import { banUser } from "@/utilities/functions";

type Props = {
  tableProps: TableProps<Database["public"]["Tables"]["customers"]["Row"]>;
  filters: CrudFilters;
  sorters: CrudSorting;
  tableQueryResult: any;
};

export const CustomersTableView: FC<Props> = ({
  tableProps,
  filters,
  tableQueryResult,
}) => {
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
  const { data: salesProfile, isLoading: isLoadingSalesProfile } =
    useList<Database["public"]["Tables"]["profiles"]["Row"]>({
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
        hidden
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="full_name"
        title="Name"
        defaultFilteredValue={getDefaultFilter("username", filters)}
        filterIcon={<SearchOutlined />}
        filterDropdown={(props) => (
          <FilterDropdown {...props}>
            <Input placeholder="Search UserName" />
          </FilterDropdown>
        )}
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
        render={(value) => <TextField value={"+91 " + value} />}
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="distributor_id"
        title="Distributor"
        render={(value) =>
          distributorsProfile?.data.find((item) => item.id === value)
            ?.username || "-"
        }
      />
      <Table.Column<Database["public"]["Tables"]["customers"]["Row"]>
        dataIndex="sales_id"
        title="Sales"
        render={(value) =>
          salesProfile?.data.find((item) => item.id === value)
            ?.username || "-"
        }
      />
    </Table>
  );
};
