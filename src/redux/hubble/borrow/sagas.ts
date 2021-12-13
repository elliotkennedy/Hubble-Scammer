import {
  all,
  getContext,
  put,
  takeEvery,
  call,
  select,
} from "redux-saga/effects";
import { AnyAction } from "redux";
import { Keypair, PublicKey, TransactionSignature } from "@solana/web3.js";
import { ProgramAccount } from "@project-serum/anchor";
import { SendTxRequest } from "@project-serum/anchor/dist/provider";
import { push } from 'connected-react-router'
import { closeNotification, notify } from "../../../utils/notifications";
import actions from "./actions";
import { LABELS, SolanaToken, STABLECOIN_DECIMALS } from "../../../constants";
import { runSagasWithContext } from "../../runSagasWithContext";
import { BorrowingClient } from "../../../services/hubble/BorrowingClient";
import hubbleConfig from "../../../services/hubble/hubbleConfig";
import { StateService } from "../../../services/hubble/StateService";
import BorrowingMarketState from "../../../models/hubble/BorrowingMarketState";
import { TokenService } from "../../../services/solana/TokenService";
import { UserMetadata } from "../../../models/hubble/UserMetadata";
import StabilityPoolState from "../../../models/hubble/StabilityPoolState";
import StabilityProviderState from "../../../models/hubble/StabilityProviderState";
import { BorrowingOperations } from "../../../services/hubble/BorrowingOperations";
import { StabilityOperations } from "../../../services/hubble/StabilityOperations";
import StabilityVaults from "../../../models/hubble/StabilityVaults";
import { collToLamports, getAdminKeypair, lamportsToColl, } from "../../../utils/utils";
import { UserVault } from "../../../models/hubble/UserVault";
import { CREATE_ATA } from "../core/sagas";

export function* GET_BORROWING_MARKET_STATE({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      borrowingMarketStateLoading: true,
      borrowingMarketStateLoadingError: false,
    },
  });

  const marketService: StateService = yield getContext("stateService");

  const { env }: { env: string } = payload;

  try {
    const borrowingMarketStatePubkey = new PublicKey(
      hubbleConfig[env].borrowing.accounts.borrowingMarketState
    );
    const stablecoinMintPubkey = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stablecoinMint
    );

    const borrowingMarketState: BorrowingMarketState = yield call(
      marketService.getMarket,
      borrowingMarketStatePubkey
    );

    const stablecoinMintAuthorityPubkey =
      borrowingMarketState.stablecoinMintAuthority;

    const hbbMintAuthorityPubkey = borrowingMarketState.hbbMintAuthority;

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        borrowingMarketState,
        borrowingMarketStatePubkey,
        stablecoinMintPubkey,
        stablecoinMintAuthorityPubkey,
        hbbMintAuthorityPubkey,
      },
    });
  } catch (err) {
    notify({
      message: "Failed to load borrowing market",
      description: "Unexpected error when loading the borrowing market",
      type: "error",
    });
    console.error("Failed to load borrowing market state", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        borrowingMarketStateLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      borrowingMarketStateLoading: false,
    },
  });
}

export function* AIRDROP_USDH({ payload }: AnyAction) {
  const {
    amount,
    stablecoinAta,
    borrowingMarketState,
    stablecoinMint,
    stablecoinMintAuthority,
    airdropCounter,
  }: {
    amount: number;
    stablecoinAta: PublicKey;
    borrowingMarketState: PublicKey;
    stablecoinMint: PublicKey;
    stablecoinMintAuthority: PublicKey;
    airdropCounter: number;
  } = payload;

  const vaultService: BorrowingOperations = yield getContext(
    "borrowingOperations"
  );
  try {
    const initialMarketOwner: Keypair = getAdminKeypair();
    yield call(
      vaultService.airdropUsdh,
      amount,
      initialMarketOwner,
      stablecoinAta,
      borrowingMarketState,
      stablecoinMint,
      stablecoinMintAuthority
    );
  } catch (err) {
    notify({
      message: "Failed to airdrop",
      description: "Unexpected error when airdropping usdh",
      type: "error",
    });
    console.error("Failed to airdrop usdh", err);
  }

  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      airdropCounter: airdropCounter + 1,
    },
  });
}

export function* AIRDROP_HBB({ payload }: AnyAction) {
  const {
    amount,
    hbbAta,
    borrowingMarketState,
    hbbMint,
    hbbMintAuthority,
    airdropCounter,
  }: {
    amount: number;
    hbbAta: PublicKey;
    borrowingMarketState: PublicKey;
    hbbMint: PublicKey;
    hbbMintAuthority: PublicKey;
    airdropCounter: number;
  } = payload;

  const vaultService: BorrowingOperations = yield getContext(
    "borrowingOperations"
  );
  try {
    const initialMarketOwner: Keypair = getAdminKeypair();
    yield call(
      vaultService.airdropHbb,
      amount,
      hbbAta,
      initialMarketOwner,
      borrowingMarketState,
      hbbMint,
      hbbMintAuthority
    );
  } catch (err) {
    notify({
      message: "Failed to airdrop",
      description: "Unexpected error when airdropping hbb",
      type: "error",
    });
    console.error("Failed to airdrop hbb", err);
  }

  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      airdropCounter: airdropCounter + 1,
    },
  });
}

export function* GET_USER_VAULTS({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      userVaultsLoading: true,
      userVaultsLoadingError: false,
    },
  });

  const { userPublicKey }: { userPublicKey: string } = payload;

  const stateService: StateService = yield getContext("stateService");

  try {
    const userVaults: Array<UserVault> = yield call(
      stateService.getUserVaults,
      userPublicKey
    );
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        userVaults,
      },
    });
  } catch (err) {
    notify({
      message: "Failed to load vaults",
      description: "Unexpected error when loading your vaults",
      type: "error",
    });
    console.error("Failed to load user vaults", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        userVaultsLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      userVaultsLoading: false,
    },
  });
}

