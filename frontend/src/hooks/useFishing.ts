import { useState, useEffect } from 'react';
import {
  FishingSpot,
  FishingAttempt,
  FishingStats,
  Season,
  TimeOfDay,
  WeatherEffect
} from '../types/fishing';
import { api } from '../services/api';

interface UseFishingResult {
  spots: FishingSpot[];
  currentAttempt: FishingAttempt | null;
  stats: FishingStats | null;
  conditions: {
    season: Season;
    time: TimeOfDay;
    weather: WeatherEffect;
  } | null;
  loading: boolean;
  error: string | null;
  startFishing: (
    spotId: string,
    equipment?: {
      rod?: string;
      reel?: string;
      line?: string;
      bait?: string;
      lure?: string;
    }
  ) => Promise<FishingAttempt>;
  respondToBite: () => Promise<void>;
  refreshSpots: () => Promise<void>;
}

export function useFishing(): UseFishingResult {
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<FishingAttempt | null>(null);
  const [stats, setStats] = useState<FishingStats | null>(null);
  const [conditions, setConditions] = useState<{
    season: Season;
    time: TimeOfDay;
    weather: WeatherEffect;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpots = async () => {
    try {
      const response = await api.get('/fishing/spots');
      setSpots(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching fishing spots:', err);
      setError('Failed to load fishing spots');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/fishing/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching fishing stats:', err);
    }
  };

  const fetchConditions = async () => {
    try {
      const response = await api.get('/fishing/conditions');
      setConditions(response.data);
    } catch (err) {
      console.error('Error fetching conditions:', err);
    }
  };

  const startFishing = async (
    spotId: string,
    equipment?: {
      rod?: string;
      reel?: string;
      line?: string;
      bait?: string;
      lure?: string;
    }
  ): Promise<FishingAttempt> => {
    try {
      const response = await api.post('/fishing/start', {
        spotId,
        equipment
      });
      
      const attempt = response.data;
      setCurrentAttempt(attempt);
      return attempt;
    } catch (err) {
      console.error('Error starting fishing:', err);
      throw err;
    }
  };

  const respondToBite = async (): Promise<void> => {
    if (!currentAttempt) {
      throw new Error('No active fishing attempt');
    }

    try {
      const response = await api.post(
        `/fishing/attempts/${currentAttempt.id}/respond`
      );
      setCurrentAttempt(response.data);
    } catch (err) {
      console.error('Error responding to bite:', err);
      throw err;
    }
  };

  const pollAttemptStatus = async (attemptId: string) => {
    try {
      const response = await api.get(`/fishing/attempts/${attemptId}`);
      const attempt = response.data;
      setCurrentAttempt(attempt);

      if (
        attempt.status !== 'COMPLETED' &&
        attempt.status !== 'FAILED'
      ) {
        setTimeout(() => pollAttemptStatus(attemptId), 500);
      } else {
        // Attempt completed, refresh stats
        fetchStats();
      }
    } catch (err) {
      console.error('Error polling attempt status:', err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSpots(),
          fetchStats(),
          fetchConditions()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('fishing:status-changed', ({ attemptId, status }) => {
      if (currentAttempt?.id === attemptId) {
        setCurrentAttempt(current =>
          current ? { ...current, status } : null
        );
      }
    });

    socket.on('fishing:progress', ({ attemptId, progress }) => {
      if (currentAttempt?.id === attemptId) {
        setCurrentAttempt(current =>
          current ? { ...current, progress } : null
        );
      }
    });

    socket.on('fishing:completed', ({ attemptId, result }) => {
      if (currentAttempt?.id === attemptId) {
        setCurrentAttempt(current =>
          current
            ? {
                ...current,
                status: 'COMPLETED',
                endedAt: new Date().toISOString(),
                result
              }
            : null
        );
        fetchStats();
      }
    });

    socket.on('fishing:failed', ({ attemptId }) => {
      if (currentAttempt?.id === attemptId) {
        setCurrentAttempt(current =>
          current
            ? {
                ...current,
                status: 'FAILED',
                endedAt: new Date().toISOString(),
                result: { success: false, experience: 1 }
              }
            : null
        );
      }
    });

    socket.on('time:changed', ({ time }) => {
      setConditions(current =>
        current ? { ...current, time } : null
      );
    });

    socket.on('weather:changed', ({ weather }) => {
      setConditions(current =>
        current ? { ...current, weather } : null
      );
    });

    socket.on('season:changed', ({ season }) => {
      setConditions(current =>
        current ? { ...current, season } : null
      );
      fetchSpots(); // Refresh spots as available fish may change
    });

    return () => {
      socket.off('fishing:status-changed');
      socket.off('fishing:progress');
      socket.off('fishing:completed');
      socket.off('fishing:failed');
      socket.off('time:changed');
      socket.off('weather:changed');
      socket.off('season:changed');
    };
  }, [currentAttempt?.id]);

  return {
    spots,
    currentAttempt,
    stats,
    conditions,
    loading,
    error,
    startFishing,
    respondToBite,
    refreshSpots: fetchSpots
  };
}