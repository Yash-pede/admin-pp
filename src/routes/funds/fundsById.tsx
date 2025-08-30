import React from "react";
import { List } from "@refinedev/antd";
import { useOne, useParsed } from "@refinedev/core";
import { Database } from "@/utilities";
import { TransactionList } from "./components/transaction-list";
import { Skeleton } from "antd";

export const FundsListById = ({ children }: { children?: React.ReactNode }) => {
  const { id } = useParsed();
  const { data: funds, isLoading: isFundsLoading } = useOne<
    Database["public"]["Tables"]["funds"]["Row"]
  >({
    resource: "funds",
    id,
    queryOptions: {
      enabled: !!id,
    },
  });
  if (!id) return <Skeleton active />;
  return (
    <List
      headerProps={{
        title: `In Hand : ${
          Math.round(funds?.data?.total || 0)
            ? Math.round(funds?.data?.total || 0)
            : "-"
        }`,
      }}
      canCreate={false}
    >
      <TransactionList userId={id ? String(id) : undefined} statusNeq="Requested" />
      {children}
    </List>
  );
};
