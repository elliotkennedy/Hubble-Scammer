import { all, call, put, takeLatest } from 'redux-saga/effects'
import { AnyAction } from "redux";
import { PublicKey, Transaction } from "@solana/web3.js";
import actions from './actions'
import { Web3Client } from "../../services/web3/client";

export function* CONNECT_WALLET({ payload }: AnyAction) {
    const { env, publicKey, signTransaction, signAllTransactions }:
        {
            env: string,
            publicKey: PublicKey,
            signTransaction: (transaction: Transaction) => Promise<Transaction>,
            signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>,
        } = payload

    const walletPublicKey = publicKey.toBase58();
    yield put({
        type: 'web3/SET_STATE',
        payload: {
            walletPublicKey,
            walletConnected: true,
        },
    })

    yield put({
        type: 'web3/WALLET_CONNECTED',
        payload: {
            env,
            client: new Web3Client(env),
            publicKey,
            signTransaction,
            signAllTransactions,
        },
    })
}

export function* DISCONNECT_WALLET({ payload }: AnyAction) {
    const { env, disconnect }: { env: string, disconnect?: () => Promise<void> } = payload

    if (disconnect) {
        yield call(disconnect);
    }

    yield put({
        type: 'web3/SET_STATE',
        payload: {
            walletConnected: false,
            walletPublicKey: null,
        },
    })

    yield put({
        type: 'web3/WALLET_DISCONNECTED',
        payload: {
            env
        },
    })
}

export function* SET_ENV({ payload }: AnyAction) {
    const { env, publicKey, signTransaction, signAllTransactions, }:
        {
            env: string,
            publicKey?: PublicKey,
            signTransaction?: (transaction: Transaction) => Promise<Transaction>,
            signAllTransactions?: (transaction: Transaction[]) => Promise<Transaction[]>,
        } = payload

    localStorage.setItem("web3.env", env)

    yield put({
        type: 'web3/SET_STATE',
        payload: {
            env,
        },
    })

    yield put({
        type: 'web3/CLIENT_CONNECTED',
        payload: {
            env,
            client: new Web3Client(env),
            publicKey,
            signTransaction,
            signAllTransactions,
        },
    })
}

export default function* rootSaga() {
    yield all([
        takeLatest(actions.CONNECT_WALLET, CONNECT_WALLET),
        takeLatest(actions.DISCONNECT_WALLET, DISCONNECT_WALLET),
        takeLatest(actions.SET_ENV, SET_ENV),
    ])
}
