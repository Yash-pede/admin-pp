import React from "react";
import { Text } from "@/components";
import { IconCurrencyRupee } from "@tabler/icons-react";
import { Button, Card } from "antd";
import IconWrapper from "./icon-wrapper";

const TopPerformers = () => {
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
          <IconWrapper color="#E6F4FF">
            <IconCurrencyRupee
              className="md"
              style={{
                color: "#1677FF",
              }}
            />
          </IconWrapper>
          <Text size="sm" style={{ marginLeft: ".5rem" }}>
            Products
          </Text>
        </div>
      }
      extra={
        <Button>
          View All
        </Button>
      }
    >
      <div
        style={{
          display: "grid",
          placeItems: "center",
        }}
      >
        Hii
      </div>
    </Card>
  );
};

export default TopPerformers;
