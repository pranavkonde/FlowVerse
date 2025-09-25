export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  rarity: PetRarity;
  level: number;
  experience: number;
  experienceToNext: number;
  maxLevel: number;
  stats: PetStats;
  skills: PetSkill[];
  appearance: PetAppearance;
  personality: PetPersonality;
  health: PetHealth;
  happiness: number;
  hunger: number;
  energy: number;
  cleanliness: number;
  lastFed: Date;
  lastPlayed: Date;
  lastCleaned: Date;
  isActive: boolean;
  isInBattle: boolean;
  ownerId: string;
  createdAt: Date;
  lastModified: Date;
  metadata: PetMetadata;
}

export interface PetStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  loyalty: number;
  agility: number;
  stamina: number;
  magic: number;
}

export interface PetSkill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  level: number;
  maxLevel: number;
  experience: number;
  experienceToNext: number;
  cooldown: number;
  manaCost: number;
  damage: number;
  effects: SkillEffect[];
  requirements: SkillRequirement[];
  isUnlocked: boolean;
  isActive: boolean;
  metadata: SkillMetadata;
}

export interface SkillEffect {
  type: EffectType;
  value: number;
  duration: number;
  target: EffectTarget;
  description: string;
}

export interface SkillRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface SkillMetadata {
  icon: string;
  animation: string;
  soundEffect?: string;
  visualEffect?: string;
  category: string;
  tags: string[];
}

export interface PetAppearance {
  color: string;
  pattern: string;
  size: PetSize;
  accessories: PetAccessory[];
  customizations: PetCustomization[];
  animations: PetAnimation[];
  isShiny: boolean;
  variant: string;
}

export interface PetAccessory {
  id: string;
  name: string;
  type: AccessoryType;
  rarity: PetRarity;
  stats: Partial<PetStats>;
  effects: AccessoryEffect[];
  isEquipped: boolean;
  metadata: AccessoryMetadata;
}

export interface PetCustomization {
  id: string;
  type: CustomizationType;
  value: string;
  cost: number;
  isApplied: boolean;
  description: string;
}

export interface PetAnimation {
  id: string;
  name: string;
  type: AnimationType;
  duration: number;
  loop: boolean;
  trigger: AnimationTrigger;
  metadata: AnimationMetadata;
}

export interface PetPersonality {
  traits: PersonalityTrait[];
  mood: PetMood;
  friendliness: number;
  playfulness: number;
  loyalty: number;
  independence: number;
  curiosity: number;
  bravery: number;
  intelligence: number;
  adaptability: number;
}

export interface PetHealth {
  current: number;
  maximum: number;
  status: HealthStatus[];
  lastCheckup: Date;
  nextCheckup: Date;
  medicalHistory: MedicalRecord[];
  isHealthy: boolean;
  needsAttention: boolean;
}

export interface MedicalRecord {
  id: string;
  date: Date;
  condition: string;
  treatment: string;
  cost: number;
  veterinarian: string;
  notes: string;
  isResolved: boolean;
}

export interface PetMetadata {
  description: string;
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  category: string;
  source: string;
  seasonalAvailability?: string[];
  weatherDependency?: string[];
  breedingInfo?: BreedingInfo;
}

export interface BreedingInfo {
  canBreed: boolean;
  breedingCooldown: number;
  lastBreeding?: Date;
  offspringCount: number;
  maxOffspring: number;
  breedingRequirements: BreedingRequirement[];
  geneticTraits: GeneticTrait[];
}

export interface BreedingRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface GeneticTrait {
  name: string;
  type: TraitType;
  value: number;
  isDominant: boolean;
  inheritance: InheritanceType;
}

export interface PetBattle {
  id: string;
  type: BattleType;
  participants: BattleParticipant[];
  currentTurn: number;
  maxTurns: number;
  status: BattleStatus;
  winner?: string;
  rewards: BattleReward[];
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  metadata: BattleMetadata;
}

export interface BattleParticipant {
  id: string;
  petId: string;
  pet: Pet;
  playerId: string;
  playerName: string;
  isAI: boolean;
  isActive: boolean;
  currentHealth: number;
  maxHealth: number;
  statusEffects: StatusEffect[];
  availableSkills: PetSkill[];
  usedSkills: string[];
  turnOrder: number;
  stats: BattleStats;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: EffectType;
  value: number;
  duration: number;
  remainingTurns: number;
  description: string;
  isPositive: boolean;
  source: string;
}

