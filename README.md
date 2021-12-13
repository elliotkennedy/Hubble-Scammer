# Hubble WebApp
Web UI for Hubble

# Quickstart

```bash
yarn
```

```bash
yarn start
```

# Environment Setup
1. Install wallet browser extension (Phantom)
2. (Optional) Install Redux Dev Tools browser extension
3. Install Node
4. Install NPM, Yarn

# Build Smart Contract (compiled for BPF)
Run the following from the program/ subdirectory:

```bash
$ cargo build-bpf
$ cargo test-bpf
```
# Directory structure

## src/actions

Setup here actions that will interact with Solana programs using sendTransaction function

## src/contexts

React context objects that are used propagate state of accounts across the application

## src/hooks

Generic react hooks to interact with token program:
* useUserBalance - query for balance of any user token by mint, returns:
    - balance
    - balanceLamports
    - balanceInUSD
* useUserTotalBalance - aggregates user balance across all token accounts and returns value in USD
    - balanceInUSD
* useAccountByMint
* useTokenName
* useUserAccounts

## TODO
- when changing env -> it doesn't refetch data
- if deposit successful -> go to vaults page & open given vault