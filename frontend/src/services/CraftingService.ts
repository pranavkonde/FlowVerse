import { io, Socket } from 'socket.io-client';
import {
  CraftingRecipe,
  ResourceNode,
  CraftingSkill,
  InventoryItem,
  CraftingSession,
  CraftingQueue,
  CraftingStation,
  ResourceGatheringSession,
  CraftingProgress,
  CraftingStats,
  CraftingCategory,
  CraftingDifficulty,
  ResourceType,
  ResourceRarity,
  ItemRarity,
  ItemQuality,
  CraftingStatus,
  GatheringStatus,
  CraftingStationType
} from '../types/crafting';

export class CraftingService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSocket();
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
    this.socket.on('craftingStarted', (session: CraftingSession) => {
      this.emit('craftingStarted', session);
    });

    this.socket.on('craftingProgress', (progress: CraftingProgress) => {
      this.emit('craftingProgress', progress);
    });

    this.socket.on('craftingCompleted', (session: CraftingSession) => {
      this.emit('craftingCompleted', session);
    });

    this.socket.on('craftingCancelled', (session: CraftingSession) => {
      this.emit('craftingCancelled', session);
    });

    this.socket.on('recipeUnlocked', (data: { userId: string; recipe: CraftingRecipe }) => {
      this.emit('recipeUnlocked', data);
    });

    this.socket.on('skillUpdated', (data: { userId: string; skill: CraftingSkill }) => {
      this.emit('skillUpdated', data);
    });

    this.socket.on('inventoryUpdated', (data: { userId: string; inventory: InventoryItem[] }) => {
      this.emit('inventoryUpdated', data);
    });

    this.socket.on('resourceHarvested', (data: { userId: string; nodeId: string; drops: any[] }) => {
      this.emit('resourceHarvested', data);
    });

    this.socket.on('resourceNodeRespawned', (node: ResourceNode) => {
      this.emit('resourceNodeRespawned', node);
    });
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

  // Crafting management
  async startCrafting(userId: string, recipeId: string, stationId?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('startCrafting', { userId, recipeId, stationId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to start crafting'));
        }
      });
    });
  }

  async cancelCraftingSession(userId: string, sessionId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('cancelCraftingSession', { userId, sessionId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to cancel crafting session'));
        }
      });
    });
  }

  async harvestResource(userId: string, nodeId: string, toolId?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('harvestResource', { userId, nodeId, toolId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to harvest resource'));
        }
      });
    });
  }

  async getUserRecipes(userId: string): Promise<CraftingRecipe[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getUserRecipes', userId, (response: { success: boolean; recipes?: CraftingRecipe[]; error?: string }) => {
        if (response.success && response.recipes) {
          resolve(response.recipes);
        } else {
          reject(new Error(response.error || 'Failed to get user recipes'));
        }
      });
    });
  }

  async getAvailableResourceNodes(): Promise<ResourceNode[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getAvailableResourceNodes', (response: { success: boolean; nodes?: ResourceNode[]; error?: string }) => {
        if (response.success && response.nodes) {
          resolve(response.nodes);
        } else {
          reject(new Error(response.error || 'Failed to get resource nodes'));
        }
      });
    });
  }

  async getUserInventory(userId: string): Promise<InventoryItem[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getUserInventory', userId, (response: { success: boolean; inventory?: InventoryItem[]; error?: string }) => {
        if (response.success && response.inventory) {
          resolve(response.inventory);
        } else {
          reject(new Error(response.error || 'Failed to get user inventory'));
        }
      });
    });
  }

  async getUserSkills(userId: string): Promise<CraftingSkill[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getUserSkills', userId, (response: { success: boolean; skills?: CraftingSkill[]; error?: string }) => {
        if (response.success && response.skills) {
          resolve(response.skills);
        } else {
          reject(new Error(response.error || 'Failed to get user skills'));
        }
      });
    });
  }

  async getCraftingStations(): Promise<CraftingStation[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getCraftingStations', (response: { success: boolean; stations?: CraftingStation[]; error?: string }) => {
        if (response.success && response.stations) {
          resolve(response.stations);
        } else {
          reject(new Error(response.error || 'Failed to get crafting stations'));
        }
      });
    });
  }

  async getUserCraftingQueue(userId: string): Promise<CraftingQueue | null> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getUserCraftingQueue', userId, (response: { success: boolean; queue?: CraftingQueue; error?: string }) => {
        if (response.success) {
          resolve(response.queue || null);
        } else {
          reject(new Error(response.error || 'Failed to get crafting queue'));
        }
      });
    });
  }

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

  // Utility functions
  canCraftRecipe(recipe: CraftingRecipe, userSkills: CraftingSkill[], inventory: InventoryItem[]): boolean {
    // Check skill requirements
    const skill = userSkills.find(s => s.id === recipe.requiredSkill);
    if (!skill || skill.level < recipe.requiredSkillLevel) {
      return false;
    }

    // Check material requirements
    for (const ingredient of recipe.ingredients) {
      const item = inventory.find(i => i.itemId === ingredient.itemId);
      if (!item || item.quantity < ingredient.quantity) {
        return false;
      }
    }

    return true;
  }

  getRecipeDifficultyColor(difficulty: CraftingDifficulty): string {
    const colors = {
      'beginner': 'text-green-500',
      'novice': 'text-blue-500',
      'intermediate': 'text-yellow-500',
      'advanced': 'text-orange-500',
      'expert': 'text-red-500',
      'master': 'text-purple-500'
    };
    return colors[difficulty] || 'text-gray-500';
  }

  getRarityColor(rarity: ItemRarity): string {
    const colors = {
      'common': 'text-gray-400',
      'uncommon': 'text-green-400',
      'rare': 'text-blue-400',
      'epic': 'text-purple-400',
      'legendary': 'text-orange-400',
      'mythic': 'text-red-400'
    };
    return colors[rarity] || 'text-gray-400';
  }

  getQualityColor(quality: ItemQuality): string {
    const colors = {
      'poor': 'text-gray-500',
      'common': 'text-white',
      'uncommon': 'text-green-300',
      'rare': 'text-blue-300',
      'epic': 'text-purple-300',
      'legendary': 'text-orange-300',
      'artifact': 'text-red-300'
    };
    return colors[quality] || 'text-white';
  }

  formatCraftingTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
        } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  getResourceTypeIcon(type: ResourceType): string {
    const icons = {
      'ore': '⛏️',
      'wood': '🪵',
      'herbs': '🌿',
      'gems': '💎',
      'leather': '🦌',
      'cloth': '🧵',
      'bone': '🦴',
      'crystal': '🔮',
      'essence': '✨',
      'food': '🍎'
    };
    return icons[type] || '📦';
  }

  getCraftingCategoryIcon(category: CraftingCategory): string {
    const icons = {
      'weapons': '⚔️',
      'armor': '🛡️',
      'tools': '🔧',
      'consumables': '🧪',
      'materials': '📦',
      'decorations': '🎨',
      'jewelry': '💍',
      'potions': '🧪',
      'food': '🍎',
      'clothing': '👕',
      'furniture': '🪑',
      'vehicles': '🚗'
    };
    return icons[category] || '🔨';
  }

  getCraftingStationIcon(type: CraftingStationType): string {
    const icons = {
      'forge': '🔥',
      'workbench': '🔨',
      'alchemy_table': '🧪',
      'cooking_stove': '🍳',
      'sewing_machine': '🧵',
      'jewelry_bench': '💍',
      'engineering_station': '⚙️',
      'enchanting_table': '✨',
      'garden_plot': '🌱',
      'fishing_spot': '🎣'
    };
    return icons[type] || '🔧';
  }

  calculateItemValue(item: InventoryItem): number {
    let baseValue = item.value;
    
    // Apply quality multiplier
    const qualityMultipliers = {
      'poor': 0.5,
      'common': 1.0,
      'uncommon': 1.5,
      'rare': 2.0,
      'epic': 3.0,
      'legendary': 5.0,
      'artifact': 10.0
    };
    
    const qualityMultiplier = qualityMultipliers[item.quality] || 1.0;
    baseValue *= qualityMultiplier;
    
    // Apply rarity multiplier
    const rarityMultipliers = {
      'common': 1.0,
      'uncommon': 1.2,
      'rare': 1.5,
      'epic': 2.0,
      'legendary': 3.0,
      'mythic': 5.0
    };
    
    const rarityMultiplier = rarityMultipliers[item.rarity] || 1.0;
    baseValue *= rarityMultiplier;
    
    return Math.floor(baseValue);
  }

  getSkillProgressPercentage(skill: CraftingSkill): number {
    if (skill.level >= skill.maxLevel) return 100;
    return Math.floor((skill.experience / skill.experienceToNext) * 100);
  }

  getResourceNodeStatus(node: ResourceNode): string {
    if (!node.isActive) {
      if (node.lastHarvested) {
        const now = new Date();
        const elapsed = (now.getTime() - node.lastHarvested.getTime()) / 1000;
        const remaining = Math.max(0, node.respawnTime - elapsed);
        return `Respawns in ${this.formatCraftingTime(remaining)}`;
      }
      return 'Depleted';
    }
    return 'Available';
  }

  canHarvestResource(node: ResourceNode, userLevel: number, toolId?: string): boolean {
    if (!node.isActive) return false;
    if (userLevel < node.requiredLevel) return false;
    if (node.requiredTool && toolId !== node.requiredTool) return false;
    return true;
  }

  getResourceNodeRarityColor(rarity: ResourceRarity): string {
    const colors = {
      'common': 'text-gray-400',
      'uncommon': 'text-green-400',
      'rare': 'text-blue-400',
      'epic': 'text-purple-400',
      'legendary': 'text-orange-400',
      'mythic': 'text-red-400'
    };
    return colors[rarity] || 'text-gray-400';
  }

  sortInventoryByCategory(inventory: InventoryItem[]): Record<string, InventoryItem[]> {
    const sorted: Record<string, InventoryItem[]> = {};
    
    inventory.forEach(item => {
      const category = item.metadata.category;
      if (!sorted[category]) {
        sorted[category] = [];
      }
      sorted[category].push(item);
    });
    
    return sorted;
  }

  searchInventory(inventory: InventoryItem[], query: string): InventoryItem[] {
    if (!query.trim()) return inventory;
    
    const lowercaseQuery = query.toLowerCase();
    return inventory.filter(item => 
      item.itemName.toLowerCase().includes(lowercaseQuery) ||
      item.metadata.description.toLowerCase().includes(lowercaseQuery) ||
      item.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  filterRecipesByCategory(recipes: CraftingRecipe[], category: CraftingCategory | 'all'): CraftingRecipe[] {
    if (category === 'all') return recipes;
    return recipes.filter(recipe => recipe.category === category);
  }

  filterRecipesByDifficulty(recipes: CraftingRecipe[], difficulty: CraftingDifficulty | 'all'): CraftingRecipe[] {
    if (difficulty === 'all') return recipes;
    return recipes.filter(recipe => recipe.difficulty === difficulty);
  }

  getCraftingSessionProgress(session: CraftingSession): number {
    return session.progress;
  }

  getCraftingSessionTimeRemaining(session: CraftingSession): number {
    if (session.status !== 'in_progress') return 0;
    
    const now = new Date();
    const elapsed = (now.getTime() - session.startTime.getTime()) / 1000;
    // This would need to be calculated based on the recipe's crafting time
    return Math.max(0, 30 - elapsed); // Assuming 30 seconds for now
  }
}

// Export singleton instance
export const craftingService = new CraftingService();