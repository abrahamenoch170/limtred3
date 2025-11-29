
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ChevronRight, Loader2, ArrowLeftRight, AlertCircle, CheckCircle, WifiOff, Plus, Eye, EyeOff, Copy } from 'lucide-react';
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

type ConnectionStatus = 'IDLE' | 'CONNECTING' | 'SUCCESS' | 'ERROR';
type ModalMode = 'CONNECT' | 'CREATE';

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, onConnect, currentChain, onSwitchChain }) => {
  const [mode, setMode] = useState<ModalMode>('CONNECT');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('IDLE');
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);

  // Creation State
  const [vanityName, setVanityName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<{address: string, seed: string, pk: string} | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);

  useEffect(() => {
    if (!isOpen) {
        setConnectionStatus('IDLE');
        setActiveWalletId(null);
        setMode('CONNECT');
        setGeneratedWallet(null);
        setVanityName('');
    }
  }, [isOpen]);

  const handleWalletClick = (walletId: string) => {
    setActiveWalletId(walletId);
    setConnectionStatus('CONNECTING');
    
    // Simulate connection lifecycle
    setTimeout(() => {
      // Mock Success Transition
      setConnectionStatus('SUCCESS');
      
      setTimeout(() => {
        onConnect(walletId);
        // State reset handled by useEffect on close
      }, 800);
    }, 1500);
  };

  const handleSwitchAndConnect = (walletId: string, targetChain: ChainId) => {
    onSwitchChain(targetChain);
  };

  const generateVanityWallet = () => {
      if (!vanityName) return;
      setIsGenerating(true);
      // Simulate heavy computation
      setTimeout(() => {
          const randomHex = Array.from({length: 36}, () => Math.floor(Math.random()*16).toString(16)).join('');
          const address = `0x${randomHex}${vanityName.toUpperCase()}`;
          const seed = "witch collapse practice feed shame open despair creek road again ice lease";
          const pk = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
          
          setGeneratedWallet({ address, seed, pk });
          setIsGenerating(false);
      }, 2000);
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
                  <h2 className="text-white font-bold uppercase tracking-wider text-lg">
                      {mode === 'CONNECT' ? 'Connect Wallet' : 'Create Vault'}
                  </h2>
                  <p className="text-[#666666] text-xs font-mono">Secure connection to {activeChainConfig.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-[#666666] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={connectionStatus !== 'IDLE'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {mode === 'CONNECT' ? (
                    <div className="space-y-3">
                        {WALLETS.map((wallet) => {
                            const isSupported = wallet.chains.includes(currentChain);
                            const isActive = activeWalletId === wallet.id;
                            const targetChainId = !isSupported ? wallet.chains[0] as ChainId : null;
                            const targetChainName = targetChainId ? CHAINS[targetChainId]?.name : '';
                            
                            // Dynamic Styles based on Status
                            let containerStyles = "";
                            let iconElement = null;

                            if (isActive) {
                                switch (connectionStatus) {
                                    case 'CONNECTING':
                                        containerStyles = "bg-[#39b54a]/10 border-[#39b54a] animate-pulse";
                                        iconElement = <Loader2 className="animate-spin text-[#39b54a]" size={18} />;
                                        break;
                                    case 'SUCCESS':
                                        containerStyles = "bg-[#39b54a]/20 border-[#39b54a]";
                                        iconElement = <CheckCircle className="text-[#39b54a]" size={18} />;
                                        break;
                                    case 'ERROR':
                                        containerStyles = "bg-red-500/10 border-red-500";
                                        iconElement = <AlertCircle className="text-red-500" size={18} />;
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                containerStyles = isSupported 
                                    ? "bg-[#0c0c0c] border-[#1f1f1f] hover:border-[#39b54a] hover:bg-[#39b54a]/5"
                                    : "bg-[#111111] border-[#1f1f1f] opacity-80 hover:opacity-100 hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/5";
                            }

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
                                    disabled={connectionStatus !== 'IDLE' && !isActive}
                                    className={`w-full flex items-center justify-between p-4 border transition-all duration-200 group relative overflow-hidden ${containerStyles} ${connectionStatus !== 'IDLE' && !isActive ? 'opacity-30 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="text-2xl">{wallet.icon}</div>
                                        <div className="text-left">
                                            <div className={`font-bold ${isSupported || isActive ? 'text-white' : 'text-[#888]'}`}>
                                                {wallet.name}
                                            </div>
                                            {!isSupported && !isActive && (
                                                <div className="text-[10px] text-[#8b5cf6] font-mono flex items-center gap-1 mt-0.5">
                                                    <AlertCircle size={10} /> Not on {activeChainConfig.name}
                                                </div>
                                            )}
                                            {isActive && connectionStatus === 'SUCCESS' && (
                                                <div className="text-[10px] text-[#39b54a] font-mono flex items-center gap-1 mt-0.5">
                                                    Connected
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        {isActive ? (
                                            iconElement
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
                        
                        <div className="pt-4 mt-4 border-t border-[#1f1f1f]">
                            <button 
                                onClick={() => setMode('CREATE')}
                                disabled={connectionStatus !== 'IDLE'}
                                className="w-full py-3 border border-dashed border-[#666] text-[#888] hover:border-[#39b54a] hover:text-[#39b54a] hover:bg-[#39b54a]/5 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={16} /> Create New Wallet
                            </button>
                        </div>
                    </div>
                ) : (
                    // CREATE MODE
                    <div className="space-y-4">
                        {!generatedWallet ? (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-[#666] uppercase block mb-2">Vanity Suffix (Optional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] font-mono text-sm">0x...</span>
                                        <input 
                                            value={vanityName}
                                            onChange={(e) => setVanityName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                                            maxLength={5}
                                            placeholder="DEMI"
                                            className="w-full bg-[#111] border border-[#333] pl-12 pr-4 py-3 text-white font-mono uppercase focus:border-[#39b54a] outline-none"
                                        />
                                    </div>
                                    <p className="text-[10px] text-[#666] mt-2">Maximum 5 characters. Case insensitive.</p>
                                </div>
                                <button 
                                    onClick={generateVanityWallet}
                                    disabled={isGenerating}
                                    className="w-full bg-[#39b54a] text-black font-bold uppercase py-3 hover:bg-[#2ea03f] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={16} /> : 'Generate Keys'}
                                </button>
                                <button onClick={() => setMode('CONNECT')} className="w-full text-xs text-[#666] hover:text-white mt-2">Back to Connect</button>
                            </>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-[#1a1a1a] border border-[#39b54a] p-4 mb-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-[#39b54a] text-black text-[10px] font-bold px-2 py-1">CREATED</div>
                                    <div className="text-[10px] text-[#666] uppercase font-bold mb-1">Public Address</div>
                                    <div className="font-mono text-[#39b54a] text-sm break-all mb-4">{generatedWallet.address}</div>
                                    
                                    <div className="text-[10px] text-[#666] uppercase font-bold mb-1 flex justify-between">
                                        <span>Private Key</span>
                                        <button onClick={() => setShowSensitive(!showSensitive)} className="text-[#39b54a] flex items-center gap-1">
                                            {showSensitive ? <EyeOff size={10}/> : <Eye size={10}/>} {showSensitive ? 'Hide' : 'Reveal'}
                                        </button>
                                    </div>
                                    <div className="font-mono text-white text-xs break-all bg-black p-2 border border-[#333]">
                                        {showSensitive ? generatedWallet.pk : '•'.repeat(64)}
                                    </div>
                                </div>
                                
                                <div className="bg-red-900/10 border border-red-500/30 p-3 mb-4 flex gap-3">
                                    <AlertCircle className="text-red-500 shrink-0" size={20} />
                                    <p className="text-[10px] text-red-200">
                                        <strong>SAVE THESE KEYS NOW.</strong> Limetred is non-custodial. If you lose this key, your funds are lost forever. We cannot recover them.
                                    </p>
                                </div>

                                <button 
                                    onClick={() => onConnect('Limetred Vault')}
                                    className="w-full bg-[#39b54a] text-black font-bold uppercase py-3 hover:bg-[#2ea03f]"
                                >
                                    I Have Saved My Keys
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Footer status if connecting */}
            {connectionStatus === 'CONNECTING' && (
                <div className="p-3 bg-[#0c0c0c] border-t border-[#1f1f1f] flex justify-center">
                    <span className="text-xs font-mono text-[#666] animate-pulse">Requesting signature...</span>
                </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WalletConnectModal;
