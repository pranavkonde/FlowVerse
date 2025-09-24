'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  Users,
  Trophy,
  Gift,
  Star,
  Filter,
  Search,
  Settings,
  Bell,
  Sparkles,
  TreePine,
  Sun,
  Leaf,
  Snowflake
} from 'lucide-react';
import { 
  Event, 
  EventParticipation, 
  EventLeaderboard, 
  EventObjective,
  EventNotification,
  EventType,
  EventStatus
} from '../types/events';
import { eventService } from '../services/EventService';

interface EventSystemProps {
  userId: string;
  onEventJoin?: (eventId: string) => void;
  onEventLeave?: (eventId: string) => void;
  isVisible?: boolean;
  onToggle?: () => void;
}

const EventSystem: React.FC<EventSystemProps> = ({ 
  userId, 
  onEventJoin, 
  onEventLeave,
  isVisible = true,
  onToggle
}) => {
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [seasonalEvents, setSeasonalEvents] = useState<Event[]>([]);
  const [limitedTimeEvents, setLimitedTimeEvents] = useState<Event[]>([]);
  const [userParticipation, setUserParticipation] = useState<EventParticipation[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventLeaderboard, setEventLeaderboard] = useState<EventLeaderboard | null>(null);
  const [eventObjectives, setEventObjectives] = useState<EventObjective[]>([]);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'seasonal' | 'limited' | 'participation' | 'notifications'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [currentSeason, setCurrentSeason] = useState(eventService.getCurrentSeason());

  useEffect(() => {
    initializeEventSystem();
    return () => {
      eventService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadEventDetails(selectedEvent.id);
    }
  }, [selectedEvent]);

  const initializeEventSystem = async () => {
    try {
      setLoading(true);
      eventService.initializeSocket();
      
      // Load initial data
      await Promise.all([
        loadActiveEvents(),
        loadUpcomingEvents(),
        loadSeasonalEvents(),
        loadLimitedTimeEvents(),
        loadUserParticipation(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error initializing event system:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveEvents = async () => {
    const events = await eventService.getActiveEvents();
    setActiveEvents(events);
  };

  const loadUpcomingEvents = async () => {
    const events = await eventService.getUpcomingEvents();
    setUpcomingEvents(events);
  };

  const loadSeasonalEvents = async () => {
    const events = await eventService.getSeasonalEvents(currentSeason);
    setSeasonalEvents(events);
  };

  const loadLimitedTimeEvents = async () => {
    const events = await eventService.getLimitedTimeEvents();
    setLimitedTimeEvents(events);
  };

  const loadUserParticipation = async () => {
    const participation = await eventService.getUserParticipation(userId);
    setUserParticipation(participation);
  };

  const loadEventDetails = async (eventId: string) => {
    try {
      const [leaderboard, objectives] = await Promise.all([
        eventService.getEventLeaderboard(eventId),
        eventService.getEventObjectives(eventId)
      ]);
      setEventLeaderboard(leaderboard);
      setEventObjectives(objectives);
    } catch (error) {
      console.error('Error loading event details:', error);
    }
  };

  const loadNotifications = async () => {
    const userNotifications = await eventService.getEventNotifications(userId);
    setNotifications(userNotifications);
  };

  const handleJoinEvent = async (eventId: string) => {
    const success = await eventService.joinEvent(eventId, userId);
    if (success) {
      await loadUserParticipation();
      await loadActiveEvents();
      onEventJoin?.(eventId);
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    const success = await eventService.leaveEvent(eventId, userId);
    if (success) {
      await loadUserParticipation();
      await loadActiveEvents();
      onEventLeave?.(eventId);
    }
  };

  const handleClaimReward = async (eventId: string, rewardId: string) => {
    const success = await eventService.claimReward(eventId, rewardId, userId);
    if (success) {
      await loadUserParticipation();
      await loadEventDetails(eventId);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    const success = await eventService.markNotificationAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    }
  };

  const getEventTypeIcon = (type: EventType): string => {
    const icons = {
      seasonal: '🎄',
      limited_time: '⏰',
      community: '👥',
      competitive: '🏆',
      collaborative: '🤝',
      exploration: '🗺️',
      puzzle: '🧩',
      social: '💬'
    };
    return icons[type] || '🎯';
  };

  const getEventStatusColor = (status: EventStatus): string => {
    const colors = {
      upcoming: 'text-blue-600',
      active: 'text-green-600',
      paused: 'text-yellow-600',
      completed: 'text-gray-600',
      cancelled: 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const formatTimeRemaining = (event: Event): string => {
    const timeRemaining = eventService.getEventTimeRemaining(event);
    return eventService.formatEventDuration(timeRemaining);
  };

  const isUserParticipating = (eventId: string): boolean => {
    return userParticipation.some(p => p.eventId === eventId);
  };

  const getEventProgress = (eventId: string): number => {
    const participation = userParticipation.find(p => p.eventId === eventId);
    return participation?.progress || 0;
  };

  // Filter events based on search and filters
  const getFilteredEvents = (events: Event[]): Event[] => {
    return events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesDifficulty = filterDifficulty === 'all' || event.metadata.difficulty === filterDifficulty;
      
      return matchesSearch && matchesType && matchesDifficulty;
    });
  };

  // Get seasonal icon
  const getSeasonalIcon = (season: string) => {
    switch (season) {
      case 'spring': return <Leaf className="w-5 h-5 text-green-400" />;
      case 'summer': return <Sun className="w-5 h-5 text-yellow-400" />;
      case 'autumn': return <Leaf className="w-5 h-5 text-orange-400" />;
      case 'winter': return <Snowflake className="w-5 h-5 text-blue-400" />;
      default: return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get seasonal decorations
  const getSeasonalDecorations = (season: string): string[] => {
    return eventService.getSeasonalDecorations(season);
  };

  // Get seasonal colors
  const getSeasonalColors = (season: string): string[] => {
    return eventService.getSeasonalColors(season);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading events...</span>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-bold">Event System</h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              {getSeasonalIcon(currentSeason)}
              <span className="capitalize">{currentSeason} Season</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white transition-colors p-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as EventType | 'all')}
              className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="seasonal">Seasonal</option>
              <option value="limited_time">Limited Time</option>
              <option value="community">Community</option>
              <option value="competitive">Competitive</option>
              <option value="collaborative">Collaborative</option>
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
      </div>

      {/* Tab Navigation */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex gap-2">
            {[
              { key: 'active', label: 'Active Events', count: activeEvents.length, icon: <Clock className="w-4 h-4" /> },
              { key: 'upcoming', label: 'Upcoming', count: upcomingEvents.length, icon: <Calendar className="w-4 h-4" /> },
              { key: 'seasonal', label: 'Seasonal', count: seasonalEvents.length, icon: getSeasonalIcon(currentSeason) },
              { key: 'limited', label: 'Limited Time', count: limitedTimeEvents.length, icon: <Sparkles className="w-4 h-4" /> },
              { key: 'participation', label: 'My Events', count: userParticipation.length, icon: <Users className="w-4 h-4" /> },
              { key: 'notifications', label: 'Notifications', count: notifications.filter(n => !n.isRead).length, icon: <Bell className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:bg-slate-600'
            }`}
          >
                {tab.icon}
            {tab.label}
            {tab.count > 0 && (
                  <span className="px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
          </div>
      </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
      {/* Active Events Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
              {getFilteredEvents(activeEvents).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">🎯</div>
              <p>No active events at the moment</p>
              <p className="text-sm">Check back later for new events!</p>
            </div>
          ) : (
                getFilteredEvents(activeEvents).map(event => (
                  <div key={event.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-6 hover:border-slate-500 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                    <div>
                          <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                          <p className="text-slate-300">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getEventStatusColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                        <p className="text-sm text-slate-400">
                      {formatTimeRemaining(event)} remaining
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Gift className="w-4 h-4" />
                          {event.rewards.length} rewards
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.participants.length} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {event.metadata.difficulty}
                        </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                          className="px-4 py-2 text-blue-400 border border-blue-400 rounded-md hover:bg-blue-400/10 transition-colors"
                    >
                      View Details
                    </button>
                    {isUserParticipating(event.id) ? (
                      <button
                        onClick={() => handleLeaveEvent(event.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        Leave Event
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Join Event
                      </button>
                    )}
                  </div>
                </div>

                {isUserParticipating(event.id) && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-300">Progress</span>
                          <span className="text-slate-300">{getEventProgress(event.id)}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getEventProgress(event.id)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Seasonal Events Tab */}
          {activeTab === 'seasonal' && (
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3 mb-4">
                  {getSeasonalIcon(currentSeason)}
                  <div>
                    <h3 className="text-white font-medium text-lg capitalize">{currentSeason} Season Events</h3>
                    <p className="text-slate-400 text-sm">Special seasonal content and exclusive rewards</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  {getSeasonalDecorations(currentSeason).map((decoration, index) => (
                    <span key={index} className="text-2xl">{decoration}</span>
                  ))}
                </div>
              </div>
              
              {getFilteredEvents(seasonalEvents).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">{getSeasonalDecorations(currentSeason)[0]}</div>
                  <p>No seasonal events available</p>
                  <p className="text-sm">Check back during the {currentSeason} season!</p>
                </div>
              ) : (
                getFilteredEvents(seasonalEvents).map(event => (
                  <div key={event.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-6 hover:border-slate-500 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                          <p className="text-slate-300">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                              {event.metadata.theme}
                            </span>
                            {event.metadata.specialEffects && (
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                                Special Effects
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getEventStatusColor(event.status)}`}>
                          {event.status.toUpperCase()}
                        </span>
                        <p className="text-sm text-slate-400">
                          {formatTimeRemaining(event)} remaining
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Gift className="w-4 h-4" />
                          {event.rewards.length} rewards
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.participants.length} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {event.metadata.difficulty}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="px-4 py-2 text-blue-400 border border-blue-400 rounded-md hover:bg-blue-400/10 transition-colors"
                        >
                          View Details
                        </button>
                        {isUserParticipating(event.id) ? (
                          <button
                            onClick={() => handleLeaveEvent(event.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                          >
                            Leave Event
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinEvent(event.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                          >
                            Join Event
                          </button>
                        )}
                      </div>
                    </div>

                    {isUserParticipating(event.id) && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-300">Progress</span>
                          <span className="text-slate-300">{getEventProgress(event.id)}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getEventProgress(event.id)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Limited Time Events Tab */}
          {activeTab === 'limited' && (
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <div>
                    <h3 className="text-white font-medium text-lg">Limited Time Events</h3>
                    <p className="text-slate-400 text-sm">Exclusive events with rare rewards - don't miss out!</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                    ⏰ Time Limited
                  </span>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                    💎 Rare Rewards
                  </span>
                </div>
              </div>
              
              {getFilteredEvents(limitedTimeEvents).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">⏰</div>
                  <p>No limited time events available</p>
                  <p className="text-sm">Check back for exclusive events!</p>
                </div>
              ) : (
                getFilteredEvents(limitedTimeEvents).map(event => (
                  <div key={event.id} className="bg-slate-700/50 rounded-lg border border-yellow-500/30 p-6 hover:border-yellow-500/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                          <p className="text-slate-300">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                              Limited Time
                            </span>
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                              {formatTimeRemaining(event)} left
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getEventStatusColor(event.status)}`}>
                          {event.status.toUpperCase()}
                        </span>
                        <p className="text-sm text-slate-400">
                          {formatTimeRemaining(event)} remaining
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Gift className="w-4 h-4" />
                          {event.rewards.length} rewards
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.participants.length} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {event.metadata.difficulty}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="px-4 py-2 text-blue-400 border border-blue-400 rounded-md hover:bg-blue-400/10 transition-colors"
                        >
                          View Details
                        </button>
                        {isUserParticipating(event.id) ? (
                          <button
                            onClick={() => handleLeaveEvent(event.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                          >
                            Leave Event
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinEvent(event.id)}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                          >
                            Join Event
                          </button>
                        )}
                      </div>
                    </div>

                    {isUserParticipating(event.id) && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-300">Progress</span>
                          <span className="text-slate-300">{getEventProgress(event.id)}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getEventProgress(event.id)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Upcoming Events Tab */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
              {getFilteredEvents(upcomingEvents).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">📅</div>
              <p>No upcoming events scheduled</p>
            </div>
          ) : (
                getFilteredEvents(upcomingEvents).map(event => (
                  <div key={event.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-6 hover:border-slate-500 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                    <div>
                          <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                          <p className="text-slate-300">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getEventStatusColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                        <p className="text-sm text-slate-400">
                      Starts in {formatTimeRemaining(event)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Gift className="w-4 h-4" />
                          {event.rewards.length} rewards
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {event.metadata.difficulty}
                        </span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          {event.metadata.theme}
                        </span>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                        className="px-4 py-2 text-blue-400 border border-blue-400 rounded-md hover:bg-blue-400/10 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Events Tab */}
      {activeTab === 'participation' && (
        <div className="space-y-4">
          {userParticipation.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">🎮</div>
              <p>You're not participating in any events</p>
              <p className="text-sm">Join an event to start earning rewards!</p>
            </div>
          ) : (
            userParticipation.map(participation => {
                  const event = [...activeEvents, ...upcomingEvents, ...seasonalEvents, ...limitedTimeEvents].find(e => e.id === participation.eventId);
              if (!event) return null;

              return (
                    <div key={participation.eventId} className="bg-slate-700/50 rounded-lg border border-slate-600 p-6 hover:border-slate-500 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                      <div>
                            <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                            <p className="text-slate-300">Joined {participation.joinedAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${getEventStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                      </span>
                          <p className="text-sm text-slate-400">
                        {participation.rewardsClaimed.length} rewards claimed
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-300">Progress</span>
                          <span className="text-slate-300">{participation.progress}%</span>
                    </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${participation.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                      <span>Completed: {participation.completedObjectives.length} objectives</span>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(event)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      View Progress
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">🔔</div>
              <p>No event notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                    className={`bg-slate-700/50 rounded-lg border p-4 ${
                      !notification.isRead ? 'border-l-4 border-blue-500' : 'border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                        <h4 className="font-semibold text-white">{notification.title}</h4>
                        <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
                        <p className="text-slate-400 text-xs mt-2">
                      {notification.timestamp.toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkNotificationAsRead(notification.id)}
                          className="ml-4 px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getEventTypeIcon(selectedEvent.type)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedEvent.name}</h2>
                      <p className="text-slate-300">{selectedEvent.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Event Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Event Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Type:</span>
                        <span className="capitalize text-white">{selectedEvent.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Difficulty:</span>
                        <span className="capitalize text-white">{selectedEvent.metadata.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Theme:</span>
                        <span className="text-white">{selectedEvent.metadata.theme}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duration:</span>
                        <span className="text-white">{formatTimeRemaining(selectedEvent)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Rewards</h3>
                    <div className="space-y-2">
                      {selectedEvent.rewards.map(reward => (
                        <div key={reward.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">{reward.description}</span>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                            {reward.rarity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Objectives */}
                {eventObjectives.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-white mb-3">Objectives</h3>
                    <div className="space-y-3">
                      {eventObjectives.map(objective => (
                        <div key={objective.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{objective.title}</h4>
                            {objective.isCompleted && (
                              <span className="text-green-400 text-sm">✓ Completed</span>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm mb-2">{objective.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Progress: {objective.current}/{objective.target}</span>
                            <span className="text-slate-500">{objective.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leaderboard */}
                {eventLeaderboard && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-white mb-3">Leaderboard</h3>
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <div className="space-y-2">
                        {eventLeaderboard.participants.slice(0, 10).map(participant => (
                          <div key={participant.userId} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white">#{participant.rank}</span>
                              <span className="text-slate-300">{participant.username}</span>
                            </div>
                            <span className="text-slate-400">{participant.score} points</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {isUserParticipating(selectedEvent.id) ? (
                    <button
                      onClick={() => handleLeaveEvent(selectedEvent.id)}
                      className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                      Leave Event
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinEvent(selectedEvent.id)}
                      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Join Event
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSystem;
