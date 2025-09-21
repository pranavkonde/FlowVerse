import { Player } from '../types/game';

export interface LeaderboardEntry {
  playerId: string;
  username: string;
  score: number;
  level: number;
  achievements: string[];
  lastActive: Date;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
}

export class LeaderboardService {
  private leaderboard: Map<string, LeaderboardEntry> = new Map();
  private gameHistory: Map<string, any[]> = new Map();

  updatePlayerScore(playerId: string, scoreChange: number, reason: string): void {
    const entry = this.leaderboard.get(playerId) || this.createNewEntry(playerId);
    
    entry.score = Math.max(0, entry.score + scoreChange);
    entry.level = this.calculateLevel(entry.score);
    entry.lastActive = new Date();
    
    // Add achievement if applicable
    const achievement = this.checkAchievements(entry);
    if (achievement) {
      entry.achievements.push(achievement);
    }
    
    this.leaderboard.set(playerId, entry);
    console.log(`Player ${playerId} score updated: +${scoreChange} (${reason})`);
  }

  recordGameResult(playerId: string, won: boolean, gameData: any): void {
    const entry = this.leaderboard.get(playerId) || this.createNewEntry(playerId);
    
    entry.gamesPlayed++;
    if (won) {
      entry.wins++;
      this.updatePlayerScore(playerId, 100, 'Game Win');
    } else {
      entry.losses++;
      this.updatePlayerScore(playerId, -10, 'Game Loss');
    }
    
    entry.winRate = entry.gamesPlayed > 0 ? (entry.wins / entry.gamesPlayed) * 100 : 0;
    entry.lastActive = new Date();
    
    // Record game history
    if (!this.gameHistory.has(playerId)) {
      this.gameHistory.set(playerId, []);
    }
    
    const history = this.gameHistory.get(playerId)!;
    history.push({
      ...gameData,
      won,
      timestamp: new Date()
    });
    
    // Keep only last 50 games
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.leaderboard.set(playerId, entry);
  }

  getLeaderboard(limit: number = 10, sortBy: 'score' | 'level' | 'winRate' = 'score'): LeaderboardEntry[] {
    const entries = Array.from(this.leaderboard.values());
    
    entries.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'level':
          return b.level - a.level;
        case 'winRate':
          return b.winRate - a.winRate;
        default:
          return b.score - a.score;
      }
    });
    
    return entries.slice(0, limit);
  }

  getPlayerRank(playerId: string): { rank: number; totalPlayers: number } | null {
    const entries = this.getLeaderboard(1000, 'score');
    const rank = entries.findIndex(entry => entry.playerId === playerId);
    
    if (rank === -1) return null;
    
    return {
      rank: rank + 1,
      totalPlayers: entries.length
    };
  }

  getPlayerStats(playerId: string): LeaderboardEntry | null {
    return this.leaderboard.get(playerId) || null;
  }

  getPlayerHistory(playerId: string, limit: number = 10): any[] {
    const history = this.gameHistory.get(playerId) || [];
    return history.slice(-limit).reverse();
  }

  getTopAchievements(): { achievement: string; count: number }[] {
    const achievementCounts = new Map<string, number>();
    
    for (const entry of this.leaderboard.values()) {
      for (const achievement of entry.achievements) {
        achievementCounts.set(achievement, (achievementCounts.get(achievement) || 0) + 1);
      }
    }
    
    return Array.from(achievementCounts.entries())
      .map(([achievement, count]) => ({ achievement, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  getWeeklyTopPlayers(): LeaderboardEntry[] {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentEntries = Array.from(this.leaderboard.values())
      .filter(entry => entry.lastActive >= weekAgo)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    return recentEntries;
  }

  private createNewEntry(playerId: string): LeaderboardEntry {
    return {
      playerId,
      username: 'Anonymous',
      score: 0,
      level: 1,
      achievements: [],
      lastActive: new Date(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0
    };
  }

  private calculateLevel(score: number): number {
    // Level calculation: every 1000 points = 1 level
    return Math.floor(score / 1000) + 1;
  }

  private checkAchievements(entry: LeaderboardEntry): string | null {
    const achievements = [];
    
    // First win
    if (entry.wins === 1 && !entry.achievements.includes('first_win')) {
      achievements.push('first_win');
    }
    
    // Win streak
    if (entry.wins >= 5 && !entry.achievements.includes('win_streak_5')) {
      achievements.push('win_streak_5');
    }
    
    // High score
    if (entry.score >= 10000 && !entry.achievements.includes('high_score')) {
      achievements.push('high_score');
    }
    
    // Level milestones
    if (entry.level >= 10 && !entry.achievements.includes('level_10')) {
      achievements.push('level_10');
    }
    
    if (entry.level >= 25 && !entry.achievements.includes('level_25')) {
      achievements.push('level_25');
    }
    
    // Win rate achievements
    if (entry.winRate >= 80 && entry.gamesPlayed >= 10 && !entry.achievements.includes('high_win_rate')) {
      achievements.push('high_win_rate');
    }
    
    return achievements.length > 0 ? achievements[0] : null;
  }

  cleanupOldData(): void {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    // Clean up old game history
    for (const [playerId, history] of this.gameHistory.entries()) {
      const recentHistory = history.filter(game => game.timestamp >= monthAgo);
      this.gameHistory.set(playerId, recentHistory);
    }
    
    console.log('Cleaned up old leaderboard data');
  }
}