export function* CREATE_LOAN_DEPOSIT_BORROW({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      borrowSubmitting: true,
      borrowError: false,
    },
  });

  const tokenService: TokenService = yield getContext("tokenService");
  const borrowingOperations: BorrowingOperations = yield getContext(
    "borrowingOperations"
  );
  try {
    const {
      env,
      owner,
      collateral,
      borrowStablecoinAmount,
    }: {
      env: string;
      owner: string;
      collateral: Array<{
        ticker: SolanaToken;
        mint: string;
        amount: number;
        ata: string;
      }>;
      borrowStablecoinAmount: number;
    } = payload;
    const ownerPublicKey = new PublicKey(owner);
    const stablecoinMint = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stablecoinMint
    );

    const associatedTokenAccount: {
      ata: PublicKey;
      createAtaTx: SendTxRequest | null;
    } = yield call(
      tokenService.findAtaWithCreateTransactionIfNotExists,
      ownerPublicKey,
      stablecoinMint
    );

    let dependentTxs = [] as Array<SendTxRequest>;
    if (associatedTokenAccount.createAtaTx !== null) {
      dependentTxs = [associatedTokenAccount.createAtaTx];
    }

    notify({
      message: "Creating Loan",
      description:
        "Approve all transactions in your browser wallet popup to create your new loan",
      type: "info",
      key: "borrow",
      duration: 0,
    });

    const collateralValues: Array<{
      mint: PublicKey;
      ticker: SolanaToken;
      amount: number;
      poolAccount: PublicKey;
      ata: PublicKey;
    }> = collateral.map((collateralItem) => {
      return {
        mint: new PublicKey(collateralItem.mint),
        ticker: collateralItem.ticker,
        amount: collToLamports(collateralItem.amount, collateralItem.ticker),
        poolAccount: new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault[collateralItem.ticker]),
        ata: new PublicKey(collateralItem.ata),
      };
    });

    const txns: TransactionSignature[] = yield call(
      borrowingOperations.newLoan,
      ownerPublicKey,
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingMarketState),
      new PublicKey(hubbleConfig[env].borrowing.accounts.stakingPoolState),
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingVaults),
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingFeesAccount),
      associatedTokenAccount.ata,
      stablecoinMint,
      new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinMintAuthority),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSolProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSolPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythEthProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythEthPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythBtcProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythBtcPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSrmProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSrmPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythRayProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythRayPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythFttProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythFttPriceInfo),
      collateralValues,
      borrowStablecoinAmount,
      dependentTxs
    );

    console.log("Borrow transactions", txns);

    closeNotification("borrow");
    yield put(push('/dashboard'))
    notify({
      message: "Loan Created",
      description: "Loan successfully created",
      type: "success",
    });
  } catch (err) {
    notify({
      message: LABELS.CREATE_LOAN_FAILED_MESSAGE,
      description: LABELS.CREATE_LOAN_FAILED_DESCRIPTION,
      type: "error",
    });
    console.error("Failed to create loan", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        borrowError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      borrowSubmitting: false,
    },
  });
}

export function* REPAY_LOAN({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      borrowSubmitting: true,
      borrowError: false
    },
  });

  const {
    amount,
    userPublicKey,
    env,
    userMetadata,
    stablecoinAta,
    vaultsInteractionsCounter
  }: {
    amount: number;
    userPublicKey: string;
    env: string;
    userMetadata: PublicKey;
    stablecoinAta: PublicKey;
    vaultsInteractionsCounter: number
  } = payload;

  const borrowingOperations: BorrowingOperations = yield getContext(
    "borrowingOperations"
  );

  try {
    notify({
      message: "Repaying loan",
      description: `Repaying ${amount / STABLECOIN_DECIMALS} USDH`,
      type: "info",
    });

    const borrowingMarketStatePubkey = new PublicKey(
      hubbleConfig[env].borrowing.accounts.borrowingMarketState
    );

    const borrowingVaults = new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingVaults);
    const stablecoinMint = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stablecoinMint
    );
    const burningVault = new PublicKey(
      hubbleConfig[env].borrowing.accounts.burningVault
    );
    const stablecoinMintAuthority = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stablecoinMintAuthority
    );
    const burningVaultAuthority = new PublicKey(
      hubbleConfig[env].borrowing.accounts.burningVaultAuthority
    );


    yield call(
      borrowingOperations.repayLoan,
      new PublicKey(userPublicKey),
      borrowingMarketStatePubkey,
      borrowingVaults,
      userMetadata,
      stablecoinMint,
      stablecoinAta,
      burningVault,
      stablecoinMintAuthority,
      burningVaultAuthority,
      amount
    );

    notify({
      message: "Repayed loan",
      description: `Repayed ${amount / STABLECOIN_DECIMALS} USDH`,
      type: "success",
    });
  } catch (err) {
    notify({
      message: LABELS.REPAY_LOAN_FAILED_MESSAGE,
      description: LABELS.REPAY_LOAN_FAILED_DESCRIPTION,
      type: "error",
    });
    console.error("Failed to repay loan", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        borrowError: true
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      borrowSubmitting: false,
      vaultsInteractionsCounter: vaultsInteractionsCounter + 1
    },
  })
}

