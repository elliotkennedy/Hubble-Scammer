import { HBB_DECIMALS } from "../../constants";
import { EpochToScaleToSumSerialized } from "../../models/hubble/EpochToScaleToSum";
import StabilityPoolState from "../../models/hubble/StabilityPoolState";
import StabilityProviderState from "../../models/hubble/StabilityProviderState";
import StabilityTokenMap from "../../models/hubble/StabilityTokenMap";
import { lamportsToColl } from "../../utils/utils";


type TokenMapBig = {
  sol: BigInt,
  eth: BigInt,
  btc: BigInt,
  srm: BigInt,
  ray: BigInt,
  ftt: BigInt,
  hbb: BigInt,
}

type EpochToScaleToSum = TokenMapBig[][]

const DECIMAL_FACTOR = 1_000_000_000_000;
const SCALE_FACTOR = 1_000_000_000;

export function calculatePendingGains(
  stabilityPoolState: StabilityPoolState,
  stabilityProviderState: StabilityProviderState,
  epochToScaleToSum: EpochToScaleToSumSerialized
): [StabilityTokenMap, number] {

  const deserializedEpochToScaleToSum = deserializeEpoch(epochToScaleToSum.data);

  const pendingGains = getPendingGains(
    stabilityProviderState,
    deserializedEpochToScaleToSum
  );


  const smallPendingGains: StabilityTokenMap = {
    sol: lamportsToColl(Number.parseInt(pendingGains.sol.toString()), "SOL"),
    eth: lamportsToColl(Number.parseInt(pendingGains.eth.toString()), "ETH"),
    btc: lamportsToColl(Number.parseInt(pendingGains.btc.toString()), "BTC"),
    ftt: lamportsToColl(Number.parseInt(pendingGains.ftt.toString()), "FTT"),
    ray: lamportsToColl(Number.parseInt(pendingGains.ray.toString()), "RAY"),
    srm: lamportsToColl(Number.parseInt(pendingGains.srm.toString()), "SRM"),
    hbb: Number.parseInt(pendingGains.hbb.toString()) / HBB_DECIMALS,
  };

  const compoundedUsdDeposit = getCompoundedUsdDeposit(
    stabilityPoolState,
    stabilityProviderState
  );

  return [smallPendingGains, compoundedUsdDeposit];

}

function getPendingGains(
  stabilityProviderState: StabilityProviderState,
  epochToScaleToSum: TokenMapBig[][]
): TokenMapBig {

  const oldPendingGain = stabilityProviderState.pendingGainsPerUser;
  const oldPendingGainBig: TokenMapBig = {
    sol: BigInt(oldPendingGain.sol),
    eth: BigInt(oldPendingGain.eth),
    btc: BigInt(oldPendingGain.btc),
    ftt: BigInt(oldPendingGain.ftt),
    ray: BigInt(oldPendingGain.ray),
    srm: BigInt(oldPendingGain.srm),
    hbb: BigInt(oldPendingGain.hbb),
  }

  const newPendingGains = getDepositorPendingGain(stabilityProviderState, epochToScaleToSum);

  return add(oldPendingGainBig, newPendingGains);
}

function getDepositorPendingGain(
  stabilityProviderState: StabilityProviderState,
  epochToScaleToSum: EpochToScaleToSum
): TokenMapBig {
  const initialDeposit = stabilityProviderState.depositedStablecoin;
  if (initialDeposit === 0) {
    return {
      sol: BigInt(0),
      eth: BigInt(0),
      btc: BigInt(0),
      srm: BigInt(0),
      ray: BigInt(0),
      ftt: BigInt(0),
      hbb: BigInt(0),
    }
  }
  const depositSnapshot = stabilityProviderState.userDepositSnapshot;

  const epochSnapshot = depositSnapshot.epoch;
  const scaleSnapshot = depositSnapshot.scale;

  // TODO, take this into account
  const sSnapshot = depositSnapshot.sum;
  const pSnapshot = depositSnapshot.product;

  const sSnapshotBig: TokenMapBig = {
    sol: BigInt(sSnapshot.sol),
    eth: BigInt(sSnapshot.eth),
    btc: BigInt(sSnapshot.btc),
    srm: BigInt(sSnapshot.srm),
    ray: BigInt(sSnapshot.ray),
    ftt: BigInt(sSnapshot.ftt),
    hbb: BigInt(sSnapshot.hbb),
  };

  const firstPortion = sub(getSum(epochToScaleToSum, epochSnapshot, scaleSnapshot), sSnapshotBig);
  const secondPortion = div(getSum(epochToScaleToSum, epochSnapshot, scaleSnapshot + 1), SCALE_FACTOR);

  const res = div(div(mul(add(firstPortion, secondPortion), initialDeposit), pSnapshot), DECIMAL_FACTOR);

  return res

}

