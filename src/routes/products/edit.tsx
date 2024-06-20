import { Database } from "@/utilities";
import { supabaseBucket_Product_images } from "@/utilities/constants";
import { DateField, DeleteButton, Show } from "@refinedev/antd";
import { HttpError, useGo, useList } from "@refinedev/core";
import { Button, Descriptions, Flex, Grid, Image, Row, Skeleton } from "antd";
import React from "react";
import { useLocation } from "react-router-dom";

export const ProductsEdit = () => {
  const { pathname } = useLocation();
  const id = pathname.split("/").pop();
  const go = useGo();
  const { data: Product, isLoading } = useList<
    Database["public"]["Tables"]["products"]["Row"],
    HttpError
  >({
    resource: "products",
    filters: [
      {
        field: "id",
        operator: "eq",
        value: id,
      },
    ],
  });
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;
  if (isLoading) return <Skeleton active />;
  return (
    <>
      <Show>
        {isMobile ? (
          <>
            <Row justify="center" align="middle" style={{ gap: "16px" }}>
              <Descriptions bordered size="default">
                <Descriptions.Item label="Name">
                  {Product?.data[0]?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {Product?.data[0]?.description}
                </Descriptions.Item>
                <Descriptions.Item label="Selling price">
                  {Product?.data[0]?.selling_price}
                </Descriptions.Item>
                <Descriptions.Item label="Scheme">
                  {Product?.data[0]?.base_q + " + " + Product?.data[0]?.free_q}
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  {Product?.data[0]?.mrp}
                </Descriptions.Item>
                <Descriptions.Item label="Updated at">
                  <DateField
                    value={Product?.data[0]?.created_at}
                    format="DD/MM/YYYY"
                  ></DateField>
                </Descriptions.Item>
              </Descriptions>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "50%",
                }}
              >
                <Button type="primary" style={{ width: "50%" }} size="large">
                  Edit
                </Button>

                <DeleteButton
                  style={{ width: "50%" }}
                  onSuccess={() => {
                    go({
                      to: "/products",
                      type: "push",
                    });
                  }}
                />
              </div>
            </Row>
            <div>
              <Image
                src={`${supabaseBucket_Product_images}${Product?.data[0].imageURL}`}
                alt=""
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "3%",
                  overflow: "hidden",
                  marginTop: "16px",
                }}
              />
            </div>
          </>
        ) : (
          <Flex justify="space-between" align="middle">
            <Row justify="center" align="middle" style={{ gap: "16px" }}>
              <Descriptions bordered size="default">
                <Descriptions.Item label="Name">
                  {Product?.data[0]?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {Product?.data[0]?.description}
                </Descriptions.Item>
                <Descriptions.Item label="Selling price">
                  {Product?.data[0]?.selling_price}
                </Descriptions.Item>
                <Descriptions.Item label="Price">
                  {Product?.data[0]?.mrp}
                </Descriptions.Item>
                <Descriptions.Item label="Updated at">
                  <DateField
                    value={Product?.data[0]?.created_at}
                    format="DD/MM/YYYY"
                  ></DateField>
                </Descriptions.Item>
              </Descriptions>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "50%",
                }}
              >
                <Button type="primary" style={{ width: "50%" }} size="large">
                  Edit
                </Button>

                <DeleteButton
                  style={{ width: "50%" }}
                  onSuccess={() => {
                    go({
                      to: "/products",
                      type: "push",
                    });
                  }}
                />
              </div>
            </Row>
            <div>
              <Image
                src={`${supabaseBucket_Product_images}${Product?.data[0].imageURL}`}
                alt=""
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "3%",
                  overflow: "hidden",
                }}
              />
            </div>
          </Flex>
        )}
      </Show>
    </>
  );
};
