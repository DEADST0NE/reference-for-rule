import { JsonRpcProvider } from "ethers";

export const ETH_PROVIDER = new JsonRpcProvider("https://eth.llamarpc.com", {
  chainId: 1,
  name: "eth",
});
