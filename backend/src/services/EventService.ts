import { Server as SocketIOServer } from 'socket.io';
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
  private events: Map<string, Event> = new Map();
  private participations: Map<string, EventParticipation> = new Map();
  private objectives: Map<string, EventObjective> = new Map();
  private notifications: Map<string, EventNotification> = new Map();
  private leaderboards: Map<string, EventLeaderboard> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeDefaultEvents();
    this.startEventScheduler();
  }

  // Initialize default events
  private initializeDefaultEvents(): void {
    const defaultEvents: Event[] = [
      {
        id: 'seasonal-winter-2024',
        name: 'Winter Wonderland Festival',
        description: 'Celebrate the winter season with special activities and exclusive rewards',
        type: 'seasonal',
        status: 'active',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        rewards: [
          {
            id: 'winter-cape',
            type: 'nft',
            amount: 1,
            itemId: 'winter-cape-001',
            rarity: 'epic',
            description: 'Exclusive Winter Cape'
          },
          {
            id: 'winter-tokens',
            type: 'token',
            amount: 1000,
            rarity: 'rare',
            description: 'Winter Festival Tokens'
          }
        ],
        requirements: [
          {
            type: 'level',
            value: 5,
            description: 'Minimum level 5 required'
          }
        ],
        participants: [],
        maxParticipants: 1000,
        metadata: {
          theme: 'Winter Festival',
          difficulty: 'medium',
          category: 'Seasonal',
          tags: ['winter', 'festival', 'exclusive'],
          imageUrl: '/images/events/winter-festival.jpg',
          backgroundMusic: 'winter-theme.mp3',
          specialEffects: ['snow', 'ice-crystals', 'aurora']
        }
      },
      {
        id: 'community-challenge-001',
        name: 'Community Building Challenge',
        description: 'Work together with other players to build the ultimate community structure',
        type: 'collaborative',
        status: 'upcoming',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-22'),
        rewards: [
          {
            id: 'community-badge',
            type: 'achievement',
            amount: 1,
            rarity: 'legendary',
            description: 'Community Builder Badge'
          },
          {
            id: 'building-materials',
            type: 'nft',
            amount: 50,
            itemId: 'premium-materials',
            rarity: 'rare',
            description: 'Premium Building Materials'
          }
        ],
        requirements: [
          {
            type: 'guild_membership',
            value: 1,
            description: 'Must be part of a guild'
          }
        ],
        participants: [],
        maxParticipants: 500,
        metadata: {
          theme: 'Community Building',
          difficulty: 'hard',
          category: 'Collaborative',
          tags: ['community', 'building', 'teamwork'],
          imageUrl: '/images/events/community-challenge.jpg'
        }
      },
      {
        id: 'puzzle-master-001',
        name: 'Puzzle Master Tournament',
        description: 'Test your puzzle-solving skills in this competitive tournament',
        type: 'competitive',
        status: 'upcoming',
        startDate: new Date('2024-12-20'),
        endDate: new Date('2024-12-27'),
        rewards: [
          {
            id: 'puzzle-master-title',
            type: 'achievement',
            amount: 1,
            rarity: 'legendary',
            description: 'Puzzle Master Title'
          },
          {
            id: 'puzzle-rewards',
            type: 'token',
            amount: 5000,
            rarity: 'epic',
            description: 'Puzzle Master Tokens'
          }
        ],
        requirements: [
          {
            type: 'level',
            value: 10,
            description: 'Minimum level 10 required'
          }
        ],
        participants: [],
        maxParticipants: 200,
        metadata: {
          theme: 'Puzzle Competition',
          difficulty: 'expert',
          category: 'Competitive',
          tags: ['puzzle', 'tournament', 'competitive'],
          imageUrl: '/images/events/puzzle-tournament.jpg'
        }
      }
    ];

    defaultEvents.forEach(event => {
      this.events.set(event.id, event);
      this.initializeEventObjectives(event.id);
    });
  }

  // Initialize objectives for an event
  private initializeEventObjectives(eventId: string): void {
    const event = this.events.get(eventId);
    if (!event) return;

    const objectives: EventObjective[] = [
      {
        id: `${eventId}-obj-1`,
        eventId,
        title: 'Complete Daily Activities',
        description: 'Complete 5 daily activities during the event',
        type: 'time_based',
        target: 5,
        current: 0,
        reward: event.rewards[0],
        isCompleted: false,
        isOptional: false
      },
      {
        id: `${eventId}-obj-2`,
        eventId,
        title: 'Social Interaction',
        description: 'Interact with 10 different players',
        type: 'social',
        target: 10,
        current: 0,
        reward: event.rewards[1] || event.rewards[0],
        isCompleted: false,
        isOptional: true
      }
    ];

    objectives.forEach(objective => {
      this.objectives.set(objective.id, objective);
    });
  }

  // Start event scheduler
  private startEventScheduler(): void {
    setInterval(() => {
      this.updateEventStatuses();
      this.updateLeaderboards();
    }, 60000); // Check every minute
  }

  // Update event statuses based on time
  private updateEventStatuses(): void {
    const now = new Date();
    
    this.events.forEach(event => {
      let newStatus = event.status;
      
      if (now < event.startDate && event.status === 'upcoming') {
        // Event is still upcoming
        return;
      } else if (now >= event.startDate && now <= event.endDate && event.status === 'upcoming') {
        newStatus = 'active';
        this.sendEventNotification(event.id, 'event_start', 'Event Started!', `${event.name} has begun!`);
      } else if (now > event.endDate && event.status === 'active') {
        newStatus = 'completed';
        this.sendEventNotification(event.id, 'event_end', 'Event Ended', `${event.name} has ended. Thank you for participating!`);
      }

      if (newStatus !== event.status) {
        event.status = newStatus;
        this.events.set(event.id, event);
        this.io.emit('eventUpdate', event);
      }
    });
  }

  // Update leaderboards
  private updateLeaderboards(): void {
    this.events.forEach(event => {
      if (event.status === 'active') {
        const leaderboard = this.calculateLeaderboard(event.id);
        this.leaderboards.set(event.id, leaderboard);
        this.io.emit('leaderboardUpdate', leaderboard);
      }
    });
  }

  // Calculate leaderboard for an event
  private calculateLeaderboard(eventId: string): EventLeaderboard {
    const event = this.events.get(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    const participants = Array.from(this.participations.values())
      .filter(p => p.eventId === eventId)
      .map(p => ({
        userId: p.userId,
        username: `User${p.userId.slice(-4)}`, // Mock username
        score: p.progress * 10 + p.completedObjectives.length * 5,
        rank: 0,
        progress: p.progress,
        rewardsClaimed: p.rewardsClaimed.length,
        joinedAt: p.joinedAt
      }))
      .sort((a, b) => b.score - a.score);

    // Assign ranks
    participants.forEach((participant, index) => {
      participant.rank = index + 1;
    });

    return {
      eventId,
      participants,
      lastUpdated: new Date()
    };
  }

  // Send event notification
  private sendEventNotification(
    eventId: string,
    type: NotificationType,
    title: string,
    message: string
  ): void {
    const event = this.events.get(eventId);
    if (!event) return;

    const notification: EventNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      type,
      title,
      message,
      timestamp: new Date(),
      isRead: false
    };

    this.notifications.set(notification.id, notification);

    // Send to all participants
    event.participants.forEach(userId => {
      this.io.to(userId).emit('eventNotification', notification);
    });
  }

  // Get all active events
  getActiveEvents(): Event[] {
    return Array.from(this.events.values()).filter(event => event.status === 'active');
  }

  // Get upcoming events
  getUpcomingEvents(): Event[] {
    return Array.from(this.events.values()).filter(event => event.status === 'upcoming');
  }

  // Get event by ID
  getEventById(eventId: string): Event | null {
    return this.events.get(eventId) || null;
  }

  // Join an event
  joinEvent(eventId: string, userId: string): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    // Check if event is active or upcoming
    if (event.status !== 'active' && event.status !== 'upcoming') {
      return false;
    }

    // Check if user is already participating
    if (event.participants.includes(userId)) {
      return false;
    }

    // Check max participants
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return false;
    }

    // Check requirements
    if (!this.checkRequirements(event, userId)) {
      return false;
    }

    // Add user to event
    event.participants.push(userId);
    this.events.set(eventId, event);

    // Create participation record
    const participation: EventParticipation = {
      userId,
      eventId,
      progress: 0,
      completedObjectives: [],
      rewardsClaimed: [],
      joinedAt: new Date(),
      lastActivity: new Date()
    };
    this.participations.set(`${userId}-${eventId}`, participation);

    // Emit update
    this.io.emit('eventUpdate', event);

    return true;
  }

  // Leave an event
  leaveEvent(eventId: string, userId: string): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    // Remove user from event
    const index = event.participants.indexOf(userId);
    if (index === -1) return false;

    event.participants.splice(index, 1);
    this.events.set(eventId, event);

    // Remove participation record
    this.participations.delete(`${userId}-${eventId}`);

    // Emit update
    this.io.emit('eventUpdate', event);

    return true;
  }

  // Check event requirements
  private checkRequirements(event: Event, userId: string): boolean {
    // This is a simplified check - in a real implementation,
    // you would check against user data, achievements, etc.
    return true;
  }

  // Get user participation
  getUserParticipation(userId: string): EventParticipation[] {
    return Array.from(this.participations.values())
      .filter(p => p.userId === userId);
  }

  // Get event leaderboard
  getEventLeaderboard(eventId: string): EventLeaderboard | null {
    return this.leaderboards.get(eventId) || null;
  }

  // Get event objectives
  getEventObjectives(eventId: string): EventObjective[] {
    return Array.from(this.objectives.values())
      .filter(obj => obj.eventId === eventId);
  }

  // Update objective progress
  updateObjectiveProgress(
    eventId: string,
    objectiveId: string,
    userId: string,
    progress: number
  ): boolean {
    const objective = this.objectives.get(objectiveId);
    if (!objective || objective.eventId !== eventId) return false;

    const participationKey = `${userId}-${eventId}`;
    const participation = this.participations.get(participationKey);
    if (!participation) return false;

    // Update objective progress
    objective.current = Math.min(progress, objective.target);
    objective.isCompleted = objective.current >= objective.target;
    this.objectives.set(objectiveId, objective);

    // Update participation
    participation.progress = this.calculateOverallProgress(eventId, userId);
    participation.lastActivity = new Date();
    this.participations.set(participationKey, participation);

    // Send notification if objective completed
    if (objective.isCompleted && !participation.completedObjectives.includes(objectiveId)) {
      participation.completedObjectives.push(objectiveId);
      this.sendEventNotification(
        eventId,
        'objective_complete',
        'Objective Completed!',
        `You completed: ${objective.title}`
      );
    }

    // Emit updates
    this.io.emit('objectiveUpdate', objective);
    this.io.emit('participationUpdate', participation);

    return true;
  }

  // Calculate overall progress for a user in an event
  private calculateOverallProgress(eventId: string, userId: string): number {
    const objectives = this.getEventObjectives(eventId);
    const participation = this.participations.get(`${userId}-${eventId}`);
    if (!participation || objectives.length === 0) return 0;

    const completedObjectives = objectives.filter(obj => 
      participation.completedObjectives.includes(obj.id)
    );

    return Math.round((completedObjectives.length / objectives.length) * 100);
  }

  // Claim event reward
  claimReward(eventId: string, rewardId: string, userId: string): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    const participationKey = `${userId}-${eventId}`;
    const participation = this.participations.get(participationKey);
    if (!participation) return false;

    // Check if reward exists and hasn't been claimed
    const reward = event.rewards.find(r => r.id === rewardId);
    if (!reward || participation.rewardsClaimed.includes(rewardId)) {
      return false;
    }

    // Add reward to claimed list
    participation.rewardsClaimed.push(rewardId);
    this.participations.set(participationKey, participation);

    // Send notification
    this.sendEventNotification(
      eventId,
      'reward_available',
      'Reward Claimed!',
      `You claimed: ${reward.description}`
    );

    // Emit update
    this.io.emit('participationUpdate', participation);

    return true;
  }

  // Get event notifications for user
  getEventNotifications(userId: string): EventNotification[] {
    return Array.from(this.notifications.values())
      .filter(notif => {
        const event = this.events.get(notif.eventId);
        return event && event.participants.includes(userId);
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.isRead = true;
    this.notifications.set(notificationId, notification);

    return true;
  }

  // Get seasonal events
  getSeasonalEvents(season: string): Event[] {
    return Array.from(this.events.values())
      .filter(event => event.type === 'seasonal' && event.metadata.theme.toLowerCase().includes(season.toLowerCase()));
  }

  // Get limited-time events
  getLimitedTimeEvents(): Event[] {
    return Array.from(this.events.values())
      .filter(event => event.type === 'limited_time');
  }

  // Get event statistics
  getEventStats(): EventStats {
    const allEvents = Array.from(this.events.values());
    const allParticipations = Array.from(this.participations.values());

    const eventTypeCounts = new Map<EventType, number>();
    allEvents.forEach(event => {
      eventTypeCounts.set(event.type, (eventTypeCounts.get(event.type) || 0) + 1);
    });

    return {
      totalEvents: allEvents.length,
      activeEvents: allEvents.filter(e => e.status === 'active').length,
      upcomingEvents: allEvents.filter(e => e.status === 'upcoming').length,
      totalParticipants: allParticipations.length,
      totalRewardsDistributed: allParticipations.reduce((sum, p) => sum + p.rewardsClaimed.length, 0),
      averageEventDuration: this.calculateAverageEventDuration(allEvents),
      popularEventTypes: Array.from(eventTypeCounts.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
    };
  }

  // Calculate average event duration
  private calculateAverageEventDuration(events: Event[]): number {
    if (events.length === 0) return 0;
    
    const totalDuration = events.reduce((sum, event) => {
      return sum + (event.endDate.getTime() - event.startDate.getTime());
    }, 0);

    return totalDuration / events.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  // Create new event (admin function)
  createEvent(event: Event): boolean {
    if (this.events.has(event.id)) return false;

    this.events.set(event.id, event);
    this.initializeEventObjectives(event.id);
    this.io.emit('eventUpdate', event);

    return true;
  }

  // Update event (admin function)
  updateEvent(eventId: string, updates: Partial<Event>): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    const updatedEvent = { ...event, ...updates };
    this.events.set(eventId, updatedEvent);
    this.io.emit('eventUpdate', updatedEvent);

    return true;
  }

  // Delete event (admin function)
  deleteEvent(eventId: string): boolean {
    if (!this.events.has(eventId)) return false;

    this.events.delete(eventId);
    
    // Clean up related data
    Array.from(this.participations.keys())
      .filter(key => key.endsWith(`-${eventId}`))
      .forEach(key => this.participations.delete(key));

    Array.from(this.objectives.keys())
      .filter(key => key.startsWith(`${eventId}-`))
      .forEach(key => this.objectives.delete(key));

    this.leaderboards.delete(eventId);

    this.io.emit('eventDeleted', { eventId });

    return true;
  }
}
