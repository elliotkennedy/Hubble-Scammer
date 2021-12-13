import { all } from "redux-saga/effects";
import hubbleBorrow from "./hubble/borrow/sagas";
import hubbleCore from "./hubble/core/sagas";
import hubbleStake from "./hubble/stake/sagas";
import solana from "./solana/sagas";
import web3 from "./web3/sagas";
import serum from "./serum/sagas";

export default function* rootSaga() {
  yield all([web3(), solana, serum, hubbleBorrow, hubbleCore, hubbleStake]);
}
