import { Database } from "@/utilities";
import {
  getTransferColor,
  transactionStatusColor,
} from "@/utilities/functions";
import {
  DateField,
  EditButton,
  FilterDropdown,
  getDefaultSortOrder,
  SaveButton,
  useEditableTable,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Button, Form, Radio, Select, Space, Table, Tag } from "antd";
import TextArea from "antd/es/input/TextArea";

type Props = {
  userId: string;
};

export const TransactionList = (props: Props) => {
  const {
    tableProps,
    tableQueryResult,
    sorters,
    formProps,
    isEditing,
    filters,
    setId: setEditId,
    saveButtonProps,
    cancelButtonProps,
    editButtonProps,
  } = useEditableTable<Database["public"]["Tables"]["transfers"]["Row"]>({
    resource: "transfers",
    filters: {
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
        {
          field: "status",
          operator: "ne",
          value: "Requested",
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
    queryOptions: {
      enabled: !!props.userId,
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
        value: tableQueryResult.data?.data
          ?.filter((item: any) => !!item.from_user_id)
          .map((item: any) => item.from_user_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });

  const { data: UserProfile, isLoading: isUserProfileLoading } = useList<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    filters: [
      {
        field: "id",
        operator: "eq",
        value: props.userId,
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
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
            if (event.target.nodeName === "TD") {
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
                  UserProfile?.data.find((profile) => profile.id === value)
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
              <div>
                {
                  profiles?.data.find((profile) => profile.id === value)
                    ?.username
                }
              </div>
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
            title: "Date",
            dataIndex: "created_at",
            sorter: { multiple: 2 },
            defaultSortOrder: getDefaultSortOrder("id", sorters),
            render: (value) => <DateField value={value} format="DD/MM/YYYY" />,
          },
          {
            title: "Actions",
            dataIndex: "actions",
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
