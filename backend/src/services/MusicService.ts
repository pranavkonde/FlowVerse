import { EventEmitter } from 'events';

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
  difficulty: number; // 1-10
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

export class MusicService extends EventEmitter {
  private static instance: MusicService;
  private instruments: Map<string, Instrument> = new Map();
  private scores: Map<string, MusicScore> = new Map();
  private performances: Map<string, Performance> = new Map();
  private userStats: Map<string, MusicianStats> = new Map();
  private activePerformers: Map<string, string> = new Map(); // userId -> performanceId

  private readonly DEFAULT_INSTRUMENTS: Instrument[] = [
    {
      id: 'acoustic_guitar',
      name: 'Acoustic Guitar',
      description: 'A classic wooden guitar with warm, rich tones',
      type: 'string',
      soundSet: {
        notes: [
          { pitch: 'E2', file: 'guitar_e2.mp3' },
          { pitch: 'A2', file: 'guitar_a2.mp3' },
          { pitch: 'D3', file: 'guitar_d3.mp3' },
          { pitch: 'G3', file: 'guitar_g3.mp3' },
          { pitch: 'B3', file: 'guitar_b3.mp3' },
          { pitch: 'E4', file: 'guitar_e4.mp3' }
        ],
        effects: [
          { name: 'strum', file: 'guitar_strum.mp3' },
          { name: 'harmonic', file: 'guitar_harmonic.mp3' }
        ]
      },
      playStyle: 'chord',
      difficulty: 3,
      skillRequirement: 1,
      visualEffects: {
        animation: 'guitar_play',
        particles: 'music_notes'
      }
    },
    {
      id: 'flute',
      name: 'Wooden Flute',
      description: 'A delicate wind instrument with a pure, airy sound',
      type: 'wind',
      soundSet: {
        notes: [
          { pitch: 'C4', file: 'flute_c4.mp3' },
          { pitch: 'D4', file: 'flute_d4.mp3' },
          { pitch: 'E4', file: 'flute_e4.mp3' },
          { pitch: 'F4', file: 'flute_f4.mp3' },
          { pitch: 'G4', file: 'flute_g4.mp3' },
          { pitch: 'A4', file: 'flute_a4.mp3' },
          { pitch: 'B4', file: 'flute_b4.mp3' },
          { pitch: 'C5', file: 'flute_c5.mp3' }
        ]
      },
      playStyle: 'single',
      difficulty: 4,
      skillRequirement: 2,
      visualEffects: {
        animation: 'flute_play',
        particles: 'wind_notes'
      }
    },
    {
      id: 'drums',
      name: 'Drum Set',
      description: 'A complete set of percussion instruments',
      type: 'percussion',
      soundSet: {
        notes: [
          { pitch: 'kick', file: 'drums_kick.mp3' },
          { pitch: 'snare', file: 'drums_snare.mp3' },
          { pitch: 'hihat', file: 'drums_hihat.mp3' },
          { pitch: 'crash', file: 'drums_crash.mp3' },
          { pitch: 'tom1', file: 'drums_tom1.mp3' },
          { pitch: 'tom2', file: 'drums_tom2.mp3' }
        ],
        effects: [
          { name: 'roll', file: 'drums_roll.mp3' }
        ]
      },
      playStyle: 'sequence',
      difficulty: 5,
      skillRequirement: 3,
      visualEffects: {
        animation: 'drums_play',
        particles: 'impact_notes'
      }
    },
    {
      id: 'piano',
      name: 'Grand Piano',
      description: 'A majestic keyboard instrument with rich, dynamic sound',
      type: 'keyboard',
      soundSet: {
        notes: [
          { pitch: 'C3', file: 'piano_c3.mp3' },
          { pitch: 'D3', file: 'piano_d3.mp3' },
          { pitch: 'E3', file: 'piano_e3.mp3' },
          { pitch: 'F3', file: 'piano_f3.mp3' },
          { pitch: 'G3', file: 'piano_g3.mp3' },
          { pitch: 'A3', file: 'piano_a3.mp3' },
          { pitch: 'B3', file: 'piano_b3.mp3' },
          { pitch: 'C4', file: 'piano_c4.mp3' }
        ]
      },
      playStyle: 'chord',
      difficulty: 6,
      skillRequirement: 4,
      visualEffects: {
        animation: 'piano_play',
        particles: 'elegant_notes'
      }
    }
  ];

