export enum AppPhase {
  HOME = 'HOME',
  LOADING = 'LOADING',
  PREVIEW = 'PREVIEW',
  DASHBOARD = 'DASHBOARD'
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
