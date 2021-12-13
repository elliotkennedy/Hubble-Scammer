import { useState, useEffect } from "react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { Button, Col, Modal, Row, Typography } from "antd";
import { PublicKey } from "@solana/web3.js";
import { createSelector } from "reselect";
import useEnv from "../../hooks/useEnv";
import HBB from "../../assets/hbb.png";
import { notify } from "../../utils/notifications";
import "./Staking.less";
import StakingPoolState from "../../models/hubble/StakingPoolState";
import UserStakingState from "../../models/hubble/UserStakingState";
import {
  StabilityList,
  StabilityReward,
} from "../../components/StabilityList/StabilityList";
import { ConnectButton } from "../../components/ConnectButton/ConnectButton";
import { HBB_DECIMALS, STABLECOIN_DECIMALS } from "../../constants";
import { formatNumber, numberFormatter, zeroIfNaN } from "../../utils/utils";
import ModalTabSelect from "../../components/ModalTabSelect/ModalTabSelect";
import { SecondaryButton } from "../../components/SecondaryButton/SecondaryButton";
import { SmallButton } from "../../components/SmallButton/SmallButton";
import PageTitle from "../../components/PageTitle/PageTitle";
import VaultComponentContainer, { VaultContainer } from "../../components/VaultComponent/ContainerVaultComponent";

const { Text } = Typography;

type UserStakingStats = {
  hbbStaked: number;
  pctOfPool: number;
  stablecoinRewards: number;
};

