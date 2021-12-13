import { AccountInfo, Commitment, PublicKey, SystemProgram, Transaction, TransactionSignature } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Web3Client } from "../web3/client";
import { mintAccountParser } from "./mintAccountParser";
import { tokenAccountParser } from "./tokenAccountParser";
import { ACCOUNT_BATCH_QUERY_SIZE, chunks, getAdminKeypair } from "../../utils/utils";
import { MintAccount, NativeAccount, TokenAccount } from "../../models/account";
import { nativeAccountParser } from "./nativeAccountParser";
import * as utils from "./utils"

export class SystemService {

    private _client: Web3Client;

    constructor(client: Web3Client) {
        this._client = client;
    }

    requestAirdrop = (publicKey: PublicKey, lamports: number): Promise<TransactionSignature> => {
        return this._client.sendConnection.requestAirdrop(publicKey, lamports);
    }

    requestAirdropTransfer = async (publicKey: PublicKey, lamports: number): Promise<TransactionSignature> => {

        const fundingAccount = getAdminKeypair();

        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fundingAccount.publicKey,
                toPubkey: publicKey,
                lamports,
            })
        );

        const signature = await utils.send(this._client.connection, tx, fundingAccount.publicKey, [fundingAccount]);
        console.log("Airdrop Signature", signature);
        return signature

    }


    getMintAccounts = (mintAddresses: PublicKey[], commitment: Commitment = 'single'): Promise<MintAccount[]> => {
        return Promise.all(
            chunks(mintAddresses, ACCOUNT_BATCH_QUERY_SIZE).map((chunk) => {
                return this._client.connection.getMultipleAccountsInfo(chunk, commitment)
                    .then(accountsChunk => {
                        return chunk
                            .map((mintAddress, index) => {
                                // @ts-ignore
                                const mintAccount: AccountInfo<Buffer> = accountsChunk[index];
                                if (mintAccount === null || mintAccount.data.length === 0) {
                                    return null;
                                }
                                return mintAccountParser(mintAddress, mintAccount);
                            }).filter(_ => _) as MintAccount[]
                    })
            })
        ).then(value => value.flat());
    }

    getTokenAccounts = (owner: PublicKey, commitment: Commitment = 'single'): Promise<TokenAccount[]> => {
        return this._client.connection.getTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }, commitment)
            .then(accounts => {
                return accounts.value
                    .map((account) => {
                        return tokenAccountParser(account.pubkey, account.account);
                    })
            });
    }

    getNativeAccount = (owner: PublicKey, commitment: Commitment = 'single'): Promise<NativeAccount | null> => {
        return this._client.connection.getParsedAccountInfo(owner, commitment)
            .then(account => {
                if (account.value === null) {
                    return null;
                }
                return nativeAccountParser(owner, account.value);
            });
    }
}
