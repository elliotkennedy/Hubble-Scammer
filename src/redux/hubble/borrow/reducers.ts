import actions from "./actions";
import { UserVault } from "../../../models/hubble/UserVault";

const initialState = {
    userVaults: [] as Array<UserVault>,
    userVaultsLoading: false,
    userVaultsLoadingError: false,
    borrowingMarketState: null,
    borrowingMarketStateLoading: false,
    borrowingMarketStateLoadingError: false,
    borrowSubmitting: false,
    borrowError: false,
    stabilityPoolStatePubkey: null,
    stabilityPoolState: null,
    stabilityPoolStateLoading: false,
    stabilityPoolStateLoadingError: false,
    stabilityVaultsPubkey: null,
    stabilityVaults: null,
    stabilityProviderState: null,
    stabilityProviderStateLoading: false,
    stabilityProviderStateLoadingError: false,
    stabilityProviderStatePubkey: false,
    borrowingMarketStatePubkey: null,
    stablecoinMintAuthorityPubkey: null,
    stablecoinMintPubkey: null,
    hbbMintPubkey: null,
    hbbMintAuthorityPubkey: null,
    epochToScaleToSum: null,
    airdropCounter: 0,
    stabilityCounter: 0,
    liquidationCounter: 0,
    vaultsInteractionsCounter: 0,
    confirmed: false,
}

export default function hubbleBorrowReducer(state = initialState, action: any) {
    switch (action.type) {
        case actions.SET_STATE:
            return { ...state, ...action.payload };
        default:
            return state;
    }
}
