export interface TradingCard {
  id: string;
  name: string;
  description: string;
  rarity: CardRarity;
  type: CardType;
  attributes: CardAttributes;
  imageUrl: string;
  mintNumber: number;
  totalMinted: number;
  createdAt: string;
  ownerId: string;
}

export type CardRarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'MYTHIC';

export type CardType =
  | 'CHARACTER'
  | 'CREATURE'
  | 'LOCATION'
  | 'ARTIFACT'
  | 'SPELL'
  | 'EVENT';

export interface CardAttributes {
  power?: number;
  defense?: number;
  magic?: number;
  speed?: number;
  luck?: number;
  special?: string[];
}

export interface CardCollection {
  userId: string;
  cards: TradingCard[];
  stats: CollectionStats;
  achievements: string[];
}

export interface CollectionStats {
  totalCards: number;
  byRarity: Record<CardRarity, number>;
  byType: Record<CardType, number>;
  uniqueCards: number;
  completeSets: number;
}

export interface CardTrade {
  id: string;
  initiatorId: string;
  receiverId: string;
  offeredCards: string[];
  requestedCards: string[];
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export type TradeStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COMPLETED';