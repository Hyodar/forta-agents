# Solace Large Transfer Agent

## Description

This agent detects large transfers (>= 1M) of SOLACE.

## Supported Chains

- Ethereum

## Alerts

- HYO-SOLACE-1
  - Fired when a transaction emits a Transfer event with value greater than or equal to 1M SOLACE units
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata
    - from: transfer sender
    - to: transfer receiver
    - value: the amount of SOLACE transferred

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x76afc079102f9e6701c7b145885b7ee383127750b2cb1f021adda6ba6f41afed (10M SOLACE)
- 0x338fb30cf403eb179eeb4d1dc84b45ce30d56a4b5e6183a535747f0d8ad8172e (1.5M SOLACE)
- 0x71f1de15ee75f414c454aec3612433d0123e44ec5987515fc3566795cd840bc3 (1.5M SOLACE)
- 0x356e06d7efb2804e6d98bf44cff8b2fb3ffce74d836b75060bf3e3759abd41bb (1.152674M SOLACE)
- 0xd35910e38530a354adf0219e19cf0f22c2213047fbff8a69808c31d533e8999c (1.152674M SOLACE)
