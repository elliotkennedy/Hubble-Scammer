import { useEffect, useState } from "react";

import { Table, Typography, Row, Col } from "antd";
import parse from 'html-react-parser';
import "./Liquidations.less";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { PublicKey } from "@solana/web3.js";
import btc from '../../assets/bitcoin.png';
import eth from '../../assets/eth.png';
import ftt from '../../assets/ftt.png';
import sol from '../../assets/solana.png';
import ray from '../../assets/ray.png';
import srm from '../../assets/srm.png';
import nodata from '../../assets/nodata.png';

import CollateralAmounts from "../../models/hubble/CollateralAmounts";
import { UserMetadata } from "../../models/hubble/UserMetadata";
import { SerumMarket } from "../../models/SerumMarket";
import useEnv from "../../hooks/useEnv";
import { SOL_PRICE_FACTOR_DEV, STABLECOIN_DECIMALS, Token } from "../../constants";
import { BTC_MINT, ETH_MINT, FTT_MINT, RAY_MINT, SOL_MINT, SRM_MINT } from "../../utils/ids";
import BorrowingMarketState from "../../models/hubble/BorrowingMarketState";
import { SmallButton } from "../../components/SmallButton/SmallButton";
import { UserVault } from "../../models/hubble/UserVault";
import PageTitle from "../../components/PageTitle/PageTitle";
import { lamportsToColl } from "../../utils/utils";

type LiquidationRow = {
  key: number,
  debt: number,
  collateral: number,
  netValue: number,
  collateralRatio: number,
  liquidationThreshold: number,
  button: any,
  address: string,
  tokens: Token[]
}

const columns = [
  {
    title: 'Loans',
    dataIndex: 'tokens',
    render: (tokens: Token[]) => (
      <div style={{ marginRight: "50px", float: "left" }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center"
        }}>
          {tokens.includes("SOL") ? <img style={{ borderRadius: 50 }} src={sol} alt="" /> : null}
          {tokens.includes("BTC") ? <img style={{ borderRadius: 50 }} src={btc} alt="" /> : null}
          {tokens.includes("ETH") ? <img style={{ borderRadius: 50 }} src={eth} alt="" /> : null}
          {tokens.includes("RAY") ? <img style={{ borderRadius: 50 }} src={ray} alt="" /> : null}
          {tokens.includes("FTT") ? <img style={{ borderRadius: 50 }} src={ftt} alt="" /> : null}
          {tokens.includes("SRM") ? <img style={{ borderRadius: 50 }} src={srm} alt="" /> : null}
        </div>
        < Typography.Text style={{ fontSize: "10px" }} />
      </div >
    )
  },
  {
    title: 'Debt',
    dataIndex: 'debt',
    sorter: (a: LiquidationRow, b: LiquidationRow) => a.debt - b.debt,
    render: (debt: number) => `$${format(debt)}`
  },
  {
    title: 'Address',
    dataIndex: 'address',
    render: (address: string) => `${address.substr(0, 4)}...${address.substr(address.length - 4, 4)}`
  },
  {
    title: 'Collateral',
    dataIndex: 'collateral',
    sorter: (a: LiquidationRow, b: LiquidationRow) => a.collateral - b.collateral,
    render: (collateral: number) => `$${format(collateral)}`

  },
  // {
  //   title: 'Net Value',
  //   dataIndex: 'netValue',
  //   sorter: (a: LiquidationRow, b: LiquidationRow) => a.netValue - b.netValue,
  //   render: (netValue: number) => `$${format(netValue)}`
  // },
  {
    title: 'CR(%)',
    dataIndex: 'collateralRatio',
    sorter: (a: LiquidationRow, b: LiquidationRow) => a.collateralRatio - b.collateralRatio,
    render: (collateralRatio: number) => {
      let color = "white";
      if (collateralRatio < 110) {
        color = "red";
      } else if (collateralRatio < 150) {
        color = "orange"
      }
      return <div style={{ color }}>{collateralRatio}%</div>
    }

  },
  {
    title: 'LR(%)',
    dataIndex: 'liquidationThreshold',
    sorter: (a: LiquidationRow, b: LiquidationRow) => a.liquidationThreshold - b.liquidationThreshold,
    render: (liquidationThreshold: number) => `${liquidationThreshold}%`
  },
  {
    title: parse('<div style="margin-left:50px; margin-top: -5px;"><div style="display: flex; align-items:center;"><!--<span style = " font-size: 14px; " >&#x21bb;</span> <div style="margin-left:10px;">Refresh</div></div>--><div style="font-size: 14px; color:#8F8F8F;"></div></div>'),
    dataIndex: 'button',
    render: (content: any) => <div style={{ display: "flex", justifyContent: "center" }}>{content}</div>
  },
];

