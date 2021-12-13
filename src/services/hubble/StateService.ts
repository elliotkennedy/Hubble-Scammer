import { PublicKey } from "@solana/web3.js";
import { sha256 } from "js-sha256";
import { ProgramAccount } from "@project-serum/anchor";
import bs58 from "bs58";
import { BorrowingClient } from "./BorrowingClient";
import BorrowingMarketState from "../../models/hubble/BorrowingMarketState";
import StabilityPoolState from "../../models/hubble/StabilityPoolState";
import StabilityProviderState from "../../models/hubble/StabilityProviderState";
import StakingPoolState from "../../models/hubble/StakingPoolState";
import UserStakingState from "../../models/hubble/UserStakingState";
import StabilityVaults from "../../models/hubble/StabilityVaults";
import { UserVault } from "../../models/hubble/UserVault";

export class StateService {
  private _borrowingClient: BorrowingClient;

  constructor(borrowingClient: BorrowingClient) {
    this._borrowingClient = borrowingClient;
  }

  getMarket = (publicKey: PublicKey): Promise<BorrowingMarketState> => {
    return this._borrowingClient.client.account.borrowingMarketState.fetch(
      publicKey
    ) as Promise<BorrowingMarketState>;
  };

  getStakingPoolState = (publicKey: PublicKey): Promise<StakingPoolState> => {
    return this._borrowingClient.client.account.stakingPoolState.fetch(
      publicKey
    ) as Promise<StakingPoolState>;
  };

  getStabilityPoolState = (
    publicKey: PublicKey
  ): Promise<StabilityPoolState> => {
    return this._borrowingClient.client.account.stabilityPoolState.fetch(
      publicKey
    ) as Promise<StabilityPoolState>;
  };

  getStabilityVaults = (publicKey: PublicKey): Promise<StabilityVaults> => {
    return this._borrowingClient.client.account.stabilityVaults.fetch(
      publicKey
    ) as Promise<StabilityVaults>;
  };

  getUserStakingState = async (
    user: PublicKey,
    stakingPoolState: PublicKey
  ): Promise<ProgramAccount<UserStakingState> | null> => {
    const allUserStakingStates =
      await this._borrowingClient.client.account.userStakingState.all();
    const accounts: ProgramAccount<UserStakingState>[] =
      allUserStakingStates.filter((acc) => {
        return (
          true &&
          acc.account.user.toString() === user.toString() &&
          acc.account.stakingPoolState.toString() ===
          stakingPoolState.toString()
        );
      });

    if (accounts.length > 0) {
      const account = accounts[0];
      return account;
    }
    return null;

  };

  /**
   *
   * @param user If null = all users
   */
  getUserVaults = async (
    user: string | null
  ): Promise<Array<UserVault>> => {
    const idlAccountName: string =
      // @ts-ignore
      this._borrowingClient.client.account.userMetadata._idlAccount.name;

    const accountDiscriminatorBuffer = Buffer.from(
      sha256.digest(`account:${idlAccountName}`)
    ).slice(0, 8);

    const filters = [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(accountDiscriminatorBuffer),
        },
      }
    ];

    if (user) {
      // filters.push({
      //   memcmp: {
      //         offset: 11, // 8 + 1 + 2
      //         bytes: user,
      //       },
      // });
    }

    let resp =
      await this._borrowingClient.client.provider.connection.getProgramAccounts(
        this._borrowingClient.client.programId,
        {
          commitment: this._borrowingClient.provider.connection.commitment,
          filters,
        }
      );

    // TODO: set correct offset to fix memcmp;
    // Temp solution. memcmp filter has to be fixed
    if (user) {
      resp = resp.filter(({account}) => {
        const decodedAccount = this._borrowingClient.client.coder.accounts.decode(
          idlAccountName,
          account.data
        );
        return decodedAccount.owner.toString() === user;
      });
    }

    return resp.map(({ pubkey, account }) => {
      return {
        publicKey: pubkey,
        ...account,
        data: this._borrowingClient.client.coder.accounts.decode(
          idlAccountName,
          account.data
        ),
      };
    });
  };

  getStabilityProviderState = async (
    user: string,
    stabilityPoolState: string
  ): Promise<ProgramAccount<StabilityProviderState> | null> => {
    const allProviderStates =
      await this._borrowingClient.client.account.stabilityProviderState.all();
    const accounts: ProgramAccount<StabilityProviderState>[] =
      allProviderStates.filter((acc) => {
        return (
          true &&
          acc.account.owner.toString() === user.toString() &&
          acc.account.stabilityPoolState.toString() ===
          stabilityPoolState.toString()
        );
      });

    if (accounts.length > 0) {
      const account = accounts[0];
      account.account.depositedStablecoin =
        // @ts-ignore
        account.account.depositedStablecoin.toNumber();
      return account;
    }
    return null;

  };

  getEpochToScaleToSum = async (
    publicKey: PublicKey
  ): Promise<ProgramAccount<any[]>> => {
    return this._borrowingClient.client.account.epochToScaleToSumAccount.fetch(
      publicKey
    ) as Promise<ProgramAccount<any[]>>;
  };
}
