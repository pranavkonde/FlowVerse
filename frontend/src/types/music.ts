export interface Instrument {
  id: string;
  name: string;
  type: InstrumentType;
  category: InstrumentCategory;
  soundSet: SoundSet;
  range: {
    min: number;
    max: number;
  };
  tuning: string[];
  effects: InstrumentEffect[];
  requirements: {
    level: number;
    skill?: string;
  };
  stats: InstrumentStats;
}

export type InstrumentType =
  | 'PIANO'
  | 'GUITAR'
  | 'DRUMS'
  | 'VIOLIN'
  | 'FLUTE'
  | 'HARP'
  | 'LUTE'
  | 'HORN'
  | 'BELLS'
  | 'MAGICAL';

export type InstrumentCategory =
  | 'STRINGS'
  | 'PERCUSSION'
  | 'WIND'
  | 'BRASS'
  | 'KEYBOARD'
  | 'MAGICAL';

export interface SoundSet {
  baseUrl: string;
  format: string;
  samples: {
    note: string;
    url: string;
    volume?: number;
    pan?: number;
  }[];
  effects?: {
    name: string;
    url: string;
  }[];
}

export interface InstrumentEffect {
  type: EffectType;
  value: number;
  duration?: number;
  area?: {
    radius: number;
    falloff: number;
  };
}

export type EffectType =
  | 'HEALING'
  | 'BUFF'
  | 'DEBUFF'
  | 'CHARM'
  | 'INSPIRE'
  | 'SOOTHE'
  | 'ENERGIZE'
  | 'MAGICAL';

export interface InstrumentStats {
  power: number;
  resonance: number;
  harmony: number;
  control: number;
  durability: number;
}

export interface Performance {
  id: string;
  playerId: string;
  instrumentId: string;
  song: Song;
  startedAt: string;
  endedAt?: string;
  score?: number;
  accuracy?: number;
  combo?: number;
  effects: PerformanceEffect[];
  audience: string[];
  reactions: Reaction[];
}

export interface Song {
  id: string;
  title: string;
  composer: string;
  difficulty: number;
  duration: number;
  bpm: number;
  notes: Note[];
  sections: Section[];
  effects: SongEffect[];
  requirements: {
    instrument: InstrumentType[];
    level: number;
  };
}

export interface Note {
  time: number;
  pitch: string;
  duration: number;
  velocity: number;
  effects?: NoteEffect[];
}

export interface Section {
  name: string;
  startTime: number;
  endTime: number;
  type: SectionType;
  effects?: SectionEffect[];
}

export type SectionType =
  | 'INTRO'
  | 'VERSE'
  | 'CHORUS'
  | 'BRIDGE'
  | 'SOLO'
  | 'OUTRO';

export interface SongEffect {
  type: EffectType;
  value: number;
  startTime: number;
  duration: number;
  area?: {
    radius: number;
    falloff: number;
  };
}

export interface NoteEffect {
  type: string;
  value: number;
}

export interface SectionEffect {
  type: string;
  value: number;
}

export interface PerformanceEffect {
  type: EffectType;
  value: number;
  targetId?: string;
  startTime: number;
  duration: number;
}

export interface Reaction {
  userId: string;
  type: ReactionType;
  timestamp: string;
}

export type ReactionType =
  | 'APPLAUSE'
  | 'CHEER'
  | 'DANCE'
  | 'ENCORE'
  | 'TIP';

export interface MusicianStats {
  totalPerformances: number;
  instrumentsPlayed: Record<InstrumentType, number>;
  songsLearned: number;
  highestCombo: number;
  averageAccuracy: number;
  totalPlaytime: number;
  audienceReached: number;
  effectsTriggered: number;
  specialAchievements: string[];
}

export interface MusicSettings {
  volume: {
    master: number;
    instruments: number;
    effects: number;
    ambient: number;
  };
  visualEffects: boolean;
  showNoteNames: boolean;
  showTiming: boolean;
  inputLatency: number;
  midiEnabled: boolean;
}