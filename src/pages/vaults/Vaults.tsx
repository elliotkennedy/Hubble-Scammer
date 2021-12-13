import React, { useCallback, useEffect, useState } from "react";
import { Col, Modal, Row, Tabs, Typography } from "antd";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { PublicKey } from "@solana/web3.js";
import useEnv from "../../hooks/useEnv";
import "./Vaults.less";
import ModalTabSelect from "../../components/ModalTabSelect/ModalTabSelect";
import { ShowIcon } from "../../components/ShowIcon/ShowIcon";
import { ScrollWithMax } from "../../components/scrollwithmax/ScrollWithMax";
import { SecondaryButton } from "../../components/SecondaryButton/SecondaryButton";
import VaultTable from "../../components/VaultTable/VaultTable";
import { Account, NativeAccount } from "../../models/account";
import { UserMetadata } from "../../models/hubble/UserMetadata";
import { formatNumber, formatUSD, lamportsToColl } from "../../utils/utils";
import {
  DepositCollateralForm,
  DepositTokenInterface
} from "../../components/DepositCollateralForm/DepositCollateralForm";
import { DECIMALS_BTC, DECIMALS_ETH, DECIMALS_FTT, DECIMALS_RAY, DECIMALS_SRM, LAMPORTS_PER_SOL, SolanaToken, SOL_PRICE_FACTOR_DEV, STABLECOIN_DECIMALS } from "../../constants";
import { BTC_MINT, ETH_MINT, FTT_MINT, RAY_MINT, SOL_MINT, SRM_MINT } from "../../utils/ids";
import { SerumMarket } from "../../models/SerumMarket";
import {
  btcAtaSelector,
  btcBalanceSelector,
  ethAtaSelector,
  ethBalanceSelector,
  fttAtaSelector,
  fttBalanceSelector,
  hbbAtaSelector,
  rayAtaSelector,
  rayBalanceSelector,
  srmAtaSelector,
  srmBalanceSelector,
  stablecoinAtaSelector,
} from "../../redux/hubble/core/reducers";
import { marketsSelector } from "../../redux/serum/reducers";
import { nativeAccountSelector } from "../../redux/solana/reducers";
import VaultsModalBottomContainer from "../../components/VaultsModalBottomContainer/VaultsModalBottomContainer";
import VaultComponentContainer, { VaultContainer } from "../../components/VaultComponent/ContainerVaultComponent";
import PageTitle from "../../components/PageTitle/PageTitle";

const { TabPane } = Tabs;

type ModalMode = "BORROW" | "WITHDRAW" | "REPAY" | "DEPOSIT"
interface WithdrawModalProps {
  availableTokens: Record<SolanaToken, number>,
  withdrawingTokens: Array<DepositTokenInterface>
}

interface DepositModalProps {
  availableTokens: Record<SolanaToken, number>,
  depositingTokens: Array<DepositTokenInterface>
}

interface BorrowModalProps {
  collateralValue: number,
  borrowStablecoinAmount: number,
}

interface ModalDetails {
  title: string,
  firstLineTitle: string,
  firstLineValue: string,
  collateralRatioTitle: boolean,
  prevCollateralRatio: string | null,
  newCollateralRatio: string | null,
  buttonEnabled: boolean,
  mode: ModalMode,
  collateralValue: number
}

const mintAddresses: Record<SolanaToken, string> = {
  "SOL": SOL_MINT,
  "BTC": BTC_MINT,
  "ETH": ETH_MINT,
  "RAY": RAY_MINT,
  "SRM": SRM_MINT,
  "FTT": FTT_MINT,
};

const defaultAvailableTokens = {
  "SOL": 0.0,
  "BTC": 0.0,
  "ETH": 0.0,
  "RAY": 0.0,
  "SRM": 0.0,
  "FTT": 0.0,
};

const defaultCollateralTokens = [
  {
    symbol: "SOL",
    availableTokens: ["BTC", "ETH", "FTT", "SRM", "RAY"],
    max: 0.0,
    deposit: 0.0,
  },
] as DepositTokenInterface[];

