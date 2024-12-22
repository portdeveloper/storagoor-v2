"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { formatUnits, hexToString, isAddress, toHex, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { usePublicClient } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { useGlobalState } from "~~/services/store/store";

interface StorageValueFormats {
  hex: string;
  decimal: string;
  string: string;
  address: string;
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [contractAddress, setContractAddress] = useState("");
  const [slot, setSlot] = useState("");
  const [storageValue, setStorageValue] = useState<StorageValueFormats | null>(null);
  const { targetNetwork } = useTargetNetwork();
  const setTargetNetwork = useGlobalState(({ setTargetNetwork }) => setTargetNetwork);
  const publicClient = usePublicClient({ chainId: targetNetwork.id });

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
      if (!contractAddress || !slot || !publicClient || !isAddress(contractAddress)) return;

      const slotHex = toHex(+slot);

      const value = await publicClient.getStorageAt({
        address: contractAddress as `0x${string}`,
        slot: slotHex,
      });

      if (!value) {
        setStorageValue(null);
        return;
      }

      setStorageValue(formatStorageValue(value));
    } catch (error) {
      console.error("Error fetching storage slot:", error);
      setStorageValue(null);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Storage Slot Explorer</span>
          </h1>
          <div className="flex justify-center items-center mt-4 gap-2">
            <span className="font-medium">Network:</span>
            <select
              className="select select-bordered w-fit"
              value={targetNetwork.id}
              onChange={e => {
                const newNetwork = scaffoldConfig.targetNetworks.find(n => n.id === Number(e.target.value));
                if (newNetwork) setTargetNetwork(newNetwork);
              }}
            >
              {scaffoldConfig.targetNetworks.map(network => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-grow w-full mt-16 px-8">
          <div className="bg-base-100 border border-base-200 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex flex-col gap-4 p-6">
              <div>
                <label className="label">
                  <span className="label-text">Contract Address</span>
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered w-full"
                  value={contractAddress}
                  onChange={e => setContractAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Storage Slot</span>
                </label>
                <input
                  type="text"
                  placeholder="0x0"
                  className="input input-bordered w-full"
                  value={slot}
                  onChange={e => setSlot(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" onClick={fetchStorageSlot} disabled={!isAddress(contractAddress)}>
                Read Storage Slot
              </button>

              {storageValue && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Storage Value Interpretations:</h3>
                  <div className="grid gap-3 mt-2">
                    <div className="bg-base-200 rounded-lg p-4">
                      <span className="font-semibold">Hexadecimal:</span>
                      <pre className="overflow-x-auto mt-1 text-sm">{storageValue.hex}</pre>
                    </div>

                    <div className="bg-base-200 rounded-lg p-4">
                      <span className="font-semibold">Decimal:</span>
                      <pre className="overflow-x-auto mt-1 text-sm">{storageValue.decimal}</pre>
                    </div>

                    <div className="bg-base-200 rounded-lg p-4">
                      <span className="font-semibold">String:</span>
                      <pre className="overflow-x-auto mt-1 text-sm">{storageValue.string}</pre>
                    </div>

                    <div className="bg-base-200 rounded-lg p-4">
                      <span className="font-semibold">Address:</span>
                      <pre className="overflow-x-auto mt-1 text-sm">{storageValue.address}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
