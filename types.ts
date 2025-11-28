export enum AppPhase {
  HOME = 'HOME',
  LOADING = 'LOADING',
  PREVIEW = 'PREVIEW',
  DASHBOARD = 'DASHBOARD'
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
  native: number; // Replaces 'sol' for multi-chain support
  lmt: number;
  usdValue: number;
}