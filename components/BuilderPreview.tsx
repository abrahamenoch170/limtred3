import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/GlintComponents';
import { GeneratedApp, ChainId } from '../types';
import { generateProjectAsset } from '../services/geminiService';
import { 
  Rocket, Smartphone, CheckCircle, Loader2, Monitor, Tablet, 
  RefreshCw, Maximize2, X, ChevronDown, FileCode, Image as ImageIcon, Download, Copy, Check, Terminal, Box,
  RotateCcw, Minus, Plus
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
          <span className="table-cell whitespace-pre text-left">
            {parts.map((part, j) => {
              if (part.startsWith('//')) return <span key={j} className="token-comment">{part}</span>;
              if (part.match(/^["'].*["']$/)) return <span key={j} className="token-string">{part}</span>;
              if (['import', 'from', 'export', 'default', 'function', 'const', 'let', 'var', 'return', 'if', 'else', 'contract', 'pragma', 'struct', 'mapping', 'event', 'constructor', 'modifier', 'require', 'emit', 'override', 'virtual', 'is'].includes(part.trim())) 
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
  const [activeFile, setActiveFile] = useState('Contract.sol');
  const [deviceMode, setDeviceMode] = useState<'MOBILE' | 'TABLET' | 'DESKTOP'>('MOBILE');
  const [zoom, setZoom] = useState(1.0);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Asset Studio State
  const [assetPrompt, setAssetPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<string | null>(null);
  
  const activeChain = CHAINS[currentChain];

  const handleRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleResetView = () => {
      setZoom(1.0);
      setDeviceMode('MOBILE');
  };

  const handleConfirmDeploy = async () => {
    setIsDeploying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeploying(false); 
    setShowDeployModal(false); 
    setShowSuccessToast(true);
    setTimeout(() => onDeploy(), 2500);
  };

  const handleGenerateAsset = async () => {
    if (!assetPrompt) return;
    setIsGeneratingAsset(true);
    const result = await generateProjectAsset(assetPrompt, aspectRatio);
    setGeneratedAsset(result);
    setIsGeneratingAsset(false);
  };

  const getActiveCode = () => {
      switch(activeFile) {
          case 'Contract.sol': return appData.contractSnippet;
          case 'App.tsx': return appData.codeSnippet;
          case 'Config.json': return JSON.stringify({ name: appData.name, chain: currentChain, rarity: appData.rarity, attributes: appData.attributes }, null, 2);
          default: return '';
      }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getActiveCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              <span className="ml-4 text-xs font-mono text-[#666] uppercase tracking-wider flex items-center gap-2">
                Limetred Studio <span className="text-[#39b54a]">v2.4-BETA</span>
              </span>
          </div>
          <div className="flex gap-4">
              <div className="hidden md:flex items-center gap-2 text-[10px] text-[#666] mr-4 font-mono">
                  <Box size={12} />
                  SANDBOX ENV: <span className="text-[#39b54a]">ACTIVE</span>
              </div>
              <button 
                onClick={() => setShowDeployModal(true)} 
                className="bg-[#39b54a] text-black px-4 py-1 text-xs font-bold uppercase hover:bg-[#2ea03f] flex items-center gap-2 transition-colors"
              >
                  <Rocket size={12} /> Deploy Project
              </button>
          </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar / File Explorer */}
          <div className="w-64 border-r border-[#1f1f1f] bg-[#0c0c0c] flex flex-col hidden md:flex shrink-0">
              <div className="p-3 text-xs font-bold text-[#666] uppercase tracking-widest border-b border-[#1f1f1f]">Explorer</div>
              <div className="flex-1 overflow-y-auto">
                  <div className="px-2 pt-2">
                      <div className="text-[#ccc] text-xs font-bold mb-2 flex items-center gap-1"><ChevronDown size={12}/> {appData.name.replace(/\s+/g, '_')}</div>
                      <div className="pl-4 space-y-1">
                          <button onClick={() => setActiveFile('Contract.sol')} className={`w-full text-left text-xs font-mono py-1 px-2 flex items-center gap-2 transition-colors ${activeFile === 'Contract.sol' ? 'bg-[#39b54a]/10 text-[#39b54a]' : 'text-[#888] hover:text-white'}`}>
                              <FileCode size={12} /> Contract.sol
                          </button>
                          <button onClick={() => setActiveFile('App.tsx')} className={`w-full text-left text-xs font-mono py-1 px-2 flex items-center gap-2 transition-colors ${activeFile === 'App.tsx' ? 'bg-[#39b54a]/10 text-[#39b54a]' : 'text-[#888] hover:text-white'}`}>
                              <FileCode size={12} /> App.tsx
                          </button>
                          <button onClick={() => setActiveFile('Config.json')} className={`w-full text-left text-xs font-mono py-1 px-2 flex items-center gap-2 transition-colors ${activeFile === 'Config.json' ? 'bg-[#39b54a]/10 text-[#39b54a]' : 'text-[#888] hover:text-white'}`}>
                              <FileCode size={12} /> Config.json
                          </button>
                          <button onClick={() => setActiveFile('Assets')} className={`w-full text-left text-xs font-mono py-1 px-2 flex items-center gap-2 transition-colors ${activeFile === 'Assets' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' : 'text-[#888] hover:text-white'}`}>
                              <ImageIcon size={12} /> Asset Studio
                          </button>
                      </div>
                  </div>
              </div>
              <div className="p-3 border-t border-[#1f1f1f] text-[10px] text-[#666]">
                  <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Connected to {activeChain.name} Testnet</div>
                  <div>Memory Usage: 42MB</div>
              </div>
          </div>

          {/* Editor Area / Asset Studio */}
          <div className="flex-1 flex flex-col border-r border-[#1f1f1f] min-w-[300px]">
              {/* Tabs */}
              <div className="flex justify-between bg-[#111] border-b border-[#1f1f1f] shrink-0">
                  <div className="flex overflow-x-auto no-scrollbar">
                    {['Contract.sol', 'App.tsx', 'Config.json', 'Assets'].map(file => (
                        <button 
                            key={file}
                            onClick={() => setActiveFile(file)}
                            className={`px-4 py-2 text-xs font-mono border-r border-[#1f1f1f] flex items-center gap-2 whitespace-nowrap ${activeFile === file ? 'bg-[#0c0c0c] text-white border-t-2 border-t-[#39b54a]' : 'text-[#666] hover:bg-[#1a1a1a]'}`}
                        >
                            {file}
                            {activeFile === file && <X size={10} className="opacity-50 hover:opacity-100" />}
                        </button>
                    ))}
                  </div>
                  
                  {activeFile !== 'Assets' && (
                    <div className="flex items-center gap-1 px-2 border-l border-[#1f1f1f]">
                         <button onClick={handleCopyCode} className="p-2 text-[#666] hover:text-white transition-colors relative group" title="Copy to Clipboard">
                             {copied ? <Check size={14} className="text-[#39b54a]" /> : <Copy size={14} />}
                         </button>
                         <button onClick={handleDownload} className="p-2 text-[#666] hover:text-white transition-colors relative group" title="Download File">
                             <Download size={14} />
                         </button>
                    </div>
                  )}
              </div>
              
              {/* Content View */}
              {activeFile === 'Assets' ? (
                <div className="flex-1 bg-[#0c0c0c] p-6 overflow-auto">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-white font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <ImageIcon size={16} className="text-[#8b5cf6]" /> Asset Generator
                        </h3>
                        
                        <div className="bg-[#111] border border-[#1f1f1f] p-4 mb-4">
                            <label className="text-xs text-[#666] uppercase font-bold mb-2 block">Prompt</label>
                            <textarea 
                                value={assetPrompt}
                                onChange={(e) => setAssetPrompt(e.target.value)}
                                placeholder="Cyberpunk logo for DeFi protocol, glowing neon green..."
                                className="w-full bg-[#0c0c0c] border border-[#333] p-2 text-sm text-white focus:border-[#8b5cf6] outline-none h-24 mb-4 font-mono resize-none"
                            />
                            
                            <label className="text-xs text-[#666] uppercase font-bold mb-2 block">Aspect Ratio</label>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {["1:1", "16:9", "9:16", "4:3"].map(ratio => (
                                    <button 
                                        key={ratio}
                                        onClick={() => setAspectRatio(ratio)}
                                        className={`py-1 text-xs border ${aspectRatio === ratio ? 'border-[#8b5cf6] text-[#8b5cf6] bg-[#8b5cf6]/10' : 'border-[#333] text-[#666] hover:border-[#666]'}`}
                                    >
                                        {ratio}
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                onClick={handleGenerateAsset}
                                disabled={isGeneratingAsset || !assetPrompt}
                                className="w-full bg-[#8b5cf6] text-white py-2 font-bold uppercase text-xs hover:bg-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isGeneratingAsset ? <Loader2 className="animate-spin" size={14}/> : 'GENERATE ASSET'}
                            </button>
                        </div>

                        {generatedAsset && (
                            <div className="bg-[#111] border border-[#1f1f1f] p-2">
                                <img src={generatedAsset} alt="Generated Asset" className="w-full h-auto border border-[#333]" />
                                <a 
                                    href={generatedAsset} 
                                    download={`asset-${Date.now()}.png`}
                                    className="block text-center text-xs text-[#8b5cf6] mt-2 hover:underline"
                                >
                                    Download Image
                                </a>
                            </div>
                        )}
                    </div>
                </div>
              ) : (
                <div className="flex-1 bg-[#0c0c0c] p-4 overflow-auto relative group">
                    <SyntaxHighlight code={getActiveCode()} />
                </div>
              )}

              {/* Terminal */}
              <div className="h-32 border-t border-[#1f1f1f] bg-[#111] flex flex-col shrink-0">
                  <div className="flex items-center justify-between px-3 py-1 border-b border-[#1f1f1f]">
                      <div className="flex gap-4">
                          <span className="text-[10px] uppercase font-bold text-[#39b54a] border-b border-[#39b54a] pb-0.5 cursor-pointer">Output</span>
                          <span className="text-[10px] uppercase font-bold text-[#666] cursor-pointer hover:text-white">Problems</span>
                          <span className="text-[10px] uppercase font-bold text-[#666] cursor-pointer hover:text-white">Debug Console</span>
                      </div>
                      <div className="flex gap-2">
                          <Maximize2 size={10} className="text-[#666] cursor-pointer hover:text-white" />
                          <X size={10} className="text-[#666] cursor-pointer hover:text-white" />
                      </div>
                  </div>
                  <div className="flex-1 p-2 font-mono text-[10px] text-[#888] overflow-y-auto space-y-1">
                      <div className="flex items-center gap-2 text-white"><Terminal size={10}/> {`limetred-cli build --target ${currentChain}`}</div>
                      <div className="text-[#39b54a]">✔ Contract compiled successfully in 420ms</div>
                      <div className="text-[#39b54a]">✔ React components optimized</div>
                      <div className="text-[#666]">   - 28 modules transformed</div>
                      <div className="text-[#666]">   - 0 errors, 0 warnings</div>
                      <div className="animate-pulse">{`> Ready for deployment on ${activeChain.name}...`}</div>
                  </div>
              </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-[#1a1a1a] flex flex-col relative border-l border-[#1f1f1f] overflow-hidden">
              {/* Toolbar */}
              <div className="h-10 bg-[#111] border-b border-[#1f1f1f] flex items-center justify-between px-4 shrink-0 z-20">
                  <div className="flex items-center gap-2">
                      <div className="bg-[#000] text-[#666] text-[10px] px-2 py-1 rounded font-mono border border-[#222]">localhost:3000</div>
                      <button onClick={handleRefresh} className="p-1 hover:text-white text-[#666]">
                          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                      </button>
                  </div>
                  
                  {/* Zoom & Device Controls */}
                  <div className="flex items-center gap-4">
                      {/* Zoom Control */}
                      <div className="flex items-center gap-2 bg-[#0c0c0c] rounded px-2 py-1 border border-[#333]">
                          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="text-[#666] hover:text-white"><Minus size={12}/></button>
                          <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-16 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#39b54a]"
                          />
                          <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="text-[#666] hover:text-white"><Plus size={12}/></button>
                          <span className="text-[10px] text-[#666] font-mono w-8 text-right">{(zoom * 100).toFixed(0)}%</span>
                          <div className="w-px h-3 bg-[#333] mx-1"></div>
                          <button onClick={handleResetView} className="text-[#666] hover:text-[#39b54a]" title="Reset View">
                              <RotateCcw size={12} />
                          </button>
                      </div>

                      {/* Orientation / Device Control */}
                      <div className="flex items-center gap-1 bg-[#0c0c0c] rounded p-0.5 border border-[#333]">
                          <button onClick={() => setDeviceMode('MOBILE')} className={`p-1.5 rounded ${deviceMode === 'MOBILE' ? 'bg-[#333] text-white' : 'text-[#666] hover:text-white'}`}><Smartphone size={14} /></button>
                          <button onClick={() => setDeviceMode('TABLET')} className={`p-1.5 rounded ${deviceMode === 'TABLET' ? 'bg-[#333] text-white' : 'text-[#666] hover:text-white'}`}><Tablet size={14} /></button>
                          <button onClick={() => setDeviceMode('DESKTOP')} className={`p-1.5 rounded ${deviceMode === 'DESKTOP' ? 'bg-[#333] text-white' : 'text-[#666] hover:text-white'}`}><Monitor size={14} /></button>
                      </div>
                  </div>
              </div>

              {/* Device Frame */}
              <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden relative">
                  <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out', transformOrigin: 'center center' }} className="flex items-center justify-center w-full h-full">
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
                            <div className="p-4 border-b border-[#333] flex justify-between items-center shrink-0">
                                <span className="font-bold text-sm truncate">{appData.name}</span>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex-1 relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {isRefreshing ? (
                                        <motion.div
                                            key="loader"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex items-center justify-center bg-[#111111] z-10"
                                        >
                                            <Loader2 className="animate-spin text-[#39b54a]" size={32} />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="content"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center text-center p-6 h-full overflow-y-auto"
                                        >
                                            <div className="w-16 h-16 border border-[#39b54a] flex items-center justify-center mb-4 rounded-full">
                                                <Rocket size={24} className="text-[#39b54a]" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Welcome to {appData.name}</h3>
                                            <p className="text-xs text-gray-500 mb-6 max-w-[80%]">{appData.description}</p>
                                            <button className="bg-[#39b54a] text-black w-full py-3 font-bold uppercase text-xs hover:bg-[#2ea03f] transition-colors mb-4">
                                                Connect Wallet
                                            </button>
                                            <div className="flex gap-2 text-[10px] text-[#666]">
                                                    {appData.attributes.map((attr, i) => (
                                                        <span key={i} className="border border-[#333] px-2 py-1 rounded-full">{attr}</span>
                                                    ))}
                                            </div>
                                            <div className="mt-8 text-[10px] text-[#444] font-mono">
                                                Powered by Limetred Beta Protocol
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                  </div>
              </div>
          </div>

      </div>

      {/* Modals */}
      <AnimatePresence>
            {showDeployModal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#111111] border border-[#39b54a] p-8 max-w-sm w-full text-center shadow-[0_0_100px_rgba(57,181,74,0.1)]">
                        <div className="w-16 h-16 bg-[#39b54a]/10 border border-[#39b54a] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Rocket size={32} className="text-[#39b54a]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 uppercase">Ready to Launch?</h3>
                        <p className="text-[#666666] mb-6 text-sm leading-relaxed">This will deploy your smart contracts on <span className="text-white font-bold">{activeChain.name}</span>, initialize the bonding curve, and list on the Limetred dashboard.</p>
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleConfirmDeploy} disabled={isDeploying} className="w-full">
                                {isDeploying ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> DEPLOYING...</span> : "CONFIRM DEPLOYMENT"}
                            </Button>
                            <Button variant="ghost" onClick={() => setShowDeployModal(false)} disabled={isDeploying} className="w-full">CANCEL</Button>
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