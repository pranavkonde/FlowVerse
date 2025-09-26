export interface LandPlot {
  id: string;
  tokenId: string;
  ownerId: string;
  ownerAddress: string;
  coordinates: LandCoordinates;
  size: LandSize;
  type: LandType;
  rarity: LandRarity;
  isActive: boolean;
  isForSale: boolean;
  salePrice?: number;
  rentPrice?: number;
  isRentable: boolean;
  currentRenter?: string;
  rentExpiry?: Date;
  buildings: Building[];
  resources: LandResource[];
  decorations: Decoration[];
  permissions: LandPermission[];
  metadata: LandMetadata;
  blockchainData: BlockchainData;
  createdAt: Date;
  lastModified: Date;
}

export interface LandCoordinates {
  x: number;
  y: number;
  z: number;
  world: string;
  region: string;
  chunk: string;
  gridPosition: string;
}

export interface LandSize {
  width: number;
  height: number;
  depth: number;
  area: number;
  volume: number;
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  category: BuildingCategory;
  level: number;
  maxLevel: number;
  coordinates: BuildingCoordinates;
  size: BuildingSize;
  isActive: boolean;
  isConstructed: boolean;
  constructionProgress: number;
  constructionTime: number;
  constructionStartTime?: Date;
  constructionEndTime?: Date;
  resources: BuildingResource[];
  production: BuildingProduction[];
  storage: BuildingStorage[];
  workers: BuildingWorker[];
  upgrades: BuildingUpgrade[];
  effects: BuildingEffect[];
  requirements: BuildingRequirement[];
  metadata: BuildingMetadata;
  blockchainData: BlockchainData;
  createdAt: Date;
  lastModified: Date;
}

export interface BuildingCoordinates {
  x: number;
  y: number;
  z: number;
  rotation: number;
  scale: number;
}

export interface BuildingSize {
  width: number;
  height: number;
  depth: number;
  area: number;
  volume: number;
}

export interface LandResource {
  id: string;
  type: ResourceType;
  name: string;
  amount: number;
  maxAmount: number;
  regenerationRate: number;
  lastHarvested: Date;
  quality: ResourceQuality;
  rarity: ResourceRarity;
  isRenewable: boolean;
  harvestRequirements: ResourceRequirement[];
  metadata: ResourceMetadata;
}

export interface Decoration {
  id: string;
  name: string;
  type: DecorationType;
  category: DecorationCategory;
  coordinates: DecorationCoordinates;
  size: DecorationSize;
  isActive: boolean;
  effects: DecorationEffect[];
  requirements: DecorationRequirement[];
  metadata: DecorationMetadata;
  blockchainData: BlockchainData;
  createdAt: Date;
}

export interface DecorationCoordinates {
  x: number;
  y: number;
  z: number;
  rotation: number;
  scale: number;
}

export interface DecorationSize {
  width: number;
  height: number;
  depth: number;
}

