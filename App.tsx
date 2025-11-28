import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppPhase, GeneratedApp } from './types';
import { generateAppConcept } from './services/geminiService';
import HeroSection from './components/HeroSection';
import GenerationTheater from './components/GenerationTheater';
import BuilderPreview from './components/BuilderPreview';
import Dashboard from './components/Dashboard';

// Default Demo App for "Enter Launchpad" flow
const DEMO_APP: GeneratedApp = {
  name: "Limetred Protocol",
  description: "The native governance and utility protocol for the Limetred ecosystem.",
  codeSnippet: "",
  contractSnippet: "",
  rarity: "LEGENDARY",
  attributes: ["GOVERNANCE", "YIELD FARMING", "DAO"]
};

export default function App() {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.HOME);
  const [appData, setAppData] = useState<GeneratedApp | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setPhase(AppPhase.LOADING);
    const data = await generateAppConcept(prompt);
    setAppData(data);
    // The GenerationTheater component handles the delay logic visually.
  };

  const handleTheaterComplete = () => {
    setPhase(AppPhase.PREVIEW);
  };

  const handleDeploy = () => {
    // In a real app, this would trigger web3 wallet signature
    setPhase(AppPhase.DASHBOARD);
  };

  const handleConnectWallet = async () => {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setWalletConnected(true);
    
    // If on HOME, take them to the Dashboard (Launchpad view) immediately
    if (phase === AppPhase.HOME) {
      if (!appData) {
        setAppData(DEMO_APP);
      }
      setPhase(AppPhase.DASHBOARD);
    }
  };

  const handleBack = () => {
    setPhase(AppPhase.HOME);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0c0c0c] text-white selection:bg-[#39b54a] selection:text-black">
      <AnimatePresence mode="wait">
        
        {phase === AppPhase.HOME && (
          <HeroSection 
            key="home" 
            onGenerate={handleGenerate} 
            onConnectWallet={handleConnectWallet}
            isConnected={walletConnected}
          />
        )}

        {phase === AppPhase.LOADING && (
          <GenerationTheater key="loading" onComplete={handleTheaterComplete} />
        )}

        {phase === AppPhase.PREVIEW && appData && (
          <BuilderPreview key="preview" appData={appData} onDeploy={handleDeploy} />
        )}

        {phase === AppPhase.DASHBOARD && appData && (
          <Dashboard 
            key="dashboard" 
            appData={appData} 
            isConnected={walletConnected}
            onConnect={handleConnectWallet}
            onBack={handleBack}
          />
        )}

      </AnimatePresence>
    </main>
  );
}