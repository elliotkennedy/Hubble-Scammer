import { PublicKey } from "@solana/web3.js";

type StakingPoolState = {
  version: number;

  // Global admin (not sure what to do about this yet)
  // It's currently needed for seed generation
  initialMarketOwner: PublicKey;

  // Metadata used for tracking/analytics purposes
  totalDistributedRewards: number;
  rewardsNotYetClaimed: number;

  // Variables used to determine the individual reward for each staker
  totalStake: number;
  rewardPerToken: number;

  // Staking vault where users stake HBB, (owned by program seed)
  // Pda which owns the staking vault pot
  stakingVault: PublicKey;
  stakingVaultAuthority: PublicKey;
  stakingVaultSeed: PublicKey;
};
export default StakingPoolState;