export interface LandPermission {
  id: string;
  type: PermissionType;
  userId: string;
  username: string;
  permissions: string[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface LandMetadata {
  imageUrl?: string;
  description: string;
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  marketValue: number;
  specialEffects?: string[];
  customizations: LandCustomization[];
  history: LandHistory[];
  achievements: string[];
  badges: string[];
}

export interface LandCustomization {
  id: string;
  type: CustomizationType;
  value: string;
  cost: number;
  isApplied: boolean;
  description: string;
  requirements: CustomizationRequirement[];
}

export interface LandHistory {
  id: string;
  action: HistoryAction;
  userId: string;
  username: string;
  description: string;
  timestamp: Date;
  metadata: HistoryMetadata;
}

export interface BuildingResource {
  id: string;
  type: ResourceType;
  name: string;
  amount: number;
  maxAmount: number;
  consumptionRate: number;
  productionRate: number;
  efficiency: number;
  lastUpdated: Date;
}

export interface BuildingProduction {
  id: string;
  type: ProductionType;
  name: string;
  amount: number;
  rate: number;
  efficiency: number;
  quality: ProductionQuality;
  requirements: ProductionRequirement[];
  lastProduced: Date;
}

export interface BuildingStorage {
  id: string;
  type: StorageType;
  name: string;
  capacity: number;
  used: number;
  items: StorageItem[];
  isSecure: boolean;
  accessLevel: AccessLevel;
}

export interface StorageItem {
  id: string;
  type: string;
  name: string;
  amount: number;
  quality: string;
  metadata: any;
}

export interface BuildingWorker {
  id: string;
  userId: string;
  username: string;
  role: WorkerRole;
  skill: number;
  efficiency: number;
  salary: number;
  startDate: Date;
  isActive: boolean;
  tasks: WorkerTask[];
}

export interface WorkerTask {
  id: string;
  type: TaskType;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedAt: Date;
  completedAt?: Date;
  rewards: TaskReward[];
}

export interface BuildingUpgrade {
  id: string;
  name: string;
  type: UpgradeType;
  level: number;
  cost: UpgradeCost[];
  benefits: UpgradeBenefit[];
  requirements: UpgradeRequirement[];
  isAvailable: boolean;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface BuildingEffect {
  id: string;
  type: EffectType;
  name: string;
  value: number;
  duration: number;
  description: string;
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
}

export interface BuildingRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface BuildingMetadata {
  imageUrl?: string;
  description: string;
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  marketValue: number;
  specialEffects?: string[];
  customizations: BuildingCustomization[];
}

export interface BuildingCustomization {
  id: string;
  type: CustomizationType;
  value: string;
  cost: number;
  isApplied: boolean;
  description: string;
}

export interface ResourceRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface ResourceMetadata {
  icon: string;
  imageUrl?: string;
  description: string;
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export interface DecorationEffect {
  type: EffectType;
  value: number;
  duration: number;
  description: string;
  isActive: boolean;
}

export interface DecorationRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface DecorationMetadata {
  icon: string;
  imageUrl?: string;
  description: string;
  tags: string[];
  category: string;
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
}

export interface CustomizationRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface HistoryMetadata {
  action: string;
  details: any;
  location: string;
  timestamp: Date;
}

export interface UpgradeCost {
  type: CostType;
  amount: number;
  resource: string;
}

export interface UpgradeBenefit {
  type: BenefitType;
  value: number;
  description: string;
}

export interface UpgradeRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface TaskReward {
  type: RewardType;
  amount: number;
  description: string;
  isClaimed: boolean;
}

export interface ProductionRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface BlockchainData {
  contractAddress: string;
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: number;
  network: string;
  isVerified: boolean;
  verificationDate?: Date;
  metadata: BlockchainMetadata;
}

export interface BlockchainMetadata {
  ipfsHash?: string;
  imageUrl?: string;
  description: string;
  attributes: BlockchainAttribute[];
  externalUrl?: string;
  animationUrl?: string;
}

export interface BlockchainAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
  max_value?: number;
}

// Enums and Types
export type LandType = 
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'agricultural'
  | 'recreational'
  | 'educational'
  | 'governmental'
  | 'mixed_use'
  | 'special'
  | 'wilderness';

export type LandRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'unique';

export type BuildingType = 
  | 'house'
  | 'apartment'
  | 'office'
  | 'shop'
  | 'factory'
  | 'warehouse'
  | 'farm'
  | 'school'
  | 'hospital'
  | 'park'
  | 'monument'
  | 'tower'
  | 'bridge'
  | 'road'
  | 'utility';

export type BuildingCategory = 
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'agricultural'
  | 'recreational'
  | 'educational'
  | 'governmental'
  | 'infrastructure'
  | 'utility'
  | 'special';

export type ResourceType = 
  | 'wood'
  | 'stone'
  | 'metal'
  | 'crystal'
  | 'energy'
  | 'water'
  | 'food'
  | 'fuel'
  | 'mineral'
  | 'gem'
  | 'plant'
  | 'animal'
  | 'technology'
  | 'knowledge'
  | 'currency';

export type ResourceQuality = 
  | 'poor'
  | 'fair'
  | 'good'
  | 'excellent'
  | 'perfect'
  | 'legendary';

export type ResourceRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type DecorationType = 
  | 'furniture'
  | 'plant'
  | 'statue'
  | 'fountain'
  | 'light'
  | 'flag'
  | 'banner'
  | 'sign'
  | 'artwork'
  | 'sculpture'
  | 'monument'
  | 'memorial'
  | 'garden'
  | 'pathway'
  | 'fence';

export type DecorationCategory = 
  | 'indoor'
  | 'outdoor'
  | 'garden'
  | 'decorative'
  | 'functional'
  | 'memorial'
  | 'artistic'
  | 'cultural'
  | 'religious'
  | 'historical';

export type PermissionType = 
  | 'owner'
  | 'tenant'
  | 'visitor'
  | 'worker'
  | 'guest'
  | 'admin';

export type CustomizationType = 
  | 'color'
  | 'texture'
  | 'material'
  | 'style'
  | 'theme'
  | 'lighting'
  | 'landscaping'
  | 'architecture'
  | 'interior'
  | 'exterior';

export type HistoryAction = 
  | 'purchased'
  | 'sold'
  | 'rented'
  | 'built'
  | 'demolished'
  | 'upgraded'
  | 'decorated'
  | 'harvested'
  | 'permission_granted'
  | 'permission_revoked'
  | 'customized'
  | 'transferred';

export type ProductionType = 
  | 'manufacturing'
  | 'processing'
  | 'generation'
  | 'extraction'
  | 'refinement'
  | 'assembly'
  | 'research'
  | 'development'
  | 'creation'
  | 'synthesis';

export type ProductionQuality = 
  | 'poor'
  | 'fair'
  | 'good'
  | 'excellent'
  | 'perfect'
  | 'legendary';

export type StorageType = 
  | 'warehouse'
  | 'vault'
  | 'silo'
  | 'container'
  | 'chest'
  | 'safe'
  | 'archive'
  | 'library'
  | 'museum'
  | 'gallery';

export type AccessLevel = 
  | 'public'
  | 'private'
  | 'restricted'
  | 'confidential'
  | 'secret';

export type WorkerRole = 
  | 'manager'
  | 'supervisor'
  | 'worker'
  | 'specialist'
  | 'apprentice'
  | 'contractor'
  | 'volunteer';

export type TaskType = 
  | 'construction'
  | 'maintenance'
  | 'production'
  | 'harvesting'
  | 'research'
  | 'security'
  | 'cleaning'
  | 'repair'
  | 'upgrade'
  | 'custom';

export type TaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'critical';

export type TaskStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export type UpgradeType = 
  | 'capacity'
  | 'efficiency'
  | 'quality'
  | 'speed'
  | 'durability'
  | 'security'
  | 'automation'
  | 'sustainability'
  | 'aesthetics'
  | 'functionality';

export type EffectType = 
  | 'buff'
  | 'debuff'
  | 'healing'
  | 'damage'
  | 'experience'
  | 'currency'
  | 'reputation'
  | 'access'
  | 'privilege'
  | 'cosmetic'
  | 'production'
  | 'efficiency'
  | 'quality'
  | 'speed'
  | 'durability';

export type RequirementType = 
  | 'level'
  | 'reputation'
  | 'achievement'
  | 'item'
  | 'currency'
  | 'time_played'
  | 'buildings_owned'
  | 'resources_harvested'
  | 'workers_hired'
  | 'upgrades_completed';

export type CostType = 
  | 'currency'
  | 'resource'
  | 'item'
  | 'time'
  | 'energy'
  | 'reputation';

export type BenefitType = 
  | 'production'
  | 'efficiency'
  | 'capacity'
  | 'quality'
  | 'speed'
  | 'durability'
  | 'security'
  | 'automation'
  | 'sustainability'
  | 'aesthetics';

export type RewardType = 
  | 'experience'
  | 'currency'
  | 'item'
  | 'badge'
  | 'title'
  | 'access'
  | 'privilege'
  | 'cosmetic'
  | 'achievement'
  | 'resource';

// Constants
export const LAND_EVENTS = {
  LAND_PURCHASED: 'land:land_purchased',
  LAND_SOLD: 'land:land_sold',
  LAND_RENTED: 'land:land_rented',
  LAND_RENT_EXPIRED: 'land:land_rent_expired',
  BUILDING_CONSTRUCTED: 'land:building_constructed',
  BUILDING_DEMOLISHED: 'land:building_demolished',
  BUILDING_UPGRADED: 'land:building_upgraded',
  RESOURCE_HARVESTED: 'land:resource_harvested',
  RESOURCE_REGENERATED: 'land:resource_regenerated',
  DECORATION_PLACED: 'land:decoration_placed',
  DECORATION_REMOVED: 'land:decoration_removed',
  PERMISSION_GRANTED: 'land:permission_granted',
  PERMISSION_REVOKED: 'land:permission_revoked',
  CUSTOMIZATION_APPLIED: 'land:customization_applied',
  LAND_TRANSFERRED: 'land:land_transferred',
  PRODUCTION_STARTED: 'land:production_started',
  PRODUCTION_COMPLETED: 'land:production_completed',
  WORKER_HIRED: 'land:worker_hired',
  WORKER_FIRED: 'land:worker_fired',
  TASK_ASSIGNED: 'land:task_assigned',
  TASK_COMPLETED: 'land:task_completed',
  UPGRADE_STARTED: 'land:upgrade_started',
  UPGRADE_COMPLETED: 'land:upgrade_completed',
  STORAGE_ACCESSED: 'land:storage_accessed',
  STORAGE_UPDATED: 'land:storage_updated',
  ACHIEVEMENT_UNLOCKED: 'land:achievement_unlocked',
  BADGE_EARNED: 'land:badge_earned'
} as const;

export const LAND_NOTIFICATIONS = {
  LAND_PURCHASE_OFFER: 'land_purchase_offer',
  LAND_RENTAL_OFFER: 'land_rental_offer',
  BUILDING_CONSTRUCTION_COMPLETE: 'building_construction_complete',
  RESOURCE_READY: 'resource_ready',
  PRODUCTION_COMPLETE: 'production_complete',
  WORKER_TASK_ASSIGNED: 'worker_task_assigned',
  UPGRADE_AVAILABLE: 'upgrade_available',
  PERMISSION_REQUEST: 'permission_request',
  RENT_EXPIRING: 'rent_expiring',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  BADGE_EARNED: 'badge_earned',
  STORAGE_FULL: 'storage_full',
  WORKER_EFFICIENCY_LOW: 'worker_efficiency_low',
  RESOURCE_DEPLETED: 'resource_depleted',
  BUILDING_MAINTENANCE_REQUIRED: 'building_maintenance_required'
} as const;
