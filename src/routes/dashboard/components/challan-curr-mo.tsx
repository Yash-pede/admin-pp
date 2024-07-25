import React, { FC, PropsWithChildren, Suspense } from "react";
import { Text } from "@/components";
import { Database } from "@/utilities";
import { ShopOutlined } from "@ant-design/icons";
import { useList } from "@refinedev/core";
import { Card, Skeleton } from "antd";
import dayjs from "dayjs";
import TinyAreaChart from "../../../components/area-chart";
import IconWrapper from "./icon-wrapper";

export const ChallanCurrentMonth = () => {

  const { data: totalChallansCount, isLoading } = useList<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    resource: "challan",
    filters: [
      {
        field: "created_at",
        operator: "gte",
        value: dayjs().startOf("month").toISOString(),
      },
    ],
    meta: {
      select: "id , bill_amt , created_at",
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
          Total Bill amt as of {dayjs().format("MMMM YYYY")}
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
            totalChallansCount?.data
              .map((d) => d.bill_amt)
              .reduce((a, b) => a + b, 0)
          )}
        </Text>
        <Suspense>
          <TinyAreaChart data={totalChallansCount?.data ?? []} dataKey="bill_amt" />
        </Suspense>
      </div>
    </Card>
  );
};