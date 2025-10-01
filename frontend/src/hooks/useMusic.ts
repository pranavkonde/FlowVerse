import { useState, useEffect, useRef } from 'react';
import {
  Instrument,
  Song,
  Performance,
  MusicianStats,
  ReactionType,
  EffectType,
  MusicSettings
} from '../types/music';
import { api } from '../services/api';

interface UseMusicResult {
  instruments: Instrument[];
  songs: Song[];
  currentPerformance: Performance | null;
  stats: MusicianStats | null;
  settings: MusicSettings;
  loading: boolean;
  error: string | null;
  audioContext: AudioContext | null;
  startPerformance: (instrumentId: string, songId: string) => Promise<void>;
  endPerformance: (stats: {
    score: number;
    accuracy: number;
    combo: number;
  }) => Promise<void>;
  playNote: (note: string, duration?: number) => Promise<void>;
  addReaction: (type: ReactionType) => Promise<void>;
  joinAudience: (performanceId: string) => Promise<void>;
  addEffect: (effect: {
    type: EffectType;
    value: number;
    targetId?: string;
    duration: number;
  }) => Promise<void>;
  updateSettings: (newSettings: Partial<MusicSettings>) => void;
  refreshData: () => Promise<void>;
}

const DEFAULT_SETTINGS: MusicSettings = {
  volume: {
    master: 1,
    instruments: 0.8,
    effects: 0.6,
    ambient: 0.4
  },
  visualEffects: true,
  showNoteNames: true,
  showTiming: true,
  inputLatency: 0,
  midiEnabled: false
};

