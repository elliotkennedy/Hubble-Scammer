import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { createBrowserHistory } from "history";
import createSagaMiddleware from 'redux-saga'
import { routerMiddleware } from "connected-react-router";
import { applyMiddleware, compose, createStore } from "redux";
import * as serviceWorker from "./serviceWorker";
import App from "./App";
import reducers from "./redux/reducers";
import sagas from './redux/sagas'

const history = createBrowserHistory();

// middleware
const sagaMiddleware = createSagaMiddleware();
const routeMiddleware = routerMiddleware(history)
const middlewares = [sagaMiddleware, routeMiddleware]

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any; }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const enhancer = composeEnhancers(applyMiddleware(...middlewares))

const store = createStore(reducers(history), enhancer)
sagaMiddleware.run(sagas)

ReactDOM.render(
  <React.StrictMode>
    <App store={store} history={history} />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
