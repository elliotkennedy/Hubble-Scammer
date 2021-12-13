import React, { useEffect } from "react";
import './style.less'
import { Layout } from "antd";
import { WalletModalProvider } from "@solana/wallet-adapter-ant-design";
import { AppBar } from "../../components/AppBar/AppBar";
import { AppFooter } from "../../components/Footer/Footer";
import useEnv from "../../hooks/useEnv";
import useInternalWallet from "../../hooks/useInternalWallet";

const { Header, Content, Footer } = Layout;

export const MainLayout = React.memo(({ children }) => {
  const { publicKey } = useInternalWallet();

  const { env, setEnv, walletPublicKey, connectWallet, disconnectWallet } = useEnv();

  useEffect(() => {
    setEnv(env);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // load once

  useEffect(() => {
    if (publicKey !== null) {
      if (publicKey !== walletPublicKey) {
        connectWallet();
      }
    } else if (walletPublicKey !== null) {
      disconnectWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, walletPublicKey])

  return (
    <WalletModalProvider>
      <Layout className="main-layout">
        <Header className="main-layout-header">
          <AppBar />
        </Header>
        <Content className="main-layout-content">
          <div className="child-container">{children}</div>
          <Footer className="main-layout-footer">
            <AppFooter />
          </Footer>

        </Content>
      </Layout>
    </WalletModalProvider>
  );
});
