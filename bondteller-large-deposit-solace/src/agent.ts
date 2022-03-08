
import BigNumber from "bignumber.js";
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  Trace,
  TransactionEvent,
} from "forta-agent";

import {
  decodeParameters,
  encodeFunctionSignature
} from "forta-agent-tools";

import {
  AMOUNT_THRESHOLD,
  BOND_TELLER_CONTRACTS,
  BOND_TELLER_CONTRACT_SYMBOL,
  DEPOSIT_SIGNATURES,
  SOLACE_DECIMALS,
} from "./constants";

function provideHandleTransaction(
  listenAddresses: string[],
  amountThreshold: string,
): HandleTransaction {
  BigNumber.set({ DECIMAL_PLACES: SOLACE_DECIMALS });

  const decimalThreshold = new BigNumber(amountThreshold).multipliedBy(new BigNumber(10).exponentiatedBy(SOLACE_DECIMALS));

  // faster filtering by avoiding an entire array lookup each time
  const shouldListenTo: Record<string, boolean|undefined> = {};
  listenAddresses.forEach(el => shouldListenTo[el] = true);

  const shouldListenSelector: Record<string, boolean|undefined> = {};
  DEPOSIT_SIGNATURES.forEach(el => shouldListenSelector[encodeFunctionSignature(el)] = true);

  const isValidDeposit = (trace: Trace): boolean => {
    const selector = trace.action.input.slice(0, 10);

    return !!shouldListenSelector[selector] && !!shouldListenTo[trace.action.to];
  };

  return async (txEvent: TransactionEvent): Promise<Finding[]> => {
    const findings: Finding[] = [];

    const deposits: Trace[] = [];
    const traces = txEvent.traces;

    // since the BondTeller contracts can be proxies and we are just interested
    // in the starting call to deposit(), we can skip each higher level deposit
    // subtraces, avoiding duplicate findings and unnecessary checks
    for (let i = 0; i < traces.length; i++) {
      const isDeposit = isValidDeposit(traces[i]);
      const reverted = !!traces[i].error;

      if (isDeposit) {
        if (!reverted) {
          deposits.push(traces[i]);
        }

        // call tree level is determined by the traceAddress length
        const level = traces[i].traceAddress.length;

        // skip subtrace subtree
        for (i = i + 1; i < traces.length; i++) {
          if (traces[i].traceAddress.length <= level) {
            i--;
            break;
          }
        }
      }
    }

    deposits.forEach(trace => {
      // since the deposit calls return the resulting payout, get this
      const [payout, _] = decodeParameters(["uint256", "uint256"], trace.result.output);

      if (new BigNumber(payout).isLessThan(decimalThreshold)) return;

      findings.push(Finding.fromObject({
        name: "Large SOLACE bond deposit",
        description: `Bond minted >= ${amountThreshold} SOLACE`,
        alertId: "HYO-SOLACE-4",
        protocol: "solace",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          from: trace.action.from,
          contractAddress: trace.action.to,
          bondToken: BOND_TELLER_CONTRACT_SYMBOL[trace.action.to] || "unknown",
          payout,
        },
      }));
    });
    
    return findings;
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(BOND_TELLER_CONTRACTS, AMOUNT_THRESHOLD),
};
