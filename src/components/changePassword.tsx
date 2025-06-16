import { changeSupabaseEmailAndPassword } from "@/utilities";
import { useGo } from "@refinedev/core";
import { Button, Card, Form, Input, notification } from "antd";
import React from "react";

const ChangeEmailAndPasswordComponent = ({
  userId,
  email,
  userType,
}: {
  userId: string;
  email: string;
  userType: string;
}) => {
  const go = useGo();
  return (
    <Card title="Change Password" style={{ marginTop: "1rem" }}>
      <Form
        layout="vertical"
        onFinish={async (e) => {
          const resp = await changeSupabaseEmailAndPassword(
            userId,
            e.email,
            e.password
          );
          if (!resp.error?.status) {
            go({
              to: {
                action: "show",
                id: userId || "",
                resource: userType === "distributor" ? "distributors" : "sales",
              },
            });
          } else {
            notification.error({
              message: "Error",
              description: resp.error.message,
            });
          }
        }}
      >
        <Form.Item label="Email" name={"email"} initialValue={email}>
          <Input placeholder="Email" type="email" />
        </Form.Item>
        <Form.Item label="New Password" name={"password"}>
          <Input placeholder="Enter Password" type="text" />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form>
    </Card>
  );
};

export default ChangeEmailAndPasswordComponent;
