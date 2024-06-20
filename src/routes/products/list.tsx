import { type FC, type PropsWithChildren, useState } from "react";

import { List, useTable } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";

import {
  AppstoreOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Form, Grid, Input, Radio, Space, Spin, Table } from "antd";
import debounce from "lodash/debounce";

import { ListTitleButton } from "@/components";
import { Database } from "@/utilities";
import { ProductsTableView } from "./components/table-view/table-view";
import { ProductsCardView } from "./components/card-view";

type View = "card" | "table";

export const ProductsList: FC<PropsWithChildren> = ({ children }) => {
  const [view, setView] = useState<View>("card");
  const screens = Grid.useBreakpoint();

  const {
    tableProps,
    tableQueryResult,
    searchFormProps,
    filters,
    sorters,
    setCurrent,
    setPageSize,
    setFilters,
  } = useTable<
    Database["public"]["Tables"]["products"]["Row"],
    HttpError,
    { name: string }
  >({
    resource: "products",
    onSearch: (values) => {
      return [
        {
          field: "name",
          operator: "contains",
          value: values.name,
        },
      ];
    },
    pagination: {
      pageSize: 12,
    },
  });

  const onViewChange = (value: View) => {
    setView(value);
    setFilters([], "replace");
    // TODO: useForm should handle this automatically. remove this when its fixed from antd useForm.
    searchFormProps.form?.resetFields();
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchFormProps?.onFinish?.({
      name: e.target.value ?? "",
    });
  };
  const debouncedOnChange = debounce(onSearch, 500);

  return (
    <div className="page-container">
      <List
        breadcrumb={false}
        headerButtons={() => {
          return (
            <Space
              style={{
                marginTop: screens.xs ? "1.6rem" : undefined,
              }}
            >
              <Form {...searchFormProps} layout="inline">
                <Form.Item name="name" noStyle>
                  <Input
                    size="large"
                    prefix={<SearchOutlined className="anticon tertiary" />}
                    suffix={
                      <Spin
                        size="small"
                        spinning={tableQueryResult.isFetching}
                      />
                    }
                    placeholder="Search by name"
                    onChange={debouncedOnChange}
                  />
                </Form.Item>
              </Form>
              {!screens.xs ? (
                <Radio.Group
                  size="large"
                  value={view}
                  onChange={(e) => onViewChange(e.target.value)}
                >
                  <Radio.Button value="table">
                    <UnorderedListOutlined />
                  </Radio.Button>
                  <Radio.Button value="card">
                    <AppstoreOutlined />
                  </Radio.Button>
                </Radio.Group>
              ) : null}
            </Space>
          );
        }}
        contentProps={{
          style: {
            marginTop: "28px",
          },
        }}
        title={
          <ListTitleButton toPath="products" buttonText="Add new Product" />
        }
      >
        {/* <Table {...tableProps} rowKey={"id"}>
        <Table.Column 
          dataIndex="name"
          title="Name"
          render={(value) => <>{value}</>}
        />
        <Table.Column
          dataIndex="description"
          title="Description"
          render={(value) => <>{value}</>}
        />
        <Table.Column
          dataIndex="mrp"
          title="mrp"
          render={(value) => <>{value}</>}
        />
        
        </Table> */}
        {view === "table" ? (
          <ProductsTableView
            tableProps={tableProps}
            filters={filters}
            sorters={sorters}
          />
        ) : (
          <ProductsCardView
            tableProps={tableProps}
            setPageSize={setPageSize}
            setCurrent={setCurrent}
          />
        )}
      </List>
      {children}
    </div>
  );
};
