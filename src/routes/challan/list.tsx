import React, { useEffect } from "react";
import { Button, Flex, Input, Select, Skeleton, Table } from "antd";
import {
  CreateButton,
  DateField,
  FilterDropdown,
  List,
  ShowButton,
  getDefaultSortOrder,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import {
  FilePdfFilled,
  PullRequestOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Database } from "@/utilities";
import { PaginationTotal, Text } from "@/components";
import { useGo } from "@refinedev/core";
import { IconTrash } from "@tabler/icons-react";

export const ChallanList = ({ sales }: { sales?: boolean }) => {
  const go = useGo();
  const [userFilters, setUserFilters] = React.useState<any>(null);
  const { tableProps, tableQueryResult, sorter, filters } = useTable<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    filters: {
      permanent: [
        {
          field: "status",
          operator: "eq",
          value: "BILLED",
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });
  useEffect(() => {
    if (tableQueryResult.data?.data) {
      filters.map((item: any) => {
        if (
          item.field === "customer_id" ||
          item.field === "sales_id" ||
          item.field === "distributor_id"
        ) {
          setUserFilters({
            userType: item.field,
            userId: item.value,
          });
        }
      });
    }
  }, [tableQueryResult.data?.data]);

  const { data: ChallansAmt, isFetching: isFetchingChallansAmt } = useList<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    resource: "challan",
    pagination: {
      current: 1,
      pageSize: 1000,
    },
    filters: userFilters
      ? [
          {
            field: userFilters.userType,
            operator: "eq",
            value: userFilters.userId,
          },
          {
            field: "status",
            operator: "eq",
            value: "BILLED",
          },
        ]
      : [
          {
            field: "status",
            operator: "eq",
            value: "BILLED",
          },
        ],
    queryOptions: {
      meta: {
        select: "id, total_amt, received_amt, pending_amt",
      },
    },
  });

  const { data: Customers, isLoading: isLoadingCustomers } = useList<
    Database["public"]["Tables"]["customers"]["Row"]
  >({
    resource: "customers",
    pagination: {
      current: 1,
      pageSize: 1000,
    },
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
      enabled: !!tableQueryResult.data,
    },
  });

  const { selectProps: customerSelectProps } = useSelect<
    Database["public"]["Tables"]["customers"]["Row"]
  >({
    resource: "customers",
    optionLabel: "full_name",
    optionValue: "id",
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
      enabled: !!tableQueryResult.data,
    },
  });

  const { selectProps: distributorSelectProps } = useSelect<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    optionLabel: "full_name",
    optionValue: "id",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data
          .filter((item) => item.distributor_id)
          .map((item) => item.distributor_id),
      },
      {
        field: "role",
        operator: "eq",
        value: "distributor",
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });

  const { selectProps: salesSelectProps } = useSelect<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    optionLabel: "full_name",
    optionValue: "id",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data
          .filter((item) => item.sales_id)
          .map((item) => item.sales_id),
      },
      {
        field: "role",
        operator: "eq",
        value: "sales",
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });

  const { data: profiles, isLoading: isProfileLoading } = useList<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    pagination: {
      current: 1,
      pageSize: 1000,
    },
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data
          .filter((item) => item.sales_id || item.distributor_id)
          .map((item) => item.sales_id || item.distributor_id),
      },
    ],
    meta: {
      fields: ["id", "username"],
    },
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });

  return (
    <List
      canCreate={false}
      headerButtons={[
        <CreateButton />,
        <Button onClick={() => go({ to: "/challan/req-deletion" })}>
          <PullRequestOutlined /> Req Deletion
        </Button>,
        <Button onClick={() => go({ to: "/challan/deleted" })}>
          <IconTrash /> Deleted
        </Button>,
      ]}
    >
      <Flex justify="space-between" align="center" gap={2}>
        <Text size="xl" style={{ marginBottom: 10 }}>
          Total:{" "}
          {ChallansAmt?.data.reduce((a, b) => a + b.total_amt, 0).toFixed(2)}
        </Text>
        <Text size="xl" style={{ marginBottom: 10 }}>
          Pending:{" "}
          {ChallansAmt?.data.reduce((a, b) => a + b.pending_amt, 0).toFixed(2)}
        </Text>
        <Text size="xl" style={{ marginBottom: 10 }}>
          Received:{" "}
          {ChallansAmt?.data.reduce((a, b) => a + b.received_amt, 0).toFixed(2)}
        </Text>
      </Flex>
      <Table
        {...tableProps}
        rowKey="id"
        bordered
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: ["12", "24", "48", "96"],
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="challans" />
          ),
        }}
      >
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("id", sorter)}
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Input />
            </FilterDropdown>
          )}
          dataIndex="id"
          title="ID"
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("total_amt", sorter)}
          dataIndex="total_amt"
          title="Total"
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("pending_amt", sorter)}
          dataIndex="pending_amt"
          title="Pending"
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("received_amt", sorter)}
          dataIndex="received_amt"
          title="Received"
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("customer_id", sorter)}
          dataIndex="customer_id"
          title="customer"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Select {...customerSelectProps} style={{ width: 200 }} />
            </FilterDropdown>
          )}
          render={(value) => {
            if (isLoadingCustomers) return <Skeleton.Button />;
            return (
              <Text>
                {
                  Customers?.data?.find((customer) => customer.id === value)
                    ?.full_name
                }
              </Text>
            );
          }}
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("sales_id", sorter)}
          dataIndex="sales_id"
          title="sales"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Select {...salesSelectProps} style={{ width: 200 }} />
            </FilterDropdown>
          )}
          render={(value) => {
            if (isProfileLoading) return <Skeleton.Button />;
            return (
              <Text>
                {
                  profiles?.data?.find((profile) => profile.id === value)
                    ?.username
                }
              </Text>
            );
          }}
        />
        <Table.Column<Database["public"]["Tables"]["challan"]["Row"]>
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("distributor_id", sorter)}
          dataIndex="distributor_id"
          title="Distributor"
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props} mapValue={(value) => value}>
              <Select {...distributorSelectProps} style={{ width: 200 }} />
            </FilterDropdown>
          )}
          render={(value) => {
            if (isProfileLoading) return <Skeleton.Button />;
            return (
              <Text>
                {
                  profiles?.data?.find((profile) => profile.id === value)
                    ?.username
                }
              </Text>
            );
          }}
        />
        <Table.Column
          sorter={{ multiple: 2 }}
          defaultSortOrder={getDefaultSortOrder("created_at", sorter)}
          dataIndex="created_at"
          title="Created At"
          render={(value) => <DateField value={value} />}
        />
        <Table.Column
          title="Action"
          render={(row, record) => (
            <div style={{ display: "flex", gap: "10px" }}>
              <ShowButton recordItemId={row.id} hideText />
              <Button
                type="primary"
                onClick={() => go({ to: `/challan/pdf/${record.id}` })}
                variant="link"
                color="default"
                icon
              >
                <FilePdfFilled />{" "}
              </Button>
            </div>
          )}
        />
      </Table>
    </List>
  );
};
