import { type FC, useMemo } from "react";

import { DateField, useTable } from "@refinedev/antd";

import { PlusCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Card, Space, Table } from "antd";

import { Text } from "@/components";
import { Database } from "@/utilities";
import { HttpError, useGo } from "@refinedev/core";

export const SalesTable = ({
  distributorDetails,
}: {
  distributorDetails: Database["public"]["Tables"]["profiles"]["Row"];
}) => {
  const go = useGo();
  const {
    tableProps,
    tableQueryResult,
    searchFormProps,
    filters,
    sorters,
    setCurrent,
    setPageSize,
    setFilters,
  } = useTable<
    Database["public"]["Tables"]["profiles"]["Row"],
    HttpError,
    { name: string }
  >({
    resource: "profiles",
    filters: {
      mode: "server",
      permanent: [
        {
          field: "role",
          operator: "eq",
          value: "sales",
        },
        {
          field: "boss_id",
          operator: "eq",
          value: distributorDetails.id,
        },
      ],
    },
    onSearch: (values) => {
      return [
        {
          field: "username",
          operator: "contains",
          value: values.name,
        },
        {
          field: "full_name",
          operator: "contains",
          value: values.name,
        },
      ];
    },
    pagination: {
      pageSize: 12,
    },
  });

  const hasData = tableProps.loading
    ? true
    : (tableProps?.dataSource?.length || 0) > 0;

  const showResetFilters = useMemo(() => {
    return filters?.filter((filter) => {
      if ("field" in filter && filter.field === "company.id") {
        return false;
      }

      if (!filter.value) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <Card
      headStyle={{
        borderBottom: "1px solid #D9D9D9",
        marginBottom: "1px",
      }}
      bodyStyle={{ padding: 0 }}
      title={
        <Space size="middle">
          <TeamOutlined />
          <Text>Sales Person</Text>

          {showResetFilters?.length > 0 && (
            <Button size="small" onClick={() => setFilters([], "replace")}>
              Reset filters
            </Button>
          )}
        </Space>
      }
      extra={
        <>
          <Text className="tertiary">Total sales person: </Text>
          <Text strong>
            {tableProps?.pagination !== false && tableProps.pagination?.total}
          </Text>
        </>
      }
      actions={[
        <Button
          key={1}
          size="middle"
          type="dashed"
          onClick={() => {
            go({
              to: {
                action: "create",
                resource: "sales",
              },
              query: {
                distributorId: distributorDetails.id,
              },
            });
          }}
        >
          <Space size={"middle"}>
            <PlusCircleOutlined />
            <Text size="md">Add new sales person</Text>
          </Space>
        </Button>,
      ]}
    >
      {!hasData && (
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid #D9D9D9",
          }}
        >
          <Text>No Sales person yet</Text>
        </div>
      )}
      {hasData && (
        <Table
          {...tableProps}
          rowKey="id"
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: false,
          }}
          onRow={(record) => {
            return {
              onClick: () => {
                go({
                  to: {
                    action: "show",
                    resource: "sales",
                    id: record.id,
                  },
                  query: {
                    distributorId: distributorDetails.id,
                  },
                }); 
              },
            };
          }}
        >
          <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
            title="ID"
            dataIndex="id"
            hidden
            render={(value) => <Text>{value}</Text>}
          />
          <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
            title="Name"
            dataIndex="full_name"
            render={(value) => <Text>{value}</Text>}
          />
          <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
            title="Email"
            dataIndex="email"
            render={(value) => <Text>{value}</Text>}
          />
          <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
            title="Username"
            dataIndex="username"
            render={(value) => <Text>{value}</Text>}
          />
          <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
            title="Phone"
            dataIndex="phone"
            render={(value) => <Text>{value}</Text>}
          />
          <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
            title="Created at"
            dataIndex="created_at"
            render={(value) => <DateField value={value} format="LLL" />}
          />
        </Table>
      )}
    </Card>
  );
};
