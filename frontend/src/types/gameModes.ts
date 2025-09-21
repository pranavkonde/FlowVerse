export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  maxPlayers: number;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  rules: string[];
  objectives: GameObjective[];
  rewards: GameReward[];
  isActive: boolean;
  createdAt: Date;
}

export interface GameObjective {
  id: string;
  description: string;
  type: 'collect' | 'reach' | 'survive' | 'compete' | 'explore';
  target: number;
  current: number;
  points: number;
  isCompleted: boolean;
}

export interface GameReward {
  type: 'points' | 'achievement' | 'item' | 'currency';
  value: number;
  itemId?: string;
  achievementId?: string;
}

export interface GameSession {
  id: string;
  modeId: string;
  players: string[];
  startTime: Date;
  endTime?: Date;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  score: number;
  objectives: GameObjective[];
  leaderboard: PlayerScore[];
}

export interface PlayerScore {
  userId: string;
  username: string;
  score: number;
  rank: number;
  objectivesCompleted: number;
  timeSpent: number;
}

export const GAME_MODES: GameMode[] = [
  {
    id: 'exploration',
    name: 'Exploration Mode',
    description: 'Discover the NYC skyline and find hidden treasures',
    icon: '🗺️',
    color: 'blue',
    maxPlayers: 20,
    duration: 30,
    difficulty: 'easy',
    rules: [
      'Explore different areas of the map',
      'Collect hidden treasures',
      'Avoid obstacles and traps',
      'Help other players when possible'
    ],
    objectives: [
      {
        id: 'explore_areas',
        description: 'Visit 10 different areas',
        type: 'explore',
        target: 10,
        current: 0,
        points: 100,
        isCompleted: false
      },
      {
        id: 'collect_treasures',
        description: 'Collect 25 treasures',
        type: 'collect',
        target: 25,
        current: 0,
        points: 200,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'points', value: 500 },
      { type: 'achievement', achievementId: 'explorer' }
    ],
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'treasure_hunt',
    name: 'Treasure Hunt',
    description: 'Race against time to find the legendary treasure',
    icon: '💰',
    color: 'yellow',
    maxPlayers: 10,
    duration: 15,
    difficulty: 'medium',
    rules: [
      'Find clues scattered around the map',
      'Solve puzzles to unlock new areas',
      'Race against other players',
      'First to find the treasure wins'
    ],
    objectives: [
      {
        id: 'find_clues',
        description: 'Find 5 clues',
        type: 'collect',
        target: 5,
        current: 0,
        points: 150,
        isCompleted: false
      },
      {
        id: 'solve_puzzles',
        description: 'Solve 3 puzzles',
        type: 'reach',
        target: 3,
        current: 0,
        points: 300,
        isCompleted: false
      },
      {
        id: 'find_treasure',
        description: 'Find the legendary treasure',
        type: 'reach',
        target: 1,
        current: 0,
        points: 1000,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'points', value: 1000 },
      { type: 'achievement', achievementId: 'treasure_hunter' },
      { type: 'item', itemId: 'legendary_treasure' }
    ],
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'survival',
    name: 'Survival Mode',
    description: 'Survive as long as possible in the dangerous city',
    icon: '⚔️',
    color: 'red',
    maxPlayers: 15,
    duration: 20,
    difficulty: 'hard',
    rules: [
      'Avoid dangerous areas',
      'Collect resources to survive',
      'Help other players to gain points',
      'Last player standing wins'
    ],
    objectives: [
      {
        id: 'survive_time',
        description: 'Survive for 15 minutes',
        type: 'survive',
        target: 15,
        current: 0,
        points: 500,
        isCompleted: false
      },
      {
        id: 'collect_resources',
        description: 'Collect 50 resources',
        type: 'collect',
        target: 50,
        current: 0,
        points: 300,
        isCompleted: false
      },
      {
        id: 'help_players',
        description: 'Help 5 other players',
        type: 'reach',
        target: 5,
        current: 0,
        points: 200,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'points', value: 800 },
      { type: 'achievement', achievementId: 'survivor' }
    ],
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'trading_competition',
    name: 'Trading Competition',
    description: 'Compete in DeFi trading to earn the most profit',
    icon: '📈',
    color: 'green',
    maxPlayers: 8,
    duration: 25,
    difficulty: 'expert',
    rules: [
      'Start with 1000 FLOW tokens',
      'Make profitable trades',
      'Use DeFi agents for trading',
      'Highest profit wins'
    ],
    objectives: [
      {
        id: 'make_trades',
        description: 'Complete 10 trades',
        type: 'reach',
        target: 10,
        current: 0,
        points: 200,
        isCompleted: false
      },
      {
        id: 'earn_profit',
        description: 'Earn 500 FLOW profit',
        type: 'reach',
        target: 500,
        current: 0,
        points: 1000,
        isCompleted: false
      },
      {
        id: 'use_agents',
        description: 'Use 5 different DeFi agents',
        type: 'reach',
        target: 5,
        current: 0,
        points: 300,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'points', value: 1500 },
      { type: 'achievement', achievementId: 'trading_master' },
      { type: 'currency', value: 100 }
    ],
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'social_challenge',
    name: 'Social Challenge',
    description: 'Complete social tasks and make new friends',
    icon: '👥',
    color: 'purple',
    maxPlayers: 25,
    duration: 20,
    difficulty: 'easy',
    rules: [
      'Make new friends',
      'Send messages to other players',
      'Participate in group activities',
      'Be helpful and friendly'
    ],
    objectives: [
      {
        id: 'make_friends',
        description: 'Make 3 new friends',
        type: 'reach',
        target: 3,
        current: 0,
        points: 300,
        isCompleted: false
      },
      {
        id: 'send_messages',
        description: 'Send 20 messages',
        type: 'reach',
        target: 20,
        current: 0,
        points: 200,
        isCompleted: false
      },
      {
        id: 'group_activities',
        description: 'Participate in 5 group activities',
        type: 'reach',
        target: 5,
        current: 0,
        points: 250,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'points', value: 750 },
      { type: 'achievement', achievementId: 'social_butterfly' }
    ],
    isActive: true,
    createdAt: new Date()
  }
];
