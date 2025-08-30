import { Text } from "@/components";
import { Database } from "@/utilities";
import { useList, CrudFilters, useGo } from "@refinedev/core";
import { Card, Skeleton } from "antd";
import { ShopOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import IconWrapper from "../components/icon-wrapper";

type TotalSalesProps = {
  filterBy: "this-month" | "last-month";
};

const TotalSales = ({ filterBy }: TotalSalesProps) => {
  const go = useGo();
  const filters: CrudFilters = [
    {
      field: "status",
      operator: "eq",
      value: "BILLED",
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

  const { data, isLoading } = useList<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    resource: "challan",
    filters,
    meta: {
      select: "id , created_at , total_amt",
    },
    queryOptions: {
      refetchInterval: 1 * 60 * 60 * 1000,
    },
    pagination: {
      current: 1,
      pageSize: 100000,
    },
  });

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
          to: "/challan/all",
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
          {label}
        </Text>
      </div>
      <Text
        size="lg"
        strong
        style={{
          marginTop: "8px",
          textAlign: "start",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {isLoading ? (
          <Skeleton.Button
            style={{
              marginTop: "8px",
              width: "74px",
            }}
          />
        ) : (
          `${Math.round(
            data?.data.reduce((acc, curr) => acc + (curr.total_amt || 0), 0) ??
              0
          )}`
        )}
      </Text>
    </Card>
  );
};

export default TotalSales;
