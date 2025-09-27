import { Server as SocketIOServer } from 'socket.io';
import { EventEmitter } from 'events';

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

export class InventoryService extends EventEmitter {
  private items: Map<string, InventoryItem> = new Map();
  private userItems: Map<string, string[]> = new Map();
  private userBags: Map<string, InventoryBag[]> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    super();
    this.io = io;
    this.initializeDefaultBags();
  }

  // Get user inventory with filtering and sorting
  async getInventory(
    userId: string,
    options: {
      filter?: InventoryFilter;
      sort?: InventorySort;
      limit?: number;
      offset?: number;
      bagId?: string;
    } = {}
  ): Promise<InventorySearchResult> {
    const userItemIds = this.userItems.get(userId) || [];
    let items = userItemIds
      .map(id => this.items.get(id))
      .filter(item => item && this.matchesFilter(item, options.filter)) as InventoryItem[];

    // Apply bag filter
    if (options.bagId) {
      items = items.filter(item => item.position?.bag === options.bagId);
    }

    // Apply sorting
    if (options.sort) {
      items = this.sortItems(items, options.sort);
    }

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    const totalCount = items.length;
    const paginatedItems = items.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      totalCount,
      hasMore: offset + limit < totalCount,
      filters: options.filter || {},
      sort: options.sort || { field: SortField.ACQUIRED_AT, direction: SortDirection.DESC }
    };
  }

  // Add item to inventory
  async addItem(
    userId: string,
    itemData: {
      itemId: string;
      name: string;
      description: string;
      type: ItemType;
      category: ItemCategory;
      rarity: ItemRarity;
      quantity: number;
      maxStack?: number;
      stats?: ItemStats;
      metadata?: ItemMetadata;
      tags?: string[];
    }
  ): Promise<InventoryItem> {
    const existingItem = this.findStackableItem(userId, itemData.itemId, itemData.maxStack);
    
    if (existingItem && existingItem.quantity < existingItem.maxStack) {
      // Stack with existing item
      const stackAmount = Math.min(
        itemData.quantity,
        existingItem.maxStack - existingItem.quantity
      );
      
      existingItem.quantity += stackAmount;
      existingItem.lastModified = new Date();
      
      this.emit('itemUpdated', existingItem);
      this.sendInventoryUpdate(userId, 'itemUpdated', existingItem);
      
      // If there's remaining quantity, create new item
      if (itemData.quantity > stackAmount) {
        return this.addItem(userId, {
          ...itemData,
          quantity: itemData.quantity - stackAmount
        });
      }
      
      return existingItem;
    } else {
      // Create new item
      const item: InventoryItem = {
        id: this.generateId(),
        userId,
        itemId: itemData.itemId,
        name: itemData.name,
        description: itemData.description,
        type: itemData.type,
        category: itemData.category,
        rarity: itemData.rarity,
        quantity: itemData.quantity,
        maxStack: itemData.maxStack || 1,
        stats: itemData.stats,
        metadata: itemData.metadata,
        acquiredAt: new Date(),
        lastModified: new Date(),
        isEquipped: false,
        isLocked: false,
        isFavorite: false,
        tags: itemData.tags || []
      };

      // Auto-assign to appropriate bag
      const bag = this.getBestBagForItem(userId, item);
      if (bag) {
        const position = this.findAvailablePosition(userId, bag.id);
        if (position) {
          item.position = position;
        }
      }

      this.items.set(item.id, item);
      
      if (!this.userItems.has(userId)) {
        this.userItems.set(userId, []);
      }
      this.userItems.get(userId)!.push(item.id);

      this.emit('itemAdded', item);
      this.sendInventoryUpdate(userId, 'itemAdded', item);
      
      return item;
    }
  }

  // Remove item from inventory
  async removeItem(userId: string, itemId: string, quantity?: number): Promise<boolean> {
    const item = this.items.get(itemId);
    if (!item || item.userId !== userId) {
      return false;
    }

    if (quantity && quantity < item.quantity) {
      // Partial removal
      item.quantity -= quantity;
      item.lastModified = new Date();
      
      this.emit('itemUpdated', item);
      this.sendInventoryUpdate(userId, 'itemUpdated', item);
    } else {
      // Complete removal
      this.items.delete(itemId);
      
      const userItemIds = this.userItems.get(userId) || [];
      const index = userItemIds.indexOf(itemId);
      if (index > -1) {
        userItemIds.splice(index, 1);
      }

      this.emit('itemRemoved', item);
      this.sendInventoryUpdate(userId, 'itemRemoved', item);
    }

    return true;
  }

  // Move item to different position
  async moveItem(
    userId: string,
    itemId: string,
    newPosition: InventoryPosition
  ): Promise<boolean> {
    const item = this.items.get(itemId);
    if (!item || item.userId !== userId) {
      return false;
    }

    // Check if target position is available
    if (!this.isPositionAvailable(userId, newPosition, itemId)) {
      return false;
    }

    item.position = newPosition;
    item.lastModified = new Date();

    this.emit('itemMoved', item);
    this.sendInventoryUpdate(userId, 'itemMoved', item);
    
    return true;
  }

  // Swap two items
  async swapItems(
    userId: string,
    itemId1: string,
    itemId2: string
  ): Promise<boolean> {
    const item1 = this.items.get(itemId1);
    const item2 = this.items.get(itemId2);
    
    if (!item1 || !item2 || item1.userId !== userId || item2.userId !== userId) {
      return false;
    }

    const tempPosition = item1.position;
    item1.position = item2.position;
    item2.position = tempPosition;
    
    item1.lastModified = new Date();
    item2.lastModified = new Date();

    this.emit('itemsSwapped', { item1, item2 });
    this.sendInventoryUpdate(userId, 'itemsSwapped', { item1, item2 });
    
    return true;
  }

  // Perform bulk actions
  async performBulkAction(
    userId: string,
    action: InventoryBulkAction
  ): Promise<boolean> {
    const items = action.itemIds
      .map(id => this.items.get(id))
      .filter(item => item && item.userId === userId) as InventoryItem[];

    if (items.length === 0) {
      return false;
    }

    switch (action.action) {
      case BulkAction.MOVE:
        return this.bulkMoveItems(items, action.data);
      case BulkAction.DELETE:
        return this.bulkDeleteItems(items);
      case BulkAction.LOCK:
        return this.bulkLockItems(items, true);
      case BulkAction.UNLOCK:
        return this.bulkLockItems(items, false);
      case BulkAction.FAVORITE:
        return this.bulkFavoriteItems(items, true);
      case BulkAction.UNFAVORITE:
        return this.bulkFavoriteItems(items, false);
      case BulkAction.SELL:
        return this.bulkSellItems(items);
      case BulkAction.TAG:
        return this.bulkTagItems(items, action.data?.tags || []);
      case BulkAction.UNTAG:
        return this.bulkUntagItems(items, action.data?.tags || []);
      default:
        return false;
    }
  }

  // Search inventory
  async searchInventory(
    userId: string,
    query: string,
    options: {
      filter?: InventoryFilter;
      limit?: number;
    } = {}
  ): Promise<InventoryItem[]> {
    const userItemIds = this.userItems.get(userId) || [];
    let items = userItemIds
      .map(id => this.items.get(id))
      .filter(item => item && this.matchesSearch(item, query)) as InventoryItem[];

    // Apply additional filters
    if (options.filter) {
      items = items.filter(item => this.matchesFilter(item, options.filter));
    }

    // Apply limit
    const limit = options.limit || 50;
    return items.slice(0, limit);
  }

  // Get inventory statistics
  async getInventoryStats(userId: string): Promise<InventoryStats> {
    const userItemIds = this.userItems.get(userId) || [];
    const items = userItemIds
      .map(id => this.items.get(id))
      .filter(item => item) as InventoryItem[];

    const stats: InventoryStats = {
      userId,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalValue: items.reduce((sum, item) => sum + (this.getItemValue(item) * item.quantity), 0),
      uniqueItems: items.length,
      categoryStats: {} as any,
      rarityStats: {} as any,
      bagStats: {}
    };

    // Initialize category stats
    Object.values(ItemCategory).forEach(category => {
      const categoryItems = items.filter(item => item.category === category);
      stats.categoryStats[category] = {
        count: categoryItems.reduce((sum, item) => sum + item.quantity, 0),
        value: categoryItems.reduce((sum, item) => sum + (this.getItemValue(item) * item.quantity), 0)
      };
    });

    // Initialize rarity stats
    Object.values(ItemRarity).forEach(rarity => {
      stats.rarityStats[rarity] = items.filter(item => item.rarity === rarity).length;
    });

    // Calculate bag stats
    const bags = this.userBags.get(userId) || [];
    bags.forEach(bag => {
      const bagItems = items.filter(item => item.position?.bag === bag.id);
      const usedSlots = bagItems.length;
      stats.bagStats[bag.id] = {
        used: usedSlots,
        total: bag.size,
        percentage: (usedSlots / bag.size) * 100
      };
    });

    return stats;
  }

  // Create custom bag
  async createBag(
    userId: string,
    name: string,
    type: BagType,
    size: number
  ): Promise<InventoryBag> {
    const bag: InventoryBag = {
      id: this.generateId(),
      userId,
      name,
      type,
      size,
      isDefault: false,
      isLocked: false,
      position: this.getNextBagPosition(userId),
      createdAt: new Date()
    };

    if (!this.userBags.has(userId)) {
      this.userBags.set(userId, []);
    }
    this.userBags.get(userId)!.push(bag);

    this.emit('bagCreated', bag);
    this.sendInventoryUpdate(userId, 'bagCreated', bag);
    
    return bag;
  }

  // Get user bags
  async getUserBags(userId: string): Promise<InventoryBag[]> {
    return this.userBags.get(userId) || [];
  }

  // Private helper methods
  private generateId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private matchesFilter(item: InventoryItem, filter?: InventoryFilter): boolean {
    if (!filter) return true;

    if (filter.type && item.type !== filter.type) return false;
    if (filter.category && item.category !== filter.category) return false;
    if (filter.rarity && item.rarity !== filter.rarity) return false;
    if (filter.isEquipped !== undefined && item.isEquipped !== filter.isEquipped) return false;
    if (filter.isLocked !== undefined && item.isLocked !== filter.isLocked) return false;
    if (filter.isFavorite !== undefined && item.isFavorite !== filter.isFavorite) return false;
    if (filter.tradeable !== undefined && item.metadata?.tradeable !== filter.tradeable) return false;
    
    if (filter.tags && filter.tags.length > 0) {
      if (!item.tags || !filter.tags.some(tag => item.tags!.includes(tag))) return false;
    }

    if (filter.minLevel && (!item.stats?.level || item.stats.level < filter.minLevel)) return false;
    if (filter.maxLevel && (!item.stats?.level || item.stats.level > filter.maxLevel)) return false;
    if (filter.hasStats && !item.stats) return false;

    if (filter.dateRange) {
      if (item.acquiredAt < filter.dateRange.start || item.acquiredAt > filter.dateRange.end) return false;
    }

    return true;
  }

  private matchesSearch(item: InventoryItem, query: string): boolean {
    const searchTerm = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      item.customName?.toLowerCase().includes(searchTerm)
    );
  }

  private sortItems(items: InventoryItem[], sort: InventorySort): InventoryItem[] {
    return items.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort.field) {
        case SortField.NAME:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case SortField.TYPE:
          aValue = a.type;
          bValue = b.type;
          break;
        case SortField.RARITY:
          const rarityOrder = [ItemRarity.COMMON, ItemRarity.UNCOMMON, ItemRarity.RARE, ItemRarity.EPIC, ItemRarity.LEGENDARY, ItemRarity.MYTHIC];
          aValue = rarityOrder.indexOf(a.rarity);
          bValue = rarityOrder.indexOf(b.rarity);
          break;
        case SortField.QUANTITY:
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case SortField.ACQUIRED_AT:
          aValue = a.acquiredAt.getTime();
          bValue = b.acquiredAt.getTime();
          break;
        case SortField.LAST_MODIFIED:
          aValue = a.lastModified.getTime();
          bValue = b.lastModified.getTime();
          break;
        case SortField.LEVEL:
          aValue = a.stats?.level || 0;
          bValue = b.stats?.level || 0;
          break;
        case SortField.VALUE:
          aValue = this.getItemValue(a);
          bValue = this.getItemValue(b);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sort.direction === SortDirection.ASC ? -1 : 1;
      if (aValue > bValue) return sort.direction === SortDirection.ASC ? 1 : -1;
      return 0;
    });
  }

  private getItemValue(item: InventoryItem): number {
    // Simple value calculation based on rarity and stats
    const rarityMultiplier = {
      [ItemRarity.COMMON]: 1,
      [ItemRarity.UNCOMMON]: 2,
      [ItemRarity.RARE]: 5,
      [ItemRarity.EPIC]: 10,
      [ItemRarity.LEGENDARY]: 25,
      [ItemRarity.MYTHIC]: 50
    };

    let baseValue = rarityMultiplier[item.rarity] * 10;
    
    if (item.stats) {
      const statSum = Object.values(item.stats).reduce((sum, stat) => sum + (stat || 0), 0);
      baseValue += statSum * 2;
    }

    return Math.floor(baseValue);
  }

  private findStackableItem(userId: string, itemId: string, maxStack?: number): InventoryItem | null {
    const userItemIds = this.userItems.get(userId) || [];
    return userItemIds
      .map(id => this.items.get(id))
      .find(item => 
        item && 
        item.itemId === itemId && 
        item.quantity < (maxStack || item.maxStack)
      ) as InventoryItem || null;
  }

  private getBestBagForItem(userId: string, item: InventoryItem): InventoryBag | null {
    const bags = this.userBags.get(userId) || [];
    
    // Find bag by type
    const typeBag = bags.find(bag => {
      switch (bag.type) {
        case BagType.EQUIPMENT:
          return [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY].includes(item.type);
        case BagType.CONSUMABLES:
          return item.type === ItemType.CONSUMABLE;
        case BagType.MATERIALS:
          return item.type === ItemType.MATERIAL;
        case BagType.QUEST:
          return item.type === ItemType.QUEST;
        default:
          return false;
      }
    });

    return typeBag || bags.find(bag => bag.type === BagType.MAIN) || null;
  }

  private findAvailablePosition(userId: string, bagId: string): InventoryPosition | null {
    const bag = this.userBags.get(userId)?.find(b => b.id === bagId);
    if (!bag) return null;

    const bagItems = Array.from(this.items.values())
      .filter(item => item.userId === userId && item.position?.bag === bagId);

    for (let slot = 0; slot < bag.size; slot++) {
      if (!bagItems.some(item => item.position?.slot === slot)) {
        return { slot, bag: bagId };
      }
    }

    return null;
  }

  private isPositionAvailable(userId: string, position: InventoryPosition, excludeItemId?: string): boolean {
    const bag = this.userBags.get(userId)?.find(b => b.id === position.bag);
    if (!bag || position.slot >= bag.size) return false;

    const existingItem = Array.from(this.items.values())
      .find(item => 
        item.userId === userId && 
        item.position?.bag === position.bag && 
        item.position?.slot === position.slot &&
        item.id !== excludeItemId
      );

    return !existingItem;
  }

  private bulkMoveItems(items: InventoryItem[], targetBag: string): boolean {
    items.forEach(item => {
      const position = this.findAvailablePosition(item.userId, targetBag);
      if (position) {
        item.position = position;
        item.lastModified = new Date();
      }
    });

    this.emit('itemsBulkMoved', { items, targetBag });
    return true;
  }

  private bulkDeleteItems(items: InventoryItem[]): boolean {
    items.forEach(item => {
      this.items.delete(item.id);
      const userItemIds = this.userItems.get(item.userId) || [];
      const index = userItemIds.indexOf(item.id);
      if (index > -1) {
        userItemIds.splice(index, 1);
      }
    });

    this.emit('itemsBulkDeleted', { items });
    return true;
  }

  private bulkLockItems(items: InventoryItem[], locked: boolean): boolean {
    items.forEach(item => {
      item.isLocked = locked;
      item.lastModified = new Date();
    });

    this.emit('itemsBulkLocked', { items, locked });
    return true;
  }

  private bulkFavoriteItems(items: InventoryItem[], favorite: boolean): boolean {
    items.forEach(item => {
      item.isFavorite = favorite;
      item.lastModified = new Date();
    });

    this.emit('itemsBulkFavorited', { items, favorite });
    return true;
  }

  private bulkSellItems(items: InventoryItem[]): boolean {
    // This would integrate with the marketplace service
    this.emit('itemsBulkSold', { items });
    return true;
  }

  private bulkTagItems(items: InventoryItem[], tags: string[]): boolean {
    items.forEach(item => {
      if (!item.tags) item.tags = [];
      tags.forEach(tag => {
        if (!item.tags!.includes(tag)) {
          item.tags!.push(tag);
        }
      });
      item.lastModified = new Date();
    });

    this.emit('itemsBulkTagged', { items, tags });
    return true;
  }

  private bulkUntagItems(items: InventoryItem[], tags: string[]): boolean {
    items.forEach(item => {
      if (item.tags) {
        item.tags = item.tags.filter(tag => !tags.includes(tag));
        item.lastModified = new Date();
      }
    });

    this.emit('itemsBulkUntagged', { items, tags });
    return true;
  }

  private getNextBagPosition(userId: string): number {
    const bags = this.userBags.get(userId) || [];
    return bags.length;
  }

  private initializeDefaultBags(): void {
    // Initialize default bags for demo users
    // In production, this would be loaded from database
  }

  private sendInventoryUpdate(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit('inventoryUpdate', { event, data });
  }
}
