import {
  DateField,
  DeleteButton,
  Edit,
  EditButton,
  NumberField,
  SaveButton,
  ShowButton,
  TextField,
  useEditableTable,
} from "@refinedev/antd";
import { HttpError, useGo, useList, useOne, useUpdate } from "@refinedev/core";
import {
  Button,
  Descriptions,
  Flex,
  Form,
  InputNumber,
  Modal,
  Select,
  Skeleton,
  Space,
  Table,
} from "antd";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { OrderStatus } from "@/utilities/functions";
import { Database } from "@/utilities";

export const OrdersEdit = () => {
  const go = useGo();
  const orderId = useLocation().pathname.split("/")[3];
  const {
    tableProps,
    tableQueryResult: order,
    formProps,
    isEditing,
    setId: setEditId,
    saveButtonProps,
    cancelButtonProps,
    editButtonProps,
  } = useEditableTable<any, HttpError>({
    resource: "orders",
    filters: {
      permanent: [
        {
          field: "id",
          operator: "eq",
          value: orderId ?? "",
        },
      ],
    },
  });
  const expandedRowRender = (record: any) => {
    if (order.data?.data[0].status === OrderStatus.Fulfilled) {
      const columns = [
        {
          title: "Batch ID",
          dataIndex: "batch_id",
          key: "batch_id",
        },
        {
          title: "Quantity",
          dataIndex: "quantity",
          key: "quantity",
        },
      ];

      return (
        <Table
          columns={columns}
          dataSource={record.batch_info}
          pagination={false}
          bordered
          showHeader
        />
      );
    }

    return null;
  };

  // console.log(order.data?.data[0]);

  const { data: profile, isLoading } = useOne<
    Database["public"]["Tables"]["profiles"]["Row"],
    HttpError
  >({
    resource: "profiles",
    id: order.data?.data[0].distributor_id,
  });
  const { data: products, isLoading: productsLoading } = useList<
    Database["public"]["Tables"]["products"]["Row"],
    HttpError
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: order?.data?.data[0]?.order.map((item: any) => item.product_id),
      },
    ],
  });

  const { mutate, isLoading: updateLoading } = useUpdate();

  if (order.isLoading) {
    return <Skeleton active />;
  }

  const handleStatusChange = (value: string) => {
    mutate({
      resource: "orders",
      id: orderId,
      values: {
        status: value,
      },
    });
  };

  const handleProductIncrement = (recordKey: any) => {
    formProps.form?.setFieldValue(
      "quantity",
      formProps.form.getFieldValue("quantity") +
        ((products?.data.find(
          (d) => d.id === order.data?.data[0].order[recordKey - 1].product_id
        )?.base_q ?? 0) +
          (products?.data.find(
            (d) => d.id === order.data?.data[0].order[recordKey - 1].product_id
          )?.free_q ?? 0))
    );
  };
  const handleProductDecrement = (recordKey: any) => {
    if (
      (products?.data.find(
        (d) => d.id === order.data?.data[0].order[recordKey - 1].product_id
      )?.base_q ?? 0) +
        (products?.data.find(
          (d) => d.id === order.data?.data[0].order[recordKey - 1].product_id
        )?.free_q ?? 0) ===
      formProps.form?.getFieldValue("quantity")
    ) {
      return;
    }
    formProps.form?.setFieldValue(
      "quantity",
      formProps.form.getFieldValue("quantity") -
        ((products?.data.find(
          (d) => d.id === order.data?.data[0].order[recordKey - 1].product_id
        )?.base_q ?? 0) +
          (products?.data.find(
            (d) => d.id === order.data?.data[0].order[recordKey - 1].product_id
          )?.free_q ?? 0))
    );
  };

  return (
    <Edit saveButtonProps={{ hidden: true }}>
      <Flex justify="space-between">
        <h2>Order Id: {orderId}</h2>
        <Select
          size="large"
          title="Order status"
          defaultValue={order.data?.data[0].status}
          onChange={(value) => {
            Modal.confirm({
              title: "Are you sure you want to change status?",
              onOk: () => {
                handleStatusChange(value);
              },
              type: "confirm",
            });
          }}
          style={{ width: "10rem" }}
        >
          <Select.Option value={OrderStatus.Pending}>Pending</Select.Option>
          <Select.Option value={OrderStatus.Defected}>Defcted</Select.Option>
          <Select.Option value={OrderStatus.Fulfilled}>
            Fullfilled
          </Select.Option>
          <Select.Option value={OrderStatus.InProcess}>
            In Process
          </Select.Option>
          <Select.Option value={OrderStatus.Cancelled}>Cancelled</Select.Option>
        </Select>
      </Flex>
      <Flex
        justify="space-between"
        align="center"
        gap="20px"
        style={{ marginTop: "20px" }}
      >
        <Space
          direction="vertical"
          style={{ marginTop: "20px", width: "100%" }}
        >
          <Form
            {...formProps}
            onFinish={(values: any) => {
              mutate({
                resource: "orders",
                id: orderId,
                values: {
                  order: order.data?.data[0].order.map(
                    (item: {
                      key: number;
                      product_id: string;
                      quantity: number;
                    }) =>
                      item.key === values.key
                        ? { ...item, quantity: values.quantity }
                        : item
                  ),
                },
              });
              setEditId && setEditId("");
            }}
          >
            <Table
              {...tableProps}
              expandable={{ expandedRowRender, defaultExpandedRowKeys: ["0"] }}
              dataSource={order.data?.data[0].order}
              pagination={false}
              rowKey="key"
              loading={updateLoading}
              onRow={(record: any) => ({
                // eslint-disable-next-line
                onClick: (event: any) => {
                  if (event.target.nodeName === "TD") {
                    setEditId && setEditId(record.key);
                  }
                },
              })}
              title={() => <h2>Products</h2>}
              bordered
              showHeader
            >
              <Table.Column
                title="No"
                dataIndex="key"
                render={(value) => {
                  if (isEditing(value)) {
                    return (
                      <Form.Item
                        name="key"
                        style={{ margin: 0 }}
                        initialValue={value}
                      >
                        <InputNumber readOnly />
                      </Form.Item>
                    );
                  }
                  return <NumberField value={value} />;
                }}
              />
              <Table.Column
                title="Product"
                dataIndex="product_id"
                render={(value, record: any) => {
                  return productsLoading ? (
                    <Skeleton.Input active />
                  ) : (
                    <Button
                      type="dashed"
                      onClick={() =>
                        go({
                          to: {
                            action: "show",
                            resource: "products",
                            id: value,
                          },
                        })
                      }
                    >
                      {
                        products?.data.find((product) => product.id === value)
                          ?.name
                      }
                    </Button>
                  );
                }}
              />
              <Table.Column
                title="Quantity"
                dataIndex={"quantity"}
                render={(value, record: any) => {
                  if (isEditing(record.key)) {
                    return (
                      <Form.Item
                        name="quantity"
                        style={{ margin: 0 }}
                        initialValue={record.quantity}
                      >
                        <InputNumber />
                      </Form.Item>
                    );
                  }
                  return <NumberField value={value} />;
                }}
              />
              <Table.Column
                title="Scheme"
                dataIndex={"quantity"}
                render={(value, record: any) => {
                  if (isEditing(record.key)) {
                    return (
                      <Flex align="center" gap="10px">
                        <Button
                          onClick={() => handleProductDecrement(record.key)}
                        >
                          <MinusOutlined />
                        </Button>
                        <Form.Item name="quantity" style={{ margin: 0 }}>
                          <InputNumber readOnly />
                        </Form.Item>
                        <Button
                          onClick={() => handleProductIncrement(record.key)}
                        >
                          <PlusOutlined />
                        </Button>
                      </Flex>
                    );
                  }
                  return (
                    <TextField
                      value={
                        value -
                        (products?.data.find(
                          (product) => product.id === record.product_id
                        )?.free_q ?? 0) *
                          (value /
                            ((products?.data.find(
                              (product) => product.id === record.product_id
                            )?.free_q ?? 0) +
                              (products?.data.find(
                                (product) => product.id === record.product_id
                              )?.base_q ?? 0))) +
                        "  +  " +
                        (value /
                          ((products?.data.find(
                            (product) => product.id === record.product_id
                          )?.free_q ?? 0) +
                            (products?.data.find(
                              (product) => product.id === record.product_id
                            )?.base_q ?? 0))) *
                          (products?.data.find(
                            (product) => product.id === record.product_id
                          )?.free_q ?? 0)
                      }
                    />
                  );
                }}
              />
              <Table.Column
                title="Actions"
                dataIndex="actions"
                render={(_, record: any) => {
                  if (isEditing(record.key)) {
                    return (
                      <Space>
                        <SaveButton
                          {...saveButtonProps}
                          hideText
                          size="small"
                        />
                        <Button {...cancelButtonProps} size="small">
                          Cancel
                        </Button>
                      </Space>
                    );
                  }
                  return (
                    <Space size="small">
                      <EditButton
                        {...editButtonProps(record.key)}
                        hideText
                        size="small"
                      />
                      <DeleteButton
                        hideText
                        size="small"
                        recordItemId={record.key}
                        mutationMode="pessimistic"
                        onSuccess={() => setEditId("")}
                        onError={() => setEditId("")}
                      />
                    </Space>
                  );
                }}
              />
            </Table>
          </Form>

          <Space style={{ marginTop: "2.5rem" }} direction="vertical">
            <Descriptions
              bordered
              title="Distributor Details"
              extra={
                <ShowButton
                  type="dashed"
                  resource="distributors"
                  recordItemId={order?.data?.data[0]?.distributor_id}
                >
                  View
                </ShowButton>
              }
            >
              <Descriptions.Item label="Name">
                {profile?.data?.username}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {profile?.data?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {profile?.data?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Full Name">
                {profile?.data?.full_name}
              </Descriptions.Item>
              <Descriptions.Item label="Updated at">
                <DateField
                  value={profile?.data?.created_at}
                  format="DD/MM//YYYY"
                />
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </Space>
      </Flex>
    </Edit>
  );
};
