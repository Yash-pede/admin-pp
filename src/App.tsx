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
import DashboardHome from "./routes/dashboard/show";
import { ProductsCreate, ProductsList, ProductsEdit } from "./routes/products";
import { auditLogProvider } from "./utilities/providers/auditlogProvider";
import { StocksList, StocksCreate, StocksPast, StocksProductWise } from "./routes/stocks";
import {
  DistributorCreate,
  DistributorEdit,
  DistributorList,
  DistributorShow,
  InventoryDetails,
} from "./routes/clients/distributors";
import { SalesCreate, SalesList } from "./routes/clients/sales";
import { AuditLogList } from "./routes/audit-log";
import { SalesShow } from "./routes/clients/sales/show";
import { SalesEdit } from "./routes/clients/sales/edit";
import { OrdersEdit, OrdersList } from "./routes/orders";
import { AuthorizeUserRole } from "./components/layout/authorize";
import { FundsList, FundsRequested } from "./routes/funds";
import { ChallanList, ChallanShow } from "./routes/challan";
import { ChallanPdf } from "./routes/challan/components/challanPdf";
import { CustomersList } from "./routes/clients/customers";

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
                      <Route index element={<DashboardHome />} />
                    </Route>

                    <Route path="/products">
                      <Route index element={<ProductsList />} />
                      <Route path="create" element={<ProductsCreate />} />
                      <Route path=":id" element={<ProductsEdit />} />
                    </Route>

                    <Route path="/stocks">
                      <Route index element={<StocksList />} />
                      <Route path="create" element={<StocksCreate />} />
                      <Route path="past" element={<StocksPast />} />
                      <Route path="product-wise" element={<StocksProductWise />} />
                    </Route>

                    <Route path="/clients">
                      <Route path="distributors">
                        <Route index element={<DistributorList />} />
                        <Route path="create" element={<DistributorCreate />} />
                        <Route path="edit/:id" element={<DistributorEdit />} />
                        <Route path=":id" element={<DistributorShow />} />
                        <Route
                          path="inventory/:id"
                          element={<InventoryDetails />}
                        />
                      </Route>
                      <Route path="customers">
                        <Route index element={<CustomersList />} />
                        <Route path="create" element={<SalesCreate />} />
                        <Route path="edit/:id" element={<SalesEdit />} />
                        <Route path=":id" element={<SalesShow />} />
                      </Route>
                      <Route path="sales">
                        <Route index element={<SalesList />} />
                        <Route path="create" element={<SalesCreate />} />
                        <Route path="edit/:id" element={<SalesEdit />} />
                        <Route path=":id" element={<SalesShow />} />
                      </Route>
                    </Route>

                    <Route path="orders">
                      <Route index element={<OrdersList />} />
                      <Route path="edit/:id" element={<OrdersEdit />} />
                    </Route>

                    <Route path="funds">
                      <Route index element={<FundsList />} />
                      <Route path="requested" element={<FundsRequested />} />
                    </Route>

                    <Route path="/challan">
                        <Route index element={<ChallanList />} />
                        <Route path=":id" element={<ChallanShow />} />
                        <Route path="pdf/:id" element={<ChallanPdf />} />
                      </Route>

                    <Route path="/administration">
                      <Route path="audit-log">
                        <Route index element={<AuditLogList />} />
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
                  <Route
                    path="/register"
                    element={<AuthPage type="register" />}
                  />
                  <Route
                    path="/forgot-password"
                    element={<AuthPage type="forgotPassword" />}
                  />
                </Route>
              </Routes>

              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </AntdApp>
      </ColorModeContextProvider>
    </BrowserRouter>
  );
}

export default App;
