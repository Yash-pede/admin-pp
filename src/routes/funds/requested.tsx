import { Database } from "@/utilities";
import { transactionStatusColor } from "@/utilities/functions";
import { SearchOutlined } from "@ant-design/icons";
import {
  DateField,
  EditButton,
  FilterDropdown,
  getDefaultFilter,
  SaveButton,
  useEditableTable,
  useSelect,
} from "@refinedev/antd";
import { useGetIdentity, useList } from "@refinedev/core";
import { Button, Form, Select, Skeleton, Space, Table, Tag } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React from "react";

export const FundsRequested = () => {
  const { data: user } = useGetIdentity<any>();
  const {
    tableQueryResult,
    tableProps,
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
              field: "to_user_id",
              operator: "eq",
              value: user?.id,
            },
          ],
        },
        {
          field: "status",
          operator: "eq",
          value: "Requested",
        },
      ],
    },
    queryOptions: {
      enabled: !!user?.id,
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
          .filter((item) => item.from_user_id)
          .map((item) => item.from_user_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });

  const { selectProps } = useSelect({
    resource: "profiles",
    optionLabel: "username",
    optionValue: "id",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "distributor",
      },
    ],
    defaultValue: getDefaultFilter("profiles.username", filters, "in"),
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
            title: "From",
            dataIndex: "from_user_id",
            filterIcon: <SearchOutlined />,
            filterDropdown: (props) => (
              <FilterDropdown {...props} mapValue={(value) => value}>
                <Select
                  style={{ minWidth: 200 }}
                  mode="multiple"
                  {...selectProps}
                />
              </FilterDropdown>
            ),
            render: (value) => {
              return isProfileLoading ? (
                <Skeleton.Button active />
              ) : (
                <div>
                  {profiles?.data.find((item) => item.id === value)?.username}
                </div>
              );
            },
          },
          {
            title: "Amount",
            dataIndex: "amount",
            render: (value) => <div>{value}</div>,
          },
          {
            title: "Description",
            dataIndex: "description",
            render: (value, record) => {
              if (isEditing(record.id))
                return (
                  <Form.Item name="description" style={{ margin: 0 }}>
                    <TextArea rows={4} />
                  </Form.Item>
                );

              return <div>{value}</div>;
            },
          },

          {
            title: "Status",
            dataIndex: "status",
            key: "status",
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
            render: (value) => <DateField value={value} />,
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
