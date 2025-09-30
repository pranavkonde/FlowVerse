import { EventEmitter } from 'events';
import { ProgressTrackingService } from './ProgressTrackingService';
import { AchievementService } from './AchievementService';
import { EventService } from './EventService';

export interface JournalEntry {
  id: string;
  userId: string;
  type: 'achievement' | 'quest' | 'milestone' | 'discovery' | 'note' | 'combat' | 'crafting' | 'trading';
  title: string;
  description: string;
  timestamp: Date;
  category: string;
  tags: string[];
  metadata: {
    progress?: number;
    location?: string;
    participants?: string[];
    rewards?: {
      type: string;
      amount: number;
    }[];
    screenshots?: string[];
    linkedEntries?: string[];
    customFields?: Record<string, any>;
  };
  isHidden: boolean;
  isPinned: boolean;
}

export interface JournalCollection {
  id: string;
  userId: string;
  name: string;
  description: string;
  entries: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalStats {
  totalEntries: number;
  entriesByType: Record<string, number>;
  entriesByCategory: Record<string, number>;
  mostUsedTags: { tag: string; count: number }[];
  lastEntryDate?: Date;
  streakDays: number;
}

export class JournalService extends EventEmitter {
  private static instance: JournalService;
  private entries: Map<string, JournalEntry> = new Map();
  private collections: Map<string, JournalCollection> = new Map();
  private userStats: Map<string, JournalStats> = new Map();
  private userDefaultCollections: Map<string, string> = new Map();

  private constructor(
    private progressService: ProgressTrackingService,
    private achievementService: AchievementService,
    private eventService: EventService
  ) {
    super();
    this.setupEventListeners();
  }

  static getInstance(
    progressService: ProgressTrackingService,
    achievementService: AchievementService,
    eventService: EventService
  ): JournalService {
    if (!JournalService.instance) {
      JournalService.instance = new JournalService(
        progressService,
        achievementService,
        eventService
      );
    }
    return JournalService.instance;
  }

  private setupEventListeners() {
    // Listen for achievement completions
    this.achievementService.on('achievementCompleted', async ({ userId, achievement }) => {
      await this.createEntry({
        userId,
        type: 'achievement',
        title: `Achievement Unlocked: ${achievement.name}`,
        description: achievement.description,
        category: 'achievements',
        tags: ['achievement', achievement.category],
        metadata: {
          rewards: achievement.rewards
        }
      });
    });

    // Listen for quest completions
    this.eventService.on('objectiveComplete', async ({ userId, objective }) => {
      await this.createEntry({
        userId,
        type: 'quest',
        title: `Quest Completed: ${objective.title}`,
        description: objective.description,
        category: 'quests',
        tags: ['quest', objective.type],
        metadata: {
          progress: 100,
          rewards: objective.rewards
        }
      });
    });

    // Listen for milestone achievements
    this.progressService.on('levelUp', async ({ userId, level }) => {
      await this.createEntry({
        userId,
        type: 'milestone',
        title: `Level Up! Reached Level ${level}`,
        description: `Congratulations on reaching level ${level}!`,
        category: 'progression',
        tags: ['level-up', 'milestone'],
        metadata: {
          customFields: { level }
        }
      });
    });
  }

  async createEntry(data: Omit<JournalEntry, 'id' | 'timestamp' | 'isHidden' | 'isPinned'>): Promise<JournalEntry> {
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      isHidden: false,
      isPinned: false,
      ...data
    };

    this.entries.set(entry.id, entry);

    // Add to default collection if exists
    const defaultCollectionId = this.userDefaultCollections.get(data.userId);
    if (defaultCollectionId) {
      const collection = this.collections.get(defaultCollectionId);
      if (collection) {
        collection.entries.push(entry.id);
        collection.updatedAt = new Date();
        this.collections.set(collection.id, collection);
      }
    }

    // Update stats
    await this.updateStats(data.userId, entry);

    this.emit('entryCreated', entry);
    return entry;
  }

  async updateEntry(
    entryId: string,
    userId: string,
    updates: Partial<Omit<JournalEntry, 'id' | 'userId' | 'timestamp'>>
  ): Promise<JournalEntry> {
    const entry = this.entries.get(entryId);
    if (!entry || entry.userId !== userId) {
      throw new Error('Entry not found or unauthorized');
    }

    const updatedEntry = {
      ...entry,
      ...updates
    };

    this.entries.set(entryId, updatedEntry);
    this.emit('entryUpdated', updatedEntry);
    return updatedEntry;
  }

