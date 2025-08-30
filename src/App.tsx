import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import {
  AuthPage,
  ErrorComponent,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import authProvider from "./utilities/providers/authProvider";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { supabaseServiceRoleClient } from "./utilities";
import { resources } from "./config";
import { Layout } from "./components/layout";
import {
  ProductsCreate,
  ProductsList,
  ProductsEdit,
  ProductsShow,
} from "./routes/products";
import { auditLogProvider } from "./utilities/providers/auditlogProvider";
import {
  StocksList,
  StocksCreate,
  StocksPast,
  StocksProductWise,
} from "./routes/stocks";
import {
  DistributorCreate,
  DistributorEdit,
  DistributorList,
  DistributorsChallans,
  DistributorShow,
  InventoryDetails,
} from "./routes/clients/distributors";
import { SalesCreate, SalesList } from "./routes/clients/sales";
import { AuditLogList } from "./routes/audit-log";
import { SalesShow } from "./routes/clients/sales/show";
import { SalesEdit } from "./routes/clients/sales/edit";
import { OrdersEdit, OrdersList } from "./routes/orders";
import { AuthorizeUserRole } from "./components/layout/authorize";
import { AllFunds, FundsList, FundsListById, FundsRequested } from "./routes/funds";
import {
  ChallanDeleted,
  ChallanList,
  ChallanShow,
  ReqDeletionChallan,
} from "./routes/challan";
import { ChallanPdf } from "./routes/challan/components/challanPdf";
import {
  CustomersChallans,
  CustomersEdit,
  CustomersList,
} from "./routes/clients/customers";
import {
  MoneyList,
  ReportProducts,
  ReportsList,
  TargetCreate,
  Targets,
  UserSelect,
} from "./routes/reports";
import { UserCredintials } from "./routes/administration";
import ExportDistroSalesData from "./routes/clients/export";
import { SalesChallans } from "./routes/clients/sales/challans";
import { NewDashboard } from "./routes/dashboard";

function App() {
  return (
    <BrowserRouter>
      <ColorModeContextProvider>
        <AntdApp>
          <DevtoolsProvider>
            <Refine
              auditLogProvider={auditLogProvider}
              dataProvider={dataProvider(supabaseServiceRoleClient)}
              liveProvider={liveProvider(supabaseServiceRoleClient)}
              authProvider={authProvider}
              routerProvider={routerBindings}
              notificationProvider={useNotificationProvider}
              resources={resources}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                useNewQueryKeys: true,
                liveMode: "auto",
              }}
            >
              <DocumentTitleHandler
                handler={(title) =>
                  `${
                    title.resource?.name ? title.resource?.name + " | " : ""
                  } Admin Purepride`
                }
              />
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-inner"
                      fallback={<CatchAllNavigate to="/login" />}
                    >
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  <Route element={<AuthorizeUserRole />}>
                    <Route
                      index
                      element={<NavigateToResource resource="dashboard" />}
                    />

                    <Route path="/dashboard">
                      <Route index element={<NewDashboard />} />
                    </Route>

                    <Route path="/products">
                      <Route index element={<ProductsList />} />
                      <Route path="create" element={<ProductsCreate />} />
                      <Route path=":id" element={<ProductsShow />} />
                      <Route path="edit/:id" element={<ProductsEdit />} />
                    </Route>

                    <Route path="/stocks">
                      <Route index element={<StocksList />} />
                      <Route path="create" element={<StocksCreate />} />
                      <Route path="past" element={<StocksPast />} />
                      <Route
                        path="product-wise"
                        element={<StocksProductWise />}
                      />
                    </Route>

                    <Route path="/clients">
                      <Route path="distributors">
                        <Route index element={<DistributorList />} />
                        <Route path="create" element={<DistributorCreate />} />
                        <Route path="edit/:id" element={<DistributorEdit />} />
                        <Route path=":id" element={<DistributorShow />} />
                        <Route
                          path="challans/:id"
                          element={<DistributorsChallans />}
                        />
                        <Route
                          path="export/:id"
                          element={<ExportDistroSalesData />}
                        />
                        <Route
                          path="inventory/:id"
                          element={<InventoryDetails />}
                        />
                        <Route path="target/:id" element={<TargetCreate />} />
                      </Route>
                      <Route path="customers">
                        <Route index element={<CustomersList />} />
                        <Route path="create" element={<SalesCreate />} />
                        <Route
                          path="challans/:id"
                          element={<CustomersChallans />}
                        />
                        <Route path="edit/:id" element={<CustomersEdit />} />
                        <Route path=":id" element={<SalesShow />} />
                      </Route>
                      <Route path="sales">
                        <Route index element={<SalesList />} />
                        <Route path="create" element={<SalesCreate />} />
                        <Route
                          path="challans/:id"
                          element={<SalesChallans />}
                        />
                        <Route path="edit/:id" element={<SalesEdit />} />
                        <Route path=":id" element={<SalesShow />} />
                        <Route
                          path="export/:id"
                          element={<ExportDistroSalesData />}
                        />
                      </Route>
                    </Route>

                    <Route path="orders">
                      <Route index element={<OrdersList />} />
                      <Route path="edit/:id" element={<OrdersEdit />} />
                    </Route>

                    <Route path="funds">
                      <Route index element={<FundsList />} />
                      <Route path="requested" element={<FundsRequested />} />
                      <Route path=":id" element={<FundsListById />} />
                      <Route path="all" element={<AllFunds />} />
                    </Route>

                    <Route path="/challan">
                      <Route index element={<ChallanList />} />
                      <Route path=":id" element={<ChallanShow />} />
                      <Route
                        path="req-deletion"
                        element={<ReqDeletionChallan />}
                      />
                      <Route path="deleted" element={<ChallanDeleted />} />
                      <Route path="pdf/:id" element={<ChallanPdf />} />
                    </Route>

                    <Route path="/administration">
                      <Route path="settings">
                        <Route index element={<>Settings</>} />
                        <Route
                          path="user-credentials/:id"
                          element={<UserCredintials />}
                        />
                      </Route>
                      <Route path="audit-log">
                        <Route index element={<AuditLogList />} />
                      </Route>
                      <Route path="reports">
                        <Route index element={<ReportsList />} />
                        <Route path="challans" element={<ReportsList />} />
                        <Route path="targets">
                          <Route index element={<UserSelect />} />
                          <Route path=":id" element={<Targets />} />
                          <Route path="create/:id" element={<TargetCreate />} />
                        </Route>
                        <Route path="money">
                          <Route index element={<MoneyList />} />
                        </Route>
                        <Route path="products">
                          <Route index element={<ReportProducts />} />
                        </Route>
                      </Route>
                    </Route>

                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Route>

                <Route
                  element={
                    <Authenticated
                      key="authenticated-outer"
                      fallback={<Outlet />}
                    >
                      <NavigateToResource />
                    </Authenticated>
                  }
                >
                  <Route
                    path="/login"
                    element={
                      <AuthPage
                        type="login"
                        // formProps={{
                        //   initialValues: {
                        //     email: "info@refine.dev",
                        //     password: "refine-supabase",
                        //   },
                        // }}
                      />
                    }
                  />
                  {/* <Route
                    path="/register"
                    element={<AuthPage type="register" />}
                  />
                  <Route
                    path="/forgot-password"
                    element={<AuthPage type="forgotPassword" />}
                  /> */}
                </Route>
              </Routes>

              <UnsavedChangesNotifier />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </AntdApp>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
}

export default App;
