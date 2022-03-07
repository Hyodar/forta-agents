
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

export const BOND_TELLER_CONTRACT_SYMBOL: Record<string, string> = {
    [BOND_TELLER_CONTRACTS[0]]: "DAI",
    [BOND_TELLER_CONTRACTS[1]]: "ETH",
    [BOND_TELLER_CONTRACTS[2]]: "USDC",
    [BOND_TELLER_CONTRACTS[3]]: "WBTC",
    [BOND_TELLER_CONTRACTS[4]]: "USDT",
    [BOND_TELLER_CONTRACTS[5]]: "SCP",
    [BOND_TELLER_CONTRACTS[6]]: "FRAX",
};

// https://docs.solace.fi/docs/dev-docs/Contracts/bonds/BondTellerErc20
export const DEPOSIT_SIGNATURE = "deposit(uint256,uint256,address,bool)";
export const DEPOSIT_SIGNED_SIGNATURE = "depositSigned(uint256,uint256,address,bool,uint256,uint8,bytes32,bytes32)";

// https://docs.solace.fi/docs/dev-docs/Contracts/bonds/BondTellerEth
export const DEPOSIT_ETH_SIGNATURE = "depositEth(uint256,address,bool)";
export const DEPOSIT_WETH_SIGNATURE = "depositWeth(uint256,uint256,address,bool)";
export const DEPOSIT_WETH_SIGNED_SIGNATURE = "depositWethSigned(uint256,uint256,address,bool,uint256,uint8,bytes32,bytes32)";

export const DEPOSIT_SIGNATURES = [
    DEPOSIT_SIGNATURE,
    DEPOSIT_SIGNED_SIGNATURE,
    DEPOSIT_ETH_SIGNATURE,
    DEPOSIT_WETH_SIGNATURE,
    DEPOSIT_WETH_SIGNED_SIGNATURE,
];

// ref. https://etherscan.io/address/0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40#code (at file 9/15: ERC20.sol)
// this is eligible to be a constant since the decimals() implementation is not overwritten in children
// contracts, as usual.
export const SOLACE_DECIMALS = 18;

export const AMOUNT_THRESHOLD = "1000000"; // 1M SOLACE
