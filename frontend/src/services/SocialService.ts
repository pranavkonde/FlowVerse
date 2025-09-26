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

export class SocialService {
  private socket: any;
  private eventListeners: Map<string, Function[]> = new Map();
  private notificationListeners: Map<string, Function[]> = new Map();

  constructor(socket: any) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  // Hub Management
  async createHub(hubData: Partial<SocialHub>): Promise<SocialHub> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:create_hub', hubData, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async joinHub(hubId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:join_hub', { hubId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async leaveHub(hubId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:leave_hub', { hubId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getHubs(filters?: { type?: HubType; isPublic?: boolean; isActive?: boolean }): Promise<SocialHub[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:get_hubs', filters, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Event Management
  async createEvent(eventData: Partial<SocialEvent>): Promise<SocialEvent> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:create_event', eventData, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async joinEvent(eventId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:join_event', { eventId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async leaveEvent(eventId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:leave_event', { eventId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getEvents(filters?: { type?: EventType; status?: EventStatus; hubId?: string }): Promise<SocialEvent[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:get_events', filters, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Party Management
  async createParty(partyData: Partial<Party>): Promise<Party> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:create_party', partyData, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async joinParty(partyId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:join_party', { partyId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async leaveParty(partyId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:leave_party', { partyId }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async getParties(filters?: { status?: PartyStatus; isPublic?: boolean; isRecruiting?: boolean }): Promise<Party[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:get_parties', filters, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Social Interactions
  async createInteraction(interactionData: Partial<SocialInteraction>): Promise<SocialInteraction> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:create_interaction', interactionData, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  async addReaction(interactionId: string, reactionType: ReactionType): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:add_reaction', { interactionId, reactionType }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Statistics
  async getUserStats(): Promise<SocialStats> {
    return new Promise((resolve, reject) => {
      this.socket.emit('social:get_user_stats', (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // Event Listeners
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

  // Notification Listeners
  onNotification(notification: string, callback: Function): void {
    if (!this.notificationListeners.has(notification)) {
      this.notificationListeners.set(notification, []);
    }
    this.notificationListeners.get(notification)!.push(callback);
  }

  offNotification(notification: string, callback: Function): void {
    const listeners = this.notificationListeners.get(notification);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Private Methods
  private setupSocketListeners(): void {
    // Social Events
    this.socket.on(SOCIAL_EVENTS.HUB_CREATED, (data: any) => {
      this.emitEvent(SOCIAL_EVENTS.HUB_CREATED, data);
    });

    this.socket.on(SOCIAL_EVENTS.HUB_JOINED, (data: any) => {
      this.emitEvent(SOCIAL_EVENTS.HUB_JOINED, data);
    });

    this.socket.on(SOCIAL_EVENTS.EVENT_CREATED, (data: any) => {
      this.emitEvent(SOCIAL_EVENTS.EVENT_CREATED, data);
    });

    this.socket.on(SOCIAL_EVENTS.EVENT_STARTED, (data: any) => {
      this.emitEvent(SOCIAL_EVENTS.EVENT_STARTED, data);
    });

    this.socket.on(SOCIAL_EVENTS.PARTY_CREATED, (data: any) => {
      this.emitEvent(SOCIAL_EVENTS.PARTY_CREATED, data);
    });

    this.socket.on(SOCIAL_EVENTS.INTERACTION_CREATED, (data: any) => {
      this.emitEvent(SOCIAL_EVENTS.INTERACTION_CREATED, data);
    });

    // Notifications
    this.socket.on(SOCIAL_NOTIFICATIONS.EVENT_STARTING, (data: any) => {
      this.emitNotification(SOCIAL_NOTIFICATIONS.EVENT_STARTING, data);
    });

    this.socket.on(SOCIAL_NOTIFICATIONS.PARTY_INVITATION, (data: any) => {
      this.emitNotification(SOCIAL_NOTIFICATIONS.PARTY_INVITATION, data);
    });
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  private emitNotification(notification: string, data: any): void {
    const listeners = this.notificationListeners.get(notification);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

export default SocialService;