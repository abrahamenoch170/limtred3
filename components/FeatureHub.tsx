import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODULES } from '../constants';
import { ModuleId } from '../types';
import { Button, Card, Badge } from './ui/GlintComponents';
import { ArrowLeft, TrendingUp, Swords, Network, BarChart2, Users, Bot, Zap, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

interface FeatureHubProps {
  onBack: () => void;
  initialModule?: ModuleId;
}

const FeatureHub: React.FC<FeatureHubProps> = ({ onBack, initialModule }) => {
  const [activeModule, setActiveModule] = useState<ModuleId>(initialModule || 'PREDICTION');

  const currentModuleConfig = MODULES.find(m => m.id === activeModule) || MODULES[0];

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'PREDICTION':
        return (
          <div className="space-y-6">
            <Card className="border-t-4 border-t-[#39b54a]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white uppercase flex items-center gap-2"><TrendingUp size={16}/> Binary Market</h3>
                <Badge color="text-[#39b54a]">LIVE</Badge>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Will BTC break $100k in Q4?</h2>
              <div className="flex gap-2 my-4">
                <div className="flex-1 bg-[#39b54a]/20 border border-[#39b54a] p-4 text-center cursor-pointer hover:bg-[#39b54a]/30 transition-colors">
                  <div className="text-xs text-[#39b54a] font-bold mb-1">YES</div>
                  <div className="text-xl text-white font-mono">62%</div>
                </div>
                <div className="flex-1 bg-red-500/20 border border-red-500 p-4 text-center cursor-pointer hover:bg-red-500/30 transition-colors">
                  <div className="text-xs text-red-500 font-bold mb-1">NO</div>
                  <div className="text-xl text-white font-mono">38%</div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-[#666]">
                <span>Vol: $1.2M</span>
                <span>Ends: 24d 12h</span>
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-4">
               <Card><h4 className="text-xs text-[#666] font-bold uppercase mb-2">Open Positions</h4><div className="text-white text-lg font-mono">0.00</div></Card>
               <Card><h4 className="text-xs text-[#666] font-bold uppercase mb-2">Total Earnings</h4><div className="text-[#39b54a] text-lg font-mono">+$0.00</div></Card>
            </div>
          </div>
        );
      case 'PVP':
        return (
          <div className="space-y-6">
             <div className="bg-[#111] border border-red-500 p-6 flex flex-col items-center text-center">
                <Swords size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-black text-white uppercase mb-2">Trading Arena</h2>
                <p className="text-[#666] text-sm mb-6 max-w-md">Enter the gauntlet. 1v1 or Battle Royale. Winner takes the liquidity pool.</p>
                <Button className="bg-red-500 border-red-500 text-black hover:bg-red-600 w-full md:w-auto">FIND MATCH</Button>
             </div>
             <Card>
                <h3 className="font-bold text-white uppercase mb-4 text-sm">Active Lobbies</h3>
                <div className="space-y-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="flex justify-between items-center p-3 bg-[#0c0c0c] border border-[#1f1f1f]">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                           <span className="text-xs font-mono text-white">Lobby #{8400+i}</span>
                        </div>
                        <span className="text-xs text-[#666]">1/2 Players • 100 LMT Entry</span>
                        <Button variant="outline" className="py-1 px-3 text-[10px]">JOIN</Button>
                     </div>
                   ))}
                </div>
             </Card>
          </div>
        );
      case 'DERIVATIVES':
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-t-4 border-t-[#8b5cf6]">
                   <div className="flex items-center gap-2 mb-4 text-[#8b5cf6] font-bold uppercase text-xs">
                      <Network size={14}/> Option Writer
                   </div>
                   <p className="text-white text-lg font-bold mb-4">Create Covered Calls</p>
                   <Button fullWidth variant="secondary">MINT CONTRACTS</Button>
                </Card>
                <Card className="border-t-4 border-t-blue-500">
                   <div className="flex items-center gap-2 mb-4 text-blue-500 font-bold uppercase text-xs">
                      <Zap size={14}/> Flash Loans
                   </div>
                   <p className="text-white text-lg font-bold mb-4">Unsecured Liquidity</p>
                   <Button fullWidth variant="outline">ACCESS POOL</Button>
                </Card>
             </div>
             <Card>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-white uppercase text-sm">Exotic Pairs</h3>
                   <Badge>BETA</Badge>
                </div>
                <div className="text-center py-8 text-[#666] text-xs">No active exotic positions found.</div>
             </Card>
          </div>
        );
      case 'LEVERAGE':
        return (
          <div className="space-y-6">
             <div className="bg-[#111] p-6 border border-[#f59e0b]">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-black text-white uppercase">Synthetic Margin</h2>
                   <div className="text-[#f59e0b] font-mono text-xl font-bold">50x</div>
                </div>
                <div className="space-y-4 mb-6">
                   <div>
                      <div className="flex justify-between text-xs text-[#666] mb-1">
                         <span>Collateral</span>
                         <span>0.00 USDC</span>
                      </div>
                      <div className="w-full h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
                         <div className="h-full bg-[#f59e0b] w-[0%]"></div>
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between text-xs text-[#666] mb-1">
                         <span>Liquidation Price</span>
                         <span className="text-red-500">---</span>
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <Button className="bg-[#39b54a] border-[#39b54a] text-black">LONG</Button>
                   <Button className="bg-red-500 border-red-500 text-black">SHORT</Button>
                </div>
             </div>
             <div className="flex gap-2 p-4 bg-red-900/20 border border-red-900/50 text-red-400 text-xs">
                <AlertTriangle size={16} />
                <p>Warning: Synthetic leverage involves high risk of liquidation. Protocol insurance fund is active.</p>
             </div>
          </div>
        );
      case 'SOCIAL':
        return (
          <div className="space-y-6">
             <Card>
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-16 h-16 bg-[#1f1f1f] rounded-full flex items-center justify-center border-2 border-[#39b54a]">
                      <Users size={24} className="text-[#39b54a]" />
                   </div>
                   <div>
                      <h2 className="text-xl font-bold text-white">Player Profile</h2>
                      <div className="text-[#666] text-xs font-mono">Rank: #4,201 • Rep: 98/100</div>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                   <div className="bg-[#0c0c0c] p-2 text-center border border-[#333]">
                      <div className="text-[#39b54a] font-bold">12</div>
                      <div className="text-[9px] text-[#666] uppercase">Trades</div>
                   </div>
                   <div className="bg-[#0c0c0c] p-2 text-center border border-[#333]">
                      <div className="text-white font-bold">4</div>
                      <div className="text-[9px] text-[#666] uppercase">Badges</div>
                   </div>
                   <div className="bg-[#0c0c0c] p-2 text-center border border-[#333]">
                      <div className="text-[#8b5cf6] font-bold">Top 5%</div>
                      <div className="text-[9px] text-[#666] uppercase">Volume</div>
                   </div>
                </div>
             </Card>
             <Card>
                <h3 className="font-bold text-white uppercase mb-4 text-sm">Leaderboard</h3>
                <div className="space-y-2">
                   {['@whale_hunter', '@degengod', '@sol_king'].map((u, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2 hover:bg-[#1a1a1a]">
                         <div className="flex items-center gap-3">
                            <span className="font-mono text-[#666] w-4">{i+1}</span>
                            <span className="text-white font-bold">{u}</span>
                         </div>
                         <span className="text-[#39b54a] font-mono">+{900 - i*150}%</span>
                      </div>
                   ))}
                </div>
             </Card>
          </div>
        );
      case 'AI_TOOLS':
        return (
          <div className="space-y-6">
             <Card className="border-t-4 border-t-[#ec4899]">
                <div className="flex items-center gap-2 mb-4 text-[#ec4899] font-bold uppercase text-xs">
                   <Bot size={14}/> Neural Optimizer
                </div>
                <p className="text-[#ccc] text-sm mb-6">Connect your contract to receive automated gas optimization and risk scoring updates.</p>
                <Button fullWidth className="bg-[#ec4899] border-[#ec4899] text-white hover:bg-[#db2777]">RUN ANALYSIS</Button>
             </Card>
             <div className="grid grid-cols-2 gap-4">
                <Card>
                   <h4 className="text-xs text-[#666] uppercase font-bold mb-2">Security Score</h4>
                   <div className="text-3xl font-black text-[#39b54a]">98/100</div>
                </Card>
                <Card>
                   <h4 className="text-xs text-[#666] uppercase font-bold mb-2">Est. Gas Saved</h4>
                   <div className="text-3xl font-black text-[#8b5cf6]">0.4 ETH</div>
                </Card>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-[#111] border-r border-[#1f1f1f] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#1f1f1f] flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#39b54a] sharp-corners flex items-center justify-center">
                 <Network size={14} className="text-black"/>
              </div>
              <h1 className="font-bold uppercase tracking-wider text-sm">Modules</h1>
           </div>
           <Button variant="ghost" onClick={onBack} className="md:hidden"><ArrowLeft size={16}/></Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {MODULES.map((module) => {
             const Icon = module.icon;
             const isActive = activeModule === module.id;
             return (
               <button
                 key={module.id}
                 onClick={() => setActiveModule(module.id)}
                 className={`w-full text-left p-3 flex items-center gap-3 transition-all duration-200 border-l-2 ${isActive ? 'bg-[#0c0c0c] border-[#39b54a] text-white' : 'border-transparent text-[#666] hover:text-white hover:bg-[#1a1a1a]'}`}
               >
                 <Icon size={18} className={isActive ? 'text-[#39b54a]' : ''} />
                 <div>
                    <div className="text-xs font-bold uppercase">{module.title}</div>
                 </div>
               </button>
             );
           })}
        </div>

        <div className="p-4 border-t border-[#1f1f1f] hidden md:block">
           <Button variant="outline" fullWidth onClick={onBack} className="text-xs flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> Back to Dashboard
           </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#0c0c0c] overflow-y-auto">
         <header className="p-6 md:p-10 pb-0">
            <div className="flex items-center gap-2 mb-2">
               <div className="px-2 py-1 bg-[#1a1a1a] border border-[#333] text-[10px] text-[#666] uppercase font-bold tracking-wider">
                  Post-Deployment Layer
               </div>
               <div className="w-full h-[1px] bg-[#1f1f1f] flex-1"></div>
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2" style={{ color: currentModuleConfig.color }}>
               {currentModuleConfig.title}
            </h1>
            <p className="text-[#888] text-sm max-w-xl leading-relaxed">
               {currentModuleConfig.description}
            </p>
         </header>

         <main className="p-6 md:p-10 max-w-4xl">
            <AnimatePresence mode="wait">
               <motion.div
                 key={activeModule}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                  {renderModuleContent()}
               </motion.div>
            </AnimatePresence>
         </main>
      </div>

    </div>
  );
};

export default FeatureHub;
