import { MiniGame, MiniGameScore, MiniGameLeaderboard, MiniGameStats } from '../types/minigames';

export class MiniGameService {
  private games: Map<string, MiniGame> = new Map();
  private scores: Map<string, MiniGameScore[]> = new Map(); // gameId -> scores
  private leaderboards: Map<string, MiniGameLeaderboard> = new Map();
  private userStats: Map<string, MiniGameStats> = new Map(); // userId -> stats

  constructor() {
    this.initializeGames();
  }

  private initializeGames(): void {
    const games: MiniGame[] = [
      {
        id: 'memory-classic',
        name: 'Memory Match',
        description: 'Match pairs of cards to test your memory',
        type: 'memory',
        difficulty: 'easy',
        duration: 120,
        maxScore: 1000,
        icon: '🧠',
        isActive: true,
        rewards: {
          tokens: 10,
          experience: 50,
          achievements: ['memory-master', 'quick-thinker']
        }
      },
      {
        id: 'puzzle-sliding',
        name: 'Sliding Puzzle',
        description: 'Arrange the tiles in the correct order',
        type: 'puzzle',
        difficulty: 'medium',
        duration: 180,
        maxScore: 1500,
        icon: '🧩',
        isActive: true,
        rewards: {
          tokens: 15,
          experience: 75,
          achievements: ['puzzle-solver', 'strategic-mind']
        }
      },
      {
        id: 'reaction-click',
        name: 'Reaction Test',
        description: 'Click targets as fast as you can',
        type: 'reaction',
        difficulty: 'easy',
        duration: 60,
        maxScore: 800,
        icon: '⚡',
        isActive: true,
        rewards: {
          tokens: 8,
          experience: 40,
          achievements: ['lightning-fast', 'quick-reflexes']
        }
      },
      {
        id: 'trivia-crypto',
        name: 'Crypto Trivia',
        description: 'Test your knowledge of blockchain and crypto',
        type: 'trivia',
        difficulty: 'hard',
        duration: 300,
        maxScore: 2000,
        icon: '₿',
        isActive: true,
        rewards: {
          tokens: 25,
          experience: 100,
          achievements: ['crypto-expert', 'blockchain-scholar']
        }
      }
    ];

    games.forEach(game => {
      this.games.set(game.id, game);
      this.scores.set(game.id, []);
    });
  }

  public getGames(): MiniGame[] {
    return Array.from(this.games.values()).filter(game => game.isActive);
  }

  public getGame(gameId: string): MiniGame | undefined {
    return this.games.get(gameId);
  }

  public submitScore(score: MiniGameScore): MiniGameScore {
    const game = this.games.get(score.gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Validate score
    if (score.score < 0 || score.score > game.maxScore) {
      throw new Error('Invalid score');
    }

    // Add timestamp if not provided
    if (!score.timestamp) {
      score.timestamp = new Date();
    }

    // Check if it's a high score
    const existingScores = this.scores.get(score.gameId) || [];
    const isHighScore = existingScores.length === 0 || score.score > Math.max(...existingScores.map(s => s.score));
    score.isHighScore = isHighScore;

    // Add score
    existingScores.push(score);
    existingScores.sort((a, b) => b.score - a.score); // Sort by score descending
    this.scores.set(score.gameId, existingScores);

    // Update leaderboard
    this.updateLeaderboard(score.gameId);

    // Update user stats
    this.updateUserStats(score);

    return score;
  }

  public getScores(gameId: string, limit: number = 10): MiniGameScore[] {
    const scores = this.scores.get(gameId) || [];
    return scores.slice(0, limit);
  }

  public getLeaderboard(gameId: string): MiniGameLeaderboard | undefined {
    return this.leaderboards.get(gameId);
  }

  public getAllLeaderboards(): MiniGameLeaderboard[] {
    return Array.from(this.leaderboards.values());
  }

  public getUserStats(userId: string): MiniGameStats {
    return this.userStats.get(userId) || {
      totalGamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      bestScores: {},
      achievements: [],
      timeSpent: 0,
      winRate: 0
    };
  }

  public getBestScore(gameId: string, userId?: string): number {
    if (userId) {
      const userStats = this.userStats.get(userId);
      return userStats?.bestScores[gameId] || 0;
    }

    const scores = this.scores.get(gameId) || [];
    return scores.length > 0 ? scores[0].score : 0;
  }

  public getRank(gameId: string, score: number): number {
    const scores = this.scores.get(gameId) || [];
    const betterScores = scores.filter(s => s.score > score).length;
    return betterScores + 1;
  }

  public getTopPlayers(limit: number = 10): Array<{ userId: string; totalScore: number; gamesPlayed: number }> {
    const playerStats = new Map<string, { totalScore: number; gamesPlayed: number }>();

    // Aggregate scores by user
    this.scores.forEach((scores) => {
      scores.forEach(score => {
        const existing = playerStats.get(score.userId) || { totalScore: 0, gamesPlayed: 0 };
        existing.totalScore += score.score;
        existing.gamesPlayed += 1;
        playerStats.set(score.userId, existing);
      });
    });

    // Sort by total score and return top players
    return Array.from(playerStats.entries())
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);
  }

