import { useWallet } from "@solana/wallet-adapter-react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";

function useEnv(): EnvContext {

    const dispatch = useDispatch();

    const { publicKey, signTransaction, signAllTransactions, disconnect } = useWallet();

    const env = useSelector<RootStateOrAny, string>(state => state.web3.env);
    const walletConnected = useSelector<RootStateOrAny, boolean>(state => state.web3.walletConnected);
    const walletPublicKey = useSelector<RootStateOrAny, string>(state => state.web3.walletPublicKey)

    const setEnv = useCallback((_env: string) => {
        console.log("Environment switched to", env);
        dispatch({
            type: 'web3/SET_ENV',
            payload: {
                env: _env,
                publicKey,
                signTransaction,
                signAllTransactions
            }
        })
    }, [dispatch, env, publicKey, signTransaction, signAllTransactions])

    const disconnectWallet = useCallback(() => {
        dispatch({
            type: 'web3/DISCONNECT_WALLET',
            payload: {
                env,
                disconnect,
            }
        })
    }, [dispatch, env, disconnect])

    const connectWallet = useCallback(() => {
        dispatch({
            type: 'web3/CONNECT_WALLET',
            payload: {
                env,
                publicKey,
                signTransaction,
                signAllTransactions
            }
        })
    }, [dispatch, env, publicKey, signTransaction, signAllTransactions])

    return {
        env,
        setEnv,
        walletConnected,
        walletPublicKey,
        connectWallet,
        disconnectWallet,
    }
}

type EnvContext = {
    env: string,
    setEnv: (env: string) => void,
    walletConnected: boolean,
    walletPublicKey: string | null,
    connectWallet: () => void,
    disconnectWallet: () => void,
}

export default useEnv;
