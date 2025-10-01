import { useState, useEffect } from 'react';
import { 
  PlayerStatistics, 
  ActivitySummary, 
  PerformanceMetrics, 
  AchievementProgress 
} from '../types/statistics';

interface UseStatisticsReturn {
  statistics: PlayerStatistics | null;
  activitySummary: ActivitySummary | null;
  performanceMetrics: PerformanceMetrics | null;
  achievementProgress: AchievementProgress | null;
  loading: boolean;
  error: string | null;
  fetchStatistics: (timeframe?: string) => Promise<void>;
  fetchActivitySummary: (days?: number) => Promise<void>;
  fetchPerformanceMetrics: (category?: string) => Promise<void>;
  fetchAchievementProgress: () => Promise<void>;
  updateStatistics: (data: any) => Promise<void>;
}

export const useStatistics = (playerId: string): UseStatisticsReturn => {
  const [statistics, setStatistics] = useState<PlayerStatistics | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchStatistics = async (timeframe: string = 'all'): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/statistics/${playerId}?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setStatistics(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivitySummary = async (days: number = 30): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/statistics/${playerId}/activity?days=${days}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setActivitySummary(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch activity summary');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching activity summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceMetrics = async (category?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const url = category 
        ? `${API_BASE_URL}/statistics/${playerId}/performance?category=${category}`
        : `${API_BASE_URL}/statistics/${playerId}/performance`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setPerformanceMetrics(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch performance metrics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievementProgress = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/statistics/${playerId}/achievements`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAchievementProgress(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch achievement progress');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching achievement progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatistics = async (data: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/statistics/${playerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update statistics');
      }

      // Refresh statistics after update
      await fetchStatistics();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error updating statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch statistics when playerId changes
  useEffect(() => {
    if (playerId) {
      fetchStatistics();
      fetchActivitySummary();
      fetchPerformanceMetrics();
      fetchAchievementProgress();
    }
  }, [playerId]);

  return {
    statistics,
    activitySummary,
    performanceMetrics,
    achievementProgress,
    loading,
    error,
    fetchStatistics,
    fetchActivitySummary,
    fetchPerformanceMetrics,
    fetchAchievementProgress,
    updateStatistics,
  };
};
