import React, { useState, useEffect } from 'react';
import { SocialHub, SocialEvent, Party, SocialStats, SOCIAL_NOTIFICATIONS } from '../types/social';
import { useSocket } from '../hooks/useSocket';
import SocialService from '../services/SocialService';
import SocialHub as SocialHubComponent from './SocialHub';
import SocialEvents from './SocialEvents';
import SocialParties from './SocialParties';

interface SocialSystemProps {
  onNotification?: (notification: any) => void;
}

const SocialSystem: React.FC<SocialSystemProps> = ({ onNotification }) => {
  const [activeTab, setActiveTab] = useState<'hubs' | 'events' | 'parties' | 'stats'>('hubs');
  const [currentHub, setCurrentHub] = useState<SocialHub | null>(null);
  const [currentEvent, setCurrentEvent] = useState<SocialEvent | null>(null);
  const [currentParty, setCurrentParty] = useState<Party | null>(null);
  const [userStats, setUserStats] = useState<SocialStats | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const socket = useSocket();
  const socialService = new SocialService(socket);

  useEffect(() => {
    loadUserStats();
    setupNotificationListeners();
    
    return () => {
      cleanupNotificationListeners();
    };
  }, []);

  const loadUserStats = async () => {
    try {
      const stats = await socialService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const setupNotificationListeners = () => {
    // Hub notifications
    socialService.onNotification(SOCIAL_NOTIFICATIONS.HUB_INVITATION, (data: any) => {
      addNotification('Hub Invitation', `You've been invited to join ${data.hubName}`, 'info');
    });

    // Event notifications
    socialService.onNotification(SOCIAL_NOTIFICATIONS.EVENT_INVITATION, (data: any) => {
      addNotification('Event Invitation', `You've been invited to ${data.eventName}`, 'info');
    });

    socialService.onNotification(SOCIAL_NOTIFICATIONS.EVENT_STARTING, (data: any) => {
      addNotification('Event Starting', `${data.eventName} is starting soon!`, 'warning');
    });

    socialService.onNotification(SOCIAL_NOTIFICATIONS.EVENT_ENDING, (data: any) => {
      addNotification('Event Ending', `${data.eventName} is ending soon!`, 'info');
    });

    // Party notifications
    socialService.onNotification(SOCIAL_NOTIFICATIONS.PARTY_INVITATION, (data: any) => {
      addNotification('Party Invitation', `You've been invited to join ${data.partyName}`, 'info');
    });

    socialService.onNotification(SOCIAL_NOTIFICATIONS.PARTY_UPDATE, (data: any) => {
      addNotification('Party Update', data.message, 'info');
    });

    // Reward notifications
    socialService.onNotification(SOCIAL_NOTIFICATIONS.REWARD_AVAILABLE, (data: any) => {
      addNotification('Reward Available', `You've earned a reward: ${data.rewardName}`, 'success');
    });

    socialService.onNotification(SOCIAL_NOTIFICATIONS.ACHIEVEMENT_UNLOCKED, (data: any) => {
      addNotification('Achievement Unlocked', `Achievement: ${data.achievementName}`, 'success');
    });

    // Rule notifications
    socialService.onNotification(SOCIAL_NOTIFICATIONS.RULE_VIOLATION, (data: any) => {
      addNotification('Rule Violation', data.message, 'error');
    });

    socialService.onNotification(SOCIAL_NOTIFICATIONS.RULE_ACTION, (data: any) => {
      addNotification('Rule Action', data.message, 'warning');
    });

    // Interaction notifications
    socialService.onNotification(SOCIAL_NOTIFICATIONS.INTERACTION_RECEIVED, (data: any) => {
      addNotification('New Interaction', data.message, 'info');
    });

    socialService.onNotification(SOCIAL_NOTIFICATIONS.REACTION_RECEIVED, (data: any) => {
      addNotification('New Reaction', data.message, 'info');
    });
  };

  const cleanupNotificationListeners = () => {
    // Cleanup would be handled by the service
  };

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    onNotification?.(notification);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string): string => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  };

  const getNotificationColor = (type: string): string => {
    const colors = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Social System</h1>
        <p className="text-gray-600">Connect with other players, join events, and build communities</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'hubs', label: 'Hubs', icon: '🏠' },
            { id: 'events', label: 'Events', icon: '📅' },
            { id: 'parties', label: 'Parties', icon: '🎊' },
            { id: 'stats', label: 'Stats', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-3 flex items-center justify-between ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <div>
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm opacity-90">{notification.message}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs opacity-75">{formatTime(notification.timestamp)}</span>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-lg hover:opacity-75"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'hubs' && (
          <div className="p-6">
            <SocialHubComponent
              hubId={currentHub?.id}
              onHubChange={setCurrentHub}
            />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="p-6">
            <SocialEvents
              hubId={currentHub?.id}
              onEventSelect={setCurrentEvent}
            />
          </div>
        )}

        {activeTab === 'parties' && (
          <div className="p-6">
            <SocialParties
              onPartySelect={setCurrentParty}
            />
          </div>
        )}

        {activeTab === 'stats' && userStats && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Events Attended</p>
                    <p className="text-2xl font-bold text-blue-900">{userStats.totalEventsAttended}</p>
                  </div>
                  <div className="text-2xl">📅</div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Events Organized</p>
                    <p className="text-2xl font-bold text-green-900">{userStats.totalEventsOrganized}</p>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Parties Joined</p>
                    <p className="text-2xl font-bold text-purple-900">{userStats.totalPartiesJoined}</p>
                  </div>
                  <div className="text-2xl">🎊</div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Reputation</p>
                    <p className="text-2xl font-bold text-orange-900">{userStats.reputation}</p>
                  </div>
                  <div className="text-2xl">⭐</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">📅</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Events Attended</p>
                      <p className="text-xs text-gray-500">{userStats.totalEventsAttended} total</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🎊</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Parties Joined</p>
                      <p className="text-xs text-gray-500">{userStats.totalPartiesJoined} total</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Interactions</p>
                      <p className="text-xs text-gray-500">{userStats.totalInteractions} total</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                <div className="space-y-3">
                  {userStats.achievements.length > 0 ? (
                    userStats.achievements.slice(0, 5).map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="text-lg">🏆</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{achievement}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No achievements yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialSystem;
