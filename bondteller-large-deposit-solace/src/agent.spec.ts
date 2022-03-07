
import BigNumber from "bignumber.js";
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction
} from "forta-agent";
import {
  createAddress,
  encodeFunctionSignature,
  encodeParameters,
  TestTransactionEvent,
  TraceProps
} from "forta-agent-tools";
import agent from "./agent";

import {
  BOND_TELLER_CONTRACT_SYMBOL,
  DEPOSIT_ETH_SIGNATURE,
  DEPOSIT_SIGNATURE,
  DEPOSIT_SIGNED_SIGNATURE,
  DEPOSIT_WETH_SIGNATURE,
  DEPOSIT_WETH_SIGNED_SIGNATURE,
  SOLACE_DECIMALS
} from "./constants";

interface DepositTrace {
  type: "deposit"|"depositSigned"|"depositEth"|"depositWeth"|"depositWethSigned";
  from: string;
  to: string;
  payout: string;
  traceAddress: Array<number>;
}

describe("bondteller large deposit solace agent", () => {
  let handleTransaction: HandleTransaction;
  const listenAddresses = ["0xbeef", "0xf00d", "0x1", "0x2"];
  const amountThreshold = "1";

  /**
   * Creates a transaction event object and adds deposit traces.
   * @param {DepositTrace[]} deposits - Deposit calls to be added.
   * @returns {TransactionEvent} Mocked transaction event.
   */
  const createTestTransaction = (
    deposits: DepositTrace[],
  ): TestTransactionEvent => {
      const tx = new TestTransactionEvent();

      const traces: TraceProps[] = deposits.map(deposit => {
        let inputParams: string;
        let signature: string;

        if (deposit.type === "depositEth") {
          inputParams = encodeParameters(
            ["uint256", "address", "bool"],
            ["0", createAddress("0x0"), false],
          );
          signature = encodeFunctionSignature(DEPOSIT_ETH_SIGNATURE);
        }
        else if (deposit.type === "deposit" || deposit.type === "depositWeth") {
          inputParams = encodeParameters(
            ["uint256", "uint256", "address", "bool"],
            ["0", "0", createAddress("0x0"), false],
          );
          signature = encodeFunctionSignature(
            (deposit.type === "deposit")? DEPOSIT_SIGNATURE : DEPOSIT_WETH_SIGNATURE
          );
        }
        else {
          const zeroBytes32 = "0x".padEnd(66, "0");
          inputParams = encodeParameters(
            ["uint256", "uint256", "address", "bool", "uint256", "int8", "bytes32", "bytes32"],
            ["0", "0", createAddress("0x0"), false, "0", "0", zeroBytes32, zeroBytes32],
          );
          signature = encodeFunctionSignature(
            (deposit.type === "depositSigned")? DEPOSIT_SIGNED_SIGNATURE : DEPOSIT_WETH_SIGNED_SIGNATURE
          );
        }

        const input = `${signature}${inputParams.slice(2)}`;

        const output = encodeParameters(["uint256", "uint256"], [deposit.payout, "0"]);

        return {
          from: deposit.from,
          to: deposit.to,
          input,
          output,
          value: "0",
        };
      });

      tx.addTraces(...traces);

      tx.traces.forEach((_, idx) => {
        tx.traces[idx].traceAddress = deposits[idx].traceAddress;
      });

      return tx;
  };

  /**
   * Converts solace units to decimals by multiplying the provided value by
   * the token's decimal places.
   * @param {BigNumber|string} solaceUnits - Value represented in SOLACE units.
   * @returns {BigNumber} Converted value in SOLACE decimals.
   */
   const toDecimals = (solaceUnits: BigNumber|string): BigNumber => {
    return new BigNumber(solaceUnits).multipliedBy(`1e+${SOLACE_DECIMALS}`);
  };

  beforeAll(() => {
    handleTransaction = agent.provideHandleTransaction(listenAddresses, amountThreshold);
    BigNumber.set({ DECIMAL_PLACES: SOLACE_DECIMALS });
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no traces", async () => {
      const tx = createTestTransaction([]);

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if there are no deposit calls", async () => {
      const tx = createTestTransaction([]);

      tx.addTraces({
        from: listenAddresses[0],
        to: listenAddresses[1],
        input: encodeFunctionSignature("someFunction()"),
        output: "",
        value: "0",
      });

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if the call is not to a bondcaller contract", async () => {
      const deposits: DepositTrace[] = [
        {
          type: "deposit",
          to: "0x0",
          from: "0x0",
          payout: toDecimals(amountThreshold).toString(10),
          traceAddress: [],
        }
      ];

      const tx = createTestTransaction(deposits);

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if the payout is less than the threshold", async () => {
      const deposits: DepositTrace[] = [
        {
          type: "deposit",
          to: listenAddresses[0],
          from: "0x0",
          payout: toDecimals(amountThreshold).minus(1).toString(10),
          traceAddress: [0],
        },
        {
          type: "depositSigned",
          to: listenAddresses[1],
          from: "0x0",
          payout: toDecimals(amountThreshold).minus(1).toString(10),
          traceAddress: [1],
        },
        {
          type: "depositEth",
          to: listenAddresses[1],
          from: "0x0",
          payout: toDecimals(amountThreshold).minus(1).toString(10),
          traceAddress: [1],
        },
        {
          type: "depositWeth",
          to: listenAddresses[1],
          from: "0x0",
          payout: toDecimals(amountThreshold).minus(1).toString(10),
          traceAddress: [1],
        },
        {
          type: "depositWethSigned",
          to: listenAddresses[1],
          from: "0x0",
          payout: toDecimals(amountThreshold).minus(1).toString(10),
          traceAddress: [1],
        },
      ];

      const tx = createTestTransaction(deposits);

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns findings there are deposits with payout greater than or equal to the threshold", async () => {
      const deposits: DepositTrace[] = [
        {
          type: "deposit",
          to: listenAddresses[0],
          from: "0x0",
          payout: toDecimals(amountThreshold).toString(10),
          traceAddress: [0],
        },
        {
          type: "depositSigned",
          to: listenAddresses[1],
          from: "0x0",
          payout: toDecimals(amountThreshold).plus(1).toString(10),
          traceAddress: [1],
        },
        {
          type: "depositEth",
          to: listenAddresses[1],
          from: "0x0",
          payout: toDecimals(amountThreshold).plus(1).toString(10),
          traceAddress: [1],
        },
        {
          type: "depositWeth",
          to: listenAddresses[1],
          from: "0x0",
          payout: toDecimals(amountThreshold).plus(1).toString(10),
          traceAddress: [1],
        },
        {
          type: "depositWethSigned",
          to: listenAddresses[1],
          from: "0x0",
          payout: toDecimals(amountThreshold).plus(1).toString(10),
          traceAddress: [1],
        },
      ];

      const tx = createTestTransaction(deposits);

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual(
        deposits.map(deposit => {
          return Finding.fromObject({
            name: "Large SOLACE bond deposit",
            description: `Bond minted >= ${amountThreshold} SOLACE`,
            alertId: "HYO-SOLACE-4",
            protocol: "solace",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            metadata: {
              from: deposit.from,
              contractAddress: deposit.to,
              bondToken: BOND_TELLER_CONTRACT_SYMBOL[deposit.to] || "unknown",
              payout: deposit.payout,
            },
          });
        })
      );
    });

    it("ignores subcalls from the original deposit calls", async () => {
      const deposits: DepositTrace[] = [
        // deposit[0] bondteller is a proxy of deposit[1] bondteller
        {
          type: "deposit",
          to: listenAddresses[0],
          from: "0x0",
          payout: toDecimals(amountThreshold).toString(10),
          traceAddress: [0],
        },
        {
          type: "deposit",
          to: listenAddresses[1],
          from: listenAddresses[0],
          payout: toDecimals(amountThreshold).toString(10),
          traceAddress: [0, 0],
        },

        // deposit[2] bondteller is a proxy of deposit[3] bondteller
        {
          type: "depositSigned",
          to: listenAddresses[3],
          from: "0x0",
          payout: toDecimals(amountThreshold).toString(10),
          traceAddress: [1],
        },
        {
          type: "depositSigned",
          to: listenAddresses[4],
          from: listenAddresses[3],
          payout: toDecimals(amountThreshold).toString(10),
          traceAddress: [1, 0],
        },
      ];

      const tx = createTestTransaction(deposits);

      const findings = await handleTransaction(tx);

      // should ignore the second and fourth traces
      expect(findings).toStrictEqual(
        [deposits[0], deposits[2]].map(deposit => {
          return Finding.fromObject({
            name: "Large SOLACE bond deposit",
            description: `Bond minted >= ${amountThreshold} SOLACE`,
            alertId: "HYO-SOLACE-4",
            protocol: "solace",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            metadata: {
              from: deposit.from,
              contractAddress: deposit.to,
              bondToken: BOND_TELLER_CONTRACT_SYMBOL[deposit.to] || "unknown",
              payout: deposit.payout,
            },
          });
        })
      );
    });

  });
});
