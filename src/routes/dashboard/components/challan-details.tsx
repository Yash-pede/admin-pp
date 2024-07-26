import { AreaChartBig, Text } from "@/components";
import { Database } from "@/utilities";
import { RightCircleOutlined } from "@ant-design/icons";
import { useList, useNavigation } from "@refinedev/core";
import { IconCurrencyRupee } from "@tabler/icons-react";
import { Button, Card } from "antd";
import dayjs from "dayjs";
import React, { Suspense } from "react";

const ChallanDetails = () => {
  const [groupedChallanAccToMo, setGroupedChallanAccToMo] = React.useState<
    Array<any>
  >([]);
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
  const { data: totalChallansCountPrevYear, isLoading: isLoadingPrev } =
    useList<Database["public"]["Tables"]["challan"]["Row"]>({
      resource: "challan",
      filters: [
        {
          field: "created_at",
          operator: "gte",
          value: dayjs().subtract(1, "year").startOf("year").toISOString(),
        },
        {
          field: "created_at",
          operator: "lte",
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

  React.useEffect(() => {
    const initialData = [
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 0).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 1).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 2).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 3).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 4).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 5).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 6).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 7).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 8).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 9).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 10).toISOString(),
      },
      {
        bill_amt_curr_year: 0,
        bill_amt_past_year: 0,
        created_at: dayjs().set("date", 1).set("month", 11).toISOString(),
      },
    ];

    totalChallansCount?.data.map((item) => {
      initialData.map((itm) => {
        if (dayjs(itm.created_at).month() === dayjs(item.created_at).month()) {
          itm.bill_amt_curr_year = itm.bill_amt_curr_year + item.bill_amt;
        }
      });
    });

    totalChallansCountPrevYear?.data.map((item) => {
      initialData.map((itm) => {
        if (dayjs(itm.created_at).month() === dayjs(item.created_at).month()) {
          itm.bill_amt_past_year = itm.bill_amt_past_year + item.bill_amt;
        }
      });
    });

    setGroupedChallanAccToMo(initialData);
  }, [totalChallansCount, totalChallansCountPrevYear]);

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
            Challans
          </Text>
        </div>
      }
      extra={
        <Button onClick={() => list("deals")} icon={<RightCircleOutlined />}>
          View All
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
            data={groupedChallanAccToMo}
            XDataKey="created_at"
            dataKey="bill_amt_curr_year"
            dataKey2="bill_amt_past_year"
          />
        </Suspense>
      </div>
    </Card>
  );
};

export default ChallanDetails;
