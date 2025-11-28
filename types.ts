export enum AppPhase {
  HOME = 'HOME',
  LOADING = 'LOADING',
  PREVIEW = 'PREVIEW',
  DASHBOARD = 'DASHBOARD',
  LAUNCHPAD = 'LAUNCHPAD'
}

export type ChainId = 'SOL' | 'ETH' | 'BASE' | 'TON' | 'ARB';

export interface ChainConfig {
  id: ChainId;
  name: string;
  symbol: string;
  dex: string;
  color: string;
  icon?: string;
}

export interface GeneratedApp {
  name: string;
  description: string;
  codeSnippet: string;
  contractSnippet: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  attributes: string[];
  // Optional fields for Launchpad compatibility
  id?: string;
  ticker?: string;
  marketCap?: number;
  creator?: string;
  replies?: number;
  imageColor?: string;
  timestamp?: string;
}

export type ProjectCategory = 'AI' | 'DEFI' | 'DEPIN' | 'INFRA' | 'GAMING' | 'SECURITY';

export interface LaunchpadProject extends GeneratedApp {
  id: string;
  ticker: string;
  marketCap: number;
  creator: string;
  replies: number;
  imageColor: string;
  timestamp: string;
  isDoxxed: boolean;
  category: ProjectCategory;
  auditStatus: 'NONE' | 'IN_PROGRESS' | 'PASSED';
}

export interface TickerItem {
  user: string;
  app: string;
  gain: string;
}

export interface MarketData {
  time: number;
  price: number;
}

export interface Transaction {
  id: string;
  type: 'DEPLOY' | 'BUY_KEYS' | 'SELL_KEYS' | 'YIELD' | 'TRADE' | 'SWAP';
  amount: string;
  token?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: string;
}

export interface WalletBalance {
  native: number; 
  lmt: number;
  usdValue: number;
}