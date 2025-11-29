
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
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IUniswapV2Router02 {
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;
    function WETH() external pure returns (address);
}

contract LimetredLaunch is ERC20, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

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
    error InvalidVestingIndex();
    error NothingToClaim();
    error NotTaskAssignee();
    error TaskAlreadyCompleted();
    error TaskAlreadyCancelled();
    error LimitTooLow(); // Anti-Honeypot
    error CannotRenounceWhileDisabled(); // Safety
    error BatchLengthMismatch(); // Gas efficient array check
    error BuybackDisabled();
    error InsufficientEthForBuyback();
    error InvalidBuybackPercentage();

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

    // --- Buyback System ---
    bool public buybackEnabled;
    uint256 public buybackPercentage;

    // --- Task / Bounty Logic ---
    struct Task {
        string description;
        uint256 dueDate;
        bool isCompleted;
        bool isCancelled;
        address assignee;
    }
    mapping(uint256 => Task) public tasks;
    uint256 public nextTaskId;

    event TaskCreated(uint256 indexed taskId, string description, uint256 dueDate, address indexed assignee);
    event TaskCompleted(uint256 indexed taskId, address indexed completer);
    event TaskCancelled(uint256 indexed taskId);
    event BuybackExecuted(uint256 amountEth, uint256 timestamp);

    // --- Vesting Logic (Scalable) ---
    struct VestingSchedule {
        uint256 startDate;
        uint256 cliffDate;
        uint256 endDate;
        uint256 amount;
        uint256 claimed;
        bool revoked;
    }
    // Mapping from beneficiary to list of schedules (One-to-Many)
    mapping(address => VestingSchedule[]) public vestingSchedules;
    
    event VestingCreated(address indexed recipient, uint256 amount, uint256 scheduleIndex);
    event VestedTokensClaimed(address indexed recipient, uint256 amount);
    event VestingRevoked(address indexed recipient, uint256 scheduleIndex);

    constructor() ERC20("LimetredGenerated", "LMT") Ownable(msg.sender) {
        marketingWallet = msg.sender;
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    receive() external payable {}

    // --- Overrides for Reentrancy Protection ---

    function transfer(address to, uint256 value) public override nonReentrant returns (bool) {
        return super.transfer(to, value);
    }

    function transferFrom(address from, address to, uint256 value) public override nonReentrant returns (bool) {
        return super.transferFrom(from, to, value);
    }

    // --- Admin Functions ---

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function enableTrading() external onlyOwner nonReentrant whenNotPaused {
        tradingActive = true;
    }

    function removeLimits() external onlyOwner {
        limitsInEffect = false;
    }

    function updateFees(uint256 _buyTax, uint256 _sellTax) external onlyOwner {
        if (_buyTax > 10 || _sellTax > 10) revert InvalidTax();
        buyTax = _buyTax;
        sellTax = _sellTax;
    }

    function updateLimits(uint256 _maxTx, uint256 _maxWallet) external onlyOwner {
        if (_maxTx < (TOTAL_SUPPLY * 5 / 1000) || _maxWallet < (TOTAL_SUPPLY * 5 / 1000)) revert LimitTooLow();
        maxTxAmount = _maxTx;
        maxWalletSize = _maxWallet;
    }

    function setMarketingWallet(address _marketingWallet) external onlyOwner {
        if (_marketingWallet == address(0)) revert InvalidWallet();
        marketingWallet = _marketingWallet;
    }

    function withdrawStuckEth() external onlyOwner nonReentrant {
        (bool success, ) = address(msg.sender).call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
    }

    function recoverForeignTokens(address _tokenAddr, address _to) external onlyOwner nonReentrant {
        if (_tokenAddr == address(this) && tradingActive) revert InvalidWallet(); 
        uint256 _amount = IERC20(_tokenAddr).balanceOf(address(this));
        IERC20(_tokenAddr).safeTransfer(_to, _amount);
    }

    // --- Buyback Logic ---

    function enableBuyback(uint256 _percentage) external onlyOwner {
        if (_percentage > 100) revert InvalidBuybackPercentage();
        buybackEnabled = true;
        buybackPercentage = _percentage;
    }

    function executeBuyback(address _router) external onlyOwner nonReentrant {
        if (!buybackEnabled) revert BuybackDisabled();
        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientEthForBuyback();

        uint256 buybackAmount = (balance * buybackPercentage) / 100;
        
        // Use provided router address for flexibility
        IUniswapV2Router02 buybackRouter = IUniswapV2Router02(_router);
        
        address[] memory path = new address[](2);
        path[0] = buybackRouter.WETH();
        path[1] = address(this);

        // Swap ETH for Tokens and burn them (send to dead)
        buybackRouter.swapExactETHForTokensSupportingFeeOnTransferTokens{value: buybackAmount}(
            0,
            path,
            address(0xdead),
            block.timestamp
        );
        
        emit BuybackExecuted(buybackAmount, block.timestamp);
    }

    // --- Vesting Management ---

    function createVestingSchedule(
        address _recipient, 
        uint256 _startDate, 
        uint256 _cliffDate, 
        uint256 _endDate, 
        uint256 _amount
    ) external onlyOwner nonReentrant {
        if (_recipient == address(0)) revert InvalidWallet();
        if (_endDate <= _startDate || _cliffDate < _startDate) revert InvalidVestingSchedule();
        if (_amount == 0) revert InvalidVestingSchedule();

        _transfer(msg.sender, address(this), _amount);

        vestingSchedules[_recipient].push(VestingSchedule({
            startDate: _startDate,
            cliffDate: _cliffDate,
            endDate: _endDate,
            amount: _amount,
            claimed: 0,
            revoked: false
        }));

        emit VestingCreated(_recipient, _amount, vestingSchedules[_recipient].length - 1);
    }

    function revokeVestingSchedule(address _recipient, uint256 _index) external onlyOwner nonReentrant {
        if (_index >= vestingSchedules[_recipient].length) revert InvalidVestingIndex();
        VestingSchedule storage schedule = vestingSchedules[_recipient][_index];
        if (schedule.revoked) revert InvalidVestingSchedule();

        uint256 vested = _computeReleasableAmount(schedule);
        uint256 unreleased = schedule.amount - schedule.claimed;
        uint256 refund = unreleased - vested;

        schedule.revoked = true;
        
        if (vested > 0) {
            schedule.claimed += vested;
            _transfer(address(this), _recipient, vested);
        }
        if (refund > 0) {
            _transfer(address(this), owner(), refund);
        }

        emit VestingRevoked(_recipient, _index);
    }

    // --- Task Management ---

    function createTask(string memory _description, uint256 _dueDate, address _assignee) external onlyOwner nonReentrant {
        if (_assignee == address(0)) revert InvalidWallet();
        uint256 taskId = nextTaskId++;
        tasks[taskId] = Task({
            description: _description,
            dueDate: _dueDate,
            isCompleted: false,
            isCancelled: false,
            assignee: _assignee
        });
        emit TaskCreated(taskId, _description, _dueDate, _assignee);
    }

    function cancelTask(uint256 taskId) external onlyOwner nonReentrant {
        Task storage t = tasks[taskId];
        if (t.isCompleted) revert TaskAlreadyCompleted();
        if (t.isCancelled) revert TaskAlreadyCancelled();
        t.isCancelled = true;
        emit TaskCancelled(taskId);
    }

    function batchCreateTasks(string[] memory _descriptions, uint256[] memory _dueDates, address[] memory _assignees) external onlyOwner nonReentrant {
        if (_descriptions.length != _dueDates.length || _descriptions.length != _assignees.length) revert BatchLengthMismatch();
        for(uint i = 0; i < _descriptions.length; i++) {
            if (_assignees[i] == address(0)) continue;
            uint256 taskId = nextTaskId++;
            tasks[taskId] = Task({
                description: _descriptions[i],
                dueDate: _dueDates[i],
                isCompleted: false,
                isCancelled: false,
                assignee: _assignees[i]
            });
            emit TaskCreated(taskId, _descriptions[i], _dueDates[i], _assignees[i]);
        }
    }

    // --- User Functions ---

    function completeTask(uint256 taskId) external nonReentrant {
        Task storage t = tasks[taskId];
        if (msg.sender != t.assignee) revert NotTaskAssignee();
        if (t.isCompleted) revert TaskAlreadyCompleted();
        if (t.isCancelled) revert TaskAlreadyCancelled();
        
        t.isCompleted = true;
        emit TaskCompleted(taskId, msg.sender);
    }

    function claimVesting(uint256 _index) external nonReentrant {
        if (_index >= vestingSchedules[msg.sender].length) revert InvalidVestingIndex();
        VestingSchedule storage schedule = vestingSchedules[msg.sender][_index];
        
        uint256 claimable = _computeReleasableAmount(schedule);
        if (claimable == 0) revert NothingToClaim();

        schedule.claimed += claimable;
        _transfer(address(this), msg.sender, claimable);

        emit VestedTokensClaimed(msg.sender, claimable);
    }

    // --- View Functions ---

    function calculatedTotalSupply() public view returns (uint256) {
        return totalSupply();
    }

    function getTaskDetails(uint256 taskId) public view returns (string memory description, uint256 dueDate, bool isCompleted, bool isCancelled, address assignee) {
        Task memory t = tasks[taskId];
        return (t.description, t.dueDate, t.isCompleted, t.isCancelled, t.assignee);
    }

    function getVestingSchedulesCount(address _beneficiary) external view returns(uint256){
        return vestingSchedules[_beneficiary].length;
    }

    function getVestingSchedule(address _beneficiary, uint256 _index) external view returns(VestingSchedule memory) {
        return vestingSchedules[_beneficiary][_index];
    }

    // --- Internal Logic ---

    function _computeReleasableAmount(VestingSchedule memory schedule) internal view returns (uint256) {
        if (schedule.revoked) return 0;
        if (block.timestamp < schedule.cliffDate) return 0;
        
        uint256 vested;
        if (block.timestamp >= schedule.endDate) {
            vested = schedule.amount;
        } else {
            uint256 duration = schedule.endDate - schedule.startDate;
            uint256 elapsed = block.timestamp - schedule.startDate;
            vested = (schedule.amount * elapsed) / duration;
        }
        return vested > schedule.claimed ? vested - schedule.claimed : 0;
    }

    function _update(address from, address to, uint256 value) internal override(ERC20) whenNotPaused {
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }

        if (limitsInEffect && from != owner() && to != owner()) {
            if (!tradingActive) revert TradingNotActive();
            if (value > maxTxAmount) revert MaxTxAmountExceeded();
            if (balanceOf(to) + value > maxWalletSize) revert MaxWalletExceeded();
        }

        uint256 taxAmount = 0;
        if (from != owner() && to != owner()) {
            taxAmount = (value * buyTax) / 100;
        }

        if (taxAmount > 0) {
            super._update(from, marketingWallet, taxAmount);
            super._update(from, to, value - taxAmount);
        } else {
            super._update(from, to, value);
        }
    }

    function transferOwnership(address newOwner) public override onlyOwner nonReentrant {
        if (newOwner == address(0)) {
             if (!tradingActive) revert CannotRenounceWhileDisabled();
        }
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