export function* WITHDRAW_COLLATERAL({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      vaultsError: false,
    },
  });

  const borrowingOperations: BorrowingOperations = yield getContext(
    "borrowingOperations"
  );

  const {
    env,
    owner,
    collateral,
    userMetadata,
    vaultsInteractionsCounter
  }: {
    env: string;
    owner: string;
    userMetadata: PublicKey,
    vaultsInteractionsCounter: number,
    collateral: Array<{
      ticker: SolanaToken;
      amount: number;
      ata: string;
    }>;
  } = payload;

  try {

    const ownerPublicKey = new PublicKey(owner);
    notify({
      message: "Withdrawing collateral",
      description: "Approve all transactions in your browser wallet popup to withdraw collateral",
      type: "info",
      key: "withdrawCollateral",
      duration: 0,
    });

    const collateralValues: Array<{
      ticker: SolanaToken;
      amount: number;
      collateralFrom: PublicKey;
      collateralTo: PublicKey;
      collateralFromAuthority: PublicKey;
    }> = collateral.map((collateralItem) => {
      return {
        ticker: collateralItem.ticker,
        amount: collToLamports(collateralItem.amount, collateralItem.ticker), // TODO - not all lamports!
        collateralFrom: new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault[collateralItem.ticker]),
        collateralFromAuthority: new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVaultsAuthority),
        collateralTo: new PublicKey(collateralItem.ata)
      }
    });

    const txns: TransactionSignature[] = yield call(
      borrowingOperations.withdrawCollateral,
      ownerPublicKey,
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingMarketState),
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingVaults),
      userMetadata,
      collateralValues,
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSolProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSolPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythEthProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythEthPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythBtcProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythBtcPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSrmProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSrmPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythRayProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythRayPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythFttProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythFttPriceInfo),
    );

    console.log("Withdraw collateral transactions", txns);

    closeNotification("withdrawCollateral");
    notify({
      message: "Collateral withdrew",
      description: "Collateral successfully withdrew",
      type: "success",
    });

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        vaultsError: false,
      },
    });

  } catch (err) {
    notify({
      message: LABELS.WITHDRAW_COLLATERAL_FAILED_MESSAGE,
      description: LABELS.WITHDRAW_COLLATERAL_FAILED_DESCRIPTION,
      type: "error",
    });
    console.error("Failed to withdraw collateral", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        vaultsError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      vaultsInteractionsCounter: vaultsInteractionsCounter + 1
    },
  });
}

export function* DEPOSIT_COLLATERAL({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      vaultsError: false,
    },
  });

  const borrowingOperations: BorrowingOperations = yield getContext(
    "borrowingOperations"
  );

  const {
    env,
    owner,
    collateral,
    userMetadata,
    vaultsInteractionsCounter
  }: {
    env: string;
    owner: string;
    userMetadata: PublicKey,
    vaultsInteractionsCounter: number,
    collateral: Array<{
      ticker: SolanaToken;
      amount: number;
      ata: string;
      mint: string;
    }>;
  } = payload;

  try {

    const ownerPublicKey = new PublicKey(owner);
    notify({
      message: "Depositing collateral",
      description: "Approve all transactions in your browser wallet popup to deposit collateral",
      type: "info",
      key: "depositCollateral",
      duration: 0,
    });

    const collateralValues: Array<{
      ticker: SolanaToken;
      amount: number;
      collateralFrom: PublicKey;
      collateralTo: PublicKey;
      mint: PublicKey;
    }> = collateral.map((collateralItem) => {
      return {
        ticker: collateralItem.ticker,
        amount: collToLamports(collateralItem.amount, collateralItem.ticker), // TODO - not all lamports!
        collateralFrom: new PublicKey(collateralItem.ata),
        collateralTo: new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault[collateralItem.ticker]),
        mint: new PublicKey(collateralItem.mint),
      }
    });

    const txns: TransactionSignature[] = yield call(
      borrowingOperations.depositCollateral,
      ownerPublicKey,
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingMarketState),
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingVaults),
      userMetadata,
      collateralValues,
    );

    console.log("Deposit collateral transactions", txns);

    closeNotification("depositCollateral");
    notify({
      message: "Collateral deposited",
      description: "Collateral successfully deposited",
      type: "success",
    });

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        vaultsError: false,
      },
    });

  } catch (err) {
    notify({
      message: LABELS.DEPOSIT_COLLATERAL_FAILED_MESSAGE,
      description: LABELS.DEPOSIT_COLLATERAL_FAILED_DESCRIPTION,
      type: "error",
    });
    console.error("Failed to deposit collateral", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        vaultsError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      vaultsInteractionsCounter: vaultsInteractionsCounter + 1
    },
  });
}

