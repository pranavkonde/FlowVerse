import { useState, useEffect } from 'react';
import { DailyChallenge } from '../types/challenges';
import { api } from '../services/api';

interface UseDailyChallengesResult {
  challenges: (DailyChallenge & {
    progress: number;
    completed: boolean;
    claimed: boolean;
  })[];
  loading: boolean;
  error: string | null;
  refreshChallenges: () => Promise<void>;
  updateProgress: (challengeId: string, progress: number) => Promise<void>;
  claimReward: (challengeId: string) => Promise<void>;
}

export function useDailyChallenges(): UseDailyChallengesResult {
  const [challenges, setChallenges] = useState<(DailyChallenge & {
    progress: number;
    completed: boolean;
    claimed: boolean;
  })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/daily-challenges');
      setChallenges(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load daily challenges');
      console.error('Error fetching daily challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (challengeId: string, progress: number) => {
    try {
      const response = await api.post('/daily-challenges/progress', {
        challengeId,
        progress,
      });
      
      setChallenges(current =>
        current.map(challenge =>
          challenge.id === challengeId
            ? { ...challenge, ...response.data }
            : challenge
        )
      );
    } catch (err) {
      console.error('Error updating challenge progress:', err);
      throw err;
    }
  };

  const claimReward = async (challengeId: string) => {
    try {
      await api.post('/daily-challenges/claim', { challengeId });
      
      setChallenges(current =>
        current.map(challenge =>
          challenge.id === challengeId
            ? { ...challenge, claimed: true }
            : challenge
        )
      );
    } catch (err) {
      console.error('Error claiming challenge reward:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchChallenges();

    // Refresh challenges at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimeout = setTimeout(fetchChallenges, timeUntilMidnight);

    return () => {
      clearTimeout(midnightTimeout);
    };
  }, []);

  return {
    challenges,
    loading,
    error,
    refreshChallenges: fetchChallenges,
    updateProgress,
    claimReward,
  };
}
