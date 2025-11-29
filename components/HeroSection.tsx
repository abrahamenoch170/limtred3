import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Badge, Card } from './ui/GlintComponents';
import { MOCK_TICKER, CHAINS } from '../constants';
import { Zap, Shield, ChevronDown, Twitter, Github, Disc, ArrowRight, Lock, Activity, Repeat, X, Search, Wallet, BookOpen, Layers, Network, Image as ImageIcon, Paperclip, Bot, Loader2, CheckCircle, Clock, Coins, Menu, BarChart3, ArrowLeftRight, Droplets, AlertTriangle, ScanLine, Terminal } from 'lucide-react';
import { WalletBalance, ChainId } from '../types';
import { TextReveal, ScrollFade, StaggerContainer, StaggerItem } from './ui/MotionComponents';

interface HeroSectionProps {
  onGenerate: (prompt: string, imageBase64?: string) => void;
  onConnectWallet: () => void;
  isConnected: boolean;
  walletBalance: WalletBalance;
  onSwap: (sol: number, lmt: number) => boolean;
  currentChain: ChainId;
  onOpenLaunchpad?: () => void;
  onGenerateToken?: (name: string, symbol: string, supply: string, decimals: string) => void;
}

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M0 0H14V6H6V26H26V18H32V32H0V0Z" fill="#39b54a"/>
    <rect x="18" y="0" width="14" height="14" fill="white"/>
  </svg>
);

// ... (Modal Content Types & Data remain unchanged) ...
type ModalType = 'DOCS' | 'TOKENOMICS' | 'BOUNTY' | 'AUDITS' | 'WHITEPAPER' | 'VESTING' | null;

const PROTOCOL_CONTENT = {
  DOCS: { title: "PROTOCOL DOCUMENTATION", icon: <Layers size={24} className="text-[#39b54a]" />, content: <div className="text-gray-400 text-sm">Full documentation loaded...</div> },
  TOKENOMICS: { title: "TOKEN ECONOMICS", icon: <Activity size={24} className="text-[#8b5cf6]" />, content: <div className="text-gray-400 text-sm">Tokenomics loaded...</div> },
  BOUNTY: { title: "BUG BOUNTY PROGRAM", icon: <Bot size={24} className="text-red-500" />, content: <div className="text-gray-400 text-sm">Bounty program loaded...</div> },
  AUDITS: { title: "SECURITY AUDITS", icon: <Shield size={24} className="text-[#39b54a]" />, content: <div className="text-gray-400 text-sm">Audits loaded...</div> },
  VESTING: { title: "VESTING SCHEDULES", icon: <Clock size={24} className="text-[#39b54a]" />, content: <div className="text-gray-400 text-sm">Vesting loaded...</div> },
  WHITEPAPER: { title: "LIMETRED WHITE PAPER", icon: <BookOpen size={24} className="text-white" />, content: <div className="text-gray-400 text-sm">Whitepaper loaded...</div> },
};

