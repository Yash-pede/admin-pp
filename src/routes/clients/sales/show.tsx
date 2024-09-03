import { Col, Row, Skeleton } from "antd";

import { CustomerTable } from "./components/customer-table";
import { useLocation } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { Database } from "@/utilities";
import { UserActivitesTable } from "@/components/UserActivitesTable";
import { UserInfoForm } from "@/components/infoForm";
import { UserTitleForm } from "@/components/UserTitleForm";
import { UserFundsTable } from "@/components";

export const SalesShow = ({ children }: { children?: React.ReactNode }) => {
  const pathname = useLocation().pathname;
  const salesId = pathname.split("/").pop();

  const {
    data: salesDetails,
    isLoading,
    isError,
  } = useOne<Database["public"]["Tables"]["profiles"]["Row"]>({
    resource: "profiles",
    id: salesId,
    queryOptions: {
      enabled: !!salesId,
    },
  });

  if (isLoading || isError || !salesDetails.data) return <Skeleton />;

  return (
    <div className="page-container">
      <UserTitleForm userDetails={salesDetails.data} sales />
      <Row
        gutter={[32, 32]}
        style={{
          marginTop: 32,
        }}
      >
        <Col span={16}>
          <CustomerTable salesDetails={salesDetails.data} />
          <UserFundsTable
            userId={salesDetails.data.id}
            style={{
              marginTop: 32,
            }}
          />
        </Col>
        <Col span={8}>
          <UserInfoForm sales userDetails={salesDetails.data} />
        </Col>
        <UserActivitesTable
          userId={salesDetails.data.id}
          style={{
            width: "100%",
          }}
        />
      </Row>
      {children}
    </div>
  );
};
