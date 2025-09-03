import { Text } from "@/components";
import { TransactionList } from "@/routes/funds/components/transaction-list";
import { Database } from "@/utilities";
import { useList, useParsed } from "@refinedev/core";
import { Flex, Skeleton } from "antd";
import dayjs from "dayjs";
import React from "react";

export const AllFunds = () => {
  const { params } = useParsed<any>();
  let range: {
    createdAt?: {
      gte?: string;
      lte?: string;
    };
  } = {};
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
  if (params.filterBy === "this-month")
    range = {
      createdAt: {
        gte: dayjs().startOf("month").toISOString(),
      },
    };

  if (params.filterBy === "last-month")
    range = {
      createdAt: {
        gte: dayjs().subtract(1, "month").startOf("month").toISOString(),
        lte: dayjs().subtract(1, "month").endOf("month").toISOString(),
      },
    };
  const { data: transfers, isLoading: transfersLoading } = useList<
    Database["public"]["Tables"]["transfers"]["Row"]
  >({
    resource: "transfers",
    filters: [
      {
        field: "created_at",
        operator: "gte",
        value:
          params.filterBy === "this-month"
            ? dayjs().startOf("month").toISOString()
            : dayjs().subtract(1, "month").startOf("month").toISOString(),
      },
      {
        field: "created_at",
        operator: "lte",
        value:
          params.filterBy === "this-month"
            ? dayjs().endOf("month").toISOString()
            : dayjs().subtract(1, "month").endOf("month").toISOString(),
      },
      {
        field: "status",
        operator: "eq",
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
  if (!users?.data || isLoading) return <Skeleton active />;

  return (
    <Flex style={{ flexDirection: "column", gap: 16 }}>
      <Text size="lg">
        Collection :{" "}
        {transfers?.data.reduce((acc, curr) => acc + curr.amount, 0)}
      </Text>
      <TransactionList userIds={users?.data} range={range} statusEq="Credit" />
    </Flex>
  );
};
