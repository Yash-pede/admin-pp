import { Text } from "@/components";
import { Col, Row } from "antd";
import TotalCollection from "./newDashboardComponents/TotalCollection";
import { TotalChallanAmt } from "./components/challan-curr-mo";
import TotalSales from "./newDashboardComponents/TotalSales";

export const NewDashboard = () => {
  return (
    <Row
      style={{
        border: "1px solid #3535353f",
        padding: "20px",
        borderRadius: "8px",
        gap: "20px",
      }}
    >
      <Col
        span={11}
        style={{ gap: "12px", display: "flex", flexDirection: "column" }}
      >
        <Text size="xxxl">Collection</Text>
        <TotalCollection filterBy="this-month" />
        <TotalCollection filterBy="last-month" />
        <TotalCollection filterBy="total" />
      </Col>
      <Col
        span={11}
        style={{ gap: "12px", display: "flex", flexDirection: "column" }}
      >
        <Text size="xxxl">Sales</Text> 
        <TotalSales filterBy="this-month" />
        <TotalSales filterBy="last-month" />
        <TotalChallanAmt />
      </Col>
    </Row>
  );
};
