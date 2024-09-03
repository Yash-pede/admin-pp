import React from "react";
import { ExportButton, List } from "@refinedev/antd";
import { useExport, useGetIdentity, useGo, useOne } from "@refinedev/core";
import { Database } from "@/utilities";
import { TransactionList } from "./components/transaction-list";
import { Button } from "antd";
import dayjs from "dayjs";

export const FundsList = ({ children }: { children?: React.ReactNode }) => {
  const go = useGo();
  const { isLoading: exportLoading, triggerExport } = useExport({
    resource: "transfers",
    download: true,
    onError(error) {
      console.error(error);
    },
    mapData: (record) => {
      return {
        //YASH
        // To: record.to_user_id,
        // From: record.from_user_id,
        // Amount: record.amount,
        // Description: record.description,
        // Status: record.status,
        // Created_At: dayjs(record.created_at).format("DD-MM-YYYY"),
      };
    },
    exportOptions: {
      filename: "orders",
    },
  });
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
        title: `Total : ${funds?.data?.total ? funds?.data?.total : "-"}`,
      }}
      headerButtons={[
        <Button type="primary" onClick={() => go({ to: "requested" })}>
          Requested
        </Button>,
        <ExportButton onClick={triggerExport} loading={exportLoading} />,
      ]}
      canCreate={false}
    >
      <TransactionList userId={user.id} />
      {children}
    </List>
  );
};
