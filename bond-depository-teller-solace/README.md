# Solace BondDepository Teller Agent

## Description

This agent detects whether a BondDepository Teller has been added or removed on Solace Finance.

## Supported Chains

- Ethereum

## Alerts

- HYO-SOLACE-7
  - Fired when a transaction adds a teller through the BondDepository contract.
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata:
    - teller: Address of the newly added Teller

- HYO-SOLACE-8
  - Fired when a transaction removes a teller through the BondDepository contract.
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata:
    - teller: Address of the removed Teller

## Test Data

- 0x438464e0017caeabd4f51951969480fbd4b2ab0a707ca4fc070f5fac53dac51c (TellerAdded)
- 0x849c2b5d4d2cb10775120c3936a385c5ccced6d65bda2dc6f9b74aa25a8ae5dc (TellerAdded)
