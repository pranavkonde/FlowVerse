export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  score: number;
  level: number;
  guild?: string;
  achievements: number;
  gamesPlayed: number;
  winRate: number;
  lastActive: Date;
  isOnline: boolean;
  badges: string[];
  category: string;
  timeframe: string;
  experience: number;
  coins: number;
  nfts: number;
  friends: number;
  guildRank: number;
  weeklyScore: number;
  monthlyScore: number;
  totalPlayTime: number; // in hours
  favoriteGameMode: string;
  joinDate: Date;
  lastLogin: Date;
  streak: number;
  maxStreak: number;
  totalTrades: number;
  successfulTrades: number;
  reputation: number;
  socialScore: number;
  explorationScore: number;
  combatScore: number;
  tradingScore: number;
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
}

export interface LeaderboardTimeframe {
  id: string;
  name: string;
  description: string;
}

export interface LeaderboardStats {
  totalPlayers: number;
  onlinePlayers: number;
  averageScore: number;
  topGuild: string;
  mostActiveCategory: string;
  averageLevel: number;
  totalGamesPlayed: number;
  averageWinRate: number;
}

export interface GuildLeaderboardEntry {
  guildName: string;
  totalScore: number;
  memberCount: number;
  averageScore: number;
  topPlayer: string;
  rank: number;
}

export interface PlayerSearchResult {
  id: string;
  username: string;
  avatar: string;
  level: number;
  guild?: string;
  score: number;
  rank: number;
  isOnline: boolean;
  badges: string[];
}
