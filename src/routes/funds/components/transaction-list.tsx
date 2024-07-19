import { Database } from "@/utilities";
import { getTransferColor } from "@/utilities/functions";
import {
  DateField,
  FilterDropdown,
  getDefaultSortOrder,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Radio, Select, Table, Tag } from "antd";

type Props = {
  userId: string;
};

export const TransactionList = (props: Props) => {
  const { tableProps, tableQueryResult, sorters } = useTable<
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
    <Table
      {...tableProps}
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
              {profiles?.data.find((profile) => profile.id === value)?.username}
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
          render: (value) => <div>{value}</div>,
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
          render: (value) => <Tag color={getTransferColor(value)}>{value}</Tag>,
        },

        {
          title: "Date",
          dataIndex: "created_at",
          sorter: { multiple: 2 },
          defaultSortOrder: getDefaultSortOrder("id", sorters),
          render: (value) => <DateField value={value} />,
        },
      ]}
    />
  );
};
