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
import { StocksList, StocksCreate } from "./routes/stocks";
import {
  DistributorCreate,
  DistributorEdit,
  DistributorList,
  DistributorShow,
} from "./routes/clients/distributors";
import { SalesCreate, SalesList } from "./routes/clients/sales";
import { AuditLogList } from "./routes/audit-log";
import { OrdersEdit, OrdersList } from "./routes/orders";

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
                  </Route>

                  <Route path="/clients">
                    <Route path="distributors">
                      <Route index element={<DistributorList />} />
                      <Route path="create" element={<DistributorCreate />} />
                      <Route path="edit/:id" element={<DistributorEdit />} />
                      <Route path=":id" element={<DistributorShow />} />
                    </Route>
                    <Route path="sales">
                      <Route index element={<SalesList />} />
                      <Route path="create" element={<SalesCreate />} />
                    </Route>
                  </Route>

                  <Route path="orders">
                    <Route index element={<OrdersList />} />
                    <Route path="edit/:id" element={<OrdersEdit />} />
                  </Route>

                  <Route path="/administration">
                    <Route path="audit-log">
                      <Route index element={<AuditLogList />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<ErrorComponent />} />
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
