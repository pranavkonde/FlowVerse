import { EventEmitter } from 'events';
import { EventService } from './EventService';
import { SocialService } from './SocialService';

export interface Season {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  theme: string;
  events: SeasonalEvent[];
  rewards: SeasonalReward[];
  status: 'upcoming' | 'active' | 'completed';
  metadata: {
    bannerUrl: string;
    themeColors: string[];
    specialEffects: string[];
    backgroundMusic?: string;
  };
}

export interface SeasonalEvent {
  id: string;
  seasonId: string;
  name: string;
  description: string;
  type: 'quest' | 'challenge' | 'tournament' | 'festival' | 'special';
  startDate: Date;
  endDate: Date;
  requirements: {
    minLevel?: number;
    items?: string[];
    achievements?: string[];
  };
  rewards: SeasonalReward[];
  objectives: {
    type: string;
    target: number;
    current: number;
    completed: boolean;
  }[];
  participants: string[];
  status: 'upcoming' | 'active' | 'completed';
  metadata: {
    location: string;
    difficulty: 'easy' | 'medium' | 'hard';
    maxParticipants?: number;
    teamEvent: boolean;
  };
}

export interface SeasonalReward {
  id: string;
  name: string;
  description: string;
  type: 'item' | 'currency' | 'cosmetic' | 'title' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  metadata: {
    imageUrl: string;
    previewUrl?: string;
    effects?: string[];
  };
}

export class SeasonalEventService {
  private static instance: SeasonalEventService;
  private eventEmitter: EventEmitter = new EventEmitter();
  private seasons: Map<string, Season> = new Map();
  private events: Map<string, SeasonalEvent> = new Map();
  private userProgress: Map<string, Map<string, number>> = new Map();

  private constructor(
    private eventService: EventService,
    private socialService: SocialService
  ) {
    this.initializeSeasons();
    this.startSeasonScheduler();
  }

  static getInstance(
    eventService: EventService,
    socialService: SocialService
  ): SeasonalEventService {
    if (!SeasonalEventService.instance) {
      SeasonalEventService.instance = new SeasonalEventService(
        eventService,
        socialService
      );
    }
    return SeasonalEventService.instance;
  }

  private initializeSeasons() {
    const currentYear = new Date().getFullYear();
    
    // Spring Season
    const springStart = new Date(currentYear, 2, 20); // March 20
    const springEnd = new Date(currentYear, 5, 20);   // June 20
    this.createSeason({
      name: 'Spring Festival',
      description: 'Celebrate the renewal of life with spring-themed events and rewards',
      startDate: springStart,
      endDate: springEnd,
      theme: 'spring',
      metadata: {
        bannerUrl: '/assets/seasons/spring_banner.jpg',
        themeColors: ['#90EE90', '#98FB98', '#00FF7F'],
        specialEffects: ['flower_petals', 'butterflies'],
        backgroundMusic: 'spring_theme.mp3'
      }
    });

    // Summer Season
    const summerStart = new Date(currentYear, 5, 21); // June 21
    const summerEnd = new Date(currentYear, 8, 21);   // September 21
    this.createSeason({
      name: 'Summer Adventures',
      description: 'Embark on exciting summer adventures with special events and prizes',
      startDate: summerStart,
      endDate: summerEnd,
      theme: 'summer',
      metadata: {
        bannerUrl: '/assets/seasons/summer_banner.jpg',
        themeColors: ['#FFD700', '#FFA500', '#FF8C00'],
        specialEffects: ['sun_rays', 'beach_waves'],
        backgroundMusic: 'summer_theme.mp3'
      }
    });

    // Fall Season
    const fallStart = new Date(currentYear, 8, 22);   // September 22
    const fallEnd = new Date(currentYear, 11, 20);    // December 20
    this.createSeason({
      name: 'Autumn Mysteries',
      description: 'Discover the mysteries of autumn with themed events and collectibles',
      startDate: fallStart,
      endDate: fallEnd,
      theme: 'fall',
      metadata: {
        bannerUrl: '/assets/seasons/fall_banner.jpg',
        themeColors: ['#D2691E', '#CD853F', '#DEB887'],
        specialEffects: ['falling_leaves', 'fog'],
        backgroundMusic: 'autumn_theme.mp3'
      }
    });

    // Winter Season
    const winterStart = new Date(currentYear, 11, 21); // December 21
    const winterEnd = new Date(currentYear + 1, 2, 19); // March 19 next year
    this.createSeason({
      name: 'Winter Wonderland',
      description: 'Experience the magic of winter with festive events and rewards',
      startDate: winterStart,
      endDate: winterEnd,
      theme: 'winter',
      metadata: {
        bannerUrl: '/assets/seasons/winter_banner.jpg',
        themeColors: ['#87CEEB', '#B0E0E6', '#F0F8FF'],
        specialEffects: ['snow', 'ice_crystals'],
        backgroundMusic: 'winter_theme.mp3'
      }
    });
  }

