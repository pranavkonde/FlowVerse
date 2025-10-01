export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeCategoryType;
  requirement: number;
  reward: ChallengeReward;
  expiresAt: string;
  isActive: boolean;
}

export type ChallengeCategoryType =
  | 'COMBAT'
  | 'CRAFTING'
  | 'GATHERING'
  | 'SOCIAL'
  | 'EXPLORATION'
  | 'PET_CARE'
  | 'FARMING'
  | 'FISHING'
  | 'MUSIC'
  | 'TRADING';

export interface ChallengeReward {
  type: RewardType;
  amount: number;
  itemId?: string;
}

export type RewardType =
  | 'CURRENCY'
  | 'EXPERIENCE'
  | 'ITEM'
  | 'PET_ITEM'
  | 'CRAFTING_MATERIAL'
  | 'SPECIAL_CURRENCY';

export interface ChallengeProgress {
  challengeId: string;
  currentProgress: number;
  isCompleted: boolean;
  completedAt?: string;
  claimed: boolean;
  claimedAt?: string;
}