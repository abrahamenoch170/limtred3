import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LaunchpadProject, ProjectCategory } from '../types';
import { MOCK_PROJECTS } from '../constants';
import { Search, TrendingUp, Clock, User, Crown, ShieldCheck, FileCode, Cpu, Brain, Banknote, Globe, Gamepad2, Server, Lock, Zap, ArrowUpRight } from 'lucide-react';
import { Badge, Button } from './ui/GlintComponents';

interface LaunchpadFeedProps {
  onSelectProject: (project: LaunchpadProject) => void;
  onBack: () => void;
}

const CategoryIcon: React.FC<{ category: ProjectCategory; size?: number }> = ({ category, size = 16 }) => {
  switch (category) {
    case 'AI': return <Brain size={size} />;
    case 'DEFI': return <Banknote size={size} />;
    case 'DEPIN': return <Globe size={size} />;
    case 'INFRA': return <Server size={size} />;
    case 'GAMING': return <Gamepad2 size={size} />;
    case 'SECURITY': return <Lock size={size} />;
    default: return <Cpu size={size} />;
  }
};

const LaunchpadFeed: React.FC<LaunchpadFeedProps> = ({ onSelectProject, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'LATEST' | 'HOT'>('LATEST');
  
  const filteredProjects = MOCK_PROJECTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.ticker?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (filter === 'HOT') return (b.marketCap || 0) - (a.marketCap || 0);
    return 0;
  });

  const kingOfTheHill = MOCK_PROJECTS[0]; 

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-[#1f1f1f] p-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={onBack} className="px-3 py-1 text-xs border border-[#333] hover:border-white transition-colors">
                 ← BACK
             </Button>
             <h1 className="text-xl font-black uppercase tracking-tighter">Limetred <span className="text-[#39b54a]">Launchpad</span></h1>
         </div>
         <div className="flex items-center gap-2 bg-[#111] px-3 py-1 border border-[#333] rounded-full">
             <div className="w-2 h-2 bg-[#39b54a] rounded-full animate-pulse"></div>
             <span className="text-[10px] font-mono font-bold text-[#fff] tracking-wider">LIVE FEED</span>
         </div>
      </header>

      {/* Live Ticker */}
      <div className="bg-[#111] border-b border-[#1f1f1f] py-2 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-block">
              {MOCK_PROJECTS.map((p, i) => (
                  <span key={i} className="mx-6 text-xs font-mono text-[#666]">
                      <span className="text-white font-bold">{p.ticker}</span> just launched • <span className="text-[#39b54a]">Mcap: ${p.marketCap?.toLocaleString()}</span>
                  </span>
              ))}
          </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-12">
        
        {/* Featured / King of the Hill */}
        <section>
            <div className="flex items-center gap-2 mb-6">
                <Crown className="text-yellow-500 fill-yellow-500" size={20} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-yellow-500">King of the Hill</h2>
            </div>
            
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectProject(kingOfTheHill)}
                className="relative bg-gradient-to-r from-[#111] to-[#0c0c0c] border border-yellow-500/30 p-1 cursor-pointer group overflow-hidden hover:border-yellow-500 transition-colors"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] pointer-events-none"></div>
                
                <div className="bg-[#0c0c0c] p-6 md:p-8 relative z-10 h-full">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Image */}
                        <div className="w-full md:w-48 h-48 shrink-0 bg-[#000] border border-[#333] flex items-center justify-center relative overflow-hidden group-hover:border-yellow-500 transition-colors">
                             <div className="absolute inset-0 opacity-20" style={{ backgroundColor: kingOfTheHill.imageColor }}></div>
                             <CategoryIcon category={kingOfTheHill.category} size={64} />
                             <div className="absolute bottom-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 uppercase">
                                 Top 1
                             </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-4xl font-black uppercase text-white tracking-tighter mb-2 group-hover:text-yellow-500 transition-colors">
                                            {kingOfTheHill.name}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-sm text-yellow-500 font-bold">${kingOfTheHill.ticker}</span>
                                            <span className="w-1 h-1 bg-[#666] rounded-full"></span>
                                            <div className="flex items-center gap-1 text-xs text-[#888]">
                                                <User size={12}/> {kingOfTheHill.creator}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wider animate-pulse">
                                        Active Now
                                    </div>
                                </div>
                                
                                <p className="text-gray-400 text-sm mb-6 max-w-2xl leading-relaxed">{kingOfTheHill.description}</p>
                            </div>

                            {/* Stats Bar */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#1f1f1f] pt-4">
                                <div>
                                    <div className="text-[10px] text-[#666] uppercase font-bold mb-1">Market Cap</div>
                                    <div className="text-xl font-mono text-white font-bold">${kingOfTheHill.marketCap?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-[#666] uppercase font-bold mb-1">Curve Progress</div>
                                    <div className="text-xl font-mono text-[#39b54a] font-bold">97.4%</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-[#666] uppercase font-bold mb-1">Holders</div>
                                    <div className="text-xl font-mono text-white font-bold">1,240</div>
                                </div>
                                <div className="flex items-center justify-end">
                                     <Button className="text-xs h-auto py-2 bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-400 w-full md:w-auto">
                                         VIEW TERMINAL
                                     </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>

        {/* Filters */}
        <div className="sticky top-20 z-30 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] group-focus-within:text-[#39b54a] transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Search protocols by name, ticker, or contract..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0c0c0c]/80 backdrop-blur-md border border-[#333] pl-12 pr-4 py-4 text-sm text-white focus:border-[#39b54a] outline-none font-mono placeholder-[#444] transition-colors"
                />
            </div>
            <div className="flex gap-0 bg-[#111] border border-[#333] p-1">
                <button 
                    onClick={() => setFilter('LATEST')}
                    className={`px-6 py-2 text-xs font-bold uppercase transition-all ${filter === 'LATEST' ? 'bg-[#333] text-white shadow-sm' : 'text-[#666] hover:text-[#ccc]'}`}
                >
                    Latest
                </button>
                <button 
                    onClick={() => setFilter('HOT')}
                    className={`px-6 py-2 text-xs font-bold uppercase transition-all ${filter === 'HOT' ? 'bg-[#333] text-white shadow-sm' : 'text-[#666] hover:text-[#ccc]'}`}
                >
                    Top Volume
                </button>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project, i) => (
                <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => onSelectProject(project)}
                    className="group relative bg-[#111] border border-[#1f1f1f] hover:border-[#39b54a] transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
                >
                    {/* Header Image Area */}
                    <div className="h-32 bg-[#000] relative border-b border-[#1f1f1f] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: project.imageColor }}></div>
                        <CategoryIcon category={project.category} size={48} />
                        
                        <div className="absolute top-2 right-2 flex gap-1">
                            <Badge color="bg-black/50 backdrop-blur text-white border-white/20">{project.category}</Badge>
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-lg text-white uppercase leading-none mb-1 group-hover:text-[#39b54a] transition-colors">
                                    {project.name}
                                </h4>
                                <span className="text-xs font-mono text-[#666]">${project.ticker}</span>
                            </div>
                        </div>

                        <p className="text-xs text-[#888] mb-6 line-clamp-2 leading-relaxed">
                            {project.description}
                        </p>
                        
                        {/* Verification Badges */}
                        <div className="flex gap-2 mb-4">
                             {project.isDoxxed && (
                                <div className="text-[9px] font-bold text-[#39b54a] bg-[#39b54a]/10 px-2 py-0.5 border border-[#39b54a]/30 flex items-center gap-1">
                                    <ShieldCheck size={10} /> DOXXED
                                </div>
                             )}
                             {project.auditStatus === 'PASSED' && (
                                <div className="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 border border-blue-400/30 flex items-center gap-1">
                                    <FileCode size={10} /> AUDITED
                                </div>
                             )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-[#1f1f1f]">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="text-[9px] text-[#666] uppercase font-bold mb-0.5">Mkt Cap</div>
                                    <div className="text-white font-mono font-bold text-sm">${project.marketCap?.toLocaleString()}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] text-[#666] uppercase font-bold mb-0.5">Created</div>
                                    <div className="text-[#888] font-mono text-xs flex items-center justify-end gap-1">
                                        <Clock size={10} /> {project.timestamp}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-[#39b54a] to-[#2ea03f]" 
                                    style={{ width: `${Math.min(100, (project.marketCap || 0) / 60000 * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </main>

      <style>{`
        .animate-marquee { animation: marquee 30s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
};

export default LaunchpadFeed;