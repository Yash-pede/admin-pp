import { PaginationTotal } from "@/components";
import { Database } from "@/utilities";
import { SearchOutlined } from "@ant-design/icons";
import { List, useTable } from "@refinedev/antd";
import { useGo } from "@refinedev/core";
import { Form, Grid, Input, Space, Spin, Table } from "antd";
import { debounce } from "lodash";

export const UserSelect = () => {
    const go = useGo();
  const { tableProps, searchFormProps, tableQueryResult } = useTable<
    Database["public"]["Tables"]["profiles"]["Row"]
  >({
    resource: "profiles",
    filters: {
      permanent: [
        {
          field: "email",
          operator: "ne",
          value: "admin@pp.com",
        },
      ],
    },
  });

  const screens = Grid.useBreakpoint();

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchFormProps?.onFinish?.({
      name: e.target.value ?? "",
    });
  };

  const debouncedOnChange = debounce(onSearch, 500);

  return (
    <List
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
                    <Spin size="small" spinning={tableQueryResult.isFetching} />
                  }
                  placeholder="Search by name"
                  onChange={debouncedOnChange}
                />
              </Form.Item>
            </Form>
          </Space>
        );
      }}
    >
      <Table
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          pageSizeOptions: ["12", "24", "48", "96"],
          showTotal: (total) => (
            <PaginationTotal total={total} entityName="targets" />
          ),
        }}
        onRow={(row) => {
         return {
           onClick: () => {
            go({to:`/administration/reports/targets/${row.id}`})
           },
         }
        }}
      >
        <Table.Column
          dataIndex="username"
          title="Username"
          render={(value) => {
            return <span>{value}</span>;
          }}
        />
        <Table.Column
          dataIndex="email"
          title="Email"
          render={(value) => {
            return <span>{value}</span>;
          }}
        />
        <Table.Column
          dataIndex="role"
          title="role"
          render={(value) => {
            return <span>{value}</span>;
          }}
        />
        <Table.Column
          dataIndex="phone"
          title="Phone"
          render={(value) => {
            return <span>+91 {value}</span>;
          }}
        />
      </Table>
    </List>
  );
};