export interface BattleStats {
  damageDealt: number;
  damageReceived: number;
  skillsUsed: number;
  criticalHits: number;
  misses: number;
  statusEffectsApplied: number;
  statusEffectsReceived: number;
  turnsTaken: number;
}

export interface BattleReward {
  type: RewardType;
  itemId?: string;
  amount: number;
  rarity: PetRarity;
  description: string;
  isClaimed: boolean;
}

export interface BattleMetadata {
  arena: string;
  weather?: string;
  specialRules: string[];
  spectators: string[];
  isRanked: boolean;
  ratingChange?: number;
  tournamentId?: string;
}

export interface PetTraining {
  id: string;
  petId: string;
  skillId: string;
  type: TrainingType;
  duration: number;
  progress: number;
  maxProgress: number;
  status: TrainingStatus;
  startedAt: Date;
  completedAt?: Date;
  rewards: TrainingReward[];
  requirements: TrainingRequirement[];
  metadata: TrainingMetadata;
}

export interface TrainingReward {
  type: RewardType;
  amount: number;
  description: string;
  isClaimed: boolean;
}

export interface TrainingRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface TrainingMetadata {
  difficulty: TrainingDifficulty;
  category: string;
  instructor?: string;
  location: string;
  equipment: string[];
  notes: string;
}

export interface PetCare {
  id: string;
  petId: string;
  type: CareType;
  duration: number;
  progress: number;
  maxProgress: number;
  status: CareStatus;
  startedAt: Date;
  completedAt?: Date;
  effects: CareEffect[];
  cost: number;
  requirements: CareRequirement[];
  metadata: CareMetadata;
}

export interface CareEffect {
  type: EffectType;
  value: number;
  duration: number;
  description: string;
}

export interface CareRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface CareMetadata {
  category: string;
  provider?: string;
  location: string;
  equipment: string[];
  notes: string;
  isEmergency: boolean;
}

export interface PetAchievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: PetRarity;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  metadata: AchievementMetadata;
}

export interface AchievementRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface AchievementReward {
  type: RewardType;
  itemId?: string;
  amount: number;
  rarity: PetRarity;
  description: string;
}

