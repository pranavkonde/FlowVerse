export interface UserProgress {
  userId: string;
  level: number;
  experience: number;
  dailyStreak: number;
  lastLoginDate: Date;
  achievements: string[];
  questsCompleted: string[];
  tutorialProgress: {
    completed: boolean;
    currentStep: string;
    completedSteps: string[];
  };
  referralProgress: {
    totalReferrals: number;
    activeReferrals: number;
    referralRewardsEarned: number;
  };
  statistics: {
    totalPlayTime: number;
    gamesPlayed: number;
    gamesWon: number;
    itemsCrafted: number;
    tokensEarned: number;
    friendsCount: number;
  };
}

export class ProgressTrackingService {
  private userProgress: Map<string, UserProgress> = new Map();

  private calculateExperienceForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  async initializeProgress(userId: string): Promise<UserProgress> {
    const initialProgress: UserProgress = {
      userId,
      level: 1,
      experience: 0,
      dailyStreak: 0,
      lastLoginDate: new Date(),
      achievements: [],
      questsCompleted: [],
      tutorialProgress: {
        completed: false,
        currentStep: 'welcome',
        completedSteps: []
      },
      referralProgress: {
        totalReferrals: 0,
        activeReferrals: 0,
        referralRewardsEarned: 0
      },
      statistics: {
        totalPlayTime: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        itemsCrafted: 0,
        tokensEarned: 0,
        friendsCount: 0
      }
    };

    this.userProgress.set(userId, initialProgress);
    return initialProgress;
  }

  async getProgress(userId: string): Promise<UserProgress> {
    let progress = this.userProgress.get(userId);
    if (!progress) {
      progress = await this.initializeProgress(userId);
    }
    return progress;
  }

  async addExperience(userId: string, amount: number): Promise<{
    newLevel: number;
    leveledUp: boolean;
    experienceToNextLevel: number;
  }> {
    const progress = await this.getProgress(userId);
    progress.experience += amount;

    let leveledUp = false;
    while (progress.experience >= this.calculateExperienceForLevel(progress.level)) {
      progress.experience -= this.calculateExperienceForLevel(progress.level);
      progress.level++;
      leveledUp = true;
    }

    const experienceToNextLevel = this.calculateExperienceForLevel(progress.level) - progress.experience;

    return {
      newLevel: progress.level,
      leveledUp,
      experienceToNextLevel
    };
  }

  async updateDailyStreak(userId: string): Promise<{
    newStreak: number;
    maintained: boolean;
  }> {
    const progress = await this.getProgress(userId);
    const now = new Date();
    const lastLogin = new Date(progress.lastLoginDate);
    
    const daysSinceLastLogin = Math.floor(
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
    );

    let maintained = false;
    if (daysSinceLastLogin <= 1) {
      progress.dailyStreak++;
      maintained = true;
    } else {
      progress.dailyStreak = 1;
    }

    progress.lastLoginDate = now;
    return {
      newStreak: progress.dailyStreak,
      maintained
    };
  }

  async completeQuest(userId: string, questId: string): Promise<boolean> {
    const progress = await this.getProgress(userId);
    if (progress.questsCompleted.includes(questId)) {
      return false;
    }

    progress.questsCompleted.push(questId);
    return true;
  }

  async updateTutorialProgress(
    userId: string,
    stepId: string,
    completed: boolean
  ): Promise<void> {
    const progress = await this.getProgress(userId);
    
    if (completed) {
      progress.tutorialProgress.completedSteps.push(stepId);
      progress.tutorialProgress.completed = 
        progress.tutorialProgress.currentStep === stepId;
    }
    
    progress.tutorialProgress.currentStep = stepId;
  }

  async updateStatistics(userId: string, updates: Partial<UserProgress['statistics']>): Promise<void> {
    const progress = await this.getProgress(userId);
    Object.assign(progress.statistics, updates);
  }

  async getRankings(category: keyof UserProgress['statistics']): Promise<Array<{
    userId: string;
    value: number;
    rank: number;
  }>> {
    const rankings = Array.from(this.userProgress.values())
      .map(progress => ({
        userId: progress.userId,
        value: progress.statistics[category] as number
      }))
      .sort((a, b) => b.value - a.value)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    return rankings;
  }
}

export const progressTrackingService = new ProgressTrackingService();