  private readonly DEFAULT_SCORES: MusicScore[] = [
    {
      id: 'simple_melody',
      title: 'Simple Melody',
      composer: 'Tutorial Master',
      difficulty: 1,
      duration: 30000, // 30 seconds
      instruments: ['acoustic_guitar', 'flute'],
      notes: [
        { time: 0, pitch: 'E4', duration: 500, instrument: 'flute', velocity: 80 },
        { time: 500, pitch: 'G4', duration: 500, instrument: 'flute', velocity: 80 },
        { time: 1000, pitch: 'E4', duration: 500, instrument: 'flute', velocity: 80 }
        // Add more notes as needed
      ],
      metadata: {
        genre: 'Tutorial',
        tags: ['beginner', 'practice'],
        description: 'A simple melody for beginners to practice with'
      }
    },
    {
      id: 'forest_dance',
      title: 'Forest Dance',
      composer: 'Nature Bard',
      difficulty: 3,
      duration: 60000, // 60 seconds
      instruments: ['flute', 'drums'],
      notes: [
        { time: 0, pitch: 'C4', duration: 500, instrument: 'flute', velocity: 90 },
        { time: 0, pitch: 'kick', duration: 250, instrument: 'drums', velocity: 100 }
        // Add more notes as needed
      ],
      metadata: {
        genre: 'Folk',
        tags: ['nature', 'upbeat'],
        description: 'A lively tune inspired by forest festivities'
      }
    }
  ];

  private constructor() {
    super();
    this.initializeInstruments();
    this.initializeScores();
  }

  static getInstance(): MusicService {
    if (!MusicService.instance) {
      MusicService.instance = new MusicService();
    }
    return MusicService.instance;
  }

  private initializeInstruments() {
    this.DEFAULT_INSTRUMENTS.forEach(instrument => this.instruments.set(instrument.id, instrument));
  }

  private initializeScores() {
    this.DEFAULT_SCORES.forEach(score => this.scores.set(score.id, score));
  }

  async startPerformance(
    userId: string,
    scoreId: string,
    instrumentId: string
  ): Promise<Performance> {
    const score = this.scores.get(scoreId);
    const instrument = this.instruments.get(instrumentId);

    if (!score || !instrument) {
      throw new Error('Invalid score or instrument');
    }

    if (!score.instruments.includes(instrumentId)) {
      throw new Error('This instrument is not used in this score');
    }

    const stats = await this.getStats(userId);
    if (stats.instrumentMastery[instrumentId] || 0 < instrument.skillRequirement) {
      throw new Error('Insufficient skill level for this instrument');
    }

    // End any existing performance
    const existingPerformanceId = this.activePerformers.get(userId);
    if (existingPerformanceId) {
      await this.endPerformance(existingPerformanceId);
    }

    const performance: Performance = {
      id: crypto.randomUUID(),
      userId,
      scoreId,
      instrumentId,
      startTime: new Date(),
      accuracy: 0,
      rating: 0,
      listeners: [],
      reactions: []
    };

    this.performances.set(performance.id, performance);
    this.activePerformers.set(userId, performance.id);

    this.emit('performanceStarted', performance);
    return performance;
  }

  async playNote(
    performanceId: string,
    note: {
      pitch: string;
      velocity: number;
      timestamp: number;
    }
  ): Promise<void> {
    const performance = this.performances.get(performanceId);
    if (!performance || performance.endTime) {
      throw new Error('Invalid or ended performance');
    }

    const score = this.scores.get(performance.scoreId);
    if (!score) {
      throw new Error('Score not found');
    }

    // Find the closest matching note in the score
    const expectedNote = score.notes.find(n =>
      n.instrument === performance.instrumentId &&
      Math.abs(n.time - note.timestamp) < 200 && // 200ms window
      n.pitch === note.pitch
    );

    if (expectedNote) {
      // Calculate accuracy based on timing and velocity
      const timingDiff = Math.abs(expectedNote.time - note.timestamp);
      const velocityDiff = Math.abs(expectedNote.velocity - note.velocity);
      const accuracy = Math.max(0, 100 - (timingDiff / 2) - (velocityDiff / 2));

      // Update performance accuracy
      performance.accuracy = (performance.accuracy + accuracy) / 2;
      this.performances.set(performanceId, performance);
    }

    this.emit('notePlayed', {
      performanceId,
      note,
      accuracy: expectedNote ? performance.accuracy : 0
    });
  }

  async endPerformance(performanceId: string): Promise<Performance> {
    const performance = this.performances.get(performanceId);
    if (!performance || performance.endTime) {
      throw new Error('Invalid or already ended performance');
    }

    performance.endTime = new Date();

    // Calculate final rating based on accuracy and listeners
    performance.rating = Math.min(
      100,
      performance.accuracy +
      (performance.listeners.length * 5) +
      (performance.reactions.length * 2)
    );

    this.performances.set(performanceId, performance);
    this.activePerformers.delete(performance.userId);

    // Update stats
    await this.updateStats(performance);

    this.emit('performanceEnded', performance);
    return performance;
  }

  async listenToPerformance(performanceId: string, listenerId: string): Promise<void> {
    const performance = this.performances.get(performanceId);
    if (!performance || performance.endTime) {
      throw new Error('Invalid or ended performance');
    }

    if (!performance.listeners.includes(listenerId)) {
      performance.listeners.push(listenerId);
      this.performances.set(performanceId, performance);
      this.emit('listenerJoined', { performanceId, listenerId });
    }
  }

