import { type FC, useMemo } from "react";


import { List, type ListProps, type TableProps } from "antd";

import { PaginationTotal } from "@/components";

import { Database } from "@/utilities";
import { ProductCard, ProductCardSkeleton } from "./card";


type Props = {
  tableProps: TableProps<Database["public"]["Tables"]["products"]["Row"]>;
  setCurrent: (current: number) => void;
  setPageSize: (pageSize: number) => void;
};

export const ProductsCardView: FC<Props> = ({
  tableProps: { dataSource, pagination, loading },
  setCurrent,
  setPageSize,
}) => {
  const data = useMemo(() => {
    return [...(dataSource || [])];
  }, [dataSource]);

  return (
    <List
      grid={{
        gutter: 32,
        column: 4,
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 4,
      }}
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <ProductCard product={item} />
        </List.Item>
      )}
      pagination={{
        ...(pagination as ListProps<Database["public"]["Tables"]["products"]["Row"]>["pagination"]),
        hideOnSinglePage: true,
        itemRender: undefined,
        position: "bottom",
        style: { display: "flex", marginTop: "1rem" },
        pageSizeOptions: ["12", "24", "48"],
        onChange: (page, pageSize) => {
          setCurrent(page);
          setPageSize(pageSize);
        },
        showTotal: (total) => (
          <PaginationTotal total={total} entityName="product" />
        ),
      }}
    >
      {loading ? (
        <List
          grid={{
            gutter: 32,
            column: 4,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 4,
          }}
          dataSource={Array.from({ length: 12 }).map((_, i) => ({
            id: i,
          }))}
          renderItem={() => (
            <List.Item>
              <ProductCardSkeleton />
            </List.Item>
          )}
        />
      ) : undefined}
    </List>
  );
};
