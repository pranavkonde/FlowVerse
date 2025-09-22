import { LeaderboardEntry, LeaderboardCategory, LeaderboardTimeframe } from '../types/leaderboard';

class LeaderboardService {
  private leaderboard: LeaderboardEntry[] = [];
  private categories: LeaderboardCategory[] = [];
  private timeframes: LeaderboardTimeframe[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock leaderboard data
    this.leaderboard = [
      {
        id: '1',
        rank: 1,
        username: 'CryptoKing',
        avatar: '👑',
        score: 125000,
        level: 45,
        guild: 'Crypto Warriors',
        achievements: 28,
        gamesPlayed: 156,
        winRate: 87.5,
        lastActive: new Date(),
        isOnline: true,
        badges: ['legendary', 'trader', 'explorer'],
        category: 'overall',
        timeframe: 'all',
        experience: 45000,
        coins: 25000,
        nfts: 45,
        friends: 89,
        guildRank: 1,
        weeklyScore: 5000,
        monthlyScore: 20000,
        totalPlayTime: 1200, // in hours
        favoriteGameMode: 'trading',
        joinDate: new Date('2024-01-15'),
        lastLogin: new Date(),
        streak: 15,
        maxStreak: 30,
        totalTrades: 234,
        successfulTrades: 198,
        reputation: 95,
        socialScore: 78,
        explorationScore: 92,
        combatScore: 85,
        tradingScore: 98
      },
      {
        id: '2',
        rank: 2,
        username: 'FlowMaster',
        avatar: '⚡',
        score: 118000,
        level: 42,
        guild: 'Flow Explorers',
        achievements: 25,
        gamesPlayed: 142,
        winRate: 82.3,
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
        isOnline: true,
        badges: ['epic', 'trader', 'social'],
        category: 'overall',
        timeframe: 'all',
        experience: 42000,
        coins: 22000,
        nfts: 38,
        friends: 76,
        guildRank: 2,
        weeklyScore: 4800,
        monthlyScore: 18500,
        totalPlayTime: 1100,
        favoriteGameMode: 'exploration',
        joinDate: new Date('2024-01-20'),
        lastLogin: new Date(Date.now() - 30 * 60 * 1000),
        streak: 12,
        maxStreak: 25,
        totalTrades: 189,
        successfulTrades: 156,
        reputation: 88,
        socialScore: 85,
        explorationScore: 95,
        combatScore: 78,
        tradingScore: 82
      }
    ];

    // Mock categories
    this.categories = [
      { id: 'overall', name: 'Overall', description: 'Total score across all activities' },
      { id: 'weekly', name: 'Weekly', description: 'Score for the current week' },
      { id: 'monthly', name: 'Monthly', description: 'Score for the current month' },
      { id: 'guilds', name: 'Guilds', description: 'Guild-based rankings' },
      { id: 'trading', name: 'Trading', description: 'Trading performance rankings' },
      { id: 'exploration', name: 'Exploration', description: 'Exploration achievements' },
      { id: 'social', name: 'Social', description: 'Social interaction rankings' },
      { id: 'combat', name: 'Combat', description: 'Combat performance rankings' }
    ];

    // Mock timeframes
    this.timeframes = [
      { id: 'all', name: 'All Time', description: 'All-time rankings' },
      { id: 'week', name: 'This Week', description: 'Current week rankings' },
      { id: 'month', name: 'This Month', description: 'Current month rankings' },
      { id: 'year', name: 'This Year', description: 'Current year rankings' }
    ];
  }

  // Get leaderboard entries
  getLeaderboard(category: string = 'overall', timeframe: string = 'all', limit: number = 100): LeaderboardEntry[] {
    let filteredEntries = this.leaderboard.filter(entry => 
      entry.category === category && entry.timeframe === timeframe
    );

    // Sort by score (descending)
    filteredEntries.sort((a, b) => b.score - a.score);

    // Update ranks
    filteredEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return filteredEntries.slice(0, limit);
  }

  // Get player rank
  getPlayerRank(playerId: string, category: string = 'overall', timeframe: string = 'all'): number {
    const leaderboard = this.getLeaderboard(category, timeframe);
    const player = leaderboard.find(entry => entry.id === playerId);
    return player ? player.rank : -1;
  }

  // Get player statistics
  getPlayerStats(playerId: string): LeaderboardEntry | null {
    return this.leaderboard.find(entry => entry.id === playerId) || null;
  }

