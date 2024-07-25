import React, { FC, PropsWithChildren } from "react";

const IconWrapper: FC<PropsWithChildren<{ color: string }>> = ({
  color,
  children,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: color,
      }}
    >
      {children}
    </div>
  );
};

export default IconWrapper