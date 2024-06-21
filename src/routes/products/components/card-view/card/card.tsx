import type { FC } from "react";

import { useDelete, useGo } from "@refinedev/core";

import { DeleteOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Flex, Image } from "antd";
import { Database } from "@/utilities";
import { ProductCardSkeleton } from "./skeleton";
import { Text } from "@/components";
import { supabaseBucket_Product_images } from "@/utilities/constants";

type Props = {
  product: Database["public"]["Tables"]["products"]["Row"];
};

export const ProductCard: FC<Props> = ({ product }) => {
  const go = useGo();
  const { mutate } = useDelete();

  if (!product) return <ProductCardSkeleton />;

  return (
    <Card size="small">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Dropdown
          menu={{
            items: [
              {
                label: "Edit Product",
                key: "1",
                icon: <EyeOutlined />,
                onClick: () => {
                  go({
                    to: {
                      resource: "products",
                      action: "edit",
                      id: product.id,
                    },
                  });
                },
              },
              {
                danger: true,
                label: "Delete product",
                key: "2",
                icon: <DeleteOutlined />,
                onClick: () => {
                  mutate({
                    resource: "products",
                    id: product.id,
                  });
                },
              },
            ],
          }}
          placement="bottom"
          arrow
        >
          <Button
            type="text"
            shape="circle"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
            icon={
              <MoreOutlined
                style={{
                  transform: "rotate(90deg)",
                }}
              />
            }
          />
        </Dropdown>

        <Flex vertical gap="middle">
          <Text size="xl" strong>
            {product.name}
          </Text>
          <Image
            width={"100%"}
            height={"230px"}
            src={supabaseBucket_Product_images + product.imageURL}
            loading="lazy"
          />
          <div
            style={{
              display: "flex",
              gap: "8px",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text>Base: {product.base_q}</Text>+
            <Text>Free: {product.free_q}</Text>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text> ₹ {product.selling_price}</Text>
            <Text> MRP: {product.mrp}</Text>
          </div>
        </Flex>
        <Button
          style={{ width: "100%",margin:"1rem 0" }}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            go({
              to: { resource: "stocks", action: "create" },
              type: "push",
              options: { keepQuery: true },
              query: { product: product.id },
            });
          }}
          type="primary"
        >
          Add to Stock
        </Button>
      </div>
    </Card>
  );
};
