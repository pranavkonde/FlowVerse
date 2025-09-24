import { io, Socket } from 'socket.io-client';
import {
  Resource,
  ResourceNode,
  CraftingRecipe,
  InventoryItem,
  CraftingSession,
  CraftingSkill,
  ResourceGatheringSession,
  CraftingStats,
  ResourceStats,
  CraftingLeaderboard,
  ResourceLeaderboard,
  CraftingNotification,
  CraftingEvent,
  ResourceType,
  ResourceRarity,
  ResourceCategory,
  CraftingCategory,
  CraftingStatus,
  GatheringStatus,
  CraftingNotificationType,
  CraftingEventType,
  CRAFTING_EVENTS,
  CRAFTING_NOTIFICATIONS
} from '../types/crafting';

export class CraftingService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();
  private inventory: Map<string, InventoryItem> = new Map();
  private skills: Map<CraftingCategory, CraftingSkill> = new Map();
  private recipes: Map<string, CraftingRecipe> = new Map();
  private resourceNodes: Map<string, ResourceNode> = new Map();

  constructor() {
    this.initializeSocket();
    this.initializeDefaultData();
  }

  private initializeSocket(): void {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
    this.socket = io(socketUrl);

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to crafting service');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from crafting service');
    });

    // Crafting system specific listeners
    this.socket.on('craftingUpdate', (data: any) => {
      this.emit('craftingUpdate', data);
    });

    this.socket.on('resourceGathered', (data: any) => {
      this.emit('resourceGathered', data);
    });

    this.socket.on('inventoryUpdate', (data: any) => {
      this.emit('inventoryUpdate', data);
    });

    this.socket.on('skillLevelUp', (data: any) => {
      this.emit('skillLevelUp', data);
    });

    this.socket.on('recipeUnlocked', (data: any) => {
      this.emit('recipeUnlocked', data);
    });

    this.socket.on('craftingNotification', (notification: CraftingNotification) => {
      this.emit('craftingNotification', notification);
    });
  }

  private initializeDefaultData(): void {
    // Initialize default resources
    const defaultResources: Resource[] = [
      {
        id: 'iron-ore',
        name: 'Iron Ore',
        description: 'A common metal ore used in basic crafting',
        type: 'ore',
        rarity: 'common',
        icon: '⛏️',
        value: 10,
        stackSize: 100,
        category: 'materials',
        source: 'mining',
        metadata: {
          hardness: 3,
          weight: 2.5,
          meltingPoint: 1538
        }
      },
      {
        id: 'oak-wood',
        name: 'Oak Wood',
        description: 'Strong wood from oak trees',
        type: 'wood',
        rarity: 'common',
        icon: '🪵',
        value: 5,
        stackSize: 200,
        category: 'materials',
        source: 'logging',
        metadata: {
          hardness: 2,
          weight: 1.0,
          durability: 80
        }
      },
      {
        id: 'crystal-shard',
        name: 'Crystal Shard',
        description: 'A rare crystal with magical properties',
        type: 'crystal',
        rarity: 'rare',
        icon: '💎',
        value: 100,
        stackSize: 50,
        category: 'special',
        source: 'mining',
        metadata: {
          hardness: 8,
          weight: 0.5,
          magicalPower: 15
        }
      }
    ];

    // Initialize default recipes
    const defaultRecipes: CraftingRecipe[] = [
      {
        id: 'iron-sword',
        name: 'Iron Sword',
        description: 'A basic iron sword for combat',
        category: 'weapons',
        level: 1,
        experience: 50,
        materials: [
          { resourceId: 'iron-ore', amount: 3, consumed: true },
          { resourceId: 'oak-wood', amount: 1, consumed: true }
        ],
        result: {
          itemId: 'iron-sword',
          amount: 1,
          chance: 100,
          experience: 50
        },
        craftingTime: 30,
        isUnlocked: true,
        prerequisites: [],
        metadata: {
          difficulty: 'easy',
          category: 'Weapons',
          tags: ['sword', 'iron', 'basic'],
          imageUrl: '/images/items/iron-sword.png'
        }
      },
      {
        id: 'iron-armor',
        name: 'Iron Armor',
        description: 'Protective iron armor',
        category: 'armor',
        level: 2,
        experience: 100,
        materials: [
          { resourceId: 'iron-ore', amount: 5, consumed: true },
          { resourceId: 'leather-strip', amount: 2, consumed: true }
        ],
        result: {
          itemId: 'iron-armor',
          amount: 1,
          chance: 90,
          experience: 100
        },
        craftingTime: 60,
        isUnlocked: false,
        prerequisites: [
          { type: 'level', value: 2, description: 'Crafting level 2 required' }
        ],
        metadata: {
          difficulty: 'medium',
          category: 'Armor',
          tags: ['armor', 'iron', 'protection'],
          imageUrl: '/images/items/iron-armor.png'
        }
      }
    ];

    // Initialize default resource nodes
    const defaultNodes: ResourceNode[] = [
      {
        id: 'iron-vein-1',
        resourceId: 'iron-ore',
        position: { x: 100, y: 200 },
        area: 'Mining Cave',
        respawnTime: 300, // 5 minutes
        isActive: true,
        level: 1,
        experience: 10,
        drops: [
          { resourceId: 'iron-ore', minAmount: 1, maxAmount: 3, chance: 100, experience: 10 }
        ]
      },
      {
        id: 'oak-tree-1',
        resourceId: 'oak-wood',
        position: { x: 300, y: 150 },
        area: 'Forest',
        respawnTime: 600, // 10 minutes
        isActive: true,
        level: 1,
        experience: 5,
        drops: [
          { resourceId: 'oak-wood', minAmount: 2, maxAmount: 5, chance: 100, experience: 5 }
        ]
      }
    ];

    // Store default data
    defaultRecipes.forEach(recipe => this.recipes.set(recipe.id, recipe));
    defaultNodes.forEach(node => this.resourceNodes.set(node.id, node));
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Connection management
  initializeSocket(): void {
    if (!this.socket || !this.isConnected) {
      this.initializeSocket();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isConnected(): boolean {
    return this.isConnected;
  }

  // Resource management
  async getResources(): Promise<Resource[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getResources', (response: { success: boolean; resources?: Resource[]; error?: string }) => {
        if (response.success && response.resources) {
          resolve(response.resources);
        } else {
          reject(new Error(response.error || 'Failed to get resources'));
        }
      });
    });
  }

  async getResourceNodes(): Promise<ResourceNode[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getResourceNodes', (response: { success: boolean; nodes?: ResourceNode[]; error?: string }) => {
        if (response.success && response.nodes) {
          resolve(response.nodes);
        } else {
          reject(new Error(response.error || 'Failed to get resource nodes'));
        }
      });
    });
  }

  async gatherResource(nodeId: string, userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('gatherResource', { nodeId, userId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to gather resource'));
        }
      });
    });
  }

  // Recipe management
  async getRecipes(): Promise<CraftingRecipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipeById(recipeId: string): Promise<CraftingRecipe | null> {
    return this.recipes.get(recipeId) || null;
  }

  async getRecipesByCategory(category: CraftingCategory): Promise<CraftingRecipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => recipe.category === category);
  }

  async getUnlockedRecipes(userId: string): Promise<CraftingRecipe[]> {
    return Array.from(this.recipes.values()).filter(recipe => recipe.isUnlocked);
  }

  // Crafting operations
  async startCrafting(recipeId: string, userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('startCrafting', { recipeId, userId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to start crafting'));
        }
      });
    });
  }

  async cancelCrafting(sessionId: string, userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('cancelCrafting', { sessionId, userId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to cancel crafting'));
        }
      });
    });
  }

  async getCraftingSessions(userId: string): Promise<CraftingSession[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getCraftingSessions', userId, (response: { success: boolean; sessions?: CraftingSession[]; error?: string }) => {
        if (response.success && response.sessions) {
          resolve(response.sessions);
        } else {
          reject(new Error(response.error || 'Failed to get crafting sessions'));
        }
      });
    });
  }

  // Inventory management
  async getInventory(userId: string): Promise<InventoryItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getInventory', userId, (response: { success: boolean; inventory?: InventoryItem[]; error?: string }) => {
        if (response.success && response.inventory) {
          resolve(response.inventory);
        } else {
          reject(new Error(response.error || 'Failed to get inventory'));
        }
      });
    });
  }

  async addToInventory(userId: string, item: InventoryItem): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('addToInventory', { userId, item }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to add to inventory'));
        }
      });
    });
  }

  async removeFromInventory(userId: string, itemId: string, amount: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('removeFromInventory', { userId, itemId, amount }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to remove from inventory'));
        }
      });
    });
  }

  // Skill management
  async getSkills(userId: string): Promise<CraftingSkill[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getSkills', userId, (response: { success: boolean; skills?: CraftingSkill[]; error?: string }) => {
        if (response.success && response.skills) {
          resolve(response.skills);
        } else {
          reject(new Error(response.error || 'Failed to get skills'));
        }
      });
    });
  }

  async getSkillByCategory(userId: string, category: CraftingCategory): Promise<CraftingSkill | null> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getSkillByCategory', { userId, category }, (response: { success: boolean; skill?: CraftingSkill; error?: string }) => {
        if (response.success) {
          resolve(response.skill || null);
        } else {
          reject(new Error(response.error || 'Failed to get skill'));
        }
      });
    });
  }

  // Statistics
  async getCraftingStats(userId: string): Promise<CraftingStats> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getCraftingStats', userId, (response: { success: boolean; stats?: CraftingStats; error?: string }) => {
        if (response.success && response.stats) {
          resolve(response.stats);
        } else {
          reject(new Error(response.error || 'Failed to get crafting stats'));
        }
      });
    });
  }

  async getResourceStats(userId: string): Promise<ResourceStats> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getResourceStats', userId, (response: { success: boolean; stats?: ResourceStats; error?: string }) => {
        if (response.success && response.stats) {
          resolve(response.stats);
        } else {
          reject(new Error(response.error || 'Failed to get resource stats'));
        }
      });
    });
  }

  // Leaderboards
  async getCraftingLeaderboard(category: CraftingCategory, period: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<CraftingLeaderboard> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getCraftingLeaderboard', { category, period }, (response: { success: boolean; leaderboard?: CraftingLeaderboard; error?: string }) => {
        if (response.success && response.leaderboard) {
          resolve(response.leaderboard);
        } else {
          reject(new Error(response.error || 'Failed to get crafting leaderboard'));
        }
      });
    });
  }

  async getResourceLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<ResourceLeaderboard> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getResourceLeaderboard', period, (response: { success: boolean; leaderboard?: ResourceLeaderboard; error?: string }) => {
        if (response.success && response.leaderboard) {
          resolve(response.leaderboard);
        } else {
          reject(new Error(response.error || 'Failed to get resource leaderboard'));
        }
      });
    });
  }

  // Notifications
  async getNotifications(userId: string): Promise<CraftingNotification[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getCraftingNotifications', userId, (response: { success: boolean; notifications?: CraftingNotification[]; error?: string }) => {
        if (response.success && response.notifications) {
          resolve(response.notifications);
        } else {
          reject(new Error(response.error || 'Failed to get notifications'));
        }
      });
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('markCraftingNotificationAsRead', notificationId, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to mark notification as read'));
        }
      });
    });
  }

  // Utility functions
  canCraftRecipe(recipe: CraftingRecipe, inventory: InventoryItem[]): boolean {
    return recipe.materials.every(material => {
      const item = inventory.find(i => i.resourceId === material.resourceId);
      return item && item.amount >= material.amount;
    });
  }

  getRequiredMaterials(recipe: CraftingRecipe, inventory: InventoryItem[]): { material: CraftingMaterial; available: number; required: number }[] {
    return recipe.materials.map(material => {
      const item = inventory.find(i => i.resourceId === material.resourceId);
      return {
        material,
        available: item ? item.amount : 0,
        required: material.amount
      };
    });
  }

  calculateCraftingTime(recipe: CraftingRecipe, skill: CraftingSkill): number {
    const baseTime = recipe.craftingTime;
    const skillBonus = Math.max(0, skill.level - recipe.level) * 0.1; // 10% reduction per level above requirement
    return Math.max(baseTime * 0.5, baseTime - (baseTime * skillBonus)); // Minimum 50% of base time
  }

  calculateSuccessChance(recipe: CraftingRecipe, skill: CraftingSkill): number {
    const baseChance = recipe.result.chance;
    const skillBonus = Math.max(0, skill.level - recipe.level) * 2; // 2% bonus per level above requirement
    return Math.min(100, baseChance + skillBonus);
  }

  getResourceRarityColor(rarity: ResourceRarity): string {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400'
    };
    return colors[rarity] || 'text-gray-400';
  }

  getResourceRarityBgColor(rarity: ResourceRarity): string {
    const colors = {
      common: 'bg-gray-500/20',
      uncommon: 'bg-green-500/20',
      rare: 'bg-blue-500/20',
      epic: 'bg-purple-500/20',
      legendary: 'bg-yellow-500/20'
    };
    return colors[rarity] || 'bg-gray-500/20';
  }

  formatCraftingTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  getSkillProgress(skill: CraftingSkill): number {
    return (skill.experience / skill.maxExperience) * 100;
  }

  getNextLevelExperience(skill: CraftingSkill): number {
    return skill.maxExperience - skill.experience;
  }
}

// Export singleton instance
export const craftingService = new CraftingService();
