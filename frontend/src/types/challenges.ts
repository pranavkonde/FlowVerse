export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'combat' | 'collection' | 'social' | 'exploration' | 'crafting';
  requirement: {
    type: string;
    target: number;
    current?: number;
  };
  rewards: {
    tokens: number;
    items: string[];
    experience: number;
  };
  startTime: Date;
  endTime: Date;
}

export interface UserChallengeProgress {
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  completedAt?: Date;
}
