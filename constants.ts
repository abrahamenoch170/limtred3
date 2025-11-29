
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
import "@openzeppelin/contracts/utils/Pausable.sol";

contract LimetredLaunch is ERC20, Ownable, ReentrancyGuard, Pausable {
    // --- Custom Errors (Gas Optimization) ---
    error TradingNotActive();
    error MaxTxAmountExceeded();
    error MaxWalletExceeded();
    error InvalidTax();
    error CannotRemoveLimits();

    // --- Tokenomics ---
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // --- Anti-Whale & Limits ---
    uint256 public maxTxAmount = 20_000_000 * 10**18; // 2%
    uint256 public maxWalletSize = 20_000_000 * 10**18; // 2%
    bool public limitsInEffect = true;
    bool public tradingActive = false;

    // --- Fee System ---
    uint256 public buyTax = 5; // 5%
    uint256 public sellTax = 5; // 5%
    address public marketingWallet;

    // --- Task / Bounty Logic ---
    struct Task {
        string description;
        uint256 dueDate;
        bool isCompleted;
        address assignee;
    }
    mapping(uint256 => Task) public tasks;
    uint256 public nextTaskId;

    event TaskCreated(uint256 indexed taskId, string description, uint256 dueDate);
    event TaskCompleted(uint256 indexed taskId, address indexed completer);

    constructor() ERC20("LimetredGenerated", "LMT") Ownable(msg.sender) {
        marketingWallet = msg.sender;
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    // --- Admin Functions ---

    /**
     * @dev Triggers stopped state.
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Returns to normal state.
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Enables trading. Callable only by owner.
     * Sets tradingActive to true.
     * Protected by whenNotPaused modifier.
     */
    function enableTrading() external onlyOwner nonReentrant whenNotPaused {
        tradingActive = true;
    }

    /**
     * @dev Removes max transaction and wallet limits. Irreversible.
     */
    function removeLimits() external onlyOwner {
        limitsInEffect = false;
    }

    /**
     * @dev Updates tax fees (Max 10% to prevent honeypots).
     */
    function updateFees(uint256 _buyTax, uint256 _sellTax) external onlyOwner {
        if (_buyTax > 10 || _sellTax > 10) revert InvalidTax();
        buyTax = _buyTax;
        sellTax = _sellTax;
    }

    /**
     * @dev Updates the marketing wallet address.
     */
    function setMarketingWallet(address _marketingWallet) external onlyOwner {
        require(_marketingWallet != address(0), "Wallet cannot be zero");
        marketingWallet = _marketingWallet;
    }

    /**
     * @dev Emergency withdraw of stuck ETH.
     */
    function withdrawStuckEth() external onlyOwner {
        (bool success, ) = address(msg.sender).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    // --- View Functions ---

    /**
     * @dev Returns the total supply calculated from mints and burns.
     * Required for dashboard tracking.
     */
    function calculatedTotalSupply() public view returns (uint256) {
        return totalSupply();
    }

    /**
     * @dev Returns the description, due date, and status of a specific task.
     */
    function getTaskDetails(uint256 taskId) public view returns (string memory description, uint256 dueDate, bool isCompleted) {
        Task memory t = tasks[taskId];
        return (t.description, t.dueDate, t.isCompleted);
    }

    // --- Internal Logic ---

    function _update(address from, address to, uint256 value) internal override(ERC20) whenNotPaused {
        // 1. Skip logic for Minting/Burning
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }

        // 2. Check Limits (if enabled and not owner)
        if (limitsInEffect && from != owner() && to != owner()) {
            if (!tradingActive) revert TradingNotActive();
            if (value > maxTxAmount) revert MaxTxAmountExceeded();
            if (balanceOf(to) + value > maxWalletSize) revert MaxWalletExceeded();
        }

        // 3. Tax Logic (Simplified: Flat tax on all transfers except owner)
        uint256 taxAmount = 0;
        if (from != owner() && to != owner()) {
            // Apply tax (Buy or Sell - simplified as flat rate for template)
            taxAmount = (value * buyTax) / 100;
        }

        if (taxAmount > 0) {
            super._update(from, marketingWallet, taxAmount);
            super._update(from, to, value - taxAmount);
        } else {
            super._update(from, to, value);
        }
    }

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
