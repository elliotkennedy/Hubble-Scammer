import {PublicKey} from "@solana/web3.js";

type BorrowingMarketState = {
  version: number,

  // Global admin (not sure what to do about this yet)
  // It's currently needed for seed generation
  initialMarketOwner: PublicKey,

  // Should be SPL Token Program really
  tokenProgramId: PublicKey,

  // Mint Account from which stablecoin is minted (owned by program PDA)
  // Authority which can MINT tokens out of stablecoinMint
  stablecoinMint: PublicKey,
  stablecoinMintAuthority: PublicKey,
  stablecoinMintSeed: number,

  // Mint Account from which HBB is minted (owned by program PDA)
  // Authority which can MINT tokens out of hbbMint
  hbbMint: PublicKey,
  hbbMintAuthority: PublicKey,
  hbbMintSeed: number,

  // Burning pot where paid debts are sent, (owned by program seed)
  // Pda which owns the burning pot
  burningVault: PublicKey,
  burningVaultAuthority: PublicKey,
  burningVaultSeed: number,

  // Stablecoin account where fees are sent, (owned by program seed)
  // Pda which owns the borrowing fees pot
  borrowingFeesReceiver: PublicKey,
  borrowingFeesAuthority: PublicKey,
  borrowingFeesSeed: number,

  // Account where collateral is stored (gulping), (owned by program)
  poolCollateralVault: PublicKey,

  // State
  numUsers: number,
  numActiveUsers: number,
  stablecoinBorrowed: number,
  depositedSol: number,
  baseRate: number,
  requiredMcr: number,

  // Redistribution data
  // During liquidations, when there is no stability in the
  // Stability pool, we redistribute the collateral and the
  // debt proportionately among all users
  redistributedSol: number,
  redistributedStablecoin: number,

  totalStake: number,
  collateralRewardPerToken: number,
  stablecoinRewardPerToken: number,

  // As of last liquidation
  totalStakeLastLiqSnapshot: number,
  borrowedStablecoinLastLiqSnapshot: number,
}

export default BorrowingMarketState;
