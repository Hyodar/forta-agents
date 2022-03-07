
import BigNumber from "bignumber.js";
import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
} from "forta-agent";
import {
  createAddress,
  encodeParameter,
  TestTransactionEvent,
} from "forta-agent-tools";

import agent from "./agent";
import {
  SOLACE_ADDRESS,
  SOLACE_DECIMALS,
  SOLACE_TRANSFER_EVENT_SIGNATURE
} from "./constants";

interface TransferEvent {
  from: string,
  to: string,
  value: string,
}

describe("large solace transfer agent", () => {
  let handleTransaction: HandleTransaction;
  const transferThreshold = "1000"; // SOLACE units
  const listenAddress = SOLACE_ADDRESS;

  /**
   * Creates a transaction event object and adds transfer events.
   * @param {string} tokenAddress - Token that's transferred.
   * @param {TransferEvent[]} transferEvents - Transfer event arguments
   *  to be added.
   * @returns {TransactionEvent} Mocked transaction event.
   */
  const createTestTransaction = (
    tokenAddress: string,
    transferEvents: TransferEvent[],
  ): TestTransactionEvent => {
    // instead of creating a jest mock filterLog, we can use forta-agent-tools
    // to encode a mock transaction with some events

    const tx = new TestTransactionEvent();

    transferEvents.forEach(event => {
      tx.addEventLog(
        SOLACE_TRANSFER_EVENT_SIGNATURE,
        tokenAddress,
        encodeParameter("uint256", event.value),
        encodeParameter("address", event.from),
        encodeParameter("address", event.to),
      );
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

  /**
   * Converts solace decimals to units by dividing the provided value by the
   * token's decimal places.
   * @param {BigNumber|string} solaceDecimals - Value represented in SOLACE
   *  decimals.
   * @returns {BigNumber} Converted value in SOLACE units.
   */
  const toUnits = (solaceDecimals: BigNumber|string): BigNumber => {
    return new BigNumber(solaceDecimals).dividedBy(`1e+${SOLACE_DECIMALS}`);
  };

  beforeAll(() => {
    handleTransaction = agent.provideHandleTransaction(transferThreshold, listenAddress);
    BigNumber.set({ DECIMAL_PLACES: SOLACE_DECIMALS });
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no events", async () => {
      const tx = createTestTransaction(listenAddress, []);

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if there are no transfer events", async () => {
      const tx = createTestTransaction(listenAddress, []);
      tx.addEventLog(
        "Approval(address,address,value)",
        listenAddress,
        encodeParameter("uint256", "0"),
        encodeParameter("address", createAddress("0x0")),
        encodeParameter("address", createAddress("0x0")),
      );

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    })

    it("returns empty findings if the emitting token address is not the expected", async () => {
      const tx = createTestTransaction(listenAddress, []);
      tx.addEventLog(
        SOLACE_TRANSFER_EVENT_SIGNATURE,
        "0x0",
        encodeParameter("uint256", toDecimals(transferThreshold).toString(10)),
        encodeParameter("address", createAddress("0xF00D")),
        encodeParameter("address", createAddress("0xbEEF")),
      );

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    })

    it("returns empty findings if no transfer value is greater or equal to the threshold", async () => {
      const immediateLowerValue = toDecimals(transferThreshold).minus("1");

      const tx = createTestTransaction(listenAddress, [
        {
          from: createAddress("0xF00D"),
          to: createAddress("0xbEEF"),
          value: immediateLowerValue.toString(10),
        },
      ]);

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    })

    it("returns findings if there are any large transfer events", async () => {
      const exactValue = toDecimals(transferThreshold);
      const immediateLowerValue = exactValue.minus("1");
      const immediateGreaterValue = exactValue.plus("1");

      const tx = createTestTransaction(listenAddress, [
        {
          from: createAddress("0xF00D"),
          to: createAddress("0xbEEF"),
          value: immediateLowerValue.toString(10),
        },
        {
          from: createAddress("0xF00D"),
          to: createAddress("0xbEEF"),
          value: exactValue.toString(10),
        },
        {
          from: createAddress("0xbEEF"),
          to: createAddress("0xF00D"),
          value: immediateGreaterValue.toString(10),
        },
      ]);

      const findings = await handleTransaction(tx);

      // shouldn't return any finding from the immediateLowerValue event
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Large SOLACE transfer",
          description: `Transfer value: ${toUnits(exactValue).toString(10)} SOLACE`,
          alertId: "HYO-SOLACE-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "solace",
          metadata: {
            from: createAddress("0xF00D"),
            to: createAddress("0xbEEF"),
            value: exactValue.toString(10),
          },
        }),
        Finding.fromObject({
          name: "Large SOLACE transfer",
          description: `Transfer value: ${toUnits(immediateGreaterValue).toString(10)} SOLACE`,
          alertId: "HYO-SOLACE-1",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: "solace",
          metadata: {
            from: createAddress("0xbEEF"),
            to: createAddress("0xF00D"),
            value: immediateGreaterValue.toString(10),
          },
        }),
      ]);
    });
  });
});
