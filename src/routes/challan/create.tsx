import React, { useEffect } from "react";
import {
  useCreate,
  useGetIdentity,
  useGo,
  useList,
  useOne,
} from "@refinedev/core";
import { Create, useModal, useSelect } from "@refinedev/antd";
import {
  Button,
  Form,
  Modal,
  Select,
  Table,
  type FormProps,
  Typography,
  InputNumber,
  Flex,
} from "antd";
import { challanProductAddingType } from "@/utilities/constants";
import { PdfLayout } from "./components/ChallanPreview";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Database } from "@/utilities";

export const ChallanCreate = ({ sales }: { sales?: boolean }) => {
  const go = useGo();
  const [challan, setChallan] = React.useState<any>([]);
  const [availableqty, setAvailableqty] = React.useState<any>();
  const [customer, setCustomer] = React.useState<any>();
  const [totalAmount, setTotalAmount] = React.useState<any>();
  const [billAmount, setBillAmount] = React.useState<any>();
  const { show, close, modalProps } = useModal();
  const { data: User } = useGetIdentity<any>();

  const { data: bossData, isLoading: isLoadingBossId } = useOne<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    id: User?.id,
    queryOptions: {
      enabled: !!User && sales,
    },
  });

  const { data: inventory } = useList<
    Database["public"]["Tables"]["inventory"]["Row"]
  >({
    resource: "inventory",
    filters: [
      {
        field: "distributor_id",
        operator: "eq",
        value: sales ? bossData?.data?.boss_id : User?.id,
      },
    ],
  });

  const { selectProps: productSelectProps, queryResult: products } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
    filters: [
      {
        field: "id",
        operator: "in",
        value: inventory?.data
          ?.filter((stock) => (stock.quantity ?? 0) > 0)
          .map((stock) => stock.product_id),
      },
    ],
    onSearch: (value) => {
      return [
        {
          field: "name",
          operator: "contains",
          value,
        },
      ];
    },
  });

  const onFinish: FormProps<challanProductAddingType>["onFinish"] = (
    values,
  ) => {
    setChallan((prevChallan: any[]) => {
      close();
      if (prevChallan) {
        return [...prevChallan, values];
      }
      return [values];
    });
    form.resetFields();
    setAvailableqty(null);
  };
  const {
    close: closePdfModal,
    show: showPdfModal,
    modalProps: pdfModalProps,
  } = useModal();
  const { mutate, isError } =
    useCreate<Database["public"]["Tables"]["challan"]["Insert"]>();
  const { data: allProducts, isLoading: allProductsLoading } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
    resource: "products",
  });
  useEffect(() => {
    if (challan && allProducts?.data) {
      const newTotalAmount: number = challan.reduce(
        (total: number, item: any) => {
          const product = allProducts.data.find(
            (product: any) => product.id === item.product_id,
          );
          if (product) {
            const subtotal: number =
              item.quantity * (product.selling_price || 0);
            const discountAmount: number =
              subtotal * (item.discount * 0.01 || 0);
            return total + subtotal - discountAmount;
          }
          return total;
        },
        0 as number,
      );
      const newBillAmount: number = challan.reduce(
        (total: number, item: any) => {
          const product = allProducts.data.find(
            (product: any) => product.id === item.product_id,
          );
          if (product) {
            const subtotal: number =
              item.quantity * (product.selling_price || 0);
            return total + subtotal;
          }
          return total;
        },
        0 as number,
      );

      setBillAmount(newBillAmount);
      setTotalAmount(newTotalAmount);
    }
  }, [challan, allProducts?.data]);

  const onChallanCreate = () => {
    mutate({
      resource: "challan",
      values: {
        distributor_id: sales ? bossData?.data?.boss_id : User?.id,
        product_info: challan,
        total_amt: totalAmount,
        received_amt: 0,
        pending_amt: totalAmount,
        customer_id: customer,
        bill_amt: billAmount,
        sales_id: sales ? User?.id : null,
      },
    });
    if (!isError) {
      go({
        to: { action: "list", resource: "challan" },
        options: {
          keepQuery: true,
        },
        type: "push",
      });
    }
  };
  const { selectProps: customerSelectProps } = useSelect<
    Database["public"]["Tables"]["customers"]["Row"]
  >({
    resource: "customers",
    optionValue: "id",
    optionLabel: "full_name",
    filters: [
      {
        field: sales ? "sales_id" : "distributor_id",
        operator: "eq",
        value: User?.id,
      },
    ],
  });

  const [form] = Form.useForm();
  const handleProductIncrement = (productId: any) => {
    form.setFieldValue(
      "quantity",
      form.getFieldValue("quantity") +
        ((allProducts?.data.find((d) => d.id === productId)?.base_q ?? 0) +
          (allProducts?.data.find((d) => d.id === productId)?.free_q ?? 0)),
    );
  };
  const handleProductDecrement = (productId: any) => {
    if (
      (allProducts?.data.find((d) => d.id === productId)?.base_q ?? 0) +
        (allProducts?.data.find((d) => d.id === productId)?.free_q ?? 0) ===
      form?.getFieldValue("quantity")
    ) {
      return;
    }
    form?.setFieldValue(
      "quantity",
      form.getFieldValue("quantity") -
        ((allProducts?.data.find((d) => d.id === productId)?.base_q ?? 0) +
          (allProducts?.data.find((d) => d.id === productId)?.free_q ?? 0)),
    );
  };
  return (
    <>
      <Create
        saveButtonProps={{ style: { display: "none" } }}
        footerButtons={
          <Button type="primary" onClick={onChallanCreate}>
            Create Challan
          </Button>
        }
        headerButtons={
          <>
            <Button style={{ margin: "10px 0" }} onClick={show}>
              Add Products
            </Button>

            <Button
              disabled={!customer || !challan.length}
              onClick={() => {
                showPdfModal();
              }}
            >
              Preview Challan
            </Button>
          </>
        }
      >
        <div
          style={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            marginBottom: "10px",
            gap: "10px",
          }}
        >
          <label>Select Customer</label>
          <Select
            style={{ width: "100%" }}
            onSelect={(value) => setCustomer(value)}
            {...customerSelectProps}
          />
        </div>
        <Table
          dataSource={challan}
          columns={[
            {
              title: "Product",
              dataIndex: "product_id",
              render: (value) => (
                <Typography.Text>
                  {
                    products.data?.data.find((product) => product.id === value)
                      ?.name
                  }
                </Typography.Text>
              ),
            },
            {
              title: "Quantity",
              dataIndex: "quantity",
            },
          ]}
        />
      </Create>
      <Modal
        {...modalProps}
        okButtonProps={{ style: { display: "none" } }}
        onCancel={() => {
          form.resetFields();
          setAvailableqty(null);
          close();
        }}
        
      >
        <Form
          form={form}
          name="Product Challan"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
        >
          {availableqty ? (
            <Button type="text" style={{ width: "100%" }}>
              Available Quantity {availableqty}
            </Button>
          ) : null}
          <Form.Item<challanProductAddingType>
            label="Product"
            name="product_id"
            rules={[{ required: true, message: "Product is required" }]}
          >
            <Select {...productSelectProps} />
          </Form.Item>

          <Form.Item<challanProductAddingType>
            label="Quantity"
            name="quantity"
            initialValue={0}
          >
            <Flex align="center" gap="10px">
              <Button
                type="primary"
                style={{ background: "red" }}
                onClick={() =>
                  handleProductDecrement(form.getFieldValue("product_id"))
                }
              >
                <MinusOutlined />
              </Button>
              <Form.Item name="quantity" style={{ margin: 0 }}>
                <InputNumber readOnly />
              </Form.Item>
              <Button
                type="primary"
                onClick={() =>
                  handleProductIncrement(form.getFieldValue("product_id"))
                }
              >
                <PlusOutlined />
              </Button>
            </Flex>
          </Form.Item>
          <Form.Item<challanProductAddingType>
            label="discount"
            name="discount"
            initialValue={0}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        {...pdfModalProps}
        style={{ width: "100% !important" }}
        okButtonProps={{ style: { display: "none" } }}
      >
        <PdfLayout billInfo={challan} customerId={customer} />
      </Modal>
    </>
  );
};
