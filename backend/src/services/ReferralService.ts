import { EventEmitter } from 'events';
import { DailyRewardService } from './DailyRewardService';
import { SocialService } from './SocialService';
import { LeaderboardService } from './LeaderboardService';

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

export class ReferralService extends EventEmitter {
  private static instance: ReferralService;
  private referralCodes: Map<string, ReferralCode> = new Map();
  private referralUses: Map<string, ReferralUse> = new Map();
  private userStats: Map<string, ReferralStats> = new Map();
  private codesByOwner: Map<string, Set<string>> = new Map();

  private constructor(
    private dailyRewardService: DailyRewardService,
    private socialService: SocialService,
    private leaderboardService: LeaderboardService
  ) {
    super();
  }

  static getInstance(
    dailyRewardService: DailyRewardService,
    socialService: SocialService,
    leaderboardService: LeaderboardService
  ): ReferralService {
    if (!ReferralService.instance) {
      ReferralService.instance = new ReferralService(
        dailyRewardService,
        socialService,
        leaderboardService
      );
    }
    return ReferralService.instance;
  }

  async createReferralCode(
    ownerId: string,
    options: {
      maxUses?: number;
      expiresIn?: number;
      campaign?: string;
      customMessage?: string;
    } = {}
  ): Promise<ReferralCode> {
    const code: ReferralCode = {
      id: crypto.randomUUID(),
      code: this.generateUniqueCode(),
      ownerId,
      uses: 0,
      maxUses: options.maxUses || 10,
      expiresAt: options.expiresIn ? new Date(Date.now() + options.expiresIn) : undefined,
      rewards: {
        referrer: {
          tokens: 100,
          items: ['referral_chest', 'friend_token'],
          experience: 200,
          specialRewards: [
            { type: 'title', id: 'recruiter', quantity: 1 },
            { type: 'emote', id: 'friendship', quantity: 1 }
          ]
        },
        referee: {
          tokens: 150,
          items: ['welcome_chest', 'starter_pack'],
          experience: 300,
          specialRewards: [
            { type: 'title', id: 'newcomer', quantity: 1 },
            { type: 'emote', id: 'wave', quantity: 1 }
          ]
        }
      },
      metadata: {
        campaign: options.campaign,
        customMessage: options.customMessage
      }
    };

    this.referralCodes.set(code.id, code);
    
    const ownerCodes = this.codesByOwner.get(ownerId) || new Set();
    ownerCodes.add(code.id);
    this.codesByOwner.set(ownerId, ownerCodes);

    this.emit('referralCodeCreated', code);
    return code;
  }

  async useReferralCode(code: string, refereeId: string): Promise<ReferralUse> {
    const referralCode = Array.from(this.referralCodes.values()).find(rc => rc.code === code);
    if (!referralCode) {
      throw new Error('Invalid referral code');
    }

    if (referralCode.ownerId === refereeId) {
      throw new Error('Cannot use own referral code');
    }

    if (referralCode.uses >= referralCode.maxUses) {
      throw new Error('Referral code has reached maximum uses');
    }

    if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
      throw new Error('Referral code has expired');
    }

    // Check if user has already used a referral code
    const existingUse = Array.from(this.referralUses.values()).find(
      use => use.refereeId === refereeId
    );
    if (existingUse) {
      throw new Error('User has already used a referral code');
    }

    const use: ReferralUse = {
      id: crypto.randomUUID(),
      codeId: referralCode.id,
      referrerId: referralCode.ownerId,
      refereeId,
      usedAt: new Date(),
      rewardsClaimed: {
        referrer: false,
        referee: false
      },
      status: 'pending'
    };

    referralCode.uses++;
    this.referralCodes.set(referralCode.id, referralCode);
    this.referralUses.set(use.id, use);

    this.updateStats(referralCode.ownerId, 'referral');
    this.emit('referralCodeUsed', { use, code: referralCode });

