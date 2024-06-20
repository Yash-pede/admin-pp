import React, { useContext } from "react";

import { Layout, Space, Switch, theme } from "antd";

import { CurrentUser } from "./current-user";
import { ColorModeContext } from "@/contexts/color-mode";

const { useToken } = theme;

export const Header: React.FC = () => {
  const { token } = useToken();
  const { mode, setMode } = useContext(ColorModeContext);

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
    position: "sticky",
    top: 0,
    zIndex: 999,
  };

  return (
    <Layout.Header style={headerStyles}>
      <Space align="center" size="middle">
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />
        <CurrentUser />
      </Space>
    </Layout.Header>
  );
};
