import { EventEmitter } from 'events';
import { 
  SocialHub, 
  SocialEvent, 
  Party, 
  SocialInteraction, 
  SocialStats,
  HubType,
  EventType,
  EventStatus,
  PartyStatus,
  InteractionType,
  ReactionType,
  SOCIAL_EVENTS,
  SOCIAL_NOTIFICATIONS
} from '../types/social';

export class SocialService extends EventEmitter {
  private hubs: Map<string, SocialHub> = new Map();
  private events: Map<string, SocialEvent> = new Map();
  private parties: Map<string, Party> = new Map();
  private interactions: Map<string, SocialInteraction> = new Map();
  private userStats: Map<string, SocialStats> = new Map();
  private userHubs: Map<string, Set<string>> = new Map();
  private userEvents: Map<string, Set<string>> = new Map();
  private userParties: Map<string, Set<string>> = new Map();

  constructor() {
    super();
    this.initializeDefaultHubs();
    this.startEventScheduler();
  }

  // Hub Management
  async createHub(hubData: Partial<SocialHub>, creatorId: string): Promise<SocialHub> {
    const hub: SocialHub = {
      id: this.generateId(),
      name: hubData.name || 'New Hub',
      description: hubData.description || '',
      type: hubData.type || 'public',
      capacity: hubData.capacity || 50,
      currentUsers: 0,
      location: hubData.location || { x: 0, y: 0, z: 0, world: 'main', region: 'central', coordinates: '0,0,0' },
      features: hubData.features || [],
      isActive: true,
      isPublic: hubData.isPublic !== false,
      ownerId: creatorId,
      moderators: [creatorId],
      rules: hubData.rules || [],
      events: [],
      createdAt: new Date(),
      lastModified: new Date(),
      metadata: hubData.metadata || {
        lighting: 'normal',
        weather: 'clear',
        timeOfDay: 'noon',
        tags: [],
        category: 'social',
        isTradeable: false,
        isSellable: false,
        baseValue: 0,
        customizations: []
      }
    };

    this.hubs.set(hub.id, hub);
    this.emit(SOCIAL_EVENTS.HUB_CREATED, hub);
    
    return hub;
  }

  async updateHub(hubId: string, updates: Partial<SocialHub>, userId: string): Promise<SocialHub | null> {
    const hub = this.hubs.get(hubId);
    if (!hub) return null;

    if (hub.ownerId !== userId && !hub.moderators.includes(userId)) {
      throw new Error('Insufficient permissions to update hub');
    }

    const updatedHub = { ...hub, ...updates, lastModified: new Date() };
    this.hubs.set(hubId, updatedHub);
    this.emit(SOCIAL_EVENTS.HUB_UPDATED, updatedHub);
    
    return updatedHub;
  }

  async deleteHub(hubId: string, userId: string): Promise<boolean> {
    const hub = this.hubs.get(hubId);
    if (!hub) return false;

    if (hub.ownerId !== userId) {
      throw new Error('Only hub owner can delete hub');
    }

    // Remove all events and parties associated with this hub
    for (const eventId of hub.events) {
      await this.deleteEvent(eventId, userId);
    }

    this.hubs.delete(hubId);
    this.emit(SOCIAL_EVENTS.HUB_DELETED, { hubId, deletedBy: userId });
    
    return true;
  }

  async joinHub(hubId: string, userId: string): Promise<boolean> {
    const hub = this.hubs.get(hubId);
    if (!hub || !hub.isActive) return false;

    if (hub.currentUsers >= hub.capacity) {
      throw new Error('Hub is at capacity');
    }

    if (!hub.isPublic && hub.ownerId !== userId && !hub.moderators.includes(userId)) {
      throw new Error('Hub is private and you are not authorized');
    }

    hub.currentUsers++;
    this.userHubs.set(userId, (this.userHubs.get(userId) || new Set()).add(hubId));
    
    this.emit(SOCIAL_EVENTS.HUB_JOINED, { hubId, userId, hub });
    return true;
  }

