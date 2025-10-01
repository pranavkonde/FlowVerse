import { useState, useEffect } from 'react';
import {
  FarmPlot,
  CropTemplate,
  FarmingStats,
  CropQuality
} from '../types/farming';
import { api } from '../services/api';

interface UseFarmingResult {
  plots: FarmPlot[];
  availableCrops: CropTemplate[];
  stats: FarmingStats;
  loading: boolean;
  error: string | null;
  createPlot: (position: { x: number; y: number }) => Promise<FarmPlot>;
  tillPlot: (plotId: string, toolId: string) => Promise<FarmPlot>;
  plantCrop: (plotId: string, cropName: string) => Promise<FarmPlot>;
  waterPlot: (plotId: string, toolId: string) => Promise<FarmPlot>;
  fertilizePlot: (plotId: string, toolId: string) => Promise<FarmPlot>;
  harvestCrop: (plotId: string, toolId: string) => Promise<{
    plot: FarmPlot;
    yield: number;
    quality: CropQuality;
  }>;
  refreshPlots: () => Promise<void>;
}

export function useFarming(): UseFarmingResult {
  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [availableCrops, setAvailableCrops] = useState<CropTemplate[]>([]);
  const [stats, setStats] = useState<FarmingStats>({
    totalHarvests: 0,
    cropsByType: {},
    qualityAchieved: {},
    diseaseRate: 0,
    perfectCrops: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlots = async () => {
    try {
      const response = await api.get('/farming/plots');
      setPlots(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching plots:', err);
      setError('Failed to load farm plots');
    }
  };

  const fetchAvailableCrops = async () => {
    try {
      const response = await api.get('/farming/crops/available');
      setAvailableCrops(response.data);
    } catch (err) {
      console.error('Error fetching available crops:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/farming/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching farming stats:', err);
    }
  };

  const createPlot = async (position: { x: number; y: number }): Promise<FarmPlot> => {
    try {
      const response = await api.post('/farming/plots', { position });
      const newPlot = response.data;
      setPlots(current => [...current, newPlot]);
      return newPlot;
    } catch (err) {
      console.error('Error creating plot:', err);
      throw err;
    }
  };

  const tillPlot = async (plotId: string, toolId: string): Promise<FarmPlot> => {
    try {
      const response = await api.post('/farming/plots/till', { plotId, toolId });
      const updatedPlot = response.data;
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId ? updatedPlot : plot
        )
      );
      return updatedPlot;
    } catch (err) {
      console.error('Error tilling plot:', err);
      throw err;
    }
  };

  const plantCrop = async (plotId: string, cropName: string): Promise<FarmPlot> => {
    try {
      const response = await api.post('/farming/plots/plant', { plotId, cropName });
      const updatedPlot = response.data;
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId ? updatedPlot : plot
        )
      );
      return updatedPlot;
    } catch (err) {
      console.error('Error planting crop:', err);
      throw err;
    }
  };

  const waterPlot = async (plotId: string, toolId: string): Promise<FarmPlot> => {
    try {
      const response = await api.post('/farming/plots/water', { plotId, toolId });
      const updatedPlot = response.data;
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId ? updatedPlot : plot
        )
      );
      return updatedPlot;
    } catch (err) {
      console.error('Error watering plot:', err);
      throw err;
    }
  };

  const fertilizePlot = async (plotId: string, toolId: string): Promise<FarmPlot> => {
    try {
      const response = await api.post('/farming/plots/fertilize', { plotId, toolId });
      const updatedPlot = response.data;
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId ? updatedPlot : plot
        )
      );
      return updatedPlot;
    } catch (err) {
      console.error('Error fertilizing plot:', err);
      throw err;
    }
  };

  const harvestCrop = async (plotId: string, toolId: string) => {
    try {
      const response = await api.post('/farming/plots/harvest', { plotId, toolId });
      const result = response.data;
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId ? result.plot : plot
        )
      );
      await fetchStats(); // Refresh stats after harvest
      return result;
    } catch (err) {
      console.error('Error harvesting crop:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPlots(),
          fetchAvailableCrops(),
          fetchStats()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('plot:updated', ({ plotId, plot }) => {
      setPlots(current =>
        current.map(p => (p.id === plotId ? plot : p))
      );
    });

    socket.on('crop:stage-changed', ({ plotId, stage }) => {
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId && plot.crop
            ? { ...plot, crop: { ...plot.crop, growthStage: stage } }
            : plot
        )
      );
    });

    socket.on('crop:diseased', ({ plotId }) => {
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId
            ? { ...plot, status: 'DISEASED', crop: plot.crop ? { ...plot.crop, diseased: true } : undefined }
            : plot
        )
      );
    });

    socket.on('crop:harvestable', ({ plotId }) => {
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId
            ? { ...plot, status: 'HARVESTABLE' }
            : plot
        )
      );
    });

    socket.on('season:changed', () => {
      fetchAvailableCrops();
    });

    return () => {
      socket.off('plot:updated');
      socket.off('crop:stage-changed');
      socket.off('crop:diseased');
      socket.off('crop:harvestable');
      socket.off('season:changed');
    };
  }, []);

  return {
    plots,
    availableCrops,
    stats,
    loading,
    error,
    createPlot,
    tillPlot,
    plantCrop,
    waterPlot,
    fertilizePlot,
    harvestCrop,
    refreshPlots: fetchPlots
  };
}