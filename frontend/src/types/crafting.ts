export interface Resource {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  rarity: ResourceRarity;
  icon: string;
  value: number;
  stackSize: number;
  category: ResourceCategory;
  source: ResourceSource;
  metadata: ResourceMetadata;
}

export interface ResourceNode {
  id: string;
  resourceId: string;
  position: { x: number; y: number };
  area: string;
  respawnTime: number;
  lastHarvested?: Date;
  isActive: boolean;
  level: number;
  experience: number;
  drops: ResourceDrop[];
}

export interface ResourceDrop {
  resourceId: string;
  minAmount: number;
  maxAmount: number;
  chance: number;
  experience: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: CraftingCategory;
  level: number;
  experience: number;
  materials: CraftingMaterial[];
  result: CraftingResult;
  craftingTime: number;
  isUnlocked: boolean;
  prerequisites: CraftingPrerequisite[];
  metadata: CraftingMetadata;
}

export interface CraftingMaterial {
  resourceId: string;
  amount: number;
  consumed: boolean;
}

export interface CraftingResult {
  itemId: string;
  amount: number;
  chance: number;
  experience: number;
}

export interface CraftingPrerequisite {
  type: 'level' | 'recipe' | 'achievement' | 'quest';
  value: string | number;
  description: string;
}

export interface CraftingMetadata {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  tags: string[];
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
}

export interface InventoryItem {
  id: string;
  resourceId: string;
  amount: number;
  quality: number;
  durability?: number;
  maxDurability?: number;
  metadata: InventoryMetadata;
  acquiredAt: Date;
}

export interface InventoryMetadata {
  source: 'crafted' | 'gathered' | 'traded' | 'reward';
  crafterId?: string;
  qualityModifier?: number;
  specialProperties?: string[];
}

export interface CraftingSession {
  id: string;
  recipeId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  status: CraftingStatus;
  progress: number;
  materials: CraftingMaterial[];
  result?: CraftingResult;
  experience: number;
}

export interface CraftingSkill {
  id: string;
  userId: string;
  category: CraftingCategory;
  level: number;
  experience: number;
  maxExperience: number;
  recipesUnlocked: string[];
  mastery: number;
  lastUpdated: Date;
}

export interface ResourceGatheringSession {
  id: string;
  userId: string;
  nodeId: string;
  startTime: Date;
  endTime?: Date;
  status: GatheringStatus;
  resourcesGathered: ResourceGathered[];
  experience: number;
  efficiency: number;
}

export interface ResourceGathered {
  resourceId: string;
  amount: number;
  quality: number;
  experience: number;
}

export interface CraftingStats {
  totalItemsCrafted: number;
  totalExperience: number;
  favoriteCategory: CraftingCategory;
  mostCraftedItem: string;
  averageQuality: number;
  successRate: number;
  totalTimeSpent: number;
  resourcesUsed: Record<string, number>;
}

export interface ResourceStats {
  totalResourcesGathered: number;
  totalExperience: number;
  favoriteResource: string;
  mostGatheredResource: string;
  averageQuality: number;
  totalTimeSpent: number;
  nodesVisited: number;
  efficiency: number;
}

export interface CraftingLeaderboard {
  category: CraftingCategory;
  period: 'daily' | 'weekly' | 'monthly' | 'all';
  entries: CraftingLeaderboardEntry[];
  lastUpdated: Date;
}

export interface CraftingLeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  score: number;
  level: number;
  itemsCrafted: number;
  experience: number;
}

export interface ResourceLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all';
  entries: ResourceLeaderboardEntry[];
  lastUpdated: Date;
}

export interface ResourceLeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  score: number;
  resourcesGathered: number;
  experience: number;
  efficiency: number;
}

export interface CraftingNotification {
  id: string;
  type: CraftingNotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: any;
}

export interface CraftingEvent {
  type: CraftingEventType;
  userId: string;
  data: any;
  timestamp: Date;
}

// Enums
export type ResourceType = 
  | 'ore'
  | 'wood'
  | 'plant'
  | 'crystal'
  | 'gem'
  | 'metal'
  | 'fiber'
  | 'leather'
  | 'bone'
  | 'essence';

export type ResourceRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary';

export type ResourceCategory = 
  | 'materials'
  | 'components'
  | 'consumables'
  | 'special'
  | 'currency';

export type ResourceSource = 
  | 'mining'
  | 'logging'
  | 'harvesting'
  | 'fishing'
  | 'hunting'
  | 'trading'
  | 'quest';

export type CraftingCategory = 
  | 'weapons'
  | 'armor'
  | 'tools'
  | 'consumables'
  | 'decorations'
  | 'materials'
  | 'special';

export type CraftingStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type GatheringStatus = 
  | 'active'
  | 'completed'
  | 'interrupted'
  | 'failed';

export type CraftingNotificationType = 
  | 'recipe_unlocked'
  | 'crafting_complete'
  | 'skill_level_up'
  | 'resource_depleted'
  | 'new_recipe_available'
  | 'crafting_failed';

export type CraftingEventType = 
  | 'crafting_started'
  | 'crafting_completed'
  | 'crafting_failed'
  | 'resource_gathered'
  | 'skill_level_up'
  | 'recipe_unlocked'
  | 'inventory_updated';

// Constants
export const CRAFTING_EVENTS = {
  CRAFTING_STARTED: 'crafting_started',
  CRAFTING_COMPLETED: 'crafting_completed',
  CRAFTING_FAILED: 'crafting_failed',
  RESOURCE_GATHERED: 'resource_gathered',
  SKILL_LEVEL_UP: 'skill_level_up',
  RECIPE_UNLOCKED: 'recipe_unlocked',
  INVENTORY_UPDATED: 'inventory_updated'
} as const;

export const CRAFTING_NOTIFICATIONS = {
  RECIPE_UNLOCKED: 'recipe_unlocked',
  CRAFTING_COMPLETE: 'crafting_complete',
  SKILL_LEVEL_UP: 'skill_level_up',
  RESOURCE_DEPLETED: 'resource_depleted',
  NEW_RECIPE_AVAILABLE: 'new_recipe_available',
  CRAFTING_FAILED: 'crafting_failed'
} as const;