  async addReaction(
    performanceId: string,
    userId: string,
    type: string
  ): Promise<void> {
    const performance = this.performances.get(performanceId);
    if (!performance || performance.endTime) {
      throw new Error('Invalid or ended performance');
    }

    const reaction = {
      userId,
      type,
      timestamp: new Date()
    };

    performance.reactions.push(reaction);
    this.performances.set(performanceId, performance);
    this.emit('reactionAdded', { performanceId, reaction });
  }

  private async updateStats(performance: Performance) {
    let stats = this.userStats.get(performance.userId);
    if (!stats) {
      stats = {
        totalPerformances: 0,
        averageAccuracy: 0,
        bestRating: 0,
        totalListeners: 0,
        instrumentMastery: {},
        performanceHistory: []
      };
    }

    // Update general stats
    stats.totalPerformances++;
    stats.averageAccuracy = (
      (stats.averageAccuracy * (stats.totalPerformances - 1) + performance.accuracy) /
      stats.totalPerformances
    );
    stats.bestRating = Math.max(stats.bestRating, performance.rating);
    stats.totalListeners += performance.listeners.length;

    // Update instrument mastery
    const currentMastery = stats.instrumentMastery[performance.instrumentId] || 0;
    stats.instrumentMastery[performance.instrumentId] = Math.min(
      100,
      currentMastery + (performance.accuracy / 10)
    );

    // Update favorite instrument
    const performances = stats.performanceHistory.filter(
      p => p.scoreId === performance.scoreId
    ).length;
    if (
      !stats.favoriteInstrument ||
      performances > stats.performanceHistory.filter(
        p => p.scoreId === stats.favoriteInstrument
      ).length
    ) {
      stats.favoriteInstrument = performance.instrumentId;
    }

    // Add to history
    stats.performanceHistory.push({
      scoreId: performance.scoreId,
      accuracy: performance.accuracy,
      rating: performance.rating,
      timestamp: performance.startTime
    });

    // Keep only last 100 performances in history
    if (stats.performanceHistory.length > 100) {
      stats.performanceHistory = stats.performanceHistory.slice(-100);
    }

    this.userStats.set(performance.userId, stats);
    this.emit('statsUpdated', { userId: performance.userId, stats });
  }

  async getInstrument(instrumentId: string): Promise<Instrument | null> {
    return this.instruments.get(instrumentId) || null;
  }

  async getAvailableInstruments(userId: string): Promise<Instrument[]> {
    const stats = await this.getStats(userId);
    return Array.from(this.instruments.values()).filter(
      instrument => stats.instrumentMastery[instrument.id] || 0 >= instrument.skillRequirement
    );
  }

  async getScore(scoreId: string): Promise<MusicScore | null> {
    return this.scores.get(scoreId) || null;
  }

  async getAvailableScores(userId: string): Promise<MusicScore[]> {
    const stats = await this.getStats(userId);
    return Array.from(this.scores.values()).filter(score =>
      score.instruments.some(
        instrumentId => stats.instrumentMastery[instrumentId] || 0 >= this.instruments.get(instrumentId)?.skillRequirement || 0
      )
    );
  }

  async getPerformance(performanceId: string): Promise<Performance | null> {
    return this.performances.get(performanceId) || null;
  }

  async getActivePerformances(): Promise<Performance[]> {
    return Array.from(this.performances.values()).filter(
      performance => !performance.endTime
    );
  }

  async getStats(userId: string): Promise<MusicianStats> {
    return (
      this.userStats.get(userId) || {
        totalPerformances: 0,
        averageAccuracy: 0,
        bestRating: 0,
        totalListeners: 0,
        instrumentMastery: {},
        performanceHistory: []
      }
    );
  }

  onPerformanceStarted(callback: (performance: Performance) => void) {
    this.on('performanceStarted', callback);
  }

  onNotePlayed(callback: (data: {
    performanceId: string;
    note: { pitch: string; velocity: number; timestamp: number };
    accuracy: number;
  }) => void) {
    this.on('notePlayed', callback);
  }

  onPerformanceEnded(callback: (performance: Performance) => void) {
    this.on('performanceEnded', callback);
  }

  onListenerJoined(callback: (data: { performanceId: string; listenerId: string }) => void) {
    this.on('listenerJoined', callback);
  }

  onReactionAdded(callback: (data: {
    performanceId: string;
    reaction: { userId: string; type: string; timestamp: Date };
  }) => void) {
    this.on('reactionAdded', callback);
  }

  onStatsUpdated(callback: (data: { userId: string; stats: MusicianStats }) => void) {
    this.on('statsUpdated', callback);
  }
}

export const musicService = MusicService.getInstance();
