import { reportTypes } from "@/utilities/constants";
import { Show } from "@refinedev/antd";
import { useGo } from "@refinedev/core";
import { Card, Space } from "antd";
import React from "react";

export const ReportsList = () => {
  const go = useGo();
  return (
    <Show>
      <Space size="large">
        {reportTypes.map((reportType) => (
          <Card
            hoverable
            key={reportType}
            onClick={() => go({ to: reportType })}
          >
            <h2>{reportType}</h2>
          </Card>
        ))}
      </Space>
    </Show>
  );
};
