import actions from './actions'
import {SerumMarket} from "../../models/SerumMarket";

const initialState = {
  marketsLoading: false,
  marketsError: false,
  markets: {} as Record<string, SerumMarket>,
}

export const marketsSelector = (state: any): Record<string, SerumMarket> => state.serum.markets;
export const marketsLoadingSelector = (state: any): boolean => state.serum.marketsLoading;
export const marketsLoadingErrorSelector = (state: any): boolean => state.serum.marketsError;

export default function serumReducer(state = initialState, action: any) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
