"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { Interpretations, NetworkSelector } from "~~/components/storagoor";
import { StorageForm } from "~~/components/storagoor/StorageForm";
import { StorageLayout } from "~~/components/storagoor/StorageLayout";
import { Footer } from "~~/components/Footer";
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
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow bg-gradient-to-b from-base-200 to-base-300">
        <div className="flex items-start flex-col pt-10 px-4 md:px-8 lg:px-12">
          {/* Header Section */}
          <div className="text-center w-full mb-12">
            <h1 className="text-5xl font-bold mb-4 text-base-content">🔎Storagoor</h1>
            <p className="text-base-content/70">Explore EVM Storage Slots</p>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Main Content - Takes 2 columns */}
            <div className={`${!contractAddress ? "lg:col-start-2 lg:col-span-3" : "lg:col-span-2"}`}>
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

            {/* Storage Layout - Takes 3 columns */}
            <div className="lg:col-span-3">
              {contractAddress && (
                <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 sticky top-4">
                  <StorageLayout contractAddress={contractAddress} targetNetwork={targetNetwork} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
