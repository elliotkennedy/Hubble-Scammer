/* eslint-disable jsx-a11y/anchor-is-valid */
import { Dropdown, Menu } from "antd";
import { FolderAddOutlined, FolderOpenOutlined, IssuesCloseOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { SecondaryDropdownButton } from "../SecondaryDropdownButton/SecondaryDropdownButton";
import "./VaultTableDropdown.less"
import {UserMetadata} from "../../models/hubble/UserMetadata";

const VaultTableDropdown = ({
  addCollateral,
  repayStablecoin,
  withdrawCollateral,
  borrowMore,
  addLeverage,
  vault }: VaultTableMenuProps) => {
  return (
    <Dropdown overlay={
      <Menu>
        <Menu.Item key={1} className="menu-item" onClick={() => addCollateral(vault)} icon={<PlusCircleOutlined />}>Add Collateral</Menu.Item>
        <Menu.Item key={2} className="menu-item" onClick={() => repayStablecoin(vault)} icon={<IssuesCloseOutlined />}>Repay USDH</Menu.Item>
        <Menu.Item key={3} className="menu-item" onClick={() => withdrawCollateral(vault)} icon={<FolderOpenOutlined />}>Withdraw Collateral</Menu.Item>
        <Menu.Item key={4} className="menu-item" onClick={() => borrowMore(vault)} icon={<FolderAddOutlined />}>Borrow More</Menu.Item>
        <Menu.Item key={5} className="menu-item" onClick={() => addLeverage(vault)} icon={<FolderAddOutlined />}>Add Leverage</Menu.Item>
      </Menu>
    }>
      <a className="item-center">
        <SecondaryDropdownButton text="Manage" isLoading={false} disabled={false} />
      </a>
    </Dropdown>
  )
}

interface VaultTableMenuProps {
  addCollateral: (vault: UserMetadata) => void;
  repayStablecoin: (vault: UserMetadata) => void;
  withdrawCollateral: (vault: UserMetadata) => void;
  borrowMore: (vault: UserMetadata) => void;
  addLeverage: (vault: UserMetadata) => void;
  vault: UserMetadata;
}

export default VaultTableDropdown;
