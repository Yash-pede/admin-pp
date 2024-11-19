import React, { CSSProperties, useContext } from "react";

import { Button, Flex, Grid, Layout, Space, Switch, theme } from "antd";

import { CurrentUser } from "./current-user";
import { ColorModeContext } from "@/contexts/color-mode";
import { BarsOutlined } from "@ant-design/icons";
import { useThemedLayoutContext } from "@refinedev/antd";

const { useToken } = theme;

export const Header: React.FC = () => {
  const { token } = useToken();
  const { mode, setMode } = useContext(ColorModeContext);
  const { mobileSiderOpen, setMobileSiderOpen } = useThemedLayoutContext();
  const breakpoint = Grid.useBreakpoint();

  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

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
  const drawerButtonStyles: CSSProperties = {
    zIndex: 100,
  };

  return (
    <Layout.Header style={headerStyles}>
      <Flex align="center" style={{ width: "100%" }} justify="space-between">
        <div className="">
          {isMobile && (
            <Button
              style={drawerButtonStyles}
              size="large"
              onClick={() => setMobileSiderOpen(!mobileSiderOpen)}
              icon={<BarsOutlined />}
            />
          )}
        </div>
        <Space size="middle">
          <Switch
            checkedChildren="🌛"
            unCheckedChildren="🔆"
            onChange={() => setMode(mode === "light" ? "dark" : "light")}
            defaultChecked={mode === "dark"}
          />
          <CurrentUser />
        </Space>
      </Flex>
    </Layout.Header>
  );
};
