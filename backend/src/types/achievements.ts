export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  points: number;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  isHidden: boolean;
  isRepeatable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementRequirement {
  type: RequirementType;
  target: number;
  current: number;
  metadata?: Record<string, any>;
}

export interface AchievementReward {
  type: RewardType;
  amount: number;
  metadata?: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  isCompleted: boolean;
}

export enum AchievementCategory {
  SOCIAL = 'social',
  COMBAT = 'combat',
  EXPLORATION = 'exploration',
  CRAFTING = 'crafting',
  TRADING = 'trading',
  MINIGAMES = 'minigames',
  GUILD = 'guild',
  SPECIAL = 'special'
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export enum RequirementType {
  PLAY_TIME = 'play_time',
  DISTANCE_TRAVELED = 'distance_traveled',
  PLAYERS_MET = 'players_met',
  EMOTES_USED = 'emotes_used',
  VOICE_COMMANDS = 'voice_commands',
  ROOMS_VISITED = 'rooms_visited',
  GUILD_JOINED = 'guild_joined',
  TRADES_COMPLETED = 'trades_completed',
  MINIGAMES_PLAYED = 'minigames_played',
  CONSECUTIVE_DAYS = 'consecutive_days',
  TOKENS_EARNED = 'tokens_earned',
  NFT_COLLECTED = 'nft_collected'
}

export enum RewardType {
  TOKENS = 'tokens',
  XP = 'xp',
  TITLE = 'title',
  BADGE = 'badge',
  NFT = 'nft',
  CUSTOMIZATION = 'customization',
  SPECIAL_ACCESS = 'special_access'
}

export interface AchievementStats {
  totalAchievements: number;
  completedAchievements: number;
  totalPoints: number;
  earnedPoints: number;
  categories: Record<AchievementCategory, number>;
  rarity: Record<AchievementRarity, number>;
  recentAchievements: UserAchievement[];
}
