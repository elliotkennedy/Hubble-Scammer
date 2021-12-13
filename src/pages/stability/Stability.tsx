import { useEffect, useState } from "react";
import { Button, Col, Row, Typography, Modal } from "antd";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { PublicKey } from "@solana/web3.js";
import { createSelector } from "reselect";
import useEnv from "../../hooks/useEnv";
import StabilityPoolState from "../../models/hubble/StabilityPoolState";
import StabilityProviderState from "../../models/hubble/StabilityProviderState";
import USDH from "../../assets/usdh.png";
import "./Stability.less";
import ModalTabSelect from "../../components/ModalTabSelect/ModalTabSelect";
import { ConnectButton } from "../../components/ConnectButton/ConnectButton";
import { notify } from "../../utils/notifications";
import {
  BTC_MINT,
  ETH_MINT,
  FTT_MINT,
  SOL_MINT,
  RAY_MINT,
  SRM_MINT,
} from "../../utils/ids";
import { SerumMarket } from "../../models/SerumMarket";
import { HBB_DECIMALS, SOL_PRICE_FACTOR_DEV, STABLECOIN_DECIMALS, Token } from "../../constants";
import { EpochToScaleToSumSerialized } from "../../models/hubble/EpochToScaleToSum";
import { calculatePendingGains } from "./gains";
import {
  StabilityList,
  StabilityReward,
} from "../../components/StabilityList/StabilityList";
import { SecondaryButton } from "../../components/SecondaryButton/SecondaryButton";
import { SmallButton } from "../../components/SmallButton/SmallButton";
import StabilityTokenMap from "../../models/hubble/StabilityTokenMap";
import { roundDown } from "../../utils/math";
import PageTitle from "../../components/PageTitle/PageTitle";
import VaultComponentContainer, { VaultContainer } from "../../components/VaultComponent/ContainerVaultComponent";
import { lamportsToColl } from "../../utils/utils";

const { Text } = Typography;

type StabilityProviderStats = {
  usdhProvided: number;
  pctOfPool: number;
  hbbRewards: number;
  apy: number;
};

const mintAddresses: string[] = [
  BTC_MINT,
  ETH_MINT,
  FTT_MINT,
  SOL_MINT,
  RAY_MINT,
  SRM_MINT,
];

