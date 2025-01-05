import { StorageValueFormats } from "~~/hooks/storagoor/useStorageSlot";

interface StorageValueCardProps {
  title: string;
  value: string;
}

const StorageValueCard = ({ title, value }: StorageValueCardProps) => {
  return (
    <div className="card bg-base-200">
      <div className="card-body p-4">
        <h4 className="card-title text-sm mb-2">{title}</h4>
        <code className="block p-2 bg-base-300 rounded-lg overflow-x-auto font-mono text-sm">{value}</code>
      </div>
    </div>
  );
};

interface InterpretationsProps {
  storageValue: StorageValueFormats;
}

export const Interpretations = ({ storageValue }: InterpretationsProps) => {
  return (
    <div className="border-t border-base-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Storage Value Interpretations</h3>
        <div className="grid gap-4">
          <StorageValueCard title="Hexadecimal" value={storageValue.hex} />
          <StorageValueCard title="Decimal" value={storageValue.decimal} />
          <StorageValueCard title="String" value={storageValue.string} />
          <StorageValueCard title="Address" value={storageValue.address} />
        </div>
      </div>
    </div>
  );
};
