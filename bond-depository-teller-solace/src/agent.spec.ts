
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction
} from "forta-agent";
import {
  encodeEventSignature,
  encodeParameter,
  createAddress,
  TestTransactionEvent,
} from "forta-agent-tools";

import agent from "./agent";

import {
  STAKING_REWARDS_ADDRESS,
  TELLER_ADDED_SIGNATURE,
  TELLER_REMOVED_SIGNATURE,
} from "./constants";

describe("stakingrewards governance solace agent", () => {
  let handleTransaction: HandleTransaction;
  const listenAddress = STAKING_REWARDS_ADDRESS;

  beforeAll(() => {
    handleTransaction = agent.provideHandleTransaction(listenAddress);
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no events", async () => {
      const tx = new TestTransactionEvent();

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if there are no monitored events", async () => {
      const tx = new TestTransactionEvent();

      tx.addEventLog(encodeEventSignature("SomeEvent()"), "0x2", "0x");

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if events are not sent from the listen address", async () => {
      const tx = new TestTransactionEvent();

      tx.addEventLog(TELLER_ADDED_SIGNATURE, "0x0", "0x", encodeParameter("address", createAddress("0xF00D")));
      tx.addEventLog(TELLER_REMOVED_SIGNATURE, "0x0", "0x", encodeParameter("address", createAddress("0xbEEF")));

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns findings if events are related to the listen address", async () => {
      const tx = new TestTransactionEvent();

      tx.addEventLog(TELLER_ADDED_SIGNATURE, listenAddress, "0x", encodeParameter("address", createAddress("0xF00D")));
      tx.addEventLog(TELLER_REMOVED_SIGNATURE, listenAddress, "0x", encodeParameter("address", createAddress("0xbEEF")));

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "BondDepository Teller Added",
          description: "A new teller was added",
          alertId: "HYO-SOLACE-7",
          protocol: "solace",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            teller: createAddress("0xF00D"),
          },
        }),
        Finding.fromObject({
          name: "BondDepository Teller Removed",
          description: "An existing teller was removed",
          alertId: "HYO-SOLACE-8",
          protocol: "solace",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            teller: createAddress("0xbEEF"),
          },
        }),
      ]);
    });
  });

});