const Stability = () => {
  const { env, walletPublicKey } = useEnv();
  const dispatch = useDispatch();

  const [provideModalVisible, setProvideModalVisible] = useState<boolean>(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState<boolean>(false);
  const [inputProvideStability, setInputProvideStability] = useState<number>(0);
  const [inputWithdrawStability, setInputWithdrawStability] = useState<number>(0);
  const [providedStability, setProvidedStability] = useState<number>(0);
  const [totalStabilityProvided, setTotalStabilityProvided] = useState<number>(0);
  const [totalStabilityRevenue, setTotalStabilityRevenue] = useState<number>(0);
  const [totalHbbRevenue, setTotalHbbRevenue] = useState<number>(0);
  const [pendingUserGains, setPendingUserGains] = useState<StabilityTokenMap>({ sol: 0, eth: 0, btc: 0, srm: 0, ray: 0, ftt: 0, hbb: 0 });
  const [pendingUserGainsValue, setPendingUserGainsValue] = useState<StabilityReward[]>([]);
  const [totalPendingUserGainsValue, setTotalPendingUserGainsValue] = useState<number>(0);
  const [userIsStabilityProvider, setUserIsStabilityProvider] = useState<boolean>(false);
  const [stabilityProviderStats, setStabilityProviderStats] = useState<StabilityProviderStats>({ usdhProvided: 0, pctOfPool: 0, hbbRewards: 0, apy: 20, });
  const [vaultContainerData, setVaultContainerData] = useState<Array<VaultContainer> | []>([])

  const stabilityPoolStatePubkey = useSelector<RootStateOrAny, StabilityPoolState>((state) => state.hubbleBorrow.stabilityPoolStatePubkey);
  const stabilityPoolState = useSelector<RootStateOrAny, StabilityPoolState>((state) => state.hubbleBorrow.stabilityPoolState);
  const borrowingMarketState = useSelector<RootStateOrAny, StabilityPoolState>((state) => state.hubbleBorrow.borrowingMarketState);
  const epochToScaleToSum = useSelector<RootStateOrAny, EpochToScaleToSumSerialized>((state) => state.hubbleBorrow.epochToScaleToSum);

  const stabilityProviderState = useSelector<RootStateOrAny, StabilityProviderState>((state) => state.hubbleBorrow.stabilityProviderState);
  const stabilityProviderStatePubkey = useSelector<RootStateOrAny, PublicKey>((state) => state.hubbleBorrow.stabilityProviderStatePubkey);

  const stablecoinAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.stablecoinAta);
  const ethAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.ethAta);
  const btcAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.btcAta);
  const srmAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.srmAta);
  const fttAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.fttAta);
  const rayAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.rayAta);
  const hbbAta = useSelector<RootStateOrAny, PublicKey | null>(state => state.hubbleCore.hbbAta);

  const mintCounter = useSelector<RootStateOrAny, number>(state => state.hubbleCore.mintCounter);
  const airdropCounter = useSelector<RootStateOrAny, number>(state => state.hubbleBorrow.airdropCounter);
  const stabilityCounter = useSelector<RootStateOrAny, number>(state => state.hubbleBorrow.stabilityCounter);

  const stablecoinBalance = useSelector<RootStateOrAny, number | null>(state => state.hubbleCore.stablecoinBalance);
  const loadingSelector = createSelector(
    [
      (state: any): boolean => state.hubbleBorrow.stabilityProviderStateLoading,
      (state: any): boolean => state.hubbleBorrow.stabilityPoolStateLoading,
    ],
    (stabilityProviderStateLoading, stabilityPoolStateLoading): boolean =>
      stabilityProviderStateLoading || stabilityPoolStateLoading
  );
  const loading = useSelector<RootStateOrAny, boolean>(loadingSelector);
  const markets = useSelector<RootStateOrAny, Record<string, SerumMarket>>(state => state.serum.markets);

  const resetState = () => {
    setProvideModalVisible(false);
    setWithdrawModalVisible(false);
    setInputProvideStability(0);
    setInputWithdrawStability(0);
    setProvidedStability(0);
    setTotalStabilityProvided(0);
    setTotalStabilityRevenue(0);
    setTotalHbbRevenue(0);
    setPendingUserGains({ sol: 0, eth: 0, btc: 0, srm: 0, ray: 0, ftt: 0, hbb: 0 });
    setPendingUserGainsValue(["SOL", "ETH", "BTC", "FTT", "RAY", "SRM"].map((coin): StabilityReward => { return { token: coin as Token, amount: 0, value: 0 } }));
    setTotalPendingUserGainsValue(0);
    setUserIsStabilityProvider(false);
    setStabilityProviderStats({ usdhProvided: 0, pctOfPool: 0, hbbRewards: 0, apy: 20, });
  }

  useEffect(() => {
    if (walletPublicKey === null) {
      resetState();
    }
  }, [walletPublicKey]);

  useEffect(() => {
    if (walletPublicKey !== null) {
      dispatch({
        type: "hubble/borrow/GET_STABILITY_POOL_STATE",
        payload: {
          env,
        },
      });

      dispatch({
        type: "hubble/borrow/GET_BORROWING_MARKET_STATE",
        payload: {
          env,
        },
      });

      dispatch({
        type: "hubble/borrow/GET_STABILITY_PROVIDER_STATE",
        payload: {
          userPublicKey: walletPublicKey,
          env,
        },
      });

      dispatch({
        type: "hubble/core/GET_TOKENS_ATA",
        payload: {
          publicKey: walletPublicKey,
          env,
        },
      });

    }

    if (mintAddresses.length > 0) {
      dispatch({
        type: "serum/GET_MARKETS",
        payload: {
          mintAddresses,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletPublicKey, env]);

  useEffect(() => {
    if (walletPublicKey !== null) {
      dispatch({
        type: "hubble/borrow/GET_STABILITY_POOL_STATE",
        payload: {
          env,
        },
      });

      dispatch({
        type: "hubble/borrow/GET_STABILITY_PROVIDER_STATE",
        payload: {
          userPublicKey: walletPublicKey,
          env,
        },
      });
      dispatch({
        type: "hubble/core/GET_ATA_BALANCE",
        payload: {
          stablecoinAta,
          ethAta,
          btcAta,
          srmAta,
          fttAta,
          rayAta,
          hbbAta,
        },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletPublicKey, env, stabilityCounter]);

  useEffect(() => {
    if (!walletPublicKey) {
      return;
    }
    console.log("Getting Ata Balance");

    dispatch({
      type: "hubble/core/GET_ATA_BALANCE",
      payload: {
        stablecoinAta,
        ethAta,
        btcAta,
        srmAta,
        fttAta,
        rayAta,
        hbbAta,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stablecoinAta,
    ethAta,
    btcAta,
    srmAta,
    fttAta,
    rayAta,
    mintCounter,
    airdropCounter,
  ]);

  useEffect(() => {
    if (stabilityProviderState != null && epochToScaleToSum != null) {
      // Calculate user latest state (given previous liquidations)
      console.log("Epoch", epochToScaleToSum);
      console.log("Calculating pending");

      const [pendingGains, userDeposits] = calculatePendingGains(
        stabilityPoolState,
        stabilityProviderState,
        epochToScaleToSum
      );

      console.log("User Pending sol", pendingGains.sol);
      console.log("User Pending eth", pendingGains.eth);
      console.log("User Pending btc", pendingGains.btc);
      console.log("User Pending ftt", pendingGains.ftt);
      console.log("User Pending ray", pendingGains.ray);
      console.log("User Pending srm", pendingGains.srm);
      console.log("User Pending hbb", pendingGains.hbb);

      setPendingUserGains(pendingGains);
      setProvidedStability(userDeposits / STABLECOIN_DECIMALS);
      setUserIsStabilityProvider(true);

      // Update stats
      const globalDeposits = stabilityPoolState.totalUsdDeposits;

      const _stabilityProviderStats: StabilityProviderStats = {
        usdhProvided: userDeposits / STABLECOIN_DECIMALS,
        pctOfPool:
          Math.round(
            globalDeposits === 0 || userDeposits === 0
              ? 0
              : (userDeposits / globalDeposits) * STABLECOIN_DECIMALS
          ) / 100,
        hbbRewards: Math.max(0, pendingGains.hbb),
        apy: 0,
      };
      console.log("Setting stats to", JSON.stringify(_stabilityProviderStats));
      setStabilityProviderStats(_stabilityProviderStats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stabilityProviderState, epochToScaleToSum]);

  useEffect(() => {
    const vaultData = [
      {
        topic: 'Total USDH Staked',
        price: format(totalStabilityProvided),
        limit: false
      },
      {
        topic: 'Total Liquidation Revenue',
        price: format(totalStabilityRevenue),
        limit: false
      },
      {
        topic: 'Total HBB Revenue',
        price: format(totalHbbRevenue),
        limit: false
      },
    ]

    setVaultContainerData(vaultData)
  }, [totalStabilityProvided, totalStabilityRevenue, totalHbbRevenue])

  useEffect(() => {
    const btcPrice = markets[BTC_MINT]?.midPrice;
    const ethPrice = markets[ETH_MINT]?.midPrice;
    const fttPrice = markets[FTT_MINT]?.midPrice;
    const rayPrice = markets[RAY_MINT]?.midPrice;
    const srmPrice = markets[SRM_MINT]?.midPrice;
    const solPrice = markets[SOL_MINT]?.midPrice;

    if (stabilityPoolState != null) {
      const liquidationRevenue =
        lamportsToColl(stabilityPoolState.cumulativeGainsTotal.sol, "SOL") * (solPrice ? solPrice * SOL_PRICE_FACTOR_DEV : 0) +
        lamportsToColl(stabilityPoolState.cumulativeGainsTotal.eth, "ETH") * (ethPrice || 0) +
        lamportsToColl(stabilityPoolState.cumulativeGainsTotal.btc, "BTC") * (btcPrice || 0) +
        lamportsToColl(stabilityPoolState.cumulativeGainsTotal.ftt, "FTT") * (fttPrice || 0) +
        lamportsToColl(stabilityPoolState.cumulativeGainsTotal.ray, "RAY") * (rayPrice || 0) +
        lamportsToColl(stabilityPoolState.cumulativeGainsTotal.srm, "SRM") * (srmPrice || 0);

      const hbbRevenue = stabilityPoolState.cumulativeGainsTotal.hbb / HBB_DECIMALS;

      setTotalStabilityProvided(
        stabilityPoolState.totalUsdDeposits / STABLECOIN_DECIMALS
      );
      setTotalStabilityRevenue(liquidationRevenue);
      setTotalHbbRevenue(hbbRevenue);
    }

    const pendingGainsValue: StabilityReward[] = [
      {
        token: "SOL",
        amount: pendingUserGains.sol,
        value: pendingUserGains.sol * (solPrice ? solPrice * SOL_PRICE_FACTOR_DEV : 0),
      },
      {
        token: "ETH",
        amount: pendingUserGains.eth,
        value: pendingUserGains.eth * (ethPrice || 0),
      },
      {
        token: "BTC",
        amount: pendingUserGains.btc,
        value: pendingUserGains.btc * (btcPrice || 0),
      },
      {
        token: "FTT",
        amount: pendingUserGains.ftt,
        value: pendingUserGains.ftt * (fttPrice || 0),
      },
      {
        token: "RAY",
        amount: pendingUserGains.ray,
        value: pendingUserGains.ray * (rayPrice || 0),
      },
      {
        token: "SRM",
        amount: pendingUserGains.srm,
        value: pendingUserGains.srm * (srmPrice || 0),
      },
    ];
    const total = pendingGainsValue.reduce((acc, x) => acc + x.value, 0);
    setTotalPendingUserGainsValue(total);
    console.log("pendingUserGains", pendingUserGains);
    setPendingUserGainsValue(pendingGainsValue);
  }, [pendingUserGains, stabilityPoolState, markets]);

  const aprs: StabilityReward[] = [
    {
      token: "HBB",
      amount: !stabilityProviderStats.hbbRewards ? 0 : stabilityProviderStats.hbbRewards,
      value: !stabilityProviderStats.hbbRewards ? 0 : stabilityProviderStats.hbbRewards,
    },
  ];

  const approveStability = () => {
    if (!walletPublicKey) {
      return;
    }

    dispatch({
      type: "hubble/borrow/APPROVE_STABILITY",
      payload: {
        env,
        userPublicKey: new PublicKey(walletPublicKey),
        stabilityPoolState: stabilityPoolStatePubkey,
        stabilityCounter,
      },
    });
  };

  const provideStability = () => {
    if (!walletPublicKey) {
      return false;
    }

    if (!inputProvideStability) {
      notify({
        message: "Please select a higher number",
        description: <div>Amount selected is 0.</div>,
        type: "warning",
      });
      return false;
    }

    console.log("Providing stability", inputProvideStability);

    dispatch({
      type: "hubble/borrow/PROVIDE_STABILITY",
      payload: {
        amount: inputProvideStability,
        userPublicKey: walletPublicKey,
        env,
        stablecoinAta,
        stabilityProviderStatePubkey,
        stabilityPoolStatePubkey,
        stabilityCounter,
      },
    });

    return true;
  };

  const withdrawStability = () => {
    if (!walletPublicKey) {
      return false;
    }

    if (!inputWithdrawStability) {
      notify({
        message: "Please select a higher number",
        description: <div>Amount selected is 0.</div>,
        type: "warning",
      });
      return false;
    }

    console.log("Providing stability", inputWithdrawStability);

    dispatch({
      type: "hubble/borrow/WITHDRAW_STABILITY",
      payload: {
        amount: inputWithdrawStability,
        userPublicKey: walletPublicKey,
        env,
        stablecoinAta,
        stabilityProviderStatePubkey,
        stabilityPoolStatePubkey,
        stabilityCounter,
      },
    });

    return true;
  };

  const harvestLiquidationGains = () => {
    if (!walletPublicKey) {
      return;
    }

    console.log("Harvest console");

    dispatch({
      type: "hubble/borrow/HARVEST_LIQUIDATION_GAINS",
      payload: {
        userPublicKey: walletPublicKey,
        env,
        stabilityProviderStatePubkey,
        stabilityPoolStatePubkey,
        stabilityCounter,
        srmAta,
        ethAta,
        btcAta,
        rayAta,
        fttAta,
        hbbAta,
        borrowingMarketState
      },
    });
  };

  return (
    <div
      style={{
        flexGrow: 1,
        width: "100%",
        marginTop: 50,
        textAlign: "left",
      }}
    >

      <PageTitle
        title="Stability"
        description="Stake USDH to earn liquidation rewards and HBB emissions. When liquidations occur, you will earn all the collateral of the liquidated users in exchange of paying their debt."
      />

      <VaultComponentContainer vaultsData={vaultContainerData} />

      <div
        className="stable-margin ant-table-content ant-card-body"
        style={{
          padding: 16,
          backgroundColor: "rgba(38, 40, 55, 0.72)",
          border: 1,
          borderRadius: 20,
          borderStyle: "solid",
          borderColor: "#8F8F8F",
        }}
      >
        <Row
          style={{
            textAlign: "left",
            border: 0,
            margin: 0,
            padding: 0,
            paddingLeft: 0,
            paddingRight: 0,
            // backgroundColor: "#000"
          }}
        >
          <Col span={4} />
          <Col span={3}><Text strong>USDH Staked</Text></Col>
          <Col span={2}><Text strong>Pool %</Text></Col>
          <Col span={3}><Text strong>Liq. Rewards</Text></Col>
          <Col span={3}><Text strong>HBB Rewards</Text></Col>
          <Col span={4}><Text strong>APY</Text> </Col>
          <Col span={5} />
        </Row>
        <hr className="stability-hr" />
        <Row
          className="font-middle item-center"
          style={{
            textAlign: "left",
            marginBottom: 20,
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          <Col span={4}>
            <img alt="USDH" src={USDH} width={23} height={23} />
            <Text style={{ marginLeft: "10px" }}>USDH</Text>
          </Col>
          <Col span={3}><Text>${format(stabilityProviderStats.usdhProvided)}</Text></Col>
          <Col span={2}><Text>{roundDown(stabilityProviderStats.pctOfPool, 2)}%</Text> </Col>
          <Col span={3}><Text>${format(totalPendingUserGainsValue)}</Text></Col>
          <Col span={3}><Text>${format(stabilityProviderStats.hbbRewards)}</Text></Col>
          <Col span={4}><Text>{format(stabilityProviderStats.apy)}%</Text></Col>
          {!walletPublicKey ? <Col
            span={5}
            style={{
              border: 0,
              borderStyle: "solid",
              display: "flex",
              alignContent: "right",
              alignItems: "end",
              justifyContent: "end",
              justifyItems: "right",
            }}
          ><ConnectButton className="myButton" /></Col> : null}
          {!(walletPublicKey && userIsStabilityProvider) ? null : (
            <Col
              span={5}
              style={{
                border: 0,
                borderStyle: "solid",
                display: "flex",
                alignContent: "right",
                alignItems: "end",
                justifyContent: "end",
                justifyItems: "right",
              }}
            >
              {providedStability <= 0 ? (
                <div
                  style={{
                    border: 0,
                    borderStyle: "solid",
                    width: "100%",
                    display: "flex",
                    alignContent: "right",
                    alignItems: "end",
                    justifyContent: "end",
                    justifyItems: "right",
                  }}
                >
                  <div style={{ marginLeft: 10 }}>
                    <SmallButton
                      onClick={() => {
                        harvestLiquidationGains();
                        return 0;
                      }}
                      disabled={(totalPendingUserGainsValue <= 0 && pendingUserGains.hbb <= 0)}
                      isLoading={loading}
                      text="Harvest"
                    />
                  </div>
                  <div style={{ marginLeft: 10 }}>
                    <SmallButton
                      onClick={() => {
                        setProvideModalVisible(true);
                        return 0;
                      }}
                      disabled={false}
                      isLoading={loading}
                      text="Deposit"
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    alignContent: "right",
                    alignItems: "end",
                    justifyContent: "end",
                    justifyItems: "right",
                  }}
                >
                  <SmallButton
                    onClick={() => {
                      harvestLiquidationGains();
                      return 0;
                    }}
                    disabled={(totalPendingUserGainsValue <= 0 && pendingUserGains.hbb <= 0)}
                    isLoading={loading}
                    text="Harvest"
                  />
                  <div style={{ marginRight: 10, marginLeft: 10 }}>
                    <SmallButton
                      onClick={() => {
                        setInputWithdrawStability(0);
                        setWithdrawModalVisible(true);
                        return 0;
                      }}
                      disabled={false}
                      isLoading={loading}
                      text="-"
                    />
                  </div>
                  <div>
                    <SmallButton
                      onClick={() => {
                        setInputProvideStability(0);
                        setProvideModalVisible(true);
                        return 0;
                      }}
                      disabled={false}
                      isLoading={loading}
                      text="+"
                    />
                  </div>
                </div>
              )}
            </Col>
          )}

          {!(walletPublicKey && !userIsStabilityProvider) ? null : (
            <Col
              span={5}
              style={{
                display: "flex",
                alignContent: "right",
                alignItems: "end",
                justifyContent: "end",
                justifyItems: "right",
              }}
            >
              <SmallButton
                onClick={() => {
                  approveStability();
                  return 0;
                }}
                disabled={false}
                isLoading={loading}
                text="Approve Stability"
              />
            </Col>
          )}
        </Row>

        <Row
          style={{
          }}>
          <div style={{
            flexGrow: 1,
            justifyContent: "center",
            paddingRight: 10,
            height: "auto"
          }}>
            <StabilityList topic="Staking Reward" aprs={aprs} />
          </div>
          <div style={{
            flexGrow: 1,
            justifyContent: "center",
            paddingLeft: 10
          }}>
            <StabilityList
              topic="Liquidation Reward"
              aprs={pendingUserGainsValue}
            />
          </div>
        </Row>
      </div>
      <Modal
        title="Provide USDH Stability"
        centered
        visible={provideModalVisible}
        onOk={() => setProvideModalVisible(false)}
        onCancel={() => setProvideModalVisible(false)}
        className="modal-component"
        footer={[
          <SecondaryButton
            key="back"
            onClick={() =>
              provideStability() ? setProvideModalVisible(false) : {}
            }
            isLoading={loading}
            text="Provide Stability"
            disabled={false}
          />,
        ]}
      >
        <ModalTabSelect
          topic={`Available USDH: $${!stablecoinBalance ? "0" : format(stablecoinBalance)
            }`}
          value={inputProvideStability}
          max={!stablecoinBalance ? 0 : stablecoinBalance}
          onValueChange={(amount: number) => {
            console.log("Input provide stability to", amount);
            setInputProvideStability(amount);
          }}
        />
      </Modal>
      <Modal
        title="Withdraw USDH"
        centered
        visible={withdrawModalVisible}
        onOk={() => setWithdrawModalVisible(false)}
        onCancel={() => setWithdrawModalVisible(false)}
        className="modal-component"
        footer={[
          <Button
            key="back"
            onClick={() =>
              withdrawStability() ? setWithdrawModalVisible(false) : {}
            }
            className="buttonstyle"
            style={{ cursor: "pointer" }}
          >
            Withdraw Stability
          </Button>,
        ]}
      >
        <ModalTabSelect
          topic={`Deposited USDH: $${!providedStability ? "0" : format(providedStability)
            }`}
          value={inputWithdrawStability}
          max={!providedStability ? 0 : providedStability}
          onValueChange={(amount: number) => {
            console.log("Input withdraw stability to", amount);
            setInputWithdrawStability(amount);
          }}
        />
      </Modal>
    </div>
  );
};

function format(num: number): string {
  return parseFloat(num.toFixed(2))
    .toLocaleString()
    .replace(/\.([0-9])$/, ".$10");
}

export default Stability;
