import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { History } from "history";
import hubbleBorrow from "./hubble/borrow/reducers";
import hubbleCore from "./hubble/core/reducers";
import hubbleStaking from "./hubble/stake/reducers";
import solana from "./solana/reducers";
import web3 from "./web3/reducers";
import serum from "./serum/reducers";

// eslint-disable-next-line
export default (history: History) =>
    combineReducers({
        router: connectRouter(history),
        hubbleBorrow,
        hubbleCore,
        hubbleStaking,
        solana,
        web3,
        serum,
    });
