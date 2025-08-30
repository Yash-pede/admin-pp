import { TransactionList } from "@/routes/funds/components/transaction-list";
import { Database } from "@/utilities";
import { useList, useParsed } from "@refinedev/core";
import { Skeleton } from "antd";
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
  if (!users?.data || isLoading) return <Skeleton active />;
  return <TransactionList userIds={users?.data} range={range} />;
};
