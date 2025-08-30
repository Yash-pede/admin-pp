import { TransactionList } from "@/routes/funds/components/transaction-list";
import { Database } from "@/utilities";
import { useList } from "@refinedev/core";
import { Skeleton } from "antd";
import React from "react";

export const AllFunds = () => {
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
  if (!users?.data || isLoading) return <Skeleton active />;
  return <TransactionList userIds={users?.data} />;
};
