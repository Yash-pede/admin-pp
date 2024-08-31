import { Drawer, Form, Input, InputNumber } from "antd";
import { Create, useDrawerForm } from "@refinedev/antd";
import dayjs from "dayjs";
import { useGo } from "@refinedev/core";
import { useLocation } from "react-router-dom";

export const TargetCreate = () => {
  const go = useGo();
  const { pathname } = useLocation();
  const userId = pathname.split("/").pop();
  const { drawerProps, saveButtonProps, formProps } = useDrawerForm({
    action: "create",
    resource: "targets",
    redirect: "list",
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
            name="user_id"
            hidden
            rules={[
              {
                required: true,
              },
            ]}
            initialValue={userId}
          >
            <Input defaultValue={userId} />
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
            initialValue={dayjs().month()}
          >
            <InputNumber defaultValue={dayjs().month()} />
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
