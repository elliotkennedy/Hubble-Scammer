import { PublicKey } from "@solana/web3.js";
import CollateralAmounts from "./CollateralAmounts";

export type UserMetadata = {
  status: number,
  depositedCollateral: CollateralAmounts,
  version: number,
  userId: number,
  owner: PublicKey,
  borrowingMarketState: PublicKey,
  metadataPk: PublicKey,
  stablecoinAta: PublicKey,
  borrowedStablecoin: number,
  collateralValue: number,
  collateralRatio: number,
  collateralValueTs: number,
  collateralRatioTs: number,
  // hbbAta: PublicKey;
};


export type UserMetadatas = {
  len: number,
  max: number,
  indices: number[],
  positions: UserMetadata[],
}
