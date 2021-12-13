import actions from './actions'
import { ENDPOINTS } from "../../services/web3/client";

const initialState = {
  env: localStorage.getItem("web3.env") ? localStorage.getItem("web3.env") : ENDPOINTS[0].name,
  walletConnected: false,
  walletPublicKey: null,
}

export default function solanaReducer(state = initialState, action: any) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload }
    default:
      return state
  }
}
