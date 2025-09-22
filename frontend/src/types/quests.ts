export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'event' | 'achievement' | 'social' | 'trading' | 'exploration';
  category: 'combat' | 'exploration' | 'social' | 'trading' | 'collection' | 'crafting' | 'puzzle' | 'survival';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  status: 'available' | 'active' | 'completed' | 'expired' | 'locked';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  objectives: QuestObjective[];
  timeLimit?: number; // in minutes
  levelRequirement: number;
  prerequisites: string[]; // quest IDs that must be completed first
  repeatable: boolean;
  cooldown?: number; // in hours
  createdAt: Date;
  expiresAt?: Date;
  completedAt?: Date;
  progress: number; // 0-100
}

export interface QuestRequirement {
  type: 'level' | 'item' | 'quest' | 'achievement' | 'stat' | 'location';
  value: string | number;
  description: string;
  isMet: boolean;
}

export interface QuestReward {
  type: 'experience' | 'coins' | 'items' | 'achievement' | 'unlock' | 'currency';
  value: string | number;
  amount: number;
  description: string;
  icon: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'kill' | 'collect' | 'visit' | 'talk' | 'craft' | 'trade' | 'explore' | 'survive' | 'complete';
  target: string | number;
  current: number;
  isCompleted: boolean;
  isOptional: boolean;
  rewards?: QuestReward[];
}

export interface QuestChain {
  id: string;
  name: string;
  description: string;
  quests: string[]; // quest IDs in order
  currentQuest: number;
  isCompleted: boolean;
  rewards: QuestReward[];
  theme: string;
  icon: string;
}

export interface QuestLog {
  activeQuests: Quest[];
  completedQuests: Quest[];
  availableQuests: Quest[];
  questChains: QuestChain[];
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  totalQuestsCompleted: number;
  totalExperienceEarned: number;
  favoriteQuestType: string;
  longestQuestChain: number;
}

export interface QuestNotification {
  id: string;
  type: 'quest_available' | 'quest_started' | 'objective_completed' | 'quest_completed' | 'quest_expired' | 'reward_claimed';
  questId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  rewards?: QuestReward[];
}

export interface QuestStats {
  totalQuests: number;
  completedQuests: number;
  completionRate: number;
  averageCompletionTime: number; // in minutes
  favoriteCategory: string;
  favoriteType: string;
  longestStreak: number;
  currentStreak: number;
  totalExperienceEarned: number;
  totalRewardsEarned: number;
  questMasterLevel: number;
}

export interface QuestFilters {
  type?: string;
  category?: string;
  difficulty?: string;
  status?: string;
  levelRange?: {
    min: number;
    max: number;
  };
  timeRemaining?: 'all' | 'urgent' | 'soon' | 'plenty';
  rewards?: string[];
  searchQuery?: string;
}
