
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Badge, Card } from './ui/GlintComponents';
import { MOCK_TICKER, CHAINS } from '../constants';
import { Zap, Shield, ChevronDown, ArrowRight, Activity, X, Wallet, BookOpen, Layers, Network, Image as ImageIcon, Paperclip, Bot, Loader2, CheckCircle, Clock, Coins, Menu, BarChart3, ArrowLeftRight, Droplets, ScanLine, Terminal, Plus, Globe, ShieldCheck, Search, AlertCircle, Twitter, Github, Disc } from 'lucide-react';
import { WalletBalance, ChainId } from '../types';
import { TextReveal, ScrollFade } from './ui/MotionComponents';

interface HeroSectionProps {
  onGenerate: (prompt: string, imageBase64?: string) => void;
  onConnectWallet: () => void;
  isConnected: boolean;
  walletBalance: WalletBalance;
  onSwap: (sol: number, lmt: number) => boolean;
  currentChain: ChainId;
  onOpenLaunchpad?: () => void;
  onGenerateToken?: (name: string, symbol: string, supply: string, decimals: string) => void;
  onOpenAI?: (context?: string) => void;
}

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M0 0H14V6H6V26H26V18H32V32H0V0Z" fill="#39b54a"/>
    <rect x="18" y="0" width="14" height="14" fill="white"/>
  </svg>
);

type ModalType = 'DOCS' | 'TOKENOMICS' | 'BOUNTY' | 'AUDITS' | 'WHITEPAPER' | 'VESTING' | null;

const PROTOCOL_CONTENT = {
  DOCS: { title: "PROTOCOL DOCUMENTATION", icon: <Layers size={24} className="text-[#39b54a]" />, content: <div className="text-gray-400 text-sm p-4 font-mono">Documentation modules loading...<br/><br/>[1] Architecture Overview<br/>[2] Smart Contracts<br/>[3] SDK Reference</div> },
  TOKENOMICS: { title: "TOKEN ECONOMICS", icon: <Activity size={24} className="text-[#8b5cf6]" />, content: <div className="text-gray-400 text-sm p-4 font-mono">Total Supply: 1,000,000,000 LMT<br/>Circulating: 12.5%<br/>Treasury: 40%<br/>Team: 15% (Vested)</div> },
  BOUNTY: { title: "BUG BOUNTY PROGRAM", icon: <Bot size={24} className="text-red-500" />, content: <div className="text-gray-400 text-sm p-4 font-mono">Active Bounties:<br/>- Smart Contract Logic (Critical): $50,000<br/>- Frontend Injection (High): $10,000</div> },
  AUDITS: { title: "SECURITY AUDITS", icon: <Shield size={24} className="text-[#39b54a]" />, content: <div className="text-gray-400 text-sm p-4 font-mono">Last Audit: 2 days ago by CertiK<br/>Score: 98/100<br/>Status: PASSED</div> },
  VESTING: { title: "VESTING SCHEDULES", icon: <Clock size={24} className="text-[#39b54a]" />, content: <div className="text-gray-400 text-sm p-4 font-mono">No active vesting schedules found for current wallet.</div> },
  WHITEPAPER: { title: "LIMETRED WHITE PAPER", icon: <BookOpen size={24} className="text-white" />, content: <div className="text-gray-400 text-sm p-4 font-mono">Abstract: Limetred is a Venture-as-a-Service protocol enabling instantaneous deployment of complex DeFi primitives via generative AI.</div> },
};

interface Token {
    symbol: string;
    name: string;
    address: string;
    logo?: string;
    isNative?: boolean;
}

