export interface Instrument {
  id: string;
  name: string;
  description: string;
  type: 'string' | 'wind' | 'percussion' | 'keyboard';
  soundSet: {
    notes: {
      pitch: string;
      file: string;
    }[];
    effects?: {
      name: string;
      file: string;
    }[];
  };
  playStyle: 'single' | 'chord' | 'sequence';
  difficulty: number;
  skillRequirement: number;
  visualEffects?: {
    animation: string;
    particles?: string;
  };
}

export interface MusicScore {
  id: string;
  title: string;
  composer: string;
  difficulty: number;
  duration: number;
  instruments: string[];
  notes: {
    time: number;
    pitch: string;
    duration: number;
    instrument: string;
    velocity: number;
  }[];
  metadata: {
    genre?: string;
    tags?: string[];
    description?: string;
    thumbnail?: string;
  };
}

export interface Performance {
  id: string;
  userId: string;
  scoreId: string;
  instrumentId: string;
  startTime: Date;
  endTime?: Date;
  accuracy: number;
  rating: number;
  listeners: string[];
  reactions: {
    userId: string;
    type: string;
    timestamp: Date;
  }[];
}

export interface MusicianStats {
  totalPerformances: number;
  averageAccuracy: number;
  bestRating: number;
  totalListeners: number;
  instrumentMastery: Record<string, number>;
  favoriteInstrument?: string;
  performanceHistory: {
    scoreId: string;
    accuracy: number;
    rating: number;
    timestamp: Date;
  }[];
}

export const INSTRUMENT_TYPE_ICONS = {
  string: '🎸',
  wind: '🎺',
  percussion: '🥁',
  keyboard: '🎹'
} as const;

export const INSTRUMENT_DIFFICULTY_LABELS = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Novice',
  4: 'Intermediate',
  5: 'Skilled',
  6: 'Advanced',
  7: 'Expert',
  8: 'Master',
  9: 'Virtuoso',
  10: 'Legendary'
} as const;

export const REACTION_TYPES = {
  applause: '👏',
  bravo: '🎭',
  encore: '⭐',
  amazing: '🌟',
  beautiful: '🎵',
  wow: '😮',
  love: '❤️'
} as const;

export const MASTERY_LEVELS = {
  novice: { min: 0, max: 20, color: 'gray' },
  apprentice: { min: 21, max: 40, color: 'green' },
  adept: { min: 41, max: 60, color: 'blue' },
  expert: { min: 61, max: 80, color: 'purple' },
  master: { min: 81, max: 100, color: 'orange' }
} as const;
