import { EventEmitter } from 'events';
import { DailyChallenge, ChallengeCategoryType, ChallengeProgress } from '../types/challenges';

export class DailyChallengeService extends EventEmitter {
  private challenges: Map<string, DailyChallenge> = new Map();
  private userProgress: Map<string, Map<string, ChallengeProgress>> = new Map();
  private challengeGenerators: Map<ChallengeCategoryType, () => Partial<DailyChallenge>> = new Map();

  constructor() {
    super();
    this.initializeChallengeGenerators();
    this.startDailyRefresh();
  }

  private initializeChallengeGenerators(): void {
    // Combat challenges
    this.challengeGenerators.set('COMBAT', () => ({
      title: 'Daily Combat Master',
      description: 'Win battles in the arena',
      type: 'COMBAT',
      requirement: 3,
      reward: { type: 'CURRENCY', amount: 100 }
    }));

    // Crafting challenges
    this.challengeGenerators.set('CRAFTING', () => ({
      title: 'Master Crafter',
      description: 'Craft rare items',
      type: 'CRAFTING',
      requirement: 5,
      reward: { type: 'CRAFTING_MATERIAL', amount: 3 }
    }));

    // Add more generators for other categories...
  }

  private startDailyRefresh(): void {
    const refreshChallenges = () => {
      this.generateDailyChallenges();
      this.emit('challenges:refreshed');
    };

    // Refresh challenges at midnight
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        refreshChallenges();
      }
    }, 60000); // Check every minute

    // Initial generation
    refreshChallenges();
  }

  private generateDailyChallenges(): void {
    this.challenges.clear();
    
    for (const [type, generator] of this.challengeGenerators) {
      const challenge: DailyChallenge = {
        id: `${type}-${Date.now()}`,
        ...generator(),
        expiresAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
        isActive: true
      } as DailyChallenge;

      this.challenges.set(challenge.id, challenge);
    }
  }

  public async getUserChallenges(userId: string): Promise<DailyChallenge[]> {
    const userProgressMap = this.userProgress.get(userId) || new Map();
    return Array.from(this.challenges.values()).map(challenge => ({
      ...challenge,
      progress: userProgressMap.get(challenge.id)?.currentProgress || 0,
      completed: userProgressMap.get(challenge.id)?.isCompleted || false,
      claimed: userProgressMap.get(challenge.id)?.claimed || false
    }));
  }

  public async updateProgress(
    userId: string,
    challengeId: string,
    progress: number
  ): Promise<ChallengeProgress> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || !challenge.isActive) {
      throw new Error('Challenge not found or inactive');
    }

    let userProgressMap = this.userProgress.get(userId);
    if (!userProgressMap) {
      userProgressMap = new Map();
      this.userProgress.set(userId, userProgressMap);
    }

    let challengeProgress = userProgressMap.get(challengeId) || {
      challengeId,
      currentProgress: 0,
      isCompleted: false,
      claimed: false
    };

    challengeProgress.currentProgress = Math.min(
      challenge.requirement,
      challengeProgress.currentProgress + progress
    );

    if (
      challengeProgress.currentProgress >= challenge.requirement &&
      !challengeProgress.isCompleted
    ) {
      challengeProgress.isCompleted = true;
      challengeProgress.completedAt = new Date().toISOString();
      this.emit('challenge:completed', { userId, challengeId });
    }

    userProgressMap.set(challengeId, challengeProgress);
    return challengeProgress;
  }

  public async claimReward(
    userId: string,
    challengeId: string
  ): Promise<ChallengeProgress> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge || !challenge.isActive) {
      throw new Error('Challenge not found or inactive');
    }

    const userProgressMap = this.userProgress.get(userId);
    if (!userProgressMap) {
      throw new Error('No progress found for user');
    }

    const progress = userProgressMap.get(challengeId);
    if (!progress || !progress.isCompleted || progress.claimed) {
      throw new Error('Cannot claim reward: challenge not completed or already claimed');
    }

    progress.claimed = true;
    progress.claimedAt = new Date().toISOString();
    userProgressMap.set(challengeId, progress);

    this.emit('reward:claimed', {
      userId,
      challengeId,
      reward: challenge.reward
    });

    return progress;
  }
}