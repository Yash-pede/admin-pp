import {
  DateField,
  FilterDropdown,
  rangePickerFilterMapper,
  getDefaultSortOrder,
  List,
  useTable,
} from "@refinedev/antd";
import { HttpError, getDefaultFilter, useList } from "@refinedev/core";

import { SearchOutlined } from "@ant-design/icons";
import {
  DatePicker,
  Input,
  Radio,
  Skeleton,
  Space,
  Table,
  Tag,
  type TagProps,
} from "antd";

import { PaginationTotal, Text } from "@/components";

import { ActionCell } from "./components/action-cell";
import { Database } from "@/utilities";
import { isValidUUID } from "@/utilities/functions";

export type Audit = Database["public"]["Tables"]["logs"]["Row"];

const getActionColor = (action: string): TagProps["color"] => {
  switch (action) {
    case "create":
      return "green";
    case "update":
      return "cyan";
    case "delete":
      return "red";
    default:
      return "default";
  }
};

export const AuditLogList = () => {
  const { tableProps, filters, sorters, tableQueryResult } = useTable<Audit>({
    resource: "logs",
    sorters: {
      initial: [{ field: "created_at", order: "desc" }],
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
            .filter((item) => item.meta && isValidUUID(item.meta?.id as string))
            .map((item) => item.meta?.id as string),
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
          .filter((item) => item.meta && !isValidUUID(item.meta?.id as string))
          .map((item) => item.meta?.id as string),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult,
    },
  });

  return (
    <div className="page-container">
      <List
        breadcrumb={false}
        contentProps={{ style: { marginTop: "1.6rem" } }}
        title={
          <Text
            style={{
              fontWeight: "500",
              fontSize: "24px",
              lineHeight: "24px",
            }}
          >
            Audit Log
          </Text>
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
            render={(_, record: Audit) => {
              if (isLoadingUsers) return <Skeleton.Button size="small" />;
              return (
                users?.data.find((user) => user.id === record.author)
                  ?.username || "admin"
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
            render={(_, record: Audit) => {
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
          <Table.Column<Audit>
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
      </List>
    </div>
  );
};
