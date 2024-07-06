import { Database } from "@/utilities";
import { getTransferColor } from "@/utilities/functions";
import { DateField, useTable } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Table, Tag } from "antd";
import React from "react";

type Props = {
  userId: string;
};

export const TransactionList = (props: Props) => {
  const { tableProps, tableQueryResult, filters } = useTable<
    Database["public"]["Tables"]["transfers"]["Row"]
  >({
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
          .filter((item) => item.to_user_id)
          .map((item) => item.to_user_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult.data,
    },
  });
  return (
    <Table
      {...tableProps}
      loading={isProfileLoading || tableProps.loading}
      columns={[
        {
          title: "From",
          dataIndex: "from_user_id",
          hidden: true,
          render: (value) => <div>{value}</div>,
        },
        {
          title: "Customer", hidden: true,
          dataIndex: "customer_id",
          render: (value) => <div>{value || "-    "}</div>,
        },
        {
          title: "To",
          dataIndex: "to_user_id",
          render: (value) => (
            <div>
              {profiles?.data.find((profile) => profile.id === value)?.username}
            </div>
          ),
        },
        {
          title: "Amount",
          dataIndex: "amount",
          render: (value) => <div>{value}</div>,
        },
        {
          title: "Description",
          dataIndex: "description",
          render: (value) => <div>{value}</div>,
        },

        {
          title: "Status",
          dataIndex: "status",
          render: (value) => <Tag color={getTransferColor(value)}>{value}</Tag>,
        },

        {
          title: "Date",
          dataIndex: "created_at",
          render: (value) => <DateField value={value} />,
        },
      ]}
    />
  );
};
