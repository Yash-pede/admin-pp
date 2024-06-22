import { Database } from "@/utilities";
import {
  DateField,
  FilterDropdown,
  List,
  getDefaultSortOrder,
  rangePickerFilterMapper,
  useTable,
} from "@refinedev/antd";
import { HttpError, getDefaultFilter, useList, useOne } from "@refinedev/core";
import {
  Card,
  DatePicker,
  Input,
  Radio,
  Skeleton,
  Space,
  Table,
  Tag,
} from "antd";
import React from "react";
import { PaginationTotal } from "./pagination-total";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { getActionColor, isValidUUID } from "@/utilities/functions";
import { ActionCell } from "@/routes/audit-log/components/action-cell";
import { Text } from "./text";

type Props = {
  style: React.CSSProperties;
  userId: string;
};

export const UserActivitesTable = (props: Props) => {
  const { tableProps, filters, sorters, tableQueryResult } = useTable<
    Database["public"]["Tables"]["logs"]["Row"]
  >({
    resource: "logs",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
    },
    pagination: {
      pageSize: 10,
    },
    filters: {
      mode: "server",
      permanent: [
        {
          field: "author",
          operator: "eq",
          value: props.userId,
        },
      ],
    },
  });
  const { data: users, isLoading: isLoadingUsers } = useList<
    Database["public"]["Tables"]["profiles"]["Row"],
    HttpError
  >({
    resource: "profiles",
    filters: [
      {
        field: "id",
        operator: "in",
        value: [
          tableQueryResult.data?.data.map((item) => item.author),
          tableQueryResult.data?.data
            .filter((item: any) => item.meta && isValidUUID(item.meta?.id))
            .map((item: any) => item.meta?.id as string),
        ],
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult,
    },
  });

  const { data: Products, isLoading: isLoadingProducts } = useList<
    Database["public"]["Tables"]["products"]["Row"],
    HttpError
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data
          .filter(
            (item: any) => item.meta && !isValidUUID(item.meta?.id as string)
          )
          .map((item: any) => item.meta?.id as string),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult,
    },
  });

  return (
    <Card
      style={props.style}
      headStyle={{
        borderBottom: "1px solid #D9D9D9",
        marginBottom: "1px",
      }}
      bodyStyle={{ padding: 0 }}
      title={
        <Space size="middle">
          <UserOutlined />
          <Text>Activites</Text>
        </Space>
      }
    >
      <Table
        className="audit-log-table"
        {...tableProps}
        rowKey="id"
        scroll={{ x: true }}
        pagination={{
          ...tableProps.pagination,
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="audit logs" />
          ),
        }}
      >
        <Table.Column dataIndex="id" title="ID" />
        <Table.Column
          dataIndex="author"
          title="User"
          width="15%"
          filterIcon={<SearchOutlined />}
          render={(_, record: Database["public"]["Tables"]["logs"]["Row"]) => {
            if (isLoadingUsers) return <Skeleton.Button size="small" />;
            return (
              users?.data.find((user) => user.id === record.author)?.username ||
              "admin"
            );
          }}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input />
            </FilterDropdown>
          )}
        />
        <Table.Column
          dataIndex="action"
          title="Action"
          render={(_, record: Database["public"]["Tables"]["logs"]["Row"]) => {
            return (
              <Space>
                <Tag color={getActionColor(record.action)}>
                  {record.action.charAt(0) +
                    record.action.slice(1).toLowerCase()}
                </Tag>
              </Space>
            );
          }}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Radio.Group>
                <Radio value="create">Created</Radio>
                <Radio value="update">Updated</Radio>
                <Radio value="delete">Deleted</Radio>
              </Radio.Group>
            </FilterDropdown>
          )}
          defaultFilteredValue={getDefaultFilter("action", filters, "eq")}
        />
        <Table.Column
          dataIndex="resource"
          title="Resource"
          render={(value) => <Text>{value}</Text>}
        />
        <Table.Column
          dataIndex="meta"
          title="Entity"
          render={(value) => (
            <Text>
              {isValidUUID(value?.id)
                ? users?.data.find((user) => user.id === value?.id)?.username
                : Products?.data.find((product) => product.id === value?.id)
                    ?.name || "-"}
            </Text>
          )}
        />
        <Table.Column<Database["public"]["Tables"]["logs"]["Row"]>
          dataIndex="changes"
          title="Changes"
          render={(_, record) => <ActionCell record={record} />}
        />
        <Table.Column
          dataIndex="createdAt"
          title="Date & Time"
          width="15%"
          render={(value) => (
            <DateField
              style={{ verticalAlign: "middle" }}
              value={value}
              format="MM.DD.YYYY - hh:mm"
            />
          )}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={rangePickerFilterMapper}>
              <DatePicker.RangePicker />
            </FilterDropdown>
          )}
          sorter
          defaultFilteredValue={getDefaultFilter(
            "createdAt",
            filters,
            "between"
          )}
          defaultSortOrder={getDefaultSortOrder("createdAt", sorters)}
        />
      </Table>
    </Card>
  );
};
