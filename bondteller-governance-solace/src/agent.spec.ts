
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
  BOND_TELLER_CONTRACTS,
  BOND_TELLER_EVENT_DESCRIPTIONS,
  BOND_TELLER_EVENT_SIGNATURES,
  BOND_TELLER_FUNCTION_SIGNATURES,
} from "./constants";

describe("bondteller governance solace agent", () => {
  let handleTransaction: HandleTransaction;
  const listenAddresses = BOND_TELLER_CONTRACTS;

  const getNullInput = (
    functionName: string,
  ): string => {
    let params = "0x";
    if (functionName === "setFees") {
      params = encodeParameters(["uint256"], ["0"]);
    }
    else if (functionName === "setAddresses") {
      params = encodeParameters(
        ["address", "address", "address", "address", "address", "bool", "address"],
        [
          createAddress("0x0"),
          createAddress("0x0"),
          createAddress("0x0"),
          createAddress("0x0"),
          createAddress("0x0"),
          false,
          createAddress("0x0"),
        ],
      );
    }
    else {
      params = encodeParameters(
        [{
          "terms": {
            "startPrice": "uint256",
            "minimumPrice": "uint256",
            "maxPayout": "uint256",
            "priceAdjNum": "uint128",
            "priceAdjDenom": "uint128",
            "capacity": "uint256",
            "capacityIsPayout": "bool",
            "startTime": "uint40",
            "endTime": "uint40",
            "globalVestingTerm": "uint40",
            "halfLife": "uint40",
          }
        }],
        [{
          "startPrice": "0",
          "minimumPrice": "0",
          "maxPayout": "0",
          "priceAdjNum": "0",
          "priceAdjDenom": "0",
          "capacity": "0",
          "capacityIsPayout": false,
          "startTime": "0",
          "endTime": "0",
          "globalVestingTerm": "0",
          "halfLife": "0",
        }],
      );
    }

    const selector = encodeFunctionSignature(BOND_TELLER_FUNCTION_SIGNATURES[functionName]);
    
    return `${selector}${params.slice(2)}`;
  };

  beforeAll(() => {
    handleTransaction = agent.provideHandleTransaction(listenAddresses);
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

    it("returns empty findings if functions and events are not sent from one of listen addresses", async () => {
      const tx = new TestTransactionEvent();
      
      Object.keys(BOND_TELLER_FUNCTION_SIGNATURES)
        .forEach(functionName => {
          tx.addTraces({
            to: "0x1",
            from: "0x0",
            input: getNullInput(functionName),
          });
        });
      
      Object.values(BOND_TELLER_EVENT_SIGNATURES)
        .forEach(eventSignature => {
          tx.addEventLog(eventSignature, "0x0", "0x");
        });

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([]);
    });

    it("returns findings if functions and events are related to one of the listen addresses", async () => {
      const tx = new TestTransactionEvent();
      
      Object.keys(BOND_TELLER_FUNCTION_SIGNATURES)
        .forEach(functionName => {
          tx.addTraces({
            to: listenAddresses[0],
            from: "0x1",
            input: getNullInput(functionName),
          });
        });
      
      Object.values(BOND_TELLER_EVENT_SIGNATURES)
        .forEach(eventSignature => {
          tx.addEventLog(eventSignature, listenAddresses[0], "0x");
        });

      const findings = await handleTransaction(tx);

      expect(findings).toStrictEqual([
        ...Object.keys(BOND_TELLER_FUNCTION_SIGNATURES).map(functionName => {
          return Finding.fromObject({
            name: "BondTeller governance function call",
            description: `${functionName}() called`,
            alertId: "HYO-SOLACE-2",
            protocol: "solace",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
          })
        }),
        ...Object.keys(BOND_TELLER_EVENT_SIGNATURES).map(eventName => {
          return Finding.fromObject({
            name: "BondTeller governance event",
            description: `${eventName}: ${BOND_TELLER_EVENT_DESCRIPTIONS[eventName]}`,
            alertId: "HYO-SOLACE-3",
            protocol: "solace",
            severity: FindingSeverity.Medium,
            type: FindingType.Info,
          })
        }),
      ]);
    });
  });

});

