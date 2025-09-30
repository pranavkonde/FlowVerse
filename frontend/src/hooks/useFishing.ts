import { useState, useEffect } from 'react';
import {
  Fish,
  FishingSpot,
  FishingSession,
  FishingStats
} from '../types/fishing';
import { api } from '../services/api';

interface UseFishingResult {
  spots: FishingSpot[];
  availableFish: Fish[];
  stats: FishingStats | null;
  loading: boolean;
  error: string | null;
  startFishing: (spotId: string, rodId?: string, baitId?: string) => Promise<FishingSession>;
  cast: (sessionId: string) => Promise<void>;
  hook: (sessionId: string) => Promise<void>;
  updateMinigame: (sessionId: string, progress: number) => Promise<{ completed: boolean; success: boolean }>;
  refreshData: () => Promise<void>;
}

export function useFishing(): UseFishingResult {
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [availableFish, setAvailableFish] = useState<Fish[]>([]);
  const [stats, setStats] = useState<FishingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [spotsResponse, fishResponse, statsResponse] = await Promise.all([
        api.get('/fishing/spots'),
        api.get('/fishing/fish'),
        api.get('/fishing/stats')
      ]);

      setSpots(spotsResponse.data);
      setAvailableFish(fishResponse.data);
      setStats(statsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load fishing data');
      console.error('Error fetching fishing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const startFishing = async (
    spotId: string,
    rodId?: string,
    baitId?: string
  ): Promise<FishingSession> => {
    try {
      const response = await api.post('/fishing/start', {
        spotId,
        rodId,
        baitId
      });

      // Update spots with new fisher count
      setSpots(current =>
        current.map(spot =>
          spot.id === spotId
            ? {
                ...spot,
                currentFishers: [...spot.currentFishers, 'currentUser'] // Replace with actual user ID
              }
            : spot
        )
      );

      return response.data;
    } catch (err) {
      console.error('Error starting fishing:', err);
      throw err;
    }
  };

  const cast = async (sessionId: string): Promise<void> => {
    try {
      await api.post(`/fishing/${sessionId}/cast`);
    } catch (err) {
      console.error('Error casting line:', err);
      throw err;
    }
  };

  const hook = async (sessionId: string): Promise<void> => {
    try {
      await api.post(`/fishing/${sessionId}/hook`);
    } catch (err) {
      console.error('Error hooking fish:', err);
      throw err;
    }
  };

  const updateMinigame = async (
    sessionId: string,
    progress: number
  ): Promise<{ completed: boolean; success: boolean }> => {
    try {
      const response = await api.post(`/fishing/${sessionId}/minigame`, {
        progress
      });
      return response.data;
    } catch (err) {
      console.error('Error updating minigame:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('spotRespawned', (spot: FishingSpot) => {
      setSpots(current =>
        current.map(s => (s.id === spot.id ? spot : s))
      );
    });

    socket.on('fishingStarted', ({ session, spot }: { session: FishingSession; spot: FishingSpot }) => {
      setSpots(current =>
        current.map(s => (s.id === spot.id ? spot : s))
      );
    });

    socket.on('fishBit', ({ session, fish }: { session: FishingSession; fish: Fish }) => {
      // Could add some UI feedback here
    });

    socket.on('fishingCompleted', ({ session, fish }: { session: FishingSession; fish: Fish }) => {
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          totalCatches: stats.totalCatches + 1,
          rarityCount: {
            ...stats.rarityCount,
            [fish.rarity]: (stats.rarityCount[fish.rarity] || 0) + 1
          }
        });
      }

      // Update spot fisher count
      setSpots(current =>
        current.map(spot =>
          spot.id === session.spotId
            ? {
                ...spot,
                currentFishers: spot.currentFishers.filter(
                  id => id !== session.userId
                )
              }
            : spot
        )
      );
    });

    socket.on('fishingFailed', ({ session }: { session: FishingSession }) => {
      // Update spot fisher count
      setSpots(current =>
        current.map(spot =>
          spot.id === session.spotId
            ? {
                ...spot,
                currentFishers: spot.currentFishers.filter(
                  id => id !== session.userId
                )
              }
            : spot
        )
      );
    });

    socket.on('levelUp', ({ userId, level }: { userId: string; level: number }) => {
      if (stats) {
        setStats({
          ...stats,
          skillLevel: level
        });
      }
    });

    socket.on('statsUpdated', ({ userId, stats: newStats }: { userId: string; stats: FishingStats }) => {
      setStats(newStats);
    });

    return () => {
      socket.off('spotRespawned');
      socket.off('fishingStarted');
      socket.off('fishBit');
      socket.off('fishingCompleted');
      socket.off('fishingFailed');
      socket.off('levelUp');
      socket.off('statsUpdated');
    };
  }, []);

  return {
    spots,
    availableFish,
    stats,
    loading,
    error,
    startFishing,
    cast,
    hook,
    updateMinigame,
    refreshData: fetchData
  };
}
