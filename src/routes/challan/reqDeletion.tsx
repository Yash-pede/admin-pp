import {
  Button,
  Flex,
  Input,
  Select,
  Skeleton,
  Space,
  Table,
  Tooltip,
} from "antd";
import {
  DateField,
  FilterDropdown,
  List,
  ShowButton,
  getDefaultSortOrder,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { useList, useUpdate } from "@refinedev/core";
import {
  CheckOutlined,
  CloseOutlined,
  FilePdfFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { Database } from "@/utilities";
import { PaginationTotal, Text } from "@/components";
import { useGo } from "@refinedev/core";

export const ReqDeletionChallan = ({ sales }: { sales?: boolean }) => {
  const go = useGo();
  const { tableProps, tableQueryResult, sorter } = useTable<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    filters: {
      permanent: [
        {
          field: "status",
          operator: "eq",
          value: "DELETED",
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
    <List canCreate={false} breadcrumb={false} title="Deleted Challans">
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
