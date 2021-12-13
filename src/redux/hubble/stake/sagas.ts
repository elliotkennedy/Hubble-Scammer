import { PublicKey } from "@solana/web3.js";
import { AnyAction } from "redux";
import { all, call, getContext, put, takeEvery } from "redux-saga/effects";
import { ProgramAccount } from "@project-serum/anchor";
import { HBB_DECIMALS, LABELS } from "../../../constants";
import StakingPoolState from "../../../models/hubble/StakingPoolState";
import UserStakingState from "../../../models/hubble/UserStakingState";
import { BorrowingClient } from "../../../services/hubble/BorrowingClient";
import { StakingOperations } from "../../../services/hubble/StakingOperations";
import hubbleConfig from "../../../services/hubble/hubbleConfig";
import { TokenService } from "../../../services/solana/TokenService";
import { closeNotification, notify } from "../../../utils/notifications";
import { runSagasWithContext, SagaContextProps } from "../../runSagasWithContext";

import actions from "./actions";
import { StateService } from "../../../services/hubble/StateService";

export function* GET_STAKING_POOL_STATE({ payload }: AnyAction) {
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            stakingPoolStateLoading: true,
            stakingPoolStateLoadingError: false,
        },
    });

    const stateService: StateService = yield getContext("stateService");

    const { env }: { env: string } = payload;

    try {
        const stakingPoolStatePubkey = new PublicKey(
            hubbleConfig[env].borrowing.accounts.stakingPoolState
        );
        const stakingPoolState: StakingPoolState = yield call(
            stateService.getStakingPoolState,
            stakingPoolStatePubkey
        );
        yield put({
            type: "hubble/stake/SET_STATE",
            payload: {
                stakingPoolStatePubkey,
                stakingPoolState,
            },
        });
    } catch (err) {
        notify({
            message: LABELS.GENERAL_PROGRAM_DATA_FAILED_MESSAGE,
            description: LABELS.GENERAL_USER_DATA_FAILED_DESCRIPTION,
            type: "error",
        });
        console.error("Failed to load staking pool state", err);
        yield put({
            type: "hubble/stake/SET_STATE",
            payload: {
                stakingPoolStateLoadingError: true,
            },
        });
    }

    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            stakingPoolStateLoading: false,
        },
    });
}

export function* GET_USER_STAKING_STATE({ payload }: AnyAction) {
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            userStakingStateLoading: true,
            userStakingStateLoadingError: false,
        },
    });
    const { userPublicKey, env }: { userPublicKey: string; env: string } =
        payload;

    const stateService: StateService = yield getContext("stateService");

    try {
        const stakingPoolStatePubkey = new PublicKey(
            hubbleConfig[env].borrowing.accounts.stakingPoolState
        );

        const userStakingState: ProgramAccount<UserStakingState> | null =
            yield call(
                stateService.getUserStakingState,
                new PublicKey(userPublicKey),
                stakingPoolStatePubkey
            );
        yield put({
            type: "hubble/stake/SET_STATE",
            payload: {
                userStakingState:
                    userStakingState === null ? null : userStakingState.account,
                userStakingStatePubkey:
                    userStakingState === null ? null : userStakingState.publicKey,
            },
        });
    } catch (err) {
        notify({
            message: LABELS.GENERAL_USER_DATA_FAILED_MESSAGE,
            description: LABELS.GENERAL_USER_DATA_FAILED_DESCRIPTION,
            type: "error",
        });
        console.error("Failed to load user staking state", err);
        yield put({
            type: "hubble/stake/SET_STATE",
            payload: {
                userStakingStateLoadingError: true,
            },
        });
    }
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            userStakingStateLoading: false,
        },
    });
}

