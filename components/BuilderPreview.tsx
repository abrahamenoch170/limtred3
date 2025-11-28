import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/GlintComponents';
import { GeneratedApp, ChainId } from '../types';
import { 
  Rocket, Smartphone, CheckCircle, Loader2, Monitor, Tablet, 
  RefreshCw, Maximize2, X, ChevronDown, FileCode 
} from 'lucide-react';
import { CHAINS } from '../constants';

interface BuilderPreviewProps {
  appData: GeneratedApp;
  onDeploy: () => void;
  currentChain: ChainId;
}

// Simple regex-based syntax highlighter for visual effect
const SyntaxHighlight = ({ code }: { code: string }) => {
  const renderCode = () => {
    if (!code) return null;
    
    // Split into lines for basic processing
    return code.split('\n').map((line, i) => {
      // Basic keyword highlighting simulation
      const parts = line.split(/(\s+|\(|\)|\{|\}|\[|\]|\,|\;|\"|\'|\/\/.*)/g);
      return (
        <div key={i} className="table-row">
          <span className="table-cell text-right pr-4 text-[#444] select-none text-[10px] w-8">{i + 1}</span>
          <span className="table-cell whitespace-pre">
            {parts.map((part, j) => {
              if (part.startsWith('//')) return <span key={j} className="token-comment">{part}</span>;
              if (part.match(/^["'].*["']$/)) return <span key={j} className="token-string">{part}</span>;
              if (['import', 'from', 'export', 'default', 'function', 'const', 'let', 'var', 'return', 'if', 'else', 'contract', 'pragma', 'struct', 'mapping', 'event', 'constructor', 'modifier'].includes(part.trim())) 
                return <span key={j} className="token-keyword">{part}</span>;
              if (part.match(/^[A-Z][a-zA-Z0-9]*$/)) return <span key={j} className="token-class">{part}</span>;
              if (part.match(/^[0-9]+$/)) return <span key={j} className="token-number">{part}</span>;
              return <span key={j} className="text-[#abb2bf]">{part}</span>;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="font-mono text-xs leading-5 w-full">
        <div className="table w-full">
            {renderCode()}
        </div>
    </div>
  );
};

const BuilderPreview: React.FC<BuilderPreviewProps> = ({ appData, onDeploy, currentChain }) => {
  const [activeFile, setActiveFile] = useState('App.tsx');
  const [deviceMode, setDeviceMode] = useState<'MOBILE' | 'TABLET' | 'DESKTOP'>('MOBILE');
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const activeChain = CHAINS[currentChain];

  const handleRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleConfirmDeploy = async () => {
    setIsDeploying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeploying(false); 
    setShowDeployModal(false); 
    setShowSuccessToast(true);
    setTimeout(() => onDeploy(), 2500);
  };

  const getActiveCode = () => {
      switch(activeFile) {
          case 'Contract.sol': return appData.contractSnippet;
          case 'App.tsx': return appData.codeSnippet;
          case 'Config.json': return JSON.stringify({ name: appData.name, chain: currentChain, rarity: appData.rarity, attributes: appData.attributes }, null, 2);
          default: return '';
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0c0c] text-white overflow-hidden relative">
      
      {/* IDE Header */}
      <div className="h-12 border-b border-[#1f1f1f] bg-[#111] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
              </div>
              <span className="ml-4 text-xs font-mono text-[#666] uppercase tracking-wider">Limetred Studio v2.4</span>
          </div>
          <div className="flex gap-4">
              <button 
                onClick={() => setShowDeployModal(true)} 
                className="bg-[#39b54a] text-black px-4 py-1 text-xs font-bold uppercase hover:bg-[#2ea03f] flex items-center gap-2"
              >
                  <Rocket size={12} /> Deploy Project
              </button>
          </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar / File Explorer */}
          <div className="w-64 border-r border-[#1f1f1f] bg-[#0c0c0c] flex flex-col hidden md:flex shrink-0">
              <div className="p-3 text-xs font-bold text-[#666] uppercase tracking-widest">Explorer</div>
              <div className="flex-1 overflow-y-auto">
                  <div className="px-2">
                      <div className="text-[#ccc] text-xs font-bold mb-2 flex items-center gap-1"><ChevronDown size={12}/> {appData.name.replace(/\s+/g, '_')}</div>
                      <div className="pl-4 space-y-1">
                          <button onClick={() => setActiveFile('Contract.sol')} className={`w-full text-left text-xs font-mono py-1 px-2 flex items-center gap-2 ${activeFile === 'Contract.sol' ? 'bg-[#39b54a]/10 text-[#39b54a]' : 'text-[#888] hover:text-white'}`}>
                              <FileCode size={12} /> Contract.sol
                          </button>
                          <button onClick={() => setActiveFile('App.tsx')} className={`w-full text-left text-xs font-mono py-1 px-2 flex items-center gap-2 ${activeFile === 'App.tsx' ? 'bg-[#39b54a]/10 text-[#39b54a]' : 'text-[#888] hover:text-white'}`}>
                              <FileCode size={12} /> App.tsx
                          </button>
                          <button onClick={() => setActiveFile('Config.json')} className={`w-full text-left text-xs font-mono py-1 px-2 flex items-center gap-2 ${activeFile === 'Config.json' ? 'bg-[#39b54a]/10 text-[#39b54a]' : 'text-[#888] hover:text-white'}`}>
                              <FileCode size={12} /> Config.json
                          </button>
                      </div>
                  </div>
              </div>
              <div className="p-3 border-t border-[#1f1f1f] text-[10px] text-[#666]">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Connected to Localhost</div>
                  <div>Memory Usage: 42MB</div>
              </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col border-r border-[#1f1f1f] min-w-[300px]">
              {/* Tabs */}
              <div className="flex bg-[#111] border-b border-[#1f1f1f] shrink-0">
                  {['Contract.sol', 'App.tsx', 'Config.json'].map(file => (
                      <button 
                        key={file}
                        onClick={() => setActiveFile(file)}
                        className={`px-4 py-2 text-xs font-mono border-r border-[#1f1f1f] flex items-center gap-2 ${activeFile === file ? 'bg-[#0c0c0c] text-white border-t-2 border-t-[#39b54a]' : 'text-[#666] hover:bg-[#1a1a1a]'}`}
                      >
                          {file}
                          {activeFile === file && <X size={10} className="opacity-50 hover:opacity-100" />}
                      </button>
                  ))}
              </div>
              
              {/* Code View */}
              <div className="flex-1 bg-[#0c0c0c] p-4 overflow-auto">
                  <SyntaxHighlight code={getActiveCode()} />
              </div>

              {/* Terminal */}
              <div className="h-32 border-t border-[#1f1f1f] bg-[#111] flex flex-col shrink-0">
                  <div className="flex items-center justify-between px-3 py-1 border-b border-[#1f1f1f]">
                      <div className="flex gap-4">
                          <span className="text-[10px] uppercase font-bold text-[#39b54a] border-b border-[#39b54a] pb-0.5">Output</span>
                          <span className="text-[10px] uppercase font-bold text-[#666]">Problems</span>
                          <span className="text-[10px] uppercase font-bold text-[#666]">Debug Console</span>
                      </div>
                      <div className="flex gap-2">
                          <Maximize2 size={10} className="text-[#666]" />
                          <X size={10} className="text-[#666]" />
                      </div>
                  </div>
                  <div className="flex-1 p-2 font-mono text-[10px] text-[#888] overflow-y-auto space-y-1">
                      <div>{`> limetred-cli build --target ${currentChain}`}</div>
                      <div className="text-[#39b54a]">✔ Contract compiled successfully in 420ms</div>
                      <div className="text-[#39b54a]">✔ React components optimized</div>
                      <div>{`> Ready for deployment on ${activeChain.name}...`}</div>
                  </div>
              </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-[#1a1a1a] flex flex-col relative">
              {/* Toolbar */}
              <div className="h-10 bg-[#111] border-b border-[#1f1f1f] flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-2">
                      <div className="bg-[#000] text-[#666] text-[10px] px-2 py-1 rounded font-mono">localhost:3000</div>
                      <button onClick={handleRefresh} className="p-1 hover:text-white text-[#666]">
                          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                      </button>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0c0c0c] rounded p-0.5 border border-[#333]">
                      <button onClick={() => setDeviceMode('MOBILE')} className={`p-1.5 rounded ${deviceMode === 'MOBILE' ? 'bg-[#333] text-white' : 'text-[#666] hover:text-white'}`}><Smartphone size={14} /></button>
                      <button onClick={() => setDeviceMode('TABLET')} className={`p-1.5 rounded ${deviceMode === 'TABLET' ? 'bg-[#333] text-white' : 'text-[#666] hover:text-white'}`}><Tablet size={14} /></button>
                      <button onClick={() => setDeviceMode('DESKTOP')} className={`p-1.5 rounded ${deviceMode === 'DESKTOP' ? 'bg-[#333] text-white' : 'text-[#666] hover:text-white'}`}><Monitor size={14} /></button>
                  </div>
              </div>

              {/* Device Frame */}
              <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
                  <motion.div 
                    animate={{ 
                        width: deviceMode === 'MOBILE' ? 320 : deviceMode === 'TABLET' ? 600 : '100%',
                        height: deviceMode === 'DESKTOP' ? '100%' : 600,
                        borderRadius: deviceMode === 'DESKTOP' ? 0 : 20
                    }}
                    className="bg-black border-4 border-[#333] shadow-2xl overflow-hidden relative flex flex-col transition-all duration-300 ease-in-out"
                  >
                      {/* Mock App Content inside Device */}
                      <div className="bg-[#111111] text-white h-full flex flex-col">
                           <div className="p-4 border-b border-[#333] flex justify-between items-center">
                               <span className="font-bold text-sm">{appData.name}</span>
                               <div className="flex gap-1">
                                   <div className="w-1 h-1 bg-white rounded-full"></div>
                                   <div className="w-1 h-1 bg-white rounded-full"></div>
                               </div>
                           </div>
                           <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                               {isRefreshing ? (
                                   <Loader2 className="animate-spin text-[#39b54a]" size={32} />
                               ) : (
                                   <>
                                       <div className="w-16 h-16 border border-[#39b54a] flex items-center justify-center mb-4 rounded-full">
                                           <Rocket size={24} className="text-[#39b54a]" />
                                       </div>
                                       <h3 className="text-xl font-bold mb-2">Welcome to {appData.name}</h3>
                                       <p className="text-xs text-gray-500 mb-6">{appData.description}</p>
                                       <button className="bg-[#39b54a] text-black w-full py-3 font-bold uppercase text-xs hover:bg-[#2ea03f] transition-colors">
                                           Connect Wallet
                                       </button>
                                   </>
                               )}
                           </div>
                      </div>
                  </motion.div>
              </div>
          </div>

      </div>

      {/* Modals */}
      <AnimatePresence>
            {showDeployModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#111111] border border-[#39b54a] p-8 max-w-sm w-full text-center">
                        <h3 className="text-2xl font-bold text-white mb-2 uppercase">Ready to Launch?</h3>
                        <p className="text-[#666666] mb-6 text-sm">This will deploy contracts on <span className="text-white font-bold">{activeChain.name}</span>, create the liquidity pool, and list on the Limetred dash.</p>
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleConfirmDeploy} disabled={isDeploying}>
                                {isDeploying ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> DEPLOYING...</span> : "CONFIRM DEPLOYMENT"}
                            </Button>
                            <Button variant="ghost" onClick={() => setShowDeployModal(false)} disabled={isDeploying}>CANCEL</Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
      </AnimatePresence>
      <AnimatePresence>
            {showSuccessToast && (
                <motion.div initial={{ opacity: 0, y: 50, x: 50 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 right-8 z-[100] bg-[#111111] border border-[#39b54a] p-5 shadow-[0_0_50px_rgba(57,181,74,0.3)] flex items-center gap-4 min-w-[320px]">
                    <div className="w-12 h-12 bg-[#39b54a]/10 border border-[#39b54a]/30 flex items-center justify-center rounded-none shrink-0"><CheckCircle className="text-[#39b54a]" size={24} /></div>
                    <div>
                        <h4 className="text-white font-bold uppercase tracking-wider text-sm">Deployment Successful</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#666666] text-xs font-mono">Redirecting to Dashboard</span>
                            <span className="flex gap-1">
                                <span className="w-1 h-1 bg-[#39b54a] rounded-full animate-[bounce_1s_infinite]"></span>
                                <span className="w-1 h-1 bg-[#39b54a] rounded-full animate-[bounce_1s_infinite_0.2s]"></span>
                                <span className="w-1 h-1 bg-[#39b54a] rounded-full animate-[bounce_1s_infinite_0.4s]"></span>
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
      </AnimatePresence>
    </div>
  );
};

export default BuilderPreview;