const pagination = {
  pageSize: 10,
}

const Liquidations = () => {

  const [data, setData] = useState<LiquidationRow[]>([]);
  const userVaults = useSelector<RootStateOrAny, UserVault[]>(state => state.hubbleBorrow.userVaults);
  const userVaultsLoading = useSelector<RootStateOrAny, boolean>(state => state.hubbleBorrow.userVaultsLoading)
  const userVaultsError = useSelector<RootStateOrAny, boolean>(state => state.hubbleBorrow.userVaultsError)
  const markets = useSelector<RootStateOrAny, Record<string, SerumMarket>>(state => state.serum.markets);

  const borrowingMarketState = useSelector<RootStateOrAny, BorrowingMarketState>(state => state.hubbleBorrow.borrowingMarketState);
  const ethAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.ethAta);
  const btcAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.btcAta);
  const srmAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.srmAta);
  const fttAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.fttAta);
  const rayAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.rayAta);
  const liquidationCounter = useSelector<RootStateOrAny, number>(state => state.hubbleBorrow.liquidationCounter);

  const mintAddresses: string[] = [
    BTC_MINT,
    ETH_MINT,
    FTT_MINT,
    SOL_MINT,
    RAY_MINT,
    SRM_MINT
  ];

  const dispatch = useDispatch();
  const { env, walletPublicKey } = useEnv();

  useEffect(() => {
    if (mintAddresses.length > 0) {
      dispatch({
        type: 'serum/GET_MARKETS',
        payload: {
          mintAddresses,
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintAddresses])

  useEffect(() => {
    if (!walletPublicKey) {
      return;
    }

    dispatch({
      type: 'hubble/borrow/GET_USER_VAULTS',
      payload: {
        env
      },
    });


    dispatch({
      type: "hubble/borrow/GET_STABILITY_POOL_STATE",
      payload: {
        env
      },
    });

    dispatch({
      type: "hubble/borrow/GET_BORROWING_MARKET_STATE",
      payload: {
        env
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, walletPublicKey]);

  useEffect(() => {
    if (walletPublicKey !== null) {
      dispatch({
        type: 'hubble/borrow/GET_USER_VAULTS',
        payload: {
          env
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, walletPublicKey, liquidationCounter]);

  const tryLiquidate = (userMetadata: PublicKey, pos: UserMetadata) => {
    if (walletPublicKey !== null) {
      dispatch({
        type: 'hubble/borrow/TRY_LIQUIDATE',
        payload: {
          userPublicKey: walletPublicKey,
          env,
          userMetadata,
          borrowingMarketState,
          liquidationCounter,
          srmAta,
          ethAta,
          btcAta,
          rayAta,
          fttAta,
          pos
        },
      });
    }
  }

  useEffect(() => {
    const btcPrice = markets[BTC_MINT]?.midPrice;
    const ethPrice = markets[ETH_MINT]?.midPrice;
    const fttPrice = markets[FTT_MINT]?.midPrice;
    const solPrice = markets[SOL_MINT]?.midPrice;
    const rayPrice = markets[RAY_MINT]?.midPrice;
    const srmPrice = markets[SRM_MINT]?.midPrice;
    console.log(`Prices: SOL ${rounded(solPrice ? solPrice * SOL_PRICE_FACTOR_DEV : 0)} BTC ${rounded(btcPrice)} ETH ${rounded(ethPrice)} FTT ${rounded(fttPrice)} RAY ${rounded(rayPrice)} SRM ${rounded(srmPrice)}`);
    if (
      userVaults != null &&
      btcPrice != null &&
      solPrice != null &&
      srmPrice != null &&
      fttPrice != null &&
      ethPrice != null &&
      rayPrice != null) {
      const users = [];
      const rawPositions: UserMetadata[] = userVaults.map(v => v.data);
      for (let i = 0; i < rawPositions.length; i++) {
        const pos = rawPositions[i];
        // console.log("Position", pos.userMetadata.toString());
        // console.log("User Metadata Pubkey", pos.userAddress.toString());
        const { metadataPk: userMetadata } = pos;
        const debt = pos.borrowedStablecoin / STABLECOIN_DECIMALS;
        if (pos.status === 1) {
          const collateralValue =
            lamportsToColl(pos.depositedCollateral.btc, "BTC") * btcPrice +
            lamportsToColl(pos.depositedCollateral.eth, "ETH") * ethPrice +
            lamportsToColl(pos.depositedCollateral.ftt, "FTT") * fttPrice +
            lamportsToColl(pos.depositedCollateral.sol, "SOL") * solPrice * SOL_PRICE_FACTOR_DEV +
            lamportsToColl(pos.depositedCollateral.ray, "RAY") * rayPrice +
            lamportsToColl(pos.depositedCollateral.srm, "SRM") * srmPrice;

          const collateralRatio = rounded(collateralValue / debt * 100);

          if (collateralRatio < 101) {
            // TODO: demo only
            // eslint-disable-next-line no-continue
            // continue;
          }

          const position: LiquidationRow = {
            key: i,
            debt,
            address: userMetadata.toString(),
            collateral: rounded(collateralValue),
            netValue: rounded(collateralValue - debt),
            collateralRatio,
            liquidationThreshold: 110.0,
            button: collateralRatio < 110.0 ?
              <SmallButton onClick={() => tryLiquidate(userMetadata, pos)} text="Liquidate" isLoading={false} disabled={false} /> :
              <SmallButton onClick={() => tryLiquidate(userMetadata, pos)} text="Liquidate" isLoading={false} disabled />,
            tokens: toArray(pos.depositedCollateral)
          };
          users.push(position);
        }
      }
      users.sort((a, b) => a.collateralRatio - b.collateralRatio);
      setData(users);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userVaults, userVaultsLoading, userVaultsError, markets]);

  return (
    <div style={{
      flexGrow: 1,
      width: '100%',
      marginTop: 50,
      textAlign: "left"
    }}>
      <PageTitle
        title="Liquidate"
        description="Help us keep the system healthy and earn rewards! Liquidate users that are below the collateral ratio and you will earn 0.5% of the collateral. The remaining is distributed to the Stability Pool providers."
      />

      {data.length !== 0 ?
        <div>
          <Table columns={columns} dataSource={data} style={{ marginTop: "50px" }} pagination={pagination} footer={() => `Showing 10 of ${data.length}`} />
        </div> : <div className="nodata">
          <Row style={{ paddingTop: "10px" }}>
            <Col span={4} />
            <Col span={4}><Typography.Text type="secondary">Total Staked</Typography.Text></Col>
            <Col span={4}><Typography.Text type="secondary">%of Pool</Typography.Text></Col>
            <Col span={4}><Typography.Text type="secondary">Pending Reward</Typography.Text></Col>
            <Col span={4}><Typography.Text type="secondary">APY</Typography.Text></Col>
            <Col span={8} />
          </Row>
          <div style={{ padding: "0px 25px" }}>
            <hr />
          </div>
          <div className="showimage">
            <div style={{ textAlign: "center" }}>
              <img src={nodata} alt="no data" width={95} height={95} /><br />
              <Typography.Text type="secondary">No data Available</Typography.Text>
            </div>
          </div>
        </div>}
    </div>
  );
};

function rounded(num: number | undefined | null): number {
  if (num != null) {
    return Math.round(num * 100) / 100
  }
  return -1;

}

function toArray(map: CollateralAmounts): Token[] {
  const arr: Token[] = [];
  if (map.btc > 0) { arr.push("BTC" as Token); }
  if (map.eth > 0) { arr.push("ETH" as Token); }
  if (map.ftt > 0) { arr.push("FTT" as Token); }
  if (map.sol > 0) { arr.push("SOL" as Token); }
  if (map.ray > 0) { arr.push("RAY" as Token); }
  if (map.srm > 0) { arr.push("SRM" as Token); }
  return arr;
}

function format(num: number): string {
  return parseFloat((num).toFixed(2)).toLocaleString().replace(/\.([0-9])$/, ".$10")
}

export default Liquidations;
