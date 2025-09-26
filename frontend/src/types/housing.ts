export interface PlayerHouse {
  id: string;
  userId: string;
  name: string;
  description: string;
  location: HouseLocation;
  size: HouseSize;
  theme: HouseTheme;
  level: number;
  experience: number;
  experienceToNext: number;
  maxLevel: number;
  isPublic: boolean;
  isLocked: boolean;
  password?: string;
  createdAt: Date;
  lastModified: Date;
  metadata: HouseMetadata;
}

export interface HouseLocation {
  x: number;
  y: number;
  mapId: string;
  area: string;
  coordinates: string; // e.g., "A1", "B3"
}

export interface HouseSize {
  width: number;
  height: number;
  floors: number;
  rooms: number;
  maxRooms: number;
  maxFloors: number;
}

export interface HouseMetadata {
  description: string;
  imageUrl?: string;
  backgroundMusic?: string;
  specialEffects?: string[];
  tags: string[];
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  category: string;
}

export interface Furniture {
  id: string;
  name: string;
  description: string;
  category: FurnitureCategory;
  subcategory: string;
  rarity: ItemRarity;
  quality: ItemQuality;
  size: FurnitureSize;
  placement: FurniturePlacement;
  stats?: FurnitureStats;
  interactions: FurnitureInteraction[];
  requirements: FurnitureRequirement[];
  cost: FurnitureCost;
  metadata: FurnitureMetadata;
}

export interface FurnitureSize {
  width: number;
  height: number;
  depth: number;
  weight: number;
}

export interface FurniturePlacement {
  allowedFloors: number[];
  allowedRooms: string[];
  requiresWall: boolean;
  requiresFloor: boolean;
  requiresCeiling: boolean;
  canRotate: boolean;
  canStack: boolean;
  maxStackHeight: number;
}

export interface FurnitureStats {
  comfort: number;
  beauty: number;
  functionality: number;
  durability: number;
  maxDurability: number;
  energyEfficiency?: number;
  storageCapacity?: number;
  seatingCapacity?: number;
  sleepingCapacity?: number;
}

export interface FurnitureInteraction {
  id: string;
  name: string;
  description: string;
  type: InteractionType;
  cooldown: number;
  requirements: InteractionRequirement[];
  effects: InteractionEffect[];
  rewards: InteractionReward[];
}

export interface InteractionRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface InteractionEffect {
  type: EffectType;
  value: number;
  duration: number;
  description: string;
}

export interface InteractionReward {
  type: RewardType;
  itemId?: string;
  amount: number;
  rarity: ItemRarity;
  description: string;
}

export interface FurnitureCost {
  gold: number;
  materials: FurnitureMaterial[];
  timeToCraft: number;
  requiredLevel: number;
  requiredSkills: SkillRequirement[];
}

export interface FurnitureMaterial {
  itemId: string;
  itemName: string;
  quantity: number;
  rarity: ItemRarity;
  isConsumed: boolean;
}

export interface SkillRequirement {
  skillName: string;
  level: number;
  description: string;
}

export interface FurnitureMetadata {
  tags: string[];
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  category: string;
  source: string;
  seasonalAvailability?: string[];
  weatherDependency?: string[];
}

