import {TokenInfo} from "@solana/spl-token-registry";
import actions from './actions'
import {MintAccount, NativeAccount, TokenAccount} from "../../models/account";

const initialState = {
  nativeAccount: null,
  nativeAccountLoading: false,
  nativeAccountError: false,
  airdropSubmitting: false,
  airdropError: false,
  knownMints: {} as Record<string, TokenInfo>,
  knownMintsLoading: false,
  knownMintsError: false,
  mintAccounts: [] as Array<MintAccount>,
  mintAccountsLoading: false,
  mintAccountsError: false,
  tokenAccounts: [] as Array<TokenAccount>,
  tokenAccountsLoading: false,
  tokenAccountsError: false,
}

export const nativeAccountSelector = (state: any): NativeAccount | null => state.solana.nativeAccount;
export const nativeAccountLoadingSelector = (state: any): boolean => state.solana.nativeAccountLoading;

export default function solanaReducer(state = initialState, action: any) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
