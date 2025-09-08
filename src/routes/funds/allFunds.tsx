import { Text } from "@/components";
import { TransactionList } from "@/routes/funds/components/transaction-list";
import { Database } from "@/utilities";
import { useList, useOne, useParsed } from "@refinedev/core";
import { Flex, Skeleton } from "antd";
import dayjs from "dayjs";

export const AllFunds = () => {
  const { params } = useParsed<any>();

  let range: {
    createdAt?: {
      gte?: string;
      lte?: string;
    };
  } = {};

  if (params.filterBy === "this-month") {
    range = {
      createdAt: {
        gte: dayjs().startOf("month").toISOString(),
        lte: dayjs().endOf("month").toISOString(),
      },
    };
  }

  if (params.filterBy === "last-month") {
    range = {
      createdAt: {
        gte: dayjs().subtract(1, "month").startOf("month").toISOString(),
        lte: dayjs().subtract(1, "month").endOf("month").toISOString(),
      },
    };
  }

  const { data: users, isLoading } = useList<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "distributor",
      },
    ],
  });

  const { data: transfers, isLoading: transfersLoading } = useList<
    Database["public"]["Tables"]["transfers"]["Row"]
  >({
    resource: "transfers",
    filters: [
      ...(range.createdAt?.gte
        ? [
            {
              field: "created_at",
              operator: "gte" as const,
              value: range.createdAt.gte,
            },
          ]
        : []),
      ...(range.createdAt?.lte
        ? [
            {
              field: "created_at",
              operator: "lte" as const,
              value: range.createdAt.lte,
            },
          ]
        : []),
      {
        field: "status",
        operator: "eq" as const,
        value: "Credit",
      },
    ],
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    meta: {
      fields: ["amount"],
    },
    queryOptions: {
      enabled:
        params.filterBy === "this-month" || params.filterBy === "last-month",
    },
    pagination: {
      pageSize: 10000,
    },
  });

  const { data: adminFundData, isLoading: isFundLoading } = useOne<
    Database["public"]["Tables"]["funds"]["Row"]
  >({
    resource: "funds",
    id: import.meta.env.VITE_ADMIN_ID,
    meta: {
      fields: ["total_amt"],
    },
    queryOptions: {
      enabled: !(
        params.filterBy === "this-month" || params.filterBy === "last-month"
      ),
    },
  });

  if (!users?.data || isLoading) return <Skeleton active />;

  const collectionAmount =
    params.filterBy === "this-month" || params.filterBy === "last-month"
      ? transfers?.data?.reduce((acc, curr) => acc + curr.amount, 0) ?? 0
      : adminFundData?.data?.total_amt ?? 0;

  return (
    <Flex style={{ flexDirection: "column", gap: 16 }}>
      <Text size="lg">Collection : {Math.round(collectionAmount)}</Text>
      <TransactionList userIds={users?.data} range={range} statusEq="Credit" />
    </Flex>
  );
};
