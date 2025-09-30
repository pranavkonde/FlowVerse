import { useState, useEffect } from 'react';
import {
  Showcase,
  ShowcaseAchievement,
  ShowcaseTheme
} from '../types/achievementShowcase';
import { api } from '../services/api';

interface UseAchievementShowcaseResult {
  showcases: Showcase[];
  publicShowcases: Showcase[];
  themes: ShowcaseTheme[];
  loading: boolean;
  error: string | null;
  createShowcase: (data: {
    title: string;
    description: string;
    layout: Showcase['layout'];
    themeId: string;
    isPublic: boolean;
  }) => Promise<void>;
  updateShowcase: (showcaseId: string, updates: Partial<Showcase>) => Promise<void>;
  deleteShowcase: (showcaseId: string) => Promise<void>;
  addAchievement: (showcaseId: string, achievement: Omit<ShowcaseAchievement, 'id'>) => Promise<void>;
  updateAchievement: (showcaseId: string, achievementId: string, updates: Partial<ShowcaseAchievement>) => Promise<void>;
  removeAchievement: (showcaseId: string, achievementId: string) => Promise<void>;
  likeShowcase: (showcaseId: string) => Promise<void>;
  unlikeShowcase: (showcaseId: string) => Promise<void>;
  refreshShowcases: () => Promise<void>;
}

