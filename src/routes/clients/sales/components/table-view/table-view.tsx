import { useRef, useState, type FC } from "react";

import {
  DateField,
  DeleteButton,
  EditButton,
  FilterDropdown,
  TextField,
} from "@refinedev/antd";
import {
  type CrudFilters,
  type CrudSorting,
  getDefaultFilter,
  useList,
  GetListResponse,
} from "@refinedev/core";

import { EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Input,
  InputRef,
  Select,
  Skeleton,
  Space,
  Table,
  type TableProps,
} from "antd";
import { PaginationTotal } from "@/components";
import { Database } from "@/utilities";
import { banUser } from "@/utilities/functions";

type Props = {
  tableProps: TableProps<Database["public"]["Tables"]["profiles"]["Row"]>;
  filters: CrudFilters;
  sorters: CrudSorting;
  tableQueryResult: GetListResponse<
    Database["public"]["Tables"]["profiles"]["Row"]
  >;
};
let index = 0;

export const SalesTableView: FC<Props> = ({
  tableProps,
  filters,
  tableQueryResult,
}) => {
  const [items, setItems] = useState(["30m", "1h", "24h", "7d", "30d"]);
  const [name, setName] = useState("");
  const inputRef = useRef<InputRef>(null);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const addItem = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    setItems([...items, name || `New item ${index++}`]);
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };
  const { data: Profile, isLoading: isLoadingProfile } = useList({
    resource: "profiles",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "distributor",
      },
      {
        field: "id",
        operator: "in",
        value: tableQueryResult?.data
          ?.filter((item) => !!item.boss_id)
          .map((item) => item.boss_id),
      },
    ],
    queryOptions: {
      enabled: !!tableQueryResult,
    },
  });
  return (
    <Table
      {...tableProps}
      pagination={{
        ...tableProps.pagination,
        pageSizeOptions: ["12", "24", "48", "96"],
        showTotal: (total) => (
          <PaginationTotal total={total} entityName="profiles" />
        ),
      }}
      rowKey="id"
    >
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="id"
        title="ID"
        hidden
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="username"
        title="Name"
        defaultFilteredValue={getDefaultFilter("username", filters)}
        filterIcon={<SearchOutlined />}
        filterDropdown={(props) => (
          <FilterDropdown {...props}>
            <Input placeholder="Search UserName" />
          </FilterDropdown>
        )}
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="email"
        title="email"
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="full_name"
        title="Full Name"
        render={(value) => <div>{value}</div>}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="phone"
        title="phone"
        render={(value) => <TextField value={"+91 " + value} />}
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        dataIndex="boss_id"
        title="Distributor"
       render={(value) => value} 
      />
      <Table.Column<Database["public"]["Tables"]["profiles"]["Row"]>
        fixed="right"
        dataIndex="id"
        title="Actions"
        render={(value, row) => (
          <Space>
            <EditButton
              icon={<EyeOutlined />}
              hideText
              size="small"
              recordItemId={value}
            />

            <Select
              style={{ width: 100 }}
              placeholder="BAN"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <Space style={{ padding: "0 8px 4px" }}>
                    <Input
                      placeholder="xh"
                      ref={inputRef}
                      value={name}
                      onChange={onNameChange}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={addItem}
                    >
                      Add item
                    </Button>
                  </Space>
                </>
              )}
              size="small"
              options={items.map((item) => ({ label: item, value: item }))}
            />
            {/* <DeleteButton hideText size="small" recordItemId={value} /> */}
          </Space>
        )}
      />
    </Table>
  );
};
