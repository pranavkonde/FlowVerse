import { 
  Achievement, 
  UserAchievement, 
  AchievementProgress, 
  AchievementCategory, 
  AchievementRarity, 
  RequirementType, 
  RewardType,
  AchievementStats 
} from '../types/achievements';

export class AchievementService {
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement[]> = new Map();
  private userStats: Map<string, Record<string, number>> = new Map();

  constructor() {
    this.initializeDefaultAchievements();
  }

  private initializeDefaultAchievements(): void {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Take your first steps in Free Flow',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.COMMON,
        icon: '👣',
        points: 10,
        requirements: [
          { type: RequirementType.DISTANCE_TRAVELED, target: 100, current: 0 }
        ],
        rewards: [
          { type: RewardType.TOKENS, amount: 50 },
          { type: RewardType.XP, amount: 100 }
        ],
        isHidden: false,
        isRepeatable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Meet 10 different players',
        category: AchievementCategory.SOCIAL,
        rarity: AchievementRarity.UNCOMMON,
        icon: '🦋',
        points: 25,
        requirements: [
          { type: RequirementType.PLAYERS_MET, target: 10, current: 0 }
        ],
        rewards: [
          { type: RewardType.TOKENS, amount: 100 },
          { type: RewardType.TITLE, amount: 1, metadata: { title: 'Social Butterfly' } }
        ],
        isHidden: false,
        isRepeatable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'voice_commander',
        name: 'Voice Commander',
        description: 'Use 50 voice commands',
        category: AchievementCategory.SPECIAL,
        rarity: AchievementRarity.RARE,
        icon: '🎤',
        points: 50,
        requirements: [
          { type: RequirementType.VOICE_COMMANDS, target: 50, current: 0 }
        ],
        rewards: [
          { type: RewardType.TOKENS, amount: 200 },
          { type: RewardType.BADGE, amount: 1, metadata: { badge: 'voice_commander' } }
        ],
        isHidden: false,
        isRepeatable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'explorer',
        name: 'Explorer',
        description: 'Visit 20 different rooms',
        category: AchievementCategory.EXPLORATION,
        rarity: AchievementRarity.UNCOMMON,
        icon: '🗺️',
        points: 30,
        requirements: [
          { type: RequirementType.ROOMS_VISITED, target: 20, current: 0 }
        ],
        rewards: [
          { type: RewardType.TOKENS, amount: 150 },
          { type: RewardType.XP, amount: 300 }
        ],
        isHidden: false,
        isRepeatable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'dedicated_player',
        name: 'Dedicated Player',
        description: 'Play for 7 consecutive days',
        category: AchievementCategory.SPECIAL,
        rarity: AchievementRarity.EPIC,
        icon: '🔥',
        points: 100,
        requirements: [
          { type: RequirementType.CONSECUTIVE_DAYS, target: 7, current: 0 }
        ],
        rewards: [
          { type: RewardType.TOKENS, amount: 500 },
          { type: RewardType.TITLE, amount: 1, metadata: { title: 'Dedicated' } },
          { type: RewardType.CUSTOMIZATION, amount: 1, metadata: { item: 'dedicated_crown' } }
        ],
        isHidden: false,
        isRepeatable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emote_master',
        name: 'Emote Master',
        description: 'Use 100 different emotes',
        category: AchievementCategory.SOCIAL,
        rarity: AchievementRarity.RARE,
        icon: '😄',
        points: 40,
        requirements: [
          { type: RequirementType.EMOTES_USED, target: 100, current: 0 }
        ],
        rewards: [
          { type: RewardType.TOKENS, amount: 180 },
          { type: RewardType.BADGE, amount: 1, metadata: { badge: 'emote_master' } }
        ],
        isHidden: false,
        isRepeatable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  // Get all achievements
  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  // Get achievement by ID
  getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.get(achievementId);
  }

