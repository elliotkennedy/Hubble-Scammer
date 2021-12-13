import actions from "./actions";

const initialState = {
  stakingPoolStatePubkey: null,
  stakingPoolState: null,
  stakingPoolStateLoading: false,
  stakingPoolStateLoadingError: false,
  userStakingStatePubkey: null,
  userStakingState: null,
  userStakingStateLoading: false,
  userStakingStateLoadingError: false,
  stakeSubmitting: false,
  stakeError: false,
  stakingCounter: 0,
};

export default function hubbleStakingReducer(
  state = initialState,
  action: any
) {
  switch (action.type) {
    case actions.SET_STATE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
