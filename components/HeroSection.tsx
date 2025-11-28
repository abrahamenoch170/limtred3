import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Badge, Card } from './ui/GlintComponents';
import { MOCK_TICKER, COLORS, CHAINS } from '../constants';
import { Zap, Shield, Cpu, ChevronDown, Twitter, Github, Disc, ArrowRight, Lock, Activity, Repeat, X, FileText, Bug, Search, Wallet } from 'lucide-react';
import { WalletBalance, ChainId } from '../types';

interface HeroSectionProps {
  onGenerate: (prompt: string) => void;
  onConnectWallet: () => void;
  isConnected: boolean;
  walletBalance: WalletBalance;
  onSwap: (sol: number, lmt: number) => boolean;
  currentChain: ChainId;
}

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M0 0H14V6H6V26H26V18H32V32H0V0Z" fill="#39b54a"/>
    <rect x="18" y="0" width="14" height="14" fill="white"/>
  </svg>
);

// --- MODAL CONTENT DATA ---
type ModalType = 'DOCS' | 'TOKENOMICS' | 'BOUNTY' | 'AUDITS' | null;

const PROTOCOL_CONTENT = {
  DOCS: {
    title: "PROTOCOL DOCUMENTATION",
    icon: <FileText size={24} className="text-[#39b54a]" />,
    content: (
      <div className="space-y-6 text-sm text-[#cccccc] font-mono leading-relaxed">
        <div className="bg-[#111] p-4 border border-[#1f1f1f]">
          <h4 className="text-white font-bold mb-2 uppercase">1. Architecture Overview</h4>
          <p>Limetred utilizes a proprietary generative pipeline:
            <br/>- <span className="text-[#39b54a]">Input:</span> Natural Language Intent
            <br/>- <span className="text-[#39b54a]">Processing:</span> Google Gemini 1.5 Flash (Reasoning)
            <br/>- <span className="text-[#39b54a]">Output:</span> AST-verified Solidity 0.8.20 + React 18 Frontend
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2 uppercase">2. The Bonding Curve</h4>
          <p>Every token launches on a strictly defined mathematical curve <span className="text-[#39b54a]">(y = x^2)</span>. Price increases exponentially as supply is bought. There are no seed rounds, pre-mines, or insider allocations.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-2 uppercase">3. Graduation Mechanism</h4>
          <p>When the market cap reaches <span className="text-[#39b54a]">$60,000 USD</span>, the bonding curve is halted. 100% of the liquidity is migrated to a Raydium AMM pool and the LP tokens are burned, creating a permanently solvent market.</p>
        </div>
      </div>
    )
  },
  TOKENOMICS: {
    title: "TOKEN ECONOMICS",
    icon: <Activity size={24} className="text-[#8b5cf6]" />,
    content: (
      <div className="space-y-6 text-sm text-[#cccccc] font-mono leading-relaxed">
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] p-4 border border-[#1f1f1f]">
                <div className="text-xs text-[#666666]">MAX SUPPLY</div>
                <div className="text-xl font-bold text-white">1,000,000,000</div>
            </div>
            <div className="bg-[#111] p-4 border border-[#1f1f1f]">
                <div className="text-xs text-[#666666]">TICKER</div>
                <div className="text-xl font-bold text-[#39b54a]">$LMT</div>
            </div>
        </div>
        
        <div className="bg-[#111] p-4 border border-[#1f1f1f]">
          <h4 className="text-white font-bold mb-4 uppercase">Fair Launch Distribution</h4>
          <ul className="space-y-3">
            <li className="flex justify-between border-b border-[#333] pb-2">
                <span>Bonding Curve Allocation</span>
                <span className="text-white font-bold">80%</span>
            </li>
            <li className="flex justify-between border-b border-[#333] pb-2">
                <span>Liquidity Pool (Raydium)</span>
                <span className="text-white font-bold">15%</span>
            </li>
            <li className="flex justify-between border-b border-[#333] pb-2">
                <span>Ecosystem / CEX</span>
                <span className="text-white font-bold">5%</span>
            </li>
            <li className="flex justify-between pt-2">
                <span>Team / Insiders</span>
                <span className="text-[#39b54a] font-bold">0%</span>
            </li>
          </ul>
        </div>
      </div>
    )
  },
  BOUNTY: {
    title: "BUG BOUNTY PROGRAM",
    icon: <Bug size={24} className="text-red-500" />,
    content: (
      <div className="space-y-6 text-sm text-[#cccccc] font-mono leading-relaxed">
        <p>Limetred prioritizes security. Our whitehat program rewards researchers for identifying vulnerabilities in the core protocol contracts.</p>
        
        <div className="space-y-2">
            <div className="flex items-center justify-between bg-[#111] p-3 border-l-4 border-red-500">
                <span className="font-bold text-white">CRITICAL</span>
                <span className="font-mono text-[#39b54a]">Up to $50,000 USDC</span>
            </div>
            <div className="flex items-center justify-between bg-[#111] p-3 border-l-4 border-orange-500">
                <span className="font-bold text-white">HIGH</span>
                <span className="font-mono text-[#39b54a]">Up to $10,000 USDC</span>
            </div>
            <div className="flex items-center justify-between bg-[#111] p-3 border-l-4 border-yellow-500">
                <span className="font-bold text-white">MEDIUM</span>
                <span className="font-mono text-[#39b54a]">Up to $2,000 USDC</span>
            </div>
        </div>

        <div className="bg-[#111] p-4 border border-[#1f1f1f] text-xs">
            <p className="mb-2 uppercase font-bold text-[#666666]">Scope</p>
            <ul className="list-disc list-inside space-y-1">
                <li>LimetredFactory.sol</li>
                <li>LimetredRouter.sol</li>
                <li>BondingCurve.sol</li>
            </ul>
        </div>
        
        <Button variant="outline" fullWidth className="text-xs mt-4">SUBMIT REPORT (PGP REQUIRED)</Button>
      </div>
    )
  },
  AUDITS: {
    title: "SECURITY AUDITS",
    icon: <Search size={24} className="text-[#39b54a]" />,
    content: (
      <div className="space-y-6 text-sm text-[#cccccc] font-mono leading-relaxed">
        <p>Our smart contract templates are formally verified and undergo continuous automated auditing.</p>
        
        <div className="grid grid-cols-1 gap-4">
             <div className="bg-[#111] p-4 border border-[#39b54a] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#39b54a] text-black text-[10px] font-bold px-2 py-1">PASSED</div>
                <h4 className="font-bold text-white">CertiK</h4>
                <p className="text-xs text-[#666666] mt-1">Comprehensive Protocol Audit</p>
                <div className="mt-4 text-xs font-mono">Score: 94/100</div>
             </div>
             
             <div className="bg-[#111] p-4 border border-[#1f1f1f] relative opacity-75">
                <div className="absolute top-0 right-0 bg-[#333] text-[#666666] text-[10px] font-bold px-2 py-1">IN PROGRESS</div>
                <h4 className="font-bold text-white">Halborn</h4>
                <p className="text-xs text-[#666666] mt-1">Penetration Testing</p>
                <div className="mt-4 text-xs font-mono">Est. Completion: Q4 2024</div>
             </div>
        </div>
        
        <div className="bg-[#0c0c0c] p-4 border border-[#1f1f1f] mt-4">
             <h4 className="text-[#39b54a] text-xs font-bold uppercase mb-2">Automated Safety</h4>
             <p className="text-xs">Every deployment runs through Slither and Mythril static analysis before hitting the mainnet.</p>
        </div>
      </div>
    )
  }
};


