import { Col, Row, Skeleton } from "antd";

import { DistributorTitleForm } from "./components/DistributorTitleForm";
import { SalesTable } from "./components/sales-table";
import { useLocation } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { Database } from "@/utilities";
import { UserActivitesTable } from "@/components/UserActivitesTable";
import { UserInfoForm } from "./components/infoForm";
import { UserInventory } from "./components/UserInventory";

export const DistributorShow = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const pathname = useLocation().pathname;
  const distributorId = pathname.split("/").pop();

  const {
    data: distributorDetails,
    isLoading,
    isError,
  } = useOne<Database["public"]["Tables"]["profiles"]["Row"]>({
    resource: "profiles",
    id: distributorId,
    queryOptions: {
      enabled: !!distributorId,
    },
  });

  if (isLoading || isError || !distributorDetails.data) return <Skeleton />;

  return (
    <div className="page-container">
      <DistributorTitleForm distributorDetails={distributorDetails.data} />
      <Row
        gutter={[32, 32]}
        style={{
          marginTop: 32,
        }}
      >
        <Col span={16}>
          <SalesTable distributorDetails={distributorDetails.data} />
          <UserActivitesTable
            userId={distributorDetails.data.id}
            style={{
              marginTop: 32,
            }}
          />
        </Col>
        <Col span={8}>
          <UserInfoForm userDetails={distributorDetails.data} />
          <UserInventory
            userDetails={distributorDetails.data}
            style={{
              marginTop: 32,
            }}
          />
        </Col>
      </Row>
      {children}
    </div>
  );
};