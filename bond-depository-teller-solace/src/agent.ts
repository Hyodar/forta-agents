
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction, 
  TransactionEvent,
} from 'forta-agent'

import {
  STAKING_REWARDS_ADDRESS,
  TELLER_ADDED_ABI,
  TELLER_REMOVED_ABI,
} from './constants'

function provideHandleTransaction(
  listenAddress: string,
): HandleTransaction {
  const eventAbis = [
    TELLER_ADDED_ABI,
    TELLER_REMOVED_ABI,
  ];

  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const events = txEvent.filterLog(eventAbis, listenAddress);

    events.forEach(event => {
      if (event.name === "TellerAdded") {
        findings.push(Finding.fromObject({
          name: "BondDepository Teller Added",
          description: "A new teller was added",
          alertId: "HYO-SOLACE-7",
          protocol: "solace",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            teller: event.args.teller,
          },
        }));
      }
      else {
        findings.push(Finding.fromObject({
          name: "BondDepository Teller Removed",
          description: "An existing teller was removed",
          alertId: "HYO-SOLACE-8",
          protocol: "solace",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            teller: event.args.teller,
          },
        }));
      }
    });

    return findings;
  }
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(STAKING_REWARDS_ADDRESS),
}
