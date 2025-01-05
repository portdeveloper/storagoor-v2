import { isAddress } from "viem";
import { RocketLaunchIcon } from "@heroicons/react/24/outline";

interface StorageFormProps {
  contractAddress: string;
  setContractAddress: (value: string) => void;
  slot: string;
  setSlot: (value: string) => void;
  isMapping: boolean;
  setIsMapping: (value: boolean) => void;
  isDoubleMapping: boolean;
  setIsDoubleMapping: (value: boolean) => void;
  mappingKey: string;
  setMappingKey: (value: string) => void;
  secondMappingKey: string;
  setSecondMappingKey: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const StorageForm = ({
  contractAddress,
  setContractAddress,
  slot,
  setSlot,
  isMapping,
  setIsMapping,
  isDoubleMapping,
  setIsDoubleMapping,
  mappingKey,
  setMappingKey,
  secondMappingKey,
  setSecondMappingKey,
  onSubmit,
  isLoading,
}: StorageFormProps) => {
  return (
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
        onClick={onSubmit}
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
  );
};
