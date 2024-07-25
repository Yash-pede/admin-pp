import { Text } from "@/components";
import { Database } from "@/utilities";
import { MoneyCollectFilled } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { Card, Skeleton } from "antd";
import React, { Suspense } from "react";

import styles from "./index.module.css";
import dayjs from "dayjs";

const IncomingFundsCurrentMonth = () => {
  const Area = React.lazy(() => import("@ant-design/plots/es/components/area"));
  const { data: totalTransfersCount, isLoading } = useList<
    Database["public"]["Tables"]["transfers"]["Row"]
  >({
    resource: "transfers",
    filters: [
      {
        field: "customer_id",
        operator: "nnull",
        value: null,
      },
      {
        field: "created_at",
        operator: "gte",
        value: dayjs().startOf("month").toISOString(),
      },
    ],
    meta: {
      select: "id , created_at , amount",
    },
    queryOptions: {
      refetchInterval: 1 * 60 * 60 * 1000,
    },
  });
  const config = {
    className: styles.area,
    appendPadding: [1, 0, 0, 0],
    padding: 0,
    syncViewPadding: true,
    autoFit: true,
    tooltip: false,
    animation: false,
    data: totalTransfersCount?.data,
    xField: (d:any) => {
      return new Date(d.created_at);
    },
    yField: "amount",
    style: {
      fill: "linear-gradient(-90deg, white 0%, darkgreen 100%)",
    },
    axis: {
      y: { labelFormatter: "~s" },
    },
    line: {
      style: {
        stroke: "darkgreen",
        strokeWidth: 2,
      },
    },
  };
  return (
    <Card
      style={{ height: "96px", padding: 0 }}
      bodyStyle={{
        padding: "8px 8px 8px 12px",
      }}
      size="small"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          whiteSpace: "nowrap",
        }}
      >
        <MoneyCollectFilled />
        <Text size="md" className="secondary" style={{ marginLeft: "8px" }}>
          Collected Funds as of {dayjs().format("MMMM YYYY")}
        </Text>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Text
          size="xxxl"
          strong
          style={{
            textAlign: "start",
            
            fontVariantNumeric: "tabular-nums",
          }}
        >₹{" "}
          {isLoading ? (
            <Skeleton.Button
              style={{
                marginTop: "8px",
                width: "74px",
              }}
            />
          ) : (
            totalTransfersCount?.data
              .map((d) => d.amount)
              .reduce((a, b) => a + b, 0)
          )}
        </Text>
        <Suspense>
          <Area {...config} />
        </Suspense>
      </div>
    </Card>
  );
};

export default IncomingFundsCurrentMonth;
