export interface House {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  type: HouseType;
  size: HouseSize;
  position: { x: number; y: number };
  area: string;
  level: number;
  experience: number;
  maxExperience: number;
  isPublic: boolean;
  isLocked: boolean;
  password?: string;
  theme: HouseTheme;
  decorations: Decoration[];
  furniture: Furniture[];
  rooms: Room[];
  visitors: HouseVisitor[];
  metadata: HouseMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  houseId: string;
  name: string;
  type: RoomType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  decorations: Decoration[];
  furniture: Furniture[];
  theme: RoomTheme;
  isLocked: boolean;
  metadata: RoomMetadata;
}

export interface Decoration {
  id: string;
  houseId: string;
  roomId?: string;
  type: DecorationType;
  name: string;
  description: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  layer: number;
  isVisible: boolean;
  isInteractive: boolean;
  rarity: DecorationRarity;
  category: DecorationCategory;
  source: DecorationSource;
  metadata: DecorationMetadata;
  acquiredAt: Date;
}

export interface Furniture {
  id: string;
  houseId: string;
  roomId?: string;
  type: FurnitureType;
  name: string;
  description: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  layer: number;
  isVisible: boolean;
  isInteractive: boolean;
  functionality: FurnitureFunctionality;
  rarity: FurnitureRarity;
  category: FurnitureCategory;
  source: FurnitureSource;
  metadata: FurnitureMetadata;
  acquiredAt: Date;
}

export interface HouseVisitor {
  id: string;
  houseId: string;
  userId: string;
  username: string;
  avatar: string;
  visitTime: Date;
  duration: number;
  rating?: number;
  comment?: string;
  isOnline: boolean;
}

export interface HouseTemplate {
  id: string;
  name: string;
  description: string;
  type: HouseType;
  size: HouseSize;
  theme: HouseTheme;
  rooms: RoomTemplate[];
  decorations: DecorationTemplate[];
  furniture: FurnitureTemplate[];
  level: number;
  cost: number;
  isUnlocked: boolean;
  prerequisites: HousePrerequisite[];
  metadata: HouseTemplateMetadata;
}

export interface RoomTemplate {
  id: string;
  name: string;
  type: RoomType;
  size: { width: number; height: number };
  theme: RoomTheme;
  decorations: DecorationTemplate[];
  furniture: FurnitureTemplate[];
}

export interface DecorationTemplate {
  id: string;
  type: DecorationType;
  name: string;
  description: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  layer: number;
  rarity: DecorationRarity;
  category: DecorationCategory;
  metadata: DecorationMetadata;
}

export interface FurnitureTemplate {
  id: string;
  type: FurnitureType;
  name: string;
  description: string;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  layer: number;
  functionality: FurnitureFunctionality;
  rarity: FurnitureRarity;
  category: FurnitureCategory;
  metadata: FurnitureMetadata;
}

export interface HousePrerequisite {
  type: 'level' | 'achievement' | 'quest' | 'item';
  value: string | number;
  description: string;
}

export interface HouseMetadata {
  totalValue: number;
  decorationCount: number;
  furnitureCount: number;
  roomCount: number;
  visitorCount: number;
  averageRating: number;
  lastVisited: Date;
  specialFeatures: string[];
  tags: string[];
}

export interface RoomMetadata {
  decorationCount: number;
  furnitureCount: number;
  totalValue: number;
  specialFeatures: string[];
  tags: string[];
}

export interface DecorationMetadata {
  imageUrl: string;
  animationUrl?: string;
  soundEffect?: string;
  particleEffect?: string;
  interactable: boolean;
  collectible: boolean;
  tradeable: boolean;
  stackable: boolean;
  stackSize: number;
  value: number;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  tags: string[];
}

export interface FurnitureMetadata {
  imageUrl: string;
  animationUrl?: string;
  soundEffect?: string;
  particleEffect?: string;
  interactable: boolean;
  collectible: boolean;
  tradeable: boolean;
  stackable: boolean;
  stackSize: number;
  value: number;
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  functionality: string[];
  tags: string[];
}

