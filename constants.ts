import { TickerItem, ChainId, ChainConfig, LaunchpadProject } from './types';

export const COLORS = {
  void: '#0c0c0c',
  surface: '#111111',
  border: '#1f1f1f',
  green: '#39b54a',
  purple: '#8b5cf6',
  textMuted: '#666666',
  white: '#ffffff',
};

export const CHAINS: Record<ChainId, ChainConfig> = {
  SOL: { id: 'SOL', name: 'Solana', symbol: 'SOL', dex: 'Raydium', color: '#14F195' },
  ETH: { id: 'ETH', name: 'Ethereum', symbol: 'ETH', dex: 'Uniswap', color: '#627EEA' },
  BASE: { id: 'BASE', name: 'Base', symbol: 'ETH', dex: 'Aerodrome', color: '#0052FF' },
  TON: { id: 'TON', name: 'TON', symbol: 'TON', dex: 'Ston.fi', color: '#0098EA' },
  ARB: { id: 'ARB', name: 'Arbitrum', symbol: 'ETH', dex: 'Camelot', color: '#12AAFF' }
};

export const MOCK_TICKER: TickerItem[] = [
  { user: '@davide', app: 'DogTinder', gain: '+4,000%' },
  { user: '@sarah_eth', app: 'BasedToaster', gain: '+1,205%' },
  { user: '@0xAnon', app: 'RugCheckAI', gain: '+890%' },
  { user: '@crypto_jim', app: 'SleepToEarn', gain: '+200%' },
  { user: '@vitalik_fan', app: 'L2_Native_Dex', gain: '+5,500%' },
];

export const PREBUILT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LimetredLaunch is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Anti-Rug Mechanics
    uint256 public constant MAX_WALLET = 2; // 2%
    bool public tradingActive = false;

    constructor() ERC20("LimetredGenerated", "LMT") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    function enableTrading() external onlyOwner {
        tradingActive = true;
    }
}`;

export const PREBUILT_REACT = `export default function App() {
  return (
    <div className="p-4 bg-black text-white h-screen">
      <h1 className="text-4xl font-bold">Your App</h1>
      <p className="mt-4 text-gray-400">
        AI Generated Interface v1.0
      </p>
      <button className="mt-8 bg-green-500 text-black px-6 py-2">
        Connect Wallet
      </button>
    </div>
  );
}`;

// --- LAUNCHPAD MOCK DATA ---
const ADJECTIVES = ["Based", "Cyber", "Degen", "Quantum", "Hyper", "Void", "Neural", "Rusty", "Golden", "Pixel"];
const NOUNS = ["Pepe", "Doge", "Inu", "Chad", "WifHat", "GPT", "Punk", "Ape", "Gem", "Moon"];
const COLORS_LIST = ["#39b54a", "#8b5cf6", "#ef4444", "#3b82f6", "#f59e0b", "#ec4899", "#6366f1"];

export const generateMockProjects = (): LaunchpadProject[] => {
  const projects: LaunchpadProject[] = [];
  
  for (let i = 0; i < 40; i++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const name = `${adj}${noun}`;
    const ticker = `${adj[0]}${noun}`.toUpperCase();
    const mcap = Math.floor(Math.random() * 55000) + 1000; // 1k to 56k
    
    projects.push({
      id: `proj-${i}`,
      name: name,
      ticker: ticker,
      description: `The ultimate ${name} protocol. AI generated, community owned. Launching on Limetred bonding curve.`,
      rarity: Math.random() > 0.9 ? 'LEGENDARY' : Math.random() > 0.7 ? 'RARE' : 'COMMON',
      attributes: ["FAIR LAUNCH", "AI AGENT", "MEME"],
      codeSnippet: PREBUILT_REACT,
      contractSnippet: PREBUILT_CODE,
      marketCap: mcap,
      creator: `@user${Math.floor(Math.random() * 9999)}`,
      replies: Math.floor(Math.random() * 150),
      imageColor: COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)],
      timestamp: `${Math.floor(Math.random() * 59)}m ago`
    });
  }
  
  // Force a "King of the Hill"
  projects[0].marketCap = 58420;
  projects[0].name = "KingDoge AI";
  projects[0].ticker = "KDAI";
  projects[0].rarity = "LEGENDARY";
  projects[0].description = "The first AI-agent that trades meme coins based on Elon's tweets. 98% to Raydium.";

  return projects;
};

export const MOCK_PROJECTS = generateMockProjects();