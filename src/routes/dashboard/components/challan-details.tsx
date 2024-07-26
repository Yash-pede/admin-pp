import { AreaChartBig, Text } from "@/components";
import { Database } from "@/utilities";
import { RightCircleOutlined } from "@ant-design/icons";
import { useList, useNavigation } from "@refinedev/core";
import { IconCurrencyRupee } from "@tabler/icons-react";
import { Button, Card } from "antd";
import dayjs from "dayjs";
import React, { Suspense } from "react";

const ChallanDetails = () => {
  const { list } = useNavigation();
  const { data: totalChallansCount, isLoading } = useList<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    resource: "challan",
    filters: [
      {
        field: "created_at",
        operator: "gte",
        value: dayjs().startOf("year").toISOString(),
      },
    ],
    meta: {
      select: "id , bill_amt , created_at",
    },
    queryOptions: {
      refetchInterval: 1 * 60 * 60 * 1000,
    },
  });
  const { data: totalChallansCountPrevYear, isLoading: isLoadingPrev } = useList<
    Database["public"]["Tables"]["challan"]["Row"]
  >({
    resource: "challan",
    filters: [
      {
        field: "created_at",
        operator: "gte",
        value: dayjs().subtract(1, "year").startOf("year").toISOString(),
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
      style={{ height: "100%", width: "100%" }}
      headStyle={{ padding: "8px 16px" }}
      bodyStyle={{ padding: "24px 24px 0px 24px" }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <IconCurrencyRupee />
          <Text size="sm" style={{ marginLeft: ".5rem" }}>
            Deals
          </Text>
        </div>
      }
      extra={
        <Button onClick={() => list("deals")} icon={<RightCircleOutlined />}>
          See sales pipeline
        </Button>
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Suspense>
          <AreaChartBig
            data={totalChallansCount?.data || []}
            XDataKey="created_at"
            dataKey="bill_amt"
            data2={totalChallansCountPrevYear?.data || []}
          />
        </Suspense>
      </div>
    </Card>
  );
};

export default ChallanDetails;
