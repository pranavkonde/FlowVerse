import { useState, useEffect } from 'react';
import {
  AchievementShowcase,
  ShowcaseAchievement,
  ShowcaseStats,
  ShowcaseComment,
  ShowcaseFilter
} from '../types/achievementShowcase';
import { api } from '../services/api';

interface UseAchievementShowcaseResult {
  userShowcases: AchievementShowcase[];
  publicShowcases: AchievementShowcase[];
  stats: ShowcaseStats | null;
  loading: boolean;
  error: string | null;
  createShowcase: (data: Partial<AchievementShowcase>) => Promise<AchievementShowcase>;
  updateShowcase: (
    showcaseId: string,
    updates: Partial<AchievementShowcase>
  ) => Promise<AchievementShowcase>;
  addAchievement: (
    showcaseId: string,
    achievement: ShowcaseAchievement
  ) => Promise<AchievementShowcase>;
  removeAchievement: (
    showcaseId: string,
    achievementId: string
  ) => Promise<AchievementShowcase>;
  updateAchievementPosition: (
    showcaseId: string,
    achievementId: string,
    position: { x: number; y: number },
    scale?: number,
    rotation?: number
  ) => Promise<AchievementShowcase>;
  likeShowcase: (showcaseId: string) => Promise<AchievementShowcase>;
  addComment: (
    showcaseId: string,
    content: string
  ) => Promise<ShowcaseComment>;
  getComments: (showcaseId: string) => Promise<ShowcaseComment[]>;
  filterPublicShowcases: (filter: ShowcaseFilter) => Promise<void>;
  refreshShowcases: () => Promise<void>;
}

export function useAchievementShowcase(): UseAchievementShowcaseResult {
  const [userShowcases, setUserShowcases] = useState<AchievementShowcase[]>([]);
  const [publicShowcases, setPublicShowcases] = useState<AchievementShowcase[]>([]);
  const [stats, setStats] = useState<ShowcaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserShowcases = async () => {
    try {
      const response = await api.get('/achievement-showcase/user');
      setUserShowcases(response.data);
    } catch (err) {
      console.error('Error fetching user showcases:', err);
      setError('Failed to load user showcases');
    }
  };

  const fetchPublicShowcases = async (filter?: ShowcaseFilter) => {
    try {
      const response = await api.get('/achievement-showcase/public', {
        params: filter
      });
      setPublicShowcases(response.data);
    } catch (err) {
      console.error('Error fetching public showcases:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/achievement-showcase/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching showcase stats:', err);
    }
  };

  const createShowcase = async (
    data: Partial<AchievementShowcase>
  ): Promise<AchievementShowcase> => {
    try {
      const response = await api.post('/achievement-showcase', data);
      const newShowcase = response.data;
      setUserShowcases(current => [...current, newShowcase]);
      return newShowcase;
    } catch (err) {
      console.error('Error creating showcase:', err);
      throw err;
    }
  };

  const updateShowcase = async (
    showcaseId: string,
    updates: Partial<AchievementShowcase>
  ): Promise<AchievementShowcase> => {
    try {
      const response = await api.put(
        `/achievement-showcase/${showcaseId}`,
        updates
      );
      const updatedShowcase = response.data;
      setUserShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId ? updatedShowcase : showcase
        )
      );
      return updatedShowcase;
    } catch (err) {
      console.error('Error updating showcase:', err);
      throw err;
    }
  };

  const addAchievement = async (
    showcaseId: string,
    achievement: ShowcaseAchievement
  ): Promise<AchievementShowcase> => {
    try {
      const response = await api.post(
        `/achievement-showcase/${showcaseId}/achievements`,
        { achievement }
      );
      const updatedShowcase = response.data;
      setUserShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId ? updatedShowcase : showcase
        )
      );
      return updatedShowcase;
    } catch (err) {
      console.error('Error adding achievement:', err);
      throw err;
    }
  };

  const removeAchievement = async (
    showcaseId: string,
    achievementId: string
  ): Promise<AchievementShowcase> => {
    try {
      const response = await api.delete(
        `/achievement-showcase/${showcaseId}/achievements/${achievementId}`
      );
      const updatedShowcase = response.data;
      setUserShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId ? updatedShowcase : showcase
        )
      );
      return updatedShowcase;
    } catch (err) {
      console.error('Error removing achievement:', err);
      throw err;
    }
  };

  const updateAchievementPosition = async (
    showcaseId: string,
    achievementId: string,
    position: { x: number; y: number },
    scale?: number,
    rotation?: number
  ): Promise<AchievementShowcase> => {
    try {
      const response = await api.put(
        `/achievement-showcase/${showcaseId}/achievements/${achievementId}/position`,
        { position, scale, rotation }
      );
      const updatedShowcase = response.data;
      setUserShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId ? updatedShowcase : showcase
        )
      );
      return updatedShowcase;
    } catch (err) {
      console.error('Error updating achievement position:', err);
      throw err;
    }
  };

  const likeShowcase = async (showcaseId: string): Promise<AchievementShowcase> => {
    try {
      const response = await api.post(
        `/achievement-showcase/${showcaseId}/like`
      );
      const updatedShowcase = response.data;
      setPublicShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId ? updatedShowcase : showcase
        )
      );
      return updatedShowcase;
    } catch (err) {
      console.error('Error liking showcase:', err);
      throw err;
    }
  };

  const addComment = async (
    showcaseId: string,
    content: string
  ): Promise<ShowcaseComment> => {
    try {
      const response = await api.post(
        `/achievement-showcase/${showcaseId}/comments`,
        { content }
      );
      return response.data;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const getComments = async (showcaseId: string): Promise<ShowcaseComment[]> => {
    try {
      const response = await api.get(
        `/achievement-showcase/${showcaseId}/comments`
      );
      return response.data;
    } catch (err) {
      console.error('Error fetching comments:', err);
      throw err;
    }
  };

  const filterPublicShowcases = async (filter: ShowcaseFilter): Promise<void> => {
    await fetchPublicShowcases(filter);
  };

  const refreshShowcases = async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserShowcases(),
        fetchPublicShowcases(),
        fetchStats()
      ]);
      setError(null);
    } catch (err) {
      setError('Failed to refresh showcases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshShowcases();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('showcase:created', ({ showcaseId }) => {
      fetchPublicShowcases();
    });

    socket.on('showcase:updated', ({ showcaseId }) => {
      fetchUserShowcases();
      fetchPublicShowcases();
    });

    socket.on('showcase:achievement-added', ({ showcaseId }) => {
      fetchUserShowcases();
      fetchStats();
    });

    socket.on('showcase:achievement-removed', ({ showcaseId }) => {
      fetchUserShowcases();
      fetchStats();
    });

    socket.on('showcase:liked', ({ showcaseId }) => {
      fetchPublicShowcases();
    });

    socket.on('showcase:commented', ({ showcaseId }) => {
      fetchPublicShowcases();
    });

    return () => {
      socket.off('showcase:created');
      socket.off('showcase:updated');
      socket.off('showcase:achievement-added');
      socket.off('showcase:achievement-removed');
      socket.off('showcase:liked');
      socket.off('showcase:commented');
    };
  }, []);

  return {
    userShowcases,
    publicShowcases,
    stats,
    loading,
    error,
    createShowcase,
    updateShowcase,
    addAchievement,
    removeAchievement,
    updateAchievementPosition,
    likeShowcase,
    addComment,
    getComments,
    filterPublicShowcases,
    refreshShowcases
  };
}