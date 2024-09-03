import { PaginationTotal } from "@/components";
import { Database } from "@/utilities";
import { CheckCircleFilled, SearchOutlined } from "@ant-design/icons";
import { FilterDropdown, getDefaultSortOrder, Show, useTable } from "@refinedev/antd";
import { useGo } from "@refinedev/core";
import { IconX } from "@tabler/icons-react";
import { Button, Input, Table } from "antd";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";

export const Targets = ({children}: any) => {
  const go = useGo();
  const{pathname} = useLocation();

  const { tableProps, sorters } = useTable<
    Database["public"]["Tables"]["targets"]["Row"]
  >({
    resource: "targets",
    filters: {
      permanent: [
        {
          field: "user_id",
          operator: "eq",
          value: pathname.split("/").pop(),
        },
        {
          field: "year",
          operator: "eq",
          value: dayjs().year(),
        },
      ],
    },
    sorters: {
      initial: [
        { field: "month", order: "desc" },
        { field: "year", order: "desc" },
      ],
    },
  });

  return (
    <Show headerButtons={[
      <Button onClick={() => go({ to: `/administration/reports/targets/create`,query: { user_id: pathname.split("/").pop() } })}>Create Target</Button>
    ]}>
      <Table
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: ["12", "24", "48", "96"],
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="targets" />
          ),
        }}
      >
        <Table.Column
          dataIndex="total"
          title="Total"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("total", sorters)}
          render={(value) => {
            return <span>{value}</span>;
          }}
        />
        <Table.Column
          dataIndex="target"
          title="Target"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("target", sorters)}
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Input placeholder="Enter Target" />
            </FilterDropdown>
          )}
          render={(value) => {
            return <span>{value}</span>;
          }}
        />
        <Table.Column
          dataIndex="month"
          title="Month"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Input placeholder="Enter Month" />
            </FilterDropdown>
          )}
          render={(value) => {
            return <span>{value}</span>;
          }}
        />{" "}
        <Table.Column
          dataIndex="year"
          title="Year"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("year", sorters)}
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Input placeholder="Enter Year" />
            </FilterDropdown>
          )}
          render={(value) => {
            return <span>{value}</span>;
          }}
        />
        <Table.Column<Database["public"]["Tables"]["targets"]["Row"]>
          title="Percentage"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("total", sorters)}
          render={(_, record) => {
            return (
              <span>
                {((record?.total / (record?.target ?? 0)) * 100).toFixed(2)}%
              </span>
            );
          }}
        />
        <Table.Column
          dataIndex="acheived"
          title="Acheived"
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("achieved", sorters)}
          render={(value) => {
            return value ? <CheckCircleFilled /> : <IconX fill="red" />;
          }}
        />
      </Table>
      {children}
    </Show>
  );
};

export default Targets;