  // Update player score
  updatePlayerScore(playerId: string, scoreDelta: number, category: string = 'overall'): boolean {
    const player = this.leaderboard.find(entry => entry.id === playerId);
    if (!player) return false;

    player.score += scoreDelta;
    player.lastActive = new Date();
    player.isOnline = true;

    // Update category-specific scores
    switch (category) {
      case 'weekly':
        player.weeklyScore += scoreDelta;
        break;
      case 'monthly':
        player.monthlyScore += scoreDelta;
        break;
      case 'trading':
        player.tradingScore += scoreDelta;
        break;
      case 'exploration':
        player.explorationScore += scoreDelta;
        break;
      case 'social':
        player.socialScore += scoreDelta;
        break;
      case 'combat':
        player.combatScore += scoreDelta;
        break;
    }

    return true;
  }

  // Add player to leaderboard
  addPlayer(player: Omit<LeaderboardEntry, 'id' | 'rank' | 'lastActive' | 'isOnline'>): string {
    const newPlayer: LeaderboardEntry = {
      ...player,
      id: `player_${Date.now()}`,
      rank: 0,
      lastActive: new Date(),
      isOnline: true
    };

    this.leaderboard.push(newPlayer);
    return newPlayer.id;
  }

  // Update player status
  updatePlayerStatus(playerId: string, isOnline: boolean): boolean {
    const player = this.leaderboard.find(entry => entry.id === playerId);
    if (!player) return false;

    player.isOnline = isOnline;
    player.lastActive = new Date();
    return true;
  }

  // Get categories
  getCategories(): LeaderboardCategory[] {
    return this.categories;
  }

  // Get timeframes
  getTimeframes(): LeaderboardTimeframe[] {
    return this.timeframes;
  }

  // Get leaderboard statistics
  getLeaderboardStats(): {
    totalPlayers: number;
    onlinePlayers: number;
    averageScore: number;
    topGuild: string;
    mostActiveCategory: string;
    averageLevel: number;
    totalGamesPlayed: number;
    averageWinRate: number;
  } {
    const totalPlayers = this.leaderboard.length;
    const onlinePlayers = this.leaderboard.filter(entry => entry.isOnline).length;
    const averageScore = this.leaderboard.reduce((sum, entry) => sum + entry.score, 0) / totalPlayers;
    
    // Find top guild
    const guildScores = this.leaderboard.reduce((acc, entry) => {
      if (entry.guild) {
        acc[entry.guild] = (acc[entry.guild] || 0) + entry.score;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const topGuild = Object.entries(guildScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    // Find most active category
    const categoryCounts = this.leaderboard.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostActiveCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'overall';
    
    const averageLevel = this.leaderboard.reduce((sum, entry) => sum + entry.level, 0) / totalPlayers;
    const totalGamesPlayed = this.leaderboard.reduce((sum, entry) => sum + entry.gamesPlayed, 0);
    const averageWinRate = this.leaderboard.reduce((sum, entry) => sum + entry.winRate, 0) / totalPlayers;

    return {
      totalPlayers,
      onlinePlayers,
      averageScore,
      topGuild,
      mostActiveCategory,
      averageLevel,
      totalGamesPlayed,
      averageWinRate
    };
  }

  // Get guild leaderboard
  getGuildLeaderboard(limit: number = 50): Array<{
    guildName: string;
    totalScore: number;
    memberCount: number;
    averageScore: number;
    topPlayer: string;
    rank: number;
  }> {
    const guildScores = this.leaderboard.reduce((acc, entry) => {
      if (entry.guild) {
        if (!acc[entry.guild]) {
          acc[entry.guild] = {
            totalScore: 0,
            memberCount: 0,
            members: []
          };
        }
        acc[entry.guild].totalScore += entry.score;
        acc[entry.guild].memberCount += 1;
        acc[entry.guild].members.push(entry);
      }
      return acc;
    }, {} as Record<string, { totalScore: number; memberCount: number; members: LeaderboardEntry[] }>);

    const guildLeaderboard = Object.entries(guildScores)
      .map(([guildName, data]) => ({
        guildName,
        totalScore: data.totalScore,
        memberCount: data.memberCount,
        averageScore: data.totalScore / data.memberCount,
        topPlayer: data.members.sort((a, b) => b.score - a.score)[0]?.username || 'Unknown',
        rank: 0
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    // Update ranks
    guildLeaderboard.forEach((guild, index) => {
      guild.rank = index + 1;
    });

    return guildLeaderboard.slice(0, limit);
  }

  // Search players
  searchPlayers(query: string, limit: number = 20): LeaderboardEntry[] {
    const searchQuery = query.toLowerCase();
    return this.leaderboard
      .filter(entry => 
        entry.username.toLowerCase().includes(searchQuery) ||
        entry.guild?.toLowerCase().includes(searchQuery) ||
        entry.badges.some(badge => badge.toLowerCase().includes(searchQuery))
      )
      .slice(0, limit);
  }
}

export const leaderboardService = new LeaderboardService();