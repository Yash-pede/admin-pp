import { Drawer, Form, Input, InputNumber } from "antd";
import React from "react";
import { useParams } from "react-router-dom";
import { ProductsShow } from "./show";
import { Edit, useDrawerForm } from "@refinedev/antd";
import { Database } from "@/utilities";
import { HttpError } from "@refinedev/core";

export const ProductsEdit = () => {
  const { id } = useParams();
  const { formProps, drawerProps, saveButtonProps } = useDrawerForm<
  Database["public"]["Tables"]["products"]["Row"],
  HttpError
>({
  action: "edit",
  resource: "products",
  id
});
  return (
    <ProductsShow>
      <Drawer {...drawerProps} open>
        <Edit  saveButtonProps={saveButtonProps} recordItemId={id}>
          <Form {...formProps} layout="vertical">
            <Form.Item 
            label="Name"
            name="name"
            rules={[
              {
                required: true,
              },
            ]}
            >
              <Input />
            </Form.Item>
            <Form.Item 
            label="Price"
            name="selling_price"
            rules={[
              {
                required: true,
              },
            ]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item 
            label="mrp"
            name="mrp"
            rules={[
              {
                required: true,
              },
            ]}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>
          </Form>
        </Edit>
      </Drawer>
    </ProductsShow>
  );
};
