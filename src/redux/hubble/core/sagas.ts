import { all, call, getContext, put, takeEvery } from "redux-saga/effects";
import { AnyAction } from "redux";
import { PublicKey } from "@solana/web3.js";
import { closeNotification, notify } from "../../../utils/notifications";
import actions from "./actions";
import { runSagasWithContext, SagaContextProps } from "../../runSagasWithContext";
import hubbleConfig from "../../../services/hubble/hubbleConfig";
import { TokenService } from "../../../services/solana/TokenService";
import { Token } from "../../../constants";

export function* GET_TOKENS_ATA({ payload }: AnyAction) {
  yield put({
    type: "hubble/core/SET_STATE",
    payload: {
      stablecoinAtaLoading: true,
      stablecoinAtaLoadingError: false,
    },
  });

  const {
    publicKey,
    env,
  }: {
    publicKey: string;
    env: string;
  } = payload;

  const tokenService: TokenService = yield getContext("tokenService");

  try {
    const stablecoinAta: PublicKey | null = yield call(
      tokenService.findAta,
      new PublicKey(publicKey),
      new PublicKey(hubbleConfig[env].borrowing.accounts.stablecoinMint)
    );
    const btcAta: PublicKey | null = yield call(
      tokenService.findAta,
      new PublicKey(publicKey),
      new PublicKey(hubbleConfig[env].borrowing.accounts.mint.BTC)
    );
    const ethAta: PublicKey | null = yield call(
      tokenService.findAta,
      new PublicKey(publicKey),
      new PublicKey(hubbleConfig[env].borrowing.accounts.mint.ETH)
    );
    const srmAta: PublicKey | null = yield call(
      tokenService.findAta,
      new PublicKey(publicKey),
      new PublicKey(hubbleConfig[env].borrowing.accounts.mint.SRM)
    );
    const fttAta: PublicKey | null = yield call(
      tokenService.findAta,
      new PublicKey(publicKey),
      new PublicKey(hubbleConfig[env].borrowing.accounts.mint.FTT)
    );
    const rayAta: PublicKey | null = yield call(
      tokenService.findAta,
      new PublicKey(publicKey),
      new PublicKey(hubbleConfig[env].borrowing.accounts.mint.RAY)
    );
    const hbbAta: PublicKey | null = yield call(
      tokenService.findAta,
      new PublicKey(publicKey),
      new PublicKey(hubbleConfig[env].borrowing.accounts.mint.HBB)
    );

    yield put({
      type: "hubble/core/SET_STATE",
      payload: {
        stablecoinAta,
        btcAta,
        ethAta,
        srmAta,
        fttAta,
        rayAta,
        hbbAta,
      },
    });
  } catch (err) {
    notify({
      message: "Failed to load stablecoin account",
      description: "Unexpected error when loading your stablecoin account",
      type: "error",
    });
    console.error("Failed to load stablecoin ATA", err);
    yield put({
      type: "hubble/core/SET_STATE",
      payload: {
        stablecoinAtaLoadingError: true,
        btcAtaLoadingError: true,
        ethAtaLoadingError: true,
        srmAtaLoadingError: true,
        fttAtaLoadingError: true,
        rayAtaLoadingError: true,
        hbbAtaLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/core/SET_STATE",
    payload: {
      stablecoinAtaLoading: false,
      btcAtaLoading: false,
      ethAtaLoading: false,
      srmAtaLoading: false,
      fttAtaLoading: false,
      rayAtaLoading: false,
      hbbAtaLoading: false,
    },
  });
}

export function* GET_ATA_BALANCE({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      stablecoinBalanceLoading: true,
      btcBalanceLoading: true,
      ethBalanceLoading: true,
      srmBalanceLoading: true,
      fttBalanceLoading: true,
      rayBalanceLoading: true,
      hbbBalanceLoading: true,
    },
  });

  const {
    stablecoinAta,
    ethAta,
    btcAta,
    srmAta,
    fttAta,
    rayAta,
    hbbAta,
  }: {
    stablecoinAta: PublicKey | null;
    ethAta: PublicKey | null;
    btcAta: PublicKey | null;
    srmAta: PublicKey | null;
    fttAta: PublicKey | null;
    rayAta: PublicKey | null;
    hbbAta: PublicKey | null;
  } = payload;

  const svc: TokenService = yield getContext("tokenService");

  try {
    const stablecoinBalance: number | null =
      stablecoinAta == null ? null : yield call(svc.findBalance, stablecoinAta);
    const ethBalance: number | null =
      ethAta == null ? null : yield call(svc.findBalance, ethAta);
    const btcBalance: number | null =
      btcAta == null ? null : yield call(svc.findBalance, btcAta);
    const srmBalance: number | null =
      srmAta == null ? null : yield call(svc.findBalance, srmAta);
    const fttBalance: number | null =
      fttAta == null ? null : yield call(svc.findBalance, fttAta);
    const rayBalance: number | null =
      rayAta == null ? null : yield call(svc.findBalance, rayAta);
    const hbbBalance: number | null =
      hbbAta == null ? null : yield call(svc.findBalance, hbbAta);

    yield put({
      type: "hubble/core/SET_STATE",
      payload: {
        stablecoinBalance,
        ethBalance,
        btcBalance,
        srmBalance,
        fttBalance,
        rayBalance,
        hbbBalance,
      },
    });
  } catch (err) {
    notify({
      message: "Failed to load stablecoin balance",
      description: "Unexpected error when loading your stablecoin account",
      type: "error",
    });
    console.error("Failed to load stablecoin balance", err);
    yield put({
      type: "hubble/core/SET_STATE",
      payload: {
        stablecoinBalanceLoadingError: true,
        btcBalanceLoadingError: true,
        ethBalanceLoadingError: true,
        srmBalanceLoadingError: true,
        fttBalanceLoadingError: true,
        rayBalanceLoadingError: true,
      },
    });
  }
  yield put({
    type: "hubble/core/SET_STATE",
    payload: {
      stablecoinBalanceLoading: false,
      btcBalanceLoading: false,
      ethBalanceLoading: false,
      srmBalanceLoading: false,
      fttBalanceLoading: false,
      rayBalanceLoading: false,
      hbbBalanceLoading: false,
    },
  });
}

