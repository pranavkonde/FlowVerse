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

export interface MiniGameSession {
  id: string;
  userId: string;
  gameId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  level: number;
  isCompleted: boolean;
  data: any; // Game-specific data
}

export interface MemoryGameData {
  cards: Array<{
    id: string;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
  }>;
  moves: number;
  matches: number;
  timeLimit: number;
}

export interface PuzzleGameData {
  pieces: Array<{
    id: string;
    position: { x: number; y: number };
    correctPosition: { x: number; y: number };
    isPlaced: boolean;
  }>;
  moves: number;
  timeLimit: number;
}

export interface ReactionGameData {
  targets: Array<{
    id: string;
    position: { x: number; y: number };
    size: number;
    color: string;
    isActive: boolean;
    appearedAt: Date;
  }>;
  hits: number;
  misses: number;
  averageReactionTime: number;
  timeLimit: number;
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

export const MINI_GAMES: MiniGame[] = [
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

export const MINI_GAME_EVENTS = {
  GAME_STARTED: 'minigame:started',
  GAME_COMPLETED: 'minigame:completed',
  GAME_PAUSED: 'minigame:paused',
  GAME_RESUMED: 'minigame:resumed',
  SCORE_UPDATED: 'minigame:score_updated',
  LEVEL_COMPLETED: 'minigame:level_completed',
  ACHIEVEMENT_UNLOCKED: 'minigame:achievement_unlocked',
  LEADERBOARD_UPDATED: 'minigame:leaderboard_updated'
} as const;

export type MiniGameEventType = typeof MINI_GAME_EVENTS[keyof typeof MINI_GAME_EVENTS];
