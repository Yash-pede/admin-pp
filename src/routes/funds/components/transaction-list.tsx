import { Database } from "@/utilities";
import { transactionStatusColor } from "@/utilities/functions";
import {
  DateField,
  EditButton,
  FilterDropdown,
  getDefaultSortOrder,
  SaveButton,
  useEditableTable,
  useSelect,
} from "@refinedev/antd";
import { CrudFilters, useGo, useList } from "@refinedev/core";
import { Button, Form, Radio, Select, Space, Table, Tag } from "antd";
import TextArea from "antd/es/input/TextArea";

type Props = {
  userId?: string;
  userIds?: Database["public"]["Tables"]["profiles"]["Row"][];
  statusNeq?: string;
  statusEq?: string;
  range?: {
    createdAt?: {
      gte?: string;
      lte?: string;
    };
  };
  canEdit?: boolean;
};

export const TransactionList = (props: Props) => {
  const go = useGo();
  const TransactionFilters: CrudFilters = [];
  if (props.userIds) {
    TransactionFilters.push({
      operator: "or",
      value: [
        {
          field: "from_user_id",
          operator: "in",
          value: props.userIds?.map((user) => user.id),
        },
        {
          field: "to_user_id",
          operator: "in",
          value: props.userIds?.map((user) => user.id),
        },
      ],
    });
  }

  if (props.userId) {
    TransactionFilters.push({
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
    });
  }
  if (props.statusNeq) {
    TransactionFilters.push({
      field: "status",
      operator: "ne",
      value: props.statusNeq,
    });
  }
  if (props.statusEq) {
    TransactionFilters.push({
      field: "status",
      operator: "eq",
      value: props.statusEq,
    });
  }
  if (props.range) {
    if (props.range.createdAt) {
      if (props.range.createdAt.gte) {
        TransactionFilters.push({
          field: "created_at",
          operator: "gte",
          value: props.range.createdAt.gte,
        });
      }
      if (props.range.createdAt.lte) {
        TransactionFilters.push({
          field: "created_at",
          operator: "lte",
          value: props.range.createdAt.lte,
        });
      }
    }
  }

  const {
    tableProps,
    tableQueryResult,
    sorters,
    formProps,
    isEditing,
    setId: setEditId,
    saveButtonProps,
    cancelButtonProps,
    editButtonProps,
  } = useEditableTable<Database["public"]["Tables"]["transfers"]["Row"]>({
    resource: "transfers",
    filters: {
      permanent: TransactionFilters,
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

  const { data: profiles, isLoading: isProfileLoading } = useList<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    filters: [
      {
        field: "id",
        operator: "in",
        value: [
          ...(tableQueryResult.data && tableQueryResult.data.data
            ? tableQueryResult.data.data
                .filter(
                  (item: Database["public"]["Tables"]["transfers"]["Row"]) =>
                    !!item.from_user_id
                )
                .map(
                  (item: Database["public"]["Tables"]["transfers"]["Row"]) =>
                    item.from_user_id
                )
            : []),
          ...(tableQueryResult.data && tableQueryResult.data.data
            ? tableQueryResult.data.data
                .filter(
                  (item: Database["public"]["Tables"]["transfers"]["Row"]) =>
                    !!item.to_user_id
                )
                .map(
                  (item: Database["public"]["Tables"]["transfers"]["Row"]) =>
                    item.to_user_id
                )
            : []),
        ],
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });

  const { data: customers, isLoading: isCustomerLoading } = useList<
    Database["public"]["Tables"]["customers"]["Row"]
  >({
    resource: "customers",
    filters: [
      {
        field: "id",
        operator: "in",
        value: [
          ...(tableQueryResult.data && tableQueryResult.data.data
            ? tableQueryResult.data.data
                .filter(
                  (item: Database["public"]["Tables"]["transfers"]["Row"]) =>
                    !!item.customer_id
                )
                .map(
                  (item: Database["public"]["Tables"]["transfers"]["Row"]) =>
                    item.customer_id
                )
            : []),
          ...(tableQueryResult.data && tableQueryResult.data.data
            ? tableQueryResult.data.data
                .filter(
                  (item: Database["public"]["Tables"]["transfers"]["Row"]) =>
                    !!item.customer_id
                )
                .map(
                  (item: Database["public"]["Tables"]["transfers"]["Row"]) =>
                    item.customer_id
                )
            : []),
        ],
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
    meta: {
      fields: ["id", "full_name"],
    },
  });

  const { selectProps: selectPropsProfile } = useSelect({
    resource: "profiles",
    defaultValue: props.userId,
    optionLabel: "username",
    optionValue: "id",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult.data?.data
          ?.filter((item: any) => !!item.from_user_id)
          .map((item: any) => item.from_user_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });

  return (
    <Form {...formProps}>
      <Table
        {...tableProps}
        rowKey="id"
        onRow={(record) => ({
          // eslint-disable-next-line
          onClick: (event: any) => {
            if (props.canEdit && event.target.nodeName === "TD") {
              setEditId && setEditId(record.id);
            }
          },
        })}
        loading={isProfileLoading || tableProps.loading}
        columns={[
          {
            title: "Customer",
            hidden: true,
            dataIndex: "customer_id",
            render: (value) => <div>{value || "-    "}</div>,
          },
          {
            title: "To",
            dataIndex: "to_user_id",
            render: (value) => (
              <div>
                {
                  profiles?.data.find((profile) => profile.id === value)
                    ?.username
                }
              </div>
            ),
          },
          {
            title: "From",
            dataIndex: "from_user_id",
            filterDropdown: (props) => (
              <FilterDropdown {...props}>
                <Select
                  style={{ width: 200 }}
                  mode="multiple"
                  placeholder="Select user"
                  {...selectPropsProfile}
                />
              </FilterDropdown>
            ),
            render: (value) => (
              <Button type="link" style={{ padding: 0 }} onClick={() => go({to:`/funds/${value}`})}>
                {
                  profiles?.data.find((profile) => profile.id === value)
                    ?.username
                }
              </Button>
            ),
          },
          {
            title: "Amount",
            dataIndex: "amount",
            sorter: { multiple: 2 },
            defaultSortOrder: getDefaultSortOrder("id", sorters),
            render: (value) => <div>{value}</div>,
          },
          {
            title: "Description",
            dataIndex: "description",
            render: (value, record) => {
              if (isEditing(record.id))
                return (
                  <Form.Item name="description" style={{ margin: 0 }}>
                    <TextArea rows={1} />
                  </Form.Item>
                );

              return <div>{value}</div>;
            },
          },

          {
            title: "Status",
            dataIndex: "status",
            filterDropdown: (props) => (
              <FilterDropdown {...props}>
                <Radio.Group>
                  <Radio value="Credit">Credit</Radio>
                  <Radio value="Debit">Debit</Radio>
                  <Radio value="Approved">Approved</Radio>
                </Radio.Group>
              </FilterDropdown>
            ),
            render: (value, record) => {
              if (isEditing(record.id)) {
                return (
                  <Form.Item name="status" style={{ margin: 0 }}>
                    <Select
                      style={{ width: "100%" }}
                      options={[
                        {
                          title: "Approved",
                          value: "Approved",
                        },
                        {
                          title: "Requested",
                          value: "Requested",
                        },
                      ]}
                    />
                  </Form.Item>
                );
              }
              return (
                <Button
                  type="primary"
                  size="small"
                  style={{
                    backgroundColor: transactionStatusColor(value),
                  }}
                >
                  {value}
                </Button>
              );
            },
          },
          {
            title: "Customer",
            dataIndex: "customer_id",
            render: (value) => {
              return (
                <div>
                  {
                    customers?.data.find((customer) => customer.id === value)
                      ?.full_name
                  }
                </div>
              );
            },
          },

          {
            title: "Date",
            dataIndex: "created_at",
            sorter: { multiple: 2 },
            defaultSortOrder: getDefaultSortOrder("id", sorters),
            render: (value) => <DateField value={value} format="DD/MM/YYYY" />,
          },
          {
            title: "Actions",
            dataIndex: "actions",
            hidden: !props.canEdit,
            render: (_, record) => {
              if (isEditing(record.id)) {
                return (
                  <Space>
                    <SaveButton {...saveButtonProps} hideText size="small" />
                    <Button {...cancelButtonProps} size="small">
                      Cancel
                    </Button>
                  </Space>
                );
              }
              return (
                <EditButton
                  {...editButtonProps(record.id)}
                  hideText
                  size="small"
                />
              );
            },
          },
        ]}
      />
    </Form>
  );
};
