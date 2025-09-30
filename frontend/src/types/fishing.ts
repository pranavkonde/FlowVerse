export interface Fish {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  size: {
    min: number;
    max: number;
  };
  weight: {
    min: number;
    max: number;
  };
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all';
  timeOfDay: 'any' | 'day' | 'night' | 'dawn' | 'dusk';
  habitat: 'river' | 'lake' | 'ocean' | 'pond';
  difficulty: number;
  value: number;
  experience: number;
  catchTime: {
    min: number;
    max: number;
  };
  requirements: {
    level: number;
    rod?: string;
    bait?: string;
  };
  specialEffects?: {
    type: string;
    value: number;
  }[];
}

export interface FishingSpot {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  habitat: Fish['habitat'];
  availableFish: string[];
  maxFishers: number;
  currentFishers: string[];
  respawnTime: number;
  lastRespawn: Date;
  isActive: boolean;
  requirements: {
    level: number;
    quest?: string;
    item?: string;
  };
}

export interface FishingSession {
  id: string;
  userId: string;
  spotId: string;
  fishId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'casting' | 'waiting' | 'minigame' | 'completed' | 'failed';
  progress: number;
  difficulty: number;
  rodId?: string;
  baitId?: string;
  catchTime?: number;
}

export interface FishingStats {
  totalCatches: number;
  rarityCount: Record<string, number>;
  biggestCatch: {
    fishId: string;
    size: number;
    weight: number;
    timestamp: Date;
  };
  favoriteSpot: {
    spotId: string;
    visits: number;
  };
  skillLevel: number;
  experience: number;
  achievements: string[];
}

export const RARITY_COLORS = {
  common: 'gray',
  uncommon: 'green',
  rare: 'blue',
  epic: 'purple',
  legendary: 'orange'
} as const;

export const HABITAT_ICONS = {
  river: '🌊',
  lake: '💧',
  ocean: '🌊',
  pond: '🎣'
} as const;

export const TIME_ICONS = {
  any: '⏰',
  day: '☀️',
  night: '🌙',
  dawn: '🌅',
  dusk: '🌇'
} as const;

export const SEASON_ICONS = {
  spring: '🌸',
  summer: '☀️',
  fall: '🍁',
  winter: '❄️',
  all: '🗓️'
} as const;
