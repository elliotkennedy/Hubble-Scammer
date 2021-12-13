import { take, cancel, call, setContext, all, fork, cancelled } from "redux-saga/effects";
import { AnyAction } from "redux";
import { Web3Client } from "../services/web3/client";

export function* runSagasWithContext(
  sagas: any[],
  refreshContextAction: string[] | string,
  {
    createContext = ({
      env,
      client,
      publicKey,
      signTransaction,
      signAllTransactions,
    }: SagaContextProps): any => ({
      env,
      client,
      publicKey,
      signTransaction,
      signAllTransactions,
    }),
  } = {} as any
) {
  let tasks = [];
  while (true) {
    const action: AnyAction = yield take<AnyAction>(refreshContextAction);

    const { env, client, publicKey, signTransaction, signAllTransactions } = action.payload;

    if (tasks) {
      yield cancel(tasks);
    }

    const context: SagaContextProps = yield call(createContext, { env, client, publicKey, signTransaction, signAllTransactions });
    yield setContext(context);

    tasks = yield all(
      sagas.map(saga =>
        fork(function* sagaWrapper(...args) {
          let isCancelled = false;

          while (!isCancelled) {
            try {
              yield call(saga, ...args);
            } catch (err) {
              console.warn('Error in saga:', err);
            } finally {
              if (yield cancelled()) {
                console.info('Cancelling saga:', saga.name);
                isCancelled = true;
              }
            }
          }
        })
      )
    );
  }
}

export type SagaContextProps = {
  env: string;
  client: Web3Client;
  publicKey: string;
  signTransaction: any;
  signAllTransactions: any;
};
