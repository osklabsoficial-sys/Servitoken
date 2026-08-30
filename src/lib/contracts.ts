export const SERVI_ADDRESS = "0x07e6CB0876653B914Fc3805283a275b90bF7E443" as const;
export const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955" as const;
export const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" as const;
export const PANCAKE_ROUTER_V2 = "0x10ED43C718714eb63d5aA57B78B54704E256024E" as const;
export const SERVI_USDT_PAIR = "0xAd48f36F851cE4dcA85a07BB3D6a573a4c70ed18" as const;

export const ERC20_ABI = [
  { type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "allowance", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "approve", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable" },
  { type: "function", name: "decimals", inputs: [], outputs: [{ name: "", type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ name: "", type: "string" }], stateMutability: "view" },
  { type: "function", name: "totalSupply", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
] as const;

export const PANCAKE_ROUTER_ABI = [
  { type: "function", name: "getAmountsOut", inputs: [{ name: "amountIn", type: "uint256" }, { name: "path", type: "address[]" }], outputs: [{ name: "", type: "uint256[]" }], stateMutability: "view" },
  { type: "function", name: "swapExactTokensForTokens", inputs: [
    { name: "amountIn", type: "uint256" },
    { name: "amountOutMin", type: "uint256" },
    { name: "path", type: "address[]" },
    { name: "to", type: "address" },
    { name: "deadline", type: "uint256" },
  ], outputs: [{ name: "amounts", type: "uint256[]" }], stateMutability: "nonpayable" },
] as const;

export const PANCAKE_PAIR_ABI = [
  { type: "function", name: "getReserves", inputs: [], outputs: [{ name: "reserve0", type: "uint256" }, { name: "reserve1", type: "uint256" }, { name: "blockTimestampLast", type: "uint32" }], stateMutability: "view" },
  { type: "function", name: "token0", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "token1", inputs: [], outputs: [{ name: "", type: "address" }], stateMutability: "view" },
  { type: "function", name: "totalSupply", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
] as const;
