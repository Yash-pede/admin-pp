import { Text } from "@/components";
import { Database } from "@/utilities";
import { banUser, getUserSupabase } from "@/utilities/functions";
import { ShopOutlined } from "@ant-design/icons";
import { DateField, useModal } from "@refinedev/antd";
import { useGo, useOne } from "@refinedev/core";
import {
  Alert,
  Button,
  Card,
  Flex,
  Modal,
  notification,
  Skeleton,
  Space,
} from "antd";
import useNotification from "antd/es/notification/useNotification";
import dayjs from "dayjs";
import React from "react";

type Props = {
  userDetails: Database["public"]["Tables"]["profiles"]["Row"];
  style?: React.CSSProperties;
  sales?: boolean;
};

export const UserInfoForm = (props: Props) => {
  const go = useGo();
  const gridStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
  };
  const { show, close, modalProps } = useModal();
  const { data: distributorDetails, isLoading } = useOne<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
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

  const gridStylee: React.CSSProperties = {
    width: "50%",
    textAlign: "center",
  };  
  const [bannedStatus, setBannedStatus] = React.useState("");
  React.useEffect(() => {
    async function banned() {
      const user:any = await getUserSupabase(props.userDetails.id);
      setBannedStatus(user?.data.user?.banned_until ?? "");
    }
    banned();
  }, [modalProps.visible, props.userDetails.id]);
  return (
    <>
      <Card
        title={
          <Flex
            gap="xl"
            justify="space-between"
            align="center"
            style={{ width: "100%" }}
          >
            <Space size="small">
              <ShopOutlined className="sm" />
              <Text>User info</Text>
            </Space>
            <Button type="dashed" onClick={show}>
              Ban User
            </Button>
            <Button
              type="primary"
              onClick={() =>
                go({
                  to: `/challan`,
                  query: {
                    filters: [
                      {
                        field: props.sales ? "sales_id" : "distributor_id",
                        operator: "eq",
                        value: props.userDetails.id,
                      },
                    ],
                  },
                })
              }
            >
              Challan's
            </Button>
          </Flex>
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
      <Modal
        {...modalProps}
        onClose={()=>setBannedStatus("")} 
        footer={[
          <Button onClick={close}>Cancel</Button>,
          <Button
            type="primary"
            onClick={async () => {
              const result:any = await banUser(props.userDetails.id, "1s");
              if (result.data.user) {
                notification.success({
                  message: "User Banned",
                  description: `User ${
                    props.userDetails.username
                  } banned until ${dayjs(
                    result.data.user?.banned_until ?? ""
                  ).format("DD-MM-YYYY hh:mm A")}`,
                });
                close(); // Call the close function to close the modal
              }
            }}
          >
            Unban User
          </Button>,
        ]}
      >
        <Card
          title={
            <Alert
              message="This user will be banned from logging in"
              type="warning"
            />
          }
        >
          <Card.Grid style={gridStylee}>
            <Button
              onClick={async () => {
                const result:any = await banUser(props.userDetails.id, "1h");
                if (result.data.user) {
                  notification.success({
                    message: "User Banned",
                    description: `User ${
                      props.userDetails.username
                    } banned until ${dayjs(
                      result.data.user?.banned_until ?? ""
                    ).format("DD-MM-YYYY hh:mm A")}`,
                  });
                  close(); // Call the close function to close the modal
                }
              }}
            >
              1 Hr
            </Button>
          </Card.Grid>
          <Card.Grid style={gridStylee}>
            <Button
              onClick={async () => {
                const result:any = await banUser(props.userDetails.id, "24h");
                if (result) {
                  notification.success({
                    message: "User Banned",
                    description: `User ${
                      props.userDetails.username
                    } banned until ${dayjs(
                      result.data.user?.banned_until ?? ""
                    ).format("DD-MM-YYYY hh:mm A")}`,
                  });
                  close(); // Close the modal if the ban is successful
                }
              }}
            >
              1 Day
            </Button>
          </Card.Grid>
          <Card.Grid style={gridStylee}>
            <Button
              onClick={async () => {
                const result:any = await banUser(props.userDetails.id, "168h");
                if (result) {
                  notification.success({
                    message: "User Banned",
                    description: `User ${
                      props.userDetails.username
                    } banned until ${dayjs(
                      result.data.user?.banned_until ?? ""
                    ).format("DD-MM-YYYY hh:mm A")}`,
                  });
                  close(); // Close the modal if the ban is successful
                }
              }}
            >
              1 Week
            </Button>
          </Card.Grid>
          <Card.Grid style={gridStylee}>
            <Button
              onClick={async () => {
                const result:any = await banUser(props.userDetails.id, "730h");
                if (result) {
                  notification.success({
                    message: "User Banned",
                    description: `User ${
                      props.userDetails.username
                    } banned until ${dayjs(
                      result.data.user?.banned_until ?? ""
                    ).format("DD-MM-YYYY hh:mm A")}`,
                  });
                  close(); // Close the modal if the ban is successful
                }
              }}
            >
              1 Month
            </Button>
          </Card.Grid>
          <Card.Grid style={gridStylee}>
            <Button
              onClick={async () => {
                const result:any = await banUser(props.userDetails.id, "999999h");
                if (result) {
                  notification.success({
                    message: "User Banned",
                    description: `User ${
                      props.userDetails.username
                    } banned until ${dayjs(
                      result.data.user?.banned_until ?? ""
                    ).format("DD-MM-YYYY hh:mm A")}`,
                  });
                  close(); // Close the modal if the ban is successful
                }
              }}
            >
              Permanent
            </Button>
          </Card.Grid>
          <Card.Grid hoverable={false} style={gridStylee}>
            <Alert
              message={`User Is banned until = ${dayjs(bannedStatus).format(
                "DD-MM-YYYY hh:mm A"
              )}`}
              type="info"
            />
          </Card.Grid>
        </Card>
      </Modal>
    </>
  );
};
