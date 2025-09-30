export interface TradingCard {
  id: string;
  playerId: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  type: 'character' | 'achievement' | 'special' | 'event';
  stats: {
    level: number;
    experience: number;
    achievements: number;
    combatRating?: number;
    craftingLevel?: number;
    specialAbility?: string;
  };
  metadata: {
    imageUrl: string;
    description: string;
    issueDate: Date;
    serialNumber: string;
    edition: string;
  };
  tradeable: boolean;
  mintCondition: number;
}

export interface CardCollection {
  userId: string;
  cards: TradingCard[];
  stats: {
    totalCards: number;
    uniqueCards: number;
    rarityCount: Record<string, number>;
  };
}

export const RARITY_COLORS = {
  common: 'gray',
  uncommon: 'green',
  rare: 'blue',
  epic: 'purple',
  legendary: 'orange'
} as const;

export const CARD_TYPES = {
  character: 'Character',
  achievement: 'Achievement',
  special: 'Special',
  event: 'Event'
} as const;
