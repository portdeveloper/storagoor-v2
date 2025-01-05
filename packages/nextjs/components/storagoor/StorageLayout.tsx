import { useEffect, useState } from "react";
import { createPublicClient, hexToString, http, isAddress } from "viem";

interface StorageLayoutProps {
  contractAddress: string;
  targetNetwork: any;
}

interface StorageSlot {
  value: `0x${string}`;
  interpretations: {
    hex: string;
    decimal: string;
    string: string;
    address: string;
  };
}

export const StorageLayout = ({ contractAddress, targetNetwork }: StorageLayoutProps) => {
  const [storage, setStorage] = useState<StorageSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const interpretValue = (value: `0x${string}`) => {
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

  useEffect(() => {
    const fetchStorage = async () => {
      if (!contractAddress) return;
      
      setIsLoading(true);
      try {
        const publicClient = createPublicClient({
          chain: targetNetwork,
          transport: http(targetNetwork.rpcUrls.default.http[0]),
        });

        const storageData = [];
        let idx = 0;

        while (idx < 20) { // Limit to first 20 slots for performance
          const storageAtPosition = await publicClient.getStorageAt({
            address: contractAddress as `0x${string}`,
            slot: `0x${idx.toString(16)}`,
          });

          if (storageAtPosition) {
            storageData.push({
              value: storageAtPosition,
              interpretations: interpretValue(storageAtPosition),
            });
          }

          idx++;
        }
        setStorage(storageData);
      } catch (error) {
        console.error("Failed to fetch storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (contractAddress) {
      fetchStorage();
    }
  }, [contractAddress, targetNetwork]);

  if (!contractAddress) return null;

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Contract Storage Layout</h3>
      {isLoading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : storage.length > 0 ? (
        <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {storage.map((slot, i) => (
            <div key={i} className="collapse collapse-arrow bg-base-200">
              <input type="checkbox" /> 
              <div className="collapse-title text-sm font-medium">
                Storage Slot {i}
                <div className="text-xs opacity-60 font-mono truncate">{slot.value}</div>
              </div>
              <div className="collapse-content">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="opacity-60">Hex:</span>
                    <code className="block p-1.5 bg-base-300 rounded-lg overflow-x-auto font-mono mt-1">
                      {slot.interpretations.hex}
                    </code>
                  </div>
                  <div>
                    <span className="opacity-60">Decimal:</span>
                    <code className="block p-1.5 bg-base-300 rounded-lg overflow-x-auto font-mono mt-1">
                      {slot.interpretations.decimal}
                    </code>
                  </div>
                  <div>
                    <span className="opacity-60">String:</span>
                    <code className="block p-1.5 bg-base-300 rounded-lg overflow-x-auto font-mono mt-1">
                      {slot.interpretations.string}
                    </code>
                  </div>
                  <div>
                    <span className="opacity-60">Address:</span>
                    <code className="block p-1.5 bg-base-300 rounded-lg overflow-x-auto font-mono mt-1">
                      {slot.interpretations.address}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-base-content/70">No storage data found</div>
      )}
    </div>
  );
}; 