export function useMusic(): UseMusicResult {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentPerformance, setCurrentPerformance] = useState<Performance | null>(null);
  const [stats, setStats] = useState<MusicianStats | null>(null);
  const [settings, setSettings] = useState<MusicSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());

  useEffect(() => {
    // Initialize AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  const fetchInstruments = async () => {
    try {
      const response = await api.get('/music/instruments');
      setInstruments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching instruments:', err);
      setError('Failed to load instruments');
    }
  };

  const fetchSongs = async () => {
    try {
      const response = await api.get('/music/songs');
      setSongs(response.data);
    } catch (err) {
      console.error('Error fetching songs:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/music/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching music stats:', err);
    }
  };

  const loadSoundBuffer = async (url: string): Promise<AudioBuffer> => {
    if (soundBuffersRef.current.has(url)) {
      return soundBuffersRef.current.get(url)!;
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
    soundBuffersRef.current.set(url, audioBuffer);
    return audioBuffer;
  };

  const startPerformance = async (
    instrumentId: string,
    songId: string
  ): Promise<void> => {
    try {
      const response = await api.post('/music/performances', {
        instrumentId,
        songId
      });
      
      const performance = response.data;
      setCurrentPerformance(performance);

      // Preload instrument sounds
      const instrument = instruments.find(i => i.id === instrumentId);
      if (instrument) {
        await Promise.all(
          instrument.soundSet.samples.map(sample =>
            loadSoundBuffer(instrument.soundSet.baseUrl + sample.url)
          )
        );
      }
    } catch (err) {
      console.error('Error starting performance:', err);
      throw err;
    }
  };

  const endPerformance = async (stats: {
    score: number;
    accuracy: number;
    combo: number;
  }): Promise<void> => {
    if (!currentPerformance) {
      throw new Error('No active performance');
    }

    try {
      const response = await api.post(
        `/music/performances/${currentPerformance.id}/end`,
        stats
      );
      setCurrentPerformance(response.data);
      await fetchStats();
    } catch (err) {
      console.error('Error ending performance:', err);
      throw err;
    }
  };

  const playNote = async (
    note: string,
    duration: number = 1000
  ): Promise<void> => {
    if (!currentPerformance || !audioContextRef.current) return;

    const instrument = instruments.find(
      i => i.id === currentPerformance.instrumentId
    );
    if (!instrument) return;

    const sample = instrument.soundSet.samples.find(s => s.note === note);
    if (!sample) return;

    try {
      const buffer = await loadSoundBuffer(
        instrument.soundSet.baseUrl + sample.url
      );

      // Stop previous note if it exists
      const previousSource = activeSourcesRef.current.get(note);
      if (previousSource) {
        previousSource.stop();
        activeSourcesRef.current.delete(note);
      }

      // Create and configure source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;

      // Create gain node for volume control
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = settings.volume.instruments;

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      // Start playback
      source.start();
      activeSourcesRef.current.set(note, source);

      // Stop after duration
      setTimeout(() => {
        source.stop();
        activeSourcesRef.current.delete(note);
      }, duration);
    } catch (err) {
      console.error('Error playing note:', err);
    }
  };

  const addReaction = async (type: ReactionType): Promise<void> => {
    if (!currentPerformance) {
      throw new Error('No active performance');
    }

    try {
      const response = await api.post(
        `/music/performances/${currentPerformance.id}/reactions`,
        { type }
      );
      setCurrentPerformance(response.data);
    } catch (err) {
      console.error('Error adding reaction:', err);
      throw err;
    }
  };

  const joinAudience = async (performanceId: string): Promise<void> => {
    try {
      const response = await api.post(
        `/music/performances/${performanceId}/audience`
      );
      setCurrentPerformance(response.data);
    } catch (err) {
      console.error('Error joining audience:', err);
      throw err;
    }
  };

  const addEffect = async (effect: {
    type: EffectType;
    value: number;
    targetId?: string;
    duration: number;
  }): Promise<void> => {
    if (!currentPerformance) {
      throw new Error('No active performance');
    }

    try {
      const response = await api.post(
        `/music/performances/${currentPerformance.id}/effects`,
        { effect }
      );
      setCurrentPerformance(response.data);
    } catch (err) {
      console.error('Error adding effect:', err);
      throw err;
    }
  };

  const updateSettings = (newSettings: Partial<MusicSettings>): void => {
    setSettings(current => ({
      ...current,
      ...newSettings
    }));
  };

  const refreshData = async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([
        fetchInstruments(),
        fetchSongs(),
        fetchStats()
      ]);
      setError(null);
    } catch (err) {
      setError('Failed to refresh music data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('performance:started', ({ performanceId }) => {
      if (currentPerformance?.id === performanceId) {
        fetchStats();
      }
    });

    socket.on('performance:ended', ({ performanceId }) => {
      if (currentPerformance?.id === performanceId) {
        setCurrentPerformance(null);
        fetchStats();
      }
    });

    socket.on('performance:reaction', ({ performanceId, userId, type }) => {
      if (currentPerformance?.id === performanceId) {
        setCurrentPerformance(current => {
          if (!current) return null;
          return {
            ...current,
            reactions: [
              ...current.reactions,
              { userId, type, timestamp: new Date().toISOString() }
            ]
          };
        });
      }
    });

    socket.on('performance:audience-joined', ({ performanceId, userId }) => {
      if (currentPerformance?.id === performanceId) {
        setCurrentPerformance(current => {
          if (!current) return null;
          return {
            ...current,
            audience: [...current.audience, userId]
          };
        });
      }
    });

    socket.on('performance:effect-added', ({ performanceId, effect }) => {
      if (currentPerformance?.id === performanceId) {
        setCurrentPerformance(current => {
          if (!current) return null;
          return {
            ...current,
            effects: [...current.effects, effect]
          };
        });
      }
    });

    socket.on('achievement:unlocked', ({ achievement }) => {
      fetchStats();
    });

    return () => {
      socket.off('performance:started');
      socket.off('performance:ended');
      socket.off('performance:reaction');
      socket.off('performance:audience-joined');
      socket.off('performance:effect-added');
      socket.off('achievement:unlocked');

      // Clean up audio resources
      activeSourcesRef.current.forEach(source => source.stop());
      activeSourcesRef.current.clear();
    };
  }, [currentPerformance?.id]);

  return {
    instruments,
    songs,
    currentPerformance,
    stats,
    settings,
    loading,
    error,
    audioContext: audioContextRef.current,
    startPerformance,
    endPerformance,
    playNote,
    addReaction,
    joinAudience,
    addEffect,
    updateSettings,
    refreshData
  };
}