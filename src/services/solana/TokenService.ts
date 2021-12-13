import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction, TransactionSignature,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { TokenInstructions } from "@project-serum/serum";
import { SendTxRequest } from "@project-serum/anchor/dist/provider";
import { Web3Client } from "../web3/client";

export class TokenService {

  private readonly _client: Web3Client;

  private _signTransaction: (transaction: Transaction) => Promise<Transaction>;

  private _signAllTransaction: (transaction: Transaction[]) => Promise<Transaction[]>;

  private readonly _walletPublicKey: PublicKey;

  constructor(_client: Web3Client, signTransaction: (transaction: Transaction) => Promise<Transaction>, signAllTransactions: (transaction: Transaction[]) => Promise<Transaction[]>, publicKey: PublicKey) {
    this._client = _client;
    this._signTransaction = signTransaction;
    this._signAllTransaction = signAllTransactions;
    this._walletPublicKey = publicKey;
  }

  findBalance = async (ata: PublicKey): Promise<number | null> => {
    return (await this._client.connection.getTokenAccountBalance(ata)).value.uiAmount;
  }

  mintTo = async (
    mint: PublicKey,
    to: PublicKey,
    amount: number
  ): Promise<TransactionSignature> => {
    const uintarr = Uint8Array.from([
      241, 101, 13, 165, 53, 150, 114, 216, 162, 246, 157, 94, 156, 209, 145,
      37, 186, 13, 219, 120, 66, 196, 128, 253, 177, 46, 0, 70, 68, 211, 238,
      83, 155, 17, 157, 105, 115, 161, 0, 60, 146, 250, 19, 171, 63, 222, 211,
      135, 37, 102, 222, 216, 142, 131, 67, 196, 185, 182, 202, 219, 55, 24,
      135, 90,
    ]);

    const authority = Keypair.fromSecretKey(uintarr);
    const instructions = [
      TokenInstructions.mintTo({
        mint,
        destination: to,
        amount,
        mintAuthority: authority.publicKey,
      }),
    ];

    const tx = new Transaction();
    tx.add(...instructions);

    const { blockhash } = await this._client.connection.getRecentBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = authority.publicKey;

    const txid = await this._client.connection.sendTransaction(tx, [authority]);
    await this._client.connection.confirmTransaction(txid);
    return txid;
  };

  findAta = async (
    owner: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<PublicKey | null> => {
    const tokenMintAta = await this._findAtaForTokenMint(
      owner,
      tokenMintAddress
    );

    if (await this._checkIfAccountExists(tokenMintAta)) {
      return tokenMintAta;
    }
    return null;
  };

  findAtaWithCreateCallbackIfNotExists = async (
    owner: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<{
    ata: PublicKey;
    createAta: (() => Promise<PublicKey>) | null;
  }> => {
    const tokenMintAta = await this._findAtaForTokenMint(
      owner,
      tokenMintAddress
    );

    if (await this._checkIfAccountExists(tokenMintAta)) {
      return {
        ata: tokenMintAta,
        createAta: null,
      };
    }
    return {
      ata: tokenMintAta,
      createAta: () => this._createAta(owner, tokenMintAddress, tokenMintAta),
    };
  };

  findAtaWithCreateTransactionIfNotExists = async (
    owner: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<{ ata: PublicKey; createAtaTx: SendTxRequest | null }> => {
    const tokenMintAta = await this._findAtaForTokenMint(
      owner,
      tokenMintAddress
    );

    if (await this._checkIfAccountExists(tokenMintAta)) {
      return {
        ata: tokenMintAta,
        createAtaTx: null,
      };
    }
    return {
      ata: tokenMintAta,
      createAtaTx: {
        tx: this._createAtaTx(owner, tokenMintAddress, tokenMintAta),
        signers: [],
      },
    };
  };

  private _createAtaIx = (
    owner: PublicKey,
    tokenMintAddress: PublicKey,
    ataAddress: PublicKey
  ): TransactionInstruction => {
    const keys = this._getKeys(owner, ataAddress, tokenMintAddress);
    return new TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([]),
    });
  };

  private _createAtaTx = (
    owner: PublicKey,
    tokenMintAddress: PublicKey,
    ataAddress: PublicKey
  ): Transaction => {
    const ix = this._createAtaIx(owner, tokenMintAddress, ataAddress);
    const tx = new Transaction();
    tx.add(ix);
    return tx;
  };

  private _createAta = async (
    owner: PublicKey,
    tokenMintAddress: PublicKey,
    ataAddress: PublicKey
  ): Promise<PublicKey> => {
    const createAtaTx = this._createAtaTx(owner, tokenMintAddress, ataAddress);
    const { blockhash } = await this._client.connection.getRecentBlockhash();
    createAtaTx.recentBlockhash = blockhash;
    createAtaTx.feePayer = this._walletPublicKey;

    const signed = await this._signTransaction(createAtaTx);
    const txid = await this._client.connection.sendRawTransaction(
      signed.serialize()
    );
    await this._client.connection.confirmTransaction(txid);
    return ataAddress;
  };

  createAtas = async (
    owner: PublicKey,
    mints: PublicKey[]
  ): Promise<PublicKey[]> => {

    const ataAddresses: PublicKey[] = [];
    const missingAtaAddresses: [PublicKey, PublicKey][] = [];

    for (let i = 0; i < mints.length; i++) {
      const ataAddress = await this._findAtaForTokenMint(
        owner,
        mints[i]
      );
      ataAddresses.push(ataAddress);
      if (!await this._checkIfAccountExists(ataAddress)) {
        missingAtaAddresses.push([ataAddress, mints[i]]);
      }
    }

    const txns = [];
    const { blockhash } = await this._client.connection.getRecentBlockhash();
    for (let i = 0; i < missingAtaAddresses.length; i++) {
      const createAtaTx = this._createAtaTx(owner, missingAtaAddresses[i][1], missingAtaAddresses[i][0]);
      createAtaTx.recentBlockhash = blockhash;
      createAtaTx.feePayer = this._walletPublicKey;
      txns.push(createAtaTx);

    }
    const signed = await this._signAllTransaction(txns);
    const txids = await Promise.all(signed.map((txn) => this._client.connection.sendRawTransaction(txn.serialize())));
    await Promise.all(txids.map((txid) => this._client.connection.confirmTransaction(txid)));

    return ataAddresses;
  };

  private _checkIfAccountExists = async (
    account: PublicKey
  ): Promise<boolean> => {
    const acc = await this._client.connection.getAccountInfo(account);
    return acc !== null;
  };

  private _findAtaForTokenMint = async (
    owner: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<PublicKey> => {
    const res = (
      await PublicKey.findProgramAddress(
        [
          owner.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];
    return res;
  };

  private _getKeys = (
    owner: PublicKey,
    ataAddress: PublicKey,
    tokenMintAddress: PublicKey
  ) => {
    return [
      {
        pubkey: owner,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: ataAddress,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: owner,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: tokenMintAddress,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
  };
}
