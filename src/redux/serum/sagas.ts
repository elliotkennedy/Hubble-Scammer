import { all, call, getContext, put, takeLatest, delay, takeEvery } from 'redux-saga/effects'
import { AnyAction } from "redux";
import { PublicKey } from "@solana/web3.js";
import actions from './actions'
import { SerumMarketService } from "../../services/serum/SerumMarketService";
import { notify } from "../../utils/notifications";
import { SerumMarket } from "../../models/SerumMarket";
import { runSagasWithContext } from "../runSagasWithContext";
import { Web3Client } from "../../services/web3/client";

export function* GET_MARKETS({ payload }: AnyAction) {
    const { mintAddresses }: { mintAddresses: Array<string> } = payload;

    yield put({
        type: 'serum/SET_STATE',
        payload: {
            marketsLoading: true,
            marketsError: false,
        },
    })

    const serumMarketService: SerumMarketService = yield getContext('serumMarketService');

    try {
        // blocks until a new action is
        // triggered (takeLatest) or until
        // the delay of 1s is over
        yield delay(5000);

        const markets: Record<string, SerumMarket> = yield call(serumMarketService.getMarkets, mintAddresses.map(addr => new PublicKey(addr)));
        yield put({
            type: 'serum/SET_STATE',
            payload: {
                markets,
            }
        })
    } catch (err) {
        notify({
            message: "Failed to load Serum markets",
            description: "Prices will not be available",
            type: "error",
        })
        console.error('Failed to load serum markets', err)
        yield put({
            type: 'serum/SET_STATE',
            payload: {
                marketsError: true,
            },
        })
    }
    yield put({
        type: 'serum/SET_STATE',
        payload: {
            marketsLoading: false,
        },
    })
}

export function* contextSagas() {
    yield all([
        takeLatest(actions.GET_MARKETS, GET_MARKETS),
        takeEvery(actions.GET_MARKETS_ONCE, GET_MARKETS),
    ])
}

const rootSaga = call(runSagasWithContext, [contextSagas], 'web3/CLIENT_CONNECTED', {
    createContext: ({ env, client }: any) => {
        // always connect to the mainnet for serum prices
        let mainnetClient = client;
        if (env !== "mainnet-beta") {
            mainnetClient = new Web3Client("mainnet-beta");
        }
        return {
            serumMarketService: new SerumMarketService(mainnetClient)
        }
    },
})

export default rootSaga;
