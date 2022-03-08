
import BigNumber from "bignumber.js";
import {
  Finding,
  HandleTransaction, 
  TransactionEvent, 
  FindingSeverity, 
  FindingType 
} from "forta-agent";

import {
  SOLACE_ADDRESS,
  SOLACE_DECIMALS,
  SOLACE_TRANSFER_EVENT
} from "./constants";

// 1M SOLACE
const TRANSFER_THRESHOLD = "1000000";

// 1 SOLACE unit in decimals
const SOLACE_UNIT = new BigNumber(`1e+${SOLACE_DECIMALS}`);

// set SOLACE decimal places to avoid precision loss
BigNumber.set({ DECIMAL_PLACES: SOLACE_DECIMALS });

/**
 * Creates a transaction handler that listens to SOLACE transfers which value
 * is greater than or equal to that of `transferThreshold`.
 * @param {string} transferThreshold - Threshold that determines whether a
 *  transaction is large or not, represented in SOLACE units.
 * @returns {HandleTransaction} Transaction handler.
 */
function provideHandleTransaction(
  transferThreshold: string,
  listenAddress: string,
): HandleTransaction {
  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const transferEvents = txEvent.filterLog(SOLACE_TRANSFER_EVENT, listenAddress);

    transferEvents.forEach(transferEvent => {
      const valueInDecimals = new BigNumber(transferEvent.args.value.toString());
      const valueInUnits = valueInDecimals.dividedBy(SOLACE_UNIT);

      if (valueInUnits.isGreaterThanOrEqualTo(transferThreshold)) {
        findings.push(
          Finding.fromObject({
            name: "Large SOLACE transfer",
            description: `${valueInUnits} SOLACE transferred`,
            alertId: "HYO-SOLACE-1",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            protocol: "solace",
            metadata: {
              from: transferEvent.args.from,
              to: transferEvent.args.to,
              value: valueInDecimals.toString(10),
            }
          })
        );
      }
    });

    return findings
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(TRANSFER_THRESHOLD, SOLACE_ADDRESS),
};
