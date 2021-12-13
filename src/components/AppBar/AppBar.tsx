import { useEffect, useState } from "react";
import { Button, Menu, Popover } from "antd";
import { DollarOutlined, SettingOutlined } from "@ant-design/icons";
import {
  WalletMultiButton,
} from "@solana/wallet-adapter-ant-design";
import { Link, useLocation } from "react-router-dom";
import { Settings } from "../Settings/Settings";
import { LABELS } from "../../constants";
import "./style.less";
import "../../antd.customize.less";
import logo from "../../assets/logo.svg";
import useEnv from "../../hooks/useEnv";

const menuItems = [
  {
    id: "BORROW",
    label: LABELS.MENU_BORROW,
    link: "/",
  },
  {
    id: "DASHBOARD",
    label: LABELS.MENU_DASHBOARD,
    link: "/dashboard",
  },
  // {
  //   id: "Farms",
  //   label: LABELS.MENU_FARMS,
  //   link: "/farms",
  // },
  {
    id: "STABILITY",
    label: LABELS.MENU_STABILITY,
    link: "/stability",
  },
  {
    id: "STAKE",
    label: LABELS.MENU_STAKE,
    link: "/staking",
  },
  {
    id: "LIQUIDATIONS",
    label: LABELS.MENU_LIQUIDATIONS,
    link: "/liquidations",
  },
  // {
  //   id: "REDEEM",
  //   label: LABELS.MENU_REDEEM,
  //   link: "/redeem",
  // },
  // {
  //   id: "AIRDROP",
  //   label: LABELS.MENU_AIRDROP,
  //   link: "/airdrop",
  //   condition: (env: string) => env !== "mainnet-beta",
  // },
];

export const AppBar = () => {
  const { pathname } = useLocation();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const { env } = useEnv();

  useEffect(() => {
    let selected = false;
    menuItems.forEach((menuItem) => {
      if (menuItem.link === pathname) {
        setSelectedKey(menuItem.id);
        selected = true;
      }
    });
    if (!selected) {
      setSelectedKey(null);
    }
  }, [pathname, setSelectedKey]);

  return (
    <div className="app-bar">
      <div className="app-min-bar">
        <div className="app-bar-left">
          <Link to="/">
            <div className="app-title item-center">
              <img src={logo} alt="Hubble" />
            </div>
          </Link>
        </div>
        <Menu className="app-bar-center" style={{ flexGrow: 1 }} theme="dark" mode="horizontal" expandIcon={<SettingOutlined />} selectedKeys={selectedKey !== null ? [selectedKey] : []}>
          {menuItems.map((menuItem) => {
            return (
              <Menu.Item key={menuItem.id} className="menuback">{`${menuItem.label}`}
                <Link to={menuItem.link} />
              </Menu.Item>
            );
          }).filter(_ => _)}
        </Menu>
        <div className="app-bar-right">
          <div className="round-circle item-center">
            <WalletMultiButton type="primary" className="walletbutton-style" />
          </div>
          <div style={{ marginLeft: 10 }} />
          <Popover
            placement="topRight"
            title={LABELS.SETTINGS_TOOLTIP}
            content={<Settings />}
            trigger="click"
          >
            <Button
              shape="circle"
              size="large"
              type="text"
              icon={<SettingOutlined />}
            />
          </Popover>
          {env !== "mainnet-beta" ? <Link to="/airdrop" style={{ marginTop: 5, marginLeft: 5 }}><DollarOutlined style={{ fontSize: 18 }} />
          </Link> : null}
        </div>
      </div>
    </div>
  );
};
