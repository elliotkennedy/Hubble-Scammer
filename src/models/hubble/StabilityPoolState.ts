import { PublicKey } from "@solana/web3.js";
import StabilityTokenMap from "./StabilityTokenMap";

type StabilityPoolState = {
    initialMarketOwner: PublicKey,
    tokenProgramId: PublicKey,
    epochToScaleToSum: PublicKey,
    version: number,
    numUsers: number,
    totalUsersProvidingStability: number,
    totalUsdDeposits: number,
    cumulativeGainsTotal: StabilityTokenMap,
    pendingCollateralGains: StabilityTokenMap,
    currentEpoch: number,
    currentScale: number,
    p: number,
    lastUsdLossErrorOffset: number,
    lastCollLossErrorOffset: StabilityTokenMap,
}

export default StabilityPoolState;
