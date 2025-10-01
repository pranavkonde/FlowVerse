export interface PlayerStatistics {
  playerId: string;
  timeframe: string;
  overview: {
    totalPlayTime: number; // hours
    level: number;
    experience: number;
    coins: number;
    achievements: number;
  };
  activity: {
    dailyActive: number; // days this week
    weeklyActive: number; // days this month
    totalSessions: number;
    averageSessionTime: number; // minutes
  };
  performance: {
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    averageScore: number;
    bestScore: number;
  };
  social: {
    friendsCount: number;
    guildMembership: string;
    messagesSent: number;
    tradesCompleted: number;
  };
  progression: {
    questsCompleted: number;
    skillsUnlocked: number;
    itemsCollected: number;
    areasExplored: number;
  };
  lastUpdated: Date;
}

export interface ActivitySummary {
  playerId: string;
  period: string;
  dailyActivity: Array<{
    date: string;
    playTime: number; // hours
    sessions: number;
  }>;
  totalPlayTime: number; // hours
  averageSessionTime: number; // minutes
  mostActiveDay: string;
  leastActiveDay: string;
  streak: number; // days
  lastActivity: Date;
}

export interface PerformanceMetrics {
  playerId: string;
  category: string;
  metrics: {
    accuracy: number;
    speed: number; // actions per minute
    efficiency: number;
    consistency: number;
    improvement: number; // percentage change
  };
  rankings: {
    global: number;
    regional: number;
    friends: number;
  };
  trends: Array<{
    date: string;
    value: number;
  }>;
  lastUpdated: Date;
}

export interface PlayerComparison {
  player1: string;
  player2: string;
  comparison: {
    level: {
      player1: number;
      player2: number;
    };
    experience: {
      player1: number;
      player2: number;
    };
    achievements: {
      player1: number;
      player2: number;
    };
    playTime: {
      player1: number;
      player2: number;
    };
    winRate: {
      player1: number;
      player2: number;
    };
  };
  advantages: string[];
  lastUpdated: Date;
}

export interface AchievementProgress {
  playerId: string;
  totalAchievements: number;
  unlocked: number;
  inProgress: number;
  locked: number;
  recentUnlocks: Array<{
    id: string;
    name: string;
    unlockedAt: Date;
  }>;
  nextMilestones: Array<{
    id: string;
    name: string;
    progress: number;
    target: number;
  }>;
  categories: {
    combat: { unlocked: number; total: number };
    social: { unlocked: number; total: number };
    exploration: { unlocked: number; total: number };
    collection: { unlocked: number; total: number };
    crafting: { unlocked: number; total: number };
  };
  lastUpdated: Date;
}

export interface StatisticsUpdate {
  category: string;
  value: number;
  metadata?: any;
  timestamp: Date;
}
