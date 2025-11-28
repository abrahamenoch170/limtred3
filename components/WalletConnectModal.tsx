import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { ChainId } from '../types';
import { CHAINS } from '../constants';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: string) => void;
  currentChain: ChainId;
}

const WALLETS = [
  { id: 'phantom', name: 'Phantom', icon: '👻', color: '#AB9FF2', chains: ['SOL', 'ETH', 'BASE'] },
  { id: 'metamask', name: 'MetaMask', icon: '🦊', color: '#F6851B', chains: ['ETH', 'BASE', 'ARB'] },
  { id: 'solflare', name: 'Solflare', icon: '☀️', color: '#FC722F', chains: ['SOL'] },
  { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', color: '#0052FF', chains: ['ETH', 'BASE', 'SOL'] },
];

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, onConnect, currentChain }) => {
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleWalletClick = (walletId: string) => {
    setConnecting(walletId);
    // Simulate connection delay
    setTimeout(() => {
      onConnect(walletId);
      setConnecting(null);
    }, 1500);
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

                  return (
                    <button
                      key={wallet.id}
                      onClick={() => isSupported && handleWalletClick(wallet.id)}
                      disabled={!isSupported || connecting !== null}
                      className={`w-full flex items-center justify-between p-4 border transition-all duration-200 group relative overflow-hidden ${
                        isSupported 
                          ? 'bg-[#0c0c0c] border-[#1f1f1f] hover:border-[#39b54a] hover:bg-[#1a1a1a] cursor-pointer' 
                          : 'bg-[#0a0a0a] border-[#1f1f1f] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <span className="text-2xl">{wallet.icon}</span>
                        <div className="text-left">
                          <div className={`font-bold font-mono uppercase ${isSupported ? 'text-white' : 'text-[#444]'}`}>
                            {wallet.name}
                          </div>
                          {!isSupported && (
                            <div className="text-[10px] text-red-500 font-mono flex items-center gap-1">
                              <AlertCircle size={10} /> Not supported on {activeChainConfig.name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10">
                        {isConnecting ? (
                          <Loader2 className="animate-spin text-[#39b54a]" size={20} />
                        ) : isSupported && (
                          <ChevronRight className="text-[#333] group-hover:text-[#39b54a] transition-colors" size={20} />
                        )}
                      </div>

                      {/* Hover Effect */}
                      {isSupported && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#39b54a]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-[#1f1f1f] text-center">
                <p className="text-[10px] text-[#666666] font-mono leading-relaxed">
                  By connecting a wallet, you agree to the <span className="text-[#39b54a] cursor-pointer hover:underline">Terms of Service</span> and acknowledge that crypto assets are highly volatile.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WalletConnectModal;