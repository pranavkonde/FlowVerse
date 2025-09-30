import { useState, useEffect } from 'react';
import {
  WeatherEffect,
  WeatherZone
} from '../types/weatherEffects';
import { api } from '../services/api';

interface UseWeatherEffectsResult {
  playerWeather: {
    zoneId: string | null;
    effect: WeatherEffect | null;
    nextEffect: WeatherEffect | null;
    transitionProgress: number;
  };
  zones: WeatherZone[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useWeatherEffects(): UseWeatherEffectsResult {
  const [playerWeather, setPlayerWeather] = useState<{
    zoneId: string | null;
    effect: WeatherEffect | null;
    nextEffect: WeatherEffect | null;
    transitionProgress: number;
  }>({
    zoneId: null,
    effect: null,
    nextEffect: null,
    transitionProgress: 0
  });
  const [zones, setZones] = useState<WeatherZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [playerResponse, zonesResponse] = await Promise.all([
        api.get('/weather/player'),
        api.get('/weather/zones')
      ]);

      setPlayerWeather(playerResponse.data);
      setZones(zonesResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('weatherChanged', ({ zoneId, effect }: { zoneId: string; effect: WeatherEffect }) => {
      setZones(current =>
        current.map(zone =>
          zone.id === zoneId
            ? { ...zone, currentEffect: effect, nextEffect: null, transitionProgress: 0 }
            : zone
        )
      );

      if (playerWeather.zoneId === zoneId) {
        setPlayerWeather(current => ({
          ...current,
          effect,
          nextEffect: null,
          transitionProgress: 0
        }));
      }
    });

    socket.on('weatherTransitionStarted', ({
      zoneId,
      fromEffect,
      toEffect
    }: {
      zoneId: string;
      fromEffect: WeatherEffect | null;
      toEffect: WeatherEffect;
    }) => {
      setZones(current =>
        current.map(zone =>
          zone.id === zoneId
            ? {
                ...zone,
                currentEffect: fromEffect,
                nextEffect: toEffect,
                transitionProgress: 0
              }
            : zone
        )
      );

      if (playerWeather.zoneId === zoneId) {
        setPlayerWeather(current => ({
          ...current,
          effect: fromEffect,
          nextEffect: toEffect,
          transitionProgress: 0
        }));
      }
    });

    socket.on('playerEnteredWeatherZone', ({
      playerId,
      zoneId,
      effect
    }: {
      playerId: string;
      zoneId: string;
      effect: WeatherEffect;
    }) => {
      setZones(current =>
        current.map(zone =>
          zone.id === zoneId
            ? {
                ...zone,
                affectedPlayers: [...zone.affectedPlayers, playerId]
              }
            : zone
        )
      );

      // Update player weather if it's the current user
      if (playerId === 'currentUser') { // Replace with actual user ID check
        setPlayerWeather({
          zoneId,
          effect,
          nextEffect: null,
          transitionProgress: 0
        });
      }
    });

    socket.on('playerLeftWeatherZone', ({ playerId }: { playerId: string }) => {
      setZones(current =>
        current.map(zone => ({
          ...zone,
          affectedPlayers: zone.affectedPlayers.filter(id => id !== playerId)
        }))
      );

      // Clear player weather if it's the current user
      if (playerId === 'currentUser') { // Replace with actual user ID check
        setPlayerWeather({
          zoneId: null,
          effect: null,
          nextEffect: null,
          transitionProgress: 0
        });
      }
    });

    // Listen for gameplay effect updates
    socket.on('playerSpeedModified', ({ multiplier }: { multiplier: number }) => {
      // Update player movement speed in game engine
      window.dispatchEvent(new CustomEvent('updatePlayerSpeed', { detail: { multiplier } }));
    });

    socket.on('combatModifiersUpdated', ({
      modifiers
    }: {
      modifiers: WeatherEffect['gameplayEffects']['combatModifiers'];
    }) => {
      // Update combat modifiers in game engine
      window.dispatchEvent(new CustomEvent('updateCombatModifiers', { detail: { modifiers } }));
    });

    socket.on('resourceGatheringModified', ({ multiplier }: { multiplier: number }) => {
      // Update resource gathering rate in game engine
      window.dispatchEvent(new CustomEvent('updateGatheringRate', { detail: { multiplier } }));
    });

    socket.on('fishingSuccessModified', ({ multiplier }: { multiplier: number }) => {
      // Update fishing success rate in game engine
      window.dispatchEvent(new CustomEvent('updateFishingSuccess', { detail: { multiplier } }));
    });

    return () => {
      socket.off('weatherChanged');
      socket.off('weatherTransitionStarted');
      socket.off('playerEnteredWeatherZone');
      socket.off('playerLeftWeatherZone');
      socket.off('playerSpeedModified');
      socket.off('combatModifiersUpdated');
      socket.off('resourceGatheringModified');
      socket.off('fishingSuccessModified');
    };
  }, []);

  return {
    playerWeather,
    zones,
    loading,
    error,
    refreshData: fetchData
  };
}