const HeroSection: React.FC<HeroSectionProps> = ({ 
  onGenerate, 
  onConnectWallet, 
  isConnected,
  walletBalance,
  onSwap,
  currentChain
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  // DEX State
  const [swapAmount, setSwapAmount] = useState('1.0');
  const [swapSuccess, setSwapSuccess] = useState(false);
  
  const activeChain = CHAINS[currentChain];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const handleSwapClick = () => {
    if (!isConnected) {
        onConnectWallet();
        return;
    }
    const amount = parseFloat(swapAmount);
    if (!isNaN(amount) && amount > 0) {
        // Exchange Rate Mock: 1 Native = 14020 LMT
        const received = amount * 14020.5;
        const success = onSwap(amount, received);
        if (success) {
            setSwapSuccess(true);
            setTimeout(() => setSwapSuccess(false), 2000);
        }
    }
  };

  const openModal = (e: React.MouseEvent, type: ModalType) => {
    e.preventDefault();
    setActiveModal(type);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full relative overflow-y-auto no-scrollbar scroll-smooth bg-[#0c0c0c]"
    >
      {/* -------------------- NAVBAR -------------------- */}
      <nav className="sticky top-0 z-40 bg-[#0c0c0c]/80 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Logo />
                <span className="font-bold uppercase tracking-wider text-white hidden md:block text-lg">Limetred</span>
            </div>
            
            <div className="flex items-center gap-6">
                <a href="#launchpad" className="text-xs font-bold uppercase text-[#666666] hover:text-white transition-colors hidden md:block">Launchpad</a>
                <a href="#dex" className="text-xs font-bold uppercase text-[#666666] hover:text-white transition-colors hidden md:block">DEX</a>
                <Button 
                    variant={isConnected ? "outline" : "primary"} 
                    className="py-2 px-6 text-xs flex items-center gap-2"
                    onClick={onConnectWallet}
                >
                    {isConnected && <Wallet size={14} />}
                    {isConnected ? "0x8A...4B2F" : "CONNECT WALLET"}
                </Button>
            </div>
        </div>
      </nav>

      {/* -------------------- HERO (ABOVE THE FOLD) -------------------- */}
      <div className="min-h-[calc(100vh-64px)] flex flex-col relative z-10">
        
        {/* Marquee Ticker */}
        <div className="w-full bg-[#111111] border-b border-[#1f1f1f] h-10 flex items-center overflow-hidden whitespace-nowrap z-20 shrink-0">
          <div className="animate-marquee flex space-x-8 px-4">
            {[...MOCK_TICKER, ...MOCK_TICKER, ...MOCK_TICKER].map((item, i) => (
              <span key={i} className="font-mono text-xs text-[#666666]">
                <span className="text-white font-bold">{item.user}</span> just shipped <span className="text-[#39b54a]">{item.app}</span> ({item.gain})
              </span>
            ))}
          </div>
        </div>

        {/* Main Input Area */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 max-w-5xl mx-auto w-full py-20">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
             <div className="flex justify-center mb-6">
                <Badge color="text-[#8b5cf6]">AI VENTURE PROTOCOL V1.0</Badge>
             </div>
             
             <h1 className="text-6xl md:text-9xl font-black text-center mb-6 tracking-tighter uppercase text-white select-none leading-[0.85]">
              Lime<span className="text-[#39b54a]">tred</span>
            </h1>
            
            <p className="text-[#666666] text-center mb-16 font-mono text-sm tracking-widest uppercase max-w-xl mx-auto">
              The first "Text-to-Venture" engine. <br/>
              We automate Code, Liquidity, and Tokenomics in one prompt.
            </p>

            <form onSubmit={handleSubmit} className="w-full relative group max-w-3xl mx-auto">
              <div className="relative">
                <Input 
                  autoFocus
                  placeholder="Describe your billion-dollar idea..." 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="text-2xl md:text-4xl text-center placeholder:text-[#333] border-[#39b54a] bg-black/50 backdrop-blur-sm focus:bg-black/80 h-32"
                />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#39b54a] to-transparent opacity-50" />
              </div>
              
              <motion.div 
                className="mt-12 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: prompt ? 1 : 0 }}
              >
                <Button type="submit" variant="primary" className="min-w-[240px] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(57,181,74,0.4)] text-lg">
                  <Zap size={20} /> INITIALIZE PROTOCOL
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center text-[#666666] gap-2 pointer-events-none"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest">Protocol Specs</span>
          <ChevronDown className="animate-bounce" size={16} />
        </motion.div>

        {/* Background Grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
          style={{ 
            backgroundImage: `linear-gradient(${COLORS.border} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
          }} 
        />
      </div>

      {/* -------------------- LAUNCHPAD SECTION -------------------- */}
      <section id="launchpad" className="bg-[#111111] border-t border-[#1f1f1f] py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                    <Badge color="text-[#8b5cf6]">PHASE 1: INCUBATION</Badge>
                    <h2 className="text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white">
                        The Fair Launch <br/> <span className="text-[#39b54a]">Bonding Curve</span>
                    </h2>
                    <p className="text-[#666666] text-lg leading-relaxed mb-8">
                        Every app generated on Limetred starts on a mathematical bonding curve. 
                        No pre-sale. No insiders. Just pure price discovery.
                    </p>
                    <ul className="space-y-4 mb-8">
                        <ListItem text="Start Market Cap: $1k" />
                        <ListItem text="Graduation Target: $60k" />
                        <ListItem text="Trading Fee: 1%" />
                    </ul>
                    <Button variant="outline" className="flex items-center gap-2" onClick={onConnectWallet}>
                        VIEW LIVE CURVES <ArrowRight size={16} />
                    </Button>
                </div>
                
                <div className="flex-1 relative">
                     {/* Visual Representation of Curve */}
                     <Card className="h-[400px] flex items-center justify-center relative border-l-4 border-l-[#39b54a] bg-[#0c0c0c]">
                        <div className="absolute inset-0 opacity-20" 
                             style={{ backgroundImage: 'radial-gradient(#39b54a 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                        />
                        <div className="w-full h-full p-8 flex items-end">
                            <div className="w-full h-full relative">
                                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                    <path d="M0,100 C50,100 70,80 100,0" fill="none" stroke="#39b54a" strokeWidth="2" />
                                    <circle cx="0" cy="100" r="2" fill="#39b54a" className="animate-ping" />
                                    <circle cx="100" cy="0" r="2" fill="#fff" />
                                </svg>
                                <div className="absolute top-0 right-0 bg-[#39b54a] text-black text-xs font-bold px-2 py-1 transform translate-x-1/2 -translate-y-1/2">
                                    {activeChain.dex.toUpperCase()} MIGRATION
                                </div>
                            </div>
                        </div>
                     </Card>
                </div>
            </div>
        </div>
      </section>

      {/* -------------------- DEX SECTION -------------------- */}
      <section id="dex" className="bg-[#0c0c0c] border-t border-[#1f1f1f] py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
                <div className="flex-1">
                    <Badge color="text-[#39b54a]">PHASE 2: TRADING</Badge>
                    <h2 className="text-5xl font-black uppercase tracking-tighter mt-4 mb-6 text-white">
                        Instant Liquidity <br/> <span className="text-[#8b5cf6]">On {activeChain.dex}</span>
                    </h2>
                    <p className="text-[#666666] text-lg leading-relaxed mb-8">
                        Once a curve completes, liquidity is automatically seeded into a {activeChain.dex} AMM pool and burned.
                        Limetred apps are composable with the entire {activeChain.name} ecosystem instantly.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#111111] p-4 border border-[#1f1f1f]">
                            <Repeat size={24} className="text-[#8b5cf6] mb-2" />
                            <h4 className="font-bold text-white uppercase">Auto-Swap</h4>
                            <p className="text-[#666666] text-xs">Seamless routing through aggregators.</p>
                        </div>
                        <div className="bg-[#111111] p-4 border border-[#1f1f1f]">
                            <Lock size={24} className="text-[#8b5cf6] mb-2" />
                            <h4 className="font-bold text-white uppercase">LP Burned</h4>
                            <p className="text-[#666666] text-xs">Liquidity tokens are sent to a burn address.</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full">
                    {/* Mock DEX Interface */}
                    <Card className="max-w-md mx-auto relative overflow-hidden group hover:border-[#8b5cf6] transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold uppercase">Swap</span>
                            <span className="text-xs text-[#666666] font-mono">SLIPPAGE: 0.5%</span>
                        </div>
                        
                        <div className="bg-[#0c0c0c] p-4 mb-2 border border-[#1f1f1f]">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs text-[#666666]">YOU PAY</span>
                                <span className="text-xs text-[#666666]">BALANCE: {isConnected ? walletBalance.native.toFixed(2) : '--'} {activeChain.symbol}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <input 
                                    type="number"
                                    value={swapAmount}
                                    onChange={(e) => setSwapAmount(e.target.value)}
                                    className="bg-transparent text-2xl font-bold font-mono text-white w-full outline-none"
                                />
                                <span className="bg-[#1f1f1f] px-2 py-1 text-xs font-bold rounded-none">{activeChain.symbol}</span>
                            </div>
                        </div>

                        <div className="flex justify-center -my-3 relative z-10">
                            <div className="bg-[#111111] p-2 border border-[#1f1f1f] rounded-full">
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        <div className="bg-[#0c0c0c] p-4 mt-2 mb-6 border border-[#1f1f1f]">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs text-[#666666]">YOU RECEIVE</span>
                                <span className="text-xs text-[#666666]">EST: {(parseFloat(swapAmount || '0') * 14020).toLocaleString()} LMT</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold font-mono text-[#39b54a]">
                                    {(parseFloat(swapAmount || '0') * 14020.5).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                </span>
                                <span className="bg-[#1f1f1f] px-2 py-1 text-xs font-bold rounded-none">LMT</span>
                            </div>
                        </div>

                        <Button fullWidth variant={swapSuccess ? 'primary' : 'secondary'} onClick={handleSwapClick}>
                            {swapSuccess ? 'SWAP SUCCESSFUL' : isConnected ? 'SWAP TOKENS' : 'CONNECT WALLET TO SWAP'}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
      </section>

      {/* -------------------- DOCUMENTATION SECTION -------------------- */}
      <div className="bg-[#111111] border-t border-[#1f1f1f] relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        
        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-16">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">The Operating System <br/> <span className="text-[#666666]">For Multi-Chain Builders</span></h2>
                <div className="w-24 h-1 bg-[#39b54a]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <FeatureCard 
                    icon={<Cpu size={32} className="text-[#8b5cf6]" />}
                    title="Generative Architecture"
                    description="Limetred doesn't just write code. It architects full-stack dApps with React frontends and Solidity backends tailored to your exact prompt requirements."
                    step="01"
                />
                <FeatureCard 
                    icon={<Activity size={32} className="text-[#39b54a]" />}
                    title="Liquidity Bonding"
                    description="No initial capital required. We launch your token on an internal bonding curve. At $60k market cap, liquidity migrates to Raydium automatically."
                    step="02"
                />
                <FeatureCard 
                    icon={<Shield size={32} className="text-white" />}
                    title="Anti-Rug Standards"
                    description="All generated contracts include hard-coded safety: Liquidity Locking, Renounced Ownership, and max-wallet caps to prevent sniper dominance."
                    step="03"
                />
            </div>
            
            {/* Multi-Chain Support Bar */}
            <div className="border-t border-[#1f1f1f] pt-12">
                 <h4 className="text-[#666666] text-xs font-bold uppercase tracking-widest mb-8 text-center">Supported Networks</h4>
                 <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {Object.values(CHAINS).map(chain => (
                        <div key={chain.id} className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chain.color }}></div>
                             <span className="font-bold text-white text-lg">{chain.name}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>

        {/* Comparison Section */}
        <div className="border-t border-[#1f1f1f] bg-[#0c0c0c] py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="font-mono text-[#39b54a] text-sm mb-2">WHY LIMETRED?</h3>
                        <h2 className="text-4xl font-bold uppercase mb-6">Stop wasting weeks <br/> on boilerplate.</h2>
                        <p className="text-[#666666] mb-8 leading-relaxed max-w-md">
                            Traditional web3 development is slow, expensive, and fragmented. 
                            Limetred consolidates the entire venture lifecycle—from IDE to DEX—into a single 30-second workflow.
                        </p>
                        <Button variant="outline" className="flex items-center gap-2">
                            READ THE WHITEPAPER <ArrowRight size={16} />
                        </Button>
                    </div>

                    <div className="border border-[#1f1f1f] bg-[#111111]">
                        <div className="grid grid-cols-3 border-b border-[#1f1f1f] p-4 text-[10px] font-mono uppercase text-[#666666]">
                            <div className="col-span-1">Feature</div>
                            <div className="col-span-1 text-center">Manual Dev</div>
                            <div className="col-span-1 text-center text-[#39b54a]">Limetred</div>
                        </div>
                        <ComparisonRow feature="Time to Market" bad="3-4 Weeks" good="30 Seconds" />
                        <ComparisonRow feature="Audit Cost" bad="$5,000+" good="Built-in Standard" />
                        <ComparisonRow feature="Liquidity Setup" bad="Complex & Expensive" good="Bonding Curve (Free)" />
                        <ComparisonRow feature="Frontend Hosting" bad="Vercel / AWS" good="Decentralized Stream" />
                        <ComparisonRow feature="Revenue Model" bad="0%" good="5% Perpetual Royalties" />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* -------------------- FOOTER -------------------- */}
      <footer className="bg-[#0c0c0c] border-t border-[#1f1f1f] py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                    <Logo />
                    <h4 className="text-2xl font-black uppercase tracking-tighter text-white">Limetred<span className="text-[#39b54a]">.</span></h4>
                </div>
                <p className="text-[#666666] text-xs font-mono max-w-xs leading-relaxed mb-6">
                    The Venture-as-a-Service protocol for the high-frequency economy. <br/>
                    Built for speed. Secured by math.
                </p>
                <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-[#39b54a] rounded-full animate-pulse"></div>
                     <span className="text-[#39b54a] text-xs font-mono uppercase">System Operational</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                 <div>
                    <h5 className="font-bold uppercase text-white mb-4 text-sm tracking-wider">Protocol</h5>
                    <div className="flex flex-col gap-3">
                        <FooterLink label="Documentation" onClick={(e) => openModal(e, 'DOCS')} />
                        <FooterLink label="Tokenomics" onClick={(e) => openModal(e, 'TOKENOMICS')} />
                        <FooterLink label="Bug Bounty" onClick={(e) => openModal(e, 'BOUNTY')} />
                        <FooterLink label="Audits" onClick={(e) => openModal(e, 'AUDITS')} />
                    </div>
                 </div>
                 <div>
                    <h5 className="font-bold uppercase text-white mb-4 text-sm tracking-wider">Community</h5>
                    <div className="flex flex-col gap-3">
                        <FooterLink label="Twitter / X" icon={<Twitter size={14}/>} />
                        <FooterLink label="Discord" icon={<Disc size={14}/>} />
                        <FooterLink label="GitHub" icon={<Github size={14}/>} />
                    </div>
                 </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#1f1f1f] flex flex-col md:flex-row justify-between items-center text-[10px] text-[#444] font-mono uppercase">
            <span>© 2024 Limetred Protocol. All rights reserved.</span>
            <span>v1.0.4-beta</span>
        </div>
      </footer>

      {/* -------------------- INFO MODALS -------------------- */}
      <AnimatePresence>
        {activeModal && PROTOCOL_CONTENT[activeModal] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111111] border border-[#39b54a] w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-[0_0_50px_rgba(57,181,74,0.2)] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#1f1f1f] bg-[#0c0c0c] sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  {PROTOCOL_CONTENT[activeModal].icon}
                  <h3 className="text-xl font-black uppercase tracking-wider text-white">
                    {PROTOCOL_CONTENT[activeModal].title}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="text-[#666666] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                {PROTOCOL_CONTENT[activeModal].content}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#1f1f1f] bg-[#0c0c0c] text-center">
                 <span className="text-[#39b54a] text-xs font-mono uppercase animate-pulse">
                    Encrypting Connection... Verified.
                 </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </motion.div>
  );
};

// Sub-components for cleaner code
const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string, step: string }> = ({ icon, title, description, step }) => (
    <div className="border border-[#1f1f1f] bg-[#0c0c0c] p-8 hover:border-[#39b54a] transition-colors group relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 p-4 font-mono text-4xl font-bold text-[#1f1f1f] group-hover:text-[#1a1a1a] transition-colors select-none">
            {step}
        </div>
        <div className="mb-6 opacity-80 group-hover:opacity-100 transition-opacity">{icon}</div>
        <h3 className="text-xl font-bold uppercase mb-4 tracking-wide text-white">{title}</h3>
        <p className="text-[#666666] text-sm leading-relaxed">{description}</p>
    </div>
);

const ListItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-center gap-3 text-[#666666]">
        <div className="w-1.5 h-1.5 bg-[#39b54a]"></div>
        <span className="font-mono text-sm">{text}</span>
    </li>
);

const ComparisonRow: React.FC<{ feature: string, bad: string, good: string }> = ({ feature, bad, good }) => (
    <div className="grid grid-cols-3 border-b border-[#1f1f1f] p-4 text-xs last:border-0 hover:bg-[#1a1a1a] transition-colors items-center">
        <div className="col-span-1 font-bold text-white">{feature}</div>
        <div className="col-span-1 text-center text-[#666666] line-through decoration-red-500/30">{bad}</div>
        <div className="col-span-1 text-center text-[#39b54a] font-mono font-bold">{good}</div>
    </div>
);

const FooterLink: React.FC<{ icon?: React.ReactNode, label: string, onClick?: (e: React.MouseEvent) => void }> = ({ icon, label, onClick }) => (
    <a 
        href="#" 
        onClick={onClick}
        className="flex items-center gap-2 text-[#666666] hover:text-white transition-colors text-xs font-bold uppercase tracking-wide group"
    >
        {icon} <span className="group-hover:translate-x-1 transition-transform">{label}</span>
    </a>
);

export default HeroSection;