const Vaults = () => {

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalDetails, setModalDetails] = useState<ModalDetails>({
    title: "Withdraw collateral",
    firstLineTitle: "Withdrawing",
    firstLineValue: "$123.12",
    collateralRatioTitle: true,
    prevCollateralRatio: "125%",
    newCollateralRatio: "110%",
    buttonEnabled: false,
    mode: "WITHDRAW",
    collateralValue: 0,
  });

  const [selectedTab, setSelectedTab] = useState<string>("1");

  // TODO: refactor to mention userVaults
  const [userPositions, setUserPositions] = useState([] as Array<UserMetadata>);
  const [totalBorrowedStablecoin, setTotalBorrowedStablecoin] = useState(0);
  const [totalCollateralValue, setTotalCollateralValue] = useState(0);
  const [loanRepayAmount, setLoanRepayAmount] = useState(0);

  const { env, walletPublicKey, walletConnected } = useEnv();

  const [currentlyModifingPosition, setCurrentlyModifingPosition] = useState<UserMetadata | null>(null);
  const [withdrawModalProps, setWithdrawModalProps] = useState<WithdrawModalProps>({
    availableTokens: defaultAvailableTokens,
    withdrawingTokens: defaultCollateralTokens,
  })
  const [depositModalProps, setDepositModalProps] = useState<DepositModalProps>({
    availableTokens: defaultAvailableTokens,
    depositingTokens: defaultCollateralTokens,
  })
  const [borrowModalProps, setBorrowModalProps] = useState<BorrowModalProps>({
    collateralValue: 0,
    borrowStablecoinAmount: 0,
  })

  const userVaults: Array<Account<UserMetadata>> = useSelector<RootStateOrAny, Array<Account<UserMetadata>>>(state => state.hubbleBorrow.userVaults);
  const userVaultsLoading: boolean = useSelector<RootStateOrAny, boolean>(state => state.hubbleBorrow.userVaultsLoading);
  const userVaultsLoadingError: boolean = useSelector<RootStateOrAny, boolean>(state => state.hubbleBorrow.userVaultsLoadingError);

  const markets = useSelector<RootStateOrAny, Record<string, SerumMarket>>(marketsSelector);

  const stablecoinAta = useSelector<RootStateOrAny, PublicKey | null>(stablecoinAtaSelector);
  const ethAta = useSelector<RootStateOrAny, PublicKey | null>(ethAtaSelector);
  const btcAta = useSelector<RootStateOrAny, PublicKey | null>(btcAtaSelector);
  const srmAta = useSelector<RootStateOrAny, PublicKey | null>(srmAtaSelector);
  const fttAta = useSelector<RootStateOrAny, PublicKey | null>(fttAtaSelector);
  const rayAta = useSelector<RootStateOrAny, PublicKey | null>(rayAtaSelector);
  const hbbAta = useSelector<RootStateOrAny, PublicKey | null>(hbbAtaSelector);

  const ethBalance = useSelector<RootStateOrAny, number | null>(ethBalanceSelector);
  const btcBalance = useSelector<RootStateOrAny, number | null>(btcBalanceSelector);
  const srmBalance = useSelector<RootStateOrAny, number | null>(srmBalanceSelector);
  const fttBalance = useSelector<RootStateOrAny, number | null>(fttBalanceSelector);
  const rayBalance = useSelector<RootStateOrAny, number | null>(rayBalanceSelector);
  const userNativeAccount = useSelector<RootStateOrAny, NativeAccount | null>(nativeAccountSelector);
  const [vaultContainerData, setVaultContainerData] = useState<Array<VaultContainer> | []>([])

  const vaultsInteractionsCounter = useSelector<RootStateOrAny, number>(state => state.hubbleBorrow.vaultsInteractionsCounter);

  const dispatch = useDispatch();
  const getShowIcons = (position: UserMetadata) => {
    return Object.entries(position.depositedCollateral)
      .filter(entry => entry[1] > 0)
      .map(entry => {
        switch (entry[0]) {
          case 'sol':
            return "SOLANA";
          case 'btc':
            return "BTC";
          case 'eth':
            return "ETH";
          case 'ray':
            return "RAY";
          case 'ftt':
            return "FTT";
          case 'srm':
            return "SRM";
        }
        return null;
      })
  }
  const showicon = ["BTC", "SOLANA", "USDC"];
  const buttontext = ["Repay", "Deposit", "Withdraw", "Borrow USDH", "Add Leverage"];

  useEffect(() => {
    if (walletPublicKey !== null) {
      dispatch({
        type: "hubble/borrow/GET_USER_VAULTS",
        payload: {
          env,
          userPublicKey: walletPublicKey,
        },
      })

      dispatch({
        type: "hubble/core/GET_TOKENS_ATA",
        payload: {
          publicKey: walletPublicKey,
          env,
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [env, walletPublicKey, vaultsInteractionsCounter])

  useEffect(() => {
    const mintAddressValues = Object.values(mintAddresses);
    dispatch({
      type: 'serum/GET_MARKETS',
      payload: {
        mintAddresses: mintAddressValues,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintAddresses,]);

  useEffect(() => {
    if (walletPublicKey !== null) {
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
  ]);

  useEffect(() => {
    if (userVaults !== null) {
      const _userPositions = userVaults
        .map(v => v.data)
        .filter(userPosition => userPosition.owner.toBase58() === walletPublicKey);
      let _totalBorrowedStablecoin = 0;
      let _totalCollateralValue = 0;

      _userPositions.forEach((userPosition) => {
        const collateralValue = calculateMarketValue(positionToDeposits(userPosition));
        const collateralRatio = calculateCollateralRatio(collateralValue, userPosition.borrowedStablecoin / STABLECOIN_DECIMALS);
        userPosition.collateralValue = collateralValue;
        userPosition.collateralRatio = collateralRatio;

        _totalBorrowedStablecoin += userPosition.borrowedStablecoin / STABLECOIN_DECIMALS;
        _totalCollateralValue += userPosition.collateralValue;
      });

      setTotalBorrowedStablecoin(_totalBorrowedStablecoin);
      setTotalCollateralValue(_totalCollateralValue);
      setUserPositions(_userPositions);


    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userVaults])

  useEffect(() => {
    const vaultData = [
      {
        topic: 'Borrowed',
        price: formatNumber.format(totalBorrowedStablecoin),
        limit: true
      },
      {
        topic: 'Collateral Deposit',
        price: formatNumber.format(totalCollateralValue),
        limit: false
      },
      {
        topic: 'Net APY',
        price: '10.0%',
        limit: false
      },
    ]

    setVaultContainerData(vaultData)
  }, [totalBorrowedStablecoin, totalCollateralValue])

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

  const getBalance: (ticker: SolanaToken) => number = useCallback((ticker: SolanaToken) => {
    switch (ticker) {
      case "BTC":
        return btcBalance !== null ? btcBalance : 0;
      case "ETH":
        return ethBalance !== null ? ethBalance : 0;
      case "SRM":
        return srmBalance !== null ? srmBalance : 0;
      case "FTT":
        return fttBalance !== null ? fttBalance : 0;
      case "RAY":
        return rayBalance !== null ? rayBalance : 0;
      case "SOL":
        return userNativeAccount !== null ? userNativeAccount.lamports / LAMPORTS_PER_SOL : 0;
    }
  }, [
    userNativeAccount,
    btcBalance,
    ethBalance,
    srmBalance,
    fttBalance,
    rayBalance,
  ])

  const tabSelect = (key: string) => {
    if (!currentlyModifingPosition) return false;

    setSelectedTab(key);

    switch (key) {
      case '1':
        return showRepayModal(currentlyModifingPosition)
      case '2':
        return showAddCollateralModal(currentlyModifingPosition)
      case '3':
        return showWithdrawModal(currentlyModifingPosition)
      case '4':
        return showBorrowMoreModal(currentlyModifingPosition)
    }
  }

  let buttonstyle = "";

  buttonstyle += ' margintop';

  const doSelectTab = (key: string) => {
    setSelectedTab(key);
    setModalVisible(true);
  }

  const calculateDepositStats = (depositingTokens: Array<DepositTokenInterface>) => {

    console.log("calculateDepositStats");
    if (currentlyModifingPosition !== null) {

      const debt = currentlyModifingPosition.borrowedStablecoin / STABLECOIN_DECIMALS;

      const prevMarketValue = calculateMarketValue(positionToDeposits(currentlyModifingPosition));
      const depositingMarketValue = calculateMarketValue(depositingTokens);
      const newMarketValue = prevMarketValue + depositingMarketValue;

      const prevCollateralRatio = `${Math.round(calculateCollateralRatio(
        prevMarketValue,
        debt) * 10000) / 100}%`;
      const newCollateralRatio = calculateCollateralRatio(
        newMarketValue,
        debt);

      const newCollateralRatioFormatted = `${Math.round(newCollateralRatio * 10000) / 100}%`;
      console.log("calculateWithdrawStats", newCollateralRatio, depositingMarketValue);

      setModalDetails({
        ...modalDetails,
        title: "Depositing collateral",
        firstLineTitle: "Depositing",
        firstLineValue: `${formatUSD.format(depositingMarketValue)}`,
        collateralRatioTitle: true,
        prevCollateralRatio,
        newCollateralRatio: newCollateralRatioFormatted,
        buttonEnabled: newCollateralRatio > 1.1 && depositingMarketValue >= 1
      });
    }
  }

  const calculateWithdrawStats = (withdrawingTokens: Array<DepositTokenInterface>) => {

    console.log("calculateWithdrawStats");
    if (currentlyModifingPosition !== null) {

      const debt = currentlyModifingPosition.borrowedStablecoin / STABLECOIN_DECIMALS;

      const prevMarketValue = calculateMarketValue(positionToDeposits(currentlyModifingPosition));
      const withdrawingMarketValue = calculateMarketValue(withdrawingTokens);
      const newMarketValue = prevMarketValue - withdrawingMarketValue;

      const prevCollateralRatio = debt > 0 ? `${Math.round(calculateCollateralRatio(prevMarketValue,
        debt) * 10000) / 100}%` : `${calculateCollateralRatio(prevMarketValue, debt) * 10000 / 100}%`
      const newCollateralRatio = calculateCollateralRatio(
        newMarketValue,
        debt);

      const newCollateralRatioFormatted = `${Math.round(newCollateralRatio * 10000) / 100}%`;
      console.log("calculateWithdrawStats", newCollateralRatio, withdrawingMarketValue);

      setModalDetails({
        ...modalDetails,
        title: "Withdrawing collateral",
        firstLineTitle: "Withdrawing",
        firstLineValue: `${formatUSD.format(withdrawingMarketValue)}`,
        collateralRatioTitle: true,
        prevCollateralRatio,
        newCollateralRatio: newCollateralRatioFormatted,
        buttonEnabled: newCollateralRatio > 1.1 && withdrawingMarketValue >= 1
      });
    }
  }

  const calculateBorrowStats = (borrowStablecoinAmount: number,) => {

    console.log("calculateBorrowStats");
    if (currentlyModifingPosition !== null) {

      const prevBorrowStablecoinAmount = currentlyModifingPosition.borrowedStablecoin / STABLECOIN_DECIMALS;
      const marketValue = calculateMarketValue(positionToDeposits(currentlyModifingPosition));

      const prevCollateralRatio = calculateCollateralRatio(
        marketValue,
        prevBorrowStablecoinAmount);
      const newCollateralRatio = calculateCollateralRatio(
        marketValue,
        prevBorrowStablecoinAmount + borrowStablecoinAmount);

      const prevCollateralRatioFormatted = `${Math.round(prevCollateralRatio * 10000) / 100}%`;
      const newCollateralRatioFormatted = `${Math.round(newCollateralRatio * 10000) / 100}%`;
      console.log("calculateBorrowStats", newCollateralRatio);

      setModalDetails({
        ...modalDetails,
        title: "Borrow USDH",
        firstLineTitle: "Borrowed",
        firstLineValue: `${formatUSD.format(prevBorrowStablecoinAmount)}`,
        collateralRatioTitle: true,
        prevCollateralRatio: prevCollateralRatioFormatted,
        newCollateralRatio: newCollateralRatioFormatted,
        buttonEnabled: newCollateralRatio >= 1.1
      });
    }
  }

  const calculateRepayStats = (amount: number) => {
    if (currentlyModifingPosition !== null) {
      const prevBorrowStablecoinAmount = currentlyModifingPosition.borrowedStablecoin / STABLECOIN_DECIMALS;
      const marketValue = calculateMarketValue(positionToDeposits(currentlyModifingPosition));

      const newDebtAmount = Math.max(0, prevBorrowStablecoinAmount - amount);
      const prevCollateralRatio = calculateCollateralRatio(
        marketValue,
        prevBorrowStablecoinAmount);
      const newCollateralRatio = calculateCollateralRatio(
        marketValue,
        newDebtAmount);

      const prevCollateralRatioFormatted = `${Math.round(prevCollateralRatio * 10000) / 100}%`;
      const newCollateralRatioFormatted = `${Math.round(newCollateralRatio * 10000) / 100}%`;
      console.log("calculateRepayStats", newCollateralRatio);

      setModalDetails({
        ...modalDetails,
        title: "Repay USDH",
        firstLineTitle: "New debt amount",
        firstLineValue: `${formatUSD.format(newDebtAmount)}`,
        collateralRatioTitle: true,
        prevCollateralRatio: prevCollateralRatioFormatted,
        newCollateralRatio: newCollateralRatioFormatted,
        buttonEnabled: newCollateralRatio >= 1.1,
        collateralValue: marketValue,
      });
    }
  }

  const calculateMarketValue = (deposits: Array<DepositTokenInterface>): number => {
    return deposits.reduce((acc, depositTokenInterfce) => {
      return acc + depositTokenInterfce.deposit *
        getPrice(depositTokenInterfce.symbol);
    }, 0);
  }

  const getPrice = useCallback((token: SolanaToken): number => {
    const solPrice = markets[SOL_MINT]?.midPrice;
    const btcPrice = markets[BTC_MINT]?.midPrice;
    const ethPrice = markets[ETH_MINT]?.midPrice;
    const fttPrice = markets[FTT_MINT]?.midPrice;
    const rayPrice = markets[RAY_MINT]?.midPrice;
    const srmPrice = markets[SRM_MINT]?.midPrice;

    switch (token) {
      case "SOL": return solPrice ? solPrice * SOL_PRICE_FACTOR_DEV : 0;
      case "BTC": return btcPrice || 0;
      case "ETH": return ethPrice || 0;
      case "FTT": return fttPrice || 0;
      case "RAY": return rayPrice || 0;
      case "SRM": return srmPrice || 0;
    }
  }, [markets])

  const calculateCollateralRatio = (
    marketValue: number,
    debt: number
  ): number => {
    return debt ? marketValue / debt : Infinity;
  }

  const positionToDeposits = (position: UserMetadata): Array<DepositTokenInterface> => {
    return Object
      .entries(position.depositedCollateral)
      .map(([token, amount]) => {
        const symbol = token.toUpperCase() as SolanaToken;
        let factor = LAMPORTS_PER_SOL;

        switch (symbol) {
          case "SOL": { factor = LAMPORTS_PER_SOL; break; }
          case "ETH": { factor = DECIMALS_ETH; break; }
          case "BTC": { factor = DECIMALS_BTC; break; }
          case "SRM": { factor = DECIMALS_SRM; break; }
          case "RAY": { factor = DECIMALS_RAY; break; }
          case "FTT": { factor = DECIMALS_FTT; break; }
        }
        return {
          symbol,
          availableTokens: [],
          max: 0,
          deposit: amount / factor
        }
      });
  }

  const showAddCollateralModal = (position: UserMetadata) => {
    setCurrentlyModifingPosition(position);

    const debt = position.borrowedStablecoin / STABLECOIN_DECIMALS;

    const collateralRatio = `${Math.round(calculateCollateralRatio(
      calculateMarketValue(positionToDeposits(position)),
      debt) * 10000) / 100}%`;

    setModalDetails({
      ...modalDetails,
      title: "Depositing collateral",
      firstLineTitle: "Depositing",
      firstLineValue: "$0.0",
      collateralRatioTitle: true,
      prevCollateralRatio: collateralRatio,
      newCollateralRatio: collateralRatio,
      buttonEnabled: false,
      mode: "DEPOSIT"
    });
    console.log("Adding collateral for ", JSON.stringify(position));

    const availableTokens = {
      "SOL": getBalance("SOL"),
      "BTC": getBalance("BTC"),
      "ETH": getBalance("ETH"),
      "RAY": getBalance("RAY"),
      "SRM": getBalance("SRM"),
      "FTT": getBalance("FTT"),
    };

    const _depositModalProps = {
      availableTokens,
      depositingTokens: depositModalProps.depositingTokens,
    }
    console.log("Deposit props:", _depositModalProps);

    setDepositModalProps(_depositModalProps);
    doSelectTab("2");
  };

  const showWithdrawModal = (position: UserMetadata) => {
    setCurrentlyModifingPosition(position);
    const debt = position.borrowedStablecoin / STABLECOIN_DECIMALS;

    const collateralRatio = `${Math.round(calculateCollateralRatio(
      calculateMarketValue(positionToDeposits(position)),
      debt) * 10000) / 100}%`;

    setModalDetails({
      ...modalDetails,
      title: "Withdrawing collateral",
      firstLineTitle: "Withdrawing",
      firstLineValue: "$0.0",
      collateralRatioTitle: true,
      prevCollateralRatio: collateralRatio,
      newCollateralRatio: collateralRatio,
      buttonEnabled: false,
      mode: "WITHDRAW"
    });

    const availableTokens = {
      "SOL": lamportsToColl(position.depositedCollateral.sol, "SOL"),
      "BTC": lamportsToColl(position.depositedCollateral.btc, "BTC"),
      "ETH": lamportsToColl(position.depositedCollateral.eth, "ETH"),
      "RAY": lamportsToColl(position.depositedCollateral.ray, "RAY"),
      "SRM": lamportsToColl(position.depositedCollateral.srm, "SRM"),
      "FTT": lamportsToColl(position.depositedCollateral.ftt, "FTT"),
    };

    const withdrawalProps = {
      availableTokens,
      withdrawingTokens: Object
        .entries(position.depositedCollateral)
        .map(([token]) => {
          const symbol = token.toUpperCase() as SolanaToken;
          return {
            symbol,
            availableTokens: [],
            max: availableTokens[symbol],
            deposit: 0
          }
        })
        .filter(depositTokenInterface => depositTokenInterface.max > 0)
    };

    setWithdrawModalProps(withdrawalProps);
    doSelectTab("3");
  };
  const showBorrowMoreModal = (position: UserMetadata) => {
    setCurrentlyModifingPosition(position);
    const debt = position.borrowedStablecoin / STABLECOIN_DECIMALS;

    const collateralRatio = `${Math.round(calculateCollateralRatio(
      calculateMarketValue(positionToDeposits(position)),
      debt) * 10000) / 100}%`;

    setModalDetails({
      ...modalDetails,
      title: "Borrow USDH",
      firstLineTitle: "Borrowed",
      firstLineValue: `${formatUSD.format(debt)}`,
      collateralRatioTitle: true,
      prevCollateralRatio: collateralRatio,
      newCollateralRatio: collateralRatio,
      buttonEnabled: false,
      mode: "BORROW"
    });
    console.log("Borrowing for ", JSON.stringify(position));
    setBorrowModalProps({
      collateralValue: calculateMarketValue(positionToDeposits(position)),
      borrowStablecoinAmount: 0,
    })
    doSelectTab("4");
  };
  const showRepayModal = (position: UserMetadata) => {
    console.log("Repaying for ", JSON.stringify(position));
    setCurrentlyModifingPosition(position);

    const debt = position.borrowedStablecoin / STABLECOIN_DECIMALS;
    const marketValue = calculateMarketValue(positionToDeposits(position));
    const collateralRatio = `${Math.round(calculateCollateralRatio(
      marketValue,
      debt) * 10000) / 100}%`;

    setModalDetails({
      ...modalDetails,
      title: "Repay USDH",
      firstLineTitle: "New debt amount",
      firstLineValue: `${formatUSD.format(debt)}`,
      collateralRatioTitle: true,
      prevCollateralRatio: collateralRatio,
      newCollateralRatio: collateralRatio,
      buttonEnabled: false,
      mode: "REPAY",
      collateralValue: marketValue
    });

    doSelectTab("1");
  };

  const onClickRepayLoan = () => {
    if (!walletPublicKey) {
      return;
    }

    dispatch({
      type: "hubble/borrow/REPAY_LOAN",
      payload: {
        amount: loanRepayAmount * STABLECOIN_DECIMALS,
        userPublicKey: walletPublicKey,
        env,
        userMetadata: currentlyModifingPosition?.metadataPk,
        stablecoinAta,
        vaultsInteractionsCounter
      }
    })
  }

  const onClickWithdrawCollateral = () => {
    if (walletPublicKey && currentlyModifingPosition) {
      dispatch({
        type: "hubble/borrow/WITHDRAW_COLLATERAL",
        payload: {
          owner: walletPublicKey,
          env,
          userMetadata: currentlyModifingPosition.metadataPk,
          collateral: withdrawModalProps.withdrawingTokens
            .filter(depositToken => depositToken.deposit !== 0)
            .map((depositToken) => {
              return {
                ticker: depositToken.symbol,
                amount: depositToken.deposit,
                ata: getAta(depositToken.symbol)?.toBase58(),
              }
            }),
          vaultsInteractionsCounter
        },
      });
    }
  };

  const onClickDepositCollateral = () => {
    if (walletPublicKey && currentlyModifingPosition) {
      dispatch({
        type: "hubble/borrow/DEPOSIT_COLLATERAL",
        payload: {
          owner: walletPublicKey,
          env,
          userMetadata: currentlyModifingPosition.metadataPk,
          collateral: depositModalProps.depositingTokens
            .filter(depositToken => depositToken.deposit !== 0)
            .map((depositToken) => {
              return {
                ticker: depositToken.symbol,
                amount: depositToken.deposit,
                ata: getAta(depositToken.symbol)?.toBase58(),
                mint: mintAddresses[depositToken.symbol],
              }
            }),
          vaultsInteractionsCounter
        },
      });
    }
  };

  const onClickBorrow = () => {
    if (walletPublicKey && currentlyModifingPosition && stablecoinAta && borrowModalProps.borrowStablecoinAmount > 0) {
      dispatch({
        type: "hubble/borrow/BORROW_STABLECOIN",
        payload: {
          owner: walletPublicKey,
          env,
          userMetadata: currentlyModifingPosition.metadataPk.toString(),
          borrowStablecoinAmount: borrowModalProps.borrowStablecoinAmount * STABLECOIN_DECIMALS,
          vaultsInteractionsCounter,
          stablecoinAta: stablecoinAta?.toBase58(),
        },
      });
    }
  };

  return (
    <div style={{
      flexGrow: 1,
      width: '100%',
      marginTop: 50,
      textAlign: "center"
    }}>
      <div>
        <PageTitle
          title="Loans"
          description="Take loans backed by your entire PORTFOLIO, up to a 110% collateral ratio. Your collateral earns yield and repays your debt. Top up your collateral, borrow more and diversify your portfolio to protect against market drops."
        />
        <VaultComponentContainer vaultsData={vaultContainerData} />
        <div style={{ marginTop: "60px" }}>
          <VaultTable
            walletConnected={walletConnected}
            vaults={userPositions}
            vaultsLoading={userVaultsLoading}
            vaultsLoadingError={userVaultsLoadingError}
            addCollateral={showAddCollateralModal}
            withdrawCollateral={showWithdrawModal}
            addLeverage={() => { }}
            borrowMore={showBorrowMoreModal}
            repayStablecoin={(position: UserMetadata) => showRepayModal(position)}
            getPrice={getPrice}
          />
        </div>

        <Modal
          title={modalDetails.title}
          centered
          visible={modalVisible}
          onOk={() => setModalVisible(false)}
          destroyOnClose
          onCancel={() => {
            setModalVisible(false)
          }}
          className="modal-component"
          footer={[
            <div className={buttonstyle}>
              {/* <SecondaryButton onClick={() => {setModalVisible(false); repayLoan(loanRepayAmount)}} text={buttontext[Number(selectedTab) - 1]} isLoading={false} disabled={false} /> */}
              <SecondaryButton
                onClick={() => {
                  switch (modalDetails.mode) {
                    case "WITHDRAW": onClickWithdrawCollateral(); break;
                    case "DEPOSIT": onClickDepositCollateral(); break;
                    case "BORROW": onClickBorrow(); break;
                    case "REPAY": onClickRepayLoan(); break;
                    default: break;
                  }
                  setModalVisible(false);
                }}
                text={buttontext[Number(selectedTab) - 1]}
                isLoading={false}
                disabled={!modalDetails.buttonEnabled} />
            </div>
          ]}
        >
          <Tabs activeKey={selectedTab} onChange={tabSelect}>
            <TabPane tab="Repay" key="1">
              <ModalTabSelect
                topic={`Debt: ${!currentlyModifingPosition ? 0 : currentlyModifingPosition.borrowedStablecoin / STABLECOIN_DECIMALS}`}
                value={loanRepayAmount}
                max={!currentlyModifingPosition?.borrowedStablecoin ? 0 : currentlyModifingPosition?.borrowedStablecoin / STABLECOIN_DECIMALS}
                onValueChange={(amount: number) => {
                  console.log("Loan repay amount is", amount);
                  setLoanRepayAmount(amount);
                  calculateRepayStats(amount);
                }}
              />
              <ShowIcon loans={currentlyModifingPosition ? getShowIcons(currentlyModifingPosition) : []} value={`${formatNumber.format((modalDetails.collateralValue))}`} />
              <VaultsModalBottomContainer
                firstLineTitle={modalDetails.firstLineTitle}
                firstLineValue={modalDetails.firstLineValue}
                newCollateralRatio={modalDetails.newCollateralRatio}
                prevCollateralRatio={modalDetails.prevCollateralRatio ? modalDetails.prevCollateralRatio : ''}
              />
            </TabPane>
            <TabPane tab="Add Collateral" key="2">
              <Row className="item-center justify-center" style={{ textAlign: "center" }}>
                <Col span={24}>
                  <DepositCollateralForm
                    showEmpty={false}
                    label="Available"
                    onValuesChange={(depositingTokens) => {
                      setDepositModalProps({
                        availableTokens: depositModalProps.availableTokens,
                        depositingTokens
                      });
                      calculateDepositStats(depositingTokens);
                    }}
                    collateralTokens={depositModalProps.depositingTokens}
                    tokenBalances={depositModalProps.availableTokens}
                  />
                </Col>
              </Row>
              <VaultsModalBottomContainer
                firstLineTitle={modalDetails.firstLineTitle}
                firstLineValue={modalDetails.firstLineValue}
                newCollateralRatio={modalDetails.newCollateralRatio}
                prevCollateralRatio={modalDetails.prevCollateralRatio ? modalDetails.prevCollateralRatio : ''}
              />
            </TabPane>
            <TabPane tab="Withdraw Collateral" key="3">
              <Row className="item-center justify-center" style={{ textAlign: "center" }}>
                <DepositCollateralForm
                  showEmpty={false}
                  label="Deposited"
                  onValuesChange={(withdrawingTokens) => {
                    setWithdrawModalProps({
                      availableTokens: withdrawModalProps.availableTokens,
                      withdrawingTokens
                    });
                    calculateWithdrawStats(withdrawingTokens);
                  }}
                  collateralTokens={withdrawModalProps.withdrawingTokens}
                  tokenBalances={withdrawModalProps.availableTokens} />
              </Row>
              <VaultsModalBottomContainer
                firstLineTitle={modalDetails.firstLineTitle}
                firstLineValue={modalDetails.firstLineValue}
                newCollateralRatio={modalDetails.newCollateralRatio}
                prevCollateralRatio={modalDetails.prevCollateralRatio ? modalDetails.prevCollateralRatio : ''}
              />
            </TabPane>
            <TabPane tab="Borrow" key="4">
              <ModalTabSelect
                onValueChange={(borrowStablecoinAmount: number) => {
                  setBorrowModalProps({
                    ...borrowModalProps,
                    borrowStablecoinAmount
                  })
                  calculateBorrowStats(borrowStablecoinAmount)
                }}
                topic={`Debt: ${currentlyModifingPosition ? formatNumber.format((currentlyModifingPosition.borrowedStablecoin / STABLECOIN_DECIMALS) + borrowModalProps.borrowStablecoinAmount) : formatNumber.format(borrowModalProps.borrowStablecoinAmount)} | Max Debt: ${formatNumber.format((borrowModalProps.collateralValue / 1.1))}`}
                value={borrowModalProps.borrowStablecoinAmount / STABLECOIN_DECIMALS}
                max={currentlyModifingPosition?.borrowedStablecoin ? (borrowModalProps.collateralValue / 1.1) - currentlyModifingPosition.borrowedStablecoin / STABLECOIN_DECIMALS : 0}
              />
              <ShowIcon loans={currentlyModifingPosition ? getShowIcons(currentlyModifingPosition) : []} value={`${formatNumber.format((borrowModalProps.collateralValue))}`} />

              <VaultsModalBottomContainer
                firstLineTitle={modalDetails.firstLineTitle}
                firstLineValue={modalDetails.firstLineValue}
                newCollateralRatio={modalDetails.newCollateralRatio}
                prevCollateralRatio={modalDetails.prevCollateralRatio ? modalDetails.prevCollateralRatio : ''}
              />
            </TabPane>
            <TabPane tab="Add Leverage" key="5">
              <ScrollWithMax value={0} min={0} scrollmax={10} ratio={2} max={100} />
              <ShowIcon loans={showicon} value="12,000" />
              <div className="bottom-container">
                <div className="item-center" style={{ justifyContent: "space-between", marginTop: 10 }}>
                  <Typography.Text type="secondary">Deposit</Typography.Text>
                  <Typography.Text strong>$5,000</Typography.Text>
                </div>
                <div className="item-center" style={{ justifyContent: "space-between", marginTop: 10 }}>
                  <Typography.Text type="secondary">Collateral Ratio</Typography.Text>
                  <div>
                    <Typography.Text strong>200%</Typography.Text>
                    <Typography.Text type="secondary">(Prev. 130%)</Typography.Text>
                  </div>
                </div>
                <div className="item-center" style={{ justifyContent: "space-between", marginTop: 10 }}>
                  <Typography.Text type="secondary">Collateral Ratio</Typography.Text>
                  <div>
                    <Typography.Text strong>25%(0.5)</Typography.Text>
                  </div>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </Modal>
      </div>
    </div>
  )
}

export default Vaults;
