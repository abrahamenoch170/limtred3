import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppPhase, GeneratedApp, WalletBalance, Transaction, ChainId, LaunchpadProject } from './types';
import { generateAppConcept } from './services/geminiService';
import HeroSection from './components/HeroSection';
import GenerationTheater from './components/GenerationTheater';
import BuilderPreview from './components/BuilderPreview';
import Dashboard from './components/Dashboard';
import WalletDrawer from './components/WalletDrawer';
import LaunchpadFeed from './components/LaunchpadFeed';
import WalletConnectModal from './components/WalletConnectModal';
import { CHAINS } from './constants';

// Default Demo App
const DEMO_APP: GeneratedApp = {
  name: "Limetred Protocol",
  description: "The native governance and utility protocol for the Limetred ecosystem.",
  codeSnippet: "",
  contractSnippet: "",
  rarity: "LEGENDARY",
  attributes: ["GOVERNANCE", "YIELD FARMING", "DAO"]
};

// Mock Initial Transactions
const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 'tx-1', type: 'YIELD', amount: '+0.042', status: 'PENDING', timestamp: 'Just now' },
    { id: 'tx-2', type: 'BUY_KEYS', amount: '-1.70', status: 'SUCCESS', timestamp: '2m ago' },
    { id: 'tx-3', type: 'DEPLOY', amount: '-0.10', status: 'SUCCESS', timestamp: '15m ago' },
];

