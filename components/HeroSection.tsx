import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input, Badge } from './ui/GlintComponents';
import { MOCK_TICKER, COLORS } from '../constants';
import { Zap, Shield, Cpu, ChevronDown, Twitter, Github, Disc, ArrowRight, Lock, Activity } from 'lucide-react';

interface HeroSectionProps {
  onGenerate: (prompt: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full relative overflow-y-auto no-scrollbar scroll-smooth bg-[#0c0c0c]"
    >
      {/* -------------------- HERO (ABOVE THE FOLD) -------------------- */}
      <div className="min-h-screen flex flex-col relative z-10">
        
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

      {/* -------------------- DOCUMENTATION SECTION -------------------- */}
      <div className="bg-[#111111] border-t border-[#1f1f1f] relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        
        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-16">
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">The Operating System <br/> <span className="text-[#666666]">For High-Frequency Builders</span></h2>
                <div className="w-24 h-1 bg-[#39b54a]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <h4 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Limetred<span className="text-[#39b54a]">.</span></h4>
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
                        <FooterLink label="Documentation" />
                        <FooterLink label="Tokenomics" />
                        <FooterLink label="Bug Bounty" />
                        <FooterLink label="Audits" />
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

const ComparisonRow: React.FC<{ feature: string, bad: string, good: string }> = ({ feature, bad, good }) => (
    <div className="grid grid-cols-3 border-b border-[#1f1f1f] p-4 text-xs last:border-0 hover:bg-[#1a1a1a] transition-colors items-center">
        <div className="col-span-1 font-bold text-white">{feature}</div>
        <div className="col-span-1 text-center text-[#666666] line-through decoration-red-500/30">{bad}</div>
        <div className="col-span-1 text-center text-[#39b54a] font-mono font-bold">{good}</div>
    </div>
);

const FooterLink: React.FC<{ icon?: React.ReactNode, label: string }> = ({ icon, label }) => (
    <a href="#" className="flex items-center gap-2 text-[#666666] hover:text-white transition-colors text-xs font-bold uppercase tracking-wide group">
        {icon} <span className="group-hover:translate-x-1 transition-transform">{label}</span>
    </a>
);

export default HeroSection;