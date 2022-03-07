
import {
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction
} from "forta-agent";
import {
  createAddress,
  encodeEventSignature,
  encodeFunctionSignature,
  encodeParameters,
  TestTransactionEvent,
} from "forta-agent-tools";
import agent from "./agent";

import {
  FARM_TIMES_SET_SIGNATURE,
  REWARDS_SET_SIGNATURE,
  SET_REWARDS_SIGNATURE,
  SET_TIMES_SIGNATURE,
  STAKING_REWARDS_ADDRESS,
} from "./constants";

describe("stakingrewards governance solace agent", () => {
  let handleTransaction: HandleTransaction;
  const listenAddress = STAKING_REWARDS_ADDRESS;

  const encodeFunctionInput = (
    functionSignature: string,
    types: string[],
    values: string[],
  ): string => {
    const encodedSignature = encodeFunctionSignature(functionSignature);
    const encodedParams = encodeParameters(types, values);
    return `${encodedSignature}${encodedParams.slice(2)}`;
  };

  beforeAll(() => {
    handleTransaction = agent.provideHandleTransaction(listenAddress);
  });

  describe("handleTransaction", () => {
    it("returns empty findings if there are no calls or events", async () => {
      const tx = new TestTransactionEvent();

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if there are no monitored calls or events", async () => {
      const tx = new TestTransactionEvent();

      tx.addTraces({
        to: "0x1",
        from: "0x0",
        input: encodeFunctionSignature("someFunction()"),
      });

      tx.addEventLog(encodeEventSignature("SomeEvent()"), "0x2", "0x");

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns empty findings if functions and events are not sent from the listen address", async () => {
      const tx = new TestTransactionEvent();
      
      tx.addTraces({
        to: "0x1",
        from: "0x0",
        input: encodeFunctionInput(
          SET_REWARDS_SIGNATURE,
          ["uint256"],
          ["0"],
        ),
      });

      tx.addTraces({
        to: "0x1",
        from: "0x0",
        input: encodeFunctionInput(
          SET_TIMES_SIGNATURE,
          ["uint256", "uint256"],
          ["0", "0"],
        ),
      });

      tx.addEventLog(
        REWARDS_SET_SIGNATURE,
        "0x0",
        encodeParameters(["uint256"], ["0"])
      );

      tx.addEventLog(
        FARM_TIMES_SET_SIGNATURE,
        "0x0",
        encodeParameters(["uint256", "uint256"], ["0", "0"])
      );

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns findings if functions and events are related to the listen address", async () => {
      const tx = new TestTransactionEvent();
      
      tx.addTraces({
        to: listenAddress,
        from: "0x0",
        input: encodeFunctionInput(
          SET_REWARDS_SIGNATURE,
          ["uint256"],
          ["0"],
        ),
      });

      tx.addTraces({
        to: listenAddress,
        from: "0x0",
        input: encodeFunctionInput(
          SET_TIMES_SIGNATURE,
          ["uint256", "uint256"],
          ["1", "2"],
        ),
      });

      tx.addEventLog(
        REWARDS_SET_SIGNATURE,
        listenAddress,
        encodeParameters(["uint256"], ["3"])
      );

      tx.addEventLog(
        FARM_TIMES_SET_SIGNATURE,
        listenAddress,
        encodeParameters(["uint256", "uint256"], ["4", "5"])
      );

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "StakingRewards governance function call",
          description: `Governance function called: setRewards`,
          alertId: "HYO-SOLACE-5",
          protocol: "solace",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            from: createAddress("0x0"),
            args: JSON.stringify({ "rewardPerSecond_": "0" }),
          },
        }),
        Finding.fromObject({
          name: "StakingRewards governance function call",
          description: `Governance function called: setTimes`,
          alertId: "HYO-SOLACE-5",
          protocol: "solace",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            from: createAddress("0x0"),
            args: JSON.stringify({ "startTime_": "1", "endTime_": "2" }),
          },
        }),
        Finding.fromObject({
          name: "StakingRewards governance event",
          description: `Governance event: RewardsSet`,
          alertId: "HYO-SOLACE-6",
          protocol: "solace",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            args: JSON.stringify({ "rewardPerSecond": "3" }),
          },
        }),
        Finding.fromObject({
          name: "StakingRewards governance event",
          description: `Governance event: FarmTimesSet`,
          alertId: "HYO-SOLACE-6",
          protocol: "solace",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            args: JSON.stringify({ "startTime": "4", "endTime": "5" }),
          },
        }),
      ]);
    });
  });

});
