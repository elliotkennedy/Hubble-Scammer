import {AccountInfo, PublicKey} from "@solana/web3.js";
import {MintInfo, AccountInfo as TokenAccountInfo } from "@solana/spl-token";

type AccountIdentifier = {
  publicKey: PublicKey;
}

export type Account<T = any> = AccountInfo<T> & AccountIdentifier;

export type NativeAccount = Account<null>

export type MintAccount = Account<MintInfo>

export type TokenAccount = Account<TokenAccountInfo>

export type MarketAccount = Account<any>
