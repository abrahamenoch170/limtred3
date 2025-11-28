import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppPhase, GeneratedApp } from './types';
import { generateAppConcept } from './services/geminiService';
import HeroSection from './components/HeroSection';
import GenerationTheater from './components/GenerationTheater';
import BuilderPreview from './components/BuilderPreview';
import Dashboard from './components/Dashboard';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.HOME);
  const [appData, setAppData] = useState<GeneratedApp | null>(null);

  const handleGenerate = async (prompt: string) => {
    setPhase(AppPhase.LOADING);
    const data = await generateAppConcept(prompt);
    setAppData(data);
    // The GenerationTheater component handles the delay logic visually.
    // We pass the data setting here so it's ready when the theater finishes.
  };

  const handleTheaterComplete = () => {
    setPhase(AppPhase.PREVIEW);
  };

  const handleDeploy = () => {
    // In a real app, this would trigger web3 wallet signature
    setPhase(AppPhase.DASHBOARD);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0c0c0c] text-white selection:bg-[#39b54a] selection:text-black">
      <AnimatePresence mode="wait">
        
        {phase === AppPhase.HOME && (
          <HeroSection key="home" onGenerate={handleGenerate} />
        )}

        {phase === AppPhase.LOADING && (
          <GenerationTheater key="loading" onComplete={handleTheaterComplete} />
        )}

        {phase === AppPhase.PREVIEW && appData && (
          <BuilderPreview key="preview" appData={appData} onDeploy={handleDeploy} />
        )}

        {phase === AppPhase.DASHBOARD && appData && (
          <Dashboard key="dashboard" appData={appData} />
        )}

      </AnimatePresence>
    </main>
  );
}