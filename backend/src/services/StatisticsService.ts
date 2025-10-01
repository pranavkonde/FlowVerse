import { PlayerStatistics, ActivitySummary, PerformanceMetrics, PlayerComparison, AchievementProgress } from '../types/statistics';

export class StatisticsService {
  private statisticsCache: Map<string, PlayerStatistics> = new Map();

  /**
   * Get comprehensive player statistics
   */
  async getPlayerStatistics(playerId: string, timeframe: string): Promise<PlayerStatistics> {
    try {
      // Check cache first
      const cacheKey = `${playerId}_${timeframe}`;
      if (this.statisticsCache.has(cacheKey)) {
        return this.statisticsCache.get(cacheKey)!;
      }

      // Generate mock statistics data
      const statistics: PlayerStatistics = {
        playerId,
        timeframe,
        overview: {
          totalPlayTime: this.generateRandomValue(100, 1000), // hours
          level: this.generateRandomValue(1, 100),
          experience: this.generateRandomValue(0, 10000),
          coins: this.generateRandomValue(1000, 50000),
          achievements: this.generateRandomValue(5, 50)
        },
        activity: {
          dailyActive: this.generateRandomValue(0, 7), // days this week
          weeklyActive: this.generateRandomValue(0, 30), // days this month
          totalSessions: this.generateRandomValue(50, 500),
          averageSessionTime: this.generateRandomValue(30, 180) // minutes
        },
        performance: {
          gamesPlayed: this.generateRandomValue(100, 1000),
          gamesWon: this.generateRandomValue(50, 800),
          winRate: this.generateRandomValue(0.3, 0.9),
          averageScore: this.generateRandomValue(100, 1000),
          bestScore: this.generateRandomValue(500, 2000)
        },
        social: {
          friendsCount: this.generateRandomValue(0, 100),
          guildMembership: this.generateRandomValue(0, 1) ? 'Active' : 'None',
          messagesSent: this.generateRandomValue(100, 5000),
          tradesCompleted: this.generateRandomValue(10, 200)
        },
        progression: {
          questsCompleted: this.generateRandomValue(20, 200),
          skillsUnlocked: this.generateRandomValue(5, 30),
          itemsCollected: this.generateRandomValue(50, 1000),
          areasExplored: this.generateRandomValue(10, 50)
        },
        lastUpdated: new Date()
      };

      // Cache the result
      this.statisticsCache.set(cacheKey, statistics);

      return statistics;
    } catch (error) {
      console.error('Error getting player statistics:', error);
      throw new Error('Failed to get player statistics');
    }
  }

  /**
   * Get activity summary for specified days
   */
  async getActivitySummary(playerId: string, days: number): Promise<ActivitySummary> {
    try {
      const activitySummary: ActivitySummary = {
        playerId,
        period: `${days} days`,
        dailyActivity: this.generateDailyActivityData(days),
        totalPlayTime: this.generateRandomValue(days * 2, days * 8), // hours
        averageSessionTime: this.generateRandomValue(30, 120), // minutes
        mostActiveDay: this.getRandomDayOfWeek(),
        leastActiveDay: this.getRandomDayOfWeek(),
        streak: this.generateRandomValue(0, 30), // days
        lastActivity: new Date(Date.now() - this.generateRandomValue(0, 24 * 60 * 60 * 1000))
      };

      return activitySummary;
    } catch (error) {
      console.error('Error getting activity summary:', error);
      throw new Error('Failed to get activity summary');
    }
  }

  /**
   * Get performance metrics by category
   */
  async getPerformanceMetrics(playerId: string, category?: string): Promise<PerformanceMetrics> {
    try {
      const metrics: PerformanceMetrics = {
        playerId,
        category: category || 'overall',
        metrics: {
          accuracy: this.generateRandomValue(0.6, 0.95),
          speed: this.generateRandomValue(50, 200), // actions per minute
          efficiency: this.generateRandomValue(0.7, 0.98),
          consistency: this.generateRandomValue(0.5, 0.9),
          improvement: this.generateRandomValue(-0.1, 0.3) // percentage change
        },
        rankings: {
          global: this.generateRandomValue(1, 10000),
          regional: this.generateRandomValue(1, 1000),
          friends: this.generateRandomValue(1, 100)
        },
        trends: this.generateTrendData(30), // 30 days of trend data
        lastUpdated: new Date()
      };

      return metrics;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw new Error('Failed to get performance metrics');
    }
  }

