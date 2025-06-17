import { Database } from "@/utilities";
import { Edit, useDrawerForm } from "@refinedev/antd";
import { HttpError, useGo } from "@refinedev/core";
import { Drawer, Form, Input, InputNumber } from "antd";
import { useLocation } from "react-router-dom";
import { CustomersList } from "./list";
import ChangeEmailAndPasswordComponent from "@/components/changePassword";

export const CustomersEdit = (props: any) => {
  const pathname = useLocation().pathname;
  const customerId = pathname.split("/").pop();
  const go = useGo();

  const { formProps, drawerProps, saveButtonProps, id, queryResult } =
    useDrawerForm<Database["public"]["Tables"]["customers"]["Row"], HttpError>({
      action: "edit",
      resource: "customers",
      id: customerId,
    });
  return (
    <CustomersList>
      <Drawer
        {...drawerProps}
        open
        onClose={() =>
          go({
            to: {
              action: "list",
              resource: "customers",
            },
          })
        }
      >
        <Edit saveButtonProps={saveButtonProps} recordItemId={id}>
          <Form {...formProps} layout="vertical">
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
            <Form.Item label="specialization" name={"specialization"}>
              <Input placeholder="specialization" />
            </Form.Item>
            <Form.Item label="address" name={"address"}>
              <Input placeholder="Enter address" />
            </Form.Item>
          </Form>
        </Edit>
      </Drawer>
    </CustomersList>
  );
};