  private async createSeason(data: Partial<Season>): Promise<Season> {
    const season: Season = {
      id: crypto.randomUUID(),
      name: data.name || 'New Season',
      description: data.description || '',
      startDate: data.startDate || new Date(),
      endDate: data.endDate || new Date(),
      theme: data.theme || 'default',
      events: [],
      rewards: [],
      status: 'upcoming',
      metadata: data.metadata || {
        bannerUrl: '',
        themeColors: [],
        specialEffects: []
      }
    };

    this.seasons.set(season.id, season);
    await this.generateSeasonalEvents(season);
    return season;
  }

  private async generateSeasonalEvents(season: Season) {
    const eventTemplates = this.getEventTemplatesForTheme(season.theme);
    
    for (const template of eventTemplates) {
      const event = await this.createSeasonalEvent({
        seasonId: season.id,
        name: template.name,
        description: template.description,
        type: template.type,
        startDate: this.calculateEventStartDate(season, template),
        endDate: this.calculateEventEndDate(season, template),
        requirements: template.requirements,
        rewards: template.rewards,
        objectives: template.objectives,
        metadata: template.metadata
      });

      season.events.push(event);
    }

    this.seasons.set(season.id, season);
  }

  private getEventTemplatesForTheme(theme: string): Partial<SeasonalEvent>[] {
    switch (theme) {
      case 'spring':
        return [
          {
            name: 'Spring Flower Festival',
            description: 'Collect and plant magical flowers across the realm',
            type: 'festival',
            requirements: { minLevel: 5 },
            objectives: [
              { type: 'collect_flowers', target: 50, current: 0, completed: false },
              { type: 'plant_gardens', target: 5, current: 0, completed: false }
            ],
            metadata: {
              location: 'Garden District',
              difficulty: 'easy',
              teamEvent: false
            }
          },
          // Add more spring events...
        ];
      case 'summer':
        return [
          {
            name: 'Beach Tournament',
            description: 'Compete in exciting beach games and activities',
            type: 'tournament',
            requirements: { minLevel: 10 },
            objectives: [
              { type: 'win_matches', target: 10, current: 0, completed: false },
              { type: 'collect_shells', target: 100, current: 0, completed: false }
            ],
            metadata: {
              location: 'Sunny Shores',
              difficulty: 'medium',
              teamEvent: true
            }
          },
          // Add more summer events...
        ];
      // Add fall and winter event templates...
      default:
        return [];
    }
  }

  private calculateEventStartDate(season: Season, template: Partial<SeasonalEvent>): Date {
    // Implement logic to spread events throughout the season
    return season.startDate;
  }

  private calculateEventEndDate(season: Season, template: Partial<SeasonalEvent>): Date {
    // Implement logic to set appropriate event duration
    return season.endDate;
  }

  private async createSeasonalEvent(data: Partial<SeasonalEvent>): Promise<SeasonalEvent> {
    const event: SeasonalEvent = {
      id: crypto.randomUUID(),
      seasonId: data.seasonId || '',
      name: data.name || 'New Event',
      description: data.description || '',
      type: data.type || 'special',
      startDate: data.startDate || new Date(),
      endDate: data.endDate || new Date(),
      requirements: data.requirements || {},
      rewards: data.rewards || [],
      objectives: data.objectives || [],
      participants: [],
      status: 'upcoming',
      metadata: data.metadata || {
        location: '',
        difficulty: 'medium',
        teamEvent: false
      }
    };

    this.events.set(event.id, event);
    return event;
  }

