import React from "react";
import { List } from "@refinedev/antd";
import { useGetIdentity, useGo, useOne } from "@refinedev/core";
import { Database } from "@/utilities";
import { TransactionList } from "./components/transaction-list";
import { Button } from "antd";

export const FundsList = ({ children }: { children?: React.ReactNode }) => {
const go = useGo();
  const { data: user } = useGetIdentity<any>();
  const { data: funds, isLoading: isFundsLoading } = useOne<
    Database["public"]["Tables"]["funds"]["Row"]
  >({
    resource: "funds",
    id: user.id,
    queryOptions: {
      enabled: !!user.id,
    },
  });
  return (
    <List
      headerProps={{
        title: `In Hand : ${funds?.data?.total ? funds?.data?.total : "-"}`,
      }}
      headerButtons={[
        <Button type="primary" onClick={() => go({ to: "requested" })}>Requested</Button>
      ]} canCreate={false}
    >
      <TransactionList userId={user.id} statusNeq="Requested" />
      {children}
    </List>
  );
};