    return use;
  }

  async claimReferralRewards(useId: string, claimerType: 'referrer' | 'referee'): Promise<boolean> {
    const use = this.referralUses.get(useId);
    if (!use || use.status !== 'pending') {
      return false;
    }

    const code = this.referralCodes.get(use.codeId);
    if (!code) {
      return false;
    }

    const userId = claimerType === 'referrer' ? use.referrerId : use.refereeId;
    const rewards = claimerType === 'referrer' ? code.rewards.referrer : code.rewards.referee;

    if (use.rewardsClaimed[claimerType]) {
      return false;
    }

    // Grant rewards
    // This would integrate with your inventory and progression systems
    this.updateStats(userId, 'reward', rewards);

    use.rewardsClaimed[claimerType] = true;
    if (use.rewardsClaimed.referrer && use.rewardsClaimed.referee) {
      use.status = 'completed';
    }

    this.referralUses.set(use.id, use);
    this.emit('referralRewardsClaimed', { use, claimerType, rewards });

    return true;
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    do {
      code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (Array.from(this.referralCodes.values()).some(rc => rc.code === code));
    return code;
  }

  private updateStats(userId: string, type: 'referral' | 'reward', rewards?: ReferralReward) {
    let stats = this.userStats.get(userId);
    if (!stats) {
      stats = {
        totalReferrals: 0,
        activeReferrals: 0,
        totalRewardsEarned: {
          tokens: 0,
          items: {},
          experience: 0
        },
        referralStreak: 0
      };
    }

    if (type === 'referral') {
      stats.totalReferrals++;
      stats.activeReferrals++;
      
      const now = new Date();
      if (stats.lastReferralAt) {
        const daysSinceLastReferral = Math.floor(
          (now.getTime() - stats.lastReferralAt.getTime()) / (24 * 60 * 60 * 1000)
        );
        if (daysSinceLastReferral <= 1) {
          stats.referralStreak++;
        } else {
          stats.referralStreak = 1;
        }
      } else {
        stats.referralStreak = 1;
      }
      stats.lastReferralAt = now;
    }

    if (type === 'reward' && rewards) {
      stats.totalRewardsEarned.tokens += rewards.tokens;
      stats.totalRewardsEarned.experience += rewards.experience;
      
      rewards.items.forEach(item => {
        stats.totalRewardsEarned.items[item] = (stats.totalRewardsEarned.items[item] || 0) + 1;
      });
    }

    this.userStats.set(userId, stats);
    this.emit('statsUpdated', { userId, stats });

    // Update leaderboard
    this.leaderboardService.updatePlayerScore(userId, stats.totalReferrals, 'referrals');
  }

  async getReferralCode(codeId: string): Promise<ReferralCode | null> {
    return this.referralCodes.get(codeId) || null;
  }

  async getUserCodes(userId: string): Promise<ReferralCode[]> {
    const codeIds = this.codesByOwner.get(userId) || new Set();
    return Array.from(codeIds)
      .map(id => this.referralCodes.get(id))
      .filter((code): code is ReferralCode => code !== undefined);
  }

  async getReferralUse(useId: string): Promise<ReferralUse | null> {
    return this.referralUses.get(useId) || null;
  }

  async getUserStats(userId: string): Promise<ReferralStats | null> {
    return this.userStats.get(userId) || null;
  }

  onReferralCodeCreated(callback: (code: ReferralCode) => void) {
    this.on('referralCodeCreated', callback);
  }

  onReferralCodeUsed(callback: (data: { use: ReferralUse; code: ReferralCode }) => void) {
    this.on('referralCodeUsed', callback);
  }

  onReferralRewardsClaimed(
    callback: (data: {
      use: ReferralUse;
      claimerType: 'referrer' | 'referee';
      rewards: ReferralReward;
    }) => void
  ) {
    this.on('referralRewardsClaimed', callback);
  }

  onStatsUpdated(callback: (data: { userId: string; stats: ReferralStats }) => void) {
    this.on('statsUpdated', callback);
  }
}

export const referralService = ReferralService.getInstance(
  new DailyRewardService(),
  new SocialService(),
  new LeaderboardService()
);