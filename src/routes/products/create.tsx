import React, { FC, PropsWithChildren } from "react";
import { ProductsList } from "./list";
import {
  Card,
  Drawer,
  Form,
  GetProp,
  Input,
  InputNumber,
  Upload,
  UploadProps,
  message,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Create, useDrawerForm } from "@refinedev/antd";
import { Database, supabaseServiceRoleClient } from "@/utilities";
import { HttpError, useGo } from "@refinedev/core";

export const ProductsCreate: FC<PropsWithChildren> = ({ children }) => {
  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];
  const { formProps, drawerProps, saveButtonProps } = useDrawerForm<
    Database["public"]["Tables"]["products"]["Insert"],
    HttpError
  >({
    action: "create",
    resource: "products",
  });
  const { Dragger } = Upload;
  const go = useGo();

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error("Image must smaller than 3MB!");
    }
    return isJpgOrPng && isLt3M;
  };
  const props: UploadProps = {
    name: "file",
    multiple: false,
    customRequest: async ({ file, onSuccess, filename, onError }) => {
      try {
        const timestamp = Date.now();
        const fileName = `images/${timestamp}-${filename}`;

        const { data, error }: any = await supabaseServiceRoleClient.storage
          .from("Products")
          .upload(fileName, file);

        if (error) {
          throw error;
        }

        onSuccess && onSuccess("product Image");

        // Access the uploaded file URL from data.url
        console.log("File uploaded successfully:", data.url);
        formProps.form.setFieldValue("imageURL", fileName);
        // Access the uploaded file URL from data.url
        console.log("File uploaded successfully:", data.url);
      } catch (error: any) {
        console.error("Error uploading file:", error.message);
        onError && onError(error);
      }
    },

    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };
  return (
    <ProductsList>
      <Drawer {...drawerProps} open onClose={() => go({ to: "/products" })}>
        <Create saveButtonProps={saveButtonProps}>
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
              label="mrp"
              name="mrp"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="selling_price"
              name="selling_price"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
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
            <Form.Item
              label="Base Quantity"
              name="base_q"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Free Quantity"
              name="free_q"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Image"
              name="imageURL"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Dragger {...props} beforeUpload={beforeUpload} maxCount={1}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support only for a single upload. Strictly prohibited from
                  uploading company data or other banned files.
                </p>
              </Dragger>
            </Form.Item>
          </Form>
        </Create>
      </Drawer>
      {children}
    </ProductsList>
  );
};

export default ProductsCreate;