const Staking = () => {
  const { env } = useEnv();
  const dispatch = useDispatch();
  const { walletPublicKey } = useEnv();

  const [stakeModalVisible, setStakeModalVisible] = useState<boolean>(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState<boolean>(false);
  const [inputStake, setinputStake] = useState<number>(0);
  const [inputWithdrawStake, setinputWithdrawStake] = useState<number>(0);
  const [providedStake, setprovidedStake] = useState<number>(0);
  const [totalPendingUserGainsValue, setTotalPendingUserGainsValue] = useState<number>(0);
  const [totalStakeProvided, setTotalStakeProvided] = useState<number>(0);
  const [totalRewardsAccrued, setTotalRewardsAccrued] = useState<number>(0);
  const [userIsStaker, setUserIsStaker] = useState<boolean>(false);
  const [userStakingStats, setUserStakingStats] = useState<UserStakingStats>({ hbbStaked: 0, pctOfPool: 0, stablecoinRewards: 0, });
  const [vaultContainerData, setVaultContainerData] = useState<Array<VaultContainer> | []>([])

  const loadingSelector = createSelector(
    [
      (state: any): boolean => state.solana.knownMintsLoading,
      (state: any): boolean => state.hubbleStaking.stakingPoolStateLoading,
      (state: any): boolean => state.hubbleStaking.userStakingStateLoading,
    ],
    (
      knownMintsLoading,
      stakingPoolStateLoading,
      userStakingStateLoading
    ): boolean =>
      knownMintsLoading || stakingPoolStateLoading || userStakingStateLoading
  );

  const loading = useSelector<RootStateOrAny, boolean>(loadingSelector);
  const submitting = useSelector<RootStateOrAny, boolean>((state) => state.hubbleStaking.stakeSubmitting);

  const stablecoinAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.stablecoinAta);
  const ethAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.ethAta);
  const btcAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.btcAta);
  const srmAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.srmAta);
  const fttAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.fttAta);
  const rayAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.rayAta);
  const hbbAta = useSelector<RootStateOrAny, PublicKey | null>((state) => state.hubbleCore.hbbAta);

  const hbbBalance = useSelector<RootStateOrAny, number | null>((state) => state.hubbleCore.hbbBalance);

  const mintCounter = useSelector<RootStateOrAny, number>((state) => state.hubbleCore.mintCounter);
  const ataCounter = useSelector<RootStateOrAny, number>((state) => state.hubbleCore.ataCounter);
  const stakingCounter = useSelector<RootStateOrAny, number>((state) => state.hubbleStaking.stakingCounter);

  const stakingPoolState = useSelector<RootStateOrAny, StakingPoolState>((state) => state.hubbleStaking.stakingPoolState);
  const stakingPoolStatePubkey = useSelector<RootStateOrAny, PublicKey>((state) => state.hubbleStaking.stakingPoolStatePubkey);
  const stakingPoolStateLoadingError = useSelector<RootStateOrAny, boolean>((state) => state.hubbleStaking.stakingPoolStateLoadingError);
  const userStakingStateLoadingError = useSelector<RootStateOrAny, boolean>((state) => state.hubbleStaking.userStakingStateLoadingError);
  const userStakingState = useSelector<RootStateOrAny, UserStakingState>((state) => state.hubbleStaking.userStakingState);
  const userStakingStatePubkey = useSelector<RootStateOrAny, PublicKey>((state) => state.hubbleStaking.userStakingStatePubkey);

  const aprs: StabilityReward[] = [
    {
      token: "USDH",
      amount: Math.round(userStakingStats.stablecoinRewards / STABLECOIN_DECIMALS * 100) / 100,
      value: Math.round(userStakingStats.stablecoinRewards / STABLECOIN_DECIMALS * 100) / 100,
    },
  ];

  const redemptionRewards: StabilityReward[] = [
    {
      token: "SOL",
      amount: 0,
      value: 0,
    },
    {
      token: "ETH",
      amount: 0,
      value: 0,
    },
    {
      token: "BTC",
      amount: 0,
      value: 0,
    },
    {
      token: "SRM",
      amount: 0,
      value: 0,
    },
    {
      token: "FTT",
      amount: 0,
      value: 0,
    },
    {
      token: "RAY",
      amount: 0,
      value: 0,
    },
  ];

  const resetState = () => {
    setStakeModalVisible(false);
    setWithdrawModalVisible(false);
    setinputStake(0);
    setinputWithdrawStake(0);
    setprovidedStake(0);
    setTotalPendingUserGainsValue(0);
    // setTotalStakeProvided(0);
    // setTotalRewardsAccrued(0);
    setUserIsStaker(false);
    setUserStakingStats({ hbbStaked: 0, pctOfPool: 0, stablecoinRewards: 0, });
  }

  useEffect(() => {
    if (walletPublicKey === null) {
      resetState();
      return;
    }
    dispatch({
      type: "hubble/stake/GET_STAKING_POOL_STATE",
      payload: {
        env,
      },
    });

    dispatch({
      type: "hubble/stake/GET_USER_STAKING_STATE",
      payload: {
        userPublicKey: walletPublicKey,
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
      type: "hubble/core/GET_TOKENS_ATA",
      payload: {
        publicKey: walletPublicKey,
        env,
        mintCounter,
        ataCounter,
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletPublicKey, env, ataCounter]);

  useEffect(() => {
    if (walletPublicKey !== null) {
      dispatch({
        type: "hubble/stake/GET_STAKING_POOL_STATE",
        payload: {
          env,
        },
      });

      dispatch({
        type: "hubble/stake/GET_USER_STAKING_STATE",
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
  }, [walletPublicKey, env, stakingCounter]);

  useEffect(() => {
    if (!walletPublicKey) {
      return;
    }

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
  }, [stablecoinAta, ethAta, btcAta, srmAta, fttAta, rayAta, hbbAta]);

  useEffect(() => {
    if (!stakingPoolStateLoadingError && stakingPoolState != null) {
      setTotalStakeProvided(stakingPoolState.totalStake / HBB_DECIMALS);
      console.log("stakingPoolState stakingVault", stakingPoolState.stakingVault.toString());
      setTotalRewardsAccrued(
        stakingPoolState.totalDistributedRewards / HBB_DECIMALS
      );
    }
  }, [stakingPoolStateLoadingError, stakingPoolState]);

  useEffect(() => {
    if (
      !userStakingStateLoadingError &&
      userStakingState != null &&
      stakingPoolState != null &&
      userStakingState.user != null && userStakingState.user.toString() === walletPublicKey
    ) {
      setUserIsStaker(true);

      const _userStakingStats: UserStakingStats = {
        hbbStaked: userStakingState.userStake / HBB_DECIMALS,
        pctOfPool:
          zeroIfNaN(Math.round(
            (userStakingState.userStake / stakingPoolState.totalStake) * 10_000
          ) / 100),
        stablecoinRewards:
          (
            userStakingState.userStake *
            stakingPoolState.rewardPerToken -
            userStakingState.rewardsTally) /
          1_000_000_000_000,
      };

      setprovidedStake(userStakingState.userStake / HBB_DECIMALS);
      setTotalPendingUserGainsValue(_userStakingStats.stablecoinRewards);

      console.log("Setting stats to", JSON.stringify(_userStakingStats));

      setUserStakingStats(_userStakingStats);
    }
  }, [userStakingStateLoadingError, userStakingState, stakingPoolState, walletPublicKey]);

  useEffect(() => {
    const vaultData = [
      {
        topic: 'Total HBB Staked',
        price: formatNumber.format(totalStakeProvided),
        limit: false
      },
      {
        topic: 'Total Protocol Revenue',
        price: numberFormatter.format(Math.round(totalRewardsAccrued * 100) / 100),
        limit: false
      },
    ]

    setVaultContainerData(vaultData)
  }, [totalRewardsAccrued, totalStakeProvided])


  const approveStaking = () => {
    if (!walletPublicKey) {
      return;
    }

    dispatch({
      type: "hubble/stake/APPROVE_STAKING",
      payload: {
        env,
        userPublicKey: walletPublicKey,
        hbbAta,
        stablecoinAta,
        stakingPoolStatePubkey,
        stakingCounter,
      },
    });
  };


  const onClickHarvest = () => {
    dispatch({
      type: "hubble/stake/HARVEST_REWARDS",
      payload: {
        env,
        userPublicKey: walletPublicKey,
        userStakingStatePubkey,
        userStablecoinRewardsAta: stablecoinAta,
      },
    });

    notify({
      message: "Harvested",
      description: <div>Harvest button is clicked</div>,
      type: "success",
    });
  };


  const onClickStake = () => {
    if (!walletPublicKey) {
      return false;
    }

    if (!inputStake) {
      notify({
        message: "Please select a higher number",
        description: <div>Amount selected is 0.</div>,
        type: "warning",
      });
      return false;
    }

    dispatch({
      type: "hubble/stake/STAKE_HBB",
      payload: {
        env,
        walletPublicKey,
        hbbAta,
        userStakingStatePubkey,
        depositHbbAmount: inputStake,
        stakingCounter,
      },
    });

    notify({
      message: "Staked",
      description: <div>Staking HBB</div>,
      type: "success",
    });

    return true;
  };


  const onClickUnstake = () => {
    if (!walletPublicKey) {
      return false;
    }

    if (!inputWithdrawStake) {
      notify({
        message: "Please select a higher number",
        description: <div>Amount selected is 0.</div>,
        type: "warning",
      });
      return false;
    }

    dispatch({
      type: "hubble/stake/UNSTAKE_HBB",
      payload: {
        env,
        walletPublicKey,
        userStakingStatePubkey,
        stablecoinAta,
        hbbAta,
        withdrawHbbAmount: inputWithdrawStake,
        stakingCounter,
      },
    });

    notify({
      message: "Unstaked",
      description: <div>Unstake button is clicked</div>,
      type: "success",
    });

    return true;
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
        title="Stake HBB"
        description="Stake HBB in to earn protocol revenues. Revenues come from the fees of users taking loans, on average 0.5% per loan, or from the redemption mechanism, when users redeem USDH for face value."
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
          <Col span={4} style={{ border: 0, borderStyle: "solid", marginLeft: 0, paddingLeft: 0 }}>&nbsp;</Col>
          <Col span={4}><Text strong>Total Staked</Text></Col>
          <Col span={3}><Text strong>Pool %</Text></Col>
          <Col span={4}><Text strong>Pending Gains</Text></Col>
          <Col span={4}><Text strong>APY</Text></Col>
          <Col span={4} />
        </Row>
        <hr className="staking-hr" />
        <Row
          className="font-middle item-center"
          style={{
            textAlign: "left",
            marginBottom: 20,
            paddingLeft: 0,
            paddingRight: 0,
            marginLeft: 0,
            border: 0, borderStyle: "solid"
          }}
        >
          <Col span={4} style={{ border: 0, borderStyle: "solid", marginLeft: 0, paddingLeft: 0 }}><img alt="HBB" src={HBB} width={24} height={24} /><Text style={{ marginLeft: "10px" }}>HBB</Text></Col>
          <Col span={4}><Text>${userStakingStats.hbbStaked}</Text></Col>
          <Col span={3}><Text> {userStakingStats.pctOfPool}%</Text></Col>
          <Col span={4}><Text> ${Math.round(userStakingStats.stablecoinRewards / STABLECOIN_DECIMALS * 100) / 100}</Text></Col>
          <Col span={3}><Text>13%</Text></Col>
          {!walletPublicKey ?
            <Col
              span={6}
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
            ><ConnectButton className="myButton" /></Col> : null}
          {!(walletPublicKey && userIsStaker) ? null : (
            <Col
              span={6}
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
                  onClick={onClickHarvest}
                  disabled={totalPendingUserGainsValue <= 0}
                  isLoading={loading || submitting}
                  text="Harvest"
                />
              </div>
              {providedStake <= 0 ? (
                <div style={{ marginLeft: 10 }}>
                  <SmallButton
                    onClick={setStakeModalVisible}
                    isLoading={loading || submitting}
                    text="Deposit"
                    disabled={false}
                  />
                </div>) : (
                <div
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
                  <div style={{ marginLeft: 10 }}>
                    <SmallButton
                      onClick={() => {
                        setinputWithdrawStake(0);
                        setWithdrawModalVisible(true);
                        return 0;
                      }}
                      disabled={false}
                      isLoading={loading || submitting}
                      text="-"
                    />
                  </div>
                  <div style={{ marginLeft: 10 }}>
                    <SmallButton
                      onClick={() => {
                        setinputStake(0);
                        setStakeModalVisible(true);
                        return 0;
                      }}
                      disabled={false}
                      isLoading={loading || submitting}
                      text="+"
                    />
                  </div>
                </div>
              )}
            </Col>
          )}

          {!(walletPublicKey && !userIsStaker) ? null : (
            <Col
              span={6}
              style={{
                display: "flex",
                alignContent: "right",
                alignItems: "end",
                justifyContent: "end",
                justifyItems: "right",
              }}
            >
              <SmallButton
                isLoading={loading || submitting}
                onClick={approveStaking}
                text="Approve Staking"
                disabled={!walletPublicKey}
              />
            </Col>
          )}
        </Row>

        <Row
          style={{
          }}
        >
          <div
            style={{
              flexGrow: 1,
              justifyContent: "center",
              paddingRight: 10,
              height: "auto",
            }}
          >
            <StabilityList
              topic="Borrowing Fees Rewards"
              aprs={aprs}
            />
          </div>
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              paddingLeft: 10,
            }}
          >
            <StabilityList
              topic="Redemption Fees Rewards"
              aprs={redemptionRewards}
            />
          </div>
        </Row>
      </div>
      <Modal
        title="Stake HBB"
        centered
        visible={stakeModalVisible}
        onOk={() => setStakeModalVisible(false)}
        onCancel={() => setStakeModalVisible(false)}
        className="modal-component"
        footer={[
          <Button
            key="back"
            onClick={() => (onClickStake() ? setStakeModalVisible(false) : {})}
            className="buttonstyle"
            style={{ cursor: "pointer" }}
          >
            Stake Hbb
          </Button>,
        ]}
      >
        <ModalTabSelect
          topic={`Available HBB: $${!hbbBalance ? "0" : formatNumber.format(hbbBalance)
            }`}
          value={inputStake}
          max={!hbbBalance ? 0 : hbbBalance}
          onValueChange={(amount: number) => {
            console.log("Input stake to", amount);
            setinputStake(amount);
          }}
        />
      </Modal>
      <Modal
        title="Withdraw HBB"
        centered
        visible={withdrawModalVisible}
        onOk={() => setWithdrawModalVisible(false)}
        onCancel={() => setWithdrawModalVisible(false)}
        className="modal-component"
        footer={[
          <SecondaryButton
            key="back"
            onClick={() =>
              onClickUnstake() ? setWithdrawModalVisible(false) : {}
            }
            isLoading={loading}
            text="Withdraw HBB"
            disabled={userStakingStats.hbbStaked === 0}
          />,
        ]}
      >
        <ModalTabSelect
          topic={`Deposited HBB: $${!providedStake ? "0" : formatNumber.format(providedStake)
            }`}
          value={inputWithdrawStake}
          max={!providedStake ? 0 : providedStake}
          onValueChange={(amount: number) => {
            console.log("Input withdraw stake to", amount);
            setinputWithdrawStake(amount);
          }}
        />
      </Modal>
    </div>
  );
};

export default Staking;
