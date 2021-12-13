import React, { lazy, Suspense, useMemo } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { History } from "history";

import {
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  getTorusWallet,
} from "@solana/wallet-adapter-wallets";
import { ConnectedRouter } from "connected-react-router";
import { Helmet } from "react-helmet";
import { LABELS } from "./constants";
import { Layout } from "./layouts/Layout";
import RouteChangeTracker from "./components/RouteChangeTracker/RouteChangeTracker";

const routes = [
  {
    path: "/airdrop",
    Component: lazy(() => import("./pages/airdrop/Airdrop")),
    exact: true,
    title: LABELS.PAGE_AIRDROP,
  },
  {
    path: "/",
    Component: lazy(() => import("./pages/borrow/Borrow")),
    exact: true,
    title: LABELS.PAGE_AIRDROP,
  },
  {
    path: "/farms",
    Component: lazy(() => import("./pages/farms/Farms")),
    exact: true,
    title: LABELS.PAGE_FARMS,
  },
  {
    path: "/dashboard",
    Component: lazy(() => import("./pages/vaults/Vaults")),
    exact: true,
    title: LABELS.PAGE_DASHBOARD,
  },
  {
    path: "/liquidations",
    Component: lazy(() => import("./pages/liquidations/Liquidations")),
    exact: true,
    title: LABELS.PAGE_LIQUIDATIONS,
  },
  {
    path: "/stability",
    Component: lazy(() => import("./pages/stability/Stability")),
    exact: true,
    title: LABELS.PAGE_STABILITY,
  },
  {
    path: "/redeem",
    Component: lazy(() => import("./pages/redeem/Redeem")),
    exact: true,
    title: LABELS.PAGE_REDEEM,
  },
  {
    path: "/stake",
    Component: lazy(() => import("./pages/staking/Staking")),
    exact: true,
    title: LABELS.PAGE_STAKE,
  },
  {
    path: "/404",
    Component: lazy(() => import("./pages/errors/System404")),
    exact: true,
    title: LABELS.PAGE_NOT_FOUND,
  },
  {
    path: "/staking",
    Component: lazy(() => import("./pages/staking/Staking")),
    exact: true,
    title: LABELS.STAKING_PAGE,
  },
];

export function Router({ history }: RouterProps) {
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getTorusWallet({
        options: {
          // TODO: Get your own tor.us wallet client Id
          clientId:
            "BOM5Cl7PXgE9Ylq1Z1tqzhpydY0RVr8k90QQ85N7AKI5QGSrr9iDC-3rvmy0K_hF0JfpLMiXoDhta68JwcxS1LQ",
        },
      }),
      getLedgerWallet(),
      getSolongWallet(),
      getMathWallet(),
      getSolletWallet(),
    ],
    []
  );

  return (
    <ConnectedRouter history={history}>
      <WalletProvider wallets={wallets} autoConnect>
        <Layout>
          <Switch>
            {routes.map(({ path, Component, exact, title }) => (
              <Route
                path={path}
                key={path}
                exact={exact}
                render={() => {
                  return (
                    <>
                      <Suspense fallback={null}>
                        <Helmet title={title} />
                        <Component />
                      </Suspense>
                    </>
                  );
                }}
              />
            ))}
            <Redirect to="/404" />
          </Switch>
        </Layout>
      </WalletProvider>
      <RouteChangeTracker />
    </ConnectedRouter>
  );
}

interface RouterProps {
  history: History;
}
