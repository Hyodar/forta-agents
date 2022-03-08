
// https://docs.solace.fi/docs/dev-docs/contract%20addresses/Ethereum
export const BOND_TELLER_CONTRACTS: string[] = [
    "0x501ACe677634Fd09A876E88126076933b686967a", // DAI
    "0x501ACe95141F3eB59970dD64af0405f6056FB5d8", // ETH
    "0x501ACE7E977e06A3Cb55f9c28D5654C9d74d5cA9", // USDC
    "0x501aCEF0d0c73BD103337e6E9Fd49d58c426dC27", // WBTC
    "0x501ACe5CeEc693Df03198755ee80d4CE0b5c55fE", // USDT
    "0x501ACe00FD8e5dB7C3be5e6D254ba4995e1B45b7", // SCP
    "0x501aCef4F8397413C33B13cB39670aD2f17BfE62", // FRAX
].map(el => el.toLowerCase());

export const BOND_TELLER_FUNCTIONS: string[] = [
    "function pause()",
    "function unpause()",
    "function setTerms(tuple(uint256 startPrice, uint256 minimumPrice, uint256 maxPayout, uint128 priceAdjNum, uint128 priceAdjDenom, uint256 capacity, bool capacityIsPayout, uint40 startTime, uint40 endTime, uint40 globalVestingTerm, uint40 halfLife))",
    "function setFees(uint256 protocolFee)",
    "function setAddresses(address solace_, address xsLocker_, address pool_, address dao_, address principal_, bool isPermittable_, address bondDepo_)",
];

export const BOND_TELLER_FUNCTION_SIGNATURES: Record<string, string> = {
    "pause": "pause()",
    "unpause": "unpause()",
    "setTerms": "setTerms((uint256,uint256,uint256,uint128,uint128,uint256,bool,uint40,uint40,uint40,uint40))",
    "setFees": "setFees(uint256)",
    "setAddresses": "setAddresses(address,address,address,address,address,bool,address)",
};

export const BOND_TELLER_EVENTS: string[] = [
    "event Paused()",
    "event Unpaused()",
    "event TermsSet()",
    "event FeesSet()",
    "event AddressesSet()",
];

export const BOND_TELLER_EVENT_SIGNATURES: Record<string, string> = {
    "Paused": "Paused()",
    "Unpaused": "Unpaused()",
    "TermsSet": "TermsSet()",
    "FeesSet": "FeesSet()",
    "AddressesSet": "AddressesSet()",
};

export const BOND_TELLER_EVENT_DESCRIPTIONS: Record<string, string> = {
    "Paused": "Deposits paused",
    "Unpaused": "Deposits resumed",
    "TermsSet": "Terms changed",
    "FeesSet": "Fees changed",
    "AddressesSet": "Addresses changed",
};
