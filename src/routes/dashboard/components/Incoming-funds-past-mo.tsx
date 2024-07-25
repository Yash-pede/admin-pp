import { Text } from "@/components";
import { Database } from "@/utilities";
import { ShopOutlined } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { Card, Skeleton } from "antd";
import React, { Suspense } from "react";

import dayjs from "dayjs";
import TinyAreaChart from "../../../components/area-chart";
import IconWrapper from "./icon-wrapper";

export const IncomingFundsPastMonth = () => {
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
        operator: "lt",
        value: dayjs().startOf("month").toISOString(),
      },
      {
        field: "created_at",
        operator: "gte",
        value: dayjs().subtract(1, "month").startOf("month").toISOString(),
      },
    ],
    meta: {
      select: "id , created_at , amount",
    },
    queryOptions: {
      refetchInterval: 1 * 60 * 60 * 1000,
    },
  });

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
         <IconWrapper color="#E6F4FF">
          <ShopOutlined
            className="md"
            style={{
              color: "#1677FF",
            }}
          />
        </IconWrapper>
        <Text size="md" className="secondary" style={{ marginLeft: "8px" }}>
          Last month -{" "}
          {dayjs().subtract(1, "month").format("MMMM YYYY")}
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
        <TinyAreaChart data={totalTransfersCount?.data ?? []} dataKey="amount" />
        </Suspense>
      </div>
    </Card>
  );
};
