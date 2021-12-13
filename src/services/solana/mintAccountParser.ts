import {AccountInfo, PublicKey} from "@solana/web3.js";
import {MintInfo, MintLayout, u64} from "@solana/spl-token";
import {MintAccount} from "../../models/account";

export const mintAccountParser = (publicKey: PublicKey, info: AccountInfo<Buffer>): MintAccount | null => {

  try {
    const data = deserializeMint(info.data);
    return {
      publicKey,
      ...info,
      data,
    }
  } catch (e) {
    console.error(`Unable to deserialise mint account - ${publicKey.toBase58()} - data - ${JSON.stringify(info)}`, e)
    return null;
  }
};

const deserializeMint = (data: Buffer): MintInfo => {
  if (data.length !== MintLayout.span) {
    throw new Error("Not a valid Mint");
  }

  const mintInfo = MintLayout.decode(data);

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null;
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply);
  mintInfo.isInitialized = mintInfo.isInitialized !== 0;

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null;
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
  }

  return mintInfo;
};
