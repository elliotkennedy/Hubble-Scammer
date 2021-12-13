import React from "react";
import {render} from "@testing-library/react";
import App from "./App";
import {createBrowserHistory} from "history";
import {useStore} from "react-redux";

jest.mock("./components/Identicon/Identicon", () => {
  return {
    __esModule: true,
    Identicon: () => null,
  };
});

test("renders balances text", () => {
  const history = createBrowserHistory();
  const store = useStore();
  const { getByText } = render(<App store={store} history={history}/>);
  const linkElement = getByText(/Your balances/i);
  expect(linkElement).toBeInTheDocument();
});