export function* BORROW_STABLECOIN({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      vaultsError: false,
    },
  });

  const borrowingOperations: BorrowingOperations = yield getContext(
    "borrowingOperations"
  );

  const {
    env,
    owner,
    userMetadata,
    stablecoinAta,
    borrowStablecoinAmount,
    vaultsInteractionsCounter
  }: {
    env: string;
    owner: string;
    userMetadata: string,
    stablecoinAta: string,
    vaultsInteractionsCounter: number,
    borrowStablecoinAmount: number;
  } = payload;

  try {

    notify({
      message: "Borrowing USDH",
      description: `Borrowing ${borrowStablecoinAmount / STABLECOIN_DECIMALS} USDH`,
      type: "info",
      key: "borrowStablecoin",
      duration: 0,
    });

    const txns: TransactionSignature[] = yield call(
      borrowingOperations.borrowStablecoin,
      new PublicKey(owner),
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingMarketState),
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingVaults),
      new PublicKey(hubbleConfig[env].borrowing.accounts.stakingPoolState),
      new PublicKey(userMetadata),
      new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingFeesAccount),
      new PublicKey(stablecoinAta),
      new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinMint),
      new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinMintAuthority),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSolProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSolPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythEthProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythEthPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythBtcProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythBtcPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSrmProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythSrmPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythRayProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythRayPriceInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythFttProductInfo),
      new PublicKey(hubbleConfig[env].borrowing.accounts.pythFttPriceInfo),
      borrowStablecoinAmount,
    );

    console.log("Borrow stablecoin transactions", txns);

    closeNotification("borrowStablecoin");
    notify({
      message: "Borrowed USDH",
      description: `Borrowed ${borrowStablecoinAmount / STABLECOIN_DECIMALS} USDH`,
      type: "success",
    });

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        vaultsError: false,
      },
    });

  } catch (err) {
    notify({
      message: LABELS.BORROW_STABLECOIN_FAILED_MESSAGE,
      description: LABELS.BORROW_STABLECOIN_FAILED_DESCRIPTION,
      type: "error",
    });
    console.error("Failed to borrow stablecoin", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        vaultsError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      vaultsInteractionsCounter: vaultsInteractionsCounter + 1
    },
  });
}

export function* APPROVE_STABILITY({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: true,
      stabilityProviderStateLoadingError: false,
    },
  });

  const {
    env,
    userPublicKey,
    stabilityPoolState,
    hbbAta,
    stablecoinAta,
    stabilityCounter,
  }: {
    env: string,
    userPublicKey: PublicKey;
    stabilityPoolState: PublicKey;
    hbbAta: PublicKey;
    stablecoinAta: PublicKey;
    stabilityCounter: number;
  } = payload;

  const stabilityOperations: StabilityOperations = yield getContext(
    "stabilityOperations"
  );
  try {
    notify({
      message: "Approving provide stability",
      description:
        "Approve the transaction in your browser wallet popup to approve stability",
      type: "info",
      key: "approveStability",
      duration: 0,
    });

    if (!stablecoinAta) {
      const tokenData = {
        token: "USDH",
        mint: new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinMint),
      }

      yield call((CREATE_ATA as any), {
        payload: {
          owner: userPublicKey,
          env,
          mint: tokenData.mint,
          token: tokenData.token,
        }
      });
    }

    if (!hbbAta) {
      const tokenData = {
        token: "HBB",
        mint: new PublicKey(hubbleConfig[env].borrowing.accounts.mint.HBB),
      }

      yield call((CREATE_ATA as any), {
        payload: {
          owner: userPublicKey,
          env,
          mint: tokenData.mint,
          token: tokenData.token,
        }
      });
    }

    const stabilityProviderStatePubkey: PublicKey = yield call(
      stabilityOperations.approveStability,
      userPublicKey,
      stabilityPoolState
    );
    closeNotification("approveStability");
    notify({
      message: "Stability Approved",
      description: "Approved stability successfully",
      type: "success",
    });

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderStatePubkey,
      },
    });
  } catch (err) {
    closeNotification("approveStability");
    notify({
      message: "Approving provide stability failed",
      description: "Please check your have enough SOL in your wallet.",
      type: "error",
    });
    console.error("Failed to create vault", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderStateLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: false,
      stabilityCounter: stabilityCounter + 1,
    },
  });
}

export function* GET_STABILITY_POOL_STATE({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityPoolStateLoading: true,
      stabilityPoolStateLoadingError: false,
    },
  });

  const marketService: StateService = yield getContext("stateService");

  const { env }: { env: string } = payload;

  try {
    const stabilityPoolStatePubkey = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stabilityPoolState
    );
    const stabilityVaultsPubkey = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stabilityVaults
    );
    const epochToScaleToSumPubkey = new PublicKey(
      hubbleConfig[env].borrowing.accounts.epochToScaleToSum
    );

    const stabilityPoolState: StabilityPoolState = yield call(
      marketService.getStabilityPoolState,
      stabilityPoolStatePubkey
    );
    const stabilityVaults: StabilityVaults = yield call(
      marketService.getStabilityVaults,
      stabilityVaultsPubkey
    );
    const epochToScaleToSum: any[] = yield call(
      marketService.getEpochToScaleToSum,
      epochToScaleToSumPubkey
    );

    // Post process chain data

    stabilityPoolState.cumulativeGainsTotal.sol =
      // @ts-ignore
      stabilityPoolState.cumulativeGainsTotal.sol.toNumber();
    stabilityPoolState.cumulativeGainsTotal.eth =
      // @ts-ignore
      stabilityPoolState.cumulativeGainsTotal.eth.toNumber();
    stabilityPoolState.cumulativeGainsTotal.btc =
      // @ts-ignore
      stabilityPoolState.cumulativeGainsTotal.btc.toNumber();
    stabilityPoolState.cumulativeGainsTotal.srm =
      // @ts-ignore
      stabilityPoolState.cumulativeGainsTotal.srm.toNumber();
    stabilityPoolState.cumulativeGainsTotal.ray =
      // @ts-ignore
      stabilityPoolState.cumulativeGainsTotal.ray.toNumber();
    stabilityPoolState.cumulativeGainsTotal.ftt =
      // @ts-ignore
      stabilityPoolState.cumulativeGainsTotal.ftt.toNumber();

    stabilityPoolState.cumulativeGainsTotal.hbb =
      // @ts-ignore
      stabilityPoolState.cumulativeGainsTotal.hbb.toNumber();

    stabilityPoolState.totalUsdDeposits =
      // @ts-ignore
      stabilityPoolState.stablecoinDeposited.toNumber();

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityPoolState,
        stabilityPoolStatePubkey,
        stabilityVaultsPubkey,
        stabilityVaults,
        epochToScaleToSum,
      },
    });
  } catch (err) {
    notify({
      message: "Failed to load stability pool state",
      description: "Unexpected error when loading the stability pool state",
      type: "error",
    });
    console.error("Failed to load stability pool state", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityPoolStateLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityPoolStateLoading: false,
    },
  });
}

