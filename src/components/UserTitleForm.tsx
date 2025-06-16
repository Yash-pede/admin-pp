import { Text } from "@/components";
import { Database } from "@/utilities";
import { useGo } from "@refinedev/core";
import { Button, Flex, Skeleton, Space } from "antd";

export const UserTitleForm = ({
  userDetails,
  sales
}: {
  userDetails: Database["public"]["Tables"]["profiles"]["Row"];
  sales?: boolean;
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
          <Text size="xl">{userDetails?.username}</Text>
          <Text size="sm">{userDetails?.email}</Text>
        </Space>
      </Space>
      <Space>
        <Button
          type="primary"
          onClick={() =>
            go({
              to: {
                action: "edit",
                id: userDetails?.id,
                resource: sales ? "sales" : "distributors",
              },
            })
          }
        >
          Edit Details
        </Button>
        {/* <Button onClick={() => go({ to: `/administration/settings/user-credentials/${userDetails?.id}` })}> Edit Credentials</Button> */}
      </Space>
    </Flex>
  );
};