const HeroSection: React.FC<HeroSectionProps> = ({ 
  onGenerate, 
  onConnectWallet, 
  isConnected,
  walletBalance,
  onSwap,
  currentChain,
  onOpenLaunchpad,
  onGenerateToken
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // DEX State
  const [dexTab, setDexTab] = useState<'SWAP' | 'POOL' | 'BRIDGE'>('SWAP');
  const [swapAmount, setSwapAmount] = useState('1.0');
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [isRiskScanning, setIsRiskScanning] = useState(false);
  const [riskScore, setRiskScore] = useState<'SAFE' | 'WARN' | 'CRITICAL' | null>(null);
  
  // Agent State
  const [agentPurpose, setAgentPurpose] = useState('');
  const [agentFunction, setAgentFunction] = useState('Trading Bot');
  const [isGeneratingAgent, setIsGeneratingAgent] = useState(false);
  const [agentSuccess, setAgentSuccess] = useState(false);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  
  // Token Generator State
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState('1000000000');
  const [tokenDecimals, setTokenDecimals] = useState('18');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  const activeChain = CHAINS[currentChain];
  const amountVal = parseFloat(swapAmount) || 0;
  const hasInsufficientFunds = isConnected && amountVal > walletBalance.native;

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

  const handleSwapClick = () => {
    if (!isConnected || hasInsufficientFunds || amountVal <= 0) return;
    setIsRiskScanning(true);
    setRiskScore(null);
    setTimeout(() => {
        setIsRiskScanning(false);
        setRiskScore('SAFE');
        setTimeout(() => {
            if (!isNaN(amountVal) && amountVal > 0) {
                const received = amountVal * 14020.5;
                const success = onSwap(amountVal, received);
                if (success) {
                    setSwapSuccess(true);
                    setTimeout(() => {
                        setSwapSuccess(false);
                        setRiskScore(null);
                    }, 2000);
                }
            }
        }, 800);
    }, 1500);
  };

  const handleGenerateAgent = () => {
    if (!agentPurpose.trim()) return;
    setIsGeneratingAgent(true);
    setAgentLogs([]);
    const logs = ["Analyzing directives...", "Verifying contracts...", "Deploying container...", "Agent Live."];
    let delay = 0;
    logs.forEach((log, i) => {
        setTimeout(() => {
            setAgentLogs(prev => [...prev, `> ${log}`]);
            if (i === logs.length - 1) {
                setIsGeneratingAgent(false);
                setAgentSuccess(true);
                setTimeout(() => setAgentSuccess(false), 3000);
                setAgentPurpose('');
            }
        }, delay);
        delay += 800;
    });
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

  // Fix: Improved Scroll Logic for Mobile and Desktop
  const scrollToSection = (id: string) => {
      setIsMobileMenuOpen(false);
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  return (
    <div ref={containerRef} className="h-full relative overflow-y-auto no-scrollbar scroll-smooth bg-transparent">
      {/* -------------------- NAVBAR -------------------- */}
      <nav className="sticky top-0 z-50 bg-[#0c0c0c]/80 backdrop-blur-xl border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Logo />
                <span className="font-bold uppercase tracking-wider text-white hidden md:block text-lg">Limetred</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
                <button onClick={() => onOpenLaunchpad && onOpenLaunchpad()} className="text-xs font-bold uppercase text-[#888] hover:text-[#39b54a] transition-colors tracking-widest">Launchpad</button>
                <button onClick={() => scrollToSection('dex')} className="text-xs font-bold uppercase text-[#888] hover:text-[#39b54a] transition-colors tracking-widest">DEX</button>
                <button onClick={() => scrollToSection('agents')} className="text-xs font-bold uppercase text-[#888] hover:text-[#39b54a] transition-colors tracking-widest">Agents</button>
                <button onClick={() => scrollToSection('token-factory')} className="text-xs font-bold uppercase text-[#888] hover:text-[#39b54a] transition-colors tracking-widest">Factory</button>
                <Button 
                    variant={isConnected ? "outline" : "primary"} 
                    className="py-2 px-6 text-xs flex items-center gap-2"
                    onClick={onConnectWallet}
                >
                    {isConnected && <Wallet size={14} />}
                    {isConnected ? "0x8A...4B2F" : "CONNECT WALLET"}
                </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-3">
                 <Button 
                    variant={isConnected ? "outline" : "primary"} 
                    className="py-1 px-3 text-[10px] flex items-center gap-2 h-8"
                    onClick={onConnectWallet}
                >
                    {isConnected ? "0x8A..." : "CONNECT"}
                </Button>
                <button onClick={toggleMobileMenu} className="text-white p-2">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="md:hidden bg-[#0c0c0c] border-b border-[#1f1f1f] overflow-hidden absolute w-full z-50 shadow-2xl"
                >
                    <div className="p-6 flex flex-col gap-4">
                        <button 
                            onClick={() => { onOpenLaunchpad && onOpenLaunchpad(); toggleMobileMenu(); }}
                            className="text-sm font-bold uppercase text-white py-3 border-b border-[#1f1f1f] flex items-center gap-3"
                        >
                            <Zap size={16} className="text-[#39b54a]" /> Launchpad
                        </button>
                        <button onClick={() => scrollToSection('dex')} className="text-sm font-bold uppercase text-white py-3 border-b border-[#1f1f1f] flex items-center gap-3">
                            <ArrowLeftRight size={16} className="text-[#8b5cf6]" /> DEX & Swap
                        </button>
                        <button onClick={() => scrollToSection('agents')} className="text-sm font-bold uppercase text-white py-3 border-b border-[#1f1f1f] flex items-center gap-3">
                             <Bot size={16} className="text-[#39b54a]" /> AI Agents
                        </button>
                        <button onClick={() => scrollToSection('token-factory')} className="text-sm font-bold uppercase text-white py-3 flex items-center gap-3">
                             <Coins size={16} className="text-[#8b5cf6]" /> Token Factory
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </nav>

      {/* -------------------- HERO -------------------- */}
      <div className="min-h-[calc(100vh-64px)] flex flex-col relative z-10">
        <div className="w-full bg-[#111111]/90 border-b border-[#1f1f1f] h-10 flex items-center overflow-hidden whitespace-nowrap z-20 shrink-0">
          <div className="animate-marquee flex space-x-12 px-4">
            {[...MOCK_TICKER, ...MOCK_TICKER].map((item, i) => (
              <span key={i} className="font-mono text-xs text-[#666666] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39b54a] animate-pulse"></span>
                <span className="text-white font-bold">{item.user}</span> deployed <span className="text-[#39b54a]">{item.app}</span> ({item.gain})
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-4 max-w-5xl mx-auto w-full py-12 md:py-20">
             {/* ... Hero Content ... */}
             <div className="flex justify-center mb-6">
                <Badge color="text-[#8b5cf6] border-[#8b5cf6] bg-[#8b5cf6]/10">AI VENTURE PROTOCOL V1.0</Badge>
             </div>
             
             <div className="flex justify-center">
               <TextReveal 
                  text="LIMETRED" 
                  className="text-5xl sm:text-6xl md:text-9xl font-black text-center mb-6 tracking-tighter uppercase text-white select-none leading-[0.85]" 
               />
             </div>
             
             <ScrollFade delay={0.4} className="max-w-2xl mx-auto text-center mb-12">
                <p className="text-[#39b54a] font-bold tracking-[0.2em] text-[10px] md:text-xs uppercase mb-4 animate-pulse">
                    Venture-as-a-Service Protocol
                </p>
                <p className="text-[#cccccc] text-base md:text-xl font-light leading-relaxed mb-6 px-4">
                    Launch a fully functional dApp, token, and liquidity market from a single text prompt.
                </p>
            </ScrollFade>

            <ScrollFade delay={0.6}>
              <form onSubmit={handleSubmit} className="w-full relative group max-w-3xl mx-auto px-2 md:px-0">
                <div className="relative">
                  <Input 
                    autoFocus
                    placeholder="Describe your billion-dollar idea..." 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-xl md:text-3xl text-center placeholder:text-[#333] border-[#39b54a] bg-black/60 backdrop-blur-md focus:bg-black/90 h-24 md:h-32 pr-12 rounded-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-[#666] hover:text-white transition-colors"><ImageIcon size={20} /></button>
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
                
                <div className="mt-8 md:mt-12 flex justify-center">
                  <Button type="submit" variant="primary" className="w-full md:w-auto min-w-[240px] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(57,181,74,0.4)] text-base md:text-lg">
                    <Zap size={20} /> INITIALIZE PROTOCOL
                  </Button>
                </div>
              </form>
            </ScrollFade>
        </div>
      </div>

      {/* -------------------- LAUNCHPAD -------------------- */}
      <section id="launchpad" className="bg-[#111111]/90 backdrop-blur-sm border-t border-[#1f1f1f] py-16 md:py-24 relative overflow-hidden">
        <ScrollFade className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                    <Badge color="text-[#8b5cf6]">PHASE 1: INCUBATION</Badge>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white">The Fair Launch <br/> <span className="text-[#39b54a]">Bonding Curve</span></h2>
                    <p className="text-[#666666] text-base md:text-lg leading-relaxed mb-8">Every app generated on Limetred starts on a mathematical bonding curve. No pre-sale. No insiders. Just pure price discovery.</p>
                    <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto justify-center" onClick={onOpenLaunchpad}>OPEN LAUNCHPAD APP <ArrowRight size={16} /></Button>
                </div>
                <div className="flex-1 w-full relative">
                     <Card className="h-[300px] md:h-[400px] flex items-center justify-center relative border-l-4 border-l-[#39b54a] bg-[#0c0c0c]">
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

      {/* -------------------- DEX SECTION (FIXED ID) -------------------- */}
      <section id="dex" className="bg-[#0c0c0c]/90 backdrop-blur-sm border-t border-[#1f1f1f] py-16 md:py-24 relative scroll-mt-20">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#8b5cf6]/5 to-transparent pointer-events-none"></div>
        <ScrollFade className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                
                {/* Left: Info */}
                <div className="flex-1 sticky top-24">
                    <Badge color="text-[#39b54a]">PHASE 2: TRADING</Badge>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white">Limetred <br/> <span className="text-[#8b5cf6]">Terminal</span></h2>
                    <p className="text-[#666666] text-base md:text-lg leading-relaxed mb-8">
                        A fully integrated aggregation layer. Swap tokens, bridge assets, and provide liquidity directly from the protocol interface.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 border border-[#1f1f1f] bg-[#111]">
                            <ScanLine className="text-[#39b54a] mt-1" size={20} />
                            <div>
                                <h4 className="text-white font-bold text-sm uppercase">AI Safety Layer</h4>
                                <p className="text-[#666] text-xs mt-1">Every transaction is simulated. The AI warns you of honey-pots, high taxes, or ownership issues.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 border border-[#1f1f1f] bg-[#111]">
                            <BarChart3 className="text-[#8b5cf6] mt-1" size={20} />
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
                        
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                {dexTab === 'SWAP' && (
                                    <motion.div key="swap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="font-bold uppercase text-white">Market Order</span>
                                            <span className="text-xs text-[#666666] font-mono">SLIPPAGE: AUTO</span>
                                        </div>
                                        
                                        <div className="bg-[#111] p-4 mb-2 border border-[#333] hover:border-[#666] transition-colors relative">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-[#666666] font-bold">PAY</span>
                                                <span className="text-xs text-[#666666]">BAL: {isConnected ? walletBalance.native.toFixed(4) : '--'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <input 
                                                    type="number"
                                                    value={swapAmount}
                                                    onChange={(e) => setSwapAmount(e.target.value)}
                                                    className="bg-transparent text-2xl font-bold font-mono text-white w-full outline-none placeholder-[#333]"
                                                    placeholder="0.00"
                                                />
                                                <button className="bg-[#1f1f1f] px-3 py-1 text-xs font-bold rounded-full flex items-center gap-2 hover:bg-[#333]">
                                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeChain.color }}></div>
                                                    {activeChain.symbol} <ChevronDown size={12}/>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-center -my-3 relative z-10">
                                            <div className="bg-[#000] p-2 border border-[#333] rounded-full hover:border-[#39b54a] transition-all cursor-pointer">
                                                <ArrowLeftRight size={16} className="rotate-90 text-[#39b54a]" />
                                            </div>
                                        </div>

                                        <div className="bg-[#111] p-4 mt-2 mb-6 border border-[#333] hover:border-[#666] transition-colors">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-[#666666] font-bold">RECEIVE</span>
                                                <span className="text-xs text-[#666666]">EST: {(parseFloat(swapAmount || '0') * 14020).toLocaleString()} LMT</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-2xl font-bold font-mono text-[#39b54a]">
                                                    {(parseFloat(swapAmount || '0') * 14020.5).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                                </span>
                                                <button className="bg-[#1f1f1f] px-3 py-1 text-xs font-bold rounded-full flex items-center gap-2 hover:bg-[#333]">
                                                    <div className="w-4 h-4 rounded-full bg-[#39b54a]"></div>
                                                    LMT <ChevronDown size={12}/>
                                                </button>
                                            </div>
                                        </div>

                                        <Button 
                                            fullWidth 
                                            variant={swapSuccess ? 'primary' : hasInsufficientFunds ? 'outline' : 'secondary'} 
                                            onClick={handleSwapClick}
                                            disabled={!isConnected || hasInsufficientFunds || amountVal <= 0 || swapSuccess || isRiskScanning}
                                            className={hasInsufficientFunds ? "border-red-500 text-red-500 hover:bg-red-500/10" : ""}
                                        >
                                            {isRiskScanning ? <><Loader2 className="animate-spin mr-2"/> CHECKING...</> : swapSuccess ? 'SWAP SUCCESSFUL' : !isConnected ? 'CONNECT WALLET' : hasInsufficientFunds ? 'INSUFFICIENT FUNDS' : 'SWAP TOKENS'}
                                        </Button>
                                    </motion.div>
                                )}
                                {dexTab === 'POOL' && (
                                     <motion.div key="pool" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                                         <Droplets size={32} className="mx-auto text-[#666] mb-4" />
                                         <p className="text-xs text-[#888] mb-4">Provide liquidity to earn 0.25% fees.</p>
                                         <Button fullWidth variant="outline">ADD LIQUIDITY</Button>
                                     </motion.div>
                                )}
                                {dexTab === 'BRIDGE' && (
                                     <motion.div key="bridge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
                                         <Network size={32} className="mx-auto text-[#666] mb-4" />
                                         <p className="text-xs text-[#888] mb-4">Transfer assets across chains.</p>
                                         <Button fullWidth variant="outline">BRIDGE ASSETS</Button>
                                     </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>
                </div>
            </div>
        </ScrollFade>
      </section>

      {/* -------------------- AGENTS SECTION (FIXED ID) -------------------- */}
      <section id="agents" className="bg-[#111111]/90 backdrop-blur-sm border-t border-[#1f1f1f] py-16 md:py-24 relative overflow-hidden scroll-mt-20">
        <ScrollFade className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                    <Badge color="text-[#39b54a]">PHASE 3: AUTOMATION</Badge>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white">Deploy Autonomous <br/> <span className="text-[#39b54a]">AI Agents</span></h2>
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
                                <label className="text-xs font-bold text-[#666666] uppercase mb-1 block">Agent Directives</label>
                                <textarea 
                                    value={agentPurpose}
                                    onChange={(e) => setAgentPurpose(e.target.value)}
                                    placeholder="Define agent behavior..."
                                    className="w-full bg-[#111] border border-[#333] text-white p-3 outline-none focus:border-[#39b54a] text-sm min-h-[100px] font-mono"
                                />
                            </div>
                            <AnimatePresence>
                                {isGeneratingAgent && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-black border border-[#333] p-3 font-mono text-[10px] text-[#39b54a] h-24 overflow-y-auto">
                                        {agentLogs.map((log, i) => <div key={i}>{log}</div>)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <Button fullWidth onClick={handleGenerateAgent} disabled={isGeneratingAgent || !agentPurpose} className="flex items-center justify-center gap-2">
                                {isGeneratingAgent ? <><Loader2 className="animate-spin" size={16} /> INITIALIZING...</> : agentSuccess ? <><CheckCircle size={16} /> AGENT DEPLOYED</> : <><Terminal size={16} /> GENERATE AGENT</>}
                            </Button>
                        </div>
                     </Card>
                </div>
            </div>
        </ScrollFade>
      </section>

      {/* -------------------- TOKEN FACTORY (FIXED ID) -------------------- */}
      <section id="token-factory" className="bg-[#0c0c0c]/90 backdrop-blur-sm border-t border-[#1f1f1f] py-16 md:py-24 relative scroll-mt-20">
        <ScrollFade className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                <div className="flex-1">
                    <Badge color="text-[#39b54a]">PHASE 4: TOKEN FACTORY</Badge>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white">Standardized <br/> <span className="text-[#8b5cf6]">Token Generation</span></h2>
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
                            <Button fullWidth onClick={handleTokenGenClick} disabled={isGeneratingToken || !tokenName} variant="secondary">
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
         {/* Kept existing footer */}
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                    <Logo />
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Limetred<span className="text-[#39b54a]">.</span></h4>
                </div>
                <p className="text-[#666666] text-xs font-mono max-w-xs leading-relaxed mb-6">
                    The Venture-as-a-Service protocol. <br/> Built for speed. Secured by math.
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <button onClick={(e) => openModal(e, 'DOCS')} className="text-xs text-[#666] hover:text-white uppercase font-bold text-left">Documentation</button>
                <button onClick={(e) => openModal(e, 'TOKENOMICS')} className="text-xs text-[#666] hover:text-white uppercase font-bold text-left">Tokenomics</button>
                <button onClick={(e) => openModal(e, 'AUDITS')} className="text-xs text-[#666] hover:text-white uppercase font-bold text-left">Security Audits</button>
            </div>
        </div>
      </footer>
      
      {/* Modals */}
      <AnimatePresence>
        {activeModal && PROTOCOL_CONTENT[activeModal] && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            <motion.div className="bg-[#111111] border border-[#39b54a] w-full max-w-2xl p-8" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase text-white">{PROTOCOL_CONTENT[activeModal].title}</h3>
                    <button onClick={() => setActiveModal(null)}><X className="text-[#666] hover:text-white"/></button>
                </div>
                {PROTOCOL_CONTENT[activeModal].content}
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
