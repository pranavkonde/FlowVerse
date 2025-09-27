'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellRing,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Search,
  Clock,
  AlertCircle,
  Info,
  CheckCircle,
  Star,
  Users,
  Trophy,
  Coins,
  Shield,
  Heart,
  Zap,
  Crown,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  timestamp: Date;
  read: boolean;
  expiresAt?: Date;
  actions?: Array<{
    id: string;
    label: string;
    action: string;
    data?: any;
  }>;
}

interface NotificationSystemProps {
  userId: string;
  onNotificationAction?: (notificationId: string, actionId: string) => void;
  onClose?: () => void;
  isVisible?: boolean;
}

export default function NotificationSystem({ 
  userId, 
  onNotificationAction, 
  onClose, 
  isVisible = true 
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'categories'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isVisible) {
      loadNotifications();
      setupSocketListeners();
    }
    
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [isVisible, userId]);

  useEffect(() => {
    // Auto-show toast for high priority notifications
    const highPriorityNotifications = notifications.filter(
      n => !n.read && (n.priority === 'high' || n.priority === 'urgent')
    );
    
    if (highPriorityNotifications.length > 0) {
      showToastNotification(highPriorityNotifications[0]);
    }
  }, [notifications]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual service call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: 'You have unlocked the "First Steps" achievement',
          priority: 'medium',
          category: 'achievement',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          read: false,
          actions: [
            { id: 'view', label: 'View Achievement', action: 'view_achievement' },
            { id: 'claim', label: 'Claim Reward', action: 'claim_reward' }
          ]
        },
        {
          id: '2',
          userId,
          type: 'friend_request',
          title: 'New Friend Request',
          message: 'Player123 wants to be your friend',
          priority: 'medium',
          category: 'social',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          read: false,
          actions: [
            { id: 'accept', label: 'Accept', action: 'accept_friend' },
            { id: 'decline', label: 'Decline', action: 'decline_friend' }
          ]
        },
        {
          id: '3',
          userId,
          type: 'quest_complete',
          title: 'Quest Completed!',
          message: 'You have completed the "Daily Challenge" quest',
          priority: 'high',
          category: 'gameplay',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          read: true,
          actions: [
            { id: 'claim', label: 'Claim Rewards', action: 'claim_quest_rewards' }
          ]
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Simulate socket connection - replace with actual socket setup
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      showToastNotification(notification);
    };

    const handleNotificationUpdate = (data: { action: string; notification: Notification }) => {
      if (data.action === 'update') {
        setNotifications(prev => 
          prev.map(n => n.id === data.notification.id ? data.notification : n)
        );
      }
    };

    // In real implementation, these would be socket event listeners
    // socket.on('notification', handleNewNotification);
    // socket.on('notificationUpdate', handleNotificationUpdate);
  };

  const showToastNotification = (notification: Notification) => {
    setToastNotifications(prev => [...prev, notification]);
    
    // Auto-remove toast after 5 seconds
    toastTimeoutRef.current = setTimeout(() => {
      setToastNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Simulate API call
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Simulate API call
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Simulate API call
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationAction = (notificationId: string, actionId: string) => {
    onNotificationAction?.(notificationId, actionId);
    markAsRead(notificationId);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'gameplay':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'economy':
        return <Coins className="w-4 h-4 text-green-500" />;
      case 'combat':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'pet':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'governance':
        return <Crown className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) return false;
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) return false;
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const categories = Array.from(new Set(notifications.map(n => n.category)));

  if (!isVisible) return null;

  return (
    <div className="relative">
      {/* Toast Notifications */}
    <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map(notification => (
          <div
            key={notification.id}
            className={`max-w-sm p-4 rounded-lg shadow-lg border-l-4 ${getPriorityColor(notification.priority)} animate-slide-in-right`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getPriorityIcon(notification.priority)}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => setToastNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {notification.actions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleNotificationAction(notification.id, action.id)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6 text-blue-500" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          ref={notificationRef}
          className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mt-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeTab === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-3 py-1 text-xs rounded-full ${
                    activeTab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Categories
                </button>
              </div>

              {activeTab === 'categories' && (
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    All
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-2 py-1 text-xs rounded capitalize ${
                        selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No notifications match your search' : 'No notifications'}
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getCategoryIcon(notification.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs text-gray-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                            {getPriorityIcon(notification.priority)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex space-x-2 mt-3">
                          {notification.actions.map(action => (
                            <button
                              key={action.id}
                              onClick={() => handleNotificationAction(notification.id, action.id)}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                // Navigate to full notifications page
                console.log('View all notifications');
              }}
              className="w-full text-sm text-blue-500 hover:text-blue-600 text-center"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}