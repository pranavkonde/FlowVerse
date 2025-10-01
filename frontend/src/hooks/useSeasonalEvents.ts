import { useState, useEffect } from 'react';
import {
  EventCalendar,
  EventProgress,
  RequirementType,
  SeasonalEvent
} from '../types/seasonalEvents';
import { api } from '../services/api';

interface UseSeasonalEventsResult {
  calendar: EventCalendar | null;
  loading: boolean;
  error: string | null;
  refreshCalendar: () => Promise<void>;
  joinEvent: (eventId: string) => Promise<EventProgress>;
  updateProgress: (
    eventId: string,
    requirementType: RequirementType,
    amount: number
  ) => Promise<EventProgress>;
  claimReward: (eventId: string, rewardIndex: number) => Promise<EventProgress>;
}

export function useSeasonalEvents(): UseSeasonalEventsResult {
  const [calendar, setCalendar] = useState<EventCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seasonal-events/calendar');
      setCalendar(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load event calendar');
      console.error('Error fetching calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string): Promise<EventProgress> => {
    try {
      const response = await api.post('/seasonal-events/join', { eventId });
      
      setCalendar(current => {
        if (!current) return null;

        const updatedActiveEvents = current.activeEvents.map(event =>
          event.id === eventId
            ? { ...event, participants: [...event.participants, 'currentUser'] }
            : event
        );

        return {
          ...current,
          activeEvents: updatedActiveEvents,
          userProgress: {
            ...current.userProgress,
            [eventId]: response.data
          }
        };
      });

      return response.data;
    } catch (err) {
      console.error('Error joining event:', err);
      throw err;
    }
  };

  const updateProgress = async (
    eventId: string,
    requirementType: RequirementType,
    amount: number
  ): Promise<EventProgress> => {
    try {
      const response = await api.post('/seasonal-events/progress', {
        eventId,
        requirementType,
        amount
      });
      
      setCalendar(current => {
        if (!current) return null;
        return {
          ...current,
          userProgress: {
            ...current.userProgress,
            [eventId]: response.data
          }
        };
      });

      return response.data;
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  };

  const claimReward = async (
    eventId: string,
    rewardIndex: number
  ): Promise<EventProgress> => {
    try {
      const response = await api.post('/seasonal-events/claim', {
        eventId,
        rewardIndex
      });
      
      setCalendar(current => {
        if (!current) return null;
        return {
          ...current,
          userProgress: {
            ...current.userProgress,
            [eventId]: response.data
          }
        };
      });

      return response.data;
    } catch (err) {
      console.error('Error claiming reward:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCalendar();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('season:changed', () => {
      fetchCalendar();
    });

    socket.on('event:started', ({ eventId }) => {
      setCalendar(current => {
        if (!current) return null;

        const event = current.upcomingEvents.find(e => e.id === eventId);
        if (!event) return current;

        const updatedEvent = { ...event, status: 'ACTIVE' };
        return {
          ...current,
          activeEvents: [...current.activeEvents, updatedEvent],
          upcomingEvents: current.upcomingEvents.filter(e => e.id !== eventId)
        };
      });
    });

    socket.on('event:completed', ({ eventId }) => {
      setCalendar(current => {
        if (!current) return null;

        const event = current.activeEvents.find(e => e.id === eventId);
        if (!event) return current;

        const updatedEvent = { ...event, status: 'COMPLETED' };
        return {
          ...current,
          activeEvents: current.activeEvents.filter(e => e.id !== eventId),
          completedEvents: [...current.completedEvents, updatedEvent]
        };
      });
    });

    socket.on('progress:updated', ({ eventId, progress }) => {
      setCalendar(current => {
        if (!current) return null;
        return {
          ...current,
          userProgress: {
            ...current.userProgress,
            [eventId]: progress
          }
        };
      });
    });

    return () => {
      socket.off('season:changed');
      socket.off('event:started');
      socket.off('event:completed');
      socket.off('progress:updated');
    };
  }, []);

  return {
    calendar,
    loading,
    error,
    refreshCalendar: fetchCalendar,
    joinEvent,
    updateProgress,
    claimReward
  };
}