  // Get achievements by category
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.category === category);
  }

  // Get user achievements
  getUserAchievements(userId: string): UserAchievement[] {
    return this.userAchievements.get(userId) || [];
  }

  // Get user achievement progress
  getUserAchievementProgress(userId: string, achievementId: string): AchievementProgress | null {
    const userAchievement = this.getUserAchievements(userId)
      .find(ua => ua.achievementId === achievementId);
    
    if (!userAchievement) {
      return null;
    }

    const achievement = this.getAchievement(achievementId);
    if (!achievement) {
      return null;
    }

    const totalTarget = achievement.requirements.reduce((sum, req) => sum + req.target, 0);
    const percentage = totalTarget > 0 ? (userAchievement.progress / totalTarget) * 100 : 0;

    return {
      achievementId,
      current: userAchievement.progress,
      target: totalTarget,
      percentage: Math.min(percentage, 100),
      isCompleted: userAchievement.isCompleted
    };
  }

  // Update user progress for a specific requirement type
  updateUserProgress(userId: string, requirementType: RequirementType, amount: number, metadata?: Record<string, any>): void {
    const userStats = this.getUserStats(userId);
    const currentValue = userStats[requirementType] || 0;
    userStats[requirementType] = currentValue + amount;
    this.userStats.set(userId, userStats);

    // Check all achievements for this user
    this.checkAchievements(userId);
  }

  // Get user stats
  getUserStats(userId: string): Record<string, number> {
    return this.userStats.get(userId) || {};
  }

  // Check and update achievements for a user
  private checkAchievements(userId: string): void {
    const userStats = this.getUserStats(userId);
    const userAchievements = this.getUserAchievements(userId);

    for (const achievement of this.achievements.values()) {
      let userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      
      if (!userAchievement) {
        userAchievement = {
          id: `${userId}_${achievement.id}`,
          userId,
          achievementId: achievement.id,
          progress: 0,
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        userAchievements.push(userAchievement);
      }

      if (userAchievement.isCompleted && !achievement.isRepeatable) {
        continue;
      }

      // Calculate progress for this achievement
      let totalProgress = 0;
      let allRequirementsMet = true;

      for (const requirement of achievement.requirements) {
        const currentValue = userStats[requirement.type] || 0;
        const progress = Math.min(currentValue, requirement.target);
        totalProgress += progress;

        if (currentValue < requirement.target) {
          allRequirementsMet = false;
        }
      }

      userAchievement.progress = totalProgress;
      userAchievement.updatedAt = new Date();

      // Check if achievement is completed
      if (allRequirementsMet && !userAchievement.isCompleted) {
        userAchievement.isCompleted = true;
        userAchievement.completedAt = new Date();
        console.log(`Achievement completed: ${achievement.name} by user ${userId}`);
      }
    }

    this.userAchievements.set(userId, userAchievements);
  }

  // Claim achievement reward
  claimAchievementReward(userId: string, achievementId: string): boolean {
    const userAchievements = this.getUserAchievements(userId);
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievementId);

    if (!userAchievement || !userAchievement.isCompleted || userAchievement.claimedAt) {
      return false;
    }

    userAchievement.claimedAt = new Date();
    userAchievement.updatedAt = new Date();

    console.log(`Reward claimed for achievement ${achievementId} by user ${userId}`);
    return true;
  }

  // Get user achievement stats
  getUserAchievementStats(userId: string): AchievementStats {
    const userAchievements = this.getUserAchievements(userId);
    const completedAchievements = userAchievements.filter(ua => ua.isCompleted);
    
    const categories: Record<AchievementCategory, number> = {} as Record<AchievementCategory, number>;
    const rarity: Record<AchievementRarity, number> = {} as Record<AchievementRarity, number>;

    // Initialize counters
    Object.values(AchievementCategory).forEach(cat => categories[cat] = 0);
    Object.values(AchievementRarity).forEach(rar => rarity[rar] = 0);

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const userAchievement of completedAchievements) {
      const achievement = this.getAchievement(userAchievement.achievementId);
      if (achievement) {
        totalPoints += achievement.points;
        earnedPoints += achievement.points;
        categories[achievement.category]++;
        rarity[achievement.rarity]++;
      }
    }

    const recentAchievements = completedAchievements
      .filter(ua => ua.completedAt)
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime())
      .slice(0, 5);

    return {
      totalAchievements: this.achievements.size,
      completedAchievements: completedAchievements.length,
      totalPoints,
      earnedPoints,
      categories,
      rarity,
      recentAchievements
    };
  }

  // Create new achievement (admin function)
  createAchievement(achievement: Omit<Achievement, 'createdAt' | 'updatedAt'>): Achievement {
    const newAchievement: Achievement = {
      ...achievement,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.achievements.set(newAchievement.id, newAchievement);
    return newAchievement;
  }

  // Update achievement (admin function)
  updateAchievement(achievementId: string, updates: Partial<Achievement>): Achievement | null {
    const achievement = this.achievements.get(achievementId);
    if (!achievement) {
      return null;
    }

    const updatedAchievement = {
      ...achievement,
      ...updates,
      updatedAt: new Date()
    };

    this.achievements.set(achievementId, updatedAchievement);
    return updatedAchievement;
  }

  // Delete achievement (admin function)
  deleteAchievement(achievementId: string): boolean {
    return this.achievements.delete(achievementId);
  }
}