export interface PlacedFurniture {
  id: string;
  furnitureId: string;
  houseId: string;
  roomId: string;
  position: Position3D;
  rotation: Rotation3D;
  scale: Scale3D;
  placedAt: Date;
  lastUsed?: Date;
  durability: number;
  maxDurability: number;
  isActive: boolean;
  isLocked: boolean;
  customizations: FurnitureCustomization[];
  interactions: PlacedFurnitureInteraction[];
  metadata: PlacedFurnitureMetadata;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

export interface Scale3D {
  x: number;
  y: number;
  z: number;
}

export interface FurnitureCustomization {
  id: string;
  type: CustomizationType;
  value: string;
  description: string;
  cost: number;
  isApplied: boolean;
}

export interface PlacedFurnitureInteraction {
  id: string;
  interactionId: string;
  lastUsed: Date;
  cooldownEnd: Date;
  isAvailable: boolean;
  usageCount: number;
  totalRewards: number;
}

export interface PlacedFurnitureMetadata {
  description: string;
  notes: string;
  tags: string[];
  isPublic: boolean;
  isLocked: boolean;
  customName?: string;
}

export interface HouseRoom {
  id: string;
  houseId: string;
  name: string;
  type: RoomType;
  floor: number;
  position: Position2D;
  size: RoomSize;
  theme: RoomTheme;
  isLocked: boolean;
  isPublic: boolean;
  furniture: PlacedFurniture[];
  decorations: RoomDecoration[];
  lighting: RoomLighting;
  temperature: number;
  humidity: number;
  airQuality: number;
  comfort: number;
  beauty: number;
  functionality: number;
  metadata: RoomMetadata;
}

export interface Position2D {
  x: number;
  y: number;
}

export interface RoomSize {
  width: number;
  height: number;
}

export interface RoomDecoration {
  id: string;
  name: string;
  type: DecorationType;
  position: Position2D;
  rotation: number;
  scale: number;
  isActive: boolean;
  effects: DecorationEffect[];
}

export interface RoomLighting {
  ambientLight: number;
  directionalLight: number;
  pointLights: PointLight[];
  colorTemperature: number;
  brightness: number;
  isAutomatic: boolean;
  schedule: LightingSchedule[];
}

export interface PointLight {
  id: string;
  position: Position3D;
  color: string;
  intensity: number;
  range: number;
  isActive: boolean;
}

export interface LightingSchedule {
  id: string;
  time: string; // HH:MM format
  brightness: number;
  colorTemperature: number;
  isActive: boolean;
}

export interface DecorationEffect {
  type: EffectType;
  value: number;
  duration: number;
  description: string;
}

export interface RoomMetadata {
  description: string;
  imageUrl?: string;
  backgroundMusic?: string;
  specialEffects?: string[];
  tags: string[];
  isTradeable: boolean;
  isSellable: boolean;
  baseValue: number;
  category: string;
}

export interface HouseGuest {
  id: string;
  houseId: string;
  userId: string;
  username: string;
  invitedBy: string;
  invitedAt: Date;
  lastVisit: Date;
  visitCount: number;
  permissions: GuestPermission[];
  isActive: boolean;
  notes: string;
}

export interface GuestPermission {
  type: PermissionType;
  level: PermissionLevel;
  description: string;
  isGranted: boolean;
}

export interface HouseVisit {
  id: string;
  houseId: string;
  visitorId: string;
  visitorUsername: string;
  visitedAt: Date;
  duration: number;
  roomsVisited: string[];
  interactions: string[];
  rating: number;
  comment: string;
  isPublic: boolean;
}

export interface HouseRating {
  id: string;
  houseId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  categories: RatingCategory[];
  createdAt: Date;
  isPublic: boolean;
}

export interface RatingCategory {
  category: string;
  rating: number;
  comment: string;
}

export interface HouseUpgrade {
  id: string;
  houseId: string;
  type: UpgradeType;
  level: number;
  maxLevel: number;
  cost: UpgradeCost;
  benefits: UpgradeBenefit[];
  requirements: UpgradeRequirement[];
  isUnlocked: boolean;
  isActive: boolean;
  metadata: UpgradeMetadata;
}

export interface UpgradeCost {
  gold: number;
  materials: FurnitureMaterial[];
  timeToComplete: number;
  requiredLevel: number;
}

export interface UpgradeBenefit {
  type: BenefitType;
  value: number;
  description: string;
  isActive: boolean;
}

export interface UpgradeRequirement {
  type: RequirementType;
  value: number;
  description: string;
  isMet: boolean;
}

export interface UpgradeMetadata {
  name: string;
  description: string;
  imageUrl?: string;
  animationUrl?: string;
  soundEffect?: string;
  specialEffects?: string[];
  tags: string[];
  category: string;
}

export interface HouseStats {
  totalHouses: number;
  totalRooms: number;
  totalFurniture: number;
  totalVisits: number;
  averageRating: number;
  totalUpgrades: number;
  favoriteTheme: HouseTheme;
  mostPopularRoom: RoomType;
  totalValue: number;
  achievements: string[];
}

export interface HousingAchievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: ItemRarity;
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
  rarity: ItemRarity;
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

export type HouseTheme = 
  | 'modern'
  | 'classic'
  | 'rustic'
  | 'futuristic'
  | 'medieval'
  | 'tropical'
  | 'minimalist'
  | 'vintage'
  | 'industrial'
  | 'fantasy'
  | 'steampunk'
  | 'cyberpunk';

export type RoomType = 
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'study'
  | 'dining_room'
  | 'garage'
  | 'garden'
  | 'balcony'
  | 'attic'
  | 'basement'
  | 'workshop'
  | 'gym'
  | 'library'
  | 'entertainment'
  | 'storage';

export type RoomTheme = HouseTheme;

export type FurnitureCategory = 
  | 'seating'
  | 'tables'
  | 'storage'
  | 'lighting'
  | 'decoration'
  | 'electronics'
  | 'appliances'
  | 'bedding'
  | 'kitchen'
  | 'bathroom'
  | 'outdoor'
  | 'office'
  | 'entertainment'
  | 'plants'
  | 'artwork'
  | 'flooring'
  | 'wallpaper'
  | 'ceiling';

export type DecorationType = 
  | 'wall_hanging'
  | 'floor_decoration'
  | 'ceiling_decoration'
  | 'window_treatment'
  | 'plant'
  | 'artwork'
  | 'sculpture'
  | 'lighting'
  | 'rug'
  | 'curtain';

export type InteractionType = 
  | 'sit'
  | 'sleep'
  | 'work'
  | 'cook'
  | 'clean'
  | 'entertain'
  | 'exercise'
  | 'study'
  | 'relax'
  | 'socialize'
  | 'craft'
  | 'garden'
  | 'custom';

export type EffectType = 
  | 'comfort'
  | 'beauty'
  | 'functionality'
  | 'energy'
  | 'health'
  | 'happiness'
  | 'productivity'
  | 'creativity'
  | 'social'
  | 'relaxation'
  | 'exercise'
  | 'learning';

export type RewardType = 
  | 'experience'
  | 'gold'
  | 'item'
  | 'achievement'
  | 'skill_point'
  | 'buff'
  | 'cosmetic'
  | 'currency';

export type RequirementType = 
  | 'level'
  | 'skill_level'
  | 'item_owned'
  | 'achievement'
  | 'reputation'
  | 'quest_completion'
  | 'time_played'
  | 'house_level'
  | 'room_count'
  | 'furniture_count';

export type CustomizationType = 
  | 'color'
  | 'texture'
  | 'pattern'
  | 'size'
  | 'material'
  | 'finish'
  | 'accessory'
  | 'lighting'
  | 'sound'
  | 'animation';

export type PermissionType = 
  | 'view'
  | 'interact'
  | 'place_furniture'
  | 'remove_furniture'
  | 'modify_room'
  | 'invite_guests'
  | 'manage_permissions'
  | 'admin';

export type PermissionLevel = 
  | 'none'
  | 'basic'
  | 'standard'
  | 'advanced'
  | 'full';

export type UpgradeType = 
  | 'size_expansion'
  | 'room_addition'
  | 'floor_addition'
  | 'automation'
  | 'security'
  | 'energy_efficiency'
  | 'comfort'
  | 'beauty'
  | 'functionality'
  | 'storage'
  | 'lighting'
  | 'climate_control';

export type BenefitType = 
  | 'capacity'
  | 'efficiency'
  | 'comfort'
  | 'beauty'
  | 'functionality'
  | 'security'
  | 'automation'
  | 'energy_savings'
  | 'storage_space'
  | 'lighting_quality'
  | 'climate_control'
  | 'entertainment';

export type AchievementCategory = 
  | 'furniture'
  | 'decoration'
  | 'room_design'
  | 'house_management'
  | 'social'
  | 'creativity'
  | 'efficiency'
  | 'collection'
  | 'special_events'
  | 'milestones';

export type ItemRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type ItemQuality = 
  | 'poor'
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'artifact';