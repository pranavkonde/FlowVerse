import crypto from 'crypto';

export interface ReferralReward {
  tokens: number;
  items?: string[];
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalTokensEarned: number;
}

export class ReferralService {
  private static readonly REFERRAL_REWARDS: {
    referrer: ReferralReward;
    referee: ReferralReward;
  } = {
    referrer: {
      tokens: 1000,
      items: ['referral_badge', 'special_emote']
    },
    referee: {
      tokens: 500,
      items: ['welcome_pack']
    }
  };

  private referralCodes: Map<string, string> = new Map(); // userId -> referralCode
  private referralLinks: Map<string, string> = new Map(); // referralCode -> userId
  private pendingReferrals: Map<string, Set<string>> = new Map(); // userId -> Set of referred userIds
  private completedReferrals: Map<string, Set<string>> = new Map(); // userId -> Set of completed referral userIds

  async generateReferralCode(userId: string): Promise<string> {
    let existingCode = this.referralCodes.get(userId);
    if (existingCode) {
      return existingCode;
    }

    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.referralCodes.set(userId, code);
    this.referralLinks.set(code, userId);
    return code;
  }

  async applyReferralCode(newUserId: string, referralCode: string): Promise<boolean> {
    const referrerId = this.referralLinks.get(referralCode);
    if (!referrerId) {
      return false;
    }

    // Get or create the set of pending referrals for this referrer
    let pendingSet = this.pendingReferrals.get(referrerId);
    if (!pendingSet) {
      pendingSet = new Set();
      this.pendingReferrals.set(referrerId, pendingSet);
    }

    // Add the new user to pending referrals
    pendingSet.add(newUserId);
    return true;
  }

  async completeReferral(newUserId: string): Promise<{
    success: boolean;
    referrerId?: string;
    rewards?: typeof ReferralService.REFERRAL_REWARDS;
  }> {
    // Find the referrer for this user
    let referrerId: string | undefined;
    for (const [userId, pendingSet] of this.pendingReferrals.entries()) {
      if (pendingSet.has(newUserId)) {
        referrerId = userId;
        break;
      }
    }

    if (!referrerId) {
      return { success: false };
    }

    // Move referral from pending to completed
    this.pendingReferrals.get(referrerId)?.delete(newUserId);
    
    let completedSet = this.completedReferrals.get(referrerId);
    if (!completedSet) {
      completedSet = new Set();
      this.completedReferrals.set(referrerId, completedSet);
    }
    completedSet.add(newUserId);

    return {
      success: true,
      referrerId,
      rewards: ReferralService.REFERRAL_REWARDS
    };
  }

  async getReferralStats(userId: string): Promise<ReferralStats> {
    const pendingReferrals = this.pendingReferrals.get(userId)?.size || 0;
    const completedReferrals = this.completedReferrals.get(userId)?.size || 0;
    
    return {
      totalReferrals: pendingReferrals + completedReferrals,
      pendingReferrals,
      completedReferrals,
      totalTokensEarned: completedReferrals * ReferralService.REFERRAL_REWARDS.referrer.tokens
    };
  }
}

export const referralService = new ReferralService();


