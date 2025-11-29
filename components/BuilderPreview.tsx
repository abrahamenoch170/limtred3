import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedApp, ChainId } from '../types';
import { generateProjectAsset, analyzeImage } from '../services/geminiService';
import { 
  Rocket, Smartphone, CheckCircle, Loader2, Monitor, Tablet, 
  RefreshCw, Maximize2, X, ChevronDown, Image as ImageIcon, Download, Copy, Check, Terminal, Box,
  RotateCcw, Minus, Plus, Upload, FileJson, ScrollText, AppWindow, RotateCw, Settings, AlertCircle, ExternalLink
} from 'lucide-react';
import { CHAINS } from '../constants';

interface BuilderPreviewProps {
  appData: GeneratedApp;
  onDeploy: () => void;
  currentChain: ChainId;
}

// Device Configuration Types
interface DeviceConfig {
  name: string;
  width: number | string;
  height: number | string;
  type: 'MOBILE' | 'TABLET' | 'DESKTOP';
}

const DEVICES: DeviceConfig[] = [
  { name: 'iPhone 13', width: 375, height: 812, type: 'MOBILE' },
  { name: 'iPhone 14 Pro', width: 393, height: 852, type: 'MOBILE' },
  { name: 'Pixel 7', width: 412, height: 915, type: 'MOBILE' },
  { name: 'iPad Mini', width: 768, height: 1024, type: 'TABLET' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, type: 'TABLET' },
  { name: 'Desktop (1080p)', width: 1920, height: 1080, type: 'DESKTOP' },
  { name: 'Responsive', width: '100%', height: '100%', type: 'DESKTOP' },
];

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
  const [activeDevice, setActiveDevice] = useState<DeviceConfig>(DEVICES[1]); // Default to iPhone 14 Pro
  const [zoom, setZoom] = useState(1.0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  
  // Asset Studio State
  const [assetPrompt, setAssetPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState(false);
  
  // Upload & Analysis State
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const activeChain = CHAINS[currentChain];

  // Mock Gas Fees
  const getGasEstimate = () => {
      switch(currentChain) {
          case 'SOL': return '0.02 SOL';
          case 'ETH': return '0.004 ETH';
          case 'BASE': return '0.0002 ETH';
          case 'TON': return '0.05 TON';
          case 'ARB': return '0.0002 ETH';
          default: return '0.01 ETH';
      }
  };

  const handleRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleResetView = () => {
      setZoom(1.0);
      setActiveDevice(DEVICES[1]); // Reset to default iPhone
      setIsLandscape(false);
  };

  const toggleOrientation = () => {
      if (activeDevice.type !== 'DESKTOP') {
          setIsLandscape(!isLandscape);
      }
  };

  const handleOpenRemix = () => {
    if (!appData.contractSnippet) return;
    const base64Code = btoa(appData.contractSnippet);
    // Open Remix with the code pre-loaded via the hash parameter
    const url = `https://remix.ethereum.org/#code=${base64Code}&autoCompile=true`;
    window.open(url, '_blank');
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
    setGenerationError(false);
    setGeneratedAsset(null); // Clear previous
    const result = await generateProjectAsset(assetPrompt, aspectRatio);
    if (result) {
        setGeneratedAsset(result);
    } else {
        setGenerationError(true);
    }
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

  // --- Drag & Drop Handlers ---
  const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
          setDragActive(true);
      } else if (e.type === "dragleave") {
          setDragActive(false);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
      }
  };

  const handleFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
          const result = e.target?.result as string;
          setUploadedImage(result);
          setIsAnalyzing(true);
          const analysis = await analyzeImage(result);
          setAssetPrompt(analysis);
          setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
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
                onClick={handleOpenRemix} 
                className="bg-[#1f1f1f] text-[#ccc] border border-[#333] px-3 py-1 text-xs font-bold uppercase hover:bg-[#333] hover:text-white flex items-center gap-2 transition-colors"
                title="Open Smart Contract in Remix IDE"
              >
                  <ExternalLink size={12} /> Open in Remix
              </button>

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
                              <ScrollText size={12} /> Contract.sol
                          </button>
                          <button onClick={() => setActiveFile('App.tsx')} className={`w-full text-left text-xs font-mono py-1 px-2 flex items-center gap-2 transition-colors ${activeFile === 'App.tsx' ? 'bg-[#39b54a]/10 text-[#39b54a]' : 'text-[#888] hover:text-white'}`}>
                              <AppWindow size={12} /> App.tsx
                          </button>
                          <button onClick={() => setActiveFile('Config.json')} className={`w-full text-left text-xs font-mono py-1 px-2 flex items-center gap-2 transition-colors ${activeFile === 'Config.json' ? 'bg-[#39b54a]/10 text-[#39b54a]' : 'text-[#888] hover:text-white'}`}>
                              <FileJson size={12} /> Config.json
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
                            {/* Drag & Drop Area */}
                            <div 
                                className={`border border-dashed transition-all duration-200 p-6 mb-4 flex flex-col items-center justify-center cursor-pointer relative group ${dragActive ? 'border-[#39b54a] bg-[#39b54a]/10' : 'border-[#333] bg-[#0c0c0c] hover:border-[#666]'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => !uploadedImage && document.getElementById('asset-upload')?.click()}
                            >
                                <input id="asset-upload" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                                
                                {uploadedImage ? (
                                    <div className="relative w-full">
                                        <img src={uploadedImage} alt="Analysis Target" className="h-48 w-full object-contain" />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setAssetPrompt(""); }}
                                            className="absolute top-2 right-2 bg-black/50 text-white p-1 hover:bg-red-500 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                        {isAnalyzing && (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                                <Loader2 className="animate-spin text-[#39b54a]" size={24} />
                                                <span className="text-xs font-mono text-[#39b54a] animate-pulse">ANALYZING VISUAL DATA...</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload size={20} className="text-[#666] group-hover:text-white" />
                                        </div>
                                        <p className="text-xs text-[#666] uppercase font-bold group-hover:text-white">Drag Image for Analysis</p>
                                    </>
                                )}
                            </div>

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
                                {isGeneratingAsset ? (
                                    <><Loader2 className="animate-spin" size={16} /> GENERATING...</>
                                ) : (
                                    <><Rocket size={16} /> GENERATE ASSET</>
                                )}
                            </button>
                            
                            {generationError && (
                                <div className="mt-3 bg-red-500/10 border border-red-500/50 p-3 flex flex-col items-center gap-2">
                                    <span className="text-red-400 text-[10px] font-bold uppercase flex items-center gap-1">
                                        <AlertCircle size={12} /> Generation Failed
                                    </span>
                                    <button 
                                        onClick={handleGenerateAsset}
                                        className="text-[10px] bg-red-500/20 text-red-400 px-3 py-1 hover:bg-red-500/30 transition-colors uppercase font-bold"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Result Area */}
                        {generatedAsset && (
                            <div className="bg-[#111] border border-[#39b54a] p-4 animate-in fade-in slide-in-from-bottom-4">
                                <h4 className="text-[#39b54a] font-bold text-xs uppercase mb-3 flex items-center gap-2">
                                    <CheckCircle size={14} /> Asset Generated
                                </h4>
                                <img src={generatedAsset} alt="Generated Asset" className="w-full mb-3 border border-[#333]" />
                                <button className="w-full border border-[#333] text-[#ccc] py-2 text-xs hover:bg-[#1f1f1f] flex items-center justify-center gap-2">
                                    <Download size={14} /> Download Asset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
              ) : (
                <div className="flex-1 flex overflow-hidden">
                    {/* Code Column */}
                    <div className="flex-1 bg-[#0c0c0c] overflow-auto border-r border-[#1f1f1f] flex flex-col relative">
                         <div className="flex-1 overflow-auto p-4">
                            <SyntaxHighlight code={getActiveCode()} />
                         </div>
                         <div className="bg-[#111] border-t border-[#1f1f1f] p-2 flex justify-between items-center text-[10px] text-[#666]">
                             <div className="flex items-center gap-2"><Terminal size={10} /> <span>Ln 1, Col 1</span></div>
                             <div>UTF-8</div>
                         </div>
                    </div>

                    {/* Preview Column (Device) */}
                    <div className="w-[45%] bg-[#111] flex flex-col relative hidden lg:flex">
                        {/* Device Toolbar */}
                        <div className="h-10 bg-[#0c0c0c] border-b border-[#1f1f1f] flex items-center justify-between px-3 shrink-0">
                            <div className="flex items-center gap-2 relative">
                                <button 
                                    onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                                    className="flex items-center gap-2 text-xs text-[#ccc] hover:text-white px-2 py-1 bg-[#1a1a1a] border border-[#333]"
                                >
                                    {activeDevice.name} <ChevronDown size={10} />
                                </button>
                                
                                {showDeviceMenu && (
                                    <div className="absolute top-full left-0 mt-1 w-40 bg-[#111] border border-[#333] shadow-xl z-50">
                                        {DEVICES.map(device => (
                                            <button
                                                key={device.name}
                                                onClick={() => { setActiveDevice(device); setShowDeviceMenu(false); setZoom(1.0); }}
                                                className={`w-full text-left px-3 py-2 text-[10px] hover:bg-[#39b54a]/10 hover:text-[#39b54a] flex items-center justify-between ${activeDevice.name === device.name ? 'text-[#39b54a]' : 'text-[#888]'}`}
                                            >
                                                {device.name}
                                                {activeDevice.name === device.name && <Check size={10} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center bg-[#1a1a1a] border border-[#333]">
                                <button onClick={toggleOrientation} className="p-1.5 hover:bg-[#333] text-[#888] hover:text-white border-r border-[#333] transition-colors" title="Rotate">
                                    <RotateCw size={12} />
                                </button>
                                <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-1.5 hover:bg-[#333] text-[#888] hover:text-white border-r border-[#333] transition-colors"><Minus size={12} /></button>
                                <div className="w-12 text-center text-[10px] text-[#888]">{Math.round(zoom * 100)}%</div>
                                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-[#333] text-[#888] hover:text-white border-l border-[#333] transition-colors"><Plus size={12} /></button>
                                <button onClick={handleResetView} className="p-1.5 hover:bg-[#333] text-[#888] hover:text-white border-l border-[#333] transition-colors" title="Reset View">
                                    <RotateCcw size={12} />
                                </button>
                            </div>

                            <div className="flex items-center gap-1">
                                <button onClick={handleRefresh} className={`p-1.5 hover:text-white ${isRefreshing ? 'animate-spin text-[#39b54a]' : 'text-[#666]'}`}>
                                    <RefreshCw size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Device Canvas */}
                        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
                             {/* Background Grid */}
                             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                                  style={{ 
                                      backgroundImage: 'radial-gradient(#666 1px, transparent 1px)', 
                                      backgroundSize: '20px 20px' 
                                  }} 
                             />

                             <motion.div 
                                animate={{ 
                                    scale: zoom,
                                    rotate: isLandscape && activeDevice.type !== 'DESKTOP' ? 90 : 0
                                }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    width: activeDevice.width,
                                    height: activeDevice.height,
                                }}
                                className={`bg-white relative shadow-2xl transition-all ${activeDevice.type === 'MOBILE' ? 'rounded-[3rem] border-8 border-[#1f1f1f]' : activeDevice.type === 'TABLET' ? 'rounded-[2rem] border-8 border-[#1f1f1f]' : 'rounded-none border-0'}`}
                             >
                                 {/* Notch (Mobile Only) */}
                                 {activeDevice.type === 'MOBILE' && (
                                     <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-[#1f1f1f] rounded-b-xl z-20"></div>
                                 )}

                                 <div className="w-full h-full overflow-hidden bg-black relative">
                                    <AnimatePresence mode="wait">
                                        {isRefreshing ? (
                                            <motion.div
                                                key="loader"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-50 bg-[#0c0c0c] flex items-center justify-center"
                                            >
                                                <div className="flex flex-col items-center gap-4">
                                                    <Loader2 size={32} className="text-[#39b54a] animate-spin" />
                                                    <div className="text-[#39b54a] text-xs font-mono animate-pulse">BOOTING KERNEL...</div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="content"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="w-full h-full"
                                            >
                                                <iframe 
                                                    srcDoc={`
                                                        <html>
                                                          <head>
                                                            <script src="https://cdn.tailwindcss.com"></script>
                                                            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Montserrat:wght@400;600;800&display=swap" rel="stylesheet">
                                                            <style>body { font-family: 'Montserrat', sans-serif; }</style>
                                                          </head>
                                                          <body>
                                                            <div id="root"></div>
                                                            <script type="module">
                                                              import React from 'https://esm.sh/react@18';
                                                              import ReactDOM from 'https://esm.sh/react-dom@18/client';
                                                              
                                                              const App = () => React.createElement('div', { className: 'h-screen w-full bg-[#0c0c0c] text-white flex flex-col items-center justify-center p-6' }, 
                                                                React.createElement('div', { className: 'text-[#39b54a] font-bold text-sm mb-4' }, 'PREVIEW MODE'),
                                                                React.createElement('h1', { className: 'text-3xl font-black mb-4 text-center uppercase' }, '${appData.name}'),
                                                                React.createElement('p', { className: 'text-gray-400 text-center text-sm mb-8' }, '${appData.description}'),
                                                                React.createElement('button', { className: 'bg-[#39b54a] text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-[#2ea03f]' }, 'Connect Wallet')
                                                              );

                                                              const root = ReactDOM.createRoot(document.getElementById('root'));
                                                              root.render(React.createElement(App));
                                                            </script>
                                                          </body>
                                                        </html>
                                                    `}
                                                    className="w-full h-full border-0"
                                                    title="App Preview"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                 </div>
                             </motion.div>
                        </div>
                    </div>
                </div>
              )}
          </div>
      </div>

      {/* Deployment Modal */}
      <AnimatePresence>
        {showDeployModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-[#39b54a] w-full max-w-lg p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#39b54a] to-transparent animate-pulse"></div>
                
                <h2 className="text-2xl font-black uppercase text-white mb-6 flex items-center gap-3">
                    <Rocket className="text-[#39b54a]" /> Confirm Deployment
                </h2>
                
                <div className="space-y-4 mb-8">
                    <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 flex justify-between items-center">
                        <span className="text-[#888] text-xs font-bold uppercase">Target Network</span>
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeChain.color }}></div>
                             <span className="text-white font-mono">{activeChain.name} Mainnet</span>
                        </div>
                    </div>
                    <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 flex justify-between items-center">
                        <span className="text-[#888] text-xs font-bold uppercase">Contract Type</span>
                        <span className="text-white font-mono">ERC20 + AccessControl</span>
                    </div>
                    <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 flex justify-between items-center">
                        <span className="text-[#888] text-xs font-bold uppercase">Estimated Gas</span>
                        <span className="text-[#39b54a] font-mono font-bold">{getGasEstimate()}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowDeployModal(false)}
                        className="flex-1 border border-[#333] text-[#888] py-3 font-bold uppercase hover:bg-[#1f1f1f] transition-colors"
                        disabled={isDeploying}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmDeploy}
                        disabled={isDeploying}
                        className="flex-1 bg-[#39b54a] text-black py-3 font-bold uppercase hover:bg-[#2ea03f] flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                    >
                        {isDeploying ? <Loader2 className="animate-spin" size={18} /> : 'Confirm & Deploy'}
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-8 right-8 bg-[#111] border border-[#39b54a] p-4 flex items-center gap-4 z-[150] shadow-[0_0_30px_rgba(57,181,74,0.3)]"
          >
            <div className="w-10 h-10 bg-[#39b54a]/20 flex items-center justify-center rounded-full text-[#39b54a]">
                <CheckCircle size={20} />
            </div>
            <div>
                <h4 className="font-bold text-white uppercase text-sm">Deployment Successful</h4>
                <p className="text-[#666] text-xs font-mono">Contract verified on {activeChain.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuilderPreview;