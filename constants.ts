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
    error InvalidWallet();
    error TransferFailed();
    error InvalidOwner();
    error InvalidVestingSchedule();
    error NothingToClaim();
    error NotTaskAssignee();
    error TaskAlreadyCompleted();

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

    // --- Vesting Logic ---
    struct VestingSchedule {
        address recipient;
        uint256 startDate;
        uint256 cliffDate;
        uint256 endDate;
        uint256 amount;
        uint256 claimed;
    }
    mapping(address => VestingSchedule) public vestingSchedules;
    event VestingCreated(address indexed recipient, uint256 amount);
    event VestedTokensClaimed(address indexed recipient, uint256 amount);

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
     * Protected by whenNotPaused and nonReentrant modifiers.
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
        if (_marketingWallet == address(0)) revert InvalidWallet();
        marketingWallet = _marketingWallet;
    }

    /**
     * @dev Emergency withdraw of stuck ETH.
     * Protected against reentrancy.
     */
    function withdrawStuckEth() external onlyOwner nonReentrant {
        (bool success, ) = address(msg.sender).call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @dev Create a vesting schedule for a recipient. 
     * Transfers tokens from Owner to Contract to lock them.
     */
    function createVestingSchedule(
        address _recipient, 
        uint256 _startDate, 
        uint256 _cliffDate, 
        uint256 _endDate, 
        uint256 _amount
    ) external onlyOwner {
        if (_recipient == address(0)) revert InvalidWallet();
        if (_endDate <= _startDate || _cliffDate < _startDate) revert InvalidVestingSchedule();
        if (_amount == 0) revert InvalidVestingSchedule();

        // Lock tokens by transferring from owner to this contract
        _transfer(msg.sender, address(this), _amount);

        vestingSchedules[_recipient] = VestingSchedule({
            recipient: _recipient,
            startDate: _startDate,
            cliffDate: _cliffDate,
            endDate: _endDate,
            amount: _amount,
            claimed: 0
        });

        emit VestingCreated(_recipient, _amount);
    }

    /**
     * @dev Create a new task.
     */
    function createTask(string memory _description, uint256 _dueDate, address _assignee) external onlyOwner {
        if (_assignee == address(0)) revert InvalidWallet();
        uint256 taskId = nextTaskId++;
        tasks[taskId] = Task({
            description: _description,
            dueDate: _dueDate,
            isCompleted: false,
            assignee: _assignee
        });
        emit TaskCreated(taskId, _description, _dueDate);
    }

    // --- User Functions ---

    /**
     * @dev Mark a task as completed. Only callable by the assignee.
     */
    function completeTask(uint256 taskId) external {
        Task storage t = tasks[taskId];
        if (msg.sender != t.assignee) revert NotTaskAssignee();
        if (t.isCompleted) revert TaskAlreadyCompleted();
        
        t.isCompleted = true;
        emit TaskCompleted(taskId, msg.sender);
    }

    /**
     * @dev Claim available vested tokens.
     */
    function claimVestedTokens() external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        if (schedule.amount == 0) revert InvalidVestingSchedule();

        uint256 vested = 0;
        if (block.timestamp >= schedule.endDate) {
            vested = schedule.amount;
        } else if (block.timestamp >= schedule.cliffDate) {
            uint256 duration = schedule.endDate - schedule.startDate;
            uint256 elapsed = block.timestamp - schedule.startDate;
            vested = (schedule.amount * elapsed) / duration;
        }

        uint256 claimable = vested - schedule.claimed;
        if (claimable == 0) revert NothingToClaim();

        schedule.claimed += claimable;
        _transfer(address(this), msg.sender, claimable);

        emit VestedTokensClaimed(msg.sender, claimable);
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
    function getTaskDetails(uint256 taskId) public view returns (string memory description, uint256 dueDate, bool isCompleted, address assignee) {
        Task memory t = tasks[taskId];
        return (t.description, t.dueDate, t.isCompleted, t.assignee);
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
        if (newOwner == address(0)) revert InvalidOwner();
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