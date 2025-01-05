import { useState } from "react";
import { concat, createPublicClient, hexToString, http, isAddress, keccak256, pad, toHex } from "viem";
import { Chain } from "viem/chains";

export interface StorageValueFormats {
  hex: string;
  decimal: string;
  string: string;
  address: string;
}

interface StorageSlotParams {
  contractAddress: string;
  slot: string;
  isMapping: boolean;
  isDoubleMapping: boolean;
  mappingKey: string;
  secondMappingKey: string;
}

export const useStorageSlot = (chain: Chain) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageValue, setStorageValue] = useState<StorageValueFormats | null>(null);

  const formatStorageValue = (value: `0x${string}`): StorageValueFormats => {
    const bigIntValue = BigInt(value);
    let stringValue = "";

    try {
      stringValue = hexToString(value, { size: 32 });
      stringValue = stringValue.replace(/[^\x20-\x7E]/g, "");
      if (!stringValue.length) stringValue = "Not a valid UTF-8 string";
    } catch {
      stringValue = "Not a valid UTF-8 string";
    }

    return {
      hex: value,
      decimal: bigIntValue.toString(),
      string: stringValue,
      address: isAddress(value.slice(0, 42)) ? value.slice(0, 42) : "Not a valid address",
    };
  };

  const calculateStorageSlot = async ({
    contractAddress,
    slot,
    isMapping,
    isDoubleMapping,
    mappingKey,
    secondMappingKey,
  }: StorageSlotParams): Promise<`0x${string}`> => {
    if (!contractAddress || !slot || !isAddress(contractAddress)) {
      throw new Error("Invalid contract address or slot");
    }
    if (isMapping && !mappingKey) {
      throw new Error("Mapping key required when mapping mode is enabled");
    }
    if (isDoubleMapping && !secondMappingKey) {
      throw new Error("Second mapping key required when double mapping is enabled");
    }

    if (!isMapping) {
      return toHex(BigInt(slot), { size: 32 });
    }

    const mappingSlot = pad(toHex(BigInt(slot)), { size: 32 });
    const paddedKey = isAddress(mappingKey)
      ? pad(mappingKey as `0x${string}`, { size: 32 })
      : pad(toHex(BigInt(mappingKey)), { size: 32 });

    if (!isDoubleMapping) {
      return keccak256(concat([paddedKey, mappingSlot]));
    }

    const paddedSecondKey = isAddress(secondMappingKey)
      ? pad(secondMappingKey as `0x${string}`, { size: 32 })
      : pad(toHex(BigInt(secondMappingKey)), { size: 32 });

    const firstHash = keccak256(concat([paddedKey, mappingSlot]));
    return keccak256(concat([paddedSecondKey, firstHash]));
  };

  const readStorageSlot = async (params: StorageSlotParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const publicClient = createPublicClient({
        chain,
        transport: http(chain.rpcUrls.default.http[0]),
      });

      const finalSlot = await calculateStorageSlot(params);
      const value = await publicClient.getStorageAt({
        address: params.contractAddress as `0x${string}`,
        slot: finalSlot,
      });

      if (!value) {
        setStorageValue(null);
        throw new Error("No value found at storage slot");
      }

      setStorageValue(formatStorageValue(value));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setStorageValue(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    readStorageSlot,
    storageValue,
    isLoading,
    error,
    calculateStorageSlot, // Exposed for testing
  };
};
