export interface AgentConfig {
  walletPrivateKey: string;
  rpcProviderUrl: string;
  coingeckoApiKey: string;
  openaiApiKey: string;
  port: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  price?: number;
}

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  userAddress: string;
  slippage?: number;
}

export interface SwapResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  estimatedOutput?: string;
}

export interface PriceRequest {
  tokenAddress: string;
  vsCurrency?: string;
}

export interface PriceResponse {
  success: boolean;
  price?: number;
  error?: string;
}

export interface TransferRequest {
  toAddress: string;
  amount: string;
  tokenAddress?: string; // If undefined, transfer native FLOW
  userAddress: string;
}

export interface TransferResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface VoiceCommand {
  command: string;
  userId: string;
  timestamp: Date;
}

export interface AIResponse {
  success: boolean;
  response: string;
  action?: {
    type: 'swap' | 'price' | 'transfer' | 'info';
    data: any;
  };
  error?: string;
}
