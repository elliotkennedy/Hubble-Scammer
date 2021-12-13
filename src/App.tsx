import React from "react";
import "./App.less";
import { History } from "history";
import { Provider } from "react-redux";
import { Store } from "redux";
import ReactGA from 'react-ga';
import { Router } from "./router";

const TRACKING_ID = "G-QNFK7LF1L4";
ReactGA.initialize(TRACKING_ID);

function App({ history, store }: AppProps) {
  return (
    <Provider store={store}>
      <Router history={history} />
    </Provider>
  );
}

interface AppProps {
  history: History,
  store: Store,
}

export default App;