export default function App() {
  const [phase, setPhase] = useState<AppPhase>(AppPhase.HOME);
  const [appData, setAppData] = useState<GeneratedApp | null>(null);
  const [currentChain, setCurrentChain] = useState<ChainId>('SOL');
  
  // Wallet State
  const [walletConnected, setWalletConnected] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    native: 12.5, // Generic 'native' token amount (SOL, ETH, etc)
    lmt: 0,
    usdValue: 1812.50
  });
  const [transactions, setTransactions] = useState<Transaction[]>(
    INITIAL_TRANSACTIONS.map(tx => ({...tx, amount: `${tx.amount} ${CHAINS['SOL'].symbol}`}))
  );

  const handleGenerate = async (prompt: string) => {
    setPhase(AppPhase.LOADING);
    const data = await generateAppConcept(prompt);
    setAppData(data);
  };

  const handleTheaterComplete = () => {
    setPhase(AppPhase.PREVIEW);
  };

  const handleDeploy = () => {
    setPhase(AppPhase.DASHBOARD);
    const chainConfig = CHAINS[currentChain];
    // Simulate cost
    setWalletBalance(prev => ({
        ...prev,
        native: prev.native - 0.1,
        usdValue: (prev.native - 0.1) * 145 + (prev.lmt * 0.85) // Simplified USD calc
    }));
    addTransaction({
        id: `tx-${Date.now()}`,
        type: 'DEPLOY',
        amount: `-0.1 ${chainConfig.symbol}`,
        status: 'SUCCESS',
        timestamp: 'Just now'
    });
  };

  const initiateWalletConnection = () => {
    if (walletConnected) {
      setIsWalletOpen(true);
    } else {
      setShowConnectModal(true);
    }
  };

  const handleConnectWallet = (provider: string) => {
    setWalletConnected(true);
    setShowConnectModal(false);
    setIsWalletOpen(true); // Open drawer on connect to show success
    
    // Add a mock transaction to show interaction
    addTransaction({
        id: `tx-conn-${Date.now()}`,
        type: 'TRADE', // Using Trade type for general interaction
        amount: `Connected ${provider}`,
        status: 'SUCCESS',
        timestamp: 'Just now'
    });
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setIsWalletOpen(false);
    setPhase(AppPhase.HOME);
  };

  const handleSwap = (amountNative: number, amountLMT: number) => {
    if (walletBalance.native >= amountNative) {
        setWalletBalance(prev => ({
            native: prev.native - amountNative,
            lmt: prev.lmt + amountLMT,
            usdValue: (prev.native - amountNative) * 145 + (prev.lmt + amountLMT) * 0.85
        }));
        addTransaction({
            id: `tx-${Date.now()}`,
            type: 'SWAP',
            amount: `+${amountLMT.toLocaleString()} LMT`,
            status: 'SUCCESS',
            timestamp: 'Just now'
        });
        return true;
    }
    return false;
  };

  const handleTradeKeys = (action: 'BUY' | 'SELL', quantity: number, totalValue: number) => {
    setWalletBalance(prev => {
        const newNative = action === 'BUY' ? prev.native - totalValue : prev.native + totalValue;
        return {
            ...prev,
            native: newNative,
            usdValue: newNative * 145 + prev.lmt * 0.85 // Approx calc
        };
    });
    
    addTransaction({
        id: `tx-${Date.now()}`,
        type: action === 'BUY' ? 'BUY_KEYS' : 'SELL_KEYS',
        amount: `${action === 'BUY' ? '-' : '+'}${totalValue.toFixed(4)} ${CHAINS[currentChain].symbol}`,
        status: 'SUCCESS',
        timestamp: 'Just now'
    });
  };

  const handleChainChange = (chainId: ChainId) => {
    setCurrentChain(chainId);
    // Simulate different balance on different chain
    setWalletBalance(prev => ({
        ...prev,
        native: Math.random() * 10 
    }));
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  const handleBack = () => {
    if (phase === AppPhase.DASHBOARD) {
        // If coming from Launchpad viewing a random project, go back to Launchpad
        if (appData?.id?.startsWith('proj-')) {
            setPhase(AppPhase.LAUNCHPAD);
        } else {
            setPhase(AppPhase.HOME);
        }
    } else {
        setPhase(AppPhase.HOME);
    }
  };

  const handleOpenLaunchpad = () => {
      setPhase(AppPhase.LAUNCHPAD);
  };

  const handleSelectProject = (project: LaunchpadProject) => {
      setAppData(project);
      setPhase(AppPhase.DASHBOARD);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0c0c0c] text-white selection:bg-[#39b54a] selection:text-black font-sans">
      <AnimatePresence mode="wait">
        
        {phase === AppPhase.HOME && (
          <HeroSection 
            key="home" 
            onGenerate={handleGenerate} 
            onConnectWallet={initiateWalletConnection}
            isConnected={walletConnected}
            walletBalance={walletBalance}
            onSwap={handleSwap}
            currentChain={currentChain}
            onOpenLaunchpad={handleOpenLaunchpad}
          />
        )}

        {phase === AppPhase.LOADING && (
          <GenerationTheater key="loading" onComplete={handleTheaterComplete} />
        )}

        {phase === AppPhase.PREVIEW && appData && (
          <BuilderPreview 
            key="preview" 
            appData={appData} 
            onDeploy={handleDeploy} 
            currentChain={currentChain}
          />
        )}
        
        {phase === AppPhase.LAUNCHPAD && (
            <LaunchpadFeed 
                key="launchpad"
                onSelectProject={handleSelectProject}
                onBack={() => setPhase(AppPhase.HOME)}
            />
        )}

        {phase === AppPhase.DASHBOARD && appData && (
          <Dashboard 
            key="dashboard" 
            appData={appData} 
            isConnected={walletConnected}
            onConnect={initiateWalletConnection}
            onBack={handleBack}
            walletBalance={walletBalance}
            transactions={transactions}
            currentChain={currentChain}
            onTradeKeys={handleTradeKeys}
          />
        )}

      </AnimatePresence>

      <WalletDrawer 
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onDisconnect={handleDisconnect}
        balance={walletBalance}
        address="0x8A2...4B2F"
        transactions={transactions}
        currentChain={currentChain}
        onChainChange={handleChainChange}
      />

      <WalletConnectModal 
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleConnectWallet}
        currentChain={currentChain}
      />
    </main>
  );
}