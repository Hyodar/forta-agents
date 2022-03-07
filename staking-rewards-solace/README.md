# Solace StakingRewards Governance Agent

## Description

This agent detects specific governance function calls and event logs in the Solace StakingRewards contracts.

Functions:
- `setRewards(uint256 rewardPerSecond_)`
- `setTimes(uint256 startTime_, uint256 endTime_)`

Events:
- `RewardsSet()`
- `FarmTimesSet()`

## Supported Chains

- Ethereum

## Alerts

Describe each of the type of alerts fired by this agent

- HYO-SOLACE-5
  - Fired when a transaction involves a call to a StakingRewards contract governance function
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata
    - args: Function call arguments in a JSON object string

- HYO-SOLACE-6
  - Fired when a transaction contains a StakingRewards contract governance event log
  - Severity is always set to "medium"
  - Type is always set to "info"

## Test Data

N/A