  private startSeasonScheduler() {
    // Check season and event status every hour
    setInterval(() => {
      const now = new Date();
      
      this.seasons.forEach(season => {
        // Update season status
        if (now >= season.startDate && now <= season.endDate && season.status === 'upcoming') {
          season.status = 'active';
          this.eventEmitter.emit('seasonStarted', season);
        } else if (now > season.endDate && season.status === 'active') {
          season.status = 'completed';
          this.eventEmitter.emit('seasonEnded', season);
        }

        // Update event status
        season.events.forEach(event => {
          const storedEvent = this.events.get(event.id);
          if (storedEvent) {
            if (now >= event.startDate && now <= event.endDate && storedEvent.status === 'upcoming') {
              storedEvent.status = 'active';
              this.eventEmitter.emit('eventStarted', storedEvent);
            } else if (now > event.endDate && storedEvent.status === 'active') {
              storedEvent.status = 'completed';
              this.eventEmitter.emit('eventEnded', storedEvent);
            }
            this.events.set(event.id, storedEvent);
          }
        });

        this.seasons.set(season.id, season);
      });
    }, 3600000); // Check every hour
  }

  // Public methods
  async getCurrentSeason(): Promise<Season | null> {
    const now = new Date();
    for (const season of this.seasons.values()) {
      if (now >= season.startDate && now <= season.endDate) {
        return season;
      }
    }
    return null;
  }

  async getUpcomingSeasons(): Promise<Season[]> {
    const now = new Date();
    return Array.from(this.seasons.values())
      .filter(season => season.startDate > now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  async getSeasonEvents(seasonId: string): Promise<SeasonalEvent[]> {
    const season = this.seasons.get(seasonId);
    return season ? season.events : [];
  }

  async joinEvent(eventId: string, userId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event || event.status !== 'active') {
      return false;
    }

    if (event.metadata.maxParticipants && event.participants.length >= event.metadata.maxParticipants) {
      return false;
    }

    if (!event.participants.includes(userId)) {
      event.participants.push(userId);
      this.events.set(eventId, event);
      this.eventEmitter.emit('participantJoined', { eventId, userId });
    }

    return true;
  }

  async updateEventProgress(
    eventId: string,
    userId: string,
    objectiveType: string,
    progress: number
  ): Promise<boolean> {
    const event = this.events.get(eventId);
    if (!event || event.status !== 'active') {
      return false;
    }

    const objective = event.objectives.find(obj => obj.type === objectiveType);
    if (!objective) {
      return false;
    }

    objective.current = Math.min(objective.current + progress, objective.target);
    objective.completed = objective.current >= objective.target;

    this.events.set(eventId, event);
    this.eventEmitter.emit('progressUpdated', {
      eventId,
      userId,
      objectiveType,
      progress: objective.current,
      completed: objective.completed
    });

    return true;
  }

  async getEventProgress(eventId: string, userId: string): Promise<number[]> {
    const event = this.events.get(eventId);
    if (!event) {
      return [];
    }

    return event.objectives.map(obj => obj.current);
  }

  onSeasonStarted(callback: (season: Season) => void) {
    this.eventEmitter.on('seasonStarted', callback);
  }

  onSeasonEnded(callback: (season: Season) => void) {
    this.eventEmitter.on('seasonEnded', callback);
  }

  onEventStarted(callback: (event: SeasonalEvent) => void) {
    this.eventEmitter.on('eventStarted', callback);
  }

  onEventEnded(callback: (event: SeasonalEvent) => void) {
    this.eventEmitter.on('eventEnded', callback);
  }

  onProgressUpdated(
    callback: (data: {
      eventId: string;
      userId: string;
      objectiveType: string;
      progress: number;
      completed: boolean;
    }) => void
  ) {
    this.eventEmitter.on('progressUpdated', callback);
  }
}
export const seasonalEventService = SeasonalEventService.getInstance(
  new EventService(null as any), // Pass proper SocketIO instance
  new SocialService()
);

