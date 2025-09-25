export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  category: CraftingCategory;
  difficulty: CraftingDifficulty;
  requiredLevel: number;
  requiredSkill: CraftingSkill;
  requiredSkillLevel: number;
  ingredients: CraftingIngredient[];
  result: CraftingResult;
  craftingTime: number; // in seconds
  experienceReward: number;
  isUnlocked: boolean;
  unlockRequirements?: CraftingRequirement[];
  metadata: CraftingMetadata;
}

export interface CraftingIngredient {
  itemId: string;
  itemName: string;
  quantity: number;
  rarity: ItemRarity;
  isConsumed: boolean;
  alternativeItems?: string[]; // Alternative items that can be used
}

export interface CraftingResult {
  itemId: string;
  itemName: string;
  quantity: number;
  rarity: ItemRarity;
  quality: ItemQuality;
  durability?: number;
  maxDurability?: number;
  stats?: ItemStats;
}

export interface CraftingMetadata {
  tags: string[];
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  category: string;
}

export interface ResourceNode {
  id: string;
  name: string;
  type: ResourceType;
  rarity: ResourceRarity;
  location: ResourceLocation;
  respawnTime: number; // in seconds
  maxHarvests: number;
  currentHarvests: number;
  requiredTool?: string;
  requiredLevel: number;
  experienceReward: number;
  possibleDrops: ResourceDrop[];
  isActive: boolean;
  lastHarvested?: Date;
  metadata: ResourceMetadata;
}

export interface ResourceDrop {
  itemId: string;
  itemName: string;
  dropRate: number; // 0-1
  minQuantity: number;
  maxQuantity: number;
  rarity: ItemRarity;
}

export interface ResourceLocation {
  x: number;
  y: number;
  mapId: string;
  area: string;
}

export interface ResourceMetadata {
  description: string;
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  visualEffects?: string[];
  seasonalAvailability?: string[];
  weatherDependency?: string[];
}

export interface CraftingSkill {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  maxLevel: number;
  bonuses: CraftingBonus[];
  unlockedRecipes: string[];
  specialization?: CraftingSpecialization;
}

export interface CraftingBonus {
  type: BonusType;
  value: number;
  description: string;
  isActive: boolean;
}

export interface CraftingSpecialization {
  name: string;
  description: string;
  bonuses: CraftingBonus[];
  unlockedAt: number; // level when unlocked
}

export interface InventoryItem {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  rarity: ItemRarity;
  quality: ItemQuality;
  durability?: number;
  maxDurability?: number;
  stats?: ItemStats;
  metadata: ItemMetadata;
  acquiredAt: Date;
  isTradeable: boolean;
  isSellable: boolean;
  value: number;
}

export interface ItemStats {
  attack?: number;
  defense?: number;
  speed?: number;
  magic?: number;
  health?: number;
  mana?: number;
  luck?: number;
  [key: string]: number | undefined;
}

export interface ItemMetadata {
  description: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  craftingRecipe?: string;
  source?: string;
}

export interface CraftingRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface CraftingSession {
  id: string;
  userId: string;
  recipeId: string;
  startTime: Date;
  endTime?: Date;
  status: CraftingStatus;
  progress: number;
  quality: ItemQuality;
  bonuses: CraftingBonus[];
  materials: CraftingIngredient[];
  result?: CraftingResult;
  experienceGained: number;
}

export interface CraftingQueue {
  userId: string;
  sessions: CraftingSession[];
  maxConcurrent: number;
  isPaused: boolean;
}

export interface CraftingStation {
  id: string;
  name: string;
  type: CraftingStationType;
  location: ResourceLocation;
  requiredLevel: number;
  availableRecipes: string[];
  bonuses: CraftingBonus[];
  isActive: boolean;
  currentUser?: string;
  metadata: CraftingStationMetadata;
}

export interface CraftingStationMetadata {
  description: string;
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  capacity: number;
  efficiency: number;
}

export interface ResourceGatheringSession {
  id: string;
  userId: string;
  nodeId: string;
  startTime: Date;
  endTime?: Date;
  status: GatheringStatus;
  progress: number;
  toolUsed?: string;
  bonuses: GatheringBonus[];
  drops: ResourceDrop[];
  experienceGained: number;
}

export interface GatheringBonus {
  type: BonusType;
  value: number;
  description: string;
  source: string; // tool, skill, buff, etc.
}

export interface CraftingProgress {
  recipeId: string;
  sessionId: string;
  progress: number;
  quality: number;
  timeRemaining: number;
  bonuses: CraftingBonus[];
}

export interface CraftingStats {
  totalItemsCrafted: number;
  totalExperienceGained: number;
  favoriteCategory: CraftingCategory;
  highestQuality: ItemQuality;
  totalTimeSpent: number;
  mostUsedRecipe: string;
  skillLevels: Record<string, number>;
  achievements: string[];
}

export type CraftingCategory = 
  | 'weapons'
  | 'armor'
  | 'tools'
  | 'consumables'
  | 'materials'
  | 'decorations'
  | 'jewelry'
  | 'potions'
  | 'food'
  | 'clothing'
  | 'furniture'
  | 'vehicles';

export type CraftingDifficulty = 
  | 'beginner'
  | 'novice'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master';

export type CraftingSkill = 
  | 'blacksmithing'
  | 'carpentry'
  | 'cooking'
  | 'alchemy'
  | 'tailoring'
  | 'jewelry'
  | 'engineering'
  | 'enchanting'
  | 'gardening'
  | 'fishing';

export type ResourceType = 
  | 'ore'
  | 'wood'
  | 'herbs'
  | 'gems'
  | 'leather'
  | 'cloth'
  | 'bone'
  | 'crystal'
  | 'essence'
  | 'food';

export type ResourceRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type ItemRarity = ResourceRarity;

export type ItemQuality = 
  | 'poor'
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'artifact';

export type BonusType = 
  | 'speed'
  | 'quality'
  | 'experience'
  | 'durability'
  | 'critical_chance'
  | 'resource_bonus'
  | 'cost_reduction';

export type RequirementType = 
  | 'level'
  | 'skill_level'
  | 'quest_completion'
  | 'item_owned'
  | 'achievement'
  | 'reputation';

export type CraftingStatus = 
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type GatheringStatus = 
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'interrupted';

export type CraftingStationType = 
  | 'forge'
  | 'workbench'
  | 'alchemy_table'
  | 'cooking_stove'
  | 'sewing_machine'
  | 'jewelry_bench'
  | 'engineering_station'
  | 'enchanting_table'
  | 'garden_plot'
  | 'fishing_spot';