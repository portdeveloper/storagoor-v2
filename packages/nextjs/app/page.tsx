"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { Interpretations, NetworkSelector } from "~~/components/storagoor";
import { StorageForm } from "~~/components/storagoor/StorageForm";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useStorageSlot } from "~~/hooks/storagoor/useStorageSlot";

const Home: NextPage = () => {
  const [contractAddress, setContractAddress] = useState("");
  const [slot, setSlot] = useState("");
  const [isMapping, setIsMapping] = useState(false);
  const [isDoubleMapping, setIsDoubleMapping] = useState(false);
  const [mappingKey, setMappingKey] = useState("");
  const [secondMappingKey, setSecondMappingKey] = useState("");

  const { targetNetwork } = useTargetNetwork();
  const { readStorageSlot, storageValue, isLoading, error } = useStorageSlot(targetNetwork);

  const handleSubmit = () => {
    readStorageSlot({
      contractAddress,
      slot,
      isMapping,
      isDoubleMapping,
      mappingKey,
      secondMappingKey,
    });
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
            <NetworkSelector />

            <StorageForm
              contractAddress={contractAddress}
              setContractAddress={setContractAddress}
              slot={slot}
              setSlot={setSlot}
              isMapping={isMapping}
              setIsMapping={setIsMapping}
              isDoubleMapping={isDoubleMapping}
              setIsDoubleMapping={setIsDoubleMapping}
              mappingKey={mappingKey}
              setMappingKey={setMappingKey}
              secondMappingKey={secondMappingKey}
              setSecondMappingKey={setSecondMappingKey}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            {error && <div className="p-4 mx-6 mb-6 text-error bg-error/10 rounded-lg">{error}</div>}

            {storageValue && <Interpretations storageValue={storageValue} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