export function* APPROVE_STAKING({ payload }: AnyAction) {
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            userStakingStateLoading: true,
            userStakingStateLoadingError: false,
        },
    });

    const {
        userPublicKey,
        hbbAta,
        stablecoinAta,
        stakingPoolStatePubkey,
        stakingCounter,
    }: {
        userPublicKey: string;
        hbbAta: PublicKey;
        stablecoinAta: PublicKey;
        stakingPoolStatePubkey: PublicKey;
        stakingCounter: number;
    } = payload;

    const stakingOperations: StakingOperations = yield getContext(
        "stakingOperations"
    );

    const stateService: StateService = yield getContext("stateService");
    try {
        notify({
            message: "Approving provide staking",
            description:
                "Approve the transaction in your browser wallet popup to approve staking",
            type: "info",
            key: "approveStaking",
            duration: 0,
        });
        const userStakingStatePubkey: PublicKey = yield call(
            stakingOperations.approveStaking,
            new PublicKey(userPublicKey),
            hbbAta,
            stablecoinAta,
            stakingPoolStatePubkey
        );
        closeNotification("approveStaking");
        notify({
            message: "Staking Approved",
            description: "Approved staking successfully",
            type: "success",
        });

        const userStakingState: ProgramAccount<UserStakingState> | null =
            yield call(
                stateService.getUserStakingState,
                new PublicKey(userPublicKey),
                stakingPoolStatePubkey
            );

        yield put({
            type: "hubble/stake/SET_STATE",
            payload: {
                userStakingState,
                userStakingStatePubkey,
            },
        });
    } catch (err) {
        notify({
            message: LABELS.APPROVE_STAKING_FAILED_MESSAGE,
            description: LABELS.APPROVE_STAKING_FAILED_DESCRIPTION,
            type: "error",
        });
        console.error("Failed to create vault", err);
        yield put({
            type: "hubble/borrow/SET_STATE",
            payload: {
                userStakingStateLoadingError: true,
            },
        });
    }
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            userStakingStateLoading: false,
            stakingCounter: stakingCounter + 1,
        },
    });
}

export function* STAKE_HBB({ payload }: AnyAction) {
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            stakeSubmitting: true,
            stakeError: false,
        },
    });

    const {
        env,
        walletPublicKey,
        hbbAta,
        userStakingStatePubkey,
        depositHbbAmount,
        stakingCounter,
    }: {
        env: string;
        walletPublicKey: string;
        hbbAta: PublicKey;
        userStakingStatePubkey: PublicKey;
        depositHbbAmount: number;
        stakingCounter: number;
    } = payload;

    const stakingOperations: StakingOperations = yield getContext(
        "stakingOperations"
    );

    const stakingPoolState = new PublicKey(
        hubbleConfig[env].borrowing.accounts.stakingPoolState
    );
    const stakingVault = new PublicKey(
        hubbleConfig[env].borrowing.accounts.stakingVault
    );
    try {
        yield call(
            stakingOperations.stakeHbb,
            new PublicKey(walletPublicKey),
            stakingPoolState,
            userStakingStatePubkey,
            stakingVault,
            hbbAta,
            depositHbbAmount * HBB_DECIMALS
        );
    } catch (err) {
        notify({
            message: LABELS.STAKING_DEPOSIT_FAILED_MESSAGE,
            description: LABELS.STAKING_DEPOSIT_FAILED_DESCRIPTION,
            type: "error",
        });
        console.error("Failed to stake HBB", err);
        yield put({
            type: "hubble/borrow/SET_STATE",
            payload: {
                stakeError: true,
            },
        });
    }
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            stakeSubmitting: false,
            stakingCounter: stakingCounter + 1,
        },
    });
}

export function* HARVEST_REWARDS({ payload }: AnyAction) {
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            stakeSubmitting: true,
            stakeError: false,
        },
    });

    const {
        env,
        userPublicKey,
        userStakingStatePubkey,
        userStablecoinRewardsAta,
        stakingCounter,
    }: {
        env: string;
        userPublicKey: PublicKey;
        userStakingStatePubkey: PublicKey;
        userStablecoinRewardsAta: PublicKey;
        stakingCounter: number;
    } = payload;

    const stakingOperations: StakingOperations = yield getContext(
        "stakingOperations"
    );

    try {
        const borrowingMarketStatePubkey = new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingMarketState);
        const borrowingVaults = new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingVaults);
        const stakingPoolState = new PublicKey(hubbleConfig[env].borrowing.accounts.stakingPoolState);
        const borrowingFeesVault = new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingFeesAccount);
        const borrowingFeesVaultAuthority = new PublicKey(hubbleConfig[env].borrowing.accounts.borrowingFeesVaultAuthority);

        yield call(
            stakingOperations.harvestRewards,
            borrowingMarketStatePubkey,
            borrowingVaults,
            stakingPoolState,
            userStakingStatePubkey,
            userPublicKey,
            borrowingFeesVault,
            borrowingFeesVaultAuthority,
            userStablecoinRewardsAta
        );
    } catch (err) {
        notify({
            message: LABELS.HARVEST_FAILED_MESSAGE,
            description: LABELS.HARVEST_FAILED_DESCRIPTION,
            type: "error",
        });
        console.error("Failed to harvest reward", err);
        yield put({
            type: "hubble/borrow/SET_STATE",
            payload: {
                stakeError: true,
            },
        });
    }
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            stakeSubmitting: false,
            stakingCounter: stakingCounter + 1,
        },
    });
}

