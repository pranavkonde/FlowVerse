export interface ReferralCode {
  id: string;
  code: string;
  ownerId: string;
  uses: number;
  maxUses: number;
  expiresAt?: Date;
  rewards: {
    referrer: ReferralReward;
    referee: ReferralReward;
  };
  metadata: {
    campaign?: string;
    source?: string;
    customMessage?: string;
  };
}

export interface ReferralReward {
  tokens: number;
  items: string[];
  experience: number;
  specialRewards?: {
    type: string;
    id: string;
    quantity: number;
  }[];
}

export interface ReferralUse {
  id: string;
  codeId: string;
  referrerId: string;
  refereeId: string;
  usedAt: Date;
  rewardsClaimed: {
    referrer: boolean;
    referee: boolean;
  };
  status: 'pending' | 'completed' | 'expired';
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalRewardsEarned: {
    tokens: number;
    items: Record<string, number>;
    experience: number;
  };
  referralStreak: number;
  lastReferralAt?: Date;
}

export const REWARD_TYPES = {
  tokens: { icon: '🪙', label: 'Tokens' },
  items: { icon: '📦', label: 'Items' },
  experience: { icon: '⭐', label: 'Experience' },
  title: { icon: '👑', label: 'Title' },
  emote: { icon: '😄', label: 'Emote' }
} as const;

export const STATUS_COLORS = {
  pending: 'yellow',
  completed: 'green',
  expired: 'red'
} as const;
