import { EventEmitter } from 'events';
import {
  Instrument,
  Song,
  Performance,
  MusicianStats,
  InstrumentType,
  EffectType,
  ReactionType
} from '../types/music';

export class MusicService extends EventEmitter {
  private instruments: Map<string, Instrument> = new Map();
  private songs: Map<string, Song> = new Map();
  private performances: Map<string, Performance> = new Map();
  private userStats: Map<string, MusicianStats> = new Map();

  constructor() {
    super();
    this.initializeInstruments();
    this.initializeSongs();
  }

  private initializeInstruments(): void {
    const defaultInstruments: Instrument[] = [
      {
        id: 'PIANO-1',
        name: 'Basic Piano',
        type: 'PIANO',
        category: 'KEYBOARD',
        soundSet: {
          baseUrl: '/sounds/piano/',
          format: 'mp3',
          samples: [
            { note: 'C4', url: 'C4.mp3' },
            { note: 'E4', url: 'E4.mp3' },
            { note: 'G4', url: 'G4.mp3' }
          ]
        },
        range: {
          min: 36,
          max: 84
        },
        tuning: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        effects: [
          {
            type: 'SOOTHE',
            value: 1.2,
            area: {
              radius: 10,
              falloff: 0.5
            }
          }
        ],
        requirements: {
          level: 1
        },
        stats: {
          power: 5,
          resonance: 8,
          harmony: 7,
          control: 6,
          durability: 10
        }
      }
      // Add more instruments...
    ];

    defaultInstruments.forEach(instrument =>
      this.instruments.set(instrument.id, instrument)
    );
  }

  private initializeSongs(): void {
    const defaultSongs: Song[] = [
      {
        id: 'SONG-1',
        title: 'Simple Melody',
        composer: 'Tutorial Master',
        difficulty: 1,
        duration: 60,
        bpm: 120,
        notes: [
          {
            time: 0,
            pitch: 'C4',
            duration: 0.5,
            velocity: 0.8
          },
          {
            time: 0.5,
            pitch: 'E4',
            duration: 0.5,
            velocity: 0.8
          },
          {
            time: 1,
            pitch: 'G4',
            duration: 1,
            velocity: 0.8
          }
        ],
        sections: [
          {
            name: 'Main Theme',
            startTime: 0,
            endTime: 60,
            type: 'VERSE'
          }
        ],
        effects: [
          {
            type: 'INSPIRE',
            value: 1.1,
            startTime: 0,
            duration: 60
          }
        ],
        requirements: {
          instrument: ['PIANO', 'GUITAR'],
          level: 1
        }
      }
      // Add more songs...
    ];

    defaultSongs.forEach(song =>
      this.songs.set(song.id, song)
    );
  }

  public async startPerformance(
    playerId: string,
    instrumentId: string,
    songId: string
  ): Promise<Performance> {
    const instrument = this.instruments.get(instrumentId);
    if (!instrument) {
      throw new Error('Instrument not found');
    }

    const song = this.songs.get(songId);
    if (!song) {
      throw new Error('Song not found');
    }

    if (!song.requirements.instrument.includes(instrument.type)) {
      throw new Error('Instrument not compatible with song');
    }

    const performance: Performance = {
      id: `PERF-${Date.now()}`,
      playerId,
      instrumentId,
      song,
      startedAt: new Date().toISOString(),
      effects: [],
      audience: [],
      reactions: []
    };

    this.performances.set(performance.id, performance);
    this.emit('performance:started', { performanceId: performance.id });

    return performance;
  }

  public async endPerformance(
    performanceId: string,
    stats: {
      score: number;
      accuracy: number;
      combo: number;
    }
  ): Promise<Performance> {
    const performance = this.performances.get(performanceId);
    if (!performance) {
      throw new Error('Performance not found');
    }

    performance.endedAt = new Date().toISOString();
    performance.score = stats.score;
    performance.accuracy = stats.accuracy;
    performance.combo = stats.combo;

    this.performances.set(performanceId, performance);
    this.updateUserStats(performance.playerId, performance);
    this.emit('performance:ended', { performanceId });

    return performance;
  }

