import React, { useState, useEffect } from 'react';
import { SocialEvent, EventType, EventStatus, SOCIAL_EVENTS } from '../types/social';
import { useSocket } from '../hooks/useSocket';
import SocialService from '../services/SocialService';

interface SocialEventsProps {
  hubId?: string;
  onEventSelect?: (event: SocialEvent) => void;
}

const SocialEvents: React.FC<SocialEventsProps> = ({ hubId, onEventSelect }) => {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SocialEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ type?: EventType; status?: EventStatus }>({});
  
  const socket = useSocket();
  const socialService = new SocialService(socket);

  useEffect(() => {
    loadEvents();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, [hubId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventList = await socialService.getEvents({ ...filters, hubId });
      setEvents(eventList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    socialService.on(SOCIAL_EVENTS.EVENT_CREATED, (data: any) => {
      if (!hubId || data.hubId === hubId) {
        setEvents(prev => [data, ...prev]);
      }
    });

    socialService.on(SOCIAL_EVENTS.EVENT_UPDATED, (data: any) => {
      setEvents(prev => prev.map(event => event.id === data.id ? data : event));
      if (selectedEvent?.id === data.id) {
        setSelectedEvent(data);
        onEventSelect?.(data);
      }
    });

    socialService.on(SOCIAL_EVENTS.EVENT_STARTED, (data: any) => {
      setEvents(prev => prev.map(event => event.id === data.id ? { ...event, status: 'active' } : event));
    });

    socialService.on(SOCIAL_EVENTS.EVENT_ENDED, (data: any) => {
      setEvents(prev => prev.map(event => event.id === data.id ? { ...event, status: 'completed' } : event));
    });
  };

  const cleanupEventListeners = () => {
    // Cleanup would be handled by the service
  };

  const handleJoinEvent = async (event: SocialEvent) => {
    try {
      setLoading(true);
      await socialService.joinEvent(event.id);
      setSelectedEvent(event);
      onEventSelect?.(event);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join event');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      await socialService.leaveEvent(selectedEvent.id);
      setSelectedEvent(null);
      onEventSelect?.(null as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave event');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: { type?: EventType; status?: EventStatus }) => {
    setFilters(newFilters);
    loadEvents();
  };

  const getEventTypeColor = (type: EventType): string => {
    const colors = {
      party: 'bg-pink-100 text-pink-800',
      tournament: 'bg-red-100 text-red-800',
      contest: 'bg-yellow-100 text-yellow-800',
      workshop: 'bg-blue-100 text-blue-800',
      meetup: 'bg-green-100 text-green-800',
      celebration: 'bg-purple-100 text-purple-800',
      competition: 'bg-orange-100 text-orange-800',
      collaboration: 'bg-indigo-100 text-indigo-800',
      education: 'bg-teal-100 text-teal-800',
      entertainment: 'bg-cyan-100 text-cyan-800',
      social: 'bg-gray-100 text-gray-800',
      gaming: 'bg-emerald-100 text-emerald-800',
      trading: 'bg-amber-100 text-amber-800',
      community: 'bg-rose-100 text-rose-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getEventTypeIcon = (type: EventType): string => {
    const icons = {
      party: '🎉',
      tournament: '🏆',
      contest: '🥇',
      workshop: '🔧',
      meetup: '🤝',
      celebration: '🎊',
      competition: '⚔️',
      collaboration: '🤝',
      education: '📚',
      entertainment: '🎭',
      social: '👥',
      gaming: '🎮',
      trading: '💰',
      community: '🏘️'
    };
    return icons[type] || '📅';
  };

  const getStatusColor = (status: EventStatus): string => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      postponed: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilEvent = (startTime: Date): string => {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    
    if (diff < 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400 mr-2">⚠️</div>
          <div className="text-red-800">{error}</div>
        </div>
        <button 
          onClick={loadEvents}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Social Events</h2>
        <div className="flex space-x-2">
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange({ ...filters, type: e.target.value as EventType || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="party">Party</option>
            <option value="tournament">Tournament</option>
            <option value="contest">Contest</option>
            <option value="workshop">Workshop</option>
            <option value="meetup">Meetup</option>
            <option value="celebration">Celebration</option>
            <option value="competition">Competition</option>
            <option value="collaboration">Collaboration</option>
            <option value="education">Education</option>
            <option value="entertainment">Entertainment</option>
            <option value="social">Social</option>
            <option value="gaming">Gaming</option>
            <option value="trading">Trading</option>
            <option value="community">Community</option>
          </select>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange({ ...filters, status: e.target.value as EventStatus || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="postponed">Postponed</option>
          </select>
        </div>
      </div>

      {/* Selected Event */}
      {selectedEvent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getEventTypeIcon(selectedEvent.type)}</span>
              <div>
                <h3 className="text-lg font-semibold text-green-900">{selectedEvent.name}</h3>
                <p className="text-green-700">{selectedEvent.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(selectedEvent.type)}`}>
                    {selectedEvent.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status}
                  </span>
                  <span className="text-sm text-green-600">
                    {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} participants
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLeaveEvent}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Leave Event
            </button>
          </div>
        </div>
      )}

      {/* Event List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              selectedEvent?.id === event.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getEventTypeIcon(event.type)}</span>
                <h3 className="font-semibold text-gray-900">{event.name}</h3>
              </div>
              <div className="flex flex-col space-y-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                  {event.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>📅 {formatDate(event.startTime)}</span>
                <span>⏱️ {getTimeUntilEvent(event.startTime)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>👥 {event.currentParticipants}/{event.maxParticipants}</span>
                <span>🎁 {event.rewards.length} rewards</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {event.metadata.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleJoinEvent(event)}
                disabled={loading || selectedEvent?.id === event.id || event.status !== 'scheduled'}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedEvent?.id === event.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : event.status !== 'scheduled'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {selectedEvent?.id === event.id ? 'Joined' : event.status !== 'scheduled' ? 'Unavailable' : 'Join'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📅</div>
          <p className="text-gray-600">No events found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default SocialEvents;