  async deleteEntry(entryId: string, userId: string): Promise<boolean> {
    const entry = this.entries.get(entryId);
    if (!entry || entry.userId !== userId) {
      throw new Error('Entry not found or unauthorized');
    }

    // Remove from collections
    this.collections.forEach(collection => {
      if (collection.entries.includes(entryId)) {
        collection.entries = collection.entries.filter(id => id !== entryId);
        collection.updatedAt = new Date();
        this.collections.set(collection.id, collection);
      }
    });

    this.entries.delete(entryId);
    this.emit('entryDeleted', { entryId, userId });
    return true;
  }

  async createCollection(
    userId: string,
    data: {
      name: string;
      description: string;
      isDefault?: boolean;
    }
  ): Promise<JournalCollection> {
    const collection: JournalCollection = {
      id: crypto.randomUUID(),
      userId,
      name: data.name,
      description: data.description,
      entries: [],
      isDefault: data.isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (collection.isDefault) {
      // Unset previous default collection
      const previousDefaultId = this.userDefaultCollections.get(userId);
      if (previousDefaultId) {
        const previousDefault = this.collections.get(previousDefaultId);
        if (previousDefault) {
          previousDefault.isDefault = false;
          this.collections.set(previousDefaultId, previousDefault);
        }
      }
      this.userDefaultCollections.set(userId, collection.id);
    }

    this.collections.set(collection.id, collection);
    this.emit('collectionCreated', collection);
    return collection;
  }

  async updateCollection(
    collectionId: string,
    userId: string,
    updates: Partial<Pick<JournalCollection, 'name' | 'description' | 'isDefault'>>
  ): Promise<JournalCollection> {
    const collection = this.collections.get(collectionId);
    if (!collection || collection.userId !== userId) {
      throw new Error('Collection not found or unauthorized');
    }

    if (updates.isDefault && !collection.isDefault) {
      // Unset previous default collection
      const previousDefaultId = this.userDefaultCollections.get(userId);
      if (previousDefaultId) {
        const previousDefault = this.collections.get(previousDefaultId);
        if (previousDefault) {
          previousDefault.isDefault = false;
          this.collections.set(previousDefaultId, previousDefault);
        }
      }
      this.userDefaultCollections.set(userId, collection.id);
    }

    const updatedCollection = {
      ...collection,
      ...updates,
      updatedAt: new Date()
    };

    this.collections.set(collectionId, updatedCollection);
    this.emit('collectionUpdated', updatedCollection);
    return updatedCollection;
  }

  async deleteCollection(collectionId: string, userId: string): Promise<boolean> {
    const collection = this.collections.get(collectionId);
    if (!collection || collection.userId !== userId) {
      throw new Error('Collection not found or unauthorized');
    }

    if (collection.isDefault) {
      throw new Error('Cannot delete default collection');
    }

    this.collections.delete(collectionId);
    this.emit('collectionDeleted', { collectionId, userId });
    return true;
  }

  async addEntryToCollection(
    entryId: string,
    collectionId: string,
    userId: string
  ): Promise<boolean> {
    const entry = this.entries.get(entryId);
    const collection = this.collections.get(collectionId);

    if (!entry || !collection || entry.userId !== userId || collection.userId !== userId) {
      throw new Error('Entry or collection not found or unauthorized');
    }

    if (!collection.entries.includes(entryId)) {
      collection.entries.push(entryId);
      collection.updatedAt = new Date();
      this.collections.set(collectionId, collection);
      this.emit('entryAddedToCollection', { entryId, collectionId });
    }

    return true;
  }

  async removeEntryFromCollection(
    entryId: string,
    collectionId: string,
    userId: string
  ): Promise<boolean> {
    const collection = this.collections.get(collectionId);
    if (!collection || collection.userId !== userId) {
      throw new Error('Collection not found or unauthorized');
    }

    const entryIndex = collection.entries.indexOf(entryId);
    if (entryIndex !== -1) {
      collection.entries.splice(entryIndex, 1);
      collection.updatedAt = new Date();
      this.collections.set(collectionId, collection);
      this.emit('entryRemovedFromCollection', { entryId, collectionId });
    }

    return true;
  }

  private async updateStats(userId: string, entry: JournalEntry) {
    let stats = this.userStats.get(userId);
    if (!stats) {
      stats = {
        totalEntries: 0,
        entriesByType: {},
        entriesByCategory: {},
        mostUsedTags: [],
        streakDays: 0
      };
    }

    // Update total entries
    stats.totalEntries++;

    // Update entries by type
    stats.entriesByType[entry.type] = (stats.entriesByType[entry.type] || 0) + 1;

    // Update entries by category
    stats.entriesByCategory[entry.category] = (stats.entriesByCategory[entry.category] || 0) + 1;

    // Update tag counts
    const tagCounts = new Map<string, number>();
    entry.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
    stats.mostUsedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Update streak
    const now = new Date();
    if (stats.lastEntryDate) {
      const daysSinceLastEntry = Math.floor(
        (now.getTime() - stats.lastEntryDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysSinceLastEntry <= 1) {
        stats.streakDays++;
      } else {
        stats.streakDays = 1;
      }
    } else {
      stats.streakDays = 1;
    }
    stats.lastEntryDate = now;

    this.userStats.set(userId, stats);
    this.emit('statsUpdated', { userId, stats });
  }

  async getEntry(entryId: string): Promise<JournalEntry | null> {
    return this.entries.get(entryId) || null;
  }

  async getUserEntries(
    userId: string,
    filters?: {
      type?: JournalEntry['type'];
      category?: string;
      tags?: string[];
      startDate?: Date;
      endDate?: Date;
      searchText?: string;
    }
  ): Promise<JournalEntry[]> {
    let entries = Array.from(this.entries.values()).filter(
      entry => entry.userId === userId && !entry.isHidden
    );

    if (filters) {
      if (filters.type) {
        entries = entries.filter(entry => entry.type === filters.type);
      }
      if (filters.category) {
        entries = entries.filter(entry => entry.category === filters.category);
      }
      if (filters.tags?.length) {
        entries = entries.filter(entry =>
          filters.tags!.every(tag => entry.tags.includes(tag))
        );
      }
      if (filters.startDate) {
        entries = entries.filter(entry => entry.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        entries = entries.filter(entry => entry.timestamp <= filters.endDate!);
      }
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        entries = entries.filter(
          entry =>
            entry.title.toLowerCase().includes(searchLower) ||
            entry.description.toLowerCase().includes(searchLower)
        );
      }
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getCollection(collectionId: string): Promise<JournalCollection | null> {
    return this.collections.get(collectionId) || null;
  }

  async getUserCollections(userId: string): Promise<JournalCollection[]> {
    return Array.from(this.collections.values()).filter(
      collection => collection.userId === userId
    );
  }

  async getStats(userId: string): Promise<JournalStats> {
    return (
      this.userStats.get(userId) || {
        totalEntries: 0,
        entriesByType: {},
        entriesByCategory: {},
        mostUsedTags: [],
        streakDays: 0
      }
    );
  }

  onEntryCreated(callback: (entry: JournalEntry) => void) {
    this.on('entryCreated', callback);
  }

  onEntryUpdated(callback: (entry: JournalEntry) => void) {
    this.on('entryUpdated', callback);
  }

  onEntryDeleted(callback: (data: { entryId: string; userId: string }) => void) {
    this.on('entryDeleted', callback);
  }

  onCollectionCreated(callback: (collection: JournalCollection) => void) {
    this.on('collectionCreated', callback);
  }

  onCollectionUpdated(callback: (collection: JournalCollection) => void) {
    this.on('collectionUpdated', callback);
  }

  onCollectionDeleted(callback: (data: { collectionId: string; userId: string }) => void) {
    this.on('collectionDeleted', callback);
  }

  onEntryAddedToCollection(callback: (data: { entryId: string; collectionId: string }) => void) {
    this.on('entryAddedToCollection', callback);
  }

  onEntryRemovedFromCollection(callback: (data: { entryId: string; collectionId: string }) => void) {
    this.on('entryRemovedFromCollection', callback);
  }

  onStatsUpdated(callback: (data: { userId: string; stats: JournalStats }) => void) {
    this.on('statsUpdated', callback);
  }
}

export const journalService = JournalService.getInstance(
  new ProgressTrackingService(),
  new AchievementService(),
  new EventService(null as any) // Pass proper SocketIO instance
);
