export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  name: string;
  description: string;
  type: ItemType;
  category: ItemCategory;
  rarity: ItemRarity;
  quantity: number;
  maxStack: number;
  stats?: ItemStats;
  metadata?: ItemMetadata;
  acquiredAt: Date;
  lastModified: Date;
  position?: InventoryPosition;
  isEquipped?: boolean;
  isLocked?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  customName?: string;
}

export interface InventoryPosition {
  slot: number;
  bag: string;
  row?: number;
  col?: number;
}

export interface ItemStats {
  attack?: number;
  defense?: number;
  health?: number;
  mana?: number;
  speed?: number;
  luck?: number;
  durability?: number;
  maxDurability?: number;
  level?: number;
  experience?: number;
  [key: string]: number | undefined;
}

export interface ItemMetadata {
  source?: string;
  craftedBy?: string;
  enchantments?: Enchantment[];
  sockets?: Socket[];
  setBonus?: string;
  specialEffects?: SpecialEffect[];
  tradeable?: boolean;
  sellable?: boolean;
  droppable?: boolean;
  destroyable?: boolean;
}

export interface Enchantment {
  id: string;
  name: string;
  level: number;
  effect: string;
  duration?: number;
}

export interface Socket {
  id: string;
  type: string;
  gem?: string;
  empty: boolean;
}

export interface SpecialEffect {
  id: string;
  name: string;
  description: string;
  trigger: string;
  cooldown?: number;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  QUEST = 'quest',
  TOOL = 'tool',
  PET = 'pet',
  CURRENCY = 'currency',
  MISC = 'misc'
}

export enum ItemCategory {
  SWORD = 'sword',
  BOW = 'bow',
  STAFF = 'staff',
  DAGGER = 'dagger',
  HELMET = 'helmet',
  CHESTPLATE = 'chestplate',
  LEGGINGS = 'leggings',
  BOOTS = 'boots',
  RING = 'ring',
  NECKLACE = 'necklace',
  POTION = 'potion',
  FOOD = 'food',
  ORE = 'ore',
  GEM = 'gem',
  HERB = 'herb',
  QUEST_ITEM = 'quest_item',
  PICKAXE = 'pickaxe',
  AXE = 'axe',
  FISHING_ROD = 'fishing_rod',
  PET_EGG = 'pet_egg',
  COIN = 'coin',
  TOKEN = 'token',
  OTHER = 'other'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export interface InventoryBag {
  id: string;
  userId: string;
  name: string;
  type: BagType;
  size: number;
  isDefault: boolean;
  isLocked: boolean;
  position: number;
  createdAt: Date;
}

export enum BagType {
  MAIN = 'main',
  EQUIPMENT = 'equipment',
  CONSUMABLES = 'consumables',
  MATERIALS = 'materials',
  QUEST = 'quest',
  CUSTOM = 'custom'
}

export interface InventoryFilter {
  type?: ItemType;
  category?: ItemCategory;
  rarity?: ItemRarity;
  searchQuery?: string;
  tags?: string[];
  isEquipped?: boolean;
  isLocked?: boolean;
  isFavorite?: boolean;
  minLevel?: number;
  maxLevel?: number;
  hasStats?: boolean;
  tradeable?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface InventorySort {
  field: SortField;
  direction: SortDirection;
}

export enum SortField {
  NAME = 'name',
  TYPE = 'type',
  RARITY = 'rarity',
  QUANTITY = 'quantity',
  ACQUIRED_AT = 'acquiredAt',
  LAST_MODIFIED = 'lastModified',
  LEVEL = 'level',
  VALUE = 'value'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export interface InventoryBulkAction {
  action: BulkAction;
  itemIds: string[];
  data?: any;
}

export enum BulkAction {
  MOVE = 'move',
  DELETE = 'delete',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  FAVORITE = 'favorite',
  UNFAVORITE = 'unfavorite',
  SELL = 'sell',
  TRADE = 'trade',
  SORT = 'sort',
  TAG = 'tag',
  UNTAG = 'untag'
}

export interface InventoryStats {
  userId: string;
  totalItems: number;
  totalValue: number;
  uniqueItems: number;
  categoryStats: {
    [key in ItemCategory]: {
      count: number;
      value: number;
    };
  };
  rarityStats: {
    [key in ItemRarity]: number;
  };
  bagStats: {
    [key: string]: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export interface InventorySearchResult {
  items: InventoryItem[];
  totalCount: number;
  hasMore: boolean;
  filters: InventoryFilter;
  sort: InventorySort;
}

export const INVENTORY_EVENTS = {
  ITEM_ADDED: 'itemAdded',
  ITEM_REMOVED: 'itemRemoved',
  ITEM_UPDATED: 'itemUpdated',
  ITEM_MOVED: 'itemMoved',
  ITEMS_SWAPPED: 'itemsSwapped',
  ITEMS_BULK_MOVED: 'itemsBulkMoved',
  ITEMS_BULK_DELETED: 'itemsBulkDeleted',
  ITEMS_BULK_LOCKED: 'itemsBulkLocked',
  ITEMS_BULK_FAVORITED: 'itemsBulkFavorited',
  ITEMS_BULK_SOLD: 'itemsBulkSold',
  ITEMS_BULK_TAGGED: 'itemsBulkTagged',
  ITEMS_BULK_UNTAGGED: 'itemsBulkUntagged',
  BAG_CREATED: 'bagCreated',
  BAG_UPDATED: 'bagUpdated',
  BAG_DELETED: 'bagDeleted'
} as const;

export const INVENTORY_NOTIFICATIONS = {
  ITEM_ADDED: 'item_added',
  ITEM_REMOVED: 'item_removed',
  ITEM_MOVED: 'item_moved',
  BULK_ACTION_COMPLETED: 'bulk_action_completed',
  INVENTORY_FULL: 'inventory_full',
  BAG_CREATED: 'bag_created'
} as const;
