import { Server as SocketIOServer } from 'socket.io';
import { EventEmitter } from 'events';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority: NotificationPriority;
  category: NotificationCategory;
  timestamp: Date;
  read: boolean;
  expiresAt?: Date;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  data?: any;
}

export enum NotificationType {
  ACHIEVEMENT = 'achievement',
  FRIEND_REQUEST = 'friend_request',
  GUILD_INVITE = 'guild_invite',
  QUEST_COMPLETE = 'quest_complete',
  LEVEL_UP = 'level_up',
  TRADE_OFFER = 'trade_offer',
  PET_CARE = 'pet_care',
  COMBAT_RESULT = 'combat_result',
  MARKETPLACE_SALE = 'marketplace_sale',
  STAKING_REWARD = 'staking_reward',
  GOVERNANCE_VOTE = 'governance_vote',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  EVENT_START = 'event_start',
  EVENT_END = 'event_end',
  CUSTOM = 'custom'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationCategory {
  SOCIAL = 'social',
  GAMEPLAY = 'gameplay',
  ECONOMY = 'economy',
  SYSTEM = 'system',
  ACHIEVEMENT = 'achievement',
  COMBAT = 'combat',
  PET = 'pet',
  GOVERNANCE = 'governance'
}

export interface NotificationPreferences {
  userId: string;
  categories: {
    [key in NotificationCategory]: {
      enabled: boolean;
      priority: NotificationPriority;
      channels: NotificationChannel[];
    };
  };
  channels: {
    [key in NotificationChannel]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
}

export enum NotificationChannel {
  IN_GAME = 'in_game',
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms'
}

export interface NotificationStats {
  userId: string;
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  categoryStats: {
    [key in NotificationCategory]: {
      total: number;
      unread: number;
      read: number;
    };
  };
  priorityStats: {
    [key in NotificationPriority]: number;
  };
}

export class NotificationService extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private userNotifications: Map<string, string[]> = new Map();
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    super();
    this.io = io;
    this.initializeDefaultPreferences();
    this.startNotificationCleanup();
  }

