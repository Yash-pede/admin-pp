import { Text } from "@/components";
import { Database } from "@/utilities";
import { ShopOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";
import { useGo, useList } from "@refinedev/core";
import { Button, Card, Flex, Skeleton, Space, Table } from "antd";
import React from "react";

type Props = {
  userDetails: Database["public"]["Tables"]["profiles"]["Row"];
  style?: React.CSSProperties;
};
export const UserInventory = (props: Props) => {
  const gridStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "left",
  };
  const [productWiseArrange, setProductWiseArrange] = React.useState<any>([]);
  const go = useGo();
  const { tableProps, tableQueryResult } = useTable<
    Database["public"]["Tables"]["inventory"]["Row"]
  >({
    resource: "inventory",
    filters: {
      mode: "server",
      permanent: [
        {
          field: "distributor_id",
          operator: "eq",
          value: props.userDetails?.id,
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
        value: tableQueryResult.data?.data.map((item) => item.product_id),
      },
    ],
    queryOptions: {
      enabled: !!props.userDetails && !tableProps.loading,
    },
  });

  React.useEffect(() => {
    const productWiseData: { [productId: string]: any } = {};

    tableQueryResult?.data?.data.forEach((item) => {
      const productId = item.product_id;
      const quantity = item.quantity;

      if (productId in productWiseData) {
        productWiseData[productId].quantity += quantity;
      } else {
        productWiseData[productId] = {
          productId,
          quantity,
        };
      }
    });

    const arrangedProducts = Object.values(productWiseData);

    setProductWiseArrange(arrangedProducts);
  }, [isLoadingProducts, tableQueryResult]);

  return (
    <Card
      title={
        <Flex align="center" justify="space-between">
          <Space size={15}>
            <ShopOutlined className="sm" />
            <Text>User Inventory</Text>
          </Space>
          <Button
            onClick={() =>
              go({
                to: `/clients/distributors/inventory/${props.userDetails?.id}`,
              })
            }
          >
            Details
          </Button>
        </Flex>
      }
      headStyle={{
        padding: "1rem",
      }}
      bodyStyle={{
        padding: "0",
      }}
      style={{
        maxWidth: "500px",
        ...props.style,
      }}
    >
      <Table {...tableProps} dataSource={productWiseArrange} rowKey={"id"}>
        <Table.Column dataIndex="id" title="ID" hidden />
        <Table.Column
          dataIndex="productId"
          title="Product ID"
          render={(value) => {
            if (isLoadingProducts) {
              return <Skeleton.Input style={{ width: 100 }} />;
            }
            const product = products?.data?.find(
              (item) => item.id === value
            ) as Database["public"]["Tables"]["products"]["Row"];
            return product?.name;
          }}
        />
        <Table.Column dataIndex="quantity" title="Quantity" />
        <Table.Column
          title="Details"
          render={() => (
            <Button
              type="link"
              onClick={() =>
                go({
                  to: { action: "show", resource: "inventory", id: "details" },
                })
              }
            >
              Details
            </Button>
          )}
        />
      </Table>
    </Card>
  );
};
