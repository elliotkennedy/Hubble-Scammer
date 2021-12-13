import { all, call, getContext, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { AnyAction } from "redux";
import { TokenInfo, TokenListProvider } from "@solana/spl-token-registry";
import { TokenListContainer } from "@solana/spl-token-registry/src/lib/tokenlist";
import { PublicKey } from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import actions from './actions'
import { LABELS } from "../../constants";
import { ENDPOINTS, ENV } from "../../services/web3/client";
import { SystemService } from "../../services/solana/SystemService";
import { runSagasWithContext } from "../runSagasWithContext";
import { MintAccount, NativeAccount, TokenAccount } from "../../models/account";

export function* GET_NATIVE_ACCOUNT({ payload }: AnyAction) {

  const { publicKey }: { publicKey: string } = payload;

  yield put({
    type: 'solana/SET_STATE',
    payload: {
      nativeAccountLoading: true,
      nativeAccountError: false,
    }
  })

  const systemService: SystemService = yield getContext('systemService');

  try {
    const nativeAccount: NativeAccount | null = yield call(systemService.getNativeAccount, new PublicKey(publicKey));

    yield put({
      type: 'solana/SET_STATE',
      payload: {
        nativeAccount
      }
    })
  } catch (err) {
    notify({
      message: LABELS.AIRDROP_FAILED_MESSAGE,
      description: LABELS.AIRDROP_FAILED_DESCRIPTION,
      type: "error",
    })
    console.error('Failed to load native account', err)
    yield put({
      type: 'solana/SET_STATE',
      payload: {
        nativeAccountError: true,
      },
    })
  }

  yield put({
    type: 'solana/SET_STATE',
    payload: {
      nativeAccountLoading: false,
    },
  })
}

export function* GET_KNOWN_MINTS() {

  yield put({
    type: 'solana/SET_STATE',
    payload: {
      knownMintsLoading: true,
      knownMintsError: false,
    }
  })

  const env: string = yield select(state => state.web3.env);

  const config = ENDPOINTS.find((envConfig) => envConfig.name === env) || null;

  if (config !== null) {

    const { resolve } = new TokenListProvider();
    try {
      const res: TokenListContainer = yield call(resolve);
      const list = res
        .filterByChainId(config.chainID)
        .excludeByTag("nft")
        .getList();

      const knownMintsByAddress: Record<string, TokenInfo> = list.reduce((obj, item) => {
        obj[item.address] = item;
        return obj;
      }, {} as Record<string, TokenInfo>
      );
      yield put({
        type: 'solana/SET_STATE',
        payload: {
          knownMints: knownMintsByAddress
        }
      })
    } catch (err) {
      console.error('Failed to load known mints', err)
      yield put({
        type: 'solana/SET_STATE',
        payload: {
          knownMintsError: true,
        },
      })
    }

  } else {
    console.error(`Failed to load known mints no config for env - ${env}`)
    yield put({
      type: 'solana/SET_STATE',
      payload: {
        knownMintsError: true,
      },
    })
  }

  yield put({
    type: 'solana/SET_STATE',
    payload: {
      knownMintsLoading: false,
    },
  })
}

export function* GET_MINT_ACCOUNTS({ payload }: AnyAction) {
  const { mintAddresses }: { mintAddresses: string[] } = payload;

  yield put({
    type: 'solana/SET_STATE',
    payload: {
      mintAccountsLoading: true,
      mintAccountsError: false
    }
  })

  const systemService: SystemService = yield getContext('systemService');

  try {
    const mintAccounts: MintAccount[] = yield call(systemService.getMintAccounts, mintAddresses.map(addr => new PublicKey(addr)));

    const mintAccountsByAddress = mintAccounts.reduce((obj, item) => {
      obj[item.publicKey.toBase58()] = item;
      return obj;
    }, {} as Record<string, MintAccount>);

    yield put({
      type: 'solana/SET_STATE',
      payload: {
        mintAccounts: mintAccountsByAddress
      }
    })
  } catch (err) {
    notify({
      message: LABELS.AIRDROP_FAILED_MESSAGE,
      description: LABELS.AIRDROP_FAILED_DESCRIPTION,
      type: "error",
    })
    console.error('Failed to load mint accounts', err)
    yield put({
      type: 'solana/SET_STATE',
      payload: {
        mintAccountsError: true,
      },
    })
  }

  yield put({
    type: 'solana/SET_STATE',
    payload: {
      mintAccountsLoading: false,
    },
  })
}

export function* GET_TOKEN_ACCOUNTS({ payload }: AnyAction) {
  const { publicKey }: { publicKey: string } = payload;

  yield put({
    type: 'solana/SET_STATE',
    payload: {
      tokenAccountsLoading: true,
      tokenAccountsError: false
    }
  })

  const systemService: SystemService = yield getContext('systemService');

  try {
    const tokenAccounts: TokenAccount[] = yield call(systemService.getTokenAccounts, new PublicKey(publicKey));
    yield put({
      type: 'solana/SET_STATE',
      payload: {
        tokenAccounts
      }
    })
  } catch (err) {
    notify({
      message: LABELS.AIRDROP_FAILED_MESSAGE,
      description: LABELS.AIRDROP_FAILED_DESCRIPTION,
      type: "error",
    })
    console.error('Failed to load user token accounts', err)
    yield put({
      type: 'solana/SET_STATE',
      payload: {
        tokenAccountsError: true,
      },
    })
  }

  yield put({
    type: 'solana/SET_STATE',
    payload: {
      tokenAccountsLoading: false,
    },
  })
}

export function* REQUEST_AIRDROP({ payload }: AnyAction) {
  const {
    env,
    publicKey,
    lamports,
    mintCounter,
    airdropCounter
  }: {
    env: ENV,
    publicKey: string,
    lamports: number,
    mintCounter: number,
    airdropCounter: number
  } = payload
  yield put({
    type: 'solana/SET_STATE',
    payload: {
      airdropSubmitting: true,
      airdropError: false,
    },
  })
  const systemService: SystemService = yield getContext('systemService');

  try {
    if (env === "devnet") {
      yield call(systemService.requestAirdropTransfer, new PublicKey(publicKey), lamports)
    } else {
      yield call(systemService.requestAirdrop, new PublicKey(publicKey), lamports)
    }
    notify({
      message: LABELS.AIRDROP_REQUESTED_MESSAGE,
      description: LABELS.AIRDROP_REQUESTED_DESCRIPTION,
      type: 'success',
    })
  } catch (err) {
    notify({
      message: LABELS.AIRDROP_FAILED_MESSAGE,
      description: LABELS.AIRDROP_FAILED_DESCRIPTION,
      type: "error",
    })
    console.error('Failed to submit airdrop', err)
    yield put({
      type: 'solana/SET_STATE',
      payload: {
        airdropError: true,
      },
    })
  }
  yield put({
    type: 'solana/SET_STATE',
    payload: {
      airdropSubmitting: false,
    },
  })
  yield put({
    type: 'hubble/core/SET_STATE',
    payload: {
      mintCounter: mintCounter + 1,
    },
  })
  yield put({
    type: "hubble/borrow/SET_STATE",
    payload: {
      airdropCounter: airdropCounter + 1,
    },
  });
}

export function* contextSagas() {
  yield all([
    takeLatest(actions.GET_NATIVE_ACCOUNT, GET_NATIVE_ACCOUNT),
    takeLatest(actions.GET_KNOWN_MINTS, GET_KNOWN_MINTS),
    takeLatest(actions.GET_MINT_ACCOUNTS, GET_MINT_ACCOUNTS),
    takeLatest(actions.GET_TOKEN_ACCOUNTS, GET_TOKEN_ACCOUNTS),
    takeEvery(actions.REQUEST_AIRDROP, REQUEST_AIRDROP),
  ])
}

const rootSaga = call(runSagasWithContext, [contextSagas], 'web3/CLIENT_CONNECTED', {
  createContext: ({ client }: any) => ({
    systemService: new SystemService(client),
  }),
})

export default rootSaga;
