# Solace BondTeller Large Deposit Agent

## Description

This agent detects large deposits (>= 1M SOLACE) in Solace Finance's BondTeller contracts.

This is done by detecting calls to `deposit()` and `depositSigned()` and getting the payout value from the call output.

Duplicate findings are not generated if one contract acts as another's proxy.

BondTeller addresses (ETH):
- DAI: `0x501ACe677634Fd09A876E88126076933b686967a`
- ETH: `0x501ACe95141F3eB59970dD64af0405f6056FB5d8`
- USDC: `0x501ACE7E977e06A3Cb55f9c28D5654C9d74d5cA9`
- WBTC: `0x501aCEF0d0c73BD103337e6E9Fd49d58c426dC27`
- USDT: `0x501ACe5CeEc693Df03198755ee80d4CE0b5c55fE`
- SCP: `0x501ACe00FD8e5dB7C3be5e6D254ba4995e1B45b7`
- FRAX: `0x501aCef4F8397413C33B13cB39670aD2f17BfE62`

## Supported Chains

- Ethereum

## Alerts

- HYO-SOLACE-4
  - Fired when a transaction makes a BondTeller deposit that mints >= 1M SOLACE.
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata
    - from: function caller
    - contractAddress: BondTeller contract address
    - bondToken: BondTeller token name
    - payout: amount minted

## Test Data

N/A
