import { Database } from "@/utilities";
import { Show, TextField, useTable } from "@refinedev/antd";
import { useGo, useList } from "@refinedev/core";
import { Button, Table } from "antd";
import React, { useEffect } from "react";

export const StocksProductWise = () => {
  const go = useGo();
  const [productWiseArrange, setProductWiseArrange] = React.useState<any>([]);
  const { tableProps, tableQueryResult } = useTable<
    Database["public"]["Tables"]["stocks"]["Row"]
  >({
    resource: "stocks",
    filters: {
      permanent: [
        {
          field: "available_quantity",
          operator: "gt",
          value: "0",
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "asc",
        },
      ],
    },
  });
  const { data: products, isLoading: isLoadingProducts } = useList<
    Database["public"]["Tables"]["products"]["Row"]
  >({
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
      pageSize: 1000,
    },
  });

  useEffect(() => {
    const productWiseData: { [productId: string]: any } = {};

    tableQueryResult?.data?.data.forEach((item) => {
      const productId = item.product_id;
      const availableQuantity = item.available_quantity;
      const orderedQuantity = item.ordered_quantity;

      if (productId in productWiseData) {
        productWiseData[productId].availableQuantity += availableQuantity;
        productWiseData[productId].orderedQuantity += orderedQuantity;
      } else {
        productWiseData[productId] = {
          productId,
          availableQuantity,
          orderedQuantity,
        };
      }
    });

    const arrangedProducts = Object.values(productWiseData);

    setProductWiseArrange(arrangedProducts);
  }, [isLoadingProducts, tableQueryResult]);

  return (
    <Show>
      <Table
        {...tableProps}
        dataSource={productWiseArrange}
        columns={[
          {
            title: "Product",
            dataIndex: "productId",
            key: "productId",
            render: (value, record) => {
              return (
                <Button
                  type="dashed"
                  onClick={() => {
                    go({
                      to: {
                        action: "show",
                        resource: "products",
                        id: value,
                      },
                      options: { keepQuery: false },
                      type: "replace",
                    });
                  }}
                >
                  {products?.data.find((item) => item.id === value)?.name}
                </Button>
              );
            },
          },
          {
            title: "Available Quantity",
            dataIndex: "availableQuantity",
            key: "availableQuantity",
            render: (value, record) => {
              return <TextField value={value} />;
            },
          },
          {
            title: "Ordered Quantity", hidden: true,
            dataIndex: "orderedQuantity",
            key: "orderedQuantity",
            render: (value, record) => {
              return <TextField value={value} />;
            },
          },
        ]}
      />
    </Show>
  );
};
