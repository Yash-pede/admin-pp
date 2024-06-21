import { Card, Skeleton, Space } from "antd";

import { Text } from "@/components";

export const ProductCardSkeleton = () => {
  return (
    <Card
      size="small"
      actions={[
        <div
          key={1}
          style={{
            width: "100%",
            height: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 16px",
          }}
        >
       <Skeleton.Input style={{ width:"100%"}} />
        </div>,
      ]}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Skeleton.Node
          active
          style={{
            width: "320px",
            height: "240px",
            borderRadius: "14px",
          }}
        />
        <Skeleton.Input
          active
          style={{
            width: "200px",
            height: "16px",
            marginTop: "16px",
          }}
        />
        <Space
          direction="vertical"
          size={0}
          style={{
            marginBottom: "6px",
            alignItems: "center",
          }}
        >
          <Skeleton.Input
            active
            style={{
              height: "16px",
              marginTop: "12px",
            }}
          />
          <Skeleton.Input
            active
            style={{
              height: "16px",
              marginTop: "8px",
            }}
          />
        </Space>
      </div>
    </Card>
  );
};
