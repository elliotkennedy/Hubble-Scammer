import {AccountInfo, ParsedAccountData, PublicKey} from "@solana/web3.js";
import {NativeAccount} from "../../models/account";

export const nativeAccountParser = (publicKey: PublicKey, info: AccountInfo<Buffer | ParsedAccountData>): NativeAccount | null => {
  try {
    return {
      publicKey,
      ...info,
      data: null,
    }
  } catch (e) {
    console.error(`Unable to deserialise native account - ${publicKey.toBase58()} - data - ${JSON.stringify(info)}`, e)
    return null;
  }
};
