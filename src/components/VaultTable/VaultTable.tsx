import React from "react";
import { ConfigProvider, Empty, Table, Typography } from "antd";
import {
  DownOutlined,
  RightOutlined, SafetyOutlined
} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { ColumnsType } from "antd/lib/table";
import { PrimaryButton } from "../PrimaryButton/PrimaryButton";
import BTC from "../../assets/bitcoin.png";
import SOLANA from "../../assets/solana.png";
import RAY from "../../assets/ray.png";
import SRM from "../../assets/srm.png";
import FTT from "../../assets/ftt.png";
import ETH from "../../assets/eth.png";
import VaultTableDropdown from "./VaultTableDropdown";
import "./VaultTable.less"
import { ConnectButton } from "../ConnectButton/ConnectButton";
import CollateralAmounts from "../../models/hubble/CollateralAmounts";
import { formatPct, formatUSD } from "../../utils/utils";
import VaultTableExpand from "./VaultTableExpand";
import { SolanaToken, STABLECOIN_DECIMALS } from "../../constants";
import VaultTableRow from "./VaultTableRow";
import {UserMetadata} from "../../models/hubble/UserMetadata";

const getColumns = (
  addCollateral: (position: UserMetadata) => void,
  repayStablecoin: (position: UserMetadata) => void,
  withdrawCollateral: (position: UserMetadata) => void,
  borrowMore: (position: UserMetadata) => void,
  addLeverage: (position: UserMetadata) => void,) => [
    {
      title: 'Loans', key: 'loans', dataIndex: 'depositedCollateral', render: (collateral: CollateralAmounts) => {
        const collateralWithValues = Object.entries(collateral)
          .filter(collateralItem => collateralItem[1] > 0);
        return (
          <>
            <div style={{ fontSize: "12px" }}>
              {collateralWithValues.map((collateralItem, index: number) => {
                const tokenMapKey = collateralItem[0];
                if (tokenMapKey === "btc") {
                  return (index === 0 ? <img alt="BTC" src={BTC} key={index} /> : <img alt="BTC" src={BTC} key={index} style={{ marginLeft: "-5px" }} />);
                } if (tokenMapKey === "sol") {
                  return (index === 0 ? <img alt="SOLANA" src={SOLANA} key={index} /> : <img alt="SOLANA" src={SOLANA} key={index} style={{ marginLeft: "-5px" }} />);
                } if (tokenMapKey === "ray") {
                  return (index === 0 ? <img alt="RAY" src={RAY} key={index} /> : <img alt="RAY" src={RAY} key={index} style={{ marginLeft: "-5px" }} />);
                } if (tokenMapKey === "srm") {
                  return (index === 0 ? <img alt="SRM" src={SRM} key={index} /> : <img alt="SRM" src={SRM} key={index} style={{ marginLeft: "-5px" }} />);
                } if (tokenMapKey === "ftt") {
                  return (index === 0 ? <img alt="FTT" src={FTT} key={index} /> : <img alt="FTT" src={FTT} key={index} style={{ marginLeft: "-5px" }} />);
                } if (tokenMapKey === "eth") {
                  return (index === 0 ? <img alt="ETH" src={ETH} key={index} /> : <img alt="ETH" src={ETH} key={index} style={{ marginLeft: "-5px" }} />);
                }
                return null;
              })
              }
              <br />
              {
                collateralWithValues.map((collateralItem, index: number) => {
                  const numberOfTokens = Object.values(collateral).filter(amount => amount > 0).length;
                  const tokenMapKey = collateralItem[0];
                  return <Typography.Text key={index}>{`${tokenMapKey.toUpperCase()}${index !== numberOfTokens - 1 ? '+' : ''}`}</Typography.Text>
                })
              }
            </div>
          </>
        );
      },
    },
    {
      title: 'USDH Debt',
      dataIndex: 'borrowedStablecoin',
      key: 'borrowedStablecoin',
      render: (borrowedStablecoin) => formatUSD.format(borrowedStablecoin / STABLECOIN_DECIMALS),
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.borrowedStablecoin - b.borrowedStablecoin,
    },
    {
      title: 'Collateral',
      dataIndex: 'collateralValue',
      key: 'collateralValue',
      render: (collateralValue) => formatUSD.format(collateralValue),
      sorter: (a, b) => a.collateralValue - b.collateralValue,
    },
    {
      title: 'Net Value',
      dataIndex: 'collateralValue', // todo what is this??
      key: 'netvalue',
      render: (collateralValue, record) => formatUSD.format(collateralValue - (record.borrowedStablecoin / STABLECOIN_DECIMALS)),
      sorter: (a, b) => a.collateralValue - b.collateralValue,
    },
    {
      title: 'APY',
      dataIndex: 'apy',
      key: 'apy',
      render: (apy) => formatPct.format(apy),
      // @ts-ignore // todo
      sorter: (a, b) => a.apy - b.apy,
    },
    {
      title: 'CR',
      dataIndex: 'collateralRatio',
      key: 'collateralRatio',
      render: (collateralRatio) => {
        const cr = Math.round(collateralRatio * 10000) / 100;
        return (<Typography.Text style={{
          color: cr < 110 ? "#FF0000" :
            cr < 150 ? "#FF9900" :
              "#00FF00"
        }}>{cr}%</Typography.Text>)
      },
      sorter: (a, b) => a.collateralRatio - b.collateralRatio,
    },
    {
      title: 'Actions', key: 'operation', render: (_, vault) =>
        <VaultTableDropdown
          key={vault.key}
          vault={vault}
          addCollateral={addCollateral}
          repayStablecoin={repayStablecoin}
          withdrawCollateral={withdrawCollateral}
          borrowMore={borrowMore}
          addLeverage={addLeverage}
        />
    },
  ] as ColumnsType<VaultTableRow>

