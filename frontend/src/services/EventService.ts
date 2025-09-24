import { io, Socket } from 'socket.io-client';
import {
  Event,
  EventParticipation,
  EventLeaderboard,
  EventObjective,
  EventNotification,
  EventProgressUpdate,
  EventStats,
  EventType,
  EventStatus,
  ObjectiveType,
  NotificationType
} from '../types/events';

export class EventService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
    this.socket = io(socketUrl);

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to event service');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from event service');
    });

    // Event system specific listeners
    this.socket.on('eventUpdate', (event: Event) => {
      this.emit('eventUpdate', event);
    });

    this.socket.on('eventNotification', (notification: EventNotification) => {
      this.emit('eventNotification', notification);
    });

    this.socket.on('leaderboardUpdate', (leaderboard: EventLeaderboard) => {
      this.emit('leaderboardUpdate', leaderboard);
    });

    this.socket.on('objectiveUpdate', (objective: EventObjective) => {
      this.emit('objectiveUpdate', objective);
    });

    this.socket.on('participationUpdate', (participation: EventParticipation) => {
      this.emit('participationUpdate', participation);
    });

    this.socket.on('eventDeleted', (data: { eventId: string }) => {
      this.emit('eventDeleted', data);
    });
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Connection management
  initializeSocket(): void {
    if (!this.socket || !this.isConnected) {
      this.initializeSocket();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isConnected(): boolean {
    return this.isConnected;
  }

  // Event management
  async getActiveEvents(): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getActiveEvents', (response: { success: boolean; events?: Event[]; error?: string }) => {
        if (response.success && response.events) {
          resolve(response.events);
        } else {
          reject(new Error(response.error || 'Failed to get active events'));
        }
      });
    });
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getUpcomingEvents', (response: { success: boolean; events?: Event[]; error?: string }) => {
        if (response.success && response.events) {
          resolve(response.events);
        } else {
          reject(new Error(response.error || 'Failed to get upcoming events'));
        }
      });
    });
  }

  async getEventById(eventId: string): Promise<Event | null> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getEventById', eventId, (response: { success: boolean; event?: Event; error?: string }) => {
        if (response.success) {
          resolve(response.event || null);
        } else {
          reject(new Error(response.error || 'Failed to get event'));
        }
      });
    });
  }

  async joinEvent(eventId: string, userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('joinEvent', { eventId, userId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to join event'));
        }
      });
    });
  }

  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('leaveEvent', { eventId, userId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to leave event'));
        }
      });
    });
  }

  async getUserParticipation(userId: string): Promise<EventParticipation[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getUserParticipation', userId, (response: { success: boolean; participation?: EventParticipation[]; error?: string }) => {
        if (response.success && response.participation) {
          resolve(response.participation);
        } else {
          reject(new Error(response.error || 'Failed to get user participation'));
        }
      });
    });
  }

  async getEventLeaderboard(eventId: string): Promise<EventLeaderboard | null> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getEventLeaderboard', eventId, (response: { success: boolean; leaderboard?: EventLeaderboard; error?: string }) => {
        if (response.success) {
          resolve(response.leaderboard || null);
        } else {
          reject(new Error(response.error || 'Failed to get event leaderboard'));
        }
      });
    });
  }

  async getEventObjectives(eventId: string): Promise<EventObjective[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getEventObjectives', eventId, (response: { success: boolean; objectives?: EventObjective[]; error?: string }) => {
        if (response.success && response.objectives) {
          resolve(response.objectives);
        } else {
          reject(new Error(response.error || 'Failed to get event objectives'));
        }
      });
    });
  }

  async updateObjectiveProgress(
    eventId: string,
    objectiveId: string,
    userId: string,
    progress: number
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('updateObjectiveProgress', {
        eventId,
        objectiveId,
        userId,
        progress
      }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to update objective progress'));
        }
      });
    });
  }

  async claimReward(eventId: string, rewardId: string, userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('claimReward', { eventId, rewardId, userId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to claim reward'));
        }
      });
    });
  }

  async getEventNotifications(userId: string): Promise<EventNotification[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getEventNotifications', userId, (response: { success: boolean; notifications?: EventNotification[]; error?: string }) => {
        if (response.success && response.notifications) {
          resolve(response.notifications);
        } else {
          reject(new Error(response.error || 'Failed to get event notifications'));
        }
      });
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('markNotificationAsRead', notificationId, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to mark notification as read'));
        }
      });
    });
  }

  // Seasonal events
  async getSeasonalEvents(season: string): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getSeasonalEvents', season, (response: { success: boolean; events?: Event[]; error?: string }) => {
        if (response.success && response.events) {
          resolve(response.events);
        } else {
          reject(new Error(response.error || 'Failed to get seasonal events'));
        }
      });
    });
  }

  async getLimitedTimeEvents(): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getLimitedTimeEvents', (response: { success: boolean; events?: Event[]; error?: string }) => {
        if (response.success && response.events) {
          resolve(response.events);
        } else {
          reject(new Error(response.error || 'Failed to get limited time events'));
        }
      });
    });
  }

  async getEventStats(): Promise<EventStats> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getEventStats', (response: { success: boolean; stats?: EventStats; error?: string }) => {
        if (response.success && response.stats) {
          resolve(response.stats);
        } else {
          reject(new Error(response.error || 'Failed to get event stats'));
        }
      });
    });
  }

  // Utility functions
  getEventTimeRemaining(event: Event): number {
    const now = new Date();
    const endTime = event.endDate.getTime();
    const remaining = endTime - now.getTime();
    return Math.max(0, remaining);
  }

  formatEventDuration(milliseconds: number): string {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  isEventActive(event: Event): boolean {
    const now = new Date();
    return event.status === 'active' && now >= event.startDate && now <= event.endDate;
  }

  isEventUpcoming(event: Event): boolean {
    const now = new Date();
    return event.status === 'upcoming' && now < event.startDate;
  }

  getEventProgress(event: Event, participation: EventParticipation): number {
    return participation.progress;
  }

  canJoinEvent(event: Event, userId: string): boolean {
    if (event.status !== 'active' && event.status !== 'upcoming') return false;
    if (event.participants.includes(userId)) return false;
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) return false;
    return true;
  }

  // Seasonal content helpers
  getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  getSeasonalTheme(season: string): string {
    const themes = {
      spring: 'Spring Festival',
      summer: 'Summer Celebration',
      autumn: 'Harvest Festival',
      winter: 'Winter Wonderland'
    };
    return themes[season as keyof typeof themes] || 'Seasonal Event';
  }

  getSeasonalDecorations(season: string): string[] {
    const decorations = {
      spring: ['🌸', '🌷', '🦋', '🌿', '☀️'],
      summer: ['☀️', '🌊', '🏖️', '🌺', '🍉'],
      autumn: ['🍂', '🎃', '🌰', '🍁', '🦃'],
      winter: ['❄️', '⛄', '🎄', '🎁', '🦌']
    };
    return decorations[season as keyof typeof decorations] || ['🎯'];
  }

  getSeasonalColors(season: string): string[] {
    const colors = {
      spring: ['#FFB6C1', '#98FB98', '#F0E68C', '#FFA07A'],
      summer: ['#FFD700', '#87CEEB', '#FF6347', '#32CD32'],
      autumn: ['#CD853F', '#D2691E', '#B22222', '#FF8C00'],
      winter: ['#B0E0E6', '#F0F8FF', '#E6E6FA', '#FFFAF0']
    };
    return colors[season as keyof typeof colors] || ['#808080'];
  }
}

// Export singleton instance
export const eventService = new EventService();