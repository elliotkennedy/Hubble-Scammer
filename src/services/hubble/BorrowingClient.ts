import { Idl, Program, Provider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor/dist/provider";
import BorrowingIdl from './borrowing.json'
import { Web3Client } from "../web3/client";

export class BorrowingClient {

    private readonly _client: Program;

    private readonly _provider: Provider;

    constructor(client: Web3Client, programId: string, wallet: Wallet) {
        this._provider = new Provider(client.sendConnection, wallet, { commitment: 'recent' });
        this._client = this.newClient(client, programId, this._provider);
    }

    private newClient = (client: Web3Client, programId: string, provider: Provider): Program => {
        return new Program(BorrowingIdl as Idl, new PublicKey(programId), provider);
    }

    get client() {
        return this._client;
    }

    get provider() {
        return this._provider;
    }
}
