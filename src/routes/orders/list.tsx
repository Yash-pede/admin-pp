import {
    DateField,
    EditButton,
    List,
    useTable,
    ExportButton,
    getDefaultSortOrder,
    FilterDropdown,
    useSelect,
  } from "@refinedev/antd";
  import {
    HttpError,
    useList,
    useExport,
    getDefaultFilter,
  } from "@refinedev/core";
  import { Select, Space, Table, Input, Skeleton } from "antd";
  import React, { useEffect } from "react";
  import dayjs from "dayjs";
  import { SearchOutlined } from "@ant-design/icons";
  import { useLocation, useSearchParams } from "react-router-dom";
import { Database } from "@/utilities";
import { OrderStatus } from "@/utilities/functions";
  
  export const OrdersList = () => {
    const [searchParams] = useSearchParams();
  
    const { tableProps, sorter, filters, setFilters } = useTable<
      Database["public"]["Tables"]["orders"]["Row"],
      HttpError
    >({
      resource: "orders",
      sorters: {
        initial: [
          {
            field: "id",
            order: "desc",
          },
        ],
      },
    });
    const { data: profiles, isLoading: isLoadingProfiles } = useList({
      resource: "profiles",
      filters: [
        {
          field: "role",
          operator: "eq",
          value: "distributor",
        },
      ],
    });
  
    const { selectProps } = useSelect({
      resource: "profiles",
      optionLabel: "username",
      optionValue: "id",
      filters: [
        {
          field: "role",
          operator: "eq",
          value: "distributor",
        },
      ],
      defaultValue: getDefaultFilter("profiles.username", filters, "in"),
    });
  
    const { isLoading: exportLoading, triggerExport } = useExport({
      resource: "orders",
      download: true,
      onError(error) {
        console.error(error);
      },
      mapData: (record) => {
        return {
          distributor_name:
            profiles?.data.find((profile) => profile.id === record.distributor_id)
              ?.username ||
            record.distributor_id.full_name ||
            record.distributor_id,
          id: record.id,
          status: record.status,
          created_at: dayjs(record.created_at).format("DD-MM-YYYY"),
        };
      },
      exportOptions: {
        filename: "orders",
      },
    });
  
    useEffect(() => {
      const distributorIdParam = searchParams.get("distributor_id");
  
      if (distributorIdParam) {
        setFilters([
          {
            field: "distributor_id",
            operator: "eq",
            value: distributorIdParam,
          },
        ]);
      }
    }, [searchParams, setFilters]);
  
    return (
      <List
        headerButtons={
          <ExportButton onClick={triggerExport} loading={exportLoading} />
        }
      >
        <Table {...tableProps}>
          <Table.Column<Database["public"]["Tables"]["orders"]["Row"]>
            dataIndex="id"
            title="ID"
            sorter={{ multiple: 2 }}
            defaultSortOrder={getDefaultSortOrder("id", sorter)}
            filterIcon={<SearchOutlined />}
            filterDropdown={(props) => (
              <FilterDropdown {...props} mapValue={(value) => value}>
                <Input placeholder="Enter ID" />
              </FilterDropdown>
            )}
          />
          <Table.Column<Database["public"]["Tables"]["orders"]["Row"]>
            dataIndex="distributor_id"
            title="username"
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
            render={(_, record) => {
              if (isLoadingProfiles) return <Skeleton.Input />;
              return (
                profiles?.data.find(
                  (profile) => profile.id === record.distributor_id,
                )?.username || "Unknown - " + record.distributor_id
              );
            }}
          />
          <Table.Column<Database["public"]["Tables"]["orders"]["Row"]>
            dataIndex={"status"}
            title="Status"
            filterDropdown={(props) => (
              <FilterDropdown {...props}>
                <Select
                  style={{ width: "10rem" }}
                  defaultValue={OrderStatus.Pending}
                >
                  <Select.Option value={OrderStatus.Pending}>
                    Pending
                  </Select.Option>
                  <Select.Option value={OrderStatus.InProcess}>
                    In Process
                  </Select.Option>
                  <Select.Option value={OrderStatus.Fulfilled}>
                    Fulfilled
                  </Select.Option>
                  <Select.Option value={OrderStatus.Cancelled}>
                    Cancelled
                  </Select.Option>
                  <Select.Option value={OrderStatus.Defected}>
                    Defected
                  </Select.Option>
                </Select>
              </FilterDropdown>
            )}
            render={(_, record) => {
              if (record.status === OrderStatus.Pending) {
                return (
                  <Select
                    value={record.status}
                    style={{ width: "10rem" }}
                    aria-readonly
                    dropdownStyle={{ display: "none" }}
                    status="error"
                  >
                    <Select.Option value={OrderStatus.Pending}>
                      Pending
                    </Select.Option>
                    <Select.Option value={OrderStatus.InProcess}>
                      In Process
                    </Select.Option>
                    <Select.Option value={OrderStatus.Fulfilled}>
                      Fulfilled
                    </Select.Option>
                    <Select.Option value={OrderStatus.Cancelled}>
                      Cancelled
                    </Select.Option>
                    <Select.Option value={OrderStatus.Defected}>
                      Defected
                    </Select.Option>
                  </Select>
                );
              }
              return (
                <Select
                  value={record.status}
                  style={{ width: "10rem" }}
                  aria-readonly
                  dropdownStyle={{ display: "none" }}
                >
                  <Select.Option value={OrderStatus.Pending}>
                    Pending
                  </Select.Option>
                  <Select.Option value={OrderStatus.InProcess}>
                    In Process
                  </Select.Option>
                  <Select.Option value={OrderStatus.Fulfilled}>
                    Fulfilled
                  </Select.Option>
                  <Select.Option value={OrderStatus.Cancelled}>
                    Cancelled
                  </Select.Option>
                  <Select.Option value={OrderStatus.Defected}>
                    Defected
                  </Select.Option>
                </Select>
              );
            }}
          />
          <Table.Column<Database["public"]["Tables"]["orders"]["Row"]>
            dataIndex="created_at"
            title="Created At"
            sorter={{ multiple: 2 }}
            defaultSortOrder={getDefaultSortOrder("created_at", sorter)}
            render={(_, record) => (
              <DateField value={record.created_at} format="DD/MM//YYYY" />
            )}
          />
          <Table.Column<Database["public"]["Tables"]["orders"]["Row"]>
            title="Action"
            dataIndex="id"
            render={(_, record) => (
              <Space>
                <EditButton recordItemId={record.id} size="small" title="Edit" />
              </Space>
            )}
          />
        </Table>
      </List>
    );
  };
  