  async leaveHub(hubId: string, userId: string): Promise<boolean> {
    const hub = this.hubs.get(hubId);
    if (!hub) return false;

    hub.currentUsers = Math.max(0, hub.currentUsers - 1);
    const userHubs = this.userHubs.get(userId);
    if (userHubs) {
      userHubs.delete(hubId);
    }
    
    this.emit(SOCIAL_EVENTS.HUB_LEFT, { hubId, userId, hub });
    return true;
  }

  // Event Management
  async createEvent(eventData: Partial<SocialEvent>, organizerId: string): Promise<SocialEvent> {
    const event: SocialEvent = {
      id: this.generateId(),
      name: eventData.name || 'New Event',
      description: eventData.description || '',
      type: eventData.type || 'social',
      category: eventData.category || 'social',
      hubId: eventData.hubId || '',
      organizerId,
      organizerName: eventData.organizerName || 'Unknown',
      startTime: eventData.startTime || new Date(),
      endTime: eventData.endTime || new Date(Date.now() + 3600000), // 1 hour default
      duration: eventData.duration || 3600000,
      maxParticipants: eventData.maxParticipants || 20,
      currentParticipants: 0,
      participants: [],
      status: 'scheduled',
      requirements: eventData.requirements || [],
      rewards: eventData.rewards || [],
      activities: eventData.activities || [],
      rules: eventData.rules || [],
      isPublic: eventData.isPublic !== false,
      isRecurring: eventData.isRecurring || false,
      recurrencePattern: eventData.recurrencePattern,
      createdAt: new Date(),
      lastModified: new Date(),
      metadata: eventData.metadata || {
        tags: [],
        category: 'social',
        isFeatured: false,
        isUrgent: false,
        specialOffers: [],
        location: '',
        difficulty: 'beginner',
        recommendedLevel: 1,
        estimatedDuration: 3600000,
        customizations: []
      }
    };

    this.events.set(event.id, event);
    
    // Add event to hub if specified
    if (event.hubId) {
      const hub = this.hubs.get(event.hubId);
      if (hub) {
        hub.events.push(event.id);
      }
    }

    this.emit(SOCIAL_EVENTS.EVENT_CREATED, event);
    return event;
  }

  async updateEvent(eventId: string, updates: Partial<SocialEvent>, userId: string): Promise<SocialEvent | null> {
    const event = this.events.get(eventId);
    if (!event) return null;

    if (event.organizerId !== userId) {
      throw new Error('Only event organizer can update event');
    }

    const updatedEvent = { ...event, ...updates, lastModified: new Date() };
    this.events.set(eventId, updatedEvent);
    this.emit(SOCIAL_EVENTS.EVENT_UPDATED, updatedEvent);
    
    return updatedEvent;
  }

  async deleteEvent(eventId: string, userId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;

    if (event.organizerId !== userId) {
      throw new Error('Only event organizer can delete event');
    }

    // Remove event from hub
    if (event.hubId) {
      const hub = this.hubs.get(event.hubId);
      if (hub) {
        hub.events = hub.events.filter(id => id !== eventId);
      }
    }

    this.events.delete(eventId);
    this.emit(SOCIAL_EVENTS.EVENT_DELETED, { eventId, deletedBy: userId });
    
    return true;
  }

  async joinEvent(eventId: string, userId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event || event.status !== 'scheduled') return false;

    if (event.currentParticipants >= event.maxParticipants) {
      throw new Error('Event is at capacity');
    }

    if (!event.isPublic) {
      throw new Error('Event is private');
    }

    // Check requirements
    for (const requirement of event.requirements) {
      if (!requirement.isMet) {
        throw new Error(`Requirement not met: ${requirement.description}`);
      }
    }

    const participant = {
      userId,
      username: 'Unknown', // Should be fetched from user service
      joinedAt: new Date(),
      status: 'joined' as const,
      role: 'participant' as const,
      contributions: 0,
      rewards: [],
      activities: []
    };

    event.participants.push(participant);
    event.currentParticipants++;
    this.userEvents.set(userId, (this.userEvents.get(userId) || new Set()).add(eventId));
    
