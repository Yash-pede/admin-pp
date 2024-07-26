import { Text } from "@/components";
import { Database } from "@/utilities";
import { MoneyCollectFilled } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { Card, Skeleton } from "antd";
import React, { Suspense } from "react";
import { ShopOutlined } from "@ant-design/icons";

import dayjs from "dayjs";
import TinyAreaChart from "../../../components/charts/area-chart";
import IconWrapper from "./icon-wrapper";

const IncomingFundsCurrentMonth = () => {
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
    const totalAmount = totalTransfersCount?.data
      ?.map((d) => d.amount)
      ?.reduce((a, b) => a + b, 0);

    const textSize = totalAmount
      ? totalAmount.toString().length > 2
        ? "lg"  
        : "md"
      : "xl";

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
          size={textSize}
          strong
          style={{
            textAlign: "start",

            fontVariantNumeric: "tabular-nums",
          }}
        >
          ₹{" "}
          {isLoading ? (
            <Skeleton.Button
              style={{
                marginTop: "8px",
                width: "74px",
              }}
            />
          ) : (
            totalAmount
          )}
        </Text>
        <Suspense>
          <TinyAreaChart
            data={totalTransfersCount?.data ?? []}
            dataKey="amount"
          />
        </Suspense>
      </div>
    </Card>
  );
};

export default IncomingFundsCurrentMonth;
