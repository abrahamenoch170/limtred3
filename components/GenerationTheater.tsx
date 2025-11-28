import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../constants';

interface GenerationTheaterProps {
  onComplete: () => void;
}

const LOG_MESSAGES = [
  "INITIALIZING NEURAL NET...",
  "PARSING NATURAL LANGUAGE INTENT...",
  "GENERATING SOLIDITY ARCHITECTURE...",
  "OPTIMIZING GAS VARIABLES...",
  "SCANNING FOR RUG VULNERABILITIES...",
  "COMPILING REACT COMPONENT TREE...",
  "MINTING GENESIS ASSETS...",
  "FINALIZING PROTOCOL PARAMETERS..."
];

const ATTRIBUTES = [
  { text: "GAS OPTIMIZATION FOUND", rarity: "LEGENDARY", color: COLORS.purple },
  { text: "ANTI-RUG PROTECTION", rarity: "RARE", color: COLORS.green },
  { text: "LIQUIDITY LOCKED", rarity: "COMMON", color: COLORS.white },
];

const GenerationTheater: React.FC<GenerationTheaterProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentAttr, setCurrentAttr] = useState<number>(-1);

  useEffect(() => {
    let delay = 0;
    
    // Accelerated Sequence for "High-Frequency" feel (Total ~3.5s)
    LOG_MESSAGES.forEach((msg, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `> ${msg}`]);
      }, delay);
      delay += 200 + Math.random() * 200;
    });

    // Flash attributes
    setTimeout(() => {
      setCurrentAttr(0);
      setLogs(prev => [...prev, `> ROLLING CONTRACT RARITY...`]);
    }, 2000);

    setTimeout(() => setCurrentAttr(1), 2500);
    setTimeout(() => setCurrentAttr(2), 2900);

    // Finish
    setTimeout(() => {
      onComplete();
    }, 3500);

  }, [onComplete]);

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