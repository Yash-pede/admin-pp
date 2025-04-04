import { useState } from "react";

import { ZoomInOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { Text } from "@/components";
import type { Audit } from "..";

export const ActionCell = ({ record }: { record: Audit }) => {
  const [opened, setOpened] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          size="small"
          icon={<ZoomInOutlined />}
          onClick={() => setOpened((prev) => !prev)}
        >
          Details
        </Button>
      </div>
      {opened && (
        <Modal
          open={opened}
          onOk={() => setOpened(false)}
          onCancel={() => setOpened(false)}
          style={{ minWidth: "60vw" }}
          bodyStyle={{
            maxHeight: "500px",
            overflow: "auto",
          }}
        >
          {record.action === "create" ? (
            <Space direction="vertical">
              <Text size="xl" strong>
                New Data
              </Text>
              <Table
                size="small"
                dataSource={[record.data as any]}
                pagination={false}
                columns={Object.keys(record.data as any).map((key) => ({
                  title: key,
                  dataIndex: key,
                  key: key,
                  render: (value) => <Text>{JSON.stringify(value)}</Text>,
                }))}
              />
            </Space>
          ) : record.action === "update" ? (
            <Space direction="vertical">
              <Text size="xl" strong>
                New Data
              </Text>
              <Table
                size="small"
                dataSource={[record.data as any]}
                pagination={false}
                columns={Object.keys(record.data as any).map((key) => ({
                  title: key,
                  dataIndex: key,
                  key: key,
                  render: (value) => <Text>{JSON.stringify(value)}</Text>,
                }))}
              />
              <Text size="xl" strong>
                Previous Data
              </Text>
              <Table
                size="small"
                dataSource={[record.previousData as any]}
                pagination={false}
                columns={Object.keys(record.previousData as any).map((key) => ({
                  title: key,
                  dataIndex: key,
                  key: key,
                  render: (value) => <Text>{JSON.stringify(value)}</Text>,
                }))}
              />
            </Space>
          ) : (
            "Deleted"
          )}
        </Modal>
      )}
    </div>
  );
};