export interface AchievementMetadata {
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export interface PetMarketplace {
  id: string;
  petId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  currency: string;
  type: MarketplaceType;
  status: MarketplaceStatus;
  description: string;
  requirements: MarketplaceRequirement[];
  createdAt: Date;
  expiresAt?: Date;
  soldAt?: Date;
  buyerId?: string;
  buyerName?: string;
  metadata: MarketplaceMetadata;
}

export interface MarketplaceRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface MarketplaceMetadata {
  category: string;
  tags: string[];
  images: string[];
  isFeatured: boolean;
  isUrgent: boolean;
  specialOffers: string[];
  location: string;
}

export interface PetCollection {
  id: string;
  userId: string;
  name: string;
  description: string;
  pets: string[];
  categories: CollectionCategory[];
  isPublic: boolean;
  isTradeable: boolean;
  value: number;
  rarity: PetRarity;
  createdAt: Date;
  lastModified: Date;
  metadata: CollectionMetadata;
}

export interface CollectionCategory {
  name: string;
  description: string;
  pets: string[];
  requirements: CollectionRequirement[];
  rewards: CollectionReward[];
  isComplete: boolean;
  progress: number;
  maxProgress: number;
}

export interface CollectionRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface CollectionReward {
  type: RewardType;
  itemId?: string;
  amount: number;
  rarity: PetRarity;
  description: string;
}

export interface CollectionMetadata {
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export interface PetStats {
  totalPets: number;
  totalSpecies: number;
  totalBattles: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  averageLevel: number;
  highestLevel: number;
  totalExperience: number;
  favoriteSpecies: PetSpecies;
  mostUsedSkill: string;
  totalTrainingHours: number;
  totalCareHours: number;
  achievements: string[];
  collections: string[];
  marketplaceTransactions: number;
  totalSpent: number;
  totalEarned: number;
}

// Enums and Types
export type PetSpecies = 
  | 'dragon'
  | 'phoenix'
  | 'wolf'
  | 'cat'
  | 'dog'
  | 'bird'
  | 'fish'
  | 'butterfly'
  | 'unicorn'
  | 'griffin'
  | 'pegasus'
  | 'kraken'
  | 'elemental'
  | 'spirit'
  | 'robot'
  | 'crystal'
  | 'shadow'
  | 'light'
  | 'fire'
  | 'water'
  | 'earth'
  | 'air'
  | 'ice'
  | 'thunder'
  | 'nature'
  | 'cosmic'
  | 'void'
  | 'time'
  | 'space'
  | 'mystic';

export type PetRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'divine'
  | 'ancient';

export type PetSize = 
  | 'tiny'
  | 'small'
  | 'medium'
  | 'large'
  | 'huge'
  | 'gigantic';

export type PetMood = 
  | 'happy'
  | 'content'
  | 'neutral'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'sleepy'
  | 'playful'
  | 'curious'
  | 'scared'
  | 'confused'
  | 'lonely';

export type HealthStatus = 
  | 'healthy'
  | 'injured'
  | 'sick'
  | 'exhausted'
  | 'stressed'
  | 'malnourished'
  | 'dirty'
  | 'lonely'
  | 'depressed'
  | 'anxious';

export type SkillType = 
  | 'attack'
  | 'defense'
  | 'healing'
  | 'buff'
  | 'debuff'
  | 'utility'
  | 'special'
  | 'ultimate';

export type EffectType = 
  | 'damage'
  | 'healing'
  | 'buff'
  | 'debuff'
  | 'status'
  | 'environmental'
  | 'special';

export type EffectTarget = 
  | 'self'
  | 'enemy'
  | 'ally'
  | 'all_enemies'
  | 'all_allies'
  | 'random'
  | 'area';

export type RequirementType = 
  | 'level'
  | 'skill_level'
  | 'item_owned'
  | 'achievement'
  | 'reputation'
  | 'quest_completion'
  | 'time_played'
  | 'pet_level'
  | 'pet_species'
  | 'pet_rarity'
  | 'battle_wins'
  | 'training_hours'
  | 'care_hours';

export type AccessoryType = 
  | 'collar'
  | 'hat'
  | 'glasses'
  | 'wings'
  | 'tail'
  | 'horn'
  | 'crown'
  | 'armor'
  | 'weapon'
  | 'shield'
  | 'amulet'
  | 'ring'
  | 'bracelet'
  | 'backpack'
  | 'saddle'
  | 'boots'
  | 'gloves'
  | 'cape'
  | 'mask'
  | 'tattoo';

export type CustomizationType = 
  | 'color'
  | 'pattern'
  | 'size'
  | 'texture'
  | 'material'
  | 'finish'
  | 'accessory'
  | 'animation'
  | 'sound'
  | 'effect';

export type AnimationType = 
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'attack'
  | 'defend'
  | 'heal'
  | 'sleep'
  | 'eat'
  | 'play'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'excited'
  | 'confused'
  | 'special';

export type AnimationTrigger = 
  | 'automatic'
  | 'manual'
  | 'battle'
  | 'interaction'
  | 'emotion'
  | 'skill'
  | 'environmental'
  | 'time_based';

export type PersonalityTrait = 
  | 'loyal'
  | 'playful'
  | 'curious'
  | 'brave'
  | 'shy'
  | 'aggressive'
  | 'calm'
  | 'energetic'
  | 'intelligent'
  | 'stubborn'
  | 'friendly'
  | 'independent'
  | 'protective'
  | 'mischievous'
  | 'gentle'
  | 'fierce'
  | 'wise'
  | 'naive'
  | 'confident'
  | 'anxious';

export type BattleType = 
  | 'pvp'
  | 'pve'
  | 'tournament'
  | 'training'
  | 'friendly'
  | 'ranked'
  | 'casual'
  | 'boss'
  | 'raid'
  | 'guild_war';

export type BattleStatus = 
  | 'waiting'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'forfeited'
  | 'timeout';

export type TrainingType = 
  | 'skill'
  | 'stat'
  | 'behavior'
  | 'trick'
  | 'obedience'
  | 'agility'
  | 'intelligence'
  | 'socialization'
  | 'specialization'
  | 'mastery';

export type TrainingStatus = 
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type TrainingDifficulty = 
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | 'master';

export type CareType = 
  | 'feeding'
  | 'grooming'
  | 'medical'
  | 'exercise'
  | 'play'
  | 'rest'
  | 'socialization'
  | 'training'
  | 'checkup'
  | 'emergency';

export type CareStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'overdue';

export type AchievementCategory = 
  | 'battle'
  | 'training'
  | 'care'
  | 'collection'
  | 'social'
  | 'exploration'
  | 'breeding'
  | 'special_events'
  | 'milestones'
  | 'mastery';

export type MarketplaceType = 
  | 'sale'
  | 'trade'
  | 'auction'
  | 'breeding'
  | 'rental'
  | 'services';

export type MarketplaceStatus = 
  | 'active'
  | 'sold'
  | 'cancelled'
  | 'expired'
  | 'pending'
  | 'reserved';

export type RewardType = 
  | 'experience'
  | 'gold'
  | 'item'
  | 'achievement'
  | 'skill_point'
  | 'buff'
  | 'cosmetic'
  | 'currency'
  | 'pet'
  | 'accessory';

export type TraitType = 
  | 'physical'
  | 'mental'
  | 'emotional'
  | 'behavioral'
  | 'special';

export type InheritanceType = 
  | 'dominant'
  | 'recessive'
  | 'co_dominant'
  | 'incomplete_dominance'
  | 'epistatic';

export interface AccessoryEffect {
  type: EffectType;
  value: number;
  duration: number;
  description: string;
}

export interface AccessoryMetadata {
  icon: string;
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export interface AnimationMetadata {
  duration: number;
  loop: boolean;
  frameRate: number;
  soundEffect?: string;
  visualEffect?: string;
  category: string;
  tags: string[];
}

// Constants
export const PET_EVENTS = {
  PET_ADOPTED: 'pet:adopted',
  PET_LEVELED_UP: 'pet:leveled_up',
  PET_SKILL_LEARNED: 'pet:skill_learned',
  PET_BATTLE_STARTED: 'pet:battle_started',
  PET_BATTLE_ENDED: 'pet:battle_ended',
  PET_TRAINING_STARTED: 'pet:training_started',
  PET_TRAINING_COMPLETED: 'pet:training_completed',
  PET_CARE_STARTED: 'pet:care_started',
  PET_CARE_COMPLETED: 'pet:care_completed',
  PET_ACHIEVEMENT_UNLOCKED: 'pet:achievement_unlocked',
  PET_MARKETPLACE_LISTED: 'pet:marketplace_listed',
  PET_MARKETPLACE_SOLD: 'pet:marketplace_sold',
  PET_COLLECTION_CREATED: 'pet:collection_created',
  PET_COLLECTION_COMPLETED: 'pet:collection_completed',
  PET_BREEDING_STARTED: 'pet:breeding_started',
  PET_BREEDING_COMPLETED: 'pet:breeding_completed',
  PET_HEALTH_CHANGED: 'pet:health_changed',
  PET_MOOD_CHANGED: 'pet:mood_changed',
  PET_ACCESSORY_EQUIPPED: 'pet:accessory_equipped',
  PET_ACCESSORY_UNEQUIPPED: 'pet:accessory_unequipped',
  PET_CUSTOMIZATION_APPLIED: 'pet:customization_applied',
  PET_ANIMATION_PLAYED: 'pet:animation_played'
} as const;

export const PET_NOTIFICATIONS = {
  PET_NEEDS_CARE: 'pet_needs_care',
  PET_TRAINING_COMPLETE: 'pet_training_complete',
  PET_BATTLE_INVITATION: 'pet_battle_invitation',
  PET_ACHIEVEMENT_UNLOCKED: 'pet_achievement_unlocked',
  PET_MARKETPLACE_SOLD: 'pet_marketplace_sold',
  PET_BREEDING_READY: 'pet_breeding_ready',
  PET_HEALTH_WARNING: 'pet_health_warning',
  PET_LEVEL_UP: 'pet_level_up',
  PET_SKILL_LEARNED: 'pet_skill_learned',
  PET_COLLECTION_PROGRESS: 'pet_collection_progress'
} as const;

