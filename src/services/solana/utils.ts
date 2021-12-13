import { Connection, Transaction, PublicKey, ConfirmOptions, TransactionSignature, sendAndConfirmRawTransaction, Signer } from "@solana/web3.js";

export async function send(
    connection: Connection,
    tx: Transaction,
    payer: PublicKey,
    signers?: Array<Signer | undefined>,
    opts?: ConfirmOptions
): Promise<TransactionSignature> {
    if (signers === undefined) {
        signers = [];
    }

    const { blockhash } = await connection.getRecentBlockhash();
    tx.feePayer = payer;
    tx.recentBlockhash = blockhash;

    // await provider.wallet.signTransaction(tx);
    signers.forEach((kp: Signer | undefined) => {
        if (kp !== undefined) {
            tx.partialSign(kp);
        }
    });

    const rawTx = tx.serialize();

    const txId = await sendAndConfirmRawTransaction(
        connection,
        rawTx,
        opts
    );

    return txId;
}