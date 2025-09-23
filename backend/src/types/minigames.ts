export interface MiniGame {
  id: string;
  name: string;
  description: string;
  type: 'memory' | 'puzzle' | 'reaction' | 'trivia' | 'arcade';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in seconds
  maxScore: number;
  icon: string;
  isActive: boolean;
  rewards: {
    tokens: number;
    experience: number;
    achievements?: string[];
  };
}

export interface MiniGameScore {
  id: string;
  userId: string;
  username: string;
  gameId: string;
  score: number;
  time: number; // completion time in seconds
  accuracy?: number; // percentage
  level: number;
  timestamp: Date;
  isHighScore: boolean;
}

export interface MiniGameLeaderboard {
  gameId: string;
  gameName: string;
  scores: MiniGameScore[];
  timeRange: 'daily' | 'weekly' | 'monthly' | 'all-time';
  lastUpdated: Date;
}

export interface MiniGameStats {
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScores: Record<string, number>; // gameId -> best score
  achievements: string[];
  timeSpent: number; // in minutes
  winRate: number;
}
