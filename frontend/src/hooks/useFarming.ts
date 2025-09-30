import { useState, useEffect } from 'react';
import { Plot, Crop } from '../types/farming';
import { api } from '../services/api';

interface UseFarmingResult {
  plots: Plot[];
  availableCrops: Crop[];
  loading: boolean;
  error: string | null;
  createPlot: (position: { x: number; y: number }) => Promise<void>;
  tillPlot: (plotId: string, toolId: string) => Promise<void>;
  plantCrop: (plotId: string, cropId: string) => Promise<void>;
  waterCrop: (plotId: string) => Promise<void>;
  fertilizeCrop: (plotId: string, fertilizerId: string) => Promise<void>;
  harvestCrop: (plotId: string) => Promise<void>;
  refreshPlots: () => Promise<void>;
}

export function useFarming(): UseFarmingResult {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [availableCrops, setAvailableCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlots = async () => {
    try {
      const response = await api.get('/farming/plots');
      setPlots(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load plots');
      console.error('Error fetching plots:', err);
    }
  };

  const fetchCrops = async () => {
    try {
      // Get current season based on system time
      const seasons = ['spring', 'summer', 'fall', 'winter'];
      const currentMonth = new Date().getMonth();
      const currentSeason = seasons[Math.floor(currentMonth / 3)];

      const response = await api.get(`/farming/crops?season=${currentSeason}`);
      setAvailableCrops(response.data);
    } catch (err) {
      console.error('Error fetching crops:', err);
      // Don't set error here as it's not critical
    }
  };

  const createPlot = async (position: { x: number; y: number }) => {
    try {
      const response = await api.post('/farming/plots', { position });
      setPlots(current => [...current, response.data]);
    } catch (err) {
      console.error('Error creating plot:', err);
      throw err;
    }
  };

  const tillPlot = async (plotId: string, toolId: string) => {
    try {
      await api.post('/farming/till', { plotId, toolId });
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId
            ? { ...plot, status: 'tilled' }
            : plot
        )
      );
    } catch (err) {
      console.error('Error tilling plot:', err);
      throw err;
    }
  };

  const plantCrop = async (plotId: string, cropId: string) => {
    try {
      await api.post('/farming/plant', { plotId, cropId });
      
      const crop = availableCrops.find(c => c.id === cropId);
      if (!crop) throw new Error('Crop not found');

      setPlots(current =>
        current.map(plot =>
          plot.id === plotId
            ? {
                ...plot,
                status: 'planted',
                crop: {
                  id: cropId,
                  plantedAt: new Date(),
                  lastWatered: new Date(),
                  currentStage: 0,
                  quality: 100,
                  diseased: false
                }
              }
            : plot
        )
      );
    } catch (err) {
      console.error('Error planting crop:', err);
      throw err;
    }
  };

  const waterCrop = async (plotId: string) => {
    try {
      await api.post('/farming/water', { plotId });
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId && plot.crop
            ? {
                ...plot,
                crop: {
                  ...plot.crop,
                  lastWatered: new Date(),
                  quality: Math.min(100, plot.crop.quality + 5)
                }
              }
            : plot
        )
      );
    } catch (err) {
      console.error('Error watering crop:', err);
      throw err;
    }
  };

  const fertilizeCrop = async (plotId: string, fertilizerId: string) => {
    try {
      await api.post('/farming/fertilize', { plotId, fertilizerId });
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId && plot.crop
            ? {
                ...plot,
                crop: {
                  ...plot.crop,
                  lastFertilized: new Date(),
                  quality: Math.min(100, plot.crop.quality + 10)
                }
              }
            : plot
        )
      );
    } catch (err) {
      console.error('Error fertilizing crop:', err);
      throw err;
    }
  };

  const harvestCrop = async (plotId: string) => {
    try {
      await api.post('/farming/harvest', { plotId });
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId
            ? { ...plot, status: 'empty', crop: undefined }
            : plot
        )
      );
    } catch (err) {
      console.error('Error harvesting crop:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPlots(), fetchCrops()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('plotUpdated', (updatedPlot: Plot) => {
      setPlots(current =>
        current.map(plot =>
          plot.id === updatedPlot.id ? updatedPlot : plot
        )
      );
    });

    socket.on('cropStageChanged', ({ plotId, stage }: { plotId: string; stage: number }) => {
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId && plot.crop
            ? {
                ...plot,
                crop: {
                  ...plot.crop,
                  currentStage: stage
                }
              }
            : plot
        )
      );
    });

    socket.on('cropNeedsWater', ({ plotId }: { plotId: string }) => {
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId && plot.crop
            ? {
                ...plot,
                crop: {
                  ...plot.crop,
                  quality: Math.max(0, plot.crop.quality - 10)
                }
              }
            : plot
        )
      );
    });

    socket.on('cropReady', ({ plotId }: { plotId: string }) => {
      setPlots(current =>
        current.map(plot =>
          plot.id === plotId
            ? { ...plot, status: 'ready' }
            : plot
        )
      );
    });

    return () => {
      socket.off('plotUpdated');
      socket.off('cropStageChanged');
      socket.off('cropNeedsWater');
      socket.off('cropReady');
    };
  }, []);

  return {
    plots,
    availableCrops,
    loading,
    error,
    createPlot,
    tillPlot,
    plantCrop,
    waterCrop,
    fertilizeCrop,
    harvestCrop,
    refreshPlots: fetchPlots
  };
}
