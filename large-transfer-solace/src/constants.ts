
// ref. https://etherscan.io/address/0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40#code (at file 7/15: IERC20.sol)
export const SOLACE_TRANSFER_EVENT = "event Transfer(address indexed from, address indexed to, uint256 value)";
export const SOLACE_TRANSFER_EVENT_SIGNATURE = "Transfer(address,address,uint256)";

// ref. https://docs.solace.fi/docs/dev-docs/contract%20addresses/Ethereum
export const SOLACE_ADDRESS = "0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40";

// ref. https://etherscan.io/address/0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40#code (at file 9/15: ERC20.sol)
// this is eligible to be a constant since the decimals() implementation is not overwritten in children
// contracts, as usual.
export const SOLACE_DECIMALS = 18;
