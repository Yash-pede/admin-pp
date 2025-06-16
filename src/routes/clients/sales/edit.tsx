import { Database } from "@/utilities";
import { Edit, useDrawerForm } from "@refinedev/antd";
import { HttpError, useGo } from "@refinedev/core";
import { Drawer, Form, Input, InputNumber } from "antd";
import React from "react";
import { useLocation } from "react-router-dom";
import { SalesShow } from "./show";
import ChangeEmailAndPasswordComponent from "@/components/changePassword";

export const SalesEdit = () => {
  const pathname = useLocation().pathname;
  const salesId = pathname.split("/").pop();
  const go = useGo();

  const { formProps, drawerProps, saveButtonProps, id, queryResult } =
    useDrawerForm<Database["public"]["Tables"]["profiles"]["Row"], HttpError>({
      action: "edit",
      resource: "profiles",
      id: salesId,
    });
  return (
    <SalesShow>
      <Drawer
        {...drawerProps}
        open
        onClose={() =>
          go({
            to: {
              action: "show",
              id: salesId || "",
              resource: "sales",
            },
          })
        }
      >
        <Edit saveButtonProps={saveButtonProps} recordItemId={id}>
          <Form {...formProps} layout="vertical">
            <Form.Item
              label="User Name"
              name={"username"}
              rules={[
                { required: true, message: "Name is required", type: "string" },
              ]}
            >
              <Input placeholder="Name" type="text" />
            </Form.Item>
            <Form.Item
              label="Phone"
              name={"phone"}
              // rules={[
              //   { max: 9999999999, message: "Invalid Phone", type: "number" },
              //   { min: 1000000000, message: "Invalid Phone", type: "number" },
              // ]}
            >
              <InputNumber placeholder="Phone" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Full Name" name={"full_name"}>
              <Input placeholder="Enter Full Name" />
            </Form.Item>
            <Form.Item label="Email" name={"email"}>
              <Input placeholder="Email" />
            </Form.Item>
          </Form>
        </Edit>
        <ChangeEmailAndPasswordComponent
          email={queryResult?.data?.data.email ?? ""}
          userId={salesId ?? ""}
          userType={"sales"}
        />
      </Drawer>
    </SalesShow>
  );
};