  public async addReaction(
    performanceId: string,
    userId: string,
    type: ReactionType
  ): Promise<Performance> {
    const performance = this.performances.get(performanceId);
    if (!performance) {
      throw new Error('Performance not found');
    }

    performance.reactions.push({
      userId,
      type,
      timestamp: new Date().toISOString()
    });

    this.performances.set(performanceId, performance);
    this.emit('performance:reaction', {
      performanceId,
      userId,
      type
    });

    return performance;
  }

  public async addAudienceMember(
    performanceId: string,
    userId: string
  ): Promise<Performance> {
    const performance = this.performances.get(performanceId);
    if (!performance) {
      throw new Error('Performance not found');
    }

    if (!performance.audience.includes(userId)) {
      performance.audience.push(userId);
      this.performances.set(performanceId, performance);
      this.emit('performance:audience-joined', {
        performanceId,
        userId
      });
    }

    return performance;
  }

  public async addEffect(
    performanceId: string,
    effect: {
      type: EffectType;
      value: number;
      targetId?: string;
      duration: number;
    }
  ): Promise<Performance> {
    const performance = this.performances.get(performanceId);
    if (!performance) {
      throw new Error('Performance not found');
    }

    const performanceEffect = {
      ...effect,
      startTime: Date.now()
    };

    performance.effects.push(performanceEffect);
    this.performances.set(performanceId, performance);
    this.emit('performance:effect-added', {
      performanceId,
      effect: performanceEffect
    });

    return performance;
  }

  private updateUserStats(
    userId: string,
    performance: Performance
  ): void {
    let stats = this.userStats.get(userId);
    if (!stats) {
      stats = {
        totalPerformances: 0,
        instrumentsPlayed: {} as Record<InstrumentType, number>,
        songsLearned: 0,
        highestCombo: 0,
        averageAccuracy: 0,
        totalPlaytime: 0,
        audienceReached: 0,
        effectsTriggered: 0,
        specialAchievements: []
      };
    }

    const instrument = this.instruments.get(performance.instrumentId);
    if (!instrument) return;

    // Update basic stats
    stats.totalPerformances++;
    stats.instrumentsPlayed[instrument.type] =
      (stats.instrumentsPlayed[instrument.type] || 0) + 1;

    if (performance.combo) {
      stats.highestCombo = Math.max(stats.highestCombo, performance.combo);
    }

    if (performance.accuracy) {
      stats.averageAccuracy = (
        stats.averageAccuracy * (stats.totalPerformances - 1) +
        performance.accuracy
      ) / stats.totalPerformances;
    }

    if (performance.startedAt && performance.endedAt) {
      const duration = new Date(performance.endedAt).getTime() -
        new Date(performance.startedAt).getTime();
      stats.totalPlaytime += duration;
    }

    stats.audienceReached += performance.audience.length;
    stats.effectsTriggered += performance.effects.length;

    // Check for achievements
    if (stats.totalPerformances >= 100) {
      this.addAchievement(stats, 'VETERAN_PERFORMER');
    }
    if (stats.highestCombo >= 50) {
      this.addAchievement(stats, 'COMBO_MASTER');
    }
    if (stats.averageAccuracy >= 95) {
      this.addAchievement(stats, 'PERFECT_PITCH');
    }

    this.userStats.set(userId, stats);
  }

  private addAchievement(stats: MusicianStats, achievement: string): void {
    if (!stats.specialAchievements.includes(achievement)) {
      stats.specialAchievements.push(achievement);
      this.emit('achievement:unlocked', { achievement });
    }
  }

  public async getInstruments(): Promise<Instrument[]> {
    return Array.from(this.instruments.values());
  }

  public async getSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  public async getPerformance(
    performanceId: string
  ): Promise<Performance | undefined> {
    return this.performances.get(performanceId);
  }

  public async getUserStats(userId: string): Promise<MusicianStats> {
    return (
      this.userStats.get(userId) || {
        totalPerformances: 0,
        instrumentsPlayed: {},
        songsLearned: 0,
        highestCombo: 0,
        averageAccuracy: 0,
        totalPlaytime: 0,
        audienceReached: 0,
        effectsTriggered: 0,
        specialAchievements: []
      }
    );
  }
}