export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: JournalCategory;
  tags: string[];
  attachments: JournalAttachment[];
  linkedEntities: LinkedEntity[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isPrivate: boolean;
  mood?: string;
  location?: string;
  weather?: string;
}

export type JournalCategory =
  | 'QUEST'
  | 'ACHIEVEMENT'
  | 'COMBAT'
  | 'CRAFTING'
  | 'EXPLORATION'
  | 'SOCIAL'
  | 'TRADING'
  | 'FARMING'
  | 'FISHING'
  | 'PERSONAL'
  | 'NOTE';

export interface JournalAttachment {
  id: string;
  type: AttachmentType;
  url: string;
  thumbnail?: string;
  description?: string;
}

export type AttachmentType =
  | 'IMAGE'
  | 'SCREENSHOT'
  | 'ITEM'
  | 'ACHIEVEMENT'
  | 'LOCATION'
  | 'COMBAT_LOG'
  | 'TRADE_RECORD';

export interface LinkedEntity {
  id: string;
  type: EntityType;
  name: string;
  icon?: string;
  url?: string;
}

export type EntityType =
  | 'PLAYER'
  | 'NPC'
  | 'ITEM'
  | 'LOCATION'
  | 'QUEST'
  | 'ACHIEVEMENT'
  | 'MONSTER'
  | 'EVENT';

export interface JournalCollection {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  entries: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStats {
  totalEntries: number;
  entriesByCategory: Record<JournalCategory, number>;
  totalCollections: number;
  mostUsedTags: { tag: string; count: number }[];
  mostLinkedEntities: { type: EntityType; count: number }[];
  averageEntriesPerDay: number;
  longestStreak: number;
  currentStreak: number;
}

export interface JournalSearch {
  query: string;
  categories?: JournalCategory[];
  tags?: string[];
  collections?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  entityTypes?: EntityType[];
  sortBy?: 'date' | 'title' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  category: JournalCategory;
  content: string;
  defaultTags: string[];
  placeholders: {
    key: string;
    description: string;
    type: 'text' | 'number' | 'date' | 'entity';
    required: boolean;
  }[];
}

export interface JournalFilter {
  categories?: JournalCategory[];
  tags?: string[];
  collections?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  entityTypes?: EntityType[];
  searchText?: string;
  isPinned?: boolean;
  isPrivate?: boolean;
  sortBy?: 'date' | 'title' | 'category';
  sortOrder?: 'asc' | 'desc';
}