export function* CREATE_ATA({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      createAtaSubmitting: true,
      createAtaError: false,
    },
  });

  const {
    ataCounter,
    owner,
    mint,
    token,
  }: {
    ataCounter: number,
    owner: string,
    mint: string,
    token: Token,
  } = payload;

  const _ataCounter = ataCounter + 1;

  const tokenService: TokenService = yield getContext("tokenService");
  try {
    const ownerPk = new PublicKey(owner);
    const mintPk = new PublicKey(mint);

    const associatedTokenAccount: {
      ata: PublicKey;
      createAta: (() => Promise<string>) | null;
    } = yield call(
      tokenService.findAtaWithCreateCallbackIfNotExists,
      ownerPk,
      mintPk,
    );

    let effects = {};
    if (associatedTokenAccount.createAta !== null) {
      notify({
        message: `Creating new ${token} account`,
        description: `Approve the transaction to create your new token account.`,
        type: "info",
        key: "creatingAta",
        duration: 0,
      });
      const ata: PublicKey = yield call(associatedTokenAccount.createAta);

      switch (token) {
        case "USDH":
          effects = { ataCounter: _ataCounter, stablecoinAta: ata };
          break;
        case "ETH":
          effects = { ataCounter: _ataCounter, ethAta: ata };
          break;
        case "BTC":
          effects = { ataCounter: _ataCounter, btcAta: ata };
          break;
        case "SRM":
          effects = { ataCounter: _ataCounter, srmAta: ata };
          break;
        case "FTT":
          effects = { ataCounter: _ataCounter, fttAta: ata };
          break;
        case "RAY":
          effects = { ataCounter: _ataCounter, rayAta: ata };
          break;
        case "HBB":
          effects = { ataCounter: _ataCounter, hbbAta: ata };
          break;
      }

      closeNotification("creatingAta");

      yield put({
        type: "hubble/core/SET_STATE",
        payload: effects,
      });
    }
  } catch (err) {
    notify({
      message: "Failed to create associated token account",
      description: "Unexpected error creating associated token account",
      type: "error",
    });
    console.error("Failed to create vault", err);
    yield put({
      type: "hubble/core/SET_STATE",
      payload: {
        // createUserVaultError: true,
      },
    });
  }
}

