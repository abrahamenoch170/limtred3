import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ExternalLink, LogOut, Wallet, TrendingUp } from 'lucide-react';
import { Button, Card, Badge } from './ui/GlintComponents';
import { WalletBalance, Transaction } from '../types';

interface WalletDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  balance: WalletBalance;
  address: string;
  transactions: Transaction[];
}

const WalletDrawer: React.FC<WalletDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onDisconnect, 
  balance, 
  address,
  transactions 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111111] border-l border-[#1f1f1f] z-[101] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#39b54a] flex items-center justify-center sharp-corners">
                  <Wallet className="text-black" size={18} />
                </div>
                <div>
                  <h2 className="text-white font-bold uppercase tracking-wider">Limetred Wallet</h2>
                  <div className="flex items-center gap-2 text-[#666666] text-xs font-mono">
                    <span className="w-2 h-2 bg-[#39b54a] rounded-full animate-pulse"/>
                    Mainnet Beta
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-[#666666] hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Address Card */}
              <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 flex items-center justify-between group">
                <span className="font-mono text-[#666666] text-sm">{address}</span>
                <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Copy size={14} className="cursor-pointer hover:text-[#39b54a]" />
                  <ExternalLink size={14} className="cursor-pointer hover:text-[#39b54a]" />
                </div>
              </div>

              {/* Total Balance */}
              <div className="text-center py-4">
                <div className="text-[#666666] text-xs font-mono uppercase mb-2">Total Net Worth</div>
                <div className="text-4xl font-black text-white tracking-tight">
                  ${balance.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[#39b54a] text-xs font-mono mt-1 flex justify-center items-center gap-1">
                  <TrendingUp size={12} /> +24.5% (24h)
                </div>
              </div>

              {/* Assets List */}
              <div className="space-y-3">
                <h3 className="text-[#666666] text-xs font-bold uppercase tracking-widest mb-2">Assets</h3>
                
                {/* SOL */}
                <div className="bg-[#0c0c0c] p-4 border border-[#1f1f1f] flex justify-between items-center hover:border-[#333] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black border border-[#333] flex items-center justify-center font-bold text-xs">SOL</div>
                    <div>
                      <div className="font-bold text-white">Solana</div>
                      <div className="text-[10px] text-[#666666]">Native Token</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-white">{balance.sol.toFixed(4)} SOL</div>
                    <div className="text-[10px] text-[#666666]">${(balance.sol * 145).toFixed(2)}</div>
                  </div>
                </div>

                {/* LMT */}
                <div className="bg-[#0c0c0c] p-4 border border-[#39b54a]/30 flex justify-between items-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[#39b54a]/5 group-hover:bg-[#39b54a]/10 transition-colors" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 bg-[#39b54a] flex items-center justify-center font-bold text-black text-xs sharp-corners">LMT</div>
                    <div>
                      <div className="font-bold text-white">Limetred</div>
                      <div className="text-[10px] text-[#39b54a]">Protocol Token</div>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="font-mono font-bold text-[#39b54a]">{balance.lmt.toLocaleString()} LMT</div>
                    <div className="text-[10px] text-[#666666]">${(balance.lmt * 0.85).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions Mini */}
              <div>
                 <h3 className="text-[#666666] text-xs font-bold uppercase tracking-widest mb-4 mt-8">Recent Activity</h3>
                 <div className="space-y-2">
                    {transactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center text-xs border-b border-[#1f1f1f] pb-2 last:border-0">
                          <span className="text-white font-mono">{tx.type}</span>
                          <span className={tx.amount.startsWith('+') ? 'text-[#39b54a]' : 'text-white'}>{tx.amount}</span>
                      </div>
                    ))}
                 </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#1f1f1f] bg-[#0c0c0c]">
              <Button variant="outline" fullWidth onClick={onDisconnect} className="flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500">
                <LogOut size={16} /> DISCONNECT WALLET
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WalletDrawer;