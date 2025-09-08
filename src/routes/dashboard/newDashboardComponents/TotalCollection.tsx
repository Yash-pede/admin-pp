import { Text } from "@/components";
import { Database } from "@/utilities";
import { useList, CrudFilters, useGo, useOne } from "@refinedev/core";
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
    {
      field: "status",
      operator: "eq",
      value: "Credit",
    },
  ];

  // Add date filters based on `filterBy`
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

  // For month-specific collection data
  const { data: transferData, isLoading: isTransferLoading } = useList<
    Database["public"]["Tables"]["transfers"]["Row"]
  >({
    resource: "transfers",
    filters,
    meta: {
      select: "id , created_at , amount",
    },
    queryOptions: {
      refetchInterval: 1 * 60 * 60 * 1000,
      enabled: filterBy === "this-month" || filterBy === "last-month",
    },
    pagination: {
      current: 1,
      pageSize: 100000,
    },
  });

  // Calculate total amount from fetched transfers
  const totalAmountFromTransfers = transferData?.data
    ?.map((d) => d.amount)
    ?.reduce((a, b) => a + b, 0);

  // For total funds (admin)
  const { data: adminFundData, isLoading: isFundLoading } = useOne<
    Database["public"]["Tables"]["funds"]["Row"]
  >({
    resource: "funds",
    id: import.meta.env.VITE_ADMIN_ID,
    meta: {
      fields: ["total_amt"],
    },
    queryOptions: {
      enabled: filterBy === "total",
    },
  });

  // Determine what amount to show
  const displayAmount =
    filterBy === "this-month" || filterBy === "last-month"
      ? totalAmountFromTransfers ?? 0
      : adminFundData?.data?.total_amt ?? 0;

  const isLoading =
    filterBy === "this-month" || filterBy === "last-month"
      ? isTransferLoading
      : isFundLoading;

  const textSize = displayAmount.toString().length > 2 ? "lg" : "md";

  const label =
    filterBy === "last-month"
      ? dayjs().subtract(1, "month").format("MMMM YYYY")
      : filterBy === "this-month"
      ? dayjs().format("MMMM YYYY")
      : "Total Collected Funds";

  return (
    <Card
      style={{ height: "96px", padding: 0, cursor: "pointer" }}
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
          <ShopOutlined className="md" style={{ color: "#1677FF" }} />
        </IconWrapper>
        <Text size="md" className="secondary" style={{ marginLeft: "8px" }}>
          {label}
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
          Math.round(displayAmount)
        )}
      </Text>
    </Card>
  );
};

export default TotalCollection;
