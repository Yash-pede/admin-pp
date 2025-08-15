import { PaginationTotal, Text } from "@/components";
import { Database } from "@/utilities";
import { List, useTable } from "@refinedev/antd";
import { HttpError, useGo, useList } from "@refinedev/core";
import { Button, Flex, Table } from "antd";

export const MoneyList = () => {
  const go = useGo();
  const { data: ChallansAmt } = useList<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    resource: "challan",
    pagination: {
      current: 1,
      pageSize: 100000,
    },
    queryOptions: {
      meta: {
        select: "id, total_amt, received_amt, pending_amt, distributor_id",
      },
    },
  });

  const { tableProps, tableQueryResult } = useTable<
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
          value: "distributor",
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
    meta: {
      select: "id, username",
    },
    pagination: {
      pageSize: 12,
    },
  });

  const { data: funds } = useList<Database["public"]["Tables"]["funds"]["Row"]>(
    {
      resource: "funds",
      pagination: {
        current: 1,
        pageSize: 100000,
      },
      filters: [
        {
          field: "id",
          operator: "in",
          value: tableQueryResult.data?.data.map((item) => item.id),
        },
      ],
      queryOptions: {
        meta: {
          select: "id, total",
        },
      },
    }
  );
  return (
    <List canCreate={false}>
      <Flex justify="space-between" align="center" gap={2}>
        <Text size="xl" style={{ marginBottom: 10 }}>
          Total: {ChallansAmt?.data.reduce((a, b) => a + b.total_amt, 0)}
        </Text>
        <Text size="xl" style={{ marginBottom: 10 }}>
          Pending: {ChallansAmt?.data.reduce((a, b) => a + b.pending_amt, 0)}
        </Text>
        <Text size="xl" style={{ marginBottom: 10 }}>
          Received: {ChallansAmt?.data.reduce((a, b) => a + b.received_amt, 0)}
        </Text>
      </Flex>
      <Table
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: ["12", "24", "48", "96"],
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="profiles" />
          ),
        }}
        rowKey="id"
      >
        <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
          dataIndex="id"
          title="ID"
          hidden
          render={(value) => <div>{value}</div>}
        />
        <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
          dataIndex="username"
          title="Name"
          render={(value) => <div>{value}</div>}
        />
        <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
          title="Total"
          render={(_, record) => (
            <Text>
              {ChallansAmt?.data
                .filter((challan) => challan.distributor_id === record?.id)
                .reduce((a, b) => a + b.total_amt, 0)}
            </Text>
          )}
        />
        <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
          title="Received"
          render={(_, record) => (
            <Text>
              {ChallansAmt?.data
                .filter((challan) => challan.distributor_id === record?.id)
                .reduce((a, b) => a + b.received_amt, 0)}
            </Text>
          )}
        />
        <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
          title="Pending"
          render={(_, record) => (
            <Text>
              {ChallansAmt?.data
                .filter((challan) => challan.distributor_id === record?.id)
                .reduce((a, b) => a + b.pending_amt, 0)}
            </Text>
          )}
        />
        <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
          title="In Hand"
          render={(_, record) => (
            <Text>
              {funds?.data
                .filter((fund) => fund.id === record?.id)
                .reduce((a, b) => a + b.total, 0)}
            </Text>
          )}
        />
        <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
          title="Action"
          render={(_, record) => (
            <Button
              type="primary"
              onClick={() => {
                go({
                  to: "/funds/requested",
                  query: {
                    filters: [
                      {
                        field: "from_user_id",
                        operator: "eq",
                        value: record.id,
                      },
                    ],
                  },
                  type: "push",
                });
              }}
            >
              Request
            </Button>
          )}
        />
      </Table>
    </List>
  );
};
