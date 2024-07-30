import React from "react";
import Targets from "./Targets";
import { Drawer, Form, Input, InputNumber } from "antd";
import { Create, useDrawerForm } from "@refinedev/antd";
import dayjs from "dayjs";
import { useGo } from "@refinedev/core";
import { useSearchParams } from "react-router-dom";

export const TargetCreate = () => {
  const go = useGo();
  const [searchParams] = useSearchParams();
  const { drawerProps, saveButtonProps, formProps } = useDrawerForm({
    action: "create",
    resource: "targets",
    onMutationSuccess: () => go({ to: `/administration/reports/targets` }),
  });
  return (
    <Drawer
      {...drawerProps}
      open
      onClose={() => go({ to: `/administration/reports/targets` })}
    >
      <Create saveButtonProps={saveButtonProps}>
        <Form {...formProps} layout="vertical">
          <Form.Item
            label="user_id"
            name="user_id" hidden
            rules={[
              {
                required: true,
              },
            ]}
            initialValue={searchParams.get("user_id")}
          >
            <Input defaultValue={searchParams.get("user_id") ?? ""} />
          </Form.Item>
          <Form.Item
            label="Target"
            name="target"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="month"
            label="month"
            rules={[
              {
                required: true,
              },
            ]}
            initialValue={dayjs().month() + 1}
          >
            <InputNumber defaultValue={dayjs().month() + 1} />
          </Form.Item>
          <Form.Item
            name="year"
            label="year"
            rules={[
              {
                required: true,
              },
            ]}
            initialValue={dayjs().year()}
          >
            <InputNumber defaultValue={dayjs().year()} />
          </Form.Item>
        </Form>
      </Create>
    </Drawer>
  );
};