  /**
   * Get player comparison data
   */
  async getPlayerComparison(playerId: string, compareWith: string): Promise<PlayerComparison> {
    try {
      const comparison: PlayerComparison = {
        player1: playerId,
        player2: compareWith,
        comparison: {
          level: {
            player1: this.generateRandomValue(1, 100),
            player2: this.generateRandomValue(1, 100)
          },
          experience: {
            player1: this.generateRandomValue(0, 10000),
            player2: this.generateRandomValue(0, 10000)
          },
          achievements: {
            player1: this.generateRandomValue(5, 50),
            player2: this.generateRandomValue(5, 50)
          },
          playTime: {
            player1: this.generateRandomValue(100, 1000),
            player2: this.generateRandomValue(100, 1000)
          },
          winRate: {
            player1: this.generateRandomValue(0.3, 0.9),
            player2: this.generateRandomValue(0.3, 0.9)
          }
        },
        advantages: this.generateAdvantages(),
        lastUpdated: new Date()
      };

      return comparison;
    } catch (error) {
      console.error('Error getting player comparison:', error);
      throw new Error('Failed to get player comparison');
    }
  }

  /**
   * Get achievement progress
   */
  async getAchievementProgress(playerId: string): Promise<AchievementProgress> {
    try {
      const progress: AchievementProgress = {
        playerId,
        totalAchievements: 50,
        unlocked: this.generateRandomValue(5, 30),
        inProgress: this.generateRandomValue(3, 15),
        locked: this.generateRandomValue(5, 42),
        recentUnlocks: this.generateRecentAchievements(),
        nextMilestones: this.generateNextMilestones(),
        categories: {
          combat: { unlocked: this.generateRandomValue(0, 10), total: 10 },
          social: { unlocked: this.generateRandomValue(0, 8), total: 8 },
          exploration: { unlocked: this.generateRandomValue(0, 12), total: 12 },
          collection: { unlocked: this.generateRandomValue(0, 10), total: 10 },
          crafting: { unlocked: this.generateRandomValue(0, 10), total: 10 }
        },
        lastUpdated: new Date()
      };

      return progress;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      throw new Error('Failed to get achievement progress');
    }
  }

  /**
   * Update player statistics
   */
  async updateStatistics(playerId: string, data: any): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`Updating statistics for player ${playerId}:`, data);
      
      // Clear cache for this player
      const keysToDelete = Array.from(this.statisticsCache.keys())
        .filter(key => key.startsWith(playerId));
      keysToDelete.forEach(key => this.statisticsCache.delete(key));
    } catch (error) {
      console.error('Error updating statistics:', error);
      throw new Error('Failed to update statistics');
    }
  }

  // Helper methods
  private generateRandomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateDailyActivityData(days: number): Array<{ date: string; playTime: number; sessions: number }> {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        playTime: this.generateRandomValue(0, 8), // hours
        sessions: this.generateRandomValue(0, 5)
      });
    }
    return data;
  }

  private getRandomDayOfWeek(): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[Math.floor(Math.random() * days.length)];
  }

  private generateTrendData(days: number): Array<{ date: string; value: number }> {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        value: this.generateRandomValue(50, 200)
      });
    }
    return data;
  }

  private generateAdvantages(): string[] {
    const advantages = [
      'Higher level',
      'More achievements',
      'Better win rate',
      'More play time',
      'More friends',
      'Better equipment',
      'More experience'
    ];
    
    const numAdvantages = this.generateRandomValue(1, 3);
    const selected = [];
    for (let i = 0; i < numAdvantages; i++) {
      const advantage = advantages[Math.floor(Math.random() * advantages.length)];
      if (!selected.includes(advantage)) {
        selected.push(advantage);
      }
    }
    return selected;
  }

  private generateRecentAchievements(): Array<{ id: string; name: string; unlockedAt: Date }> {
    const achievements = [
      'First Victory', 'Social Butterfly', 'Explorer', 'Collector', 'Craft Master',
      'Speed Demon', 'Perfectionist', 'Team Player', 'Lucky', 'Persistent'
    ];
    
    const numAchievements = this.generateRandomValue(1, 5);
    const recent = [];
    for (let i = 0; i < numAchievements; i++) {
      recent.push({
        id: `ach_${i + 1}`,
        name: achievements[Math.floor(Math.random() * achievements.length)],
        unlockedAt: new Date(Date.now() - this.generateRandomValue(1, 30) * 24 * 60 * 60 * 1000)
      });
    }
    return recent;
  }

  private generateNextMilestones(): Array<{ id: string; name: string; progress: number; target: number }> {
    const milestones = [
      'Level 50', '100 Achievements', '1000 Hours Played', 'Master Crafter', 'Social Leader'
    ];
    
    const numMilestones = this.generateRandomValue(2, 5);
    const next = [];
    for (let i = 0; i < numMilestones; i++) {
      const target = this.generateRandomValue(50, 1000);
      next.push({
        id: `milestone_${i + 1}`,
        name: milestones[Math.floor(Math.random() * milestones.length)],
        progress: this.generateRandomValue(0, target - 10),
        target
      });
    }
    return next;
  }
}
