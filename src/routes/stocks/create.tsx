import { useDrawerForm } from "@refinedev/antd";
import {
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Skeleton,
} from "antd";
import { useLocation } from "react-router-dom";
import { useGo, useOne } from "@refinedev/core";
import { StocksList } from "./list";
import dayjs from "dayjs";

export const StocksCreate = () => {
  const go = useGo();
  const { formProps, drawerProps, saveButtonProps } = useDrawerForm({
    defaultVisible: true,
    action: "create",
    resource: "stocks",
    redirect: "list",
  });
  const queryParams = useLocation().search;
  const params = new URLSearchParams(queryParams);
  const productIdFromUrl = params.get("product");

  const { data: productById, isLoading: isLoadingProductById } = useOne({
    resource: "products",
    id: productIdFromUrl ? productIdFromUrl : "",
    queryOptions: {
      enabled: !!productIdFromUrl,
    },
  });
  return (
    <StocksList>
      <Drawer
        {...drawerProps}
        onClose={() =>
          go({
            to: { action: "list", resource: "stocks" },
          })
        }
        footer={
          <Button {...saveButtonProps} type="primary" htmlType="submit">
            Create
          </Button>
        }
      >
        <Form
          {...formProps}
          layout="vertical"
          style={{ width: "100%", gap: "10px" }}
        >
          <Form.Item
            style={{ width: "100%" }}
            name="product_id"
            hidden
            label="Product"
            initialValue={productIdFromUrl}
          >
            <Input style={{ width: "100%" }} readOnly />
          </Form.Item>
          <Form.Item
            style={{ width: "100%" }}
            name="Product Name"
            label="Product"
          >
            {isLoadingProductById ? (
              <Skeleton.Input active style={{ width: "100%" }} />
            ) : (
              <Input
                style={{ width: "100%" }}
                readOnly
                defaultValue={productById?.data?.name}
              />
            )}
          </Form.Item>
          <Form.Item
            style={{ width: "100%" }}
            name="available_quantity"
            label="Quantity"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            style={{ width: "100%" }}
            name="id"
            label="Batch No"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            style={{ width: "100%" }}
            name="expiry_date"
            label="Expiry Date"
            rules={[
              {
                required: true,
              },
            ]}
            getValueProps={(value) => ({
              value: value ? dayjs(value) : null,
            })}
            getValueFromEvent={(date) => {
              return date ? date.startOf("day").toISOString() : null;
            }}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Drawer>
    </StocksList>
  );
};
