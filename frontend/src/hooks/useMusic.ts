import { useState, useEffect } from 'react';
import {
  Instrument,
  MusicScore,
  Performance,
  MusicianStats
} from '../types/music';
import { api } from '../services/api';

interface UseMusicResult {
  instruments: Instrument[];
  scores: MusicScore[];
  activePerformances: Performance[];
  stats: MusicianStats | null;
  loading: boolean;
  error: string | null;
  startPerformance: (scoreId: string, instrumentId: string) => Promise<Performance>;
  playNote: (performanceId: string, note: { pitch: string; velocity: number; timestamp: number }) => Promise<void>;
  endPerformance: (performanceId: string) => Promise<void>;
  listenToPerformance: (performanceId: string) => Promise<void>;
  addReaction: (performanceId: string, type: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useMusic(): UseMusicResult {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [scores, setScores] = useState<MusicScore[]>([]);
  const [activePerformances, setActivePerformances] = useState<Performance[]>([]);
  const [stats, setStats] = useState<MusicianStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [
        instrumentsResponse,
        scoresResponse,
        performancesResponse,
        statsResponse
      ] = await Promise.all([
        api.get('/music/instruments'),
        api.get('/music/scores'),
        api.get('/music/performances/active'),
        api.get('/music/stats')
      ]);

      setInstruments(instrumentsResponse.data);
      setScores(scoresResponse.data);
      setActivePerformances(performancesResponse.data);
      setStats(statsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load music data');
      console.error('Error fetching music data:', err);
    } finally {
      setLoading(false);
    }
  };

  const startPerformance = async (
    scoreId: string,
    instrumentId: string
  ): Promise<Performance> => {
    try {
      const response = await api.post('/music/performances', {
        scoreId,
        instrumentId
      });
      const performance = response.data;

      setActivePerformances(current => [...current, performance]);
      return performance;
    } catch (err) {
      console.error('Error starting performance:', err);
      throw err;
    }
  };

  const playNote = async (
    performanceId: string,
    note: { pitch: string; velocity: number; timestamp: number }
  ) => {
    try {
      await api.post(`/music/performances/${performanceId}/notes`, note);
    } catch (err) {
      console.error('Error playing note:', err);
      throw err;
    }
  };

  const endPerformance = async (performanceId: string) => {
    try {
      await api.post(`/music/performances/${performanceId}/end`);
      setActivePerformances(current =>
        current.filter(p => p.id !== performanceId)
      );
    } catch (err) {
      console.error('Error ending performance:', err);
      throw err;
    }
  };

  const listenToPerformance = async (performanceId: string) => {
    try {
      await api.post(`/music/performances/${performanceId}/listen`);
      setActivePerformances(current =>
        current.map(performance =>
          performance.id === performanceId
            ? {
                ...performance,
                listeners: [...performance.listeners, 'currentUser'] // Replace with actual user ID
              }
            : performance
        )
      );
    } catch (err) {
      console.error('Error listening to performance:', err);
      throw err;
    }
  };

  const addReaction = async (performanceId: string, type: string) => {
    try {
      await api.post(`/music/performances/${performanceId}/reactions`, { type });
      setActivePerformances(current =>
        current.map(performance =>
          performance.id === performanceId
            ? {
                ...performance,
                reactions: [
                  ...performance.reactions,
                  {
                    userId: 'currentUser', // Replace with actual user ID
                    type,
                    timestamp: new Date()
                  }
                ]
              }
            : performance
        )
      );
    } catch (err) {
      console.error('Error adding reaction:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('performanceStarted', (performance: Performance) => {
      setActivePerformances(current => [...current, performance]);
    });

    socket.on('notePlayed', ({
      performanceId,
      note,
      accuracy
    }: {
      performanceId: string;
      note: { pitch: string; velocity: number; timestamp: number };
      accuracy: number;
    }) => {
      setActivePerformances(current =>
        current.map(performance =>
          performance.id === performanceId
            ? { ...performance, accuracy }
            : performance
        )
      );

      // Play the note sound
      const audio = new Audio(`/assets/sounds/${note.pitch}.mp3`);
      audio.volume = note.velocity / 100;
      audio.play();
    });

    socket.on('performanceEnded', (performance: Performance) => {
      setActivePerformances(current =>
        current.filter(p => p.id !== performance.id)
      );
    });

    socket.on('listenerJoined', ({
      performanceId,
      listenerId
    }: {
      performanceId: string;
      listenerId: string;
    }) => {
      setActivePerformances(current =>
        current.map(performance =>
          performance.id === performanceId
            ? {
                ...performance,
                listeners: [...performance.listeners, listenerId]
              }
            : performance
        )
      );
    });

    socket.on('reactionAdded', ({
      performanceId,
      reaction
    }: {
      performanceId: string;
      reaction: { userId: string; type: string; timestamp: Date };
    }) => {
      setActivePerformances(current =>
        current.map(performance =>
          performance.id === performanceId
            ? {
                ...performance,
                reactions: [...performance.reactions, reaction]
              }
            : performance
        )
      );
    });

    socket.on('statsUpdated', ({ stats: newStats }: { stats: MusicianStats }) => {
      setStats(newStats);
    });

    return () => {
      socket.off('performanceStarted');
      socket.off('notePlayed');
      socket.off('performanceEnded');
      socket.off('listenerJoined');
      socket.off('reactionAdded');
      socket.off('statsUpdated');
    };
  }, []);

  return {
    instruments,
    scores,
    activePerformances,
    stats,
    loading,
    error,
    startPerformance,
    playNote,
    endPerformance,
    listenToPerformance,
    addReaction,
    refreshData: fetchData
  };
}
