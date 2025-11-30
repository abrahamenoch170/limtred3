import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../constants';
import { playSound } from '../services/soundService';

interface GenerationTheaterProps {
  onComplete: () => void;
  prompt?: string;
}

const BASE_LOGS = [
  "INITIALIZING NEURAL NET...",
  "ESTABLISHING SECURE RPC CONNECTION...",
];

const ATTRIBUTES = [
  { text: "GAS OPTIMIZATION FOUND", rarity: "LEGENDARY", color: COLORS.purple },
  { text: "ANTI-RUG PROTECTION", rarity: "RARE", color: COLORS.green },
  { text: "LIQUIDITY LOCKED", rarity: "COMMON", color: COLORS.white },
];

const GenerationTheater: React.FC<GenerationTheaterProps> = ({ onComplete, prompt }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentAttr, setCurrentAttr] = useState<number>(-1);

  useEffect(() => {
    let delay = 0;
    const isDeFi = prompt?.toLowerCase().includes('defi') || prompt?.toLowerCase().includes('swap') || prompt?.toLowerCase().includes('token');
    const isNFT = prompt?.toLowerCase().includes('nft') || prompt?.toLowerCase().includes('art') || prompt?.toLowerCase().includes('mint');
    
    // Dynamic Log Generation
    const dynamicLogs = [...BASE_LOGS];
    if (isDeFi) {
        dynamicLogs.push("CALCULATING AMM INVARIANT CURVES...");
        dynamicLogs.push("GENERATING YIELD FARMING LOGIC...");
        dynamicLogs.push("CONFIGURING TOKENOMICS SUPPLY...");
    } else if (isNFT) {
        dynamicLogs.push("GENERATING IPFS METADATA HASHES...");
        dynamicLogs.push("CONFIGURING ROYALTY ENFORCEMENT...");
        dynamicLogs.push("OPTIMIZING SVG RENDERING ON-CHAIN...");
    } else {
        dynamicLogs.push("PARSING NATURAL LANGUAGE INTENT...");
        dynamicLogs.push("GENERATING SOLIDITY ARCHITECTURE...");
    }
    
    dynamicLogs.push("SCANNING FOR RUG VULNERABILITIES...");
    dynamicLogs.push("COMPILING REACT COMPONENT TREE...");
    dynamicLogs.push("FINALIZING PROTOCOL PARAMETERS...");

    // Accelerated Sequence for "High-Frequency" feel (Total ~3.5s)
    dynamicLogs.forEach((msg, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `> ${msg}`]);
        playSound('hover'); // Typing sound effect
      }, delay);
      delay += 200 + Math.random() * 200;
    });

    // Flash attributes
    setTimeout(() => {
      setCurrentAttr(0);
      setLogs(prev => [...prev, `> ROLLING CONTRACT RARITY...`]);
      playSound('success');
    }, 2000);

    setTimeout(() => { setCurrentAttr(1); playSound('hover'); }, 2500);
    setTimeout(() => { setCurrentAttr(2); playSound('hover'); }, 2900);

    // Finish
    setTimeout(() => {
      onComplete();
      playSound('success');
    }, 3500);

  }, [onComplete, prompt]);

  return (
    <div className="h-full flex flex-col justify-center items-center p-8 bg-[#0c0c0c] relative overflow-hidden font-mono">
      <div className="w-full max-w-2xl z-10">
        <div className="bg-[#111111] border border-[#1f1f1f] p-8 min-h-[400px] flex flex-col shadow-2xl relative">
          {/* Scanline */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#39b54a]/5 to-transparent h-4 w-full animate-scan pointer-events-none" />

          <div className="flex justify-between items-center mb-6 border-b border-[#1f1f1f] pb-2">
            <span className="text-[#39b54a] text-xs animate-pulse">TERMINAL_ACTIVE</span>
            <span className="text-[#666666] text-xs">V.2.0.4</span>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-2">
            {logs.slice(-8).map((log, i) => ( // Show last 8 lines to keep it clean
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs md:text-sm text-[#39b54a] font-bold"
              >
                {log}
              </motion.div>
            ))}
            
            {/* Attribute Flasher */}
            {currentAttr >= 0 && currentAttr < ATTRIBUTES.length && (
              <motion.div 
                key={currentAttr}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 border border-dashed border-[#666666] text-center bg-black/50"
              >
                <span className="block text-xs text-[#666666] mb-1">CONTRACT ATTRIBUTE FOUND</span>
                <span 
                  className="text-lg md:text-xl font-bold tracking-widest uppercase drop-shadow-md" 
                  style={{ color: ATTRIBUTES[currentAttr].color }}
                >
                  [{ATTRIBUTES[currentAttr].rarity}] {ATTRIBUTES[currentAttr].text}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Glitch Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen" 
           style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, ${COLORS.green} 1px, ${COLORS.green} 2px)` }}>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GenerationTheater;