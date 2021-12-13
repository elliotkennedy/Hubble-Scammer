import { PublicKey } from "@solana/web3.js";

type StabilityVaults = {
    // TODO: redundancy between this and runtime config, try to fix this
    stabilityPoolState: PublicKey,
    hbbEmissionRewardsVault: PublicKey,
    hbbEmissionRewardsVaultAuthority: PublicKey,
    hbbEmissionRewardsVaultSeed: number,
    stablecoinStabilityPoolVault: PublicKey,
    stablecoinStabilityPoolVaultAuthority: PublicKey,
    stablecoinStabilityPoolVaultSeed: number,
    liquidationRewardsVaultSol: PublicKey,
    liquidationRewardsVaultSrm: PublicKey,
    liquidationRewardsVaultEth: PublicKey,
    liquidationRewardsVaultBtc: PublicKey,
    liquidationRewardsVaultRay: PublicKey,
    liquidationRewardsVaultFtt: PublicKey,
    liquidationRewardsVaultSrmAuthority: PublicKey,
    liquidationRewardsVaultEthAuthority: PublicKey,
    liquidationRewardsVaultBtcAuthority: PublicKey,
    liquidationRewardsVaultRayAuthority: PublicKey,
    liquidationRewardsVaultFttAuthority: PublicKey,
    liquidationRewardsVaultSrmSeed: number,
    liquidationRewardsVaultEthSeed: number,
    liquidationRewardsVaultBtcSeed: number,
    liquidationRewardsVaultRaySeed: number,
    liquidationRewardsVaultFttSeed: number,
    srmMint: PublicKey,
    ethMint: PublicKey,
    btcMint: PublicKey,
    rayMint: PublicKey,
    fttMint: PublicKey,
}

export default StabilityVaults;
