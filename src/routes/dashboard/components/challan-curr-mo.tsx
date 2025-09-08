import { Text } from "@/components";
import { ShopOutlined } from "@ant-design/icons";
import { useGo, useOne } from "@refinedev/core";
import { Card, Skeleton } from "antd";
import dayjs from "dayjs";
import IconWrapper from "./icon-wrapper";
import { Database } from "@/utilities";

export const TotalChallanAmt = () => {
  const go = useGo();
  const { data: totalChallansCount, isLoading } = useOne<
    Database["public"]["Tables"]["funds"]["Row"]
  >({
    resource: "funds",
    id: import.meta.env.VITE_ADMIN_ID as string,
  });

  return (
    <Card
      style={{ height: "96px", padding: 0, cursor: "pointer" }}
      bodyStyle={{
        padding: "8px 8px 8px 12px",
      }}
      size="small"
      onClick={() => go({ to: "/challan" })}
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
          Total Bill Amount {dayjs().format("MMMM YYYY")}
        </Text>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Text
          size="lg"
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
            Math.round(totalChallansCount?.data?.total_amt || 0)
          )}
        </Text>
      </div>
    </Card>
  );
};
