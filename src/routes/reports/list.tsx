import { reportTypes } from "@/utilities/constants";
import { Show } from "@refinedev/antd";
import { useGo } from "@refinedev/core";
import { Card, Space } from "antd";
import React from "react";
import { Link } from "react-router-dom";

export const ReportsList = () => {
  return (
    <Show>
      <Space size="large">
        {reportTypes.map((reportType, i) => (
          <Link key={i} to={reportType.link}>
            <Card
              hoverable
              style={{
                width: "200px",
                height: "200px",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {reportType.icon}
              <h2 style={{ textTransform: "uppercase" }}>{reportType.title}</h2>
            </Card>
          </Link>
        ))}
      </Space>
    </Show>
  );
};
