import React from "react";
import { TokenIcon } from "../TokenIcon/TokenIcon";

export const TokenDisplay = (props: {
  name: string;
  mintAddress: string;
  icon?: JSX.Element;
  showBalance?: boolean;
}) => {
  const { showBalance, mintAddress, name, icon } = props;
  const tokenMint = { decimals: 8 }; // useMint(mintAddress); // todo
  const tokenAccount = { info: { amount: 22000000 } }; // useAccountByMint(mintAddress); // todo

  let balance = 0;
  let hasBalance = false;
  if (showBalance) {
    if (tokenAccount && tokenMint) {
      balance = tokenAccount.info.amount / (10 ** tokenMint.decimals);
      hasBalance = balance > 0;
    }
  }

  return (
    <>
      <div
        title={mintAddress}
        key={mintAddress}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {icon || <TokenIcon mintAddress={mintAddress} />}
          {name}
        </div>
        {showBalance ? (
          <span
            title={balance.toString()}
            key={mintAddress}
            className="token-balance"
          >
            &nbsp;{" "}
            {hasBalance
              ? balance < 0.001
                ? "<0.001"
                : balance.toFixed(3)
              : "-"}
          </span>
        ) : null}
      </div>
    </>
  );
};
