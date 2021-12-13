import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { TokenInfo } from "@solana/spl-token-registry";
import { DECIMALS_BTC, DECIMALS_ETH, DECIMALS_FTT, DECIMALS_RAY, DECIMALS_SRM, SolanaToken, WAD, ZERO } from "../constants";

export type KnownTokenMap = Map<string, TokenInfo>;

export const ACCOUNT_BATCH_QUERY_SIZE = 99;

export const formatPriceNumber = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});

// shorten the checksummed version of the input address to have 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getTokenName(
  map: KnownTokenMap,
  mint?: string | PublicKey,
  shorten = true
): string {
  const mintAddress = typeof mint === "string" ? mint : mint?.toBase58();

  if (!mintAddress) {
    return "N/A";
  }

  const knownSymbol = map.get(mintAddress)?.symbol;
  if (knownSymbol) {
    return knownSymbol;
  }

  return shorten ? `${mintAddress.substring(0, 5)}...` : mintAddress;
}

export const STABLE_COINS = new Set(["USDC", "wUSDC", "USDT"]);

export function chunks<T>(array: T[], size: number): T[][] {
  return Array.apply<number, T[], T[][]>(
    0,
    new Array(Math.ceil(array.length / size))
  ).map((_, index) => array.slice(index * size, (index + 1) * size));
}

export function wadToLamports(amount?: BN): BN {
  return amount?.div(WAD) || ZERO;
}

const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

const abbreviateNumber = (number: number, precision: number) => {
  // eslint-disable-next-line no-bitwise
  const tier = (Math.log10(number) / 3) | 0;
  let scaled = number;
  const suffix = SI_SYMBOL[tier];
  if (tier !== 0) {
    const scale = 10 ** (tier * 3);
    scaled = number / scale;
  }

  return scaled.toFixed(precision) + suffix;
};

export const formatAmount = (
  val: number,
  precision = 6,
  abbr = true
) => (abbr ? abbreviateNumber(val, precision) : val.toFixed(precision));

export const formatUSD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const numberFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const isSmallNumber = (val: number) => {
  return val < 0.001 && val > 0;
};

export const formatNumber = {
  format: (val?: number, useSmall?: boolean) => {
    if (!val) {
      return 0;
    }
    if (useSmall && isSmallNumber(val)) {
      return 0.001;
    }

    return numberFormatter.format(val);
  },
};

export const feeFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 2,
  maximumFractionDigits: 9,
});

export const formatPct = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const FACTOR = 1_000_000.0;

export const u64ToDecimal = (n: number): number => {
  const n1 = n / FACTOR;
  return n1;
};

export const decimalToU64 = (n: number): number => {
  const n1 = n * FACTOR;
  const n2 = Math.trunc(n1);
  return n2;
};

export const getCollateralKeyForTicker = (ticker: SolanaToken): number => {
  switch (ticker) {
    case "SOL":
      return 0;
    case "ETH":
      return 1;
    case "BTC":
      return 2;
    case "SRM":
      return 3;
    case "RAY":
      return 4;
    case "FTT":
      return 5;
  }
};

export const zeroIfNaN = (value: any): number | any => {
  return Number.isNaN(value) ? 0 : value;
}

export const getAdminKeypair = (): Keypair => {
  const admin_: Uint8Array = Uint8Array.from([
    241, 101, 13, 165, 53, 150, 114, 216, 162, 246, 157, 94, 156, 209, 145, 37,
    186, 13, 219, 120, 66, 196, 128, 253, 177, 46, 0, 70, 68, 211, 238, 83, 155,
    17, 157, 105, 115, 161, 0, 60, 146, 250, 19, 171, 63, 222, 211, 135, 37, 102,
    222, 216, 142, 131, 67, 196, 185, 182, 202, 219, 55, 24, 135, 90
  ]);
  const admin = Keypair.fromSecretKey(admin_);
  return admin;
}

export function lamportsToColl(lamports: number | undefined, token: SolanaToken): number {
  let factor = LAMPORTS_PER_SOL;
  switch (token) {
    case "SOL": { factor = LAMPORTS_PER_SOL; break; }
    case "ETH": { factor = DECIMALS_ETH; break; }
    case "BTC": { factor = DECIMALS_BTC; break; }
    case "SRM": { factor = DECIMALS_SRM; break; }
    case "RAY": { factor = DECIMALS_RAY; break; }
    case "FTT": { factor = DECIMALS_FTT; break; }
  }

  if (lamports != null) {
    if (lamports === 0) {
      return 0;
    }
    return lamports / factor;
  }

  return -1;
}

export function collToLamports(amount: number, token: SolanaToken): number {
  let factor = LAMPORTS_PER_SOL;
  switch (token) {
    case "SOL": { factor = LAMPORTS_PER_SOL; break; }
    case "ETH": { factor = DECIMALS_ETH; break; }
    case "BTC": { factor = DECIMALS_BTC; break; }
    case "SRM": { factor = DECIMALS_SRM; break; }
    case "RAY": { factor = DECIMALS_RAY; break; }
    case "FTT": { factor = DECIMALS_FTT; break; }
  }

  return amount * factor;
}

export const isValidNumericInput = (value: string) => {
  return Number.isFinite(Number(value));
}
