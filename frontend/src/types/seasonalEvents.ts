export interface Season {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  theme: string;
  events: SeasonalEvent[];
  rewards: SeasonalReward[];
  status: 'upcoming' | 'active' | 'completed';
  metadata: {
    bannerUrl: string;
    themeColors: string[];
    specialEffects: string[];
    backgroundMusic?: string;
  };
}

export interface SeasonalEvent {
  id: string;
  seasonId: string;
  name: string;
  description: string;
  type: 'quest' | 'challenge' | 'tournament' | 'festival' | 'special';
  startDate: Date;
  endDate: Date;
  requirements: {
    minLevel?: number;
    items?: string[];
    achievements?: string[];
  };
  rewards: SeasonalReward[];
  objectives: {
    type: string;
    target: number;
    current: number;
    completed: boolean;
  }[];
  participants: string[];
  status: 'upcoming' | 'active' | 'completed';
  metadata: {
    location: string;
    difficulty: 'easy' | 'medium' | 'hard';
    maxParticipants?: number;
    teamEvent: boolean;
  };
}

export interface SeasonalReward {
  id: string;
  name: string;
  description: string;
  type: 'item' | 'currency' | 'cosmetic' | 'title' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  metadata: {
    imageUrl: string;
    previewUrl?: string;
    effects?: string[];
  };
}

export const THEME_COLORS = {
  spring: ['#90EE90', '#98FB98', '#00FF7F'],
  summer: ['#FFD700', '#FFA500', '#FF8C00'],
  fall: ['#D2691E', '#CD853F', '#DEB887'],
  winter: ['#87CEEB', '#B0E0E6', '#F0F8FF']
} as const;

export const DIFFICULTY_COLORS = {
  easy: 'green',
  medium: 'yellow',
  hard: 'red'
} as const;

export const EVENT_TYPE_LABELS = {
  quest: 'Quest',
  challenge: 'Challenge',
  tournament: 'Tournament',
  festival: 'Festival',
  special: 'Special Event'
} as const;
