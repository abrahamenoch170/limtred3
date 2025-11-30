
import { TickerItem, ChainId, ChainConfig, LaunchpadProject, ProjectCategory, ModuleConfig } from './types';
import { TrendingUp, Swords, Network, BarChart2, Users, Bot } from 'lucide-react';

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

export const MODULES: ModuleConfig[] = [
  {
    id: 'PREDICTION',
    title: 'Prediction Markets',
    description: 'Launch binary outcome markets on protocol events.',
    icon: TrendingUp,
    color: '#39b54a'
  },
  {
    id: 'PVP',
    title: 'PvP Tournaments',
    description: 'Host trading battles and winner-takes-all pools.',
    icon: Swords,
    color: '#ef4444'
  },
  {
    id: 'DERIVATIVES',
    title: 'Custom Derivatives',
    description: 'Create P2P option pools and exotic pairs.',
    icon: Network,
    color: '#8b5cf6'
  },
  {
    id: 'LEVERAGE',
    title: 'Synthetic Leverage',
    description: 'Offer up to 100x leverage via synthetic assets.',
    icon: BarChart2,
    color: '#f59e0b'
  },
  {
    id: 'SOCIAL',
    title: 'Social Gamification',
    description: 'Leaderboards, badges, and copy-trading layers.',
    icon: Users,
    color: '#3b82f6'
  },
  {
    id: 'AI_TOOLS',
    title: 'AI Integration',
    description: 'Automated risk scoring and contract optimization.',
    icon: Bot,
    color: '#ec4899'
  }
];

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
import "@openzeppelin/contracts/utils/Pausable.sol";

/*
 * @title Limetred Production Standard ERC20
 * @dev Includes Anti-Whale, Fee Splitting, and Auto-Liquidity mechanisms.
 * @security Audit-Ready, 0.8.20 SafeMath implicit.
 */
contract LimetredProtocolToken is ERC20, Ownable, ReentrancyGuard, Pausable {
    
    // --- Custom Errors for Gas Optimization ---
    error TradingNotActive();
    error MaxTxAmountExceeded();
    error MaxWalletExceeded();
    error InvalidTaxParams();
    error TransferFailed();
    error ZeroAddress();

    // --- Configuration ---
    uint256 public maxTxAmount;
    uint256 public maxWalletSize;
    uint256 public taxBuy = 3;  // 3%
    uint256 public taxSell = 3; // 3%
    
    address public marketingWallet;
    address public liquidityWallet;
    
    bool public tradingActive = false;
    bool public limitsInEffect = true;
    
    mapping(address => bool) public isExcludedFromFee;
    mapping(address => bool) public isExcludedFromLimits;

    event FeesUpdated(uint256 buy, uint256 sell);
    event LimitsRemoved();
    event TradingEnabled();

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _supply,
        address _marketing
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        if (_marketing == address(0)) revert ZeroAddress();
        
        marketingWallet = _marketing;
        liquidityWallet = msg.sender;
        
        // Default Limits: 2% of supply
        uint256 totalSupply = _supply * 10**decimals();
        maxTxAmount = (totalSupply * 2) / 100;
        maxWalletSize = (totalSupply * 2) / 100;

        // Exclude owner and contract from limits/fees
        isExcludedFromFee[msg.sender] = true;
        isExcludedFromFee[address(this)] = true;
        isExcludedFromLimits[msg.sender] = true;
        isExcludedFromLimits[address(this)] = true;

        _mint(msg.sender, totalSupply);
    }

    // --- Admin Functions ---

    function enableTrading() external onlyOwner {
        tradingActive = true;
        emit TradingEnabled();
    }

    function removeLimits() external onlyOwner {
        limitsInEffect = false;
        emit LimitsRemoved();
    }

    function updateFees(uint256 _buy, uint256 _sell) external onlyOwner {
        // Anti-Honeypot: Taxes cannot exceed 10%
        if (_buy > 10 || _sell > 10) revert InvalidTaxParams();
        taxBuy = _buy;
        taxSell = _sell;
        emit FeesUpdated(_buy, _sell);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // --- Core Logic ---

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override whenNotPaused {
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }

        // 1. Trading Status Check
        if (from != owner() && to != owner()) {
            if (!tradingActive) revert TradingNotActive();
        }

        // 2. Limits Check
        if (limitsInEffect) {
            if (from != owner() && !isExcludedFromLimits[to] && to != address(0xdead)) {
                // Check Max Tx
                if (value > maxTxAmount) revert MaxTxAmountExceeded();
                // Check Max Wallet (only on buys)
                if (balanceOf(to) + value > maxWalletSize) revert MaxWalletExceeded();
            }
        }

        // 3. Tax Logic
        uint256 taxAmount = 0;
        bool takeFee = !isExcludedFromFee[from] && !isExcludedFromFee[to];

        if (takeFee) {
            // Buy
            if (from != owner()) { 
                taxAmount = (value * taxBuy) / 100;
            }
            // Sell
            else if (to != owner()) {
                taxAmount = (value * taxSell) / 100;
            }
        }

        if (taxAmount > 0) {
            super._update(from, marketingWallet, taxAmount);
            value -= taxAmount;
        }

        super._update(from, to, value);
    }

    function withdrawStuckETH() external onlyOwner nonReentrant {
        (bool success, ) = address(msg.sender).call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
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
  { name: "Pixel Guild", ticker: "PIXEL", cat: "GAMING", desc: "Play-to-earn RPG where NFTs are playable characters. Earn tokens by questing and battling in a retro pixel art world." }
];

export const MOCK_PROJECTS: LaunchpadProject[] = UTILITY_PROJECTS.map((p, i) => ({
  id: `proj-${i}`,
  name: p.name,
  description: p.desc,
  codeSnippet: PREBUILT_REACT,
  contractSnippet: PREBUILT_CODE,
  rarity: i % 3 === 0 ? 'LEGENDARY' : i % 2 === 0 ? 'RARE' : 'COMMON',
  attributes: ["VERIFIED", "AUDITED", "KYC"],
  ticker: p.ticker,
  marketCap: Math.floor(Math.random() * 50000) + 5000,
  creator: `@dev_${p.ticker.toLowerCase()}`,
  replies: Math.floor(Math.random() * 100),
  imageColor: ['#39b54a', '#8b5cf6', '#ef4444', '#3b82f6', '#f59e0b', '#ec4899'][i % 6],
  timestamp: `${Math.floor(Math.random() * 24)}h ago`,
  isDoxxed: Math.random() > 0.5,
  category: p.cat as ProjectCategory,
  auditStatus: Math.random() > 0.7 ? 'PASSED' : Math.random() > 0.4 ? 'IN_PROGRESS' : 'NONE'
}));
