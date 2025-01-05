import { availableChains } from "../../utils/storagoor/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

export const NetworkSelector = () => {
  const { targetNetwork } = useTargetNetwork();
  const setTargetNetwork = useGlobalState(({ setTargetNetwork }) => setTargetNetwork);

  return (
    <div className="p-6 border-b border-base-300">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="font-semibold text-lg">Network</span>
        <select
          className="select select-bordered w-full sm:w-auto min-w-[200px]"
          value={targetNetwork.id}
          onChange={e => {
            const newNetwork = availableChains.find(n => n.id === Number(e.target.value));
            if (newNetwork) setTargetNetwork(newNetwork);
          }}
        >
          {availableChains.map(network => (
            <option key={network.id} value={network.id}>
              {network.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
