import { Text } from "@/components";
import { Database } from "@/utilities";
import { ShopOutlined } from "@ant-design/icons";
import { DateField } from "@refinedev/antd";
import { useOne } from "@refinedev/core";
import { Card, Skeleton, Space } from "antd";

type Props = {
  userDetails: Database["public"]["Tables"]["profiles"]["Row"];
  style?: React.CSSProperties;
  sales?: boolean;
};

export const UserInfoForm = (props: Props) => {
  const gridStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
  };

  const {
    data: distributorDetails,
    isLoading,
    isError,
  } = useOne<Database["public"]["Tables"]["profiles"]["Row"]>({
    resource: "profiles",
    id: props.userDetails.boss_id || "",
    queryOptions: {
      enabled: !!props.userDetails.boss_id,
    },
  });

  const { data: fundDetails, isLoading: fundLoading } = useOne<
    Database["public"]["Tables"]["funds"]["Row"]
  >({
    resource: "funds",
    id: props.userDetails.id,
  });

  return (
    <Card
      title={
        <Space size={15}>
          <ShopOutlined className="sm" />
          <Text>User info</Text>
        </Space>
      }
      headStyle={{
        padding: "1rem",
      }}
      bodyStyle={{
        padding: "0",
      }}
      style={{
        maxWidth: "500px",
        ...props.style,
      }}
    >
      <Card.Grid style={gridStyle}>
        <Space size="middle">
          <Text strong>User Name: </Text>
          <Text>{props.userDetails.username}</Text>
        </Space>
      </Card.Grid>
      <Card.Grid style={gridStyle}>
        <Space size="middle">
          <Text strong>Funds: </Text>
          <Text>
            {fundLoading ? (
              <Skeleton active />
            ) : (
              "₹ " + (fundDetails?.data?.total ?? 0)
            )}
          </Text>
        </Space>
      </Card.Grid>
      <Card.Grid style={gridStyle}>
        <Space size="middle">
          <Text strong>Phone: </Text>
          <Text>+91 {props.userDetails.phone}</Text>
        </Space>
      </Card.Grid>
      <Card.Grid style={gridStyle}>
        <Space size="middle">
          <Text strong>Full Name: </Text>
          <Text>{props.userDetails.full_name}</Text>
        </Space>
      </Card.Grid>
      <Card.Grid style={gridStyle}>
        <Space size="middle">
          <Text strong>Email: </Text>
          <Text>{props.userDetails.email}</Text>
        </Space>
      </Card.Grid>
      <Card.Grid style={gridStyle}>
        <Space size="middle">
          <Text strong>Created At: </Text>
          <DateField
            value={props.userDetails.created_at}
            format="DD-MM-YYYY hh:mm A"
          />
        </Space>
      </Card.Grid>
      <Card.Grid style={gridStyle} hidden={!props.userDetails.boss_id}>
        <Space size="middle">
          <Text strong>Boss: </Text>
          {isLoading ? (
            <Skeleton.Input />
          ) : (
            distributorDetails?.data.username || "Distributor"
          )}
        </Space>
      </Card.Grid>
    </Card>
  );
};
