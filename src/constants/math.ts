import BN from "bn.js";

export const TEN = new BN(10);
export const HALF_WAD = TEN.pow(new BN(18));
export const WAD = TEN.pow(new BN(18));
export const RAY = TEN.pow(new BN(27));
export const ZERO = new BN(0);
export const LAMPORTS_PER_SOL = 1000000000;
export const DECIMALS_ETH = 10 ** 6;
export const DECIMALS_BTC = 10 ** 6;
export const DECIMALS_FTT = 10 ** 6;
export const DECIMALS_RAY = 10 ** 6;
export const DECIMALS_SRM = 10 ** 6;

export type Token = "BTC" | "SRM" | "ETH" | "SOL" | "SRM" | "FTT" | "RAY" | "HBB" | "USDH"
export type SolanaToken = "BTC" | "SRM" | "ETH" | "SOL" | "SRM" | "FTT" | "RAY"
export const STABLECOIN_DECIMALS = 1_000_000;
export const HBB_DECIMALS = 1_000_000;
export const SOL_PRICE_FACTOR_DEV = 1_000;
