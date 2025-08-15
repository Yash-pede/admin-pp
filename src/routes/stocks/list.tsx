import { PaginationTotal } from "@/components";
import { Database } from "@/utilities";
import { SearchOutlined } from "@ant-design/icons";
import {
  DateField,
  DeleteButton,
  EditButton,
  ExportButton,
  FilterDropdown,
  SaveButton,
  Show,
  TextField,
  getDefaultSortOrder,
  useEditableTable,
  useSelect,
} from "@refinedev/antd";
import { getDefaultFilter, useExport, useGo, useList } from "@refinedev/core";
import {
  Button,
  Flex,
  Form,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Table,
} from "antd";
import dayjs from "dayjs";

export const StocksList = ({ children }: { children?: React.ReactNode }) => {
  const go = useGo();
  const {
    tableProps,
    formProps,
    isEditing,
    setId: setEditId,
    saveButtonProps,
    cancelButtonProps,
    editButtonProps,
    tableQueryResult,
    filters,
    sorter,
  } = useEditableTable<Database["public"]["Tables"]["stocks"]["Row"]>({
    resource: "stocks",
    pagination: {
      pageSize: 12,
    },
    filters: {
      permanent: [
        {
          field: "available_quantity",
          operator: "gt",
          value: 0,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });
  const { data: products, isLoading: isLoadingProducts } = useList({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "in",
        value: tableQueryResult?.data?.data?.map((item) => item.product_id),
      },
    ],
    pagination: {
      mode:'off',
      pageSize: 100000,
    },
  });

  const { triggerExport, isLoading: exportLoading } = useExport({
    resource: "stocks",
    filters: [
      {
        field: "product_id",
        operator: "in",
        value: tableQueryResult?.data?.data?.map((item) => item.product_id),
      },
      {
        field: "available_quantity",
        operator: "gt",
        value: 0,
      },
    ],
    download: true,
    onError(error) {
      console.error(error);
    },
    mapData: (record) => {
      return {
        product_id: record.product_id,
        id: record.id,
        available_quantity: record.available_quantity,
        ordered_quantity: record.ordered_quantity,
        expiry_date: dayjs(record.expiry_date).format("DD-MM-YYYY"),
        created_at: dayjs(record.created_at).format("DD-MM-YYYY"),
      };
    },
    exportOptions: {
      filename: "inventory",
    },pageSize: 100000
  });
  const { selectProps } = useSelect({
    resource: "stocks",
    optionLabel: "id",
    optionValue: "id",
    defaultValue: getDefaultFilter("stocks.id", filters, "in"),
  });
  const { selectProps: ProductSelectProps } = useSelect({
    resource: "products",
    optionLabel: "name",
    optionValue: "id",
    defaultValue: getDefaultFilter("products.id", filters, "in"),
  });

  return (
    <>
      <Show
        headerButtons={
          <Flex gap={10}>
            <Button
              type="primary"
              onClick={() => go({ to: "/stocks/past" })}
            >
              Past
            </Button>
            <Button
              type="primary"
              onClick={() => go({ to: "/stocks/product-wise" })}
            >
              Product wise
            </Button>
            <ExportButton onClick={triggerExport} loading={exportLoading} />
          </Flex>
        }
      >
        <Form {...formProps}>
          <Table
            {...tableProps}
            key={"id"}
            bordered
            pagination={{
              ...tableProps.pagination,
              pageSizeOptions: ["12", "24", "48", "96"],
              showTotal: (total) => (
                <PaginationTotal total={total} entityName="Stock's" />
              ),
            }}
            rowKey="id"
            onRow={(record) => ({
              // eslint-disable-next-line
              onClick: (event: any) => {
                if (event.target.nodeName === "TD") {
                  setEditId && setEditId(record.id);
                }
              },
            })}
          >
            <Table.Column<Database["public"]["Tables"]["stocks"]["Row"]>
              dataIndex={"id"}
              title="Batch No"
              filterIcon={<SearchOutlined />}
              filterDropdown={(props) => (
                <FilterDropdown {...props} mapValue={(value) => value}>
                  <Select
                    style={{ minWidth: 200 }}
                    mode="multiple"
                    {...selectProps}
                  />
                </FilterDropdown>
              )}
            />

            <Table.Column<Database["public"]["Tables"]["stocks"]["Row"]>
              dataIndex={"product_id"}
              title="product"
              filterIcon={<SearchOutlined />}
              filterDropdown={(props) => (
                <FilterDropdown {...props} mapValue={(value) => value}>
                  <Select
                    style={{ minWidth: 200 }}
                    mode="multiple"
                    {...ProductSelectProps}
                  />
                </FilterDropdown>
              )}
              render={(_value, record) => {
                if (isLoadingProducts) {
                  return <Skeleton.Input active />;
                }
                return (
                  <Button
                    type="dashed"
                    onClick={() => {
                      go({
                        to: {
                          action: "edit",
                          resource: "products",
                          id: _value,
                        },
                        options: { keepQuery: false },
                        type: "replace",
                      });
                    }}
                  >
                    {
                      products?.data.find(
                        (item) => item.id === record.product_id
                      )?.name
                    }
                  </Button>
                );
              }}
            />

            <Table.Column<Database["public"]["Tables"]["stocks"]["Row"]>
              dataIndex={"available_quantity"}
              title="Avalable Quantity"
              sorter={{ multiple: 2 }}
              defaultSortOrder={getDefaultSortOrder("id", sorter)}
              render={(value, record) => {
                if (isEditing(record.id)) {
                  return (
                    <Form.Item name="available_quantity" style={{ margin: 0 }}>
                      <InputNumber />
                    </Form.Item>
                  );
                }
                return <TextField value={value} />;
              }}
            />
            <Table.Column<Database["public"]["Tables"]["stocks"]["Row"]>
              dataIndex={"ordered_quantity"}
              title="Ordered Quantity"
              sorter={{ multiple: 2 }}
              defaultSortOrder={getDefaultSortOrder("id", sorter)}
              render={(value, record) => {
                if (isEditing(record.id)) {
                  return (
                    <Form.Item name="ordered_quantity" style={{ margin: 0 }}>
                      <InputNumber />
                    </Form.Item>
                  );
                }
                return <TextField value={value} />;
              }}
            />
            <Table.Column
              dataIndex={"created_at"}
              title="Created At"
              sorter={{ multiple: 2 }}
              defaultSortOrder={getDefaultSortOrder("id", sorter)}
              render={(value) => {
                return (
                  <Space>
                    {/* <DatePicker defaultValue={dayjs(value)} /> */}
                    <DateField value={value} format="DD/MM/YYYY" />
                  </Space>
                );
              }}
            />
            <Table.Column
              dataIndex={"expiry_date"}
              title="Expiry At"
              sorter={{ multiple: 2 }}
              defaultSortOrder={getDefaultSortOrder("id", sorter)}
              render={(value) => {
                return (
                  <Space>
                    {/* <DatePicker defaultValue={dayjs(value)} /> */}
                    <DateField value={value} format="DD/MM/YYYY" />
                  </Space>
                );
              }}
            />
            <Table.Column<Database["public"]["Tables"]["stocks"]["Row"]>
              title="Actions"
              dataIndex="actions"
              render={(_, record) => {
                if (isEditing(record.id)) {
                  return (
                    <Space>
                      <SaveButton {...saveButtonProps} hideText size="small" />
                      <Button {...cancelButtonProps} size="small">
                        Cancel
                      </Button>
                    </Space>
                  );
                }
                return (
                  <Space size="small">
                    <EditButton
                      {...editButtonProps(record.id)}
                      hideText
                      size="small"
                    />
                    <DeleteButton
                      hideText
                      size="small"
                      recordItemId={record.id}
                      resource="stocks"
                      mutationMode="undoable"
                      errorNotification={{
                        message: "Failed to delete",
                        description:
                          "Please ensure their is no stock in the batch",
                        type: "error",
                      }}
                    />
                  </Space>
                );
              }}
            />
          </Table>
        </Form>
      </Show>
      {children}
    </>
  );
};