  // Create a new notification
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options: {
      priority?: NotificationPriority;
      category?: NotificationCategory;
      data?: any;
      expiresAt?: Date;
      actions?: NotificationAction[];
    } = {}
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      userId,
      type,
      title,
      message,
      priority: options.priority || NotificationPriority.MEDIUM,
      category: options.category || this.getCategoryFromType(type),
      data: options.data,
      timestamp: new Date(),
      read: false,
      expiresAt: options.expiresAt,
      actions: options.actions
    };

    // Check if user wants to receive this type of notification
    const preferences = this.getUserPreferences(userId);
    if (!this.shouldSendNotification(notification, preferences)) {
      return notification;
    }

    // Store notification
    this.notifications.set(notification.id, notification);
    
    // Add to user's notification list
    if (!this.userNotifications.has(userId)) {
      this.userNotifications.set(userId, []);
    }
    this.userNotifications.get(userId)!.push(notification.id);

    // Send real-time notification
    this.sendRealTimeNotification(notification);

    // Emit event for other services
    this.emit('notificationCreated', notification);

    return notification;
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      category?: NotificationCategory;
      priority?: NotificationPriority;
      unreadOnly?: boolean;
    } = {}
  ): Promise<Notification[]> {
    const userNotificationIds = this.userNotifications.get(userId) || [];
    let notifications = userNotificationIds
      .map(id => this.notifications.get(id))
      .filter(notification => notification && !this.isExpired(notification)) as Notification[];

    // Apply filters
    if (options.category) {
      notifications = notifications.filter(n => n.category === options.category);
    }
    if (options.priority) {
      notifications = notifications.filter(n => n.priority === options.priority);
    }
    if (options.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    return notifications.slice(offset, offset + limit);
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) {
      return false;
    }

    notification.read = true;
    this.emit('notificationRead', notification);
    this.sendRealTimeNotification(notification, 'update');
    return true;
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string, category?: NotificationCategory): Promise<number> {
    const userNotificationIds = this.userNotifications.get(userId) || [];
    let markedCount = 0;

    for (const id of userNotificationIds) {
      const notification = this.notifications.get(id);
      if (notification && !notification.read && !this.isExpired(notification)) {
        if (!category || notification.category === category) {
          notification.read = true;
          markedCount++;
        }
      }
    }

    if (markedCount > 0) {
      this.emit('notificationsMarkedRead', { userId, count: markedCount, category });
      this.io.to(`user:${userId}`).emit('notificationsMarkedRead', { count: markedCount, category });
    }

    return markedCount;
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) {
      return false;
    }

    this.notifications.delete(notificationId);
    
    const userNotificationIds = this.userNotifications.get(userId) || [];
    const index = userNotificationIds.indexOf(notificationId);
    if (index > -1) {
      userNotificationIds.splice(index, 1);
    }

    this.emit('notificationDeleted', notification);
    this.io.to(`user:${userId}`).emit('notificationDeleted', { id: notificationId });
    return true;
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    const userNotificationIds = this.userNotifications.get(userId) || [];
    const notifications = userNotificationIds
      .map(id => this.notifications.get(id))
      .filter(notification => notification && !this.isExpired(notification)) as Notification[];

    const stats: NotificationStats = {
      userId,
      totalNotifications: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      readCount: notifications.filter(n => n.read).length,
      categoryStats: {} as any,
      priorityStats: {} as any
    };

    // Initialize category stats
    Object.values(NotificationCategory).forEach(category => {
      const categoryNotifications = notifications.filter(n => n.category === category);
      stats.categoryStats[category] = {
        total: categoryNotifications.length,
        unread: categoryNotifications.filter(n => !n.read).length,
        read: categoryNotifications.filter(n => n.read).length
      };
    });

    // Initialize priority stats
    Object.values(NotificationPriority).forEach(priority => {
      stats.priorityStats[priority] = notifications.filter(n => n.priority === priority).length;
    });

    return stats;
  }

  // Update user preferences
  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const currentPreferences = this.getUserPreferences(userId);
    const updatedPreferences = { ...currentPreferences, ...preferences };
    
    this.userPreferences.set(userId, updatedPreferences);
    this.emit('preferencesUpdated', { userId, preferences: updatedPreferences });
    
    return updatedPreferences;
  }

  // Get user preferences
  getUserPreferences(userId: string): NotificationPreferences {
    return this.userPreferences.get(userId) || this.getDefaultPreferences(userId);
  }

  // Send bulk notifications
  async sendBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    options: {
      priority?: NotificationPriority;
      category?: NotificationCategory;
      data?: any;
      expiresAt?: Date;
    } = {}
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const userId of userIds) {
      const notification = await this.createNotification(userId, type, title, message, options);
      notifications.push(notification);
    }

    return notifications;
  }

  // Handle notification action
  async handleNotificationAction(
    notificationId: string,
    actionId: string,
    userId: string
  ): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.userId !== userId) {
      return false;
    }

    const action = notification.actions?.find(a => a.id === actionId);
    if (!action) {
      return false;
    }

    // Emit action event for other services to handle
    this.emit('notificationAction', {
      notification,
      action,
      userId
    });

    return true;
  }

  // Private helper methods
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCategoryFromType(type: NotificationType): NotificationCategory {
    const categoryMap: { [key in NotificationType]: NotificationCategory } = {
      [NotificationType.ACHIEVEMENT]: NotificationCategory.ACHIEVEMENT,
      [NotificationType.FRIEND_REQUEST]: NotificationCategory.SOCIAL,
      [NotificationType.GUILD_INVITE]: NotificationCategory.SOCIAL,
      [NotificationType.QUEST_COMPLETE]: NotificationCategory.GAMEPLAY,
      [NotificationType.LEVEL_UP]: NotificationCategory.GAMEPLAY,
      [NotificationType.TRADE_OFFER]: NotificationCategory.ECONOMY,
      [NotificationType.PET_CARE]: NotificationCategory.PET,
      [NotificationType.COMBAT_RESULT]: NotificationCategory.COMBAT,
      [NotificationType.MARKETPLACE_SALE]: NotificationCategory.ECONOMY,
      [NotificationType.STAKING_REWARD]: NotificationCategory.ECONOMY,
      [NotificationType.GOVERNANCE_VOTE]: NotificationCategory.GOVERNANCE,
      [NotificationType.SYSTEM_MAINTENANCE]: NotificationCategory.SYSTEM,
      [NotificationType.EVENT_START]: NotificationCategory.GAMEPLAY,
      [NotificationType.EVENT_END]: NotificationCategory.GAMEPLAY,
      [NotificationType.CUSTOM]: NotificationCategory.SYSTEM
    };

    return categoryMap[type] || NotificationCategory.SYSTEM;
  }

  private shouldSendNotification(
    notification: Notification,
    preferences: NotificationPreferences
  ): boolean {
    const categoryPrefs = preferences.categories[notification.category];
    if (!categoryPrefs.enabled) {
      return false;
    }

    // Check quiet hours
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: preferences.quietHours.timezone 
      });
      
      if (this.isInQuietHours(currentTime, preferences.quietHours.start, preferences.quietHours.end)) {
        // Only send urgent notifications during quiet hours
        return notification.priority === NotificationPriority.URGENT;
      }
    }

    return true;
  }

  private isInQuietHours(currentTime: string, startTime: string, endTime: string): boolean {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);

    if (start <= end) {
      return current >= start && current <= end;
    } else {
      // Quiet hours span midnight
      return current >= start || current <= end;
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private isExpired(notification: Notification): boolean {
    return notification.expiresAt ? new Date() > notification.expiresAt : false;
  }

  private sendRealTimeNotification(notification: Notification, action: 'create' | 'update' | 'delete' = 'create'): void {
    this.io.to(`user:${notification.userId}`).emit('notification', {
      action,
      notification
    });
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      categories: {
        [NotificationCategory.SOCIAL]: {
          enabled: true,
          priority: NotificationPriority.MEDIUM,
          channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH]
        },
        [NotificationCategory.GAMEPLAY]: {
          enabled: true,
          priority: NotificationPriority.MEDIUM,
          channels: [NotificationChannel.IN_GAME]
        },
        [NotificationCategory.ECONOMY]: {
          enabled: true,
          priority: NotificationPriority.HIGH,
          channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH]
        },
        [NotificationCategory.SYSTEM]: {
          enabled: true,
          priority: NotificationPriority.HIGH,
          channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH]
        },
        [NotificationCategory.ACHIEVEMENT]: {
          enabled: true,
          priority: NotificationPriority.MEDIUM,
          channels: [NotificationChannel.IN_GAME]
        },
        [NotificationCategory.COMBAT]: {
          enabled: true,
          priority: NotificationPriority.MEDIUM,
          channels: [NotificationChannel.IN_GAME]
        },
        [NotificationCategory.PET]: {
          enabled: true,
          priority: NotificationPriority.LOW,
          channels: [NotificationChannel.IN_GAME]
        },
        [NotificationCategory.GOVERNANCE]: {
          enabled: true,
          priority: NotificationPriority.MEDIUM,
          channels: [NotificationChannel.IN_GAME, NotificationChannel.PUSH]
        }
      },
      channels: {
        [NotificationChannel.IN_GAME]: true,
        [NotificationChannel.PUSH]: true,
        [NotificationChannel.EMAIL]: false,
        [NotificationChannel.SMS]: false
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      }
    };
  }

  private initializeDefaultPreferences(): void {
    // Initialize with default preferences for demo users
    // In production, this would be loaded from database
  }

  private startNotificationCleanup(): void {
    // Clean up expired notifications every hour
    setInterval(() => {
      const now = new Date();
      for (const [id, notification] of this.notifications.entries()) {
        if (notification.expiresAt && now > notification.expiresAt) {
          this.notifications.delete(id);
          
          const userNotificationIds = this.userNotifications.get(notification.userId) || [];
          const index = userNotificationIds.indexOf(id);
          if (index > -1) {
            userNotificationIds.splice(index, 1);
          }
        }
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}
