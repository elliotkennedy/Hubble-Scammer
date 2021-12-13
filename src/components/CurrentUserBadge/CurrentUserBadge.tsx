import React from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { formatNumber, shortenAddress } from "../../utils/utils";
import { Identicon } from "../Identicon/Identicon";
import useEnv from "../../hooks/useEnv";

export const CurrentUserBadge = () => {
  const { walletPublicKey } = useEnv();
  const account  = {lamports: 200000} // todo

  if (walletPublicKey === null) {
    return null;
  }

  // should use SOL ◎ ?

  return (
    <div className="wallet-wrapper">
      <span>
        {formatNumber.format((account?.lamports || 0) / LAMPORTS_PER_SOL)} SOL
      </span>
      <div className="wallet-key">
        {shortenAddress(walletPublicKey)}
        <Identicon
          address={walletPublicKey}
          style={{ marginLeft: "0.5rem", display: "flex" }}
        />
      </div>
    </div>
  );
};
