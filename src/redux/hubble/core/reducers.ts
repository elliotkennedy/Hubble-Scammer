import { createSelector } from "reselect";
import { PublicKey } from "@solana/web3.js";
import actions from "./actions";

const initialState = {
    stablecoinAta: null,
    ethAta: null,
    btcAta: null,
    srmAta: null,
    fttAta: null,
    rayAta: null,
    hbbAta: null,

    stablecoinAtaLoading: false,
    ethAtaLoading: false,
    btcAtaLoading: false,
    srmAtaLoading: false,
    fttAtaLoading: false,
    rayAtaLoading: false,
    hbbAtaLoading: false,

    stablecoinAtaLoadingError: false,
    ethAtaLoadingError: false,
    btcAtaLoadingError: false,
    srmAtaLoadingError: false,
    fttAtaLoadingError: false,
    rayAtaLoadingError: false,
    hbbAtaLoadingError: false,

    stablecoinBalance: null,
    ethBalance: null,
    btcBalance: null,
    srmBalance: null,
    fttBalance: null,
    rayBalance: null,
    hbbBalance: null,

    stablecoinBalanceLoading: false,
    ethBalanceLoading: false,
    btcBalanceLoading: false,
    srmBalanceLoading: false,
    fttBalanceLoading: false,
    rayBalanceLoading: false,
    hbbBalanceLoading: false,

    stablecoinBalanceLoadingError: false,
    ethBalanceLoadingError: false,
    btcBalanceLoadingError: false,
    srmBalanceLoadingError: false,
    fttBalanceLoadingError: false,
    rayBalanceLoadingError: false,
    hbbBalanceLoadingError: false,

    mintCounter: 0,
    ataConter: 0,
};

export const stablecoinAtaSelector = (state: any): PublicKey | null => state.hubbleCore.stablecoinAta;
export const stablecoinAtaLoadingSelector = (state: any): boolean => state.hubbleCore.stablecoinAtaLoading;

export const ethAtaSelector = (state: any): PublicKey | null => state.hubbleCore.ethAta;
export const ethAtaLoadingSelector = (state: any): boolean => state.hubbleCore.ethAtaLoading;

export const btcAtaSelector = (state: any): PublicKey | null => state.hubbleCore.btcAta;
export const btcAtaLoadingSelector = (state: any): boolean => state.hubbleCore.btcAtaLoading;

export const srmAtaSelector = (state: any): PublicKey | null => state.hubbleCore.srmAta;
export const srmAtaLoadingSelector = (state: any): boolean => state.hubbleCore.srmAtaLoading;

export const fttAtaSelector = (state: any): PublicKey | null => state.hubbleCore.fttAta;
export const fttAtaLoadingSelector = (state: any): boolean => state.hubbleCore.fttAtaLoading;

export const rayAtaSelector = (state: any): PublicKey | null => state.hubbleCore.rayAta;
export const rayAtaLoadingSelector = (state: any): boolean => state.hubbleCore.rayAtaLoading;

export const hbbAtaSelector = (state: any): PublicKey | null => state.hubbleCore.hbbAta;
export const hbbAtaLoadingSelector = (state: any): boolean => state.hubbleCore.hbbAtaLoading;


export const stablecoinBalanceSelector = (state: any) => state.hubbleCore.stablecoinBalance;
export const stablecoinBalanceLoadingSelector = (state: any): boolean => state.hubbleCore.stablecoinBalanceLoading;

export const ethBalanceSelector = (state: any) => state.hubbleCore.ethBalance;
export const ethBalanceLoadingSelector = (state: any): boolean => state.hubbleCore.ethBalanceLoading;

export const btcBalanceSelector = (state: any) => state.hubbleCore.btcBalance;
export const btcBalanceLoadingSelector = (state: any): boolean => state.hubbleCore.btcBalanceLoading;

export const srmBalanceSelector = (state: any) => state.hubbleCore.srmBalance;
export const srmBalanceLoadingSelector = (state: any): boolean => state.hubbleCore.srmBalanceLoading;

export const fttBalanceSelector = (state: any) => state.hubbleCore.fttBalance;
export const fttBalanceLoadingSelector = (state: any): boolean => state.hubbleCore.fttBalanceLoading;

export const rayBalanceSelector = (state: any) => state.hubbleCore.rayBalance;
export const rayBalanceLoadingSelector = (state: any): boolean => state.hubbleCore.rayBalanceLoading;

export const hbbBalanceSelector = (state: any) => state.hubbleCore.hbbBalance;
export const hbbBalanceLoadingSelector = (state: any): boolean => state.hubbleCore.hbbBalanceLoading;

export const getAtaLoadingSelector = () => {
    return createSelector([
        stablecoinAtaLoadingSelector,
        ethAtaLoadingSelector,
        btcAtaLoadingSelector,
        srmAtaLoadingSelector,
        fttAtaLoadingSelector,
        rayAtaLoadingSelector,
        hbbAtaLoadingSelector,
    ], (
        stablecoinAtaLoading,
        ethAtaLoading,
        btcAtaLoading,
        srmAtaLoading,
        fttAtaLoading,
        rayAtaLoading,
        hbbAtaLoading,
    ): boolean =>
        stablecoinAtaLoading ||
        ethAtaLoading ||
        btcAtaLoading ||
        srmAtaLoading ||
        fttAtaLoading ||
        rayAtaLoading ||
        hbbAtaLoading
    )
}

export const getBalanceLoadingSelector = () => {
    return createSelector([
        stablecoinBalanceLoadingSelector,
        ethBalanceLoadingSelector,
        btcBalanceLoadingSelector,
        srmBalanceLoadingSelector,
        fttBalanceLoadingSelector,
        rayBalanceLoadingSelector,
        hbbBalanceLoadingSelector,
    ], (
        stablecoinBalanceLoading,
        ethBalanceLoading,
        btcBalanceLoading,
        srmBalanceLoading,
        fttBalanceLoading,
        rayBalanceLoading,
        hbbBalanceLoading,
    ): boolean =>
        stablecoinBalanceLoading ||
        ethBalanceLoading ||
        btcBalanceLoading ||
        srmBalanceLoading ||
        fttBalanceLoading ||
        rayBalanceLoading ||
        hbbBalanceLoading
    )
}

export default function hubbleCoreReducer(state = initialState, action: any) {
    switch (action.type) {
        case actions.SET_STATE:
            return { ...state, ...action.payload };
        default:
            return state;
    }
}
