import {useWallet} from "@solana/wallet-adapter-react";

function useInternalWallet(): InternalWalletContext {
  const { publicKey } = useWallet();
  return {
    publicKey: publicKey ? publicKey.toBase58() : null,
  }
}

type InternalWalletContext = {
  publicKey: string | null,
}

export default useInternalWallet;
