import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";

import { Card, Col, Row, Typography } from "antd";
import { PublicKey } from "@solana/web3.js";
import { createSelector } from "reselect";
import useEnv from "../../hooks/useEnv";

import { SecondaryButton } from "../../components/SecondaryButton/SecondaryButton";
import "./Borrow.less";
import { BorrowForm } from "../../components/BorrowForm/BorrowForm";
import { SerumMarket } from "../../models/SerumMarket";
import "../../antd.customize.less";
import { BTC_MINT, ETH_MINT, FTT_MINT, SOL_MINT, RAY_MINT, SRM_MINT } from "../../utils/ids";
import { LAMPORTS_PER_SOL, SolanaToken, SOL_PRICE_FACTOR_DEV, STABLECOIN_DECIMALS } from "../../constants";
import { NativeAccount } from "../../models/account";
import { DepositCollateralForm, DepositTokenInterface } from "../../components/DepositCollateralForm/DepositCollateralForm";
import { formatNumber } from "../../utils/utils";
import {
  btcAtaSelector, btcBalanceSelector,
  ethAtaSelector, ethBalanceSelector,
  fttAtaSelector, fttBalanceSelector,
  getAtaLoadingSelector,
  getBalanceLoadingSelector,
  hbbAtaSelector, hbbBalanceSelector,
  rayAtaSelector, rayBalanceSelector,
  srmAtaSelector, srmBalanceSelector,
  stablecoinAtaSelector,
  stablecoinBalanceSelector
} from "../../redux/hubble/core/reducers";
import { nativeAccountLoadingSelector, nativeAccountSelector } from "../../redux/solana/reducers";
import { marketsLoadingSelector, marketsSelector } from "../../redux/serum/reducers";
import BorrowSecondBox from "../../components/BorrowSecondBox/BorrowSecondBox";
import BorrowModalPermissionPool from "../../components/BorrowModalPermissionPool/BorrowModalPermissionPool";

export interface LiquidationTokenInfo {
  symbol: SolanaToken,
  currentPrice: number,
  liquidationPrice: string | 0.001 | number | string | "Immediate liquidation",
  pctChange: string | 0.001 | number | string | "Immediate liquidation"
}

const mintAddresses: Record<SolanaToken, string> = {
  "SOL": SOL_MINT,
  "BTC": BTC_MINT,
  "ETH": ETH_MINT,
  "RAY": RAY_MINT,
  "SRM": SRM_MINT,
  "FTT": FTT_MINT,
};

