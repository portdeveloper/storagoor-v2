"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { concat, createPublicClient, hexToString, http, isAddress, keccak256, pad, toHex } from "viem";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";
import { Interpretations, NetworkSelector } from "~~/components/storagoor";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

interface StorageValueFormats {
  hex: string;
  decimal: string;
  string: string;
  address: string;
}

const Home: NextPage = () => {
  const [contractAddress, setContractAddress] = useState("");
  const [slot, setSlot] = useState("");
  const [isMapping, setIsMapping] = useState(false);
  const [isDoubleMapping, setIsDoubleMapping] = useState(false);
  const [mappingKey, setMappingKey] = useState("");
  const [secondMappingKey, setSecondMappingKey] = useState("");
  const [storageValue, setStorageValue] = useState<StorageValueFormats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { targetNetwork } = useTargetNetwork();

  const formatStorageValue = (value: `0x${string}`): StorageValueFormats => {
    // Convert to BigInt for decimal representation
    const bigIntValue = BigInt(value);

    // Try to interpret as string (skip if not valid UTF-8)
    let stringValue = "";
    try {
      stringValue = hexToString(value, { size: 32 });
      // Filter out non-printable characters
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

  const fetchStorageSlot = async () => {
    try {
      setIsLoading(true);
      if (!contractAddress || !slot || !isAddress(contractAddress)) return;
      if (isMapping && !mappingKey) return;

      const publicClient = createPublicClient({
        chain: targetNetwork,
        transport: http(targetNetwork.rpcUrls.default.http[0]),
      });

      let finalSlot: `0x${string}`;
      if (isMapping) {
        const mappingSlot = pad(toHex(BigInt(slot)), { size: 32 });
        let paddedKey: `0x${string}`;
        let paddedSecondKey: `0x${string}`;

        // Handle first key
        if (isAddress(mappingKey)) {
          paddedKey = pad(mappingKey as `0x${string}`, { size: 32 });
        } else {
          try {
            const keyBigInt = BigInt(mappingKey);
            paddedKey = pad(toHex(keyBigInt), { size: 32 });
          } catch {
            paddedKey = pad(mappingKey as `0x${string}`, { size: 32 });
          }
        }

        if (isDoubleMapping && secondMappingKey) {
          // Handle second key
          if (isAddress(secondMappingKey)) {
            paddedSecondKey = pad(secondMappingKey as `0x${string}`, { size: 32 });
          } else {
            try {
              const keyBigInt = BigInt(secondMappingKey);
              paddedSecondKey = pad(toHex(keyBigInt), { size: 32 });
            } catch {
              paddedSecondKey = pad(secondMappingKey as `0x${string}`, { size: 32 });
            }
          }
          // For double mapping: keccak256(key2 + keccak256(key1 + slot))
          const firstHash = keccak256(concat([paddedKey, mappingSlot]));
          finalSlot = keccak256(concat([paddedSecondKey, firstHash]));
        } else {
          // Single mapping: keccak256(key + slot)
          finalSlot = keccak256(concat([paddedKey, mappingSlot]));
        }
      } else {
        finalSlot = toHex(BigInt(slot), { size: 32 });
      }

      const value = await publicClient.getStorageAt({
        address: contractAddress as `0x${string}`,
        slot: finalSlot,
      });

      if (!value) {
        setStorageValue(null);
        return;
      }

      setStorageValue(formatStorageValue(value));
    } catch (error) {
      console.error("Error fetching storage slot:", error);
      setStorageValue(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-300">
      <div className="flex items-center flex-col pt-10 px-4 md:px-8 lg:px-12">
        <div className="w-full max-w-3xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-base-content">Storagoor v2</h1>
            <p className="text-base-content/70">Explore EVM Storage Slots with Ease</p>
          </div>

          {/* Main Card */}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300">
            {/* Network Selector */}
            <NetworkSelector />
            {/* Input Form */}
            <div className="p-6 space-y-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Contract Address</span>
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered w-full font-mono"
                  value={contractAddress}
                  onChange={e => setContractAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Storage Slot</span>
                </label>
                <input
                  type="text"
                  placeholder="0x0"
                  className="input input-bordered w-full font-mono"
                  value={slot}
                  onChange={e => setSlot(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-base-200">
                <span className="font-semibold px-2">Mapping Mode</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isMapping}
                  onChange={e => {
                    setIsMapping(e.target.checked);
                    if (!e.target.checked) {
                      setIsDoubleMapping(false);
                    }
                  }}
                />
              </div>

              {isMapping && (
                <>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-base-200">
                    <span className="font-semibold px-2">Double Mapping</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={isDoubleMapping}
                      onChange={e => setIsDoubleMapping(e.target.checked)}
                    />
                  </div>

                  <div className="animate-fadeIn">
                    <label className="label">
                      <span className="label-text font-semibold">First Mapping Key</span>
                      <span className="label-text-alt">address, number, or string</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Key value..."
                      className="input input-bordered w-full font-mono"
                      value={mappingKey}
                      onChange={e => setMappingKey(e.target.value)}
                    />
                  </div>

                  {isDoubleMapping && (
                    <div className="animate-fadeIn">
                      <label className="label">
                        <span className="label-text font-semibold">Second Mapping Key</span>
                        <span className="label-text-alt">address, number, or string</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Second key value..."
                        className="input input-bordered w-full font-mono"
                        value={secondMappingKey}
                        onChange={e => setSecondMappingKey(e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}

              <button
                className="btn btn-primary w-full"
                onClick={fetchStorageSlot}
                disabled={
                  !isAddress(contractAddress) ||
                  (isMapping && !mappingKey) ||
                  (isDoubleMapping && !secondMappingKey) ||
                  isLoading
                }
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Reading Storage...
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="h-5 w-5" />
                    Read Storage Slot
                  </>
                )}
              </button>
            </div>

            {/* Results Section */}
            {storageValue && <Interpretations storageValue={storageValue} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
