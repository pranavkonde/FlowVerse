import { EventEmitter } from 'events';
import {
  ReferralCode,
  ReferralUse,
  ReferralStats,
  ReferralProgram,
  ReferralTier,
  ReferralReward,
  RewardType
} from '../types/referral';

export class ReferralService extends EventEmitter {
  private referralCodes: Map<string, ReferralCode> = new Map();
  private referralUses: Map<string, ReferralUse> = new Map();
  private userStats: Map<string, ReferralStats> = new Map();
  private tiers: ReferralTier[];

  constructor() {
    super();
    this.initializeTiers();
    this.startExpiryChecker();
  }

  private initializeTiers(): void {
    this.tiers = [
      {
        level: 1,
        name: 'Bronze Referrer',
        requiredReferrals: 0,
        rewards: [
          {
            type: 'CURRENCY',
            amount: 100,
            description: 'Welcome Bonus'
          }
        ],
        specialPerks: ['Basic Referral Badge']
      },
      {
        level: 2,
        name: 'Silver Referrer',
        requiredReferrals: 5,
        rewards: [
          {
            type: 'PREMIUM_CURRENCY',
            amount: 50,
            description: 'Silver Tier Bonus'
          },
          {
            type: 'SPECIAL_TITLE',
            amount: 1,
            description: 'Silver Recruiter Title'
          }
        ],
        specialPerks: ['Silver Referral Badge', '5% Bonus Rewards']
      },
      {
        level: 3,
        name: 'Gold Referrer',
        requiredReferrals: 15,
        rewards: [
          {
            type: 'PREMIUM_CURRENCY',
            amount: 150,
            description: 'Gold Tier Bonus'
          },
          {
            type: 'TRADING_CARD',
            amount: 1,
            description: 'Exclusive Gold Tier Card'
          }
        ],
        specialPerks: ['Gold Referral Badge', '10% Bonus Rewards', 'Custom Profile Frame']
      },
      {
        level: 4,
        name: 'Platinum Referrer',
        requiredReferrals: 50,
        rewards: [
          {
            type: 'PREMIUM_CURRENCY',
            amount: 500,
            description: 'Platinum Tier Bonus'
          },
          {
            type: 'PREMIUM_TIME',
            amount: 30,
            description: '30 Days Premium Status'
          }
        ],
        specialPerks: [
          'Platinum Referral Badge',
          '15% Bonus Rewards',
          'Custom Profile Frame',
          'Special Chat Tag'
        ]
      }
    ];
  }

  private startExpiryChecker(): void {
    setInterval(() => {
      const now = new Date();
      for (const [codeId, code] of this.referralCodes) {
        if (
          code.status === 'ACTIVE' &&
          (
            (code.expiresAt && new Date(code.expiresAt) <= now) ||
            (code.maxUses && code.currentUses >= code.maxUses)
          )
        ) {
          code.status = code.currentUses >= (code.maxUses || 0)
            ? 'DEPLETED'
            : 'EXPIRED';
          this.referralCodes.set(codeId, code);
          this.emit('referral:expired', { codeId });
        }
      }
    }, 60000); // Check every minute
  }

  public async generateCode(
    userId: string,
    options?: {
      expiresIn?: number; // hours
      maxUses?: number;
    }
  ): Promise<ReferralCode> {
    const code: ReferralCode = {
      id: `REF-${Date.now()}`,
      code: this.generateUniqueCode(),
      ownerId: userId,
      createdAt: new Date().toISOString(),
      currentUses: 0,
      rewards: [
        {
          type: 'CURRENCY',
          amount: 100,
          description: 'Basic Referral Reward'
        },
        {
          type: 'EXPERIENCE',
          amount: 500,
          description: 'Referral Experience Bonus'
        }
      ],
      status: 'ACTIVE'
    };

    if (options?.expiresIn) {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + options.expiresIn);
      code.expiresAt = expiryDate.toISOString();
    }

    if (options?.maxUses) {
      code.maxUses = options.maxUses;
    }

