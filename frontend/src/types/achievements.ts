export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'social' | 'blockchain' | 'exploration' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: AchievementRequirement[];
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

export interface AchievementRequirement {
  type: 'distance' | 'time' | 'interactions' | 'trades' | 'wins' | 'friends' | 'exploration';
  value: number;
  current: number;
}

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  achievements: Achievement[];
}

export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    id: 'gameplay',
    name: 'Gameplay',
    description: 'Master the game mechanics',
    icon: '🎮',
    color: 'blue',
    achievements: []
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Connect with other players',
    icon: '👥',
    color: 'green',
    achievements: []
  },
  {
    id: 'blockchain',
    name: 'Blockchain',
    description: 'Explore DeFi features',
    icon: '⛓️',
    color: 'purple',
    achievements: []
  },
  {
    id: 'exploration',
    name: 'Exploration',
    description: 'Discover the world',
    icon: '🗺️',
    color: 'yellow',
    achievements: []
  },
  {
    id: 'special',
    name: 'Special',
    description: 'Unique achievements',
    icon: '⭐',
    color: 'gold',
    achievements: []
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  // Gameplay Achievements
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Take your first steps in Free Flow',
    icon: '👣',
    category: 'gameplay',
    rarity: 'common',
    points: 10,
    requirements: [{ type: 'distance', value: 100, current: 0 }],
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Walk 1000 steps in the game',
    icon: '🚶',
    category: 'gameplay',
    rarity: 'common',
    points: 25,
    requirements: [{ type: 'distance', value: 1000, current: 0 }],
    progress: 0,
    maxProgress: 1000
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Walk 10000 steps in a single session',
    icon: '🏃',
    category: 'gameplay',
    rarity: 'rare',
    points: 100,
    requirements: [{ type: 'distance', value: 10000, current: 0 }],
    progress: 0,
    maxProgress: 10000
  },
  {
    id: 'emote_master',
    name: 'Emote Master',
    description: 'Use 50 different emotes',
    icon: '😄',
    category: 'gameplay',
    rarity: 'common',
    points: 30,
    requirements: [{ type: 'interactions', value: 50, current: 0 }],
    progress: 0,
    maxProgress: 50
  },

  // Social Achievements
  {
    id: 'first_friend',
    name: 'First Friend',
    description: 'Make your first friend',
    icon: '🤝',
    category: 'social',
    rarity: 'common',
    points: 20,
    requirements: [{ type: 'friends', value: 1, current: 0 }],
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Make 10 friends',
    icon: '🦋',
    category: 'social',
    rarity: 'rare',
    points: 75,
    requirements: [{ type: 'friends', value: 10, current: 0 }],
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'chatty_cathy',
    name: 'Chatty Cathy',
    description: 'Send 100 messages',
    icon: '💬',
    category: 'social',
    rarity: 'common',
    points: 40,
    requirements: [{ type: 'interactions', value: 100, current: 0 }],
    progress: 0,
    maxProgress: 100
  },

  // Blockchain Achievements
  {
    id: 'first_trade',
    name: 'First Trade',
    description: 'Complete your first token swap',
    icon: '🔄',
    category: 'blockchain',
    rarity: 'common',
    points: 50,
    requirements: [{ type: 'trades', value: 1, current: 0 }],
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'degen_trader',
    name: 'Degen Trader',
    description: 'Complete 100 token swaps',
    icon: '📈',
    category: 'blockchain',
    rarity: 'epic',
    points: 200,
    requirements: [{ type: 'trades', value: 100, current: 0 }],
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'whale',
    name: 'Whale',
    description: 'Trade over $1000 worth of tokens',
    icon: '🐋',
    category: 'blockchain',
    rarity: 'legendary',
    points: 500,
    requirements: [{ type: 'trades', value: 1000, current: 0 }],
    progress: 0,
    maxProgress: 1000
  },

  // Exploration Achievements
  {
    id: 'room_hopper',
    name: 'Room Hopper',
    description: 'Visit 5 different rooms',
    icon: '🚪',
    category: 'exploration',
    rarity: 'common',
    points: 30,
    requirements: [{ type: 'exploration', value: 5, current: 0 }],
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'world_traveler',
    name: 'World Traveler',
    description: 'Visit 25 different rooms',
    icon: '🌍',
    category: 'exploration',
    rarity: 'rare',
    points: 100,
    requirements: [{ type: 'exploration', value: 25, current: 0 }],
    progress: 0,
    maxProgress: 25
  },

  // Special Achievements
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join Free Flow in the first week',
    icon: '🚀',
    category: 'special',
    rarity: 'legendary',
    points: 1000,
    requirements: [{ type: 'time', value: 1, current: 0 }],
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'voice_commander',
    name: 'Voice Commander',
    description: 'Use voice commands 50 times',
    icon: '🎤',
    category: 'special',
    rarity: 'rare',
    points: 75,
    requirements: [{ type: 'interactions', value: 50, current: 0 }],
    progress: 0,
    maxProgress: 50
  }
];