    this.emit(SOCIAL_EVENTS.EVENT_JOINED, { eventId, userId, event });
    return true;
  }

  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event) return false;

    event.participants = event.participants.filter(p => p.userId !== userId);
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    
    const userEvents = this.userEvents.get(userId);
    if (userEvents) {
      userEvents.delete(eventId);
    }
    
    this.emit(SOCIAL_EVENTS.EVENT_LEFT, { eventId, userId, event });
    return true;
  }

  // Party Management
  async createParty(partyData: Partial<Party>, leaderId: string): Promise<Party> {
    const party: Party = {
      id: this.generateId(),
      name: partyData.name || 'New Party',
      description: partyData.description || '',
      leaderId,
      leaderName: partyData.leaderName || 'Unknown',
      members: [{
        userId: leaderId,
        username: 'Unknown',
        role: 'leader',
        joinedAt: new Date(),
        contributions: 0,
        status: 'active',
        permissions: ['invite', 'kick', 'moderate', 'organize', 'manage', 'view_private']
      }],
      maxMembers: partyData.maxMembers || 8,
      isPublic: partyData.isPublic !== false,
      isRecruiting: true,
      requirements: partyData.requirements || [],
      activities: partyData.activities || [],
      status: 'recruiting',
      createdAt: new Date(),
      lastModified: new Date(),
      metadata: partyData.metadata || {
        tags: [],
        category: 'social',
        isTradeable: false,
        isSellable: false,
        baseValue: 0,
        customizations: []
      }
    };

    this.parties.set(party.id, party);
    this.userParties.set(leaderId, (this.userParties.get(leaderId) || new Set()).add(party.id));
    
    this.emit(SOCIAL_EVENTS.PARTY_CREATED, party);
    return party;
  }

  async updateParty(partyId: string, updates: Partial<Party>, userId: string): Promise<Party | null> {
    const party = this.parties.get(partyId);
    if (!party) return null;

    if (party.leaderId !== userId) {
      throw new Error('Only party leader can update party');
    }

    const updatedParty = { ...party, ...updates, lastModified: new Date() };
    this.parties.set(partyId, updatedParty);
    this.emit(SOCIAL_EVENTS.PARTY_UPDATED, updatedParty);
    
    return updatedParty;
  }

  async deleteParty(partyId: string, userId: string): Promise<boolean> {
    const party = this.parties.get(partyId);
    if (!party) return false;

    if (party.leaderId !== userId) {
      throw new Error('Only party leader can delete party');
    }

    this.parties.delete(partyId);
    this.emit(SOCIAL_EVENTS.PARTY_DELETED, { partyId, deletedBy: userId });
    
    return true;
  }

  async joinParty(partyId: string, userId: string): Promise<boolean> {
    const party = this.parties.get(partyId);
    if (!party || !party.isRecruiting) return false;

    if (party.members.length >= party.maxMembers) {
      throw new Error('Party is at capacity');
    }

    if (!party.isPublic) {
      throw new Error('Party is private');
    }

    // Check requirements
    for (const requirement of party.requirements) {
      if (!requirement.isMet) {
        throw new Error(`Requirement not met: ${requirement.description}`);
      }
    }

    const member = {
      userId,
      username: 'Unknown', // Should be fetched from user service
      role: 'member' as const,
      joinedAt: new Date(),
      contributions: 0,
      status: 'active' as const,
      permissions: ['view_private']
    };

    party.members.push(member);
    this.userParties.set(userId, (this.userParties.get(userId) || new Set()).add(partyId));
    
    this.emit(SOCIAL_EVENTS.PARTY_JOINED, { partyId, userId, party });
    return true;
  }

  async leaveParty(partyId: string, userId: string): Promise<boolean> {
    const party = this.parties.get(partyId);
    if (!party) return false;

    if (party.leaderId === userId) {
      throw new Error('Party leader cannot leave party. Transfer leadership or disband party.');
    }

    party.members = party.members.filter(m => m.userId !== userId);
    
    const userParties = this.userParties.get(userId);
    if (userParties) {
      userParties.delete(partyId);
    }
    
    this.emit(SOCIAL_EVENTS.PARTY_LEFT, { partyId, userId, party });
    return true;
  }

  // Social Interactions
  async createInteraction(interactionData: Partial<SocialInteraction>, fromUserId: string): Promise<SocialInteraction> {
    const interaction: SocialInteraction = {
      id: this.generateId(),
      type: interactionData.type || 'message',
      fromUserId,
      toUserId: interactionData.toUserId || '',
      hubId: interactionData.hubId,
      eventId: interactionData.eventId,
      partyId: interactionData.partyId,
      content: interactionData.content || '',
      timestamp: new Date(),
      isPublic: interactionData.isPublic !== false,
      reactions: [],
      replies: [],
      metadata: interactionData.metadata || {
        tags: [],
        category: 'social',
        isTradeable: false,
        isSellable: false,
        baseValue: 0
      }
    };

    this.interactions.set(interaction.id, interaction);
    this.emit(SOCIAL_EVENTS.INTERACTION_CREATED, interaction);
    
    return interaction;
  }

  async addReaction(interactionId: string, userId: string, reactionType: ReactionType): Promise<boolean> {
    const interaction = this.interactions.get(interactionId);
    if (!interaction) return false;

    // Remove existing reaction from this user
    interaction.reactions = interaction.reactions.filter(r => r.userId !== userId);
    
    // Add new reaction
    interaction.reactions.push({
      userId,
      username: 'Unknown', // Should be fetched from user service
      type: reactionType,
      timestamp: new Date()
    });

    this.emit(SOCIAL_EVENTS.REACTION_ADDED, { interactionId, userId, reactionType, interaction });
    return true;
  }

  async removeReaction(interactionId: string, userId: string): Promise<boolean> {
    const interaction = this.interactions.get(interactionId);
    if (!interaction) return false;

    const initialLength = interaction.reactions.length;
    interaction.reactions = interaction.reactions.filter(r => r.userId !== userId);
    
    if (interaction.reactions.length < initialLength) {
      this.emit(SOCIAL_EVENTS.REACTION_REMOVED, { interactionId, userId, interaction });
      return true;
    }
    
    return false;
  }

  // Statistics and Analytics
  async getUserStats(userId: string): Promise<SocialStats> {
    let stats = this.userStats.get(userId);
    if (!stats) {
      stats = {
        userId,
        totalEventsAttended: 0,
        totalEventsOrganized: 0,
        totalPartiesJoined: 0,
        totalPartiesCreated: 0,
        totalInteractions: 0,
        totalReactions: 0,
        totalRewards: 0,
        favoriteHub: '',
        favoriteEventType: 'social',
        reputation: 0,
        level: 1,
        experience: 0,
        achievements: [],
        badges: [],
        lastActive: new Date(),
        metadata: {
          tags: [],
          category: 'social',
          isTradeable: false,
          isSellable: false,
          baseValue: 0
        }
      };
      this.userStats.set(userId, stats);
    }
    
    return stats;
  }

  async updateUserStats(userId: string, updates: Partial<SocialStats>): Promise<SocialStats> {
    const stats = await this.getUserStats(userId);
    const updatedStats = { ...stats, ...updates, lastActive: new Date() };
    this.userStats.set(userId, updatedStats);
    this.emit(SOCIAL_EVENTS.STATS_UPDATED, updatedStats);
    
    return updatedStats;
  }

  // Query Methods
  async getHubs(filters?: { type?: HubType; isPublic?: boolean; isActive?: boolean }): Promise<SocialHub[]> {
    let hubs = Array.from(this.hubs.values());
    
    if (filters) {
      if (filters.type) hubs = hubs.filter(h => h.type === filters.type);
      if (filters.isPublic !== undefined) hubs = hubs.filter(h => h.isPublic === filters.isPublic);
      if (filters.isActive !== undefined) hubs = hubs.filter(h => h.isActive === filters.isActive);
    }
    
    return hubs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getEvents(filters?: { type?: EventType; status?: EventStatus; hubId?: string }): Promise<SocialEvent[]> {
    let events = Array.from(this.events.values());
    
    if (filters) {
      if (filters.type) events = events.filter(e => e.type === filters.type);
      if (filters.status) events = events.filter(e => e.status === filters.status);
      if (filters.hubId) events = events.filter(e => e.hubId === filters.hubId);
    }
    
    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getParties(filters?: { status?: PartyStatus; isPublic?: boolean; isRecruiting?: boolean }): Promise<Party[]> {
    let parties = Array.from(this.parties.values());
    
    if (filters) {
      if (filters.status) parties = parties.filter(p => p.status === filters.status);
      if (filters.isPublic !== undefined) parties = parties.filter(p => p.isPublic === filters.isPublic);
      if (filters.isRecruiting !== undefined) parties = parties.filter(p => p.isRecruiting === filters.isRecruiting);
    }
    
    return parties.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserHubs(userId: string): Promise<SocialHub[]> {
    const userHubIds = this.userHubs.get(userId) || new Set();
    return Array.from(userHubIds).map(id => this.hubs.get(id)).filter(Boolean) as SocialHub[];
  }

  async getUserEvents(userId: string): Promise<SocialEvent[]> {
    const userEventIds = this.userEvents.get(userId) || new Set();
    return Array.from(userEventIds).map(id => this.events.get(id)).filter(Boolean) as SocialEvent[];
  }

  async getUserParties(userId: string): Promise<Party[]> {
    const userPartyIds = this.userParties.get(userId) || new Set();
    return Array.from(userPartyIds).map(id => this.parties.get(id)).filter(Boolean) as Party[];
  }

  // Private Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private initializeDefaultHubs(): void {
    // Create default public hubs
    const defaultHubs = [
      {
        name: 'Central Plaza',
        description: 'The main gathering place for all players',
        type: 'public' as HubType,
        capacity: 100,
        location: { x: 0, y: 0, z: 0, world: 'main', region: 'central', coordinates: '0,0,0' },
        features: [
          {
            id: 'chat',
            name: 'Global Chat',
            type: 'chat' as const,
            description: 'Chat with all players in the hub',
            isActive: true,
            requirements: [],
            effects: [],
            metadata: { icon: '💬', tags: [], category: 'communication', isTradeable: false, isSellable: false, baseValue: 0 }
          }
        ],
        rules: [],
        metadata: {
          lighting: 'bright',
          weather: 'clear',
          timeOfDay: 'noon',
          tags: ['public', 'central', 'gathering'],
          category: 'social',
          isTradeable: false,
          isSellable: false,
          baseValue: 0,
          customizations: []
        }
      },
      {
        name: 'Gaming Arena',
        description: 'Competitive gaming and tournaments',
        type: 'gaming' as HubType,
        capacity: 50,
        location: { x: 100, y: 0, z: 0, world: 'main', region: 'gaming', coordinates: '100,0,0' },
        features: [
          {
            id: 'tournaments',
            name: 'Tournament System',
            type: 'gaming' as const,
            description: 'Join competitive tournaments',
            isActive: true,
            requirements: [],
            effects: [],
            metadata: { icon: '🏆', tags: [], category: 'gaming', isTradeable: false, isSellable: false, baseValue: 0 }
          }
        ],
        rules: [],
        metadata: {
          lighting: 'dynamic',
          weather: 'clear',
          timeOfDay: 'evening',
          tags: ['gaming', 'competitive', 'tournaments'],
          category: 'gaming',
          isTradeable: false,
          isSellable: false,
          baseValue: 0,
          customizations: []
        }
      }
    ];

    defaultHubs.forEach(hubData => {
      this.createHub(hubData, 'system');
    });
  }

  private startEventScheduler(): void {
    // Check for events that should start or end every minute
    setInterval(() => {
      const now = new Date();
      
      for (const event of this.events.values()) {
        if (event.status === 'scheduled' && event.startTime <= now) {
          event.status = 'active';
          this.emit(SOCIAL_EVENTS.EVENT_STARTED, event);
        }
        
        if (event.status === 'active' && event.endTime <= now) {
          event.status = 'completed';
          this.emit(SOCIAL_EVENTS.EVENT_ENDED, event);
        }
      }
    }, 60000); // Check every minute
  }
}

export default SocialService;