    this.referralCodes.set(code.id, code);
    return code;
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    do {
      code = Array.from(
        { length: 8 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    } while (
      Array.from(this.referralCodes.values()).some(rc => rc.code === code)
    );
    return code;
  }

  public async useCode(
    referredId: string,
    code: string
  ): Promise<ReferralUse> {
    const referralCode = Array.from(this.referralCodes.values()).find(
      rc => rc.code === code && rc.status === 'ACTIVE'
    );

    if (!referralCode) {
      throw new Error('Invalid or expired referral code');
    }

    if (referralCode.ownerId === referredId) {
      throw new Error('Cannot use your own referral code');
    }

    const existingUse = Array.from(this.referralUses.values()).find(
      use => use.referredId === referredId
    );

    if (existingUse) {
      throw new Error('Already used a referral code');
    }

    const use: ReferralUse = {
      id: `USE-${Date.now()}`,
      referralId: referralCode.id,
      referrerId: referralCode.ownerId,
      referredId,
      usedAt: new Date().toISOString(),
      rewardsClaimed: false
    };

    referralCode.currentUses++;
    if (
      referralCode.maxUses &&
      referralCode.currentUses >= referralCode.maxUses
    ) {
      referralCode.status = 'DEPLETED';
    }

    this.referralCodes.set(referralCode.id, referralCode);
    this.referralUses.set(use.id, use);
    this.updateStats(referralCode.ownerId);

    this.emit('referral:used', {
      referralId: referralCode.id,
      referrerId: referralCode.ownerId,
      referredId
    });

    return use;
  }

  public async claimRewards(useId: string): Promise<ReferralUse> {
    const use = this.referralUses.get(useId);
    if (!use) {
      throw new Error('Referral use not found');
    }

    if (use.rewardsClaimed) {
      throw new Error('Rewards already claimed');
    }

    const referralCode = this.referralCodes.get(use.referralId);
    if (!referralCode) {
      throw new Error('Referral code not found');
    }

    use.rewardsClaimed = true;
    use.claimedAt = new Date().toISOString();
    this.referralUses.set(use.id, use);

    this.emit('rewards:claimed', {
      useId,
      referrerId: use.referrerId,
      referredId: use.referredId,
      rewards: referralCode.rewards
    });

    return use;
  }

  private updateStats(userId: string): void {
    const uses = Array.from(this.referralUses.values()).filter(
      use => use.referrerId === userId
    );

    const stats: ReferralStats = {
      totalReferrals: uses.length,
      activeReferrals: uses.filter(use => !use.rewardsClaimed).length,
      totalRewardsEarned: this.calculateTotalRewards(uses),
      referralChain: this.calculateReferralChain(userId),
      specialAchievements: this.calculateAchievements(uses.length)
    };

    this.userStats.set(userId, stats);
  }

  private calculateTotalRewards(uses: ReferralUse[]): { type: RewardType; amount: number }[] {
    const rewardTotals = new Map<RewardType, number>();

    uses.forEach(use => {
      const code = this.referralCodes.get(use.referralId);
      if (!code) return;

      code.rewards.forEach(reward => {
        const current = rewardTotals.get(reward.type) || 0;
        rewardTotals.set(reward.type, current + reward.amount);
      });
    });

    return Array.from(rewardTotals.entries()).map(([type, amount]) => ({
      type,
      amount
    }));
  }

  private calculateReferralChain(userId: string): number {
    const visited = new Set<string>();
    const traverse = (id: string): number => {
      if (visited.has(id)) return 0;
      visited.add(id);

      const directReferrals = Array.from(this.referralUses.values())
        .filter(use => use.referrerId === id)
        .map(use => use.referredId);

      if (directReferrals.length === 0) return 1;

      return 1 + Math.max(
        ...directReferrals.map(referredId => traverse(referredId))
      );
    };

    return traverse(userId);
  }

  private calculateAchievements(totalReferrals: number): string[] {
    const achievements: string[] = [];

    if (totalReferrals >= 1) achievements.push('First Referral');
    if (totalReferrals >= 5) achievements.push('Growing Network');
    if (totalReferrals >= 10) achievements.push('Referral Expert');
    if (totalReferrals >= 25) achievements.push('Master Recruiter');
    if (totalReferrals >= 50) achievements.push('Legendary Referrer');

    return achievements;
  }

  public async getReferralProgram(userId: string): Promise<ReferralProgram> {
    const stats = this.userStats.get(userId) || {
      totalReferrals: 0,
      activeReferrals: 0,
      totalRewardsEarned: [],
      referralChain: 0,
      specialAchievements: []
    };

    const currentTier = this.tiers.reduce((highest, tier) =>
      stats.totalReferrals >= tier.requiredReferrals ? tier.level : highest,
      1
    );

    const nextTier = this.tiers.find(tier => tier.level === currentTier + 1);
    const nextTierProgress = nextTier
      ? (stats.totalReferrals / nextTier.requiredReferrals) * 100
      : 100;

    return {
      tiers: this.tiers,
      currentTier,
      nextTierProgress,
      totalReferrals: stats.totalReferrals,
      availableRewards: this.getAvailableRewards(currentTier)
    };
  }

  private getAvailableRewards(currentTier: number): ReferralReward[] {
    return this.tiers
      .filter(tier => tier.level <= currentTier)
      .flatMap(tier => tier.rewards);
  }

  public async getUserStats(userId: string): Promise<ReferralStats> {
    return (
      this.userStats.get(userId) || {
        totalReferrals: 0,
        activeReferrals: 0,
        totalRewardsEarned: [],
        referralChain: 0,
        specialAchievements: []
      }
    );
  }

  public async getUserCodes(userId: string): Promise<ReferralCode[]> {
    return Array.from(this.referralCodes.values()).filter(
      code => code.ownerId === userId
    );
  }
}