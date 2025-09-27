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

export interface NotificationFilter {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  unreadOnly?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

export interface NotificationBulkAction {
  action: 'mark_read' | 'mark_unread' | 'delete';
  notificationIds: string[];
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  defaultPriority: NotificationPriority;
  defaultCategory: NotificationCategory;
  variables: string[];
}

export const NOTIFICATION_EVENTS = {
  NOTIFICATION_CREATED: 'notificationCreated',
  NOTIFICATION_READ: 'notificationRead',
  NOTIFICATION_DELETED: 'notificationDeleted',
  NOTIFICATIONS_MARKED_READ: 'notificationsMarkedRead',
  PREFERENCES_UPDATED: 'preferencesUpdated',
  NOTIFICATION_ACTION: 'notificationAction'
} as const;

export const NOTIFICATION_NOTIFICATIONS = {
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_READ: 'notification_read',
  NOTIFICATION_DELETED: 'notification_deleted',
  PREFERENCES_UPDATED: 'preferences_updated'
} as const;