export function* GET_STABILITY_PROVIDER_STATE({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: true,
      stabilityProviderStateLoadingError: false,
    },
  });

  const {
    userPublicKey,
    env,
  }: {
    userPublicKey: string;
    env: string;
  } = payload;

  const stateService: StateService = yield getContext("stateService");

  try {
    const stabilityPoolStatePubkey =
      hubbleConfig[env].borrowing.accounts.stabilityPoolState;

    const stabilityProviderState: ProgramAccount<StabilityProviderState> | null =
      yield call(
        stateService.getStabilityProviderState,
        userPublicKey,
        stabilityPoolStatePubkey
      );

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderState:
          stabilityProviderState === null
            ? null
            : stabilityProviderState.account,
        stabilityProviderStatePubkey:
          stabilityProviderState === null
            ? null
            : stabilityProviderState.publicKey,
      },
    });
  } catch (err) {
    notify({
      message: "Failed to load stability provider state",
      description: "Unexpected error when loading stability provider state",
      type: "error",
    });
    console.error("Failed to load stability provider state", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderStateLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: false,
    },
  });
}

export function* PROVIDE_STABILITY({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: true,
      stabilityProviderStateLoadingError: false,
    },
  });

  const {
    amount,
    userPublicKey,
    env,
    stablecoinAta,
    stabilityProviderStatePubkey,
    stabilityPoolStatePubkey,
    stabilityCounter,
  }: {
    amount: number;
    userPublicKey: string;
    stablecoinAta: PublicKey;
    stabilityProviderStatePubkey: PublicKey;
    stabilityPoolStatePubkey: PublicKey;
    env: string;
    stabilityCounter: number;
  } = payload;

  const stabilityOperations: StabilityOperations = yield getContext(
    "stabilityOperations"
  );

  try {
    notify({
      message: "Provide Stability",
      description: `Providing ${amount} USDH Stability`,
      type: "info",
    });

    const epochToScaleToSum = new PublicKey(
      hubbleConfig[env].borrowing.accounts.epochToScaleToSum
    );
    const stablecoinStabilityPoolVault = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stablecoinStabilityPoolVault
    );
    const stabilityVaults = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stabilityVaults
    );

    yield call(
      stabilityOperations.provideStability,
      new PublicKey(userPublicKey),
      stabilityProviderStatePubkey,
      stabilityPoolStatePubkey,
      stabilityVaults,
      epochToScaleToSum,
      stablecoinStabilityPoolVault,
      stablecoinAta,
      amount * STABLECOIN_DECIMALS
    );

    notify({
      message: "Provided Stability",
      description: `Provided ${amount} USDH Stability`,
      type: "success",
    });

    const stabilityProviderState: StabilityProviderState = yield select(
      (state) => state.hubbleBorrow.stabilityProviderState
    );
    const stabilityPoolState: StabilityPoolState = yield select(
      (state) => state.hubbleBorrow.stabilityPoolState
    );

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderState,
        stabilityProviderStatePubkey: stabilityPoolState,
      },
    });
  } catch (err) {
    notify({
      message: "Failed to provide USDH stability.",
      description: "Unexpected error when providing USDH stability.",
      type: "error",
    });
    console.error("Failed to provide stability", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderStateLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: false,
      stabilityCounter: stabilityCounter + 1,
    },
  });
}

export function* COFIRM_DIALOG({ payload }: AnyAction) {
  yield put({
    type: 'hubble/borrow/SET_STATE',
    payload: {
      confirmed: payload.confirmed
    },
  })
}

export function* WITHDRAW_STABILITY({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: true,
      stabilityProviderStateLoadingError: false,
    },
  });

  const {
    amount,
    userPublicKey,
    env,
    stablecoinAta,
    stabilityProviderStatePubkey,
    stabilityPoolStatePubkey,
    stabilityCounter,
  }: {
    amount: number;
    userPublicKey: string;
    stablecoinAta: PublicKey;
    stabilityProviderStatePubkey: PublicKey;
    stabilityPoolStatePubkey: PublicKey;
    env: string;
    stabilityCounter: number;
  } = payload;

  const stabilityOperations: StabilityOperations = yield getContext(
    "stabilityOperations"
  );

  try {
    notify({
      message: "Withdraw Stability",
      description: `Withdrawing ${amount} USDH from the Stability Pool`,
      type: "info",
    });

    const epochToScaleToSum = new PublicKey(
      hubbleConfig[env].borrowing.accounts.epochToScaleToSum
    );
    const stablecoinStabilityPoolVault = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stablecoinStabilityPoolVault
    );
    const stabilityVaults = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stabilityVaults
    );
    const borrowingMarketStatePubkey = new PublicKey(
      hubbleConfig[env].borrowing.accounts.borrowingMarketState
    );
    const stablecoinStabilityPoolVaultAuthority = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stablecoinStabilityPoolVaultAuthority
    );

    yield call(
      stabilityOperations.withdrawStability,
      new PublicKey(userPublicKey),
      borrowingMarketStatePubkey,
      stabilityProviderStatePubkey,
      stabilityPoolStatePubkey,
      stabilityVaults,
      epochToScaleToSum,
      stablecoinStabilityPoolVault,
      stablecoinStabilityPoolVaultAuthority,
      stablecoinAta,
      amount * 10_000
    );

    notify({
      message: "Withdraw Stability",
      description: `Successfully withdrew ${amount} USDH`,
      type: "success",
    });

    const stabilityProviderState: StabilityProviderState = yield select(
      (state) => state.hubbleBorrow.stabilityProviderState
    );
    const stabilityPoolState: StabilityPoolState = yield select(
      (state) => state.hubbleBorrow.stabilityPoolState
    );

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderState,
        stabilityProviderStatePubkey: stabilityPoolState,
      },
    });
  } catch (err) {
    notify({
      message: "Failed to withdraw USDH stability.",
      description: "Unexpected error when withdrawing USDH stability",
      type: "error",
    });
    console.error("Failed to withdraw stability", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderStateLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: false,
      stabilityCounter: stabilityCounter + 1,
    },
  });
}

