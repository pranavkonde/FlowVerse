import { EventEmitter } from 'events';
import {
  JournalEntry,
  JournalCollection,
  JournalStats,
  JournalTemplate,
  JournalFilter,
  JournalCategory,
  EntityType
} from '../types/journal';

export class JournalService extends EventEmitter {
  private entries: Map<string, JournalEntry> = new Map();
  private collections: Map<string, JournalCollection> = new Map();
  private templates: Map<string, JournalTemplate> = new Map();
  private userStats: Map<string, JournalStats> = new Map();

  constructor() {
    super();
    this.initializeDefaultCollections();
    this.initializeTemplates();
    this.startDailyStatsUpdate();
  }

  private initializeDefaultCollections(): void {
    const defaultCollections: JournalCollection[] = [
      {
        id: 'COLLECTION-QUESTS',
        userId: 'system',
        name: 'Quest Log',
        description: 'Track your ongoing and completed quests',
        icon: '📜',
        color: '#FFD700',
        entries: [],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'COLLECTION-ACHIEVEMENTS',
        userId: 'system',
        name: 'Achievements',
        description: 'Record your achievements and milestones',
        icon: '🏆',
        color: '#9B59B6',
        entries: [],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      // Add more default collections...
    ];

    defaultCollections.forEach(collection =>
      this.collections.set(collection.id, collection)
    );
  }

  private initializeTemplates(): void {
    const templates: JournalTemplate[] = [
      {
        id: 'TEMPLATE-QUEST',
        name: 'Quest Entry',
        description: 'Template for recording quest progress',
        category: 'QUEST',
        content: '# Quest: {questName}\n\n## Objective\n{objective}\n\n## Progress\n{progress}\n\n## Notes\n{notes}',
        defaultTags: ['quest', 'progress'],
        placeholders: [
          {
            key: 'questName',
            description: 'Name of the quest',
            type: 'text',
            required: true
          },
          {
            key: 'objective',
            description: 'Quest objective',
            type: 'text',
            required: true
          },
          {
            key: 'progress',
            description: 'Current progress',
            type: 'text',
            required: false
          },
          {
            key: 'notes',
            description: 'Additional notes',
            type: 'text',
            required: false
          }
        ]
      }
      // Add more templates...
    ];

    templates.forEach(template =>
      this.templates.set(template.id, template)
    );
  }

  private startDailyStatsUpdate(): void {
    setInterval(() => {
      for (const [userId, stats] of this.userStats) {
        this.updateUserStats(userId);
      }
    }, 86400000); // Update stats daily
  }

  public async createEntry(
    userId: string,
    data: Partial<JournalEntry>
  ): Promise<JournalEntry> {
    const entry: JournalEntry = {
      id: `ENTRY-${Date.now()}`,
      userId,
      title: data.title || 'Untitled Entry',
      content: data.content || '',
      category: data.category || 'NOTE',
      tags: data.tags || [],
      attachments: data.attachments || [],
      linkedEntities: data.linkedEntities || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: data.isPinned || false,
      isPrivate: data.isPrivate || false,
      mood: data.mood,
      location: data.location,
      weather: data.weather
    };

    this.entries.set(entry.id, entry);
    this.updateUserStats(userId);
    this.emit('entry:created', { entryId: entry.id });

    return entry;
  }

  public async updateEntry(
    userId: string,
    entryId: string,
    updates: Partial<JournalEntry>
  ): Promise<JournalEntry> {
    const entry = this.entries.get(entryId);
    if (!entry || entry.userId !== userId) {
      throw new Error('Entry not found or unauthorized');
    }

    const updatedEntry = {
      ...entry,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.entries.set(entryId, updatedEntry);
    this.emit('entry:updated', { entryId });

    return updatedEntry;
  }

  public async deleteEntry(
    userId: string,
    entryId: string
  ): Promise<void> {
    const entry = this.entries.get(entryId);
    if (!entry || entry.userId !== userId) {
      throw new Error('Entry not found or unauthorized');
    }

    this.entries.delete(entryId);
    this.updateUserStats(userId);
    this.emit('entry:deleted', { entryId });
  }

  public async createCollection(
    userId: string,
    data: Partial<JournalCollection>
  ): Promise<JournalCollection> {
    const collection: JournalCollection = {
      id: `COLLECTION-${Date.now()}`,
      userId,
      name: data.name || 'New Collection',
      description: data.description || '',
      icon: data.icon || '📁',
      color: data.color || '#808080',
      entries: data.entries || [],
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.collections.set(collection.id, collection);
    this.emit('collection:created', { collectionId: collection.id });

    return collection;
  }

  public async updateCollection(
    userId: string,
    collectionId: string,
    updates: Partial<JournalCollection>
  ): Promise<JournalCollection> {
    const collection = this.collections.get(collectionId);
    if (!collection || (collection.userId !== userId && !collection.isDefault)) {
      throw new Error('Collection not found or unauthorized');
    }

    const updatedCollection = {
      ...collection,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.collections.set(collectionId, updatedCollection);
    this.emit('collection:updated', { collectionId });

    return updatedCollection;
  }

  public async addEntryToCollection(
    userId: string,
    entryId: string,
    collectionId: string
  ): Promise<JournalCollection> {
    const collection = this.collections.get(collectionId);
    if (!collection || (collection.userId !== userId && !collection.isDefault)) {
      throw new Error('Collection not found or unauthorized');
    }

    const entry = this.entries.get(entryId);
    if (!entry || entry.userId !== userId) {
      throw new Error('Entry not found or unauthorized');
    }

    if (!collection.entries.includes(entryId)) {
      collection.entries.push(entryId);
      collection.updatedAt = new Date().toISOString();
      this.collections.set(collectionId, collection);
      this.emit('collection:entry-added', { collectionId, entryId });
    }

    return collection;
  }

  public async removeEntryFromCollection(
    userId: string,
    entryId: string,
    collectionId: string
  ): Promise<JournalCollection> {
    const collection = this.collections.get(collectionId);
    if (!collection || (collection.userId !== userId && !collection.isDefault)) {
      throw new Error('Collection not found or unauthorized');
    }

    collection.entries = collection.entries.filter(id => id !== entryId);
    collection.updatedAt = new Date().toISOString();
    this.collections.set(collectionId, collection);
    this.emit('collection:entry-removed', { collectionId, entryId });

    return collection;
  }

  public async searchEntries(
    userId: string,
    filter: JournalFilter
  ): Promise<JournalEntry[]> {
    let entries = Array.from(this.entries.values()).filter(
      entry => entry.userId === userId
    );

    if (filter.categories) {
      entries = entries.filter(entry =>
        filter.categories!.includes(entry.category)
      );
    }

    if (filter.tags) {
      entries = entries.filter(entry =>
        filter.tags!.some(tag => entry.tags.includes(tag))
      );
    }

    if (filter.collections) {
      const collectionEntries = new Set(
        filter.collections
          .map(id => this.collections.get(id))
          .filter(Boolean)
          .flatMap(collection => collection!.entries)
      );
      entries = entries.filter(entry => collectionEntries.has(entry.id));
    }

    if (filter.dateRange) {
      entries = entries.filter(entry => {
        const date = new Date(entry.createdAt);
        return (
          date >= new Date(filter.dateRange!.start) &&
          date <= new Date(filter.dateRange!.end)
        );
      });
    }

    if (filter.entityTypes) {
      entries = entries.filter(entry =>
        entry.linkedEntities.some(entity =>
          filter.entityTypes!.includes(entity.type)
        )
      );
    }

    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      entries = entries.filter(entry =>
        entry.title.toLowerCase().includes(searchLower) ||
        entry.content.toLowerCase().includes(searchLower) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filter.isPinned !== undefined) {
      entries = entries.filter(entry => entry.isPinned === filter.isPinned);
    }

    if (filter.isPrivate !== undefined) {
      entries = entries.filter(entry => entry.isPrivate === filter.isPrivate);
    }

    if (filter.sortBy) {
      entries.sort((a, b) => {
        const order = filter.sortOrder === 'desc' ? -1 : 1;
        switch (filter.sortBy) {
          case 'date':
            return order * (
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
            );
          case 'title':
            return order * a.title.localeCompare(b.title);
          case 'category':
            return order * a.category.localeCompare(b.category);
          default:
            return 0;
        }
      });
    }

    return entries;
  }

  private updateUserStats(userId: string): void {
    const userEntries = Array.from(this.entries.values()).filter(
      entry => entry.userId === userId
    );

    const stats: JournalStats = {
      totalEntries: userEntries.length,
      entriesByCategory: {} as Record<JournalCategory, number>,
      totalCollections: Array.from(this.collections.values()).filter(
        c => c.userId === userId
      ).length,
      mostUsedTags: [],
      mostLinkedEntities: [],
      averageEntriesPerDay: 0,
      longestStreak: 0,
      currentStreak: 0
    };

    // Calculate category distribution
    userEntries.forEach(entry => {
      stats.entriesByCategory[entry.category] =
        (stats.entriesByCategory[entry.category] || 0) + 1;
    });

    // Calculate tag usage
    const tagCounts = new Map<string, number>();
    userEntries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    stats.mostUsedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate entity type distribution
    const entityCounts = new Map<EntityType, number>();
    userEntries.forEach(entry => {
      entry.linkedEntities.forEach(entity => {
        entityCounts.set(
          entity.type,
          (entityCounts.get(entity.type) || 0) + 1
        );
      });
    });

    stats.mostLinkedEntities = Array.from(entityCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate streaks and averages
    const dates = userEntries
      .map(entry => new Date(entry.createdAt).toISOString().split('T')[0])
      .sort();

    if (dates.length > 0) {
      let currentStreak = 1;
      let maxStreak = 1;
      let lastDate = new Date(dates[0]);

      for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i]);
        const dayDiff = Math.floor(
          (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else if (dayDiff > 1) {
          currentStreak = 1;
        }

        lastDate = currentDate;
      }

      const today = new Date();
      const lastEntryDate = new Date(dates[dates.length - 1]);
      const daysSinceLastEntry = Math.floor(
        (today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      stats.currentStreak = daysSinceLastEntry <= 1 ? currentStreak : 0;
      stats.longestStreak = maxStreak;

      const firstDate = new Date(dates[0]);
      const totalDays = Math.floor(
        (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      stats.averageEntriesPerDay = userEntries.length / totalDays;
    }

    this.userStats.set(userId, stats);
  }

  public async getUserStats(userId: string): Promise<JournalStats> {
    return (
      this.userStats.get(userId) || {
        totalEntries: 0,
        entriesByCategory: {},
        totalCollections: 0,
        mostUsedTags: [],
        mostLinkedEntities: [],
        averageEntriesPerDay: 0,
        longestStreak: 0,
        currentStreak: 0
      }
    );
  }

  public async getTemplates(): Promise<JournalTemplate[]> {
    return Array.from(this.templates.values());
  }

  public async getUserCollections(userId: string): Promise<JournalCollection[]> {
    return Array.from(this.collections.values()).filter(
      collection => collection.userId === userId || collection.isDefault
    );
  }

  public async getEntry(
    userId: string,
    entryId: string
  ): Promise<JournalEntry | undefined> {
    const entry = this.entries.get(entryId);
    if (!entry || entry.userId !== userId) {
      throw new Error('Entry not found or unauthorized');
    }
    return entry;
  }
}