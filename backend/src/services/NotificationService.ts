import { EventEmitter } from 'events';

export interface Notification {
  id: string;
  userId: string;
  type: 'reward' | 'achievement' | 'referral' | 'tutorial';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export class NotificationService {
  private static instance: NotificationService;
  private eventEmitter: EventEmitter;
  private notifications: Map<string, Notification[]>;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.notifications = new Map();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async createNotification(userId: string, type: Notification['type'], title: string, message: string, data?: any): Promise<Notification> {
    const notification: Notification = {
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date()
    };

    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.push(notification);
    this.notifications.set(userId, userNotifications);

    // Emit event for real-time updates
    this.eventEmitter.emit('notification', { userId, notification });

    return notification;
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(notification => !notification.read);
  }

  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach(notification => {
      notification.read = true;
    });
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId) || [];
    const index = userNotifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      userNotifications.splice(index, 1);
      return true;
    }
    return false;
  }

  onNewNotification(callback: (notification: Notification) => void): void {
    this.eventEmitter.on('notification', callback);
  }

  // Helper methods for different notification types
  async sendRewardNotification(userId: string, rewardType: string, amount: number): Promise<Notification> {
    return this.createNotification(
      userId,
      'reward',
      'Reward Earned!',
      `You've earned ${amount} ${rewardType}!`,
      { rewardType, amount }
    );
  }

  async sendAchievementNotification(userId: string, achievementName: string): Promise<Notification> {
    return this.createNotification(
      userId,
      'achievement',
      'Achievement Unlocked!',
      `You've unlocked the "${achievementName}" achievement!`,
      { achievementName }
    );
  }

  async sendReferralNotification(userId: string, referralType: 'completed' | 'joined'): Promise<Notification> {
    const title = referralType === 'completed' ? 'Referral Reward!' : 'New Referral';
    const message = referralType === 'completed' 
      ? 'Your referral has completed their first quest! Rewards added to your account.'
      : 'A new player has joined using your referral code!';
    
    return this.createNotification(
      userId,
      'referral',
      title,
      message,
      { referralType }
    );
  }
}

export const notificationService = NotificationService.getInstance();