export function* CREATE_ALL_ATAS(
  { payload }: AnyAction) {
  const {
    owner,
    mints,
    ataCounter
  }: {
    owner: PublicKey,
    mints: PublicKey[],
    ataCounter: number
  } = payload;

  const tokenService: TokenService = yield getContext("tokenService");
  try {
    const atas: PublicKey[] = yield call(
      tokenService.createAtas,
      owner,
      mints,
    );
    console.log("Atas", atas);
  } catch (err) {
    notify({
      message: "Failed to create associated token account",
      description: "Unexpected error creating associated token account",
      type: "error",
    });
    console.error("Failed to create vault", err);
  }

  const newAtaCounter = Number.isNaN(ataCounter) ? 0 : ataCounter + 1;
  console.log("Setting state to ", newAtaCounter);
  yield put({
    type: "hubble/core/SET_STATE",
    payload: {
      ataCounter: newAtaCounter
    },
  });

}

export function* MINT_TOKEN({ payload }: AnyAction) {
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      createAtaSubmitting: true,
      createAtaError: false,
    },
  });

  const {
    mint,
    ata,
    amount,
    token,
    mintCounter,
  }: {
    mint: string;
    ata: string;
    amount: number;
    token: "USDH" | "SRM" | "ETH" | "BTC" | "FTT" | "RAY";
    mintCounter: number;
  } = payload;

  const tokenService: TokenService = yield getContext("tokenService");
  try {
    notify({
      message: `Minting ${token}`,
      description: `Approve the transaction to mint ${token} your account`,
      type: "info",
      key: "mintingToAta",
      duration: 0,
    });

    yield call(
      tokenService.mintTo,
      new PublicKey(mint),
      new PublicKey(ata),
      amount
    );

    closeNotification("mintingToAta");

    const effects = {};

    yield put({
      type: "hubble/core/SET_STATE",
      payload: effects,
    });
  } catch (err) {
    notify({
      message: "Failed to mint token",
      description: "Unexpected error while minting tokens",
      type: "error",
    });
    console.error("Failed to create vault", err);
    yield put({
      type: "hubble/core/SET_STATE",
      payload: {
        mintCounter: mintCounter + 1,
      },
    });
  }
  yield put({
    type: "hubble/core/SET_STATE",
    payload: {
      mintCounter: mintCounter + 1,
    },
  });
}

export function* contextSagas() {
  yield all([
    takeEvery(actions.GET_TOKENS_ATA, GET_TOKENS_ATA),
    takeEvery(actions.CREATE_ATA, CREATE_ATA),
    takeEvery(actions.CREATE_ALL_ATAS, CREATE_ALL_ATAS),
    takeEvery(actions.MINT_TOKEN, MINT_TOKEN),
    takeEvery(actions.GET_ATA_BALANCE, GET_ATA_BALANCE),
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
      client,
      publicKey,
      signTransaction,
      signAllTransactions,
    }: SagaContextProps) => {
      let tokenService = null;
      if (client && publicKey) {
        tokenService = new TokenService(client, signTransaction, signAllTransactions, new PublicKey(publicKey));
      }
      return {
        tokenService,
      };
    },
  }
);

export default rootSaga;
