export const Interpretations = ({ storageValue }: { storageValue: any }) => {
  return (
    <div className="border-t border-base-300">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Storage Value Interpretations</h3>
        <div className="grid gap-4">
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="card-title text-sm mb-2">Hexadecimal</h4>
              <code className="block p-2 bg-base-300 rounded-lg overflow-x-auto font-mono text-sm">
                {storageValue.hex}
              </code>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="card-title text-sm mb-2">Decimal</h4>
              <code className="block p-2 bg-base-300 rounded-lg overflow-x-auto font-mono text-sm">
                {storageValue.decimal}
              </code>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="card-title text-sm mb-2">String</h4>
              <code className="block p-2 bg-base-300 rounded-lg overflow-x-auto font-mono text-sm">
                {storageValue.string}
              </code>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="card-title text-sm mb-2">Address</h4>
              <code className="block p-2 bg-base-300 rounded-lg overflow-x-auto font-mono text-sm">
                {storageValue.address}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