const TOKENS_BY_CHAIN: Record<string, Token[]> = {
    SOL: [
        { symbol: 'USDC', name: 'USD Coin', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
        { symbol: 'BONK', name: 'Bonk', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
        { symbol: 'JUP', name: 'Jupiter', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtkPHCLkh5FTO4g1pQ' },
        { symbol: 'WIF', name: 'dogwifhat', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
    ],
    ETH: [
        { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
        { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
        { symbol: 'PEPE', name: 'Pepe', address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933' },
        { symbol: 'UNI', name: 'Uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
    ],
    BASE: [
        { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
        { symbol: 'BRETT', name: 'Brett', address: '0x532f27101965dd16442e59d40670faf5ebb142e4' },
    ],
    ARB: [
        { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
        { symbol: 'ARB', name: 'Arbitrum', address: '0x912CE59144191C1204E64559FE8253a0e49E6548' },
    ],
    TON: [
        { symbol: 'USDT', name: 'Tether USD', address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixq7NrQA' },
        { symbol: 'NOT', name: 'Notcoin', address: 'EQAvlWFDxGF2lDLm67Mi6nmwP43m' },
    ]
};

const COMMON_TOKENS: Token[] = [
    { symbol: 'LMT', name: 'Limetred', address: '0x1234...LMT', isNative: false },
];

const HeroSection: React.FC<HeroSectionProps> = ({ 
  onGenerate, 
  onConnectWallet, 
  isConnected, 
  walletBalance, 
  onSwap, 
  currentChain, 
  onOpenLaunchpad, 
  onGenerateToken,
  onOpenAI 
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // DEX State
  const [dexTab, setDexTab] = useState<'SWAP' | 'POOL' | 'BRIDGE'>('SWAP');
  const [swapAmount, setSwapAmount] = useState('1.0');
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [isRiskScanning, setIsRiskScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'SAFE' | 'RISKY' | null>(null);
  const [poolSuccess, setPoolSuccess] = useState(false);
  const [bridgeSuccess, setBridgeSuccess] = useState(false);
  
  // Token Selector State
  const activeChain = CHAINS[currentChain];
  const [payToken, setPayToken] = useState<Token>({ symbol: activeChain.symbol, name: activeChain.name, address: 'NATIVE', isNative: true });
  const [receiveToken, setReceiveToken] = useState<Token>({ symbol: 'LMT', name: 'Limetred', address: '0x1234...LMT', isNative: false });
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState<'PAY' | 'RECEIVE' | null>(null);
  const [tokenSearch, setTokenSearch] = useState('');

  // Update Pay Token default when chain changes
  useEffect(() => {
      setPayToken({ symbol: activeChain.symbol, name: activeChain.name, address: 'NATIVE', isNative: true });
  }, [currentChain]);

  // Agent State
  const [agentPurpose, setAgentPurpose] = useState('');
  const [agentFunction, setAgentFunction] = useState('Trading Bot');
  const [isGeneratingAgent, setIsGeneratingAgent] = useState(false);
  
  // Token Generator State
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState('1000000000');
  const [tokenDecimals, setTokenDecimals] = useState('18');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  const amountVal = parseFloat(swapAmount) || 0;
  const hasInsufficientFunds = isConnected && amountVal > walletBalance.native && payToken.isNative;

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || selectedImage) {
      onGenerate(prompt, selectedImage || undefined);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanRisk = () => {
      setIsRiskScanning(true);
      setScanResult(null);
      setTimeout(() => {
          setIsRiskScanning(false);
          setScanResult('SAFE');
      }, 2000);
  };

  const handleAskGuardian = () => {
    if (onOpenAI) {
      const context = `[SECURITY_AUDIT_REQUEST]
      I am considering a token swap and need a safety analysis.
      
      TRANSACTION DETAILS:
      • Chain: ${activeChain.name} (${activeChain.id})
      • Selling: ${swapAmount} ${payToken.symbol} (Addr: ${payToken.address})
      • Buying: ${receiveToken.symbol} (Addr: ${receiveToken.address})
      • Native Token: ${payToken.isNative ? 'YES' : 'NO'}
      
      Please analyze:
      1. Is the "Buying" token address a known honeypot?
      2. Are there any high tax warnings for this pair?
      3. Is the liquidity locked?
      
      Respond as a Web3 Security Expert.`;
      
      onOpenAI(context);
    }
  };

  const handleSwapClick = () => {
    if (!isConnected || hasInsufficientFunds || amountVal <= 0) return;
    
    if (!scanResult) {
        handleScanRisk();
        return;
    }

    if (!isNaN(amountVal) && amountVal > 0) {
        // Mock swap
        const received = amountVal * 14020.5; // Mock rate
        const success = onSwap(amountVal, received);
        if (success) {
            setSwapSuccess(true);
            setTimeout(() => {
                setSwapSuccess(false);
                setScanResult(null);
            }, 2000);
        }
    }
  };

  const handlePoolClick = () => {
    setPoolSuccess(true);
    setTimeout(() => setPoolSuccess(false), 2000);
  };

  const handleBridgeClick = () => {
    setBridgeSuccess(true);
    setTimeout(() => setBridgeSuccess(false), 2000);
  };

  const handleGenerateAgent = () => {
    if (!agentPurpose.trim()) return;
    setIsGeneratingAgent(true);
    
    setTimeout(() => {
        const engineeredPrompt = `Create a sophisticated AI Agent Dashboard for a "${agentFunction}". 
        Primary Directive: ${agentPurpose}.
        Features: Real-time activity logs, performance metrics (APY/Success Rate), and a configuration panel for risk parameters.
        The UI should look like a sci-fi command center.`;
        onGenerate(engineeredPrompt);
        setIsGeneratingAgent(false);
    }, 1500);
  };
  
  const handleTokenGenClick = () => {
      if (!tokenName || !tokenSymbol || !tokenSupply) return;
      if (onGenerateToken) {
          setIsGeneratingToken(true);
          onGenerateToken(tokenName, tokenSymbol, tokenSupply, tokenDecimals);
      }
  };

  const openModal = (e: React.MouseEvent, type: ModalType) => {
    e.preventDefault();
    setActiveModal(type);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const scrollToSection = (id: string) => {
      setIsMobileMenuOpen(false);
      setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
              const headerOffset = 70; // Header height
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
              window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth"
              });
          }
      }, 300);
  };

  // --- Token Selector Helper ---
  const handleSelectToken = (token: Token) => {
      if (tokenSelectorOpen === 'PAY') setPayToken(token);
      else setReceiveToken(token);
      setTokenSelectorOpen(null);
      setTokenSearch('');
  };

  const currentTokens = TOKENS_BY_CHAIN[currentChain] || TOKENS_BY_CHAIN['ETH'];

  const filteredTokens = [
      { symbol: activeChain.symbol, name: activeChain.name, address: 'NATIVE', isNative: true }, 
      ...COMMON_TOKENS,
      ...currentTokens
  ].filter(t => t.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) || t.name.toLowerCase().includes(tokenSearch.toLowerCase()));

  // Robust address detection (EVM 0x... or Solana Base58)
  const isAddressSearch = (tokenSearch.startsWith('0x') && tokenSearch.length > 30) || (tokenSearch.length > 30 && !tokenSearch.includes(' '));

  return (
    <div className="relative bg-transparent w-full">
      
      {/* -------------------- MOBILE MENU OVERLAY -------------------- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: "tween", duration: 0.2 }}
                className="fixed inset-0 bg-[#0c0c0c] z-[200] flex flex-col w-full h-full overflow-y-auto"
            >
                {/* Mobile Menu Header */}
                <div className="h-16 px-4 flex items-center justify-between border-b border-[#1f1f1f] bg-[#0c0c0c] shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                            <Logo />
                            <span className="font-bold text-white uppercase tracking-wider">Limetred</span>
                    </div>
                    <button onClick={toggleMobileMenu} className="p-2 text-white bg-[#1f1f1f] rounded border border-[#333]">
                        <X size={20} />
                    </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 p-6 flex flex-col gap-4">
                    <button 
                        onClick={() => { onOpenLaunchpad && onOpenLaunchpad(); toggleMobileMenu(); }}
                        className="text-xl font-bold uppercase text-white py-6 border-b border-[#1f1f1f] flex items-center gap-4 active:text-[#39b54a]"
                    >
                        <Zap size={24} className="text-[#39b54a]" /> Launchpad
                    </button>
                    <button 
                        onClick={() => scrollToSection('dex')} 
                        className="text-xl font-bold uppercase text-white py-6 border-b border-[#1f1f1f] flex items-center gap-4 active:text-[#8b5cf6]"
                    >
                        <ArrowLeftRight size={24} className="text-[#8b5cf6]" /> DEX & Swap
                    </button>
                    <button 
                        onClick={() => scrollToSection('agents')} 
                        className="text-xl font-bold uppercase text-white py-6 border-b border-[#1f1f1f] flex items-center gap-4 active:text-[#39b54a]"
                    >
                            <Bot size={24} className="text-[#39b54a]" /> AI Agents
                    </button>
                    <button 
                        onClick={() => scrollToSection('token-factory')} 
                        className="text-xl font-bold uppercase text-white py-6 border-b border-[#1f1f1f] flex items-center gap-4 active:text-[#8b5cf6]"
                    >
                            <Coins size={24} className="text-[#8b5cf6]" /> Token Factory
                    </button>
                    
                    <div className="mt-8 p-6 bg-[#111] border border-[#1f1f1f] rounded-none">
                        <h4 className="text-xs text-[#666] font-bold uppercase mb-4">Protocol Stats</h4>
                        <div className="flex justify-between text-base text-white font-mono mb-2">
                            <span>TVL</span>
                            <span className="text-[#39b54a] font-bold">$14.2M</span>
                        </div>
                        <div className="flex justify-between text-base text-white font-mono">
                            <span>Volume</span>
                            <span className="text-[#8b5cf6] font-bold">$2.4M</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------- NAVBAR -------------------- */}
      <nav className="sticky top-0 z-50 bg-[#0c0c0c]/80 backdrop-blur-xl border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Logo />
                <span className="font-bold uppercase tracking-wider text-white hidden sm:block text-lg">Limetred</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
                <button onClick={() => onOpenLaunchpad && onOpenLaunchpad()} className="text-xs font-bold uppercase text-[#888] hover:text-[#39b54a] transition-colors tracking-widest">Launchpad</button>
                <button onClick={() => scrollToSection('dex')} className="text-xs font-bold uppercase text-[#888] hover:text-[#39b54a] transition-colors tracking-widest">DEX</button>
                <button onClick={() => scrollToSection('agents')} className="text-xs font-bold uppercase text-[#888] hover:text-[#39b54a] transition-colors tracking-widest">Agents</button>
                <button onClick={() => scrollToSection('token-factory')} className="text-xs font-bold uppercase text-[#888] hover:text-[#39b54a] transition-colors tracking-widest">Factory</button>
                
                {!isConnected && (
                    <Button 
                        variant="primary" 
                        className="py-2 px-6 text-xs flex items-center gap-2"
                        onClick={onConnectWallet}
                    >
                        CONNECT WALLET
                    </Button>
                )}

                {isConnected && (
                    <Button 
                        variant="outline" 
                        className="py-2 px-6 text-xs flex items-center gap-2"
                        onClick={onConnectWallet}
                    >
                        <Wallet size={14} />
                        0x8A...4B2F
                    </Button>
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-3">
                 {!isConnected && (
                    <Button 
                        variant="primary" 
                        className="py-1 px-3 text-[10px] flex items-center gap-2 h-8"
                        onClick={onConnectWallet}
                    >
                        CONNECT
                    </Button>
                 )}
                 {isConnected && (
                    <Button 
                        variant="outline" 
                        className="py-1 px-3 text-[10px] flex items-center gap-2 h-8"
                        onClick={onConnectWallet}
                    >
                        0x8A...
                    </Button>
                 )}
                <button 
                    onClick={toggleMobileMenu} 
                    className="text-white p-2 z-50 bg-[#1f1f1f] rounded border border-[#333] active:bg-[#39b54a] transition-colors shadow-lg"
                    aria-label="Toggle Menu"
                >
                    <Menu size={20} />
                </button>
            </div>
        </div>
      </nav>

      {/* -------------------- HERO -------------------- */}
      <div className="flex flex-col relative z-10">
        {/* Marquee */}
        <div className="w-full bg-[#111111]/90 border-b border-[#1f1f1f] h-8 md:h-10 flex items-center overflow-hidden whitespace-nowrap z-20 shrink-0">
          <div className="animate-marquee flex space-x-8 md:space-x-12 px-4">
            {[...MOCK_TICKER, ...MOCK_TICKER].map((item, i) => (
              <span key={i} className="font-mono text-[10px] md:text-xs text-[#666666] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39b54a] animate-pulse"></span>
                <span className="text-white font-bold">{item.user}</span> deployed <span className="text-[#39b54a]">{item.app}</span> ({item.gain})
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-4 max-w-5xl mx-auto w-full py-12 md:py-24">
             <div className="flex justify-center mb-6">
                <Badge color="text-[#8b5cf6] border-[#8b5cf6] bg-[#8b5cf6]/10 text-[10px] md:text-xs">AI VENTURE PROTOCOL V1.0</Badge>
             </div>
             
             <div className="flex justify-center w-full overflow-hidden px-2">
               {/* Fixed Text Size for Mobile responsiveness using Viewport Units */}
               <TextReveal 
                  text="LIMETRED" 
                  className="text-[13vw] md:text-9xl font-black text-center mb-6 tracking-tighter uppercase text-white select-none leading-[0.85] w-full justify-center" 
               />
             </div>
             
             <ScrollFade delay={0.4} className="max-w-2xl mx-auto text-center mb-10 md:mb-12">
                <p className="text-[#39b54a] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase mb-4 animate-pulse">
                    Venture-as-a-Service Protocol
                </p>
                <p className="text-[#cccccc] text-base sm:text-lg md:text-xl font-light leading-relaxed mb-6 px-4 max-w-lg mx-auto md:max-w-2xl">
                    Launch a fully functional dApp, token, and liquidity market from a single text prompt.
                </p>
            </ScrollFade>

            <ScrollFade delay={0.6} className="w-full">
              <form onSubmit={handleSubmit} className="w-full relative group max-w-3xl mx-auto px-0 md:px-0">
                <div className="relative">
                  <Input 
                    autoFocus
                    placeholder="Describe your billion-dollar idea..." 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-sm md:text-3xl text-center placeholder:text-[#333] border-[#39b54a] bg-black/60 backdrop-blur-md focus:bg-black/90 h-16 md:h-32 pr-12 rounded-none"
                  />
                  <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-[#666] hover:text-white transition-colors"><ImageIcon size={18} /></button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
                
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex justify-center">
                            <div className="flex items-center gap-2 bg-[#111] border border-[#39b54a] px-3 py-1 rounded-full text-xs text-[#39b54a]">
                                <Paperclip size={12} /><span>Image attached</span><button onClick={() => setSelectedImage(null)}><X size={12}/></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div className="mt-6 md:mt-12 flex justify-center">
                  <Button type="submit" variant="primary" className="w-full md:w-auto min-w-[240px] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(57,181,74,0.4)] text-base md:text-lg py-3 md:py-4">
                    <Zap size={20} /> INITIALIZE PROTOCOL
                  </Button>
                </div>
              </form>
            </ScrollFade>
        </div>
      </div>

      {/* -------------------- LAUNCHPAD -------------------- */}
      <section id="launchpad" className="bg-[#111111]/90 backdrop-blur-sm border-t border-[#1f1f1f] py-16 md:py-24 relative overflow-hidden z-20">
        <ScrollFade className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 w-full text-center md:text-left">
                    <Badge color="text-[#8b5cf6]">PHASE 1: INCUBATION</Badge>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white leading-tight">The Fair Launch <br/> <span className="text-[#39b54a]">Bonding Curve</span></h2>
                    <p className="text-[#666666] text-base md:text-lg leading-relaxed mb-8">Every app generated on Limetred starts on a mathematical bonding curve. No pre-sale. No insiders. Just pure price discovery.</p>
                    <Button variant="outline" fullWidth className="md:w-auto flex items-center gap-2 justify-center py-4" onClick={onOpenLaunchpad}>OPEN LAUNCHPAD APP <ArrowRight size={16} /></Button>
                </div>
                <div className="flex-1 w-full relative">
                     <Card className="h-[250px] md:h-[400px] flex items-center justify-center relative border-l-4 border-l-[#39b54a] bg-[#0c0c0c]">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#39b54a 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="w-full h-full p-8 flex items-end">
                            <div className="w-full h-full relative">
                                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                    <path d="M0,100 C50,100 70,80 100,0" fill="none" stroke="#39b54a" strokeWidth="2" />
                                    <circle cx="0" cy="100" r="2" fill="#39b54a" className="animate-ping" />
                                    <circle cx="100" cy="0" r="2" fill="#fff" />
                                </svg>
                            </div>
                        </div>
                     </Card>
                </div>
            </div>
        </ScrollFade>
      </section>

      {/* -------------------- DEX SECTION -------------------- */}
      <section id="dex" className="bg-[#0c0c0c]/90 backdrop-blur-sm border-t border-[#1f1f1f] py-16 md:py-24 relative z-20">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#8b5cf6]/5 to-transparent pointer-events-none"></div>
        <ScrollFade className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                
                {/* Left: Info */}
                <div className="flex-1 w-full text-center md:text-left">
                    <Badge color="text-[#39b54a]">PHASE 2: TRADING</Badge>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white leading-tight">Limetred <br/> <span className="text-[#8b5cf6]">Terminal</span></h2>
                    <p className="text-[#666666] text-base md:text-lg leading-relaxed mb-8">
                        A fully integrated aggregation layer. Swap tokens, bridge assets, and provide liquidity directly from the protocol interface.
                    </p>
                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-4 p-4 border border-[#1f1f1f] bg-[#111]">
                            <ScanLine className="text-[#39b54a] mt-1 shrink-0" size={20} />
                            <div>
                                <h4 className="text-white font-bold text-sm uppercase">AI Safety Layer</h4>
                                <p className="text-[#666] text-xs mt-1">Every transaction is simulated. The AI warns you of honey-pots, high taxes, or ownership issues.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 border border-[#1f1f1f] bg-[#111]">
                            <BarChart3 className="text-[#8b5cf6] mt-1 shrink-0" size={20} />
                            <div>
                                <h4 className="text-white font-bold text-sm uppercase">Advanced Charting</h4>
                                <p className="text-[#666] text-xs mt-1">Real-time TradingView integration with on-chain data overlays.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: DEX Interface */}
                <div className="flex-1 w-full">
                    <Card className="max-w-md mx-auto relative overflow-hidden group hover:border-[#8b5cf6] transition-colors p-0 bg-[#000]">
                        <div className="flex border-b border-[#1f1f1f]">
                            {['SWAP', 'POOL', 'BRIDGE'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setDexTab(tab as any)}
                                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${dexTab === tab ? 'text-[#39b54a] bg-[#39b54a]/5 border-b-2 border-[#39b54a]' : 'text-[#666] hover:text-white'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        <div className="p-4 md:p-6 relative">
                             {/* AI RISK SCAN OVERLAY */}
                             <AnimatePresence>
                                {isRiskScanning && (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
                                    >
                                        <Loader2 size={48} className="text-[#39b54a] animate-spin mb-4" />
                                        <h3 className="text-white font-bold uppercase mb-2">Analyzing Contract...</h3>
                                        <div className="text-xs text-[#666] font-mono space-y-1">
                                            <p className="flex items-center gap-2"><CheckCircle size={10} className="text-[#39b54a]" /> Simulating Transaction</p>
                                            <p className="flex items-center gap-2"><CheckCircle size={10} className="text-[#39b54a]" /> Checking Honeypot</p>
                                            <p className="flex items-center gap-2"><CheckCircle size={10} className="text-[#39b54a]" /> Verifying Liquidity Lock</p>
                                        </div>
                                    </motion.div>
                                )}
                             </AnimatePresence>

                            <AnimatePresence mode="wait">
                                {dexTab === 'SWAP' && (
                                    <motion.div key="swap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="font-bold uppercase text-white text-sm">Market Order</span>
                                            <div className="flex gap-2">
                                                 <button onClick={handleAskGuardian} className="text-[10px] text-[#39b54a] border border-[#39b54a]/30 px-3 py-1 flex items-center gap-1 hover:bg-[#39b54a]/10 transition-colors animate-pulse hover:animate-none bg-[#39b54a]/5">
                                                     <Bot size={12} /> ASK GUARDIAN
                                                 </button>
                                                 <span className="text-xs text-[#666666] font-mono py-1">SLIPPAGE: AUTO</span>
                                            </div>
                                        </div>
                                        
                                        {/* PAY INPUT */}
                                        <div className="bg-[#111] p-4 mb-2 border border-[#333] hover:border-[#666] transition-colors relative">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-[#666666] font-bold">PAY</span>
                                                <span className="text-xs text-[#666666]">BAL: {isConnected && payToken.isNative ? walletBalance.native.toFixed(4) : '--'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <input 
                                                    type="number"
                                                    value={swapAmount}
                                                    onChange={(e) => {
                                                        setSwapAmount(e.target.value);
                                                        setScanResult(null);
                                                    }}
                                                    className="bg-transparent text-xl md:text-2xl font-bold font-mono text-white w-full outline-none placeholder-[#333]"
                                                    placeholder="0.00"
                                                />
                                                <button 
                                                    onClick={() => setTokenSelectorOpen('PAY')}
                                                    className="bg-[#1f1f1f] px-3 py-1 text-xs font-bold rounded-full flex items-center gap-2 hover:bg-[#333] transition-colors border border-[#333]"
                                                >
                                                    {payToken.isNative && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeChain.color }}></div>}
                                                    {payToken.symbol} <ChevronDown size={12}/>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-center -my-3 relative z-10">
                                            <div className="bg-[#000] p-2 border border-[#333] rounded-full hover:border-[#39b54a] transition-all cursor-pointer">
                                                <ArrowLeftRight size={16} className="rotate-90 text-[#39b54a]" />
                                            </div>
                                        </div>

                                        {/* RECEIVE INPUT */}
                                        <div className="bg-[#111] p-4 mt-2 mb-6 border border-[#333] hover:border-[#666] transition-colors">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-[#666666] font-bold">RECEIVE</span>
                                                <span className="text-xs text-[#666666]">EST: {(parseFloat(swapAmount || '0') * 14020).toLocaleString()} {receiveToken.symbol}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl md:text-2xl font-bold font-mono text-[#39b54a]">
                                                    {(parseFloat(swapAmount || '0') * 14020.5).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                                </span>
                                                <button 
                                                    onClick={() => setTokenSelectorOpen('RECEIVE')}
                                                    className="bg-[#1f1f1f] px-3 py-1 text-xs font-bold rounded-full flex items-center gap-2 hover:bg-[#333] transition-colors border border-[#333]"
                                                >
                                                    {!receiveToken.isNative && receiveToken.symbol === 'LMT' && <div className="w-4 h-4 rounded-full bg-[#39b54a]"></div>}
                                                    {receiveToken.symbol} <ChevronDown size={12}/>
                                                </button>
                                            </div>
                                        </div>

                                        {/* TOKEN SELECTOR MODAL/OVERLAY */}
                                        <AnimatePresence>
                                            {tokenSelectorOpen && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute inset-0 z-30 bg-[#0c0c0c] flex flex-col p-4"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-white font-bold text-xs uppercase">Select Token</h3>
                                                        <button onClick={() => setTokenSelectorOpen(null)}><X size={16} className="text-[#666] hover:text-white"/></button>
                                                    </div>
                                                    
                                                    <div className="relative mb-4">
                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]"/>
                                                        <input 
                                                            autoFocus
                                                            placeholder="Search name or paste address" 
                                                            className="w-full bg-[#111] border border-[#333] pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-[#39b54a]"
                                                            value={tokenSearch}
                                                            onChange={(e) => setTokenSearch(e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="flex-1 overflow-y-auto space-y-1">
                                                        {isAddressSearch && (
                                                            <button 
                                                                onClick={() => handleSelectToken({ 
                                                                    symbol: 'CUSTOM', 
                                                                    name: 'Custom Token', 
                                                                    address: tokenSearch,
                                                                    isNative: false 
                                                                })}
                                                                className="w-full text-left p-2 flex items-center justify-between hover:bg-[#1a1a1a] border border-dashed border-[#333] mb-2"
                                                            >
                                                                <div>
                                                                    <div className="text-white text-xs font-bold">Import Address</div>
                                                                    <div className="text-[10px] text-[#666] font-mono">{tokenSearch.slice(0, 16)}...</div>
                                                                </div>
                                                                <Plus size={14} className="text-[#39b54a]"/>
                                                            </button>
                                                        )}

                                                        {filteredTokens.map((t, i) => (
                                                            <button 
                                                                key={i}
                                                                onClick={() => handleSelectToken(t)}
                                                                className="w-full text-left p-2 flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors"
                                                            >
                                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black" style={{ backgroundColor: t.isNative ? activeChain.color : '#333', color: t.isNative ? 'black' : 'white' }}>
                                                                    {t.symbol[0]}
                                                                </div>
                                                                <div>
                                                                    <div className="text-white text-xs font-bold">{t.symbol}</div>
                                                                    <div className="text-[10px] text-[#666]">{t.name}</div>
                                                                </div>
                                                                {((tokenSelectorOpen === 'PAY' && payToken.symbol === t.symbol) || (tokenSelectorOpen === 'RECEIVE' && receiveToken.symbol === t.symbol)) && (
                                                                    <div className="ml-auto text-[#39b54a]"><CheckCircle size={14}/></div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {scanResult === 'SAFE' && (
                                            <div className="mb-4 bg-[#39b54a]/10 border border-[#39b54a] p-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center gap-2 text-[#39b54a] text-xs font-bold uppercase">
                                                    <ShieldCheck size={16} /> Audit Passed
                                                </div>
                                                <span className="text-[10px] text-[#39b54a]">Risk Score: 98/100</span>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                             {!scanResult && !swapSuccess && isConnected && amountVal > 0 && (
                                                 <Button 
                                                    variant="secondary" 
                                                    className="flex-1 text-xs py-3"
                                                    onClick={handleScanRisk}
                                                    disabled={isRiskScanning}
                                                 >
                                                     {isRiskScanning ? 'SCANNING...' : '🛡️ SCAN RISK'}
                                                 </Button>
                                             )}
                                             
                                            <Button 
                                                fullWidth 
                                                variant={swapSuccess ? 'primary' : hasInsufficientFunds ? 'outline' : 'primary'} 
                                                onClick={handleSwapClick}
                                                disabled={!isConnected || hasInsufficientFunds || amountVal <= 0 || swapSuccess || isRiskScanning}
                                                className={`${hasInsufficientFunds ? "border-red-500 text-red-500 hover:bg-red-500/10" : ""} flex-[2] py-3`}
                                            >
                                                {swapSuccess ? 'SWAP SUCCESSFUL' : !isConnected ? 'CONNECT WALLET' : hasInsufficientFunds ? 'INSUFFICIENT FUNDS' : 'SWAP TOKENS'}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                                {dexTab === 'POOL' && (
                                     <motion.div key="pool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
                                         <div className="text-center mb-6">
                                             <Droplets size={32} className="mx-auto text-[#666] mb-4" />
                                             <p className="text-xs text-[#888] mb-1">Provide liquidity to earn 0.25% fees.</p>
                                             <p className="text-xl font-bold text-white font-mono">APR: 14.5%</p>
                                         </div>
                                         <div className="space-y-4 mb-6">
                                             <div className="flex justify-between bg-[#111] p-3 border border-[#333]">
                                                 <span className="text-xs text-white">LMT</span>
                                                 <span className="text-xs text-[#39b54a] font-bold">50%</span>
                                             </div>
                                             <div className="flex justify-between bg-[#111] p-3 border border-[#333]">
                                                 <span className="text-xs text-white">{activeChain.symbol}</span>
                                                 <span className="text-xs text-[#39b54a] font-bold">50%</span>
                                             </div>
                                         </div>
                                         <Button fullWidth onClick={handlePoolClick} disabled={!isConnected || poolSuccess} variant="outline" className="py-3">
                                             {poolSuccess ? <><CheckCircle size={14} className="mr-2" /> LIQUIDITY ADDED</> : <><Plus size={14} className="mr-2" /> ADD LIQUIDITY</>}
                                         </Button>
                                     </motion.div>
                                )}
                                {dexTab === 'BRIDGE' && (
                                     <motion.div key="bridge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
                                         <div className="text-center mb-6">
                                             <Network size={32} className="mx-auto text-[#666] mb-4" />
                                             <p className="text-xs text-[#888] mb-4">Transfer assets across chains securely.</p>
                                         </div>
                                         <div className="flex items-center justify-between gap-2 mb-6">
                                             <div className="flex-1 bg-[#111] p-3 border border-[#333] text-center">
                                                 <div className="text-[10px] text-[#666] uppercase mb-1">From</div>
                                                 <div className="text-sm font-bold text-white">{activeChain.name}</div>
                                             </div>
                                             <ArrowRight size={16} className="text-[#666]" />
                                             <div className="flex-1 bg-[#111] p-3 border border-[#333] text-center">
                                                 <div className="text-[10px] text-[#666] uppercase mb-1">To</div>
                                                 <div className="text-sm font-bold text-white">Base</div>
                                             </div>
                                         </div>
                                         <Button fullWidth onClick={handleBridgeClick} disabled={!isConnected || bridgeSuccess} variant="outline" className="py-3">
                                             {bridgeSuccess ? <><CheckCircle size={14} className="mr-2" /> BRIDGE INITIATED</> : <><Globe size={14} className="mr-2" /> BRIDGE ASSETS</>}
                                         </Button>
                                     </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>
                </div>
            </div>
        </ScrollFade>
      </section>

      {/* -------------------- AGENTS SECTION -------------------- */}
      <section id="agents" className="bg-[#111111]/90 backdrop-blur-sm border-t border-[#1f1f1f] py-16 md:py-24 relative overflow-hidden z-20">
        <ScrollFade className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 w-full text-center md:text-left">
                    <Badge color="text-[#39b54a]">PHASE 3: AUTOMATION</Badge>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white leading-tight">Deploy Autonomous <br/> <span className="text-[#39b54a]">AI Agents</span></h2>
                    <p className="text-[#666666] text-base md:text-lg leading-relaxed mb-8">Spin up specialized AI agents to manage your protocol, optimize yield, or trade on your behalf.</p>
                </div>
                
                <div className="flex-1 w-full relative">
                     <Card className="max-w-md mx-auto relative overflow-hidden group border-t-4 border-t-[#39b54a] bg-[#0c0c0c]">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Bot size={20} className="text-[#39b54a]" />
                                <h3 className="font-bold text-white uppercase">Agent Constructor</h3>
                            </div>
                            <span className="text-[10px] text-[#39b54a] font-mono">ONLINE</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-[#666666] uppercase mb-1 block">Agent Function</label>
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    {['Trading Bot', 'Yield Optimizer', 'Community Mod'].map(func => (
                                        <button 
                                            key={func}
                                            onClick={() => setAgentFunction(func)}
                                            className={`text-[10px] font-bold py-2 border ${agentFunction === func ? 'bg-[#39b54a]/20 border-[#39b54a] text-[#39b54a]' : 'bg-[#111] border-[#333] text-[#666] hover:border-[#666]'}`}
                                        >
                                            {func}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[#666666] uppercase mb-1 block">Primary Directive</label>
                                <textarea 
                                    value={agentPurpose}
                                    onChange={(e) => setAgentPurpose(e.target.value)}
                                    placeholder="E.g., Monitor ETH pools and execute arb trades..."
                                    className="w-full bg-[#111] border border-[#333] text-white p-3 outline-none focus:border-[#39b54a] text-sm min-h-[100px] font-mono resize-none"
                                />
                            </div>
                            <Button fullWidth onClick={handleGenerateAgent} disabled={isGeneratingAgent || !agentPurpose} className="flex items-center justify-center gap-2 py-3">
                                {isGeneratingAgent ? <><Loader2 className="animate-spin" size={16} /> INITIALIZING ARCHITECTURE...</> : <><Terminal size={16} /> GENERATE AGENT</>}
                            </Button>
                        </div>
                     </Card>
                </div>
            </div>
        </ScrollFade>
      </section>

      {/* -------------------- TOKEN FACTORY -------------------- */}
      <section id="token-factory" className="bg-[#0c0c0c]/90 backdrop-blur-sm border-t border-[#1f1f1f] py-16 md:py-24 relative z-20">
        <ScrollFade className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                <div className="flex-1 w-full text-center md:text-left">
                    <Badge color="text-[#39b54a]">PHASE 4: TOKEN FACTORY</Badge>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white leading-tight">Standardized <br/> <span className="text-[#8b5cf6]">Token Generation</span></h2>
                    <p className="text-[#666666] text-base md:text-lg leading-relaxed mb-8">Launch your own custom ERC20 token in seconds.</p>
                </div>
                <div className="flex-1 w-full">
                    <Card className="max-w-md mx-auto relative overflow-hidden group hover:border-[#8b5cf6] transition-colors border-t-4 border-t-[#8b5cf6] bg-[#0c0c0c]">
                        <div className="flex items-center gap-3 mb-6">
                            <Coins size={20} className="text-[#8b5cf6]" />
                            <h3 className="font-bold text-white uppercase">Token Constructor</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-[#666] block mb-1">Name</label><Input value={tokenName} onChange={e => setTokenName(e.target.value)} placeholder="Bitcoin 2" className="py-2 text-sm"/></div>
                                <div><label className="text-xs font-bold text-[#666] block mb-1">Symbol</label><Input value={tokenSymbol} onChange={e => setTokenSymbol(e.target.value.toUpperCase())} placeholder="BTC2" className="py-2 text-sm uppercase"/></div>
                            </div>
                            <div><label className="text-xs font-bold text-[#666] block mb-1">Supply</label><Input type="number" value={tokenSupply} onChange={e => setTokenSupply(e.target.value)} className="py-2 text-sm"/></div>
                            <Button fullWidth onClick={handleTokenGenClick} disabled={isGeneratingToken || !tokenName} variant="secondary" className="py-3">
                                {isGeneratingToken ? <><Loader2 className="animate-spin" size={16} /> DEPLOYING...</> : <><Zap size={16} /> DEPLOY TOKEN</>}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </ScrollFade>
      </section>

      {/* ... Footer ... */}
      <footer className="bg-[#0c0c0c] border-t border-[#1f1f1f] py-16 relative z-20">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                    <Logo />
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Limetred<span className="text-[#39b54a]">.</span></h4>
                </div>
                <p className="text-[#666666] text-xs font-mono max-w-xs leading-relaxed mb-6">
                    The Venture-as-a-Service protocol. <br/> Built for speed. Secured by math.
                </p>
                <div className="flex gap-4">
                    <button className="text-[#666] hover:text-white transition-colors"><Twitter size={20}/></button>
                    <button className="text-[#666] hover:text-white transition-colors"><Github size={20}/></button>
                    <button className="text-[#666] hover:text-white transition-colors"><Disc size={20}/></button>
                </div>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
                <button onClick={(e) => openModal(e, 'DOCS')} className="text-xs text-[#666] hover:text-white uppercase font-bold text-left md:text-right transition-colors">Documentation</button>
                <button onClick={(e) => openModal(e, 'TOKENOMICS')} className="text-xs text-[#666] hover:text-white uppercase font-bold text-left md:text-right transition-colors">Tokenomics</button>
                <button onClick={(e) => openModal(e, 'AUDITS')} className="text-xs text-[#666] hover:text-white uppercase font-bold text-left md:text-right transition-colors">Security Audits</button>
                <div className="flex gap-4 mt-2">
                     <span className="text-[10px] text-[#444] font-mono">Terms of Service</span>
                     <span className="text-[10px] text-[#444] font-mono">Privacy Policy</span>
                </div>
            </div>
        </div>
      </footer>
      
      {/* Modals */}
      <AnimatePresence>
        {activeModal && PROTOCOL_CONTENT[activeModal] && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-[#111] border border-[#39b54a] w-full max-w-2xl max-h-[80vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-[#1f1f1f] bg-[#0c0c0c] sticky top-0">
                    <div className="flex items-center gap-3">
                        {PROTOCOL_CONTENT[activeModal].icon}
                        <h3 className="text-lg font-black uppercase text-white tracking-wider">{PROTOCOL_CONTENT[activeModal].title}</h3>
                    </div>
                    <button onClick={() => setActiveModal(null)}><X className="text-[#666] hover:text-white"/></button>
                </div>
                {PROTOCOL_CONTENT[activeModal].content}
                <div className="p-6 border-t border-[#1f1f1f] flex justify-end">
                    <Button onClick={() => setActiveModal(null)} variant="outline" className="text-xs py-2">CLOSE MODULE</Button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-marquee { animation: marquee 30s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
      `}</style>
    </div>
  );
};

export default HeroSection;
