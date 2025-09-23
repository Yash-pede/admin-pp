import { Database } from "@/utilities";
import {
  DateField,
  FilterDropdown,
  getDefaultSortOrder,
  rangePickerFilterMapper,
  useTable,
} from "@refinedev/antd";
import { HttpError, getDefaultFilter, useList } from "@refinedev/core";
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
import { UserOutlined } from "@ant-design/icons";
import { getTransferColor } from "@/utilities/functions";
import { Text } from "./text";
import TextArea from "antd/lib/input/TextArea";

type Props = {
  style: React.CSSProperties;
  userId: string;
  isMobile?: boolean;
};

export const UserFundsTable = (props: Props) => {
  const { tableProps, filters, sorters, tableQueryResult } = useTable<
    Database["public"]["Tables"]["transfers"]["Row"]
  >({
    resource: "transfers",
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
          operator: "or",
          value: [
            {
              field: "from_user_id",
              operator: "eq",
              value: props.userId,
            },
            {
              field: "to_user_id",
              operator: "eq",
              value: props.userId,
            },
          ],
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
          ...(tableQueryResult.data?.data
            .filter((item) => item.from_user_id)
            .map((item) => item.from_user_id) || []),
          ...(tableQueryResult.data?.data
            .filter((item) => item.to_user_id)
            .map((item) => item.to_user_id) || []),
        ],
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult,
    },
  });

  const { data: Customers, isLoading: isLoadingCustomers } = useList<
    Database["public"]["Tables"]["customers"]["Row"],
    HttpError
  >({
    resource: "customers",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data
          .filter((item) => item.customer_id)
          .map((item) => item.customer_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult,
    },
  });

  return (
    <Card
      style={props.style}
      className="page-container"
      headStyle={{
        borderBottom: "1px solid #D9D9D9",
        marginBottom: "1px",
      }}
      bodyStyle={{ padding: 0 }}
      title={
        <Space size="middle">
          <UserOutlined />
          <Text>Funds</Text>
        </Space>
      }
    >
      <Table
        {...tableProps}
        rowKey="id"
        scroll={{ x: true }}
        pagination={{
          ...tableProps.pagination,
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="Funds" />
          ),
        }}
      >
        <Table.Column dataIndex="id" title="ID" />

        <Table.Column<Database["public"]["Tables"]["transfers"]["Row"]>
          dataIndex="to_user_id"
          title="To User"
          render={(_, record) => {
            if (isLoadingUsers) return <Skeleton.Button size="small" />;
            return (
              users?.data.find((user) => user.id === record.to_user_id)
                ?.username || "-"
            );
          }}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input />
            </FilterDropdown>
          )}
        />
        <Table.Column<Database["public"]["Tables"]["transfers"]["Row"]>
          dataIndex="from_user_id"
          title="From User"
          render={(_, record) => {
            if (isLoadingUsers) return <Skeleton.Button size="small" />;
            return (
              users?.data.find((user) => user.id === record.from_user_id)
                ?.username || "-"
            );
          }}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input />
            </FilterDropdown>
          )}
        />

        <Table.Column<Database["public"]["Tables"]["transfers"]["Row"]>
          dataIndex="status"
          title="Status"
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Radio.Group>
                <Radio value="Credit">Credit</Radio>
                <Radio value="Debit">Debit</Radio>
                <Radio value="Approved">Approved</Radio>
              </Radio.Group>
            </FilterDropdown>
          )}
          render={(value) => <Tag color={getTransferColor(value)}>{value}</Tag>}
        />

        <Table.Column<Database["public"]["Tables"]["transfers"]["Row"]>
          dataIndex="amount"
          title="Amount"
          render={(value) => <Text>{value}</Text>}
        />
        <Table.Column<Database["public"]["Tables"]["transfers"]["Row"]>
          dataIndex="customer_id"
          title="Customer"
          render={(value) => (
            <Text>
              {Customers?.data.find((c) => c.id === value)?.full_name}
            </Text>
          )}
        />

        <Table.Column<Database["public"]["Tables"]["transfers"]["Row"]>
          dataIndex="description"
          title="Description"
          render={(value) => <TextArea rows={2} value={value}></TextArea>}
        />
        <Table.Column<Database["public"]["Tables"]["transfers"]["Row"]>
          dataIndex="created_at"
          title="Date & Time"
          render={(value) => (
            <DateField
              style={{ verticalAlign: "middle" }}
              value={value}
              format="hh:mm MM.DD.YYYY"
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