function getCompoundedUsdDeposit(
  stabilityPoolState: StabilityPoolState,
  stabilityProviderState: StabilityProviderState
) {

  if (stabilityProviderState.depositedStablecoin === 0 || stabilityProviderState.userDepositSnapshot.enabled === false) {
    return 0;
  }
  if (stabilityProviderState.userDepositSnapshot.epoch < stabilityPoolState.currentEpoch) {
    return 0;
  }
  const scaleDiff = stabilityPoolState.currentScale - stabilityProviderState.userDepositSnapshot.scale;
  if (scaleDiff === 0) {
    return stabilityProviderState.depositedStablecoin *
      stabilityPoolState.p /
      stabilityProviderState.userDepositSnapshot.product;
  }
  return stabilityProviderState.depositedStablecoin *
    stabilityPoolState.p /
    stabilityProviderState.userDepositSnapshot.product /
    SCALE_FACTOR;



}

function getSum(
  epochToScaletoSum: EpochToScaleToSum,
  epoch: number,
  scale: number): TokenMapBig {
  if (epoch < epochToScaletoSum.length) {
    if (scale < epochToScaletoSum[epoch].length) {
      return epochToScaletoSum[epoch][scale];
    }
  }

  return {
    sol: BigInt(0),
    eth: BigInt(0),
    btc: BigInt(0),
    srm: BigInt(0),
    ray: BigInt(0),
    ftt: BigInt(0),
    hbb: BigInt(0),
  }
}

function add(left: TokenMapBig, right: TokenMapBig): TokenMapBig {
  return {
    sol: left.sol.valueOf() + right.sol.valueOf(),
    eth: left.eth.valueOf() + right.eth.valueOf(),
    btc: left.btc.valueOf() + right.btc.valueOf(),
    srm: left.srm.valueOf() + right.srm.valueOf(),
    ray: left.ray.valueOf() + right.ray.valueOf(),
    ftt: left.ftt.valueOf() + right.ftt.valueOf(),
    hbb: left.hbb.valueOf() + right.hbb.valueOf(),
  }
}

function sub(left: TokenMapBig, right: TokenMapBig): TokenMapBig {
  return {
    sol: left.sol.valueOf() - right.sol.valueOf(),
    eth: left.eth.valueOf() - right.eth.valueOf(),
    btc: left.btc.valueOf() - right.btc.valueOf(),
    srm: left.srm.valueOf() - right.srm.valueOf(),
    ray: left.ray.valueOf() - right.ray.valueOf(),
    ftt: left.ftt.valueOf() - right.ftt.valueOf(),
    hbb: left.hbb.valueOf() - right.hbb.valueOf(),
  }
}

function mul(left: TokenMapBig, right: number): TokenMapBig {
  return {
    sol: left.sol.valueOf() * BigInt(right).valueOf(),
    eth: left.eth.valueOf() * BigInt(right).valueOf(),
    btc: left.btc.valueOf() * BigInt(right).valueOf(),
    srm: left.srm.valueOf() * BigInt(right).valueOf(),
    ray: left.ray.valueOf() * BigInt(right).valueOf(),
    ftt: left.ftt.valueOf() * BigInt(right).valueOf(),
    hbb: left.hbb.valueOf() * BigInt(right).valueOf(),
  }
}

function div(left: TokenMapBig, right: number): TokenMapBig {
  return {
    sol: left.sol.valueOf() / BigInt(right).valueOf(),
    eth: left.eth.valueOf() / BigInt(right).valueOf(),
    btc: left.btc.valueOf() / BigInt(right).valueOf(),
    srm: left.srm.valueOf() / BigInt(right).valueOf(),
    ray: left.ray.valueOf() / BigInt(right).valueOf(),
    ftt: left.ftt.valueOf() / BigInt(right).valueOf(),
    hbb: left.hbb.valueOf() / BigInt(right).valueOf(),
  }
}

export function deserializeEpoch(data: any[]): TokenMapBig[][] {
  const hmap = [];
  const numEpochs = BigInt(data[1] as number);
  let currentCursor = 1;
  for (let i = 0; i < numEpochs; i++) {
    const scale = [];
    currentCursor += 1;
    const scaleLength = data[currentCursor] as number;
    for (let j = 0; j < scaleLength; j++) {
      const tokenMap: TokenMapBig = {
        sol: BigInt(data[currentCursor + 1]),
        eth: BigInt(data[currentCursor + 2]),
        btc: BigInt(data[currentCursor + 3]),
        srm: BigInt(data[currentCursor + 4]),
        ray: BigInt(data[currentCursor + 5]),
        ftt: BigInt(data[currentCursor + 6]),
        hbb: BigInt(data[currentCursor + 7]),
      }
      scale.push(tokenMap);
      currentCursor += 7;
    }

    hmap.push(scale);
  }
  return hmap;
}
