import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ChevronRight, Loader2, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { ChainId } from '../types';
import { CHAINS } from '../constants';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: string) => void;
  currentChain: ChainId;
  onSwitchChain: (chain: ChainId) => void;
}

const WALLETS = [
  { id: 'phantom', name: 'Phantom', icon: '👻', color: '#AB9FF2', chains: ['SOL', 'ETH', 'BASE'] },
  { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#F6851B', chains: ['ETH', 'BASE', 'ARB'] },
  { id: 'solflare', name: 'Solflare', icon: '☀️', color: '#FC722F', chains: ['SOL'] },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', color: '#0052FF', chains: ['ETH', 'BASE', 'SOL'] },
];

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, onConnect, currentChain, onSwitchChain }) => {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleWalletClick = (walletId: string) => {
    setConnecting(walletId);
    // Simulate connection delay
    setTimeout(() => {
      onConnect(walletId);
      setConnecting(null);
    }, 1500);
  };

  const handleSwitchAndConnect = (walletId: string, targetChain: ChainId) => {
    onSwitchChain(targetChain);
  };

  const activeChainConfig = CHAINS[currentChain];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-[#111111] border border-[#1f1f1f] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1f1f1f] bg-[#0c0c0c]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#39b54a]/10 border border-[#39b54a] flex items-center justify-center sharp-corners text-[#39b54a]">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-white font-bold uppercase tracking-wider text-lg">Connect Wallet</h2>
                  <p className="text-[#666666] text-xs font-mono">Secure connection to {activeChainConfig.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-[#666666] hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3">
                {WALLETS.map((wallet) => {
                  const isSupported = wallet.chains.includes(currentChain);
                  const isConnecting = connecting === wallet.id;
                  
                  // If not supported, suggest the first supported chain
                  const targetChainId = !isSupported ? wallet.chains[0] as ChainId : null;
                  const targetChainName = targetChainId ? CHAINS[targetChainId]?.name : '';

                  return (
                    <button
                      key={wallet.id}
                      onClick={() => {
                        if (isSupported) {
                            handleWalletClick(wallet.id);
                        } else if (targetChainId) {
                            handleSwitchAndConnect(wallet.id, targetChainId);
                        }
                      }}
                      disabled={connecting !== null}
                      className={`w-full flex items-center justify-between p-4 border transition-all duration-200 group relative overflow-hidden ${
                        isSupported 
                          ? 'bg-[#0c0c0c] border-[#1f1f1f] hover:border-[#39b54a] hover:bg-[#39b54a]/5'
                          : 'bg-[#111111] border-[#1f1f1f] opacity-80 hover:opacity-100 hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/5'
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="text-2xl">{wallet.icon}</div>
                        <div className="text-left">
                          <div className={`font-bold ${isSupported ? 'text-white' : 'text-[#888]'}`}>{wallet.name}</div>
                          {!isSupported && (
                              <div className="text-[10px] text-[#8b5cf6] font-mono flex items-center gap-1 mt-0.5">
                                <AlertCircle size={10} /> Not on {activeChainConfig.name}
                              </div>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10">
                        {isConnecting ? (
                           <Loader2 className="animate-spin text-[#39b54a]" size={18} />
                        ) : isSupported ? (
                           <ChevronRight className="text-[#333] group-hover:text-[#39b54a] transition-colors" size={18} />
                        ) : (
                           <div className="flex items-center gap-1 bg-[#8b5cf6]/10 border border-[#8b5cf6] px-2 py-1 text-[10px] font-bold text-[#8b5cf6] uppercase">
                              <ArrowLeftRight size={10} />
                              Switch to {targetChainName}
                           </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WalletConnectModal;