import { useState, useEffect } from 'react';
import { Season, SeasonalEvent } from '../types/seasonalEvents';
import { api } from '../services/api';

interface UseSeasonalEventsResult {
  currentSeason: Season | null;
  upcomingSeasons: Season[];
  loading: boolean;
  error: string | null;
  joinEvent: (eventId: string) => Promise<void>;
  updateEventProgress: (eventId: string, objectiveType: string, progress: number) => Promise<void>;
  getEventProgress: (eventId: string) => Promise<number[]>;
  refreshSeasons: () => Promise<void>;
}

export function useSeasonalEvents(): UseSeasonalEventsResult {
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [upcomingSeasons, setUpcomingSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const [currentResponse, upcomingResponse] = await Promise.all([
        api.get('/seasonal-events/current'),
        api.get('/seasonal-events/upcoming')
      ]);

      setCurrentSeason(currentResponse.data);
      setUpcomingSeasons(upcomingResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load seasonal events');
      console.error('Error fetching seasonal events:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      await api.post(`/seasonal-events/${eventId}/join`);
      
      // Update local state to reflect participation
      if (currentSeason) {
        const updatedEvents = currentSeason.events.map(event =>
          event.id === eventId
            ? {
                ...event,
                participants: [...event.participants, 'currentUser'] // Replace with actual user ID
              }
            : event
        );

        setCurrentSeason({
          ...currentSeason,
          events: updatedEvents
        });
      }
    } catch (err) {
      console.error('Error joining event:', err);
      throw err;
    }
  };

  const updateEventProgress = async (
    eventId: string,
    objectiveType: string,
    progress: number
  ) => {
    try {
      await api.post(`/seasonal-events/${eventId}/progress`, {
        objectiveType,
        progress
      });

      // Update local state to reflect progress
      if (currentSeason) {
        const updatedEvents = currentSeason.events.map(event => {
          if (event.id === eventId) {
            const updatedObjectives = event.objectives.map(objective =>
              objective.type === objectiveType
                ? {
                    ...objective,
                    current: Math.min(objective.current + progress, objective.target),
                    completed: objective.current + progress >= objective.target
                  }
                : objective
            );

            return {
              ...event,
              objectives: updatedObjectives
            };
          }
          return event;
        });

        setCurrentSeason({
          ...currentSeason,
          events: updatedEvents
        });
      }
    } catch (err) {
      console.error('Error updating event progress:', err);
      throw err;
    }
  };

  const getEventProgress = async (eventId: string): Promise<number[]> => {
    try {
      const response = await api.get(`/seasonal-events/${eventId}/progress`);
      return response.data;
    } catch (err) {
      console.error('Error getting event progress:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSeasons();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('seasonStarted', (season: Season) => {
      setCurrentSeason(season);
      setUpcomingSeasons(prev => prev.filter(s => s.id !== season.id));
    });

    socket.on('seasonEnded', (season: Season) => {
      if (currentSeason?.id === season.id) {
        setCurrentSeason(null);
        fetchSeasons(); // Refresh to get the new current season
      }
    });

    socket.on('eventStarted', (event: SeasonalEvent) => {
      if (currentSeason) {
        const updatedEvents = currentSeason.events.map(e =>
          e.id === event.id ? event : e
        );
        setCurrentSeason({
          ...currentSeason,
          events: updatedEvents
        });
      }
    });

    socket.on('eventEnded', (event: SeasonalEvent) => {
      if (currentSeason) {
        const updatedEvents = currentSeason.events.map(e =>
          e.id === event.id ? event : e
        );
        setCurrentSeason({
          ...currentSeason,
          events: updatedEvents
        });
      }
    });

    socket.on('progressUpdated', (data: {
      eventId: string;
      objectiveType: string;
      progress: number;
      completed: boolean;
    }) => {
      if (currentSeason) {
        const updatedEvents = currentSeason.events.map(event => {
          if (event.id === data.eventId) {
            const updatedObjectives = event.objectives.map(objective =>
              objective.type === data.objectiveType
                ? {
                    ...objective,
                    current: data.progress,
                    completed: data.completed
                  }
                : objective
            );

            return {
              ...event,
              objectives: updatedObjectives
            };
          }
          return event;
        });

        setCurrentSeason({
          ...currentSeason,
          events: updatedEvents
        });
      }
    });

    return () => {
      socket.off('seasonStarted');
      socket.off('seasonEnded');
      socket.off('eventStarted');
      socket.off('eventEnded');
      socket.off('progressUpdated');
    };
  }, []);

  return {
    currentSeason,
    upcomingSeasons,
    loading,
    error,
    joinEvent,
    updateEventProgress,
    getEventProgress,
    refreshSeasons: fetchSeasons
  };
}