  public getGameStats(gameId: string): {
    totalPlayers: number;
    totalGames: number;
    averageScore: number;
    highScore: number;
    completionRate: number;
  } {
    const scores = this.scores.get(gameId) || [];
    const game = this.games.get(gameId);
    
    if (!game || scores.length === 0) {
      return {
        totalPlayers: 0,
        totalGames: 0,
        averageScore: 0,
        highScore: 0,
        completionRate: 0
      };
    }

    const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
    const uniquePlayers = new Set(scores.map(score => score.userId)).size;
    const completedGames = scores.filter(score => score.score > 0).length;

    return {
      totalPlayers: uniquePlayers,
      totalGames: scores.length,
      averageScore: Math.round(totalScore / scores.length),
      highScore: scores[0]?.score || 0,
      completionRate: Math.round((completedGames / scores.length) * 100)
    };
  }

  private updateLeaderboard(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    const scores = this.scores.get(gameId) || [];
    const topScores = scores.slice(0, 10); // Top 10

    const leaderboard: MiniGameLeaderboard = {
      gameId,
      gameName: game.name,
      scores: topScores,
      timeRange: 'all-time',
      lastUpdated: new Date()
    };

    this.leaderboards.set(gameId, leaderboard);
  }

  private updateUserStats(score: MiniGameScore): void {
    const existingStats = this.userStats.get(score.userId) || {
      totalGamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      bestScores: {},
      achievements: [],
      timeSpent: 0,
      winRate: 0
    };

    // Update basic stats
    existingStats.totalGamesPlayed++;
    existingStats.totalScore += score.score;
    existingStats.averageScore = Math.round(existingStats.totalScore / existingStats.totalGamesPlayed);

    // Update best score for this game
    const currentBest = existingStats.bestScores[score.gameId] || 0;
    if (score.score > currentBest) {
      existingStats.bestScores[score.gameId] = score.score;
    }

    // Update time spent (rough estimate)
    existingStats.timeSpent += score.time / 60; // Convert to minutes

    // Update win rate (simplified - consider high score as win)
    const gameScores = this.scores.get(score.gameId) || [];
    const userGameScores = gameScores.filter(s => s.userId === score.userId);
    const highScores = userGameScores.filter(s => s.isHighScore).length;
    existingStats.winRate = userGameScores.length > 0 ? Math.round((highScores / userGameScores.length) * 100) : 0;

    this.userStats.set(score.userId, existingStats);
  }

  public resetGameData(gameId: string): void {
    this.scores.set(gameId, []);
    this.leaderboards.delete(gameId);
  }

  public resetUserData(userId: string): void {
    this.userStats.delete(userId);
    
    // Remove user's scores from all games
    this.scores.forEach((scores, gameId) => {
      const filteredScores = scores.filter(score => score.userId !== userId);
      this.scores.set(gameId, filteredScores);
      this.updateLeaderboard(gameId);
    });
  }

  public getGlobalStats(): {
    totalGames: number;
    totalPlayers: number;
    totalScores: number;
    averageScore: number;
    mostPopularGame: string;
  } {
    let totalScores = 0;
    let totalScoreSum = 0;
    let mostPopularGame = '';
    let maxGames = 0;

    this.scores.forEach((scores, gameId) => {
      totalScores += scores.length;
      totalScoreSum += scores.reduce((sum, score) => sum + score.score, 0);
      
      if (scores.length > maxGames) {
        maxGames = scores.length;
        mostPopularGame = this.games.get(gameId)?.name || gameId;
      }
    });

    const uniquePlayers = new Set<string>();
    this.scores.forEach(scores => {
      scores.forEach(score => uniquePlayers.add(score.userId));
    });

    return {
      totalGames: this.games.size,
      totalPlayers: uniquePlayers.size,
      totalScores,
      averageScore: totalScores > 0 ? Math.round(totalScoreSum / totalScores) : 0,
      mostPopularGame
    };
  }
}