const VaultTable = ({ walletConnected, vaults, vaultsLoading, vaultsLoadingError, addCollateral, repayStablecoin, withdrawCollateral, borrowMore, addLeverage, getPrice }: VaultTableProps) => {

  const history = useHistory();

  const vaultTableRows: VaultTableRow[] = vaults
    .filter((vault) => vault.borrowedStablecoin !== 0 && vault.collateralValue >= 1)
    .map((vault, index) => {
      return {
        ...vault,
        key: index, // todo this should key by userId
        apy: 0,
        liquidationRatio: 1.1,
        leverage: 1,
      }
    });

  const columns = getColumns(addCollateral, repayStablecoin, withdrawCollateral, borrowMore, addLeverage);

  return (
    <ConfigProvider
      renderEmpty={() =>
        !walletConnected ?
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Connect your wallet to view vaults" >
            <ConnectButton />
          </Empty> :
          vaultsLoadingError ? (
            <Empty description="Unable to load vaults" />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No vaults" >
              <PrimaryButton
                text='Create Vault'
                onClick={() => history.push("/")}
                icon={<SafetyOutlined />}
              />
            </Empty>
          )
      }
    >
      <Table
        loading={vaultsLoading}
        columns={columns}
        // rowKey={vault => vault.userId} // todo
        expandable={{
          expandedRowRender: (vaultTableRow: VaultTableRow) => <VaultTableExpand
            getPrice={getPrice}
            vaultTableRow={vaultTableRow}
            addCollateral={addCollateral}
            withdrawCollateral={withdrawCollateral}
          />,
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <DownOutlined onClick={e => onExpand(record, e)} />
            ) : (
              <RightOutlined onClick={e => onExpand(record, e)} />
            ),
        }}
        dataSource={vaultTableRows}
        pagination={false}
      />
    </ConfigProvider>
  );
}

interface VaultTableProps {
  walletConnected: boolean;
  vaults: Array<UserMetadata>;
  vaultsLoading: boolean;
  vaultsLoadingError: boolean;
  addCollateral: (position: UserMetadata) => void;
  repayStablecoin: (position: UserMetadata) => void;
  withdrawCollateral: (position: UserMetadata) => void;
  borrowMore: (position: UserMetadata) => void;
  addLeverage: (position: UserMetadata) => void;
  getPrice: (token: SolanaToken) => number;
}

export default VaultTable;
