# StellarGigCounter Soroban Contract

This folder contains the Rust smart contract required for Level 2 (Yellow Belt).

## Prerequisites
1. [Rust](https://rustup.rs/) installed.
2. Add the wasm32 target:
```bash
rustup target add wasm32-unknown-unknown
```
3. Install Stellar CLI (Soroban CLI):
```bash
cargo install --locked stellar-cli --features opt
```

## How to Build

Run this command inside this `stellar_gig_counter` directory:
```bash
cargo build --target wasm32-unknown-unknown --release
```

This will output a `.wasm` file at `../../target/wasm32-unknown-unknown/release/stellar_gig_counter.wasm`.

## How to Deploy to Testnet

1. Generate a testnet identity (if you don't have one):
```bash
stellar keys generate alice --network testnet
```

2. Deploy the contract:
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_gig_counter.wasm \
  --source alice \
  --network testnet
```

This will return your **Contract ID** (e.g. `C...`). 
Save this ID and paste it into your Frontend `.env` or configuration file!

## How to Interact (CLI)

Increment the counter:
```bash
stellar contract invoke --id <YOUR_CONTRACT_ID> --source alice --network testnet -- increment
```

Get the current count:
```bash
stellar contract invoke --id <YOUR_CONTRACT_ID> --source alice --network testnet -- get_count
```
