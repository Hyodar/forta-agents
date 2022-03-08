# Solace BondTeller Governance Agent

## Description

This agent detects specific governance function calls and event logs in the Solace BondTeller contracts.

Functions:
- `pause()`
- `unpause()`
- `setTerms()`
- `setFees()`
- `setAddresses()`

Events:
- `Paused()`
- `Unpaused()`
- `TermsSet()`
- `FeesSet()`
- `AddressesSet()`

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

- HYO-SOLACE-2
  - Fired when a transaction involves a call to a BondTeller contract governance function
  - Severity is always set to "low"
  - Type is always set to "info"

- HYO-SOLACE-3
  - Fired when a transaction contains a BondTeller contract governance event log
  - Severity is always set to "medium"
  - Type is always set to "info"

## Test Data

The agent behaviour can be verified with the following transactions:

- 0xa8a9c02b508b9d8ecc235a0920dc4ce14422fd5b872921d75d04c0612ead4f8e (setTerms call, TermsSet event)
- 0x11ec65822101cc60b44e8b5dded72e02349c4444ef274ece3f384dd3d5819273 (setFees call, FeesSet event)
- 0x1ca5e9796cfd50754d4ab34eca3d12aa8eb633a3beceed0b54d6d4b7f04b15fc (**no setAddresses call** (ref. BondTellerErc20.initialize), AddressSet event)
