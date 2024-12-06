import React, { useEffect } from "react";
import { Flex, Form, Input, Select, Skeleton, Table, Typography } from "antd";
import {
  DateField,
  FilterDropdown,
  List,
  ShowButton,
  getDefaultSortOrder,
  useModal,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { useList, useUpdate } from "@refinedev/core";
import { SearchOutlined } from "@ant-design/icons";
import { Database } from "@/utilities";
import { PaginationTotal, Text } from "@/components";

export const ChallanList = ({ sales }: { sales?: boolean }) => {
  const [IdToUpdateReceived, setIdToUpdateReceived] = React.useState<any>(null);
  const [userFilters, setUserFilters] = React.useState<any>(null);
  const { tableProps, tableQueryResult, sorter, filters } = useTable<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
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
    filters: userFilters ? [{
      field: userFilters.userType,
      operator: "eq",
      value: userFilters.userId,
    }] : [],
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
  const [form] = Form.useForm();
  const { close, modalProps, show } = useModal();
  const { mutate, isLoading } = useUpdate<any>();
  form.submit = async () => {
    mutate({
      resource: "challan",
      id: IdToUpdateReceived,
      values: {
        received_amt:
          tableQueryResult.data?.data.find(
            (item) => item.id === IdToUpdateReceived
          )?.received_amt + form.getFieldValue("received_amt"),
      },
    });
    close();
    form.resetFields();
    setIdToUpdateReceived(null);
  };
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
          render={(row) => (
            <div style={{ display: "flex", gap: "10px" }}>
              <ShowButton recordItemId={row.id} />
            </div>
          )}
        />
      </Table>
    </List>
  );
};
