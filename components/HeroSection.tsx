import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Input } from './ui/GlintComponents';
import { MOCK_TICKER, COLORS } from '../constants';
import { Zap } from 'lucide-react';

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
      className="flex flex-col h-full relative"
    >
      {/* Marquee Ticker */}
      <div className="w-full bg-[#111111] border-b border-[#1f1f1f] h-10 flex items-center overflow-hidden whitespace-nowrap z-20">
        <div className="animate-marquee flex space-x-8 px-4">
          {[...MOCK_TICKER, ...MOCK_TICKER, ...MOCK_TICKER].map((item, i) => (
            <span key={i} className="font-mono text-xs text-[#666666]">
              <span className="text-white font-bold">{item.user}</span> just shipped <span className="text-[#39b54a]">{item.app}</span> ({item.gain})
            </span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 max-w-4xl mx-auto w-full z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
           <h1 className="text-6xl md:text-8xl font-black text-center mb-8 tracking-tighter uppercase text-white select-none">
            Lime<span className="text-[#39b54a]">tred</span>
          </h1>
          <p className="text-[#666666] text-center mb-12 font-mono text-sm tracking-widest uppercase">
            Venture-as-a-Service Protocol v1.0
          </p>

          <form onSubmit={handleSubmit} className="w-full relative group">
            {/* Spec: Massive, transparent Input Field with Green Border */}
            <div className="relative">
              <Input 
                autoFocus
                placeholder="Describe your billion-dollar idea..." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-2xl md:text-4xl text-center placeholder:text-[#333] border-[#39b54a] bg-black/50 backdrop-blur-sm focus:bg-black/80 h-24"
              />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#39b54a] to-transparent opacity-50" />
            </div>
            
            <motion.div 
              className="mt-12 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: prompt ? 1 : 0 }}
            >
              <Button type="submit" variant="primary" className="min-w-[200px] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(57,181,74,0.4)]">
                <Zap size={16} /> INITIALIZE
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Background Grid Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10" 
        style={{ 
          backgroundImage: `linear-gradient(${COLORS.border} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border} 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} 
      />
      
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

export default HeroSection;