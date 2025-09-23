import { Col, Grid, Row, Skeleton } from "antd";

import { SalesTable } from "./components/sales-table";
import { useLocation } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { Database } from "@/utilities";
import { UserActivitesTable } from "@/components/UserActivitesTable";
import { UserInventory } from "./components/UserInventory";
import { UserInfoForm } from "@/components/infoForm";
import { UserTitleForm } from "@/components/UserTitleForm";
import { UserFundsTable } from "@/components";

export const DistributorShow = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const pathname = useLocation().pathname;
  const distributorId = pathname.split("/").pop();
  const breakpoint = Grid.useBreakpoint();
  const isMobile =
    typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

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
      <UserTitleForm userDetails={distributorDetails.data} />
      <Row
        gutter={[32, 32]}
        style={{
          marginTop: 32,
        }}
      >
        {isMobile ? (
          <Row
            style={{
              marginTop: 32,
            }}
          >
            <SalesTable distributorDetails={distributorDetails.data} />
            <UserFundsTable
              isMobile={isMobile}
              userId={distributorDetails.data.id}
              style={{
                marginTop: 32,
              }}
            />
          </Row>
        ) : (
          <Col span={16}>
            <SalesTable distributorDetails={distributorDetails.data} />
            <UserFundsTable
              isMobile={isMobile}
              userId={distributorDetails.data.id}
              style={{
                marginTop: 32,
              }}
            />
          </Col>
        )}
        {isMobile ? (
          <Row
            style={{
              marginTop: 32,
            }}
          >
            <UserInfoForm
              style={{
                marginTop: 32,
                width: "100%",
              }}
              userDetails={distributorDetails.data}
            />
            <UserInventory
              userDetails={distributorDetails.data}
              style={{
                marginTop: 32,
                width: "100%",
              }}
            />
          </Row>
        ) : (
          <Col span={8}>
            <UserInfoForm userDetails={distributorDetails.data} />
            <UserInventory
              userDetails={distributorDetails.data}
              style={{
                marginTop: 32,
              }}
            />
          </Col>
        )}
        {/* {!isMobile && (
          <UserActivitesTable
            isMobile={isMobile}
            userId={distributorDetails.data.id}
            style={{
              marginTop: 32,
              width: "100%",
            }}
          />
        )} */}
      </Row>
      {children}
    </div>
  );
};
