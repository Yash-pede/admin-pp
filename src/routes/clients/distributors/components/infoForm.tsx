import { Text } from "@/components";
import { Database } from "@/utilities";
import { ShopOutlined } from "@ant-design/icons";
import { DateField } from "@refinedev/antd";
import { Card, Space } from "antd";

type Props = {
  userDetails: Database["public"]["Tables"]["profiles"]["Row"];
  style?: React.CSSProperties;
};

export const UserInfoForm = (props: Props) => {
  const gridStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
  };

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
      <Card.Grid style={gridStyle}>
        <Space size="middle">
          <Text strong>Boss: </Text>
          <Text>{props.userDetails.boss_id || "Admin"}</Text>
        </Space>
      </Card.Grid>
    </Card>
  );
};
