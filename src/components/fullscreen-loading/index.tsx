import { Spin } from "antd";
import { Text } from "../text";
import React from "react";

export const FullScreenLoading = () => {
  const [auto, setAuto] = React.useState(false);
  const [percent, setPercent] = React.useState(-50);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setPercent((v) => {
        const nextPercent = v + 5;
        return nextPercent > 150 ? -50 : nextPercent;
      });
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [percent]);

  const mergedPercent = auto ? "auto" : percent;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spin percent={mergedPercent} size="large" tip={<Text>Loading...</Text>} />
    </div>
  );
};
