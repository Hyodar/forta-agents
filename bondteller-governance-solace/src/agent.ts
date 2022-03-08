
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction, 
  TransactionEvent,
} from "forta-agent";

import {
  BOND_TELLER_CONTRACTS,
  BOND_TELLER_EVENTS,
  BOND_TELLER_EVENT_DESCRIPTIONS,
  BOND_TELLER_FUNCTIONS,
} from "./constants";

/**
 * Creates a transaction handler that listens to specific governance function calls
 * and events in the SOLACE BondTeller contracts indicated by `listenAddresses`.
 * @param {string} listenAddresses - Addresses to detect function calls and events.
 * @returns {HandleTransaction} Transaction handler.
 */
function provideHandleTransaction(
  listenAddresses: string[],
): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const events = listenAddresses.map(listenAddress => {
      return txEvent.filterLog(BOND_TELLER_EVENTS, listenAddress);
    }).flat();
    const functions = listenAddresses.map(listenAddress => {
      return txEvent.filterFunction(BOND_TELLER_FUNCTIONS, listenAddress);
    }).flat();

    functions.forEach(functionCall => {
      findings.push(
        Finding.fromObject({
          name: "BondTeller governance function call",
          description: `${functionCall.name}() called`,
          alertId: "HYO-SOLACE-2",
          protocol: "solace",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
        })
      )
    });

    events.forEach(event => {
      findings.push(
        Finding.fromObject({
          name: "BondTeller governance event",
          description: `${event.name}: ${BOND_TELLER_EVENT_DESCRIPTIONS[event.name]}`,
          alertId: "HYO-SOLACE-3",
          protocol: "solace",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
        })
      )
    });

    return findings;
  }
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(BOND_TELLER_CONTRACTS),
}
