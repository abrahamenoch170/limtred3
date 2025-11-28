import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from './ui/GlintComponents';
import { GeneratedApp } from '../types';
import { Rocket, Code2, Smartphone } from 'lucide-react';
import { COLORS } from '../constants';

interface BuilderPreviewProps {
  appData: GeneratedApp;
  onDeploy: () => void;
}

const BuilderPreview: React.FC<BuilderPreviewProps> = ({ appData, onDeploy }) => {
  const [activeTab, setActiveTab] = useState<'CODE' | 'PREVIEW'>('PREVIEW');
  const [showDeployModal, setShowDeployModal] = useState(false);

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#0c0c0c] text-white overflow-hidden">
      
      {/* Left Panel: Code/Details */}
      <div className="flex-1 flex flex-col border-r border-[#1f1f1f] p-6 overflow-y-auto no-scrollbar">
        <div className="mb-8">
          <Badge color={appData.rarity === 'LEGENDARY' ? 'text-[#8b5cf6]' : 'text-[#39b54a]'}>
            {appData.rarity} GENERATION
          </Badge>
          <h2 className="text-4xl font-bold mt-4 uppercase tracking-tighter">{appData.name}</h2>
          <p className="text-[#666666] mt-2 font-mono text-sm">{appData.description}</p>
        </div>

        <div className="flex space-x-4 mb-6">
            <button 
                onClick={() => setActiveTab('CODE')}
                className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 ${activeTab === 'CODE' ? 'border-[#39b54a] text-white' : 'border-transparent text-[#666666]'}`}
            >
                Smart Contract
            </button>
            <button 
                onClick={() => setActiveTab('PREVIEW')}
                className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 ${activeTab === 'PREVIEW' ? 'border-[#39b54a] text-white' : 'border-transparent text-[#666666]'}`}
            >
                Interface
            </button>
        </div>

        <Card className="flex-1 bg-[#080808] overflow-hidden font-mono text-xs relative group">
             <div className="absolute top-0 right-0 p-2 bg-[#111111] border-b border-l border-[#1f1f1f] text-[#666666]">
                 {activeTab === 'CODE' ? 'Solidity 0.8.20' : 'React.tsx'}
             </div>
             <pre className="p-4 text-gray-300 overflow-auto h-full no-scrollbar">
                <code>
                    {activeTab === 'CODE' ? appData.contractSnippet : appData.codeSnippet}
                </code>
             </pre>
        </Card>

        <div className="mt-6 flex gap-2 flex-wrap">
            {appData.attributes.map((attr, i) => (
                <Badge key={i}>{attr}</Badge>
            ))}
        </div>
      </div>

      {/* Right Panel: Simulation & Action */}
      <div className="flex-1 bg-[#111111] flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 opacity-10"
             style={{ backgroundImage: `radial-gradient(${COLORS.border} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}
        />

        {/* Mock Phone */}
        <div className="relative w-[320px] h-[600px] border-4 border-[#1f1f1f] bg-black shadow-2xl z-10 flex flex-col overflow-hidden">
             {/* Dynamic Content Simulation */}
             <div className="bg-[#111111] text-white p-4 border-b border-[#333] flex justify-between items-center">
                 <span className="font-bold text-sm">{appData.name}</span>
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             </div>
             <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 border border-[#39b54a] flex items-center justify-center mb-4">
                     <Rocket size={24} className="text-[#39b54a]" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">Welcome to {appData.name}</h3>
                 <p className="text-xs text-gray-500 mb-6">{appData.description}</p>
                 <button className="bg-[#39b54a] text-black w-full py-3 font-bold uppercase text-xs">
                     Connect Wallet
                 </button>
             </div>
        </div>

        {/* Deploy Trigger */}
        <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-center">
            <Button 
                onClick={() => setShowDeployModal(true)}
                variant="primary" 
                className="w-full max-w-md shadow-[0_0_20px_rgba(57,181,74,0.3)]"
            >
                DEPLOY TO MAINNET (0.1 SOL)
            </Button>
        </div>

        {/* Deploy Confirmation Modal */}
        <AnimatePresence>
            {showDeployModal && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-[#111111] border border-[#39b54a] p-8 max-w-sm w-full text-center"
                    >
                        <h3 className="text-2xl font-bold text-white mb-2 uppercase">Ready to Launch?</h3>
                        <p className="text-[#666666] mb-6 text-sm">
                            This will deploy contracts, create the liquidity pool, and list on the Limetred dash.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button onClick={onDeploy}>CONFIRM DEPLOYMENT</Button>
                            <Button variant="ghost" onClick={() => setShowDeployModal(false)}>CANCEL</Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BuilderPreview;