export function useAchievementShowcase(): UseAchievementShowcaseResult {
  const [showcases, setShowcases] = useState<Showcase[]>([]);
  const [publicShowcases, setPublicShowcases] = useState<Showcase[]>([]);
  const [themes, setThemes] = useState<ShowcaseTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [showcasesResponse, publicResponse, themesResponse] = await Promise.all([
        api.get('/achievement-showcase/user'),
        api.get('/achievement-showcase/public'),
        api.get('/achievement-showcase/themes')
      ]);

      setShowcases(showcasesResponse.data);
      setPublicShowcases(publicResponse.data);
      setThemes(themesResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load achievement showcases');
      console.error('Error fetching achievement showcases:', err);
    } finally {
      setLoading(false);
    }
  };

  const createShowcase = async (data: {
    title: string;
    description: string;
    layout: Showcase['layout'];
    themeId: string;
    isPublic: boolean;
  }) => {
    try {
      const response = await api.post('/achievement-showcase', data);
      setShowcases(current => [...current, response.data]);
      if (data.isPublic) {
        setPublicShowcases(current => [...current, response.data]);
      }
    } catch (err) {
      console.error('Error creating showcase:', err);
      throw err;
    }
  };

  const updateShowcase = async (
    showcaseId: string,
    updates: Partial<Showcase>
  ) => {
    try {
      const response = await api.put(`/achievement-showcase/${showcaseId}`, updates);
      setShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId ? response.data : showcase
        )
      );
      setPublicShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId ? response.data : showcase
        )
      );
    } catch (err) {
      console.error('Error updating showcase:', err);
      throw err;
    }
  };

  const deleteShowcase = async (showcaseId: string) => {
    try {
      await api.delete(`/achievement-showcase/${showcaseId}`);
      setShowcases(current =>
        current.filter(showcase => showcase.id !== showcaseId)
      );
      setPublicShowcases(current =>
        current.filter(showcase => showcase.id !== showcaseId)
      );
    } catch (err) {
      console.error('Error deleting showcase:', err);
      throw err;
    }
  };

  const addAchievement = async (
    showcaseId: string,
    achievement: Omit<ShowcaseAchievement, 'id'>
  ) => {
    try {
      const response = await api.post(
        `/achievement-showcase/${showcaseId}/achievements`,
        achievement
      );
      setShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId
            ? {
                ...showcase,
                achievements: [...showcase.achievements, response.data]
              }
            : showcase
        )
      );
      setPublicShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId
            ? {
                ...showcase,
                achievements: [...showcase.achievements, response.data]
              }
            : showcase
        )
      );
    } catch (err) {
      console.error('Error adding achievement:', err);
      throw err;
    }
  };

  const updateAchievement = async (
    showcaseId: string,
    achievementId: string,
    updates: Partial<ShowcaseAchievement>
  ) => {
    try {
      const response = await api.put(
        `/achievement-showcase/${showcaseId}/achievements/${achievementId}`,
        updates
      );
      setShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId
            ? {
                ...showcase,
                achievements: showcase.achievements.map(achievement =>
                  achievement.id === achievementId ? response.data : achievement
                )
              }
            : showcase
        )
      );
      setPublicShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId
            ? {
                ...showcase,
                achievements: showcase.achievements.map(achievement =>
                  achievement.id === achievementId ? response.data : achievement
                )
              }
            : showcase
        )
      );
    } catch (err) {
      console.error('Error updating achievement:', err);
      throw err;
    }
  };

  const removeAchievement = async (showcaseId: string, achievementId: string) => {
    try {
      await api.delete(
        `/achievement-showcase/${showcaseId}/achievements/${achievementId}`
      );
      setShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId
            ? {
                ...showcase,
                achievements: showcase.achievements.filter(
                  achievement => achievement.id !== achievementId
                )
              }
            : showcase
        )
      );
      setPublicShowcases(current =>
        current.map(showcase =>
          showcase.id === showcaseId
            ? {
                ...showcase,
                achievements: showcase.achievements.filter(
                  achievement => achievement.id !== achievementId
                )
              }
            : showcase
        )
      );
    } catch (err) {
      console.error('Error removing achievement:', err);
      throw err;
    }
  };

  const likeShowcase = async (showcaseId: string) => {
    try {
      await api.post(`/achievement-showcase/${showcaseId}/like`);
      const updateShowcaseLikes = (showcase: Showcase) =>
        showcase.id === showcaseId
          ? { ...showcase, likes: showcase.likes + 1, liked: true }
          : showcase;
      setShowcases(current => current.map(updateShowcaseLikes));
      setPublicShowcases(current => current.map(updateShowcaseLikes));
    } catch (err) {
      console.error('Error liking showcase:', err);
      throw err;
    }
  };

  const unlikeShowcase = async (showcaseId: string) => {
    try {
      await api.post(`/achievement-showcase/${showcaseId}/unlike`);
      const updateShowcaseLikes = (showcase: Showcase) =>
        showcase.id === showcaseId
          ? { ...showcase, likes: showcase.likes - 1, liked: false }
          : showcase;
      setShowcases(current => current.map(updateShowcaseLikes));
      setPublicShowcases(current => current.map(updateShowcaseLikes));
    } catch (err) {
      console.error('Error unliking showcase:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('showcaseCreated', (showcase: Showcase) => {
      setShowcases(current => [...current, showcase]);
      if (showcase.isPublic) {
        setPublicShowcases(current => [...current, showcase]);
      }
    });

    socket.on('showcaseUpdated', (showcase: Showcase) => {
      setShowcases(current =>
        current.map(s => (s.id === showcase.id ? showcase : s))
      );
      setPublicShowcases(current =>
        current.map(s => (s.id === showcase.id ? showcase : s))
      );
    });

    socket.on('showcaseDeleted', ({ showcaseId }: { showcaseId: string }) => {
      setShowcases(current =>
        current.filter(showcase => showcase.id !== showcaseId)
      );
      setPublicShowcases(current =>
        current.filter(showcase => showcase.id !== showcaseId)
      );
    });

    socket.on('achievementAdded', ({
      showcase,
      achievement
    }: {
      showcase: Showcase;
      achievement: ShowcaseAchievement;
    }) => {
      const updateShowcase = (s: Showcase) =>
        s.id === showcase.id
          ? { ...s, achievements: [...s.achievements, achievement] }
          : s;
      setShowcases(current => current.map(updateShowcase));
      setPublicShowcases(current => current.map(updateShowcase));
    });

    socket.on('achievementUpdated', ({
      showcase,
      achievement
    }: {
      showcase: Showcase;
      achievement: ShowcaseAchievement;
    }) => {
      const updateShowcase = (s: Showcase) =>
        s.id === showcase.id
          ? {
              ...s,
              achievements: s.achievements.map(a =>
                a.id === achievement.id ? achievement : a
              )
            }
          : s;
      setShowcases(current => current.map(updateShowcase));
      setPublicShowcases(current => current.map(updateShowcase));
    });

    socket.on('achievementRemoved', ({
      showcase,
      achievementId
    }: {
      showcase: Showcase;
      achievementId: string;
    }) => {
      const updateShowcase = (s: Showcase) =>
        s.id === showcase.id
          ? {
              ...s,
              achievements: s.achievements.filter(a => a.id !== achievementId)
            }
          : s;
      setShowcases(current => current.map(updateShowcase));
      setPublicShowcases(current => current.map(updateShowcase));
    });

    socket.on('showcaseViewed', ({
      showcaseId,
      views
    }: {
      showcaseId: string;
      views: number;
    }) => {
      const updateShowcase = (s: Showcase) =>
        s.id === showcaseId ? { ...s, views } : s;
      setShowcases(current => current.map(updateShowcase));
      setPublicShowcases(current => current.map(updateShowcase));
    });

    socket.on('showcaseLiked', ({
      showcaseId,
      likes
    }: {
      showcaseId: string;
      likes: number;
    }) => {
      const updateShowcase = (s: Showcase) =>
        s.id === showcaseId ? { ...s, likes, liked: true } : s;
      setShowcases(current => current.map(updateShowcase));
      setPublicShowcases(current => current.map(updateShowcase));
    });

    socket.on('showcaseUnliked', ({
      showcaseId,
      likes
    }: {
      showcaseId: string;
      likes: number;
    }) => {
      const updateShowcase = (s: Showcase) =>
        s.id === showcaseId ? { ...s, likes, liked: false } : s;
      setShowcases(current => current.map(updateShowcase));
      setPublicShowcases(current => current.map(updateShowcase));
    });

    return () => {
      socket.off('showcaseCreated');
      socket.off('showcaseUpdated');
      socket.off('showcaseDeleted');
      socket.off('achievementAdded');
      socket.off('achievementUpdated');
      socket.off('achievementRemoved');
      socket.off('showcaseViewed');
      socket.off('showcaseLiked');
      socket.off('showcaseUnliked');
    };
  }, []);

  return {
    showcases,
    publicShowcases,
    themes,
    loading,
    error,
    createShowcase,
    updateShowcase,
    deleteShowcase,
    addAchievement,
    updateAchievement,
    removeAchievement,
    likeShowcase,
    unlikeShowcase,
    refreshShowcases: fetchData
  };
}
