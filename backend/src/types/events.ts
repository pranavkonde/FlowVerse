export interface Event {
  id: string;
  name: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  rewards: EventReward[];
  requirements: EventRequirement[];
  participants: string[];
  maxParticipants?: number;
  metadata: EventMetadata;
}

export interface EventReward {
  id: string;
  type: RewardType;
  amount: number;
  itemId?: string;
  tokenId?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

export interface EventRequirement {
  type: RequirementType;
  value: number;
  description: string;
}

export interface EventMetadata {
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  tags: string[];
  imageUrl?: string;
  backgroundMusic?: string;
  specialEffects?: string[];
}

export interface EventParticipation {
  userId: string;
  eventId: string;
  progress: number;
  completedObjectives: string[];
  rewardsClaimed: string[];
  joinedAt: Date;
  lastActivity: Date;
}

export interface EventLeaderboard {
  eventId: string;
  participants: EventParticipant[];
  lastUpdated: Date;
}

export interface EventParticipant {
  userId: string;
  username: string;
  score: number;
  rank: number;
  progress: number;
  rewardsClaimed: number;
  joinedAt: Date;
}

export interface EventObjective {
  id: string;
  eventId: string;
  title: string;
  description: string;
  type: ObjectiveType;
  target: number;
  current: number;
  reward: EventReward;
  isCompleted: boolean;
  isOptional: boolean;
}

export interface EventNotification {
  id: string;
  eventId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

export interface EventProgressUpdate {
  userId: string;
  eventId: string;
  objectiveId: string;
  progress: number;
  timestamp: Date;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  totalParticipants: number;
  totalRewardsDistributed: number;
  averageEventDuration: number;
  popularEventTypes: { type: EventType; count: number }[];
}

export type EventType = 
  | 'seasonal'
  | 'limited_time'
  | 'community'
  | 'competitive'
  | 'collaborative'
  | 'exploration'
  | 'puzzle'
  | 'social';

export type EventStatus = 
  | 'upcoming'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type RewardType = 
  | 'token'
  | 'nft'
  | 'experience'
  | 'achievement'
  | 'cosmetic'
  | 'currency';

export type RequirementType = 
  | 'level'
  | 'achievement'
  | 'item'
  | 'quest_completion'
  | 'guild_membership'
  | 'time_played';

export type ObjectiveType = 
  | 'collect'
  | 'defeat'
  | 'explore'
  | 'social'
  | 'time_based'
  | 'skill_based'
  | 'creative';

export type NotificationType = 
  | 'event_start'
  | 'event_end'
  | 'objective_complete'
  | 'reward_available'
  | 'leaderboard_update'
  | 'reminder';
