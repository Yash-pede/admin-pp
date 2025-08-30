import { Text } from "@/components";
import { Database } from "@/utilities";
import { useList, CrudFilters, useGo } from "@refinedev/core";
import { Card, Skeleton } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import IconWrapper from "../components/icon-wrapper";

type TotalCollectionProps = {
  filterBy?: "this-month" | "last-month" | "total";
};

const TotalCollection = ({ filterBy }: TotalCollectionProps) => {
  const go = useGo();
  const filters: CrudFilters = [
    {
      field: "customer_id",
      operator: "nnull",
      value: null,
    },
  ];

  if (filterBy === "this-month") {
    filters.push({
      field: "created_at",
      operator: "gte",
      value: dayjs().startOf("month").toISOString(),
    });
  } else if (filterBy === "last-month") {
    filters.push(
      {
        field: "created_at",
        operator: "gte",
        value: dayjs().subtract(1, "month").startOf("month").toISOString(),
      },
      {
        field: "created_at",
        operator: "lte",
        value: dayjs().subtract(1, "month").endOf("month").toISOString(),
      }
    );
  }

  const { data: totalTransfersCount, isLoading } = useList<
    Database["public"]["Tables"]["transfers"]["Row"]
  >({
    resource: "transfers",
    filters,
    meta: {
      select: "id , created_at , amount",
    },
    queryOptions: {
      refetchInterval: 1 * 60 * 60 * 1000,
    },
    pagination: {
      current: 1,
      pageSize: 100000,
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

  const label =
    filterBy === "last-month"
      ? dayjs().subtract(1, "month").format("MMMM YYYY")
      : dayjs().format("MMMM YYYY");

  return (
    <Card
      style={{ height: "96px", padding: 0 }}
      bodyStyle={{
        padding: "8px 8px 8px 12px",
      }}
      size="small"
      onClick={() =>
        go({
          to: `/funds/all`,
          query: {
            filterBy,
          },
        })
      }
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
          {filterBy === "total" ? "Total Collected Funds" : `${label}`}
        </Text>
      </div>
      <Text
        size={textSize}
        strong
        style={{
          marginTop: "8px",
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
          Math.round(totalAmount || 0)
        )}
      </Text>
    </Card>
  );
};

export default TotalCollection;
