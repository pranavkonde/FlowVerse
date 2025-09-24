import { io, Socket } from 'socket.io-client';
import {
  Event,
  EventParticipation,
  EventLeaderboard,
  EventObjective,
  EventNotification,
  EventType,
  EventStatus
} from '../types/events';

class EventService {
  private socket: Socket | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
  }

  // Initialize socket connection
  initializeSocket(): void {
    if (!this.socket) {
      this.socket = io(this.baseUrl);
      this.setupEventListeners();
    }
  }

  // Setup socket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('eventUpdate', (event: Event) => {
      // Handle real-time event updates
      this.handleEventUpdate(event);
    });

    this.socket.on('eventNotification', (notification: EventNotification) => {
      // Handle event notifications
      this.handleEventNotification(notification);
    });

    this.socket.on('leaderboardUpdate', (leaderboard: EventLeaderboard) => {
      // Handle leaderboard updates
      this.handleLeaderboardUpdate(leaderboard);
    });
  }

  // Get all active events
  async getActiveEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/active`);
      if (!response.ok) throw new Error('Failed to fetch active events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching active events:', error);
      return [];
    }
  }

  // Get upcoming events
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/upcoming`);
      if (!response.ok) throw new Error('Failed to fetch upcoming events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }

  // Get event by ID
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return await response.json();
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  // Join an event
  async joinEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/${eventId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error joining event:', error);
      return false;
    }
  }

  // Leave an event
  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/${eventId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error leaving event:', error);
      return false;
    }
  }

  // Get user's event participation
  async getUserParticipation(userId: string): Promise<EventParticipation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/participation/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch participation');
      return await response.json();
    } catch (error) {
      console.error('Error fetching participation:', error);
      return [];
    }
  }

  // Get event leaderboard
  async getEventLeaderboard(eventId: string): Promise<EventLeaderboard | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/${eventId}/leaderboard`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return null;
    }
  }

  // Get event objectives
  async getEventObjectives(eventId: string): Promise<EventObjective[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/${eventId}/objectives`);
      if (!response.ok) throw new Error('Failed to fetch objectives');
      return await response.json();
    } catch (error) {
      console.error('Error fetching objectives:', error);
      return [];
    }
  }

  // Update objective progress
  async updateObjectiveProgress(
    eventId: string,
    objectiveId: string,
    userId: string,
    progress: number
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/${eventId}/objectives/${objectiveId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, progress })
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating objective progress:', error);
      return false;
    }
  }

  // Claim event reward
  async claimReward(eventId: string, rewardId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/${eventId}/rewards/${rewardId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return response.ok;
    } catch (error) {
      console.error('Error claiming reward:', error);
      return false;
    }
  }

  // Get event notifications
  async getEventNotifications(userId: string): Promise<EventNotification[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/notifications/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Get seasonal events
  async getSeasonalEvents(season: string): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/seasonal/${season}`);
      if (!response.ok) throw new Error('Failed to fetch seasonal events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching seasonal events:', error);
      return [];
    }
  }

  // Get limited-time events
  async getLimitedTimeEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/events/limited-time`);
      if (!response.ok) throw new Error('Failed to fetch limited-time events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching limited-time events:', error);
      return [];
    }
  }

  // Event handlers
  private handleEventUpdate(event: Event): void {
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('eventUpdate', { detail: event }));
  }

  private handleEventNotification(notification: EventNotification): void {
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('eventNotification', { detail: notification }));
  }

  private handleLeaderboardUpdate(leaderboard: EventLeaderboard): void {
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('leaderboardUpdate', { detail: leaderboard }));
  }

  // Utility methods
  isEventActive(event: Event): boolean {
    const now = new Date();
    return event.status === 'active' && now >= event.startDate && now <= event.endDate;
  }

  isEventUpcoming(event: Event): boolean {
    const now = new Date();
    return event.status === 'upcoming' && now < event.startDate;
  }

  getEventTimeRemaining(event: Event): number {
    const now = new Date();
    return Math.max(0, event.endDate.getTime() - now.getTime());
  }

  formatEventDuration(milliseconds: number): string {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // Cleanup
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const eventService = new EventService();
