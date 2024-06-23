import { Col, Row, Skeleton } from "antd";

import { SalesTitleForm } from "./components/SalesTitleForm";
import { CustomerTable } from "./components/customer-table";
import { useLocation } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { Database } from "@/utilities";
import { UserActivitesTable } from "@/components/UserActivitesTable";
import { UserInfoForm } from "./components/salesInfoForm";

export const SalesShow = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
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
      <SalesTitleForm salesDetails={salesDetails.data} />
      <Row
        gutter={[32, 32]}
        style={{
          marginTop: 32,
        }}
      >
        <Col span={16}>
          <CustomerTable salesDetails={salesDetails.data} />
          <UserActivitesTable
            userId={salesDetails.data.id}
            style={{
              marginTop: 32,
            }}
          />
        </Col>
        <Col span={8}>
          <UserInfoForm userDetails={salesDetails.data} />
        </Col>
      </Row>
      {children}
    </div>
  );
};