export interface HouseTemplateMetadata {
  imageUrl: string;
  previewImages: string[];
  videoUrl?: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  estimatedTime: number;
  popularity: number;
  rating: number;
}

export interface HouseStats {
  totalHouses: number;
  totalRooms: number;
  totalDecorations: number;
  totalFurniture: number;
  totalVisitors: number;
  averageRating: number;
  totalValue: number;
  favoriteTheme: HouseTheme;
  mostPopularRoom: RoomType;
  mostUsedDecoration: DecorationType;
  mostUsedFurniture: FurnitureType;
  timeSpent: number;
  lastActivity: Date;
}

export interface HouseLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all';
  category: 'visitors' | 'rating' | 'value' | 'creativity';
  entries: HouseLeaderboardEntry[];
  lastUpdated: Date;
}

export interface HouseLeaderboardEntry {
  houseId: string;
  ownerId: string;
  ownerName: string;
  houseName: string;
  rank: number;
  score: number;
  level: number;
  visitors: number;
  rating: number;
  value: number;
  creativity: number;
}

export interface HouseNotification {
  id: string;
  type: HouseNotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: any;
}

export interface HouseEvent {
  type: HouseEventType;
  houseId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

export interface HouseVisit {
  id: string;
  houseId: string;
  visitorId: string;
  visitTime: Date;
  duration: number;
  rating?: number;
  comment?: string;
  isPublic: boolean;
}

export interface HouseInvite {
  id: string;
  houseId: string;
  inviterId: string;
  inviteeId: string;
  message: string;
  expiresAt: Date;
  isAccepted: boolean;
  isDeclined: boolean;
  createdAt: Date;
}

export interface HousePermission {
  userId: string;
  houseId: string;
  permissions: HousePermissionType[];
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface HouseShare {
  id: string;
  houseId: string;
  ownerId: string;
  shareType: HouseShareType;
  shareCode: string;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  createdAt: Date;
}

// Enums
export type HouseType = 
  | 'cottage'
  | 'mansion'
  | 'castle'
  | 'apartment'
  | 'treehouse'
  | 'cave'
  | 'floating'
  | 'underground'
  | 'sky'
  | 'water';

export type HouseSize = 
  | 'small'
  | 'medium'
  | 'large'
  | 'extra_large'
  | 'mega';

export type HouseTheme = 
  | 'modern'
  | 'medieval'
  | 'fantasy'
  | 'sci_fi'
  | 'nature'
  | 'gothic'
  | 'minimalist'
  | 'vintage'
  | 'tropical'
  | 'winter'
  | 'spring'
  | 'summer'
  | 'autumn';

export type RoomType = 
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'study'
  | 'dining_room'
  | 'garden'
  | 'basement'
  | 'attic'
  | 'garage'
  | 'workshop'
  | 'library'
  | 'gym'
  | 'entertainment'
  | 'storage';

export type RoomTheme = 
  | 'modern'
  | 'classic'
  | 'rustic'
  | 'elegant'
  | 'cozy'
  | 'minimalist'
  | 'vintage'
  | 'industrial'
  | 'bohemian'
  | 'scandinavian';

export type DecorationType = 
  | 'painting'
  | 'sculpture'
  | 'plant'
  | 'lamp'
  | 'candle'
  | 'vase'
  | 'clock'
  | 'mirror'
  | 'trophy'
  | 'book'
  | 'crystal'
  | 'gem'
  | 'artifact'
  | 'banner'
  | 'flag'
  | 'tapestry'
  | 'rug'
  | 'curtain'
  | 'wallpaper'
  | 'flooring';

export type DecorationRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type DecorationCategory = 
  | 'wall'
  | 'floor'
  | 'ceiling'
  | 'furniture'
  | 'lighting'
  | 'nature'
  | 'art'
  | 'collectible'
  | 'special'
  | 'seasonal';

export type DecorationSource = 
  | 'crafted'
  | 'purchased'
  | 'quest'
  | 'achievement'
  | 'event'
  | 'trade'
  | 'gift'
  | 'found';

export type FurnitureType = 
  | 'chair'
  | 'table'
  | 'bed'
  | 'sofa'
  | 'desk'
  | 'bookshelf'
  | 'cabinet'
  | 'dresser'
  | 'wardrobe'
  | 'chest'
  | 'bench'
  | 'stool'
  | 'ottoman'
  | 'recliner'
  | 'rocking_chair'
  | 'dining_set'
  | 'coffee_table'
  | 'side_table'
  | 'nightstand'
  | 'entertainment_center';

export type FurnitureRarity = 
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type FurnitureCategory = 
  | 'seating'
  | 'storage'
  | 'surface'
  | 'sleeping'
  | 'dining'
  | 'entertainment'
  | 'work'
  | 'decorative'
  | 'functional'
  | 'special';

export type FurnitureSource = 
  | 'crafted'
  | 'purchased'
  | 'quest'
  | 'achievement'
  | 'event'
  | 'trade'
  | 'gift'
  | 'found';

export type FurnitureFunctionality = 
  | 'none'
  | 'storage'
  | 'seating'
  | 'sleeping'
  | 'working'
  | 'entertainment'
  | 'decoration'
  | 'interactive'
  | 'special';

export type HouseNotificationType = 
  | 'visitor_arrived'
  | 'visitor_left'
  | 'house_rated'
  | 'house_shared'
  | 'house_invited'
  | 'house_permission_granted'
  | 'house_permission_revoked'
  | 'house_level_up'
  | 'house_featured'
  | 'house_contest_won';

export type HouseEventType = 
  | 'house_created'
  | 'house_updated'
  | 'house_deleted'
  | 'room_added'
  | 'room_removed'
  | 'decoration_placed'
  | 'decoration_removed'
  | 'furniture_placed'
  | 'furniture_removed'
  | 'visitor_arrived'
  | 'visitor_left'
  | 'house_rated'
  | 'house_shared'
  | 'house_invited'
  | 'house_permission_changed'
  | 'house_level_up'
  | 'house_featured';

export type HousePermissionType = 
  | 'view'
  | 'edit'
  | 'decorate'
  | 'furnish'
  | 'invite'
  | 'manage'
  | 'admin';

export type HouseShareType = 
  | 'public'
  | 'private'
  | 'friends'
  | 'guild'
  | 'temporary';

// Constants
export const HOUSE_EVENTS = {
  HOUSE_CREATED: 'house_created',
  HOUSE_UPDATED: 'house_updated',
  HOUSE_DELETED: 'house_deleted',
  ROOM_ADDED: 'room_added',
  ROOM_REMOVED: 'room_removed',
  DECORATION_PLACED: 'decoration_placed',
  DECORATION_REMOVED: 'decoration_removed',
  FURNITURE_PLACED: 'furniture_placed',
  FURNITURE_REMOVED: 'furniture_removed',
  VISITOR_ARRIVED: 'visitor_arrived',
  VISITOR_LEFT: 'visitor_left',
  HOUSE_RATED: 'house_rated',
  HOUSE_SHARED: 'house_shared',
  HOUSE_INVITED: 'house_invited',
  HOUSE_PERMISSION_CHANGED: 'house_permission_changed',
  HOUSE_LEVEL_UP: 'house_level_up',
  HOUSE_FEATURED: 'house_featured'
} as const;

export const HOUSE_NOTIFICATIONS = {
  VISITOR_ARRIVED: 'visitor_arrived',
  VISITOR_LEFT: 'visitor_left',
  HOUSE_RATED: 'house_rated',
  HOUSE_SHARED: 'house_shared',
  HOUSE_INVITED: 'house_invited',
  HOUSE_PERMISSION_GRANTED: 'house_permission_granted',
  HOUSE_PERMISSION_REVOKED: 'house_permission_revoked',
  HOUSE_LEVEL_UP: 'house_level_up',
  HOUSE_FEATURED: 'house_featured',
  HOUSE_CONTEST_WON: 'house_contest_won'
} as const;

