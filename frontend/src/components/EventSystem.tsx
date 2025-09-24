'use client';

import React, { useState, useEffect } from 'react';
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
}

const EventSystem: React.FC<EventSystemProps> = ({ 
  userId, 
  onEventJoin, 
  onEventLeave 
}) => {
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [userParticipation, setUserParticipation] = useState<EventParticipation[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventLeaderboard, setEventLeaderboard] = useState<EventLeaderboard | null>(null);
  const [eventObjectives, setEventObjectives] = useState<EventObjective[]>([]);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'participation' | 'notifications'>('active');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event System</h1>
        <p className="text-gray-600">Participate in seasonal events, limited-time activities, and community challenges</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'active', label: 'Active Events', count: activeEvents.length },
          { key: 'upcoming', label: 'Upcoming', count: upcomingEvents.length },
          { key: 'participation', label: 'My Events', count: userParticipation.length },
          { key: 'notifications', label: 'Notifications', count: notifications.filter(n => !n.isRead).length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Events Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🎯</div>
              <p>No active events at the moment</p>
              <p className="text-sm">Check back later for new events!</p>
            </div>
          ) : (
            activeEvents.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getEventStatusColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-500">
                      {formatTimeRemaining(event)} remaining
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>🎁 {event.rewards.length} rewards</span>
                    <span>👥 {event.participants.length} participants</span>
                    <span>⭐ {event.metadata.difficulty}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                    >
                      View Details
                    </button>
                    {isUserParticipating(event.id) ? (
                      <button
                        onClick={() => handleLeaveEvent(event.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Leave Event
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Join Event
                      </button>
                    )}
                  </div>
                </div>

                {isUserParticipating(event.id) && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{getEventProgress(event.id)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📅</div>
              <p>No upcoming events scheduled</p>
            </div>
          ) : (
            upcomingEvents.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getEventStatusColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-500">
                      Starts in {formatTimeRemaining(event)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>🎁 {event.rewards.length} rewards</span>
                    <span>⭐ {event.metadata.difficulty}</span>
                    <span>🏷️ {event.metadata.theme}</span>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
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
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🎮</div>
              <p>You're not participating in any events</p>
              <p className="text-sm">Join an event to start earning rewards!</p>
            </div>
          ) : (
            userParticipation.map(participation => {
              const event = [...activeEvents, ...upcomingEvents].find(e => e.id === participation.eventId);
              if (!event) return null;

              return (
                <div key={participation.eventId} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getEventTypeIcon(event.type)}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                        <p className="text-gray-600">Joined {participation.joinedAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${getEventStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-500">
                        {participation.rewardsClaimed.length} rewards claimed
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{participation.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${participation.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span>Completed: {participation.completedObjectives.length} objectives</span>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔔</div>
              <p>No event notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`bg-white rounded-lg shadow-md p-4 ${
                  !notification.isRead ? 'border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                    <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {notification.timestamp.toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkNotificationAsRead(notification.id)}
                      className="ml-4 px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
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

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getEventTypeIcon(selectedEvent.type)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.name}</h2>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{selectedEvent.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="capitalize">{selectedEvent.metadata.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Theme:</span>
                      <span>{selectedEvent.metadata.theme}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span>{formatTimeRemaining(selectedEvent)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Rewards</h3>
                  <div className="space-y-2">
                    {selectedEvent.rewards.map(reward => (
                      <div key={reward.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{reward.description}</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
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
                  <h3 className="font-semibold text-gray-900 mb-3">Objectives</h3>
                  <div className="space-y-3">
                    {eventObjectives.map(objective => (
                      <div key={objective.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{objective.title}</h4>
                          {objective.isCompleted && (
                            <span className="text-green-600 text-sm">✓ Completed</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{objective.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress: {objective.current}/{objective.target}</span>
                          <span className="text-gray-500">{objective.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              {eventLeaderboard && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Leaderboard</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {eventLeaderboard.participants.slice(0, 10).map(participant => (
                        <div key={participant.userId} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">#{participant.rank}</span>
                            <span>{participant.username}</span>
                          </div>
                          <span className="text-gray-600">{participant.score} points</span>
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
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Leave Event
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinEvent(selectedEvent.id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Join Event
                  </button>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSystem;
