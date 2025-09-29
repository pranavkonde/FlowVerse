import { User } from '../types/game';

export interface DailyReward {
  day: number;
  tokens: number;
  items: string[];
  specialReward?: string;
}

export class DailyRewardService {
  private static readonly REWARD_SCHEDULE: DailyReward[] = [
    { day: 1, tokens: 100, items: ['basic_potion'] },
    { day: 2, tokens: 150, items: ['basic_potion', 'basic_scroll'] },
    { day: 3, tokens: 200, items: ['medium_potion', 'basic_scroll'] },
    { day: 4, tokens: 250, items: ['medium_potion', 'medium_scroll'] },
    { day: 5, tokens: 300, items: ['advanced_potion', 'medium_scroll'] },
    { day: 6, tokens: 350, items: ['advanced_potion', 'advanced_scroll'] },
    { day: 7, tokens: 500, items: ['legendary_potion', 'legendary_scroll'], specialReward: 'mystery_box' },
  ];

  private userLastClaim: Map<string, Date> = new Map();
  private userCurrentStreak: Map<string, number> = new Map();

  async canClaimDaily(userId: string): Promise<boolean> {
    const lastClaim = this.userLastClaim.get(userId);
    if (!lastClaim) return true;

    const now = new Date();
    const timeDiff = now.getTime() - lastClaim.getTime();
    const hoursPassed = timeDiff / (1000 * 60 * 60);

    return hoursPassed >= 20; // Allow claiming if 20+ hours have passed
  }

  async claimDailyReward(userId: string): Promise<DailyReward | null> {
    if (!await this.canClaimDaily(userId)) {
      return null;
    }

    const now = new Date();
    const lastClaim = this.userLastClaim.get(userId);
    let currentStreak = this.userCurrentStreak.get(userId) || 0;

    // Check if streak should be reset (more than 48 hours since last claim)
    if (lastClaim && (now.getTime() - lastClaim.getTime()) > (48 * 60 * 60 * 1000)) {
      currentStreak = 0;
    }

    // Increment streak and handle weekly reset
    currentStreak = (currentStreak % 7) + 1;

    // Update user's claim data
    this.userLastClaim.set(userId, now);
    this.userCurrentStreak.set(userId, currentStreak);

    // Return reward for current streak day
    return DailyRewardService.REWARD_SCHEDULE[currentStreak - 1];
  }

  async getStreakInfo(userId: string): Promise<{ currentStreak: number; nextReward: DailyReward; canClaim: boolean }> {
    const currentStreak = this.userCurrentStreak.get(userId) || 0;
    const nextDay = ((currentStreak % 7) + 1);
    const canClaim = await this.canClaimDaily(userId);

    return {
      currentStreak,
      nextReward: DailyRewardService.REWARD_SCHEDULE[nextDay - 1],
      canClaim
    };
  }
}

export const dailyRewardService = new DailyRewardService();
