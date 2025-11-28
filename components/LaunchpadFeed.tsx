import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LaunchpadProject, ProjectCategory } from '../types';
import { MOCK_PROJECTS, COLORS } from '../constants';
import { Search, TrendingUp, MessageSquare, Clock, User, Crown, ArrowRight, ShieldCheck, FileCode, Cpu, Brain, Banknote, Globe, Gamepad2, Server, Lock } from 'lucide-react';
import { Input, Badge, Button, Card } from './ui/GlintComponents';

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

const CategoryBadge: React.FC<{ category: ProjectCategory }> = ({ category }) => {
  let colorClass = "text-white border-white";
  switch (category) {
    case 'AI': colorClass = "text-purple-400 border-purple-400"; break;
    case 'DEFI': colorClass = "text-green-400 border-green-400"; break;
    case 'DEPIN': colorClass = "text-blue-400 border-blue-400"; break;
    case 'SECURITY': colorClass = "text-red-400 border-red-400"; break;
  }
  
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 border text-[10px] font-bold uppercase ${colorClass}`}>
      <CategoryIcon category={category} size={10} />
      {category}
    </div>
  );
};

const LaunchpadFeed: React.FC<LaunchpadFeedProps> = ({ onSelectProject, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'LATEST' | 'HOT'>('LATEST');
  
  // Filter logic
  const filteredProjects = MOCK_PROJECTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.ticker?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (filter === 'HOT') return (b.marketCap || 0) - (a.marketCap || 0);
    return 0; // Default is mock generated order (roughly random/latest)
  });

  const kingOfTheHill = MOCK_PROJECTS[0]; 

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0c0c0c]/90 backdrop-blur-md border-b border-[#1f1f1f] p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <Button variant="ghost" onClick={onBack} className="px-2 py-1 text-xs">
                 ← BACK
             </Button>
             <h1 className="text-xl font-bold uppercase tracking-wider">Limetred <span className="text-[#39b54a]">Launchpad</span></h1>
         </div>
         <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-[#39b54a] rounded-full animate-pulse"></div>
             <span className="text-xs font-mono text-[#39b54a]">{MOCK_PROJECTS.length} PROTOCOLS LIVE</span>
         </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-8">
        
        {/* King of the Hill Section */}
        <section>
            <div className="flex items-center gap-2 mb-4">
                <Crown className="text-yellow-500" size={20} />
                <h2 className="text-sm font-bold uppercase tracking-widest text-yellow-500">King of the Hill</h2>
            </div>
            
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectProject(kingOfTheHill)}
                className="relative bg-[#111111] border border-yellow-500/50 p-6 cursor-pointer group overflow-hidden"
            >
                <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors" />
                <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <div className="w-32 h-32 shrink-0 bg-[#000] border border-[#333] flex items-center justify-center font-bold text-4xl" style={{ color: kingOfTheHill.imageColor }}>
                         <CategoryIcon category={kingOfTheHill.category} size={48} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-3xl font-black uppercase text-white group-hover:text-yellow-500 transition-colors">
                                        {kingOfTheHill.name}
                                    </h3>
                                    <CategoryBadge category={kingOfTheHill.category} />
                                </div>
                                <div className="flex items-center gap-4 text-xs font-mono text-[#666666] mb-4">
                                    <span className="flex items-center gap-1"><User size={12}/> {kingOfTheHill.creator}</span>
                                    {kingOfTheHill.isDoxxed && (
                                        <span className="flex items-center gap-1 text-[#39b54a] font-bold"><ShieldCheck size={12}/> DOXXED DEV</span>
                                    )}
                                    {kingOfTheHill.auditStatus === 'PASSED' && (
                                        <span className="flex items-center gap-1 text-blue-400 font-bold"><FileCode size={12}/> AUDITED</span>
                                    )}
                                </div>
                            </div>
                            <Badge color="text-yellow-500 border-yellow-500">#1 RANKED</Badge>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-6 max-w-2xl">{kingOfTheHill.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono font-bold uppercase">
                                <span className="text-[#39b54a]">Bonding Curve Progress</span>
                                <span className="text-white">97.4%</span>
                            </div>
                            <div className="h-4 bg-[#1f1f1f] w-full border border-[#333] relative overflow-hidden">
                                <div className="absolute inset-y-0 left-0 bg-[#39b54a] w-[97.4%] animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black mix-blend-screen">
                                    GRADUATING TO RAYDIUM SOON
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 sticky top-20 z-30 bg-[#0c0c0c]/80 backdrop-blur-xl p-2 border-b border-[#1f1f1f] md:border-none">
            <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-[#39b54a]" size={18} />
                <input 
                    type="text" 
                    placeholder="Search protocols..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#111111] border border-[#1f1f1f] pl-10 pr-4 py-3 text-sm text-white focus:border-[#39b54a] outline-none font-mono placeholder-[#444]"
                />
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setFilter('LATEST')}
                    className={`px-4 py-2 text-xs font-bold uppercase border ${filter === 'LATEST' ? 'bg-[#39b54a] text-black border-[#39b54a]' : 'bg-transparent text-[#666666] border-[#333] hover:border-white'}`}
                >
                    Latest
                </button>
                <button 
                    onClick={() => setFilter('HOT')}
                    className={`px-4 py-2 text-xs font-bold uppercase border ${filter === 'HOT' ? 'bg-[#39b54a] text-black border-[#39b54a]' : 'bg-transparent text-[#666666] border-[#333] hover:border-white'}`}
                >
                    Top Utility
                </button>
            </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => (
                <motion.div
                    key={project.id}
                    layoutId={project.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => onSelectProject(project)}
                    className="bg-[#111111] border border-[#1f1f1f] p-4 cursor-pointer hover:border-[#39b54a] group flex flex-col h-full"
                >
                    {/* Card Header */}
                    <div className="flex gap-3 mb-3">
                        <div className="w-12 h-12 shrink-0 bg-black border border-[#333] flex items-center justify-center font-bold text-lg" style={{ color: project.imageColor }}>
                             <CategoryIcon category={project.category} size={24} />
                        </div>
                        <div className="overflow-hidden flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm text-white uppercase truncate group-hover:text-[#39b54a] transition-colors">
                                    {project.name}
                                </h4>
                            </div>
                            <span className="text-xs font-mono text-[#666666] block">${project.ticker}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {project.isDoxxed && (
                                     <span className="text-[9px] font-bold text-[#39b54a] border border-[#39b54a]/30 px-1">DOXXED</span>
                                )}
                                {project.auditStatus === 'PASSED' && (
                                     <span className="text-[9px] font-bold text-blue-400 border border-blue-400/30 px-1">AUDIT</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-2">
                        <CategoryBadge category={project.category} />
                    </div>

                    {/* Desc */}
                    <p className="text-xs text-[#888] mb-4 line-clamp-3 flex-1 font-mono leading-relaxed">
                        {project.description}
                    </p>

                    {/* Stats */}
                    <div className="mt-auto space-y-3">
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] text-[#666666] uppercase font-bold">Market Cap</div>
                                <div className="text-[#39b54a] font-mono font-bold text-sm">
                                    ${project.marketCap?.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-[#666666] uppercase font-bold">Age</div>
                                <div className="text-white font-mono text-xs flex items-center justify-end gap-1">
                                    <Clock size={10} /> {project.timestamp}
                                </div>
                            </div>
                        </div>
                        
                        {/* Mini Bar */}
                        <div className="h-1 bg-[#1f1f1f] w-full">
                            <div 
                                className="h-full bg-[#39b54a]" 
                                style={{ width: `${Math.min(100, (project.marketCap || 0) / 60000 * 100)}%` }}
                            />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default LaunchpadFeed;