export function* HARVEST_LIQUIDATION_GAINS({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: true,
      stabilityProviderStateLoadingError: false,
    },
  });

  const {
    userPublicKey,
    env,
    borrowingMarketState,
    stabilityProviderStatePubkey,
    stabilityCounter,
    srmAta,
    ethAta,
    btcAta,
    rayAta,
    fttAta,
    hbbAta,
  }: {
    userPublicKey: string;
    stabilityProviderStatePubkey: PublicKey;
    env: string;
    borrowingMarketState: BorrowingMarketState,
    stabilityCounter: number;
    srmAta: PublicKey;
    ethAta: PublicKey;
    btcAta: PublicKey;
    rayAta: PublicKey;
    fttAta: PublicKey;
    hbbAta: PublicKey;
  } = payload;

  const stabilityOperations: StabilityOperations = yield getContext(
    "stabilityOperations"
  );

  try {
    notify({
      message: "Harvesting Stability Gains",
      description: "Harvesting Stability Gains",
      type: "info",
    });

    const borrowingMarketStatePubkey = new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingMarketState);
    const epochToScaleToSum = new PublicKey(hubbleConfig[env].borrowing.accounts.epochToScaleToSum);
    const liquidationsQueue = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationsQueue);
    const stabilityVaults = new PublicKey(hubbleConfig[env].borrowing.accounts.stabilityVaults);
    const borrowingVaults = new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingVaults);

    const liquidationRewardsVaultSol = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultSol);
    const liquidationRewardsVaultSrm = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultSrm);
    const liquidationRewardsVaultEth = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultEth);
    const liquidationRewardsVaultBtc = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultBtc);
    const liquidationRewardsVaultRay = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultRay);
    const liquidationRewardsVaultFtt = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultFtt);
    const liquidationRewardsVaultAuthority = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultAuthority);

    const stabilityPoolStatePubkey = new PublicKey(hubbleConfig[env].borrowing.accounts.stabilityPoolState);

    const collateralVaultSol = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.SOL);
    const collateralVaultEth = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.ETH);
    const collateralVaultSrm = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.SRM);
    const collateralVaultBtc = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.BTC);
    const collateralVaultRay = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.RAY);
    const collateralVaultFtt = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.FTT);
    const collateralVaultsAuthority = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVaultsAuthority);


    const collateralValues: Array<{
      ticker: SolanaToken;
      clearingAgentAta: PublicKey;
      collateralVault: PublicKey;
      liquidationRewardsVault: PublicKey;
    }> = [
        {
          ticker: "SOL",
          clearingAgentAta: new PublicKey(userPublicKey),
          collateralVault: collateralVaultSol,
          liquidationRewardsVault: liquidationRewardsVaultSol,
        },
        {
          ticker: "BTC",
          clearingAgentAta: btcAta,
          collateralVault: collateralVaultBtc,
          liquidationRewardsVault: liquidationRewardsVaultBtc,
        },
        {
          ticker: "ETH",
          clearingAgentAta: ethAta,
          collateralVault: collateralVaultEth,
          liquidationRewardsVault: liquidationRewardsVaultEth,
        },
        {
          ticker: "SRM",
          clearingAgentAta: srmAta,
          collateralVault: collateralVaultSrm,
          liquidationRewardsVault: liquidationRewardsVaultSrm,
        },
        {
          ticker: "RAY",
          clearingAgentAta: rayAta,
          collateralVault: collateralVaultRay,
          liquidationRewardsVault: liquidationRewardsVaultRay,
        },
        {
          ticker: "FTT",
          clearingAgentAta: fttAta,
          collateralVault: collateralVaultFtt,
          liquidationRewardsVault: liquidationRewardsVaultFtt,
        },
      ];

    // Firstly call "clear liquidation gains"
    yield call(
      stabilityOperations.clearLiquidationGains,
      new PublicKey(userPublicKey),
      borrowingVaults,
      borrowingMarketStatePubkey,
      collateralVaultsAuthority,
      liquidationsQueue,
      collateralValues
    );

    // Then harvest gains
    yield call(
      stabilityOperations.harvestLiquidationGains,
      new PublicKey(userPublicKey),
      stabilityProviderStatePubkey,
      stabilityPoolStatePubkey,
      stabilityVaults,
      borrowingMarketStatePubkey,
      epochToScaleToSum,
      liquidationsQueue,
      srmAta,
      ethAta,
      btcAta,
      rayAta,
      fttAta,
      hbbAta,
      borrowingMarketState.hbbMint,
      borrowingMarketState.hbbMintAuthority,
      liquidationRewardsVaultSol,
      liquidationRewardsVaultSrm,
      liquidationRewardsVaultEth,
      liquidationRewardsVaultBtc,
      liquidationRewardsVaultRay,
      liquidationRewardsVaultFtt,
      liquidationRewardsVaultAuthority,
    );

    notify({
      message: "Harvested stability gains",
      description: "Harvested stability gains",
      type: "success",
    });

    const stabilityProviderState: StabilityProviderState = yield select(
      (state) => state.hubbleBorrow.stabilityProviderState
    );
    const stabilityPoolState: StabilityPoolState = yield select(
      (state) => state.hubbleBorrow.stabilityPoolState
    );

    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderState,
        stabilityProviderStatePubkey: stabilityPoolState,
      },
    });
  } catch (err) {
    notify({
      message: "Failed to harvest liquidation gains",
      description: "Make sure you have ATA for all coins.",
      type: "error",
    });
    console.error("Failed to harvest stability gains", err);
    yield put({
      type: "hubble/borrow/SET_STATE",
      payload: {
        stabilityProviderStateLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stabilityProviderStateLoading: false,
      stabilityCounter: stabilityCounter + 1,
    },
  });
}

