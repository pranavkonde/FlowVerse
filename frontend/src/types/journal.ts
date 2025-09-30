export interface JournalEntry {
  id: string;
  userId: string;
  type: 'achievement' | 'quest' | 'milestone' | 'discovery' | 'note' | 'combat' | 'crafting' | 'trading';
  title: string;
  description: string;
  timestamp: Date;
  category: string;
  tags: string[];
  metadata: {
    progress?: number;
    location?: string;
    participants?: string[];
    rewards?: {
      type: string;
      amount: number;
    }[];
    screenshots?: string[];
    linkedEntries?: string[];
    customFields?: Record<string, any>;
  };
  isHidden: boolean;
  isPinned: boolean;
}

export interface JournalCollection {
  id: string;
  userId: string;
  name: string;
  description: string;
  entries: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalStats {
  totalEntries: number;
  entriesByType: Record<string, number>;
  entriesByCategory: Record<string, number>;
  mostUsedTags: { tag: string; count: number }[];
  lastEntryDate?: Date;
  streakDays: number;
}

export const ENTRY_TYPE_ICONS = {
  achievement: '🏆',
  quest: '📜',
  milestone: '🎯',
  discovery: '🔍',
  note: '📝',
  combat: '⚔️',
  crafting: '⚒️',
  trading: '💰'
} as const;

export const ENTRY_TYPE_COLORS = {
  achievement: 'yellow',
  quest: 'blue',
  milestone: 'green',
  discovery: 'purple',
  note: 'gray',
  combat: 'red',
  crafting: 'orange',
  trading: 'teal'
} as const;

export const DEFAULT_CATEGORIES = [
  'General',
  'Adventures',
  'Achievements',
  'Combat',
  'Crafting',
  'Trading',
  'Social',
  'Exploration'
] as const;

export const REWARD_TYPE_ICONS = {
  tokens: '🪙',
  experience: '⭐',
  item: '📦',
  title: '👑',
  skill: '📚',
  reputation: '👥'
} as const;
