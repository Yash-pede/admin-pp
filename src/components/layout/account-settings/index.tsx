import { useState } from "react";

import { useOne } from "@refinedev/core";

import {
  CloseOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Drawer,
  Space,
  Spin,
  Typography,
} from "antd";



import { CustomAvatar } from "../../custom-avatar";
import { Text } from "../../text";
import styles from "./index.module.css";

type Props = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userId: string;
};

type FormKeys = "email" | "jobTitle" | "phone" | "timezone";

export const AccountSettings = ({ opened, setOpened, userId }: Props) => {
  const [activeForm, setActiveForm] = useState<FormKeys>();

  const { data, isLoading, isError } = useOne({
    resource: "users",
    id: userId,
    queryOptions: {
      enabled: opened,
    },
  });

  const closeModal = () => {
    setOpened(false);
  };

  if (isError) {
    closeModal();
    return null;
  }

  if (isLoading) {
    return (
      <Drawer
        open={opened}
        width={756}
        bodyStyle={{
          background: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin />
      </Drawer>
    );
  }

  const { id, name, email, jobTitle, phone, timezone, avatarUrl } =
    data?.data ?? {};

  const getActiveForm = (key: FormKeys) => {
    if (activeForm === key) {
      return "form";
    }

    if (!data?.data[key]) {
      return "empty";
    }

    return "view";
  };

  return (
    <Drawer
      onClose={closeModal}
      open={opened}
      width={756}
      styles={{
        body: { background: "#f5f5f5", padding: 0 },
        header: { display: "none" },
      }}
    >
      <div className={styles.header}>
        <Text strong>Account Settings</Text>
        <Button
          type="text"
          
          icon={<CloseOutlined />}
          onClick={() => closeModal()}
        />
      </div>
      <div className={styles.container}>
        <div className={styles.name}>
          <CustomAvatar
            style={{
              marginRight: "1rem",
              flexShrink: 0,
              fontSize: "40px",
            }}
            size={96}
            src={avatarUrl}
            name={name}
          />
          <Typography.Title
            level={3}
            style={{ padding: 0, margin: 0, width: "100%" }}
            className={styles.title}
            editable={{
             
              triggerType: ["text", "icon"],
              
              icon: <EditOutlined className={styles.titleEditIcon} />,
            }}
          >
            {name}
          </Typography.Title>
        </div>
        <Card
          title={
            <Space size={15}>
            
              <UserOutlined />
              <Text size="sm">User profile</Text>
            </Space>
          }
          headStyle={{ padding: "0 12px" }}
          bodyStyle={{ padding: "0" }}
        >
        </Card>
        <Card
          title={
            <Space size={15}>
            
              <SafetyCertificateOutlined />
              <Text size="sm">Security</Text>
            </Space>
          }
          headStyle={{ padding: "0 12px" }}
          bodyStyle={{ padding: "0" }}
        >
        </Card>
      </div>
    </Drawer>
  );
};