const stringifyHoldings = (pos: UserMetadata): string => {
  return `${lamportsToColl(pos.depositedCollateral.sol, "SOL")} SOL, ${lamportsToColl(pos.depositedCollateral.btc, "BTC")} BTC, ${lamportsToColl(pos.depositedCollateral.eth, "ETH")} ETH, ${lamportsToColl(pos.depositedCollateral.srm, "SRM")} SRM, ${lamportsToColl(pos.depositedCollateral.ftt, "FTT")} FTT, ${lamportsToColl(pos.depositedCollateral.ray, "RAY")} RAY`;
}

export function* TRY_LIQUIDATE({ payload }: AnyAction) {
  const {
    userPublicKey,
    env,
    userMetadata,
    borrowingMarketState,
    liquidationCounter,
    srmAta,
    ethAta,
    btcAta,
    rayAta,
    fttAta,
    pos,
  }: {
    userPublicKey: string;
    env: string;
    userMetadata: PublicKey;
    stabilityVaults: StabilityVaults;
    borrowingMarketState: BorrowingMarketState;
    liquidationCounter: number;
    srmAta: PublicKey;
    ethAta: PublicKey;
    btcAta: PublicKey;
    rayAta: PublicKey;
    fttAta: PublicKey;
    pos: UserMetadata
  } = payload;

  const stabilityOperations: StabilityOperations = yield getContext(
    "stabilityOperations"
  );

  try {
    const epochToScaleToSum = new PublicKey(
      hubbleConfig[env].borrowing.accounts.epochToScaleToSum
    );
    const stabilityVaultsPubkey = new PublicKey(
      hubbleConfig[env].borrowing.accounts.stabilityVaults
    );

    const liquidationsQueue = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationsQueue);
    const borrowingVaults = new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingVaults);
    const stabilityPoolState = new PublicKey(hubbleConfig[env].borrowing.accounts.stabilityPoolState);
    const borrowingMarketStatePubkey = new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingMarketState);

    const stablecoinMint = new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinMint);
    const { stablecoinMintAuthority } = borrowingMarketState;
    const stablecoinStabilityPoolVault = new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinStabilityPoolVault);
    const stablecoinStabilityPoolVaultAuthority = new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinStabilityPoolVaultAuthority);

    const pythSolPriceInfo = new PublicKey(hubbleConfig[env].borrowing.accounts.pythSolPriceInfo);
    const pythEthPriceInfo = new PublicKey(hubbleConfig[env].borrowing.accounts.pythEthPriceInfo);
    const pythBtcPriceInfo = new PublicKey(hubbleConfig[env].borrowing.accounts.pythBtcPriceInfo);
    const pythSrmPriceInfo = new PublicKey(hubbleConfig[env].borrowing.accounts.pythSrmPriceInfo);
    const pythRayPriceInfo = new PublicKey(hubbleConfig[env].borrowing.accounts.pythRayPriceInfo);
    const pythFttPriceInfo = new PublicKey(hubbleConfig[env].borrowing.accounts.pythFttPriceInfo);

    notify({
      message: "Liquidating..",
      description: `Attempting to liquidate user.
      Debt: ${pos.borrowedStablecoin / STABLECOIN_DECIMALS}
      Holdings: ${stringifyHoldings(pos)}`,
      type: "info",
      duration: 0,
    });

    yield call(
      stabilityOperations.tryLiquidate,
      new PublicKey(userPublicKey),
      borrowingMarketStatePubkey,
      stabilityPoolState,
      userMetadata,
      stabilityVaultsPubkey,
      borrowingVaults,
      epochToScaleToSum,
      stablecoinMint,
      stablecoinMintAuthority,
      stablecoinStabilityPoolVault,
      stablecoinStabilityPoolVaultAuthority,
      liquidationsQueue,
      pythSolPriceInfo,
      pythBtcPriceInfo,
      pythEthPriceInfo,
      pythSrmPriceInfo,
      pythRayPriceInfo,
      pythFttPriceInfo,
    );

    const liquidationRewardsVaultSol = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultSol);
    const liquidationRewardsVaultSrm = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultSrm);
    const liquidationRewardsVaultEth = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultEth);
    const liquidationRewardsVaultBtc = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultBtc);
    const liquidationRewardsVaultRay = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultRay);
    const liquidationRewardsVaultFtt = new PublicKey(hubbleConfig[env].borrowing.accounts.liquidationRewardsVaultFtt);

    const collateralVaultSol = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.SOL);
    const collateralVaultEth = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.ETH);
    const collateralVaultSrm = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.SRM);
    const collateralVaultBtc = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.BTC);
    const collateralVaultRay = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.RAY);
    const collateralVaultFtt = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVault.FTT);
    const collateralVaultsAuthority = new PublicKey(hubbleConfig[env].borrowing.accounts.collateralVaultsAuthority);

    const collateralValues: Array<{
      ticker: SolanaToken;
      clearingAgentAta: PublicKey;
      collateralVault: PublicKey;
      liquidationRewardsVault: PublicKey;
    }> = [
        {
          ticker: "SOL",
          clearingAgentAta: new PublicKey(userPublicKey),
          collateralVault: collateralVaultSol,
          liquidationRewardsVault: liquidationRewardsVaultSol,
        },
        {
          ticker: "BTC",
          clearingAgentAta: btcAta,
          collateralVault: collateralVaultBtc,
          liquidationRewardsVault: liquidationRewardsVaultBtc,
        },
        {
          ticker: "ETH",
          clearingAgentAta: ethAta,
          collateralVault: collateralVaultEth,
          liquidationRewardsVault: liquidationRewardsVaultEth,
        },
        {
          ticker: "SRM",
          clearingAgentAta: srmAta,
          collateralVault: collateralVaultSrm,
          liquidationRewardsVault: liquidationRewardsVaultSrm,
        },
        {
          ticker: "RAY",
          clearingAgentAta: rayAta,
          collateralVault: collateralVaultRay,
          liquidationRewardsVault: liquidationRewardsVaultRay,
        },
        {
          ticker: "FTT",
          clearingAgentAta: fttAta,
          collateralVault: collateralVaultFtt,
          liquidationRewardsVault: liquidationRewardsVaultFtt,
        },
      ];

    notify({
      message: "Clearing gains..",
      description: "Attempting to liquidate user",
      type: "info",
    });

    // Firstly call "clear liquidation gains"
    yield call(
      stabilityOperations.clearLiquidationGains,
      new PublicKey(userPublicKey),
      borrowingVaults,
      borrowingMarketStatePubkey,
      collateralVaultsAuthority,
      liquidationsQueue,
      collateralValues
    );

    notify({
      message: "Liquidation successful",
      description: `Liquidated user.
      Debt: ${pos.borrowedStablecoin / STABLECOIN_DECIMALS}
      Holdings: ${stringifyHoldings(pos)}`,
      type: "success",
    });
  } catch (err) {
    notify({
      message: "Failed to Liquidate user",
      description: "Unexpected error when Liquidating user",
      type: "error",
    });
    console.error("Failed to Liquidate ser", err);
  }
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      liquidationCounter: liquidationCounter + 1,
    },
  });
}

