import { Text } from "@/components";
import { Database } from "@/utilities";
import { useGo } from "@refinedev/core";
import { Button, Flex, Skeleton, Space } from "antd";
import React from "react";

export const DistributorTitleForm = ({
  distributorDetails,
}: {
  distributorDetails: Database["public"]["Tables"]["profiles"]["Row"];
}) => {
  const go = useGo();

  return (
    <Flex align="center" justify="space-between">
      <Space size="large">
        <Skeleton.Avatar
          active
          size="large"
          style={{ width: 64, height: 64 }}
        />
        <Space direction="vertical" size={0}>
          <Text size="xl">{distributorDetails?.username}</Text>
          <Text size="sm">{distributorDetails?.email}</Text>
        </Space>
      </Space>
      <Space>
        <Button
          type="primary"
          onClick={() =>
            go({
              to: {
                action: "edit",
                id: distributorDetails?.id,
                resource: "distributors",
              },
            })
          }
        >
          Edit Details
        </Button>
        <Button> Edit Credentials</Button>
      </Space>
    </Flex>
  );
};
