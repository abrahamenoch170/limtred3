import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, TooltipProps } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from './ui/GlintComponents';
import { GeneratedApp, MarketData, Transaction, WalletBalance, ChainId } from '../types';
import { Flame, Lock, AlertTriangle, Globe, Activity, Wrench, Info, TrendingUp, Target, ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, Wallet, Repeat } from 'lucide-react';
import { COLORS, CHAINS } from '../constants';

interface DashboardProps {
  appData: GeneratedApp;
  isConnected: boolean;
  onConnect: () => void;
  onBack: () => void;
  walletBalance: WalletBalance;
  transactions: Transaction[];
  currentChain: ChainId;
}

const Logo = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M0 0H14V6H6V26H26V18H32V32H0V0Z" fill="#39b54a"/>
    <rect x="18" y="0" width="14" height="14" fill="white"/>
  </svg>
);

// Initialize with Market Cap scale values (approx 12k start)
const generateInitialData = (): MarketData[] => {
  const data = [];
  let val = 12000;
  for (let i = 0; i < 20; i++) {
    val = val + (Math.random() * 200 - 50); // Random walk
    data.push({ time: i, price: Math.max(0, val) });
  }
  return data;
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111] border border-[#39b54a] p-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <p className="text-[#666666] text-[10px] font-mono mb-1 uppercase tracking-wider">Time: T+{label}s</p>
        <p className="text-[#39b54a] font-bold font-mono text-sm">
          MC: ${payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ 
    appData, 
    isConnected, 
    onConnect, 
    onBack,
    walletBalance,
    transactions,
    currentChain 
}) => {
  const [marketData, setMarketData] = useState<MarketData[]>(generateInitialData());
  const [marketCap, setMarketCap] = useState(12450);
  const [timeLeft, setTimeLeft] = useState(48); // Minutes for tax drop
  
  const activeChain = CHAINS[currentChain];
  
  // App Simulation State
  const [keysSold, setKeysSold] = useState(482);
  const [keyPrice, setKeyPrice] = useState(0.85);

  useEffect(() => {
    // Market Simulation
    const interval = setInterval(() => {
      setMarketCap(prevMC => {
        // Increment Market Cap
        const nextMC = prevMC + Math.floor(Math.random() * 150);
        
        // Update Chart Data to match new MC
        setMarketData(prevData => {
            const lastTime = prevData[prevData.length - 1].time;
            const newData = [...prevData.slice(1), { time: lastTime + 1, price: nextMC }];
            return newData;
        });
        
        return nextMC;
      });
    }, 1000);

    // Tax Timer Simulation
    const taxTimer = setInterval(() => {
        setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 60000);

    // Keys Sales Simulation (Bonding Curve Logic)
    const keysTimer = setInterval(() => {
      // Simulate market demand - Less frequent updates, bigger jumps
      if (Math.random() > 0.3) { 
        setKeysSold(prev => {
            // Sell a random batch (2-5 keys) to make update feel significant
            const batch = Math.floor(Math.random() * 4) + 2;
            const nextCount = prev + batch;
            setKeyPrice(currentPrice => currentPrice + (0.0015 * batch));
            return nextCount;
        });
      }
    }, 4000);

    return () => {
        clearInterval(interval);
        clearInterval(taxTimer);
        clearInterval(keysTimer);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
        className="min-h-screen bg-[#0c0c0c] p-4 md:p-8 flex flex-col font-sans overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
      
      {/* Navbar / Streak */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between md:items-center mb-8 border-b border-[#1f1f1f] pb-4 gap-4"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-3 border border-[#1f1f1f] hover:bg-[#1a1a1a]" onClick={onBack}>
             <ArrowLeft size={18} />
          </Button>
          
          <div className="flex items-start gap-3">
            <div className="mt-1 hidden sm:block"><Logo /></div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">Limetred <span className="text-[#39b54a] text-xs align-top">PRO</span></h1>
              <div className="flex items-center gap-2 mt-1">
                  <span className="text-[#666666] text-xs font-mono">{appData.name} // {appData.rarity}</span>
                  <Badge color="text-[#8b5cf6]">{activeChain.name} Network</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {/* Module D: Streak with Tooltip */}
          <div className="relative group cursor-help hidden xs:block">
            <div className="flex items-center gap-2 text-[#39b54a] bg-[#39b54a]/10 px-4 py-2 border border-[#39b54a] sharp-corners transition-all hover:bg-[#39b54a]/20">
                <Flame size={18} className="fill-current animate-pulse" />
                <span className="font-bold text-sm">5 DAY STREAK</span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute top-full mt-2 right-0 w-64 bg-[#111111] border border-[#1f1f1f] p-3 text-xs text-[#666666] hidden group-hover:block z-50 shadow-xl">
                <div className="flex items-start gap-2">
                    <Wrench size={14} className="text-[#666666] mt-1" />
                    <div>
                        <div className="font-bold text-white mb-1">STREAK AT RISK?</div>
                        If streak is broken, pay <span className="text-[#39b54a]">0.5 {activeChain.symbol}</span> to repair and maintain multiplier.
                    </div>
                </div>
            </div>
          </div>
          
          <Button 
            variant={isConnected ? "outline" : "primary"} 
            className="py-2 text-xs flex items-center gap-2"
            onClick={onConnect}
          >
            {isConnected && <Wallet size={14} />}
            {isConnected ? "0x8A...4B2F" : "CONNECT WALLET"}
          </Button>
        </div>
      </motion.header>

      {/* Bento Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Module A: Bonding Curve (Span 2 cols) */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 min-w-0">
            <Card className="flex flex-col h-full min-h-[400px] relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6 z-10 relative">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                             <TrendingUp size={14} className="text-[#666666]" />
                             <h3 className="text-[#666666] text-xs uppercase tracking-widest">Internal Launchpad</h3>
                        </div>
                        
                        <div className="flex flex-col">
                            <motion.span
                                key={marketCap}
                                initial={{ color: "#39b54a", filter: "blur(4px)" }}
                                animate={{ color: "#ffffff", filter: "blur(0px)" }}
                                transition={{ duration: 0.3, ease: "circOut" }}
                                className="text-4xl md:text-5xl font-bold font-mono tracking-tighter"
                            >
                                ${marketCap.toLocaleString()}
                            </motion.span>
                            
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[#666666] text-xs font-mono uppercase tracking-wider">Target:</span>
                                <div className="flex items-center gap-2 px-2 py-1 bg-[#39b54a]/10 border border-[#39b54a] animate-pulse">
                                     <Target size={12} className="text-[#39b54a]" />
                                     <span className="text-[#39b54a] font-bold text-xs font-mono">$60,000 (GRADUATION)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Badge color="text-[#39b54a] bg-[#39b54a]/5 border-[#39b54a]">+12.4% (24H)</Badge>
                </div>
                
                <div className="flex-1 w-full relative min-h-[200px] z-0">
                    <div className="absolute inset-0 w-full h-full">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <AreaChart data={marketData}>
                            <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke={COLORS.green} 
                                strokeWidth={2} 
                                fillOpacity={1} 
                                fill="url(#colorPrice)" 
                                isAnimationActive={true}
                                animationDuration={500}
                            />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="mt-4 z-10 relative bg-[#111111]/90 backdrop-blur-sm border-t border-[#1f1f1f] pt-4">
                    <div className="flex justify-between text-[10px] text-[#666666] mb-1 font-mono uppercase">
                        <span>Bonding Curve Progress</span>
                        <span className="text-white">{(marketCap / 60000 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-[#1f1f1f] h-2 mb-2">
                        <motion.div 
                            className="bg-[#39b54a] h-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${(marketCap / 60000) * 100}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    </div>
                    <div className="relative group/tooltip cursor-help w-fit mx-auto">
                        <div className="text-center text-[10px] text-[#39b54a] flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                            <Info size={10} /> Liquidity migrates to {activeChain.dex} automatically at 100%
                        </div>
                        
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-72 bg-[#111111] border border-[#1f1f1f] p-4 text-xs text-[#666666] hidden group-hover/tooltip:block z-50 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                            <div className="flex items-start gap-3">
                                <div className="p-1 bg-[#39b54a]/10 border border-[#39b54a] rounded-none">
                                    <Info size={14} className="text-[#39b54a]" />
                                </div>
                                <div>
                                    <div className="font-bold text-white mb-1 uppercase tracking-wider">Liquidity Graduation</div>
                                    <p className="leading-relaxed">
                                        When market cap hits <span className="text-[#39b54a]">$60k</span>, all liquidity is deposited into a {activeChain.dex} AMM pool and burned.
                                    </p>
                                    <div className="mt-2 text-[#39b54a] font-bold">
                                        ✅ Rug-proof.
                                        <br/>
                                        ✅ Forever tradable.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>

        {/* Module B: Bet on Builder */}
        <motion.div variants={itemVariants} className="col-span-1 min-w-0">
            <Card className="flex flex-col justify-between h-full min-h-[350px] border-t-4 border-t-[#8b5cf6]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#666666] text-xs uppercase tracking-widest">Prediction Market</h3>
                    <Activity size={16} className="text-[#8b5cf6]" />
                </div>
                
                <div className="mb-6 flex-1 flex flex-col justify-center">
                    <p className="text-white text-lg font-bold leading-tight mb-6">
                        "Will {appData.name} dev ship v1.0 within 48h?"
                    </p>
                    
                    <div className="flex gap-2 mb-2">
                        <button className="flex-1 bg-[#39b54a] text-black font-bold py-4 hover:bg-[#2ea03f] transition-colors border border-[#39b54a] sharp-corners group">
                            YES <span className="block text-[10px] opacity-70 group-hover:opacity-100">82¢</span>
                        </button>
                        <button className="flex-1 bg-transparent text-[#666666] border border-[#333] font-bold py-4 hover:border-red-500 hover:text-red-500 transition-colors sharp-corners group">
                            NO <span className="block text-[10px] opacity-70 group-hover:opacity-100">18¢</span>
                        </button>
                    </div>
                    <p className="text-[#39b54a] text-xs text-right font-mono">Potential Payout: <span className="font-bold text-lg">1.22x</span></p>
                </div>
                
                <div className="p-3 bg-[#0c0c0c] border border-[#1f1f1f] flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-none bg-[#333] flex items-center justify-center">
                        <Globe size={14} className="text-gray-400"/>
                    </div>
                    <div className="text-xs">
                        <div className="text-[#666666]">Volume</div>
                        <div className="text-white font-mono">$4,203</div>
                    </div>
                </div>
            </Card>
        </motion.div>

        {/* Module C: App IPO Keys */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 min-w-0">
            <Card className="flex flex-col justify-center h-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <h3 className="text-[#666666] text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Lock size={12} /> Revenue Sharing Keys
                        </h3>
                        <h2 className="text-3xl font-bold text-white mb-2 uppercase">Own the Protocol</h2>
                        <p className="text-[#666666] text-sm max-w-md mb-6">
                            Buy keys to earn <span className="text-white">5% of all trading fees</span> generated by {appData.name}. 
                            Yield is paid out in {activeChain.symbol} every 24 hours.
                        </p>

                        <div className="flex gap-8 border-t border-[#1f1f1f] pt-4">
                           <div>
                                <div className="text-[#666666] text-[10px] uppercase tracking-wider mb-1">Keys Sold</div>
                                <motion.div 
                                  key={keysSold}
                                  initial={{ scale: 1.2, color: "#39b54a" }}
                                  animate={{ scale: 1, color: "#ffffff" }}
                                  className="text-white font-mono text-xl"
                                >
                                  {keysSold.toLocaleString()}
                                </motion.div>
                           </div>
                           <div>
                                <div className="text-[#666666] text-[10px] uppercase tracking-wider mb-1">Price / Key</div>
                                <motion.div 
                                   key={keyPrice}
                                   className="text-white font-mono text-xl"
                                >
                                   {keyPrice.toFixed(4)} {activeChain.symbol}
                                </motion.div>
                           </div>
                        </div>
                    </div>
                    
                    <div className="bg-[#0c0c0c] p-6 border border-[#1f1f1f] min-w-[200px] text-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <div className="text-[#39b54a] text-4xl font-bold mb-1 font-mono">5.2%</div>
                        <div className="text-[#666666] text-xs font-mono uppercase mb-4">Current APR</div>
                        <Button variant="secondary" fullWidth className="text-xs">BUY KEYS</Button>
                    </div>
                </div>
            </Card>
        </motion.div>

        {/* Module E: Paper Hands Tax */}
        <motion.div variants={itemVariants} className="col-span-1 min-w-0">
            <Card className="h-full border-red-900/20 bg-gradient-to-br from-[#111] to-red-900/10 flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-red-500">
                    <AlertTriangle size={18} />
                    <h3 className="text-xs uppercase tracking-widest font-bold">Paper Hands Tax</h3>
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.02, 1],
                            opacity: [0.9, 1, 0.9]
                        }}
                        transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="text-6xl font-black text-white mb-2 tracking-tighter"
                    >
                        20%
                    </motion.div>
                    <div className="text-red-500 text-xs font-mono uppercase animate-pulse">Sell Tax Active</div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-red-900/30 text-center">
                    <p className="text-[#666666] text-xs">
                        Tax drops to 1% in:
                        <br/>
                        <span className="text-white font-mono text-xl">{timeLeft}m 00s</span>
                    </p>
                </div>
            </Card>
        </motion.div>

        {/* Module F: Transaction Ledger */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-3 min-w-0">
             <Card className="h-full">
                <div className="flex items-center justify-between mb-4 border-b border-[#1f1f1f] pb-2">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#666666]" />
                        <h3 className="text-[#666666] text-xs uppercase tracking-widest">Recent Ledger</h3>
                    </div>
                    <div className="text-[10px] text-[#666666] font-mono">LIVE</div>
                </div>
                
                <div className="space-y-1">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="grid grid-cols-4 md:grid-cols-5 items-center p-3 bg-[#0c0c0c] border border-[#1f1f1f] hover:border-[#333] transition-colors group">
                            
                            {/* Type */}
                            <div className="col-span-2 md:col-span-1 flex items-center gap-3">
                                <div className={`p-2 rounded-none border ${
                                    tx.type === 'YIELD' ? 'border-[#39b54a] bg-[#39b54a]/10 text-[#39b54a]' : 
                                    tx.type === 'DEPLOY' ? 'border-[#8b5cf6] bg-[#8b5cf6]/10 text-[#8b5cf6]' : 
                                    tx.type === 'SWAP' ? 'border-blue-500 bg-blue-500/10 text-blue-500' :
                                    'border-[#333] bg-[#111] text-white'
                                }`}>
                                    {tx.type === 'YIELD' && <ArrowDownLeft size={14} />}
                                    {tx.type === 'DEPLOY' && <CheckCircle2 size={14} />}
                                    {tx.type === 'SWAP' && <Repeat size={14} />}
                                    {(tx.type === 'BUY_KEYS' || tx.type === 'TRADE') && <ArrowUpRight size={14} />}
                                </div>
                                <span className="text-xs font-bold font-mono text-white">{tx.type.replace('_', ' ')}</span>
                            </div>

                            {/* ID (Hidden Mobile) */}
                            <div className="hidden md:block col-span-1 text-xs text-[#666666] font-mono">
                                {tx.id.toUpperCase()}
                            </div>

                            {/* Amount */}
                            <div className={`col-span-1 text-right md:text-left font-mono text-sm ${tx.amount.startsWith('+') ? 'text-[#39b54a]' : 'text-white'}`}>
                                {tx.amount}
                            </div>

                            {/* Status */}
                            <div className="hidden md:flex col-span-1 items-center gap-2">
                                {tx.status === 'PENDING' ? (
                                    <Clock size={12} className="text-yellow-500 animate-pulse" />
                                ) : (
                                    <CheckCircle2 size={12} className="text-[#39b54a]" />
                                )}
                                <span className={`text-[10px] font-bold uppercase ${tx.status === 'PENDING' ? 'text-yellow-500' : 'text-[#39b54a]'}`}>
                                    {tx.status}
                                </span>
                            </div>

                             {/* Time */}
                             <div className="col-span-1 text-right text-[10px] text-[#666666] font-mono">
                                {tx.timestamp}
                            </div>
                        </div>
                    ))}
                </div>
             </Card>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};

export default Dashboard;