const Borrow = () => {

  const dispatch = useDispatch();
  const history = useHistory();
  const { walletPublicKey, env } = useEnv();

  const stablecoinBalance = useSelector<RootStateOrAny, number | null>(stablecoinBalanceSelector);
  const ethBalance = useSelector<RootStateOrAny, number | null>(ethBalanceSelector);
  const btcBalance = useSelector<RootStateOrAny, number | null>(btcBalanceSelector);
  const srmBalance = useSelector<RootStateOrAny, number | null>(srmBalanceSelector);
  const fttBalance = useSelector<RootStateOrAny, number | null>(fttBalanceSelector);
  const rayBalance = useSelector<RootStateOrAny, number | null>(rayBalanceSelector);
  const hbbBalance = useSelector<RootStateOrAny, number | null>(hbbBalanceSelector);
  const stablecoinAta = useSelector<RootStateOrAny, PublicKey | null>(stablecoinAtaSelector);
  const ethAta = useSelector<RootStateOrAny, PublicKey | null>(ethAtaSelector);
  const btcAta = useSelector<RootStateOrAny, PublicKey | null>(btcAtaSelector);
  const srmAta = useSelector<RootStateOrAny, PublicKey | null>(srmAtaSelector);
  const fttAta = useSelector<RootStateOrAny, PublicKey | null>(fttAtaSelector);
  const rayAta = useSelector<RootStateOrAny, PublicKey | null>(rayAtaSelector);
  const hbbAta = useSelector<RootStateOrAny, PublicKey | null>(hbbAtaSelector);
  const userNativeAccount = useSelector<RootStateOrAny, NativeAccount | null>(nativeAccountSelector);

  const mintCounter = useSelector<RootStateOrAny, number>(state => state.hubbleCore.mintCounter);
  const airdropCounter = useSelector<RootStateOrAny, number>(state => state.hubbleBorrow.airdropCounter);
  const markets = useSelector<RootStateOrAny, Record<string, SerumMarket>>(marketsSelector);

  const loadingSelector = createSelector([
    (state: any): boolean => state.solana.mintAccountsLoading,
    nativeAccountLoadingSelector,
    marketsLoadingSelector,
    getAtaLoadingSelector(),
    getBalanceLoadingSelector(),
  ], (
    mintAccountsLoading,
    nativeAccountLoading,
    marketsLoading,
    atasLoading,
    balancesLoading,
  ): boolean =>
    mintAccountsLoading ||
    nativeAccountLoading ||
    marketsLoading ||
    atasLoading ||
    balancesLoading
  );

  const loading = useSelector<RootStateOrAny, boolean>(loadingSelector);
  const submitting = useSelector<RootStateOrAny, boolean>(state => state.hubbleBorrow.borrowSubmitting);

  const [depositTokens, setDepositTokens] = useState<Array<DepositTokenInterface>>([
    {
      symbol: "SOL",
      availableTokens: ["BTC", "ETH", "FTT", "SRM", "RAY"],
      max: 0.0,
      deposit: 0.0,
    },
  ]);
  const [currentDepositedValue, setCurrentDepositedValue] = useState<number>(0);
  const [borrowStablecoinAmount, setBorrowStablecoinAmount] = useState(0);
  const [liquidationPrices, setLiquidationPrices] = useState<LiquidationTokenInfo[]>([])
  const [maxBorrowableAmount, setMaxBorrowableAmount] = useState(0);
  const [collateralRatio, setCollateralRatio] = useState(0);
  const [, setRatio] = useState<number>(100); // Ratio of collateral
  const [availableTokens, setAvailableTokens] = useState<Record<SolanaToken, number>>({
    "SOL": 0.0,
    "BTC": 0.0,
    "ETH": 0.0,
    "RAY": 0.0,
    "SRM": 0.0,
    "FTT": 0.0,
  });

  useEffect(() => {
    if (!walletPublicKey) {
      return;
    }
    dispatch({
      type: "hubble/core/GET_TOKENS_ATA",
      payload: {
        publicKey: walletPublicKey,
        env,
      }
    })

    dispatch({
      type: "hubble/borrow/GET_BORROWING_MARKET_STATE",
      payload: {
        env
      },
    })

    const mintAddressValues = Object.values(mintAddresses);
    if (mintAddressValues.length > 0) {
      dispatch({
        type: 'serum/GET_MARKETS_ONCE',
        payload: {
          mintAddresses: mintAddressValues,
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    walletPublicKey,
    env,
  ]);

  useEffect(() => {
    // If/ when, addresses change then refetch the amounts

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
        hbbAta
      }
    })

    dispatch({
      type: 'solana/GET_NATIVE_ACCOUNT',
      payload: {
        publicKey: walletPublicKey,
      }
    })

    const mintAddressValues = Object.values(mintAddresses);
    if (mintAddressValues.length > 0) {
      dispatch({
        type: 'serum/GET_MARKETS_ONCE',
        payload: {
          mintAddresses: mintAddressValues,
        }
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    walletPublicKey,
    env,
    hbbAta,
    stablecoinAta,
    ethAta,
    btcAta,
    srmAta,
    fttAta,
    rayAta,
    mintCounter,
    airdropCounter
  ]);

  useEffect(() => {

    const btcBal = btcBalance === null ? 0 : btcBalance;
    const ethBal = ethBalance === null ? 0 : ethBalance;
    const fttBal = fttBalance === null ? 0 : fttBalance;
    const rayBal = rayBalance === null ? 0 : rayBalance;
    const srmBal = srmBalance === null ? 0 : srmBalance;
    const solBal = userNativeAccount == null ? 0 : userNativeAccount.lamports / LAMPORTS_PER_SOL;

    const newAvailableTokens = {
      "SOL": solBal,
      "BTC": btcBal,
      "ETH": ethBal,
      "RAY": rayBal,
      "SRM": srmBal,
      "FTT": fttBal,
    }

    setAvailableTokens(newAvailableTokens);

  }, [
    stablecoinBalance,
    hbbBalance,
    ethBalance,
    btcBalance,
    fttBalance,
    srmBalance,
    rayBalance,
    userNativeAccount,
  ]);

  useEffect(() => {
    const solPrice = markets[SOL_MINT]?.midPrice;
    const btcPrice = markets[BTC_MINT]?.midPrice;
    const ethPrice = markets[ETH_MINT]?.midPrice;
    const fttPrice = markets[FTT_MINT]?.midPrice;
    const rayPrice = markets[RAY_MINT]?.midPrice;
    const srmPrice = markets[SRM_MINT]?.midPrice;

    const getPrice = (token: SolanaToken): number => {
      switch (token) {
        case "SOL": return solPrice ? solPrice * SOL_PRICE_FACTOR_DEV : 0;
        case "BTC": return btcPrice || 0;
        case "ETH": return ethPrice || 0;
        case "FTT": return fttPrice || 0;
        case "RAY": return rayPrice || 0;
        case "SRM": return srmPrice || 0;
      }
    }

    const depositedAmount = depositTokens.reduce((acc: number, deposit) =>
      acc + deposit.deposit * getPrice(deposit.symbol),
      0);

    const _collateralRatio = depositedAmount / borrowStablecoinAmount * 100;
    const _maxBorrowableAmount = depositedAmount / 1.1;

    const liquidationInfos: LiquidationTokenInfo[] = depositTokens.map(tokenInfo => calculateliquidationPrice(
      depositedAmount,
      borrowStablecoinAmount,
      tokenInfo.symbol,
      tokenInfo.deposit,
      getPrice(tokenInfo.symbol)
    ));

    setMaxBorrowableAmount(_maxBorrowableAmount);
    setCollateralRatio(_collateralRatio);
    setCurrentDepositedValue(depositedAmount);
    setLiquidationPrices(liquidationInfos);
  }, [
    borrowStablecoinAmount,
    depositTokens,
    markets
  ]);

  const _setBorrowStablecoinAmount = (borrowAmount: number) => {
    if (borrowAmount === 0) {
      // setRatio(0);
    } else {
      const newRatio = (currentDepositedValue / borrowAmount) * 100;
      setRatio(newRatio);
    }
    setBorrowStablecoinAmount(borrowAmount)
  }

  const getAta: (ticker: SolanaToken) => PublicKey | null = useCallback((ticker: SolanaToken) => {
    switch (ticker) {
      case "BTC":
        return btcAta;
      case "ETH":
        return ethAta;
      case "SRM":
        return srmAta;
      case "FTT":
        return fttAta;
      case "RAY":
        return rayAta;
      case "SOL":
        return walletPublicKey ? new PublicKey(walletPublicKey) : null;
    }
  }, [
    walletPublicKey,
    ethAta,
    btcAta,
    srmAta,
    fttAta,
    rayAta,
  ])

  const confirm = useSelector<RootStateOrAny, boolean | null>(state => state.hubbleBorrow.confirmed);

  const [permissionpool, setPermissionPool] = useState<boolean>(false);

  useEffect(() => {
    if (!confirm) setPermissionPool(true);
  }, [confirm]);

  const confirmclicked = () => {
    dispatch({
      type: "hubble/borrow/CONFIRM",
      payload: {
        confirmed: true
      },
    });
    setPermissionPool(false);
  }

  const cancelclicked = () => {
    setPermissionPool(false);
    history.push('/404')
  }
  const [uchecked, setUchecked] = useState<boolean>(true);
  const [dchecked, setDchecked] = useState<boolean>(false);

  const onChanged = (checkedValues: boolean) => {
    setDchecked(checkedValues);
  }

  const onChangeu = (checkedValues: boolean) => {
    setUchecked(checkedValues);
  }

  const onClickApprove = () => {
    if (walletPublicKey) {
      dispatch({
        type: "hubble/borrow/CREATE_LOAN_DEPOSIT_BORROW",
        payload: {
          owner: walletPublicKey,
          env,
          collateral: depositTokens.map((depositToken) => {
            return {
              ticker: depositToken.symbol,
              mint: mintAddresses[depositToken.symbol],
              amount: depositToken.deposit,
              ata: getAta(depositToken.symbol)?.toBase58(),
            }
          }),
          borrowStablecoinAmount: borrowStablecoinAmount * STABLECOIN_DECIMALS,
        },
      });
    }
  };

  return (
    <div style={{
      width: "100%",
      display: "flex",
      justifyContent: "center"
    }}>
      <div
        style={{
          minWidth: 1024,
          maxWidth: 1024,
          width: "100%",
          display: "flex",
          marginTop: "50px",
          justifyContent: "space-between"
        }}
      >

        <Col className="first-borrow-box">
          <div>
            <Row>
              <Col span={24}>
                <Card style={{ borderColor: "rgba(05,250,255,0.15)" }}>
                  <Row className="item-center justify-center">
                    <Typography.Text style={{
                      fontSize: 20,
                      color: "#FFFFFF",
                      fontWeight: 600,
                      opacity: 1,
                      marginBottom: 9,
                    }}>Borrow USDH</Typography.Text>
                    <div
                      className="item-center justify-center"
                      style={{
                        width: "%100",
                        margin: 0
                      }}>
                      <BorrowForm
                        topic={`Collateral Ratio ${formatNumber.format(collateralRatio)}%`}
                        borrowStablecoinAmount={borrowStablecoinAmount}
                        setBorrowStablecoinAmount={_setBorrowStablecoinAmount}
                        max={maxBorrowableAmount} />
                    </div>
                    <Typography.Text style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      marginBottom: 5,
                      marginTop: 15,
                    }}>Select Collateral</Typography.Text>
                    <Col span={24}>
                      <DepositCollateralForm
                        showEmpty
                        label="Available"
                        onValuesChange={(deposits) => {
                          setDepositTokens(deposits)
                        }}
                        collateralTokens={depositTokens}
                        tokenBalances={availableTokens}
                      />
                    </Col>
                  </Row>
                </Card>
                <div style={{ marginTop: "30px" }}>
                  <SecondaryButton
                    text="Borrow"
                    onClick={onClickApprove}
                    isLoading={loading || submitting}
                    disabled={currentDepositedValue === 0} />
                </div>
              </Col>
            </Row>
          </div>
        </Col>
        <Col className="between-borrow-box" />
        <BorrowSecondBox
          borrowStablecoinAmount={borrowStablecoinAmount}
          currentDepositedValue={currentDepositedValue}
          collateralRatio={collateralRatio}
          liquidationPrices={liquidationPrices}
        />
      </div >
      <BorrowModalPermissionPool
        permissionpool={permissionpool}
        cancelclicked={cancelclicked}
        confirmclicked={confirmclicked}
        onChanged={onChanged}
        onChangeu={onChangeu}
        uchecked={uchecked}
        dchecked={dchecked}
      />
    </div >
  );
};

function calculateliquidationPrice(
  depositValue: number,
  borrowingAmount: number,
  token: SolanaToken,
  tokenAmount: number,
  tokenPrice: number,
): LiquidationTokenInfo {
  const liquidationInfo: LiquidationTokenInfo = {
    symbol: token,
    currentPrice: tokenPrice,
    pctChange: 0,
    liquidationPrice: 0
  };

  // Already too late
  if ((depositValue / borrowingAmount) < 1.1) {
    liquidationInfo.pctChange = "";
    liquidationInfo.liquidationPrice = "Immediate liquidation";
    return liquidationInfo;
  }

  const mvWithoutToken = depositValue - tokenAmount * tokenPrice;
  if ((mvWithoutToken / borrowingAmount) > 1.1) {
    liquidationInfo.pctChange = "";
    liquidationInfo.liquidationPrice = "N/A";
    return liquidationInfo;
  }

  const necessaryTokenValue = borrowingAmount * 1.1 - mvWithoutToken;
  const liquidationPrice = necessaryTokenValue / tokenAmount;
  const liquidationChange = (liquidationPrice - tokenPrice) / tokenPrice * 100;

  liquidationInfo.pctChange = ` (${formatNumber.format(liquidationChange)}%)`;
  liquidationInfo.liquidationPrice = formatNumber.format(liquidationPrice);

  return liquidationInfo
}

export default Borrow;
