import { TickerItem, ChainId, ChainConfig, LaunchpadProject, ProjectCategory } from './types';

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
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LimetredLaunch is ERC20, Ownable, ReentrancyGuard {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Anti-Rug Mechanics
    uint256 public constant MAX_WALLET = 2; // 2%
    bool public tradingActive = false;

    constructor() ERC20("LimetredGenerated", "LMT") Ownable(msg.sender) {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    function enableTrading() external onlyOwner {
        tradingActive = true;
    }

    /**
     * @dev Explicit override of transferOwnership to ensure zero-address validation
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Limetred: New owner cannot be zero address");
        super.transferOwnership(newOwner);
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
const UTILITY_PROJECTS = [
  { name: "Nexus AI Node", ticker: "NEXUS", cat: "AI", desc: "Decentralized GPU computing grid for training LLMs. Rent your idle GPU power or access enterprise-grade compute." },
  { name: "VoidShield Protocol", ticker: "VOID", cat: "SECURITY", desc: "Zero-knowledge privacy layer for EVM transactions. Mixes liquidity pools to obfuscate on-chain history." },
  { name: "Helion DePIN", ticker: "HELION", cat: "DEPIN", desc: "Solar energy trading marketplace. Connect IoT smart meters to sell excess energy to your neighbors." },
  { name: "Flux Oracle", ticker: "FLUX", cat: "INFRA", desc: "Optimistic oracle solution providing sub-second price feeds for DeFi derivatives on L2 networks." },
  { name: "Aegis Lending", ticker: "AEGIS", cat: "DEFI", desc: "Undercollateralized lending protocol using on-chain reputation scores and zk-Identity verification." },
  { name: "Synthetix V3", ticker: "SNX3", cat: "DEFI", desc: "Next-gen derivatives liquidity layer. Trade commodities, forex, and equities with zero slippage." },
  { name: "GridLock", ticker: "GRID", cat: "INFRA", desc: "Cross-chain interoperability messaging protocol. Send tokens and data between any chain instantly." },
  { name: "Sentient Bots", ticker: "SENT", cat: "AI", desc: "Autonomous AI agents that execute complex DeFi strategies. Non-custodial and permissionless." },
  { name: "CloudKeep", ticker: "KEEP", cat: "DEPIN", desc: "Decentralized storage network. Store encrypted data fragments across thousands of nodes globally." },
  { name: "Vanguard Audit", ticker: "GUARD", cat: "SECURITY", desc: "AI-powered smart contract auditor. Automatically detects reentrancy and logic flaws before deployment." },
  { name: "PixelVerse", ticker: "PIXEL", cat: "GAMING", desc: "Web3 MMORPG with player-owned economy. Items are interoperable NFTs usable across partner games." },
  { name: "StreamFlow", ticker: "FLOW", cat: "INFRA", desc: "Token vesting and payroll streaming protocol. Automate payments for DAOs and contributors." },
  { name: "CarbonTrace", ticker: "TRACE", cat: "DEPIN", desc: "On-chain carbon credit verification. IoT sensors mint carbon credits automatically based on real-world data." },
  { name: "QuantVault", ticker: "QNT", cat: "DEFI", desc: "Delta-neutral yield farming aggregator. Automates hedging strategies to minimize impermanent loss." },
  { name: "CipherMail", ticker: "CIPHER", cat: "SECURITY", desc: "Wallet-to-wallet encrypted messaging service. Sign in with Ethereum, send messages like email." },
  { name: "NeuralNet", ticker: "NNET", cat: "AI", desc: "Collaborative machine learning model training. Contributors earn tokens for validating data sets." },
  { name: "BlockEstate", ticker: "ESTATE", cat: "DEFI", desc: "Fractionalized real estate investing. Buy shares of rental properties represented as RWA tokens." },
  { name: "HyperScale", ticker: "HYPE", cat: "INFRA", desc: "Layer-3 scaling solution specialized for high-frequency trading applications." },
  { name: "GameSwift", ticker: "SWIFT", cat: "GAMING", desc: "SDK for integrating crypto wallets into Unity and Unreal Engine games seamlessly." },
  { name: "TrustID", ticker: "TID", cat: "SECURITY", desc: "Self-sovereign identity protocol. Prove humanity without revealing personal data." }
];

const COLORS_LIST = ["#39b54a", "#8b5cf6", "#3b82f6", "#f59e0b", "#ec4899", "#6366f1", "#14b8a6", "#ef4444"];

export const generateMockProjects = (): LaunchpadProject[] => {
  return UTILITY_PROJECTS.map((proj, i) => {
    const isKing = i === 0;
    const mcap = isKing ? 58420 : Math.floor(Math.random() * 45000) + 5000;
    
    return {
      id: `proj-util-${i}`,
      name: proj.name,
      ticker: proj.ticker,
      description: proj.desc,
      rarity: i < 3 ? 'LEGENDARY' : i < 8 ? 'RARE' : 'COMMON',
      attributes: [proj.cat, "UTILITY", "V1.0"],
      codeSnippet: PREBUILT_REACT,
      contractSnippet: PREBUILT_CODE,
      marketCap: mcap,
      creator: `@dev_${proj.ticker.toLowerCase()}`,
      replies: Math.floor(Math.random() * 300) + 50,
      imageColor: COLORS_LIST[i % COLORS_LIST.length],
      timestamp: `${Math.floor(Math.random() * 23) + 1}h ago`,
      isDoxxed: Math.random() > 0.4 || isKing, // 60% chance doxxed, King always doxxed
      category: proj.cat as ProjectCategory,
      auditStatus: Math.random() > 0.6 ? 'PASSED' : Math.random() > 0.3 ? 'IN_PROGRESS' : 'NONE'
    };
  });
};

export const MOCK_PROJECTS = generateMockProjects();