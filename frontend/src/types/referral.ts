export interface ReferralCode {
  id: string;
  code: string;
  ownerId: string;
  createdAt: string;
  expiresAt?: string;
  maxUses?: number;
  currentUses: number;
  rewards: ReferralReward[];
  status: ReferralStatus;
}

export interface ReferralReward {
  type: RewardType;
  amount: number;
  itemId?: string;
  description: string;
}

export type RewardType =
  | 'CURRENCY'
  | 'PREMIUM_CURRENCY'
  | 'EXPERIENCE'
  | 'ITEM'
  | 'TRADING_CARD'
  | 'PREMIUM_TIME'
  | 'SPECIAL_TITLE';

export type ReferralStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'DEPLETED'
  | 'DISABLED';

export interface ReferralUse {
  id: string;
  referralId: string;
  referrerId: string;
  referredId: string;
  usedAt: string;
  rewardsClaimed: boolean;
  claimedAt?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalRewardsEarned: {
    type: RewardType;
    amount: number;
  }[];
  referralChain: number;
  specialAchievements: string[];
}

export interface ReferralProgram {
  tiers: ReferralTier[];
  currentTier: number;
  nextTierProgress: number;
  totalReferrals: number;
  availableRewards: ReferralReward[];
}

export interface ReferralTier {
  level: number;
  name: string;
  requiredReferrals: number;
  rewards: ReferralReward[];
  specialPerks: string[];
}