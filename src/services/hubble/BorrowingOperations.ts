import { Keypair, PublicKey, TransactionSignature } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { TokenInstructions } from "@project-serum/serum";
import { SendTxRequest } from "@project-serum/anchor/dist/provider";
import { BorrowingClient } from "./BorrowingClient";
import { SolanaToken } from "../../constants";
import { getCollateralKeyForTicker } from "../../utils/utils";

export class BorrowingOperations {
  private _borrowingClient: BorrowingClient;

  constructor(borrowingClient: BorrowingClient) {
    this._borrowingClient = borrowingClient;
  }

  airdropUsdh = async (
    amount: number,
    initialMarketOwner: Keypair,
    stablecoinAta: PublicKey,
    borrowingMarketState: PublicKey,
    stablecoinMint: PublicKey,
    stablecoinMintAuthority: PublicKey,
  ): Promise<boolean> => {
    const tx = await this._borrowingClient.client.rpc.airdropUsdh(
      new anchor.BN(amount),
      {
        accounts: {
          initialMarketOwner: initialMarketOwner.publicKey,
          borrowingMarketState,
          stablecoinAta,
          stablecoinMint,
          stablecoinMintAuthority,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
        },
        signers: [initialMarketOwner]
      }
    );

    console.log("Airdrop done signature", tx);

    return true;
  };

  airdropHbb = async (
    amount: number,
    hbbAta: PublicKey,
    initialMarketOwner: Keypair,
    borrowingMarketState: PublicKey,
    hbbMint: PublicKey,
    hbbMintAuthority: PublicKey
  ): Promise<boolean> => {
    console.log("Minting Hbb", initialMarketOwner.toString());
    console.log("Minting Hbb", hbbAta.toString());
    console.log("Minting Hbb", borrowingMarketState.toString());
    console.log("Minting Hbb", hbbMint.toString());
    console.log("Minting Hbb", hbbMintAuthority.toString());
    const tx = await this._borrowingClient.client.rpc.airdropHbb(
      new anchor.BN(amount),
      {
        accounts: {
          initialMarketOwner: initialMarketOwner.publicKey,
          borrowingMarketState,
          userHbbAta: hbbAta,
          hbbMint,
          hbbMintAuthority,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [initialMarketOwner]
      }
    );

    console.log("Airdrop tx", tx);
    return true;
  };

  withdrawCollateral = async (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    borrowingVaults: PublicKey,
    userMetadata: PublicKey,
    collateral: Array<{
      ticker: SolanaToken;
      amount: number;
      collateralFrom: PublicKey;
      collateralFromAuthority: PublicKey;
      collateralTo: PublicKey;
    }>,
    pythSolProductInfo: PublicKey,
    pythSolPriceInfo: PublicKey,
    pythEthProductInfo: PublicKey,
    pythEthPriceInfo: PublicKey,
    pythBtcProductInfo: PublicKey,
    pythBtcPriceInfo: PublicKey,
    pythSrmProductInfo: PublicKey,
    pythSrmPriceInfo: PublicKey,
    pythRayProductInfo: PublicKey,
    pythRayPriceInfo: PublicKey,
    pythFttProductInfo: PublicKey,
    pythFttPriceInfo: PublicKey,
  ): Promise<TransactionSignature[]> => {

    const transactions = collateral.map((collateralItem) => this.getWithdrawCollateralTransaction(
      owner,
      borrowingMarketState,
      borrowingVaults,
      userMetadata,
      collateralItem.collateralFrom,
      collateralItem.collateralFromAuthority,
      collateralItem.collateralTo,
      pythSolProductInfo,
      pythSolPriceInfo,
      pythEthProductInfo,
      pythEthPriceInfo,
      pythBtcProductInfo,
      pythBtcPriceInfo,
      pythSrmProductInfo,
      pythSrmPriceInfo,
      pythRayProductInfo,
      pythRayPriceInfo,
      pythFttProductInfo,
      pythFttPriceInfo,
      collateralItem.amount,
      collateralItem.ticker
    ));

    return this._borrowingClient.provider.sendAll(transactions);
  };

  depositCollateral = async (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    borrowingVaults: PublicKey,
    userMetadata: PublicKey,
    collateral: Array<{
      ticker: SolanaToken;
      amount: number;
      collateralFrom: PublicKey;
      collateralTo: PublicKey;
      mint: PublicKey;
    }>,
  ): Promise<TransactionSignature[]> => {

    const transactions = collateral.map((collateralItem) => this.getDepositCollateralTransaction(
      owner,
      borrowingMarketState,
      borrowingVaults,
      userMetadata,
      collateralItem.collateralFrom,
      collateralItem.collateralTo,
      collateralItem.amount,
      collateralItem.ticker
    ));

    return this._borrowingClient.provider.sendAll(transactions);
  };

  borrowStablecoin = async (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    borrowingVaults: PublicKey,
    stakingPoolState: PublicKey,
    userMetadata: PublicKey,
    borrowingFeesVault: PublicKey,
    stablecoinAta: PublicKey,
    stablecoinMint: PublicKey,
    stablecoinMintAuthority: PublicKey,
    pythSolProductInfo: PublicKey,
    pythSolPriceInfo: PublicKey,
    pythEthProductInfo: PublicKey,
    pythEthPriceInfo: PublicKey,
    pythBtcProductInfo: PublicKey,
    pythBtcPriceInfo: PublicKey,
    pythSrmProductInfo: PublicKey,
    pythSrmPriceInfo: PublicKey,
    pythRayProductInfo: PublicKey,
    pythRayPriceInfo: PublicKey,
    pythFttProductInfo: PublicKey,
    pythFttPriceInfo: PublicKey,
    borrowStablecoinAmount: number,
  ): Promise<TransactionSignature> => {

    const borrowStablecoinTransaction = this.getBorrowStablecoinTransaction(
      owner,
      borrowingMarketState,
      borrowingVaults,
      stakingPoolState,
      userMetadata,
      stablecoinMint,
      stablecoinAta,
      stablecoinMintAuthority,
      borrowingFeesVault,
      pythSolProductInfo,
      pythSolPriceInfo,
      pythEthProductInfo,
      pythEthPriceInfo,
      pythBtcProductInfo,
      pythBtcPriceInfo,
      pythSrmProductInfo,
      pythSrmPriceInfo,
      pythRayProductInfo,
      pythRayPriceInfo,
      pythFttProductInfo,
      pythFttPriceInfo,
      borrowStablecoinAmount
    );

    return this._borrowingClient.provider.send(borrowStablecoinTransaction.tx);
  };

  newLoan = async (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    stakingPoolState: PublicKey,
    borrowingVaults: PublicKey,
    borrowingFeesVault: PublicKey,
    stablecoinAta: PublicKey,
    stablecoinMint: PublicKey,
    stablecoinMintAuthority: PublicKey,
    pythSolProductInfo: PublicKey,
    pythSolPriceInfo: PublicKey,
    pythEthProductInfo: PublicKey,
    pythEthPriceInfo: PublicKey,
    pythBtcProductInfo: PublicKey,
    pythBtcPriceInfo: PublicKey,
    pythSrmProductInfo: PublicKey,
    pythSrmPriceInfo: PublicKey,
    pythRayProductInfo: PublicKey,
    pythRayPriceInfo: PublicKey,
    pythFttProductInfo: PublicKey,
    pythFttPriceInfo: PublicKey,
    collateral: Array<{
      mint: PublicKey;
      ticker: SolanaToken;
      amount: number;
      poolAccount: PublicKey;
      ata: PublicKey;
    }>,
    borrowStablecoinAmount: number,
    dependentTransactions: SendTxRequest[]
  ): Promise<TransactionSignature[]> => {
    const userMetadata = Keypair.generate();

    const approveTroveTransaction = this.getApproveTroveTransaction(
      owner,
      borrowingMarketState,
      stablecoinAta,
      userMetadata
    );

    const depositCollateralTransactions = collateral.map((collateralItem) => {
      return this.getDepositCollateralTransaction(
        owner,
        borrowingMarketState,
        borrowingVaults,
        userMetadata.publicKey,
        collateralItem.ata,
        collateralItem.poolAccount,
        collateralItem.amount,
        collateralItem.ticker
      );
    });

    const borrowStablecoinTransaction = this.getBorrowStablecoinTransaction(
      owner,
      borrowingMarketState,
      borrowingVaults,
      stakingPoolState,
      userMetadata.publicKey,
      stablecoinMint,
      stablecoinAta,
      stablecoinMintAuthority,
      borrowingFeesVault,
      pythSolProductInfo,
      pythSolPriceInfo,
      pythEthProductInfo,
      pythEthPriceInfo,
      pythBtcProductInfo,
      pythBtcPriceInfo,
      pythSrmProductInfo,
      pythSrmPriceInfo,
      pythRayProductInfo,
      pythRayPriceInfo,
      pythFttProductInfo,
      pythFttPriceInfo,
      borrowStablecoinAmount
    );

    return this._borrowingClient.provider.sendAll([
      ...dependentTransactions,
      approveTroveTransaction,
      ...depositCollateralTransactions,
      borrowStablecoinTransaction,
    ]);
  };

  repayLoan = async (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    borrowingVaults: PublicKey,
    userMetadata: PublicKey,
    stablecoinMint: PublicKey,
    stablecoinBorrowingAssociatedAccount: PublicKey,
    burningVault: PublicKey,
    stablecoinMintAuthority: PublicKey,
    burningVaultAuthority: PublicKey,
    amount: number
  ): Promise<TransactionSignature> => {
    const tx = await this._borrowingClient.client.rpc.repayLoan(
      new anchor.BN(amount), {
      accounts: {
        owner,
        borrowingMarketState,
        borrowingVaults,
        userMetadata,
        stablecoinMint,
        stablecoinBorrowingAssociatedAccount,
        burningVault,
        tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
        stablecoinMintAuthority,
        burningVaultAuthority,
      }
    }
    )
    console.log("RepayLoan done signature", tx);
    return tx;
  }



  private getApproveTroveTransaction = (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    stablecoinAta: PublicKey,
    userMetadata: Keypair
  ): SendTxRequest => {
    const tx = this._borrowingClient.client.transaction.approveTrove({
      accounts: {
        owner,
        userMetadata: userMetadata.publicKey,
        borrowingMarketState,
        stablecoinAta,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    });

    return {
      tx,
      signers: [userMetadata],
    };
  };

  private getDepositCollateralTransaction = (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    borrowingVaults: PublicKey,
    userMetadata: PublicKey,
    collateralFrom: PublicKey,
    collateralTo: PublicKey,
    amount: number,
    collateralTicker: SolanaToken
  ): SendTxRequest => {
    const tx = this._borrowingClient.client.transaction.depositCollateral(
      new anchor.BN(amount),
      new anchor.BN(getCollateralKeyForTicker(collateralTicker)),
      {
        accounts: {
          owner,
          borrowingMarketState,
          borrowingVaults,
          userMetadata,
          collateralFrom,
          collateralTo,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      }
    );

    return {
      tx,
      signers: [],
    };
  };

  private getWithdrawCollateralTransaction = (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    borrowingVaults: PublicKey,
    userMetadata: PublicKey,
    collateralFrom: PublicKey,
    collateralFromAuthority: PublicKey,
    collateralTo: PublicKey,
    pythSolProductInfo: PublicKey,
    pythSolPriceInfo: PublicKey,
    pythEthProductInfo: PublicKey,
    pythEthPriceInfo: PublicKey,
    pythBtcProductInfo: PublicKey,
    pythBtcPriceInfo: PublicKey,
    pythSrmProductInfo: PublicKey,
    pythSrmPriceInfo: PublicKey,
    pythRayProductInfo: PublicKey,
    pythRayPriceInfo: PublicKey,
    pythFttProductInfo: PublicKey,
    pythFttPriceInfo: PublicKey,
    amount: number,
    token: SolanaToken
  ): SendTxRequest => {

    console.log("Withdrawing ", token, amount);

    const tx = this._borrowingClient.client.transaction.withdrawCollateral(
      new anchor.BN(amount),                                  // amount of collateral
      new anchor.BN(getCollateralKeyForTicker(token)),   // collateral type SOL == 0
      {
        accounts: {
          owner,
          borrowingMarketState,
          borrowingVaults,
          userMetadata,
          collateralFrom,
          collateralFromAuthority,
          collateralTo,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          pythSolProductInfo,
          pythSolPriceInfo,
          pythEthProductInfo,
          pythEthPriceInfo,
          pythBtcProductInfo,
          pythBtcPriceInfo,
          pythSrmProductInfo,
          pythSrmPriceInfo,
          pythRayProductInfo,
          pythRayPriceInfo,
          pythFttProductInfo,
          pythFttPriceInfo,
        },
      });

    return {
      tx,
      signers: [],
    };
  };

  private getBorrowStablecoinTransaction = (
    owner: PublicKey,
    borrowingMarketState: PublicKey,
    borrowingVaults: PublicKey,
    stakingPoolState: PublicKey,
    userMetadata: PublicKey,
    stablecoinMint: PublicKey,
    stablecoinAta: PublicKey,
    stablecoinMintAuthority: PublicKey,
    borrowingFeesVault: PublicKey,
    pythSolProductInfo: PublicKey,
    pythSolPriceInfo: PublicKey,
    pythEthProductInfo: PublicKey,
    pythEthPriceInfo: PublicKey,
    pythBtcProductInfo: PublicKey,
    pythBtcPriceInfo: PublicKey,
    pythSrmProductInfo: PublicKey,
    pythSrmPriceInfo: PublicKey,
    pythRayProductInfo: PublicKey,
    pythRayPriceInfo: PublicKey,
    pythFttProductInfo: PublicKey,
    pythFttPriceInfo: PublicKey,
    amount: number
  ): SendTxRequest => {
    console.log("getBorrowStablecoinTransaction", amount);
    const tx = this._borrowingClient.client.transaction.borrowStablecoin(
      new anchor.BN(amount),
      {
        accounts: {
          owner,
          borrowingMarketState,
          borrowingVaults,
          stakingPoolState,
          userMetadata,
          stablecoinMint,
          stablecoinBorrowingAssociatedAccount: stablecoinAta,
          tokenProgram: TokenInstructions.TOKEN_PROGRAM_ID,
          stablecoinMintAuthority,
          borrowingFeesVault,
          pythSolProductInfo,
          pythSolPriceInfo,
          pythEthProductInfo,
          pythEthPriceInfo,
          pythBtcProductInfo,
          pythBtcPriceInfo,
          pythSrmProductInfo,
          pythSrmPriceInfo,
          pythRayProductInfo,
          pythRayPriceInfo,
          pythFttProductInfo,
          pythFttPriceInfo,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY
        },
      }
    );

    return {
      tx,
      signers: [],
    };
  };


}