export function* UNSTAKE_HBB({ payload }: AnyAction) {
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            stakeSubmitting: true,
            stakeError: false,
        },
    });

    const {
        env,
        walletPublicKey,
        userStakingStatePubkey,
        stablecoinAta,
        hbbAta,
        withdrawHbbAmount,
        stakingCounter,
    }: {
        env: string;
        walletPublicKey: string;
        userStakingStatePubkey: PublicKey;
        stablecoinAta: PublicKey;
        hbbAta: PublicKey;
        withdrawHbbAmount: number;
        stakingCounter: number;
    } = payload;

    const stakingService: StakingOperations = yield getContext(
        "stakingOperations"
    );
    const stateService: StateService = yield getContext("stateService");

    try {
        const borrowingMarketStatePubkey = new PublicKey(
            hubbleConfig[env].borrowing.accounts.borrowingMarketState
        );
        const borrowingVaults = new PublicKey(
            hubbleConfig[env].borrowing.accounts.borrowingVaults
        );
        const stakingPoolStatePubkey = new PublicKey(
            hubbleConfig[env].borrowing.accounts.stakingPoolState
        );
        const stakingVault = new PublicKey(
            hubbleConfig[env].borrowing.accounts.stakingVault
        );
        const stakingPoolState: StakingPoolState = yield call(
            stateService.getStakingPoolState,
            stakingPoolStatePubkey
        );
        const { stakingVaultAuthority } = stakingPoolState;
        const borrowingFeesVault = new PublicKey(
            hubbleConfig[env].borrowing.accounts.borrowingFeesAccount
        );
        const borrowingFeesVaultAuthority = new PublicKey(
            hubbleConfig[env].borrowing.accounts.borrowingFeesVaultAuthority
        );

        yield call(
            stakingService.unstakeHbb,
            new PublicKey(walletPublicKey),
            borrowingMarketStatePubkey,
            borrowingVaults,
            stakingPoolStatePubkey,
            userStakingStatePubkey,
            borrowingFeesVault,
            borrowingFeesVaultAuthority,
            stablecoinAta,
            hbbAta,
            stakingVault,
            stakingVaultAuthority,
            withdrawHbbAmount * HBB_DECIMALS
        );
    } catch (err) {
        notify({
            message: LABELS.UNSTAKING_WITHDRAW_FAILED_MESSAGE,
            description: LABELS.UNSTAKING_WITHDRAW_FAILED_DESCRIPTION,
            type: "error",
        });
        console.error("Failed to unstake HBB", err);
        yield put({
            type: "hubble/borrow/SET_STATE",
            payload: {
                stakeError: true,
            },
        });
    }
    yield put({
        type: "hubble/stake/SET_STATE",
        payload: {
            stakeSubmitting: false,
            stakingCounter: stakingCounter + 1,
        },
    });
}

export function* contextSagas() {
    yield all([
        takeEvery(actions.GET_STAKING_POOL_STATE, GET_STAKING_POOL_STATE),
        takeEvery(actions.GET_USER_STAKING_STATE, GET_USER_STAKING_STATE),
        takeEvery(actions.APPROVE_STAKING, APPROVE_STAKING),
        takeEvery(actions.STAKE_HBB, STAKE_HBB),
        takeEvery(actions.UNSTAKE_HBB, UNSTAKE_HBB),
        takeEvery(actions.HARVEST_REWARDS, HARVEST_REWARDS),
    ]);
}

const rootSaga = call(
    runSagasWithContext,
    [contextSagas],
    [
        "web3/CLIENT_CONNECTED",
        "web3/WALLET_CONNECTED",
        "web3/WALLET_DISCONNECTED",
    ],
    {
        createContext: ({
            env,
            client,
            publicKey,
            signTransaction,
            signAllTransactions,
        }: SagaContextProps) => {
            let tokenService = null;
            let stakingOperations = null;
            let stateService = null;
            if (client && publicKey) {
                const borrowingProgramId = hubbleConfig[env].borrowing.programId;
                const publicKeyObj = new PublicKey(publicKey);
                const borrowingClient = new BorrowingClient(
                    client,
                    borrowingProgramId,
                    { publicKey: publicKeyObj, signTransaction, signAllTransactions }
                );

                stateService = new StateService(borrowingClient);

                tokenService = new TokenService(
                    client,
                    signTransaction,
                    signAllTransactions,
                    publicKeyObj,
                );
                stakingOperations = new StakingOperations(
                    borrowingClient,
                    signTransaction,
                    publicKeyObj,
                );
            }

            return {
                stateService,
                tokenService,
                stakingOperations,
            };
        },
    }
);

export default rootSaga;
