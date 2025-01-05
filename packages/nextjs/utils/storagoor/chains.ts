import { Chain } from "viem";
import * as chains from "viem/chains";

// Get all chains and remove duplicates based on chain ID
export const availableChains = Object.values(chains)
  .filter(chain => typeof chain.id === "number")
  .reduce((unique: Chain[], chain) => {
    const exists = unique.find(c => c.id === chain.id);
    if (!exists) {
      unique.push(chain as Chain);
    }
    return unique;
  }, [])
  .sort((a, b) => a.name.localeCompare(b.name)); 