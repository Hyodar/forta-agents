
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction, 
  TransactionEvent,
} from 'forta-agent'

import {
  EVENT_PARAMS,
  FARM_TIMES_SET_ABI,
  FUNCTION_PARAMS,
  REWARDS_SET_ABI,
  SET_REWARDS_ABI,
  SET_TIMES_ABI,
  STAKING_REWARDS_ADDRESS,
} from './constants'

function provideHandleTransaction(
  listenAddress: string,
): HandleTransaction {
  const functionAbis = [
    SET_REWARDS_ABI,
    SET_TIMES_ABI,
  ];

  const eventAbis = [
    REWARDS_SET_ABI,
    FARM_TIMES_SET_ABI,
  ];

  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const functions = txEvent.filterFunction(functionAbis, listenAddress);
    const events = txEvent.filterLog(eventAbis, listenAddress);

    functions.forEach(functionCall => {
      const functionParams = FUNCTION_PARAMS[functionCall.name];

      findings.push(Finding.fromObject({
        name: "StakingRewards governance function call",
        description: `Governance function called: ${functionCall.name}`,
        alertId: "HYO-SOLACE-5",
        protocol: "solace",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          from: txEvent.from,
          args: JSON.stringify(
            Object.fromEntries(functionParams.map(el => [el, functionCall.args[el].toString()]))
          ),
        },
      }));
    });

    events.forEach(event => {
      const eventParams = EVENT_PARAMS[event.name];

      findings.push(Finding.fromObject({
        name: "StakingRewards governance event",
        description: `Governance event: ${event.name}`,
        alertId: "HYO-SOLACE-6",
        protocol: "solace",
        severity: FindingSeverity.Medium,
        type: FindingType.Info,
        metadata: {
          args: JSON.stringify(
            Object.fromEntries(eventParams.map(el => [el, event.args[el].toString()]))
          ),
        },
      }));
    });

    return findings;
  }
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(STAKING_REWARDS_ADDRESS),
}
