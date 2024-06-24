import { type FC, type PropsWithChildren, useState } from "react";

import { List, useTable } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";

import {
  AppstoreOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Form, Grid, Input, Radio, Space, Spin } from "antd";
import debounce from "lodash/debounce";

import { ListTitleButton } from "@/components";
import { Database } from "@/utilities";
import { DistributorsTableView } from "./components/table-view/table-view";

export const DistributorList: FC<PropsWithChildren> = ({ children }) => {
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
    Database["public"]["Tables"]["profiles"]["Row"],
    HttpError,
    { name: string }
  >({
    resource: "profiles",
    filters: {
      mode:"server",
      permanent:[
        {
          field: "role",
          operator: "eq",
          value: "distributor",
        }
      ]
    },
    onSearch: (values) => {
      return [
        {
          field: "username",
          operator: "contains",
          value: values.name,
        },
        {
          field: "full_name",
          operator: "contains",
          value: values.name,
        }
      ];
    },
    pagination: {
      pageSize: 12,
    },
  });

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
                    placeholder="Search by user name"
                    onChange={debouncedOnChange}
                  />
                </Form.Item>
              </Form>
            </Space>
          );
        }}
        contentProps={{
          style: {
            marginTop: "28px",
          },
        }}
        title={
          <ListTitleButton toPath="distributors" buttonText="Add new Distributor" />
        }
      >
        <DistributorsTableView
            tableProps={tableProps}
            filters={filters}
            sorters={sorters}
          />
      </List>
      {children}
    </div>
  );
};