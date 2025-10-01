import { useState, useEffect } from 'react';
import {
  WeatherState,
  WeatherZone,
  WeatherForecast,
  WeatherStats,
  WeatherEffect
} from '../types/weather';
import { api } from '../services/api';

interface UseWeatherEffectsResult {
  currentWeather: WeatherState | null;
  forecast: WeatherForecast | null;
  zones: WeatherZone[];
  stats: WeatherStats | null;
  loading: boolean;
  error: string | null;
  getZoneWeather: (zoneId: string) => Promise<WeatherState | null>;
  refreshWeather: () => Promise<void>;
}

export function useWeatherEffects(): UseWeatherEffectsResult {
  const [currentWeather, setCurrentWeather] = useState<WeatherState | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [zones, setZones] = useState<WeatherZone[]>([]);
  const [stats, setStats] = useState<WeatherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentWeather = async () => {
    try {
      const response = await api.get('/weather/current');
      setCurrentWeather(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching current weather:', err);
      setError('Failed to load current weather');
    }
  };

  const fetchForecast = async () => {
    try {
      const response = await api.get('/weather/forecast');
      setForecast(response.data);
    } catch (err) {
      console.error('Error fetching weather forecast:', err);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await api.get('/weather/zones');
      setZones(response.data);
    } catch (err) {
      console.error('Error fetching weather zones:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/weather/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching weather stats:', err);
    }
  };

  const getZoneWeather = async (zoneId: string): Promise<WeatherState | null> => {
    try {
      const response = await api.get(`/weather/zones/${zoneId}`);
      return response.data;
    } catch (err) {
      console.error('Error fetching zone weather:', err);
      return null;
    }
  };

  const refreshWeather = async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCurrentWeather(),
        fetchForecast(),
        fetchZones(),
        fetchStats()
      ]);
      setError(null);
    } catch (err) {
      setError('Failed to refresh weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWeather();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('weather:changed', ({ weather }) => {
      setCurrentWeather(weather);
    });

    socket.on('weather:transition-start', ({ from, to, duration }) => {
      // Handle weather transition start
      console.log('Weather transition starting', { from, to, duration });
    });

    socket.on('weather:transition-step', ({ weather, progress }) => {
      setCurrentWeather(weather);
    });

    socket.on('zone-weather:changed', ({ zoneId, weather }) => {
      setZones(current =>
        current.map(zone =>
          zone.id === zoneId
            ? { ...zone, currentWeather: weather }
            : zone
        )
      );
    });

    socket.on('zone-weather:transition-step', ({ zoneId, weather }) => {
      setZones(current =>
        current.map(zone =>
          zone.id === zoneId
            ? { ...zone, currentWeather: weather }
            : zone
        )
      );
    });

    // Refresh weather data periodically
    const refreshInterval = setInterval(refreshWeather, 300000); // 5 minutes

    return () => {
      socket.off('weather:changed');
      socket.off('weather:transition-start');
      socket.off('weather:transition-step');
      socket.off('zone-weather:changed');
      socket.off('zone-weather:transition-step');
      clearInterval(refreshInterval);
    };
  }, []);

  return {
    currentWeather,
    forecast,
    zones,
    stats,
    loading,
    error,
    getZoneWeather,
    refreshWeather
  };
}