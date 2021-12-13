import { PublicKey } from '@solana/web3.js'

type UserStakingState = {
    stakingPoolState: PublicKey
    borrowingFeesVault: PublicKey
    stakingVault: PublicKey
    user: PublicKey
    userHbbStakingAta: PublicKey
    userSolRewardsAta: PublicKey
    userStablecoinRewardsAta: PublicKey
    userStake: number
    rewardsTally: number
}

export default UserStakingState