export function* contextSagas() {
  yield all([
    takeEvery(actions.GET_BORROWING_MARKET_STATE, GET_BORROWING_MARKET_STATE),
    takeEvery(actions.GET_USER_VAULTS, GET_USER_VAULTS),
    takeEvery(actions.CREATE_LOAN_DEPOSIT_BORROW, CREATE_LOAN_DEPOSIT_BORROW),
    takeEvery(actions.GET_STABILITY_POOL_STATE, GET_STABILITY_POOL_STATE),
    takeEvery(actions.GET_STABILITY_PROVIDER_STATE, GET_STABILITY_PROVIDER_STATE),
    takeEvery(actions.AIRDROP_USDH, AIRDROP_USDH),
    takeEvery(actions.AIRDROP_HBB, AIRDROP_HBB),
    takeEvery(actions.APPROVE_STABILITY, APPROVE_STABILITY),
    takeEvery(actions.PROVIDE_STABILITY, PROVIDE_STABILITY),
    takeEvery(actions.WITHDRAW_STABILITY, WITHDRAW_STABILITY),
    takeEvery(actions.HARVEST_LIQUIDATION_GAINS, HARVEST_LIQUIDATION_GAINS),
    takeEvery(actions.TRY_LIQUIDATE, TRY_LIQUIDATE),
    takeEvery(actions.REPAY_LOAN, REPAY_LOAN),
    takeEvery(actions.WITHDRAW_COLLATERAL, WITHDRAW_COLLATERAL),
    takeEvery(actions.DEPOSIT_COLLATERAL, DEPOSIT_COLLATERAL),
    takeEvery(actions.BORROW_STABLECOIN, BORROW_STABLECOIN),
    takeEvery(actions.COFIRM_DIALOG, COFIRM_DIALOG),
  ]);
}

const rootSaga = call(
  runSagasWithContext,
  [contextSagas],
  [
    "web3/CLIENT_CONNECTED",
    "web3/WALLET_CONNECTED",
    "web3/WALLET_DISCONNECTED",
  ],
  {
    createContext: ({
      env,
      client,
      publicKey,
      signTransaction,
      signAllTransactions,
    }: any) => {
      let stateService = null;
      let tokenService = null;
      let borrowingOperations = null;
      let stabilityOperations = null;
      if (client && publicKey) {
        const borrowingProgramId = hubbleConfig[env].borrowing.programId;
        const borrowingClient = new BorrowingClient(
          client,
          borrowingProgramId,
          { publicKey, signTransaction, signAllTransactions }
        );
        tokenService = new TokenService(
          client,
          signTransaction,
          signAllTransactions,
          publicKey
        );
        stateService = new StateService(borrowingClient);
        borrowingOperations = new BorrowingOperations(borrowingClient);
        stabilityOperations = new StabilityOperations(borrowingClient);
      }
      return {
        stateService,
        borrowingOperations,
        tokenService,
        stabilityOperations,
      };
    },
  }
);

export default rootSaga;
