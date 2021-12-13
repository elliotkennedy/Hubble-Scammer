import {
    Keypair,
    PublicKey,
    TransactionSignature,
    SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { TokenInstructions } from "@project-serum/serum";
import { BorrowingClient } from "./BorrowingClient";

export class StakingOperations {
    private _borrowingClient: BorrowingClient;

    private _walletPublicKey: PublicKey;

    private _signTransaction: any;

    constructor(
        borrowingClient: BorrowingClient,
        signTransaction: any,
        walletPublicKey: PublicKey
    ) {
        this._borrowingClient = borrowingClient;
        this._walletPublicKey = walletPublicKey;
        this._signTransaction = signTransaction;
    }

    // TODO: add userSolRewardsAta (currently doing a hack)
    approveStaking = async (
        user: PublicKey,
        userHbbStakingAta: PublicKey,
        userStablecoinRewardsAta: PublicKey,
        stakingPoolState: PublicKey
    ): Promise<PublicKey> => {
        const userStakingState = new Keypair();

        await this._borrowingClient.client.rpc.stakingApprove({
            accounts: {
                user,
                userSolRewardsAta: user,
                userStakingState: userStakingState.publicKey,
                stakingPoolState,
                userHbbStakingAta,
                userStablecoinRewardsAta,
                tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [userStakingState],
        });
        return userStakingState.publicKey;
    };

    stakeHbb = async (
        user: PublicKey,
        stakingPoolState: PublicKey,
        userStakingState: PublicKey,
        stakingVault: PublicKey,
        userHbbStakingAta: PublicKey,
        amount: number
    ): Promise<TransactionSignature> => {
        const tx = this._borrowingClient.client.rpc.stakingStakeHbb(
            new anchor.BN(amount),
            {
                accounts: {
                    user,
                    stakingPoolState,
                    userStakingState,
                    stakingVault,
                    userHbbStakingAta,
                    tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
                },
            }
        );

        return tx;
    };

    unstakeHbb = (
        user: PublicKey,
        borrowingMarketState: PublicKey,
        borrowingVaults: PublicKey,
        stakingPoolState: PublicKey,
        userStakingState: PublicKey,
        borrowingFeesVault: PublicKey,
        borrowingFeesVaultAuthority: PublicKey,
        userStablecoinRewardsAta: PublicKey,
        userHbbStakingAta: PublicKey,
        stakingVault: PublicKey,
        stakingVaultAuthority: PublicKey,
        amount: number
    ): Promise<TransactionSignature> => {
        const tx = this._borrowingClient.client.rpc.unstakeHbb(
            new anchor.BN(amount),
            {
                accounts: {
                    user,
                    borrowingMarketState,
                    borrowingVaults,
                    stakingPoolState,
                    userStakingState,
                    borrowingFeesVault,
                    borrowingFeesVaultAuthority,
                    userStablecoinRewardsAta,
                    stakingVault,
                    stakingVaultAuthority,
                    userHbbStakingAta,
                    tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
                    rent: SYSVAR_RENT_PUBKEY,
                },
            }
        );

        return tx;
    };

    harvestRewards = async (
        borrowingMarketState: PublicKey,
        borrowingVaults: PublicKey,
        stakingPoolState: PublicKey,
        userStakingState: PublicKey,
        user: PublicKey,
        borrowingFeesVault: PublicKey,
        borrowingFeesVaultAuthority: PublicKey,
        userStablecoinRewardsAta: PublicKey
    ): Promise<TransactionSignature> => {
        const tx = await this._borrowingClient.client.rpc.stakingHarvestReward({
            accounts: {
                borrowingMarketState,
                borrowingVaults,
                stakingPoolState,
                userStakingState,
                user,
                borrowingFeesVault,
                borrowingFeesVaultAuthority,
                userStablecoinRewardsAta,
                tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
        });
        return tx;
    };
}
