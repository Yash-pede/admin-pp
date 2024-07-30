import { PaginationTotal } from "@/components";
import { Database } from "@/utilities";
import { CheckCircleFilled } from "@ant-design/icons";
import { Show, useTable } from "@refinedev/antd";
import { useGo } from "@refinedev/core";
import { IconX } from "@tabler/icons-react";
import { Button, Table } from "antd";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";

export const Targets = ({children}: any) => {
  const go = useGo();
  const{pathname} = useLocation();

  const { tableProps } = useTable<
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
          title="total"
          render={(value) => {
            return <span>{value}</span>;
          }}
        />
        <Table.Column
          dataIndex="target"
          title="Target"
          render={(value) => {
            return <span>{value}</span>;
          }}
        />
        <Table.Column
          dataIndex="month"
          title="Month"
          render={(value) => {
            return <span>{value}</span>;
          }}
        />{" "}
        <Table.Column
          dataIndex="year"
          title="Year"
          render={(value) => {
            return <span>{value}</span>;
          }}
        />
        <Table.Column<Database["public"]["Tables"]["targets"]["Row"]>
          title="Percentage"
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
