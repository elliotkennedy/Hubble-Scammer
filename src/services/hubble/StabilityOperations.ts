import { Keypair, PublicKey, TransactionSignature } from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import { TokenInstructions } from "@project-serum/serum";
import { SendTxRequest } from "@project-serum/anchor/dist/provider";
import { BorrowingClient } from "./BorrowingClient";
import { SolanaToken } from "../../constants";
import { getCollateralKeyForTicker } from "../../utils/utils";

export class StabilityOperations {

  private _borrowingClient: BorrowingClient

  constructor(borrowingClient: BorrowingClient) {
    this._borrowingClient = borrowingClient;
  }

  approveStability = async (
    owner: PublicKey,
    stabilityPoolState: PublicKey,
  ): Promise<PublicKey> => {

    const stabilityProviderState = new Keypair();

    const tx = await this._borrowingClient.client.rpc.stabilityApprove({
      accounts: {
        owner,
        stabilityProviderState: stabilityProviderState.publicKey,
        stabilityPoolState,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [stabilityProviderState]
    });
    console.log('ApproveStability done signature:', tx);
    return stabilityProviderState.publicKey;
  }

  provideStability = async (
    owner: PublicKey,
    stabilityProviderState: PublicKey,
    stabilityPoolState: PublicKey,
    stabilityVaults: PublicKey,
    epochToScaleToSum: PublicKey,
    stablecoinStabilityPoolVault: PublicKey,
    stablecoinAta: PublicKey,
    amount: number): Promise<TransactionSignature> => {

    const tx = await this._borrowingClient.client.rpc.stabilityProvide(
      new anchor.BN(amount), {
      accounts: {
        owner,
        stabilityProviderState,
        stabilityPoolState,
        stabilityVaults,
        epochToScaleToSum,
        stablecoinStabilityPoolVault,
        stablecoinAta,
        tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      },
    });
    console.log('ProvideStability done signature:', tx);
    return tx;
  }

  harvestLiquidationGains = async (
    owner: PublicKey,
    stabilityProviderState: PublicKey,
    stabilityPoolState: PublicKey,
    stabilityVaults: PublicKey,
    borrowingMarketState: PublicKey,
    epochToScaleToSum: PublicKey,
    liquidationsQueue: PublicKey,
    srmAta: PublicKey,
    ethAta: PublicKey,
    btcAta: PublicKey,
    rayAta: PublicKey,
    fttAta: PublicKey,
    hbbAta: PublicKey,
    hbbMint: PublicKey,
    hbbMintAuthority: PublicKey,
    liquidationRewardsVaultSol: PublicKey,
    liquidationRewardsVaultSrm: PublicKey,
    liquidationRewardsVaultEth: PublicKey,
    liquidationRewardsVaultBtc: PublicKey,
    liquidationRewardsVaultRay: PublicKey,
    liquidationRewardsVaultFtt: PublicKey,
    liquidationRewardsVaultAuthority: PublicKey): Promise<TransactionSignature> => {

    const tx = await this._borrowingClient.client.rpc.harvestLiquidationGains(
      {
        accounts: {
          owner,
          stabilityProviderState,
          stabilityPoolState,
          stabilityVaults,
          borrowingMarketState,
          epochToScaleToSum,
          liquidationsQueue,
          liquidationRewardsVaultSol,
          liquidationRewardsVaultSrm,
          liquidationRewardsVaultEth,
          liquidationRewardsVaultBtc,
          liquidationRewardsVaultRay,
          liquidationRewardsVaultFtt,
          hbbAta,
          hbbMint,
          hbbMintAuthority,
          srmAta,
          ethAta,
          btcAta,
          rayAta,
          fttAta,
          liquidationRewardsVaultAuthority,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
      });
    console.log('HarvestLiquidationGains done signature:', tx);
    return tx;
  }

  clearLiquidationGains = async (
    clearingAgent: PublicKey,
    borrowingVaults: PublicKey,
    borrowingMarketState: PublicKey,
    collateralVaultAuthority: PublicKey,
    liquidationsQueue: PublicKey,
    collateral: Array<{
      ticker: SolanaToken;
      clearingAgentAta: PublicKey;
      collateralVault: PublicKey;
      liquidationRewardsVault: PublicKey;
    }>): Promise<TransactionSignature[]> => {

    const transactions = collateral.map((collateralItem) => this.getClearLiquidationGainsTransaction(
      clearingAgent,
      borrowingMarketState,
      borrowingVaults,
      liquidationsQueue,
      collateralVaultAuthority,
      collateralItem.clearingAgentAta,
      collateralItem.collateralVault,
      collateralItem.liquidationRewardsVault,
      collateralItem.ticker
    ));

    return this._borrowingClient.provider.sendAll(transactions);

  }

  private getClearLiquidationGainsTransaction = (
    clearingAgent: PublicKey,
    borrowingMarketState: PublicKey,
    borrowingVaults: PublicKey,
    liquidationsQueue: PublicKey,
    collateralVaultAuthority: PublicKey,
    clearingAgentAta: PublicKey,
    collateralVault: PublicKey,
    liquidationRewardsVault: PublicKey,
    collateralTicker: SolanaToken,
  ): SendTxRequest => {
    const tx = this._borrowingClient.client.transaction.clearLiquidationGains(
      new anchor.BN(getCollateralKeyForTicker(collateralTicker)),
      {
        accounts: {
          clearingAgent,
          borrowingVaults,
          borrowingMarketState,
          liquidationsQueue,
          collateralVault,
          collateralVaultAuthority,
          liquidationRewardsVault,
          clearingAgentAta,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
      }
    );

    return {
      tx,
      signers: [],
    };
  };

  withdrawStability = async (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    stabilityProviderState: PublicKey,
    stabilityPoolState: PublicKey,
    stabilityVaults: PublicKey,
    epochToScaleToSum: PublicKey,
    stablecoinStabilityPoolVault: PublicKey,
    stablecoinStabilityPoolVaultAuthority: PublicKey,
    stablecoinAta: PublicKey,
    amount: number): Promise<TransactionSignature> => {

    const tx = this._borrowingClient.client.rpc.stabilityWithdraw(
      new anchor.BN(amount), {
      accounts: {
        owner,
        borrowingMarketState,
        stabilityProviderState,
        stabilityPoolState,
        stabilityVaults,
        epochToScaleToSum,
        stablecoinStabilityPoolVault,
        stablecoinStabilityPoolVaultAuthority,
        stablecoinAta,
        tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      },
    });

    console.log('WithdrawStability done signature:', tx);
    return tx;
  }

  tryLiquidate = async (
    liquidator: PublicKey,
    borrowingMarketState: PublicKey,
    stabilityPoolState: PublicKey,
    userMetadata: PublicKey,
    stabilityVaults: PublicKey,
    borrowingVaults: PublicKey,
    epochToScaleToSum: PublicKey,
    stablecoinMint: PublicKey,
    stablecoinMintAuthority: PublicKey,
    stablecoinStabilityPoolVault: PublicKey,
    stablecoinStabilityPoolVaultAuthority: PublicKey,
    liquidationsQueue: PublicKey,
    pythSolPriceInfo: PublicKey,
    pythBtcPriceInfo: PublicKey,
    pythEthPriceInfo: PublicKey,
    pythSrmPriceInfo: PublicKey,
    pythRayPriceInfo: PublicKey,
    pythFttPriceInfo: PublicKey,
  ): Promise<TransactionSignature> => {

    const tx = await this._borrowingClient.client.rpc.tryLiquidate(
      {
        accounts: {
          liquidator,
          borrowingMarketState,
          stabilityPoolState,
          userMetadata,
          epochToScaleToSum,
          stabilityVaults,
          borrowingVaults,
          liquidationsQueue,
          stablecoinMint,
          stablecoinMintAuthority,
          stablecoinStabilityPoolVault,
          stablecoinStabilityPoolVaultAuthority,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          pythSolPriceInfo,
          pythBtcPriceInfo,
          pythEthPriceInfo,
          pythSrmPriceInfo,
          pythRayPriceInfo,
          pythFttPriceInfo,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        },
      });
    console.log('TryLiquidate done signature:', tx);
    return tx;
  }
}
