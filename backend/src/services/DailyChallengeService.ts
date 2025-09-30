import { LeaderboardService } from './LeaderboardService';
import { ProgressTrackingService } from './ProgressTrackingService';
import { AchievementService } from './AchievementService';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'combat' | 'collection' | 'social' | 'exploration' | 'crafting';
  requirement: {
    type: string;
    target: number;
    current?: number;
  };
  rewards: {
    tokens: number;
    items: string[];
    experience: number;
  };
  startTime: Date;
  endTime: Date;
}

export interface UserChallengeProgress {
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  completedAt?: Date;
}

export class DailyChallengeService {
  private static instance: DailyChallengeService;
  private currentChallenges: Map<string, DailyChallenge> = new Map();
  private userProgress: Map<string, UserChallengeProgress[]> = new Map();
  
  private constructor(
    private leaderboardService: LeaderboardService,
    private progressTrackingService: ProgressTrackingService,
    private achievementService: AchievementService
  ) {
    this.generateDailyChallenges();
    // Refresh challenges daily at midnight
    setInterval(() => this.generateDailyChallenges(), 24 * 60 * 60 * 1000);
  }

  static getInstance(
    leaderboardService: LeaderboardService,
    progressTrackingService: ProgressTrackingService,
    achievementService: AchievementService
  ): DailyChallengeService {
    if (!DailyChallengeService.instance) {
      DailyChallengeService.instance = new DailyChallengeService(
        leaderboardService,
        progressTrackingService,
        achievementService
      );
    }
    return DailyChallengeService.instance;
  }

  private generateDailyChallenges() {
    const challenges: DailyChallenge[] = [
      {
        id: 'daily_combat_1',
        title: 'Warrior\'s Training',
        description: 'Defeat 10 enemies in combat',
        type: 'combat',
        requirement: {
          type: 'enemies_defeated',
          target: 10
        },
        rewards: {
          tokens: 100,
          items: ['combat_potion', 'warrior_scroll'],
          experience: 200
        },
        startTime: new Date(),
        endTime: new Date(new Date().setHours(23, 59, 59, 999))
      },
      {
        id: 'daily_collection_1',
        title: 'Resource Gatherer',
        description: 'Collect 20 resources from the world',
        type: 'collection',
        requirement: {
          type: 'resources_collected',
          target: 20
        },
        rewards: {
          tokens: 75,
          items: ['gathering_gloves', 'resource_bag'],
          experience: 150
        },
        startTime: new Date(),
        endTime: new Date(new Date().setHours(23, 59, 59, 999))
      },
      {
        id: 'daily_social_1',
        title: 'Social Butterfly',
        description: 'Interact with 5 different players',
        type: 'social',
        requirement: {
          type: 'player_interactions',
          target: 5
        },
        rewards: {
          tokens: 50,
          items: ['friendship_badge', 'chat_emote'],
          experience: 100
        },
        startTime: new Date(),
        endTime: new Date(new Date().setHours(23, 59, 59, 999))
      }
    ];

    this.currentChallenges.clear();
    challenges.forEach(challenge => this.currentChallenges.set(challenge.id, challenge));
  }

  async getCurrentChallenges(): Promise<DailyChallenge[]> {
    return Array.from(this.currentChallenges.values());
  }

  async getUserProgress(userId: string): Promise<UserChallengeProgress[]> {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, []);
    }
    return this.userProgress.get(userId) || [];
  }

  async updateProgress(userId: string, challengeId: string, progress: number): Promise<UserChallengeProgress> {
    const challenge = this.currentChallenges.get(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    let userChallenges = this.userProgress.get(userId) || [];
    let userChallenge = userChallenges.find(p => p.challengeId === challengeId);

    if (!userChallenge) {
      userChallenge = {
        userId,
        challengeId,
        progress: 0,
        completed: false,
        claimed: false
      };
      userChallenges.push(userChallenge);
    }

    userChallenge.progress = Math.min(progress, challenge.requirement.target);
    userChallenge.completed = userChallenge.progress >= challenge.requirement.target;

    if (userChallenge.completed && !userChallenge.completedAt) {
      userChallenge.completedAt = new Date();
      
      // Update leaderboard
      this.leaderboardService.updatePlayerScore(userId, 10, 'daily_challenges');
      
      // Track progress for achievements
      this.progressTrackingService.updateProgress(userId, 'daily_challenges_completed', 1);
    }

    this.userProgress.set(userId, userChallenges);
    return userChallenge;
  }

  async claimRewards(userId: string, challengeId: string): Promise<boolean> {
    const challenge = this.currentChallenges.get(challengeId);
    const userChallenges = this.userProgress.get(userId) || [];
    const userChallenge = userChallenges.find(p => p.challengeId === challengeId);

    if (!challenge || !userChallenge || !userChallenge.completed || userChallenge.claimed) {
      return false;
    }

    userChallenge.claimed = true;
    this.userProgress.set(userId, userChallenges);

    // Here you would integrate with inventory/reward systems to grant rewards
    // For now, we'll just return true to indicate successful claim
    return true;
  }

  async getLeaderboard(): Promise<{ userId: string; completedChallenges: number }[]> {
    // Implementation would depend on LeaderboardService integration
    return [];
  }
}

export const dailyChallengeService = DailyChallengeService.getInstance(
  new LeaderboardService(),
  new ProgressTrackingService(),
  new AchievementService()
);
