import { PublicKey } from "@solana/web3.js";
import DepositSnapshot from "./DepositSnapshot";
import StabilityTokenMap from "./StabilityTokenMap";

type StabilityProviderState = {
    version: number,
    stabilityPoolState: PublicKey,
    owner: PublicKey,
    userId: number,
    depositedStablecoin: number,
    userDepositSnapshot: DepositSnapshot,
    cumulativeGainsPerUser: StabilityTokenMap,
    pendingGainsPerUser: StabilityTokenMap,
}

export default StabilityProviderState;
