import { Server as SocketIOServer } from 'socket.io';
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
  CraftingSkill as SkillType,
  ResourceType,
  ResourceRarity,
  ItemRarity,
  ItemQuality,
  BonusType,
  RequirementType,
  CraftingStatus,
  GatheringStatus,
  CraftingStationType
} from '../types/crafting';

export class CraftingService {
  private recipes: Map<string, CraftingRecipe> = new Map();
  private resourceNodes: Map<string, ResourceNode> = new Map();
  private userSkills: Map<string, Map<string, CraftingSkill>> = new Map();
  private userInventories: Map<string, InventoryItem[]> = new Map();
  private craftingSessions: Map<string, CraftingSession> = new Map();
  private craftingQueues: Map<string, CraftingQueue> = new Map();
  private craftingStations: Map<string, CraftingStation> = new Map();
  private gatheringSessions: Map<string, ResourceGatheringSession> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.initializeDefaultRecipes();
    this.initializeResourceNodes();
    this.initializeCraftingStations();
    this.startCraftingScheduler();
  }

  // Initialize default recipes
  private initializeDefaultRecipes(): void {
    const defaultRecipes: CraftingRecipe[] = [
      {
        id: 'iron-sword',
        name: 'Iron Sword',
        description: 'A sturdy iron sword for combat',
        category: 'weapons',
        difficulty: 'beginner',
        requiredLevel: 5,
        requiredSkill: 'blacksmithing',
        requiredSkillLevel: 1,
        ingredients: [
          {
            itemId: 'iron-ore',
            itemName: 'Iron Ore',
            quantity: 3,
            rarity: 'common',
            isConsumed: true
          },
          {
            itemId: 'wood-plank',
            itemName: 'Wood Plank',
            quantity: 1,
            rarity: 'common',
            isConsumed: true
          }
        ],
        result: {
          itemId: 'iron-sword',
          itemName: 'Iron Sword',
          quantity: 1,
          rarity: 'common',
          quality: 'common',
          durability: 100,
          maxDurability: 100,
          stats: {
            attack: 15,
            defense: 2
          }
        },
        craftingTime: 30,
        experienceReward: 50,
        isUnlocked: true,
        metadata: {
          tags: ['weapon', 'sword', 'iron'],
          imageUrl: '/images/items/iron-sword.jpg',
          soundEffect: 'hammer-strike.mp3',
          specialEffects: ['sparks'],
          isTradeable: true,
          isSellable: true,
          baseValue: 100,
          category: 'weapons'
        }
      },
      {
        id: 'health-potion',
        name: 'Health Potion',
        description: 'Restores health when consumed',
        category: 'potions',
        difficulty: 'beginner',
        requiredLevel: 3,
        requiredSkill: 'alchemy',
        requiredSkillLevel: 1,
        ingredients: [
          {
            itemId: 'healing-herb',
            itemName: 'Healing Herb',
            quantity: 2,
            rarity: 'common',
            isConsumed: true
          },
          {
            itemId: 'water-vial',
            itemName: 'Water Vial',
            quantity: 1,
            rarity: 'common',
            isConsumed: true
          }
        ],
        result: {
          itemId: 'health-potion',
          itemName: 'Health Potion',
          quantity: 1,
          rarity: 'common',
          quality: 'common',
          stats: {
            health: 50
          }
        },
        craftingTime: 15,
        experienceReward: 25,
        isUnlocked: true,
        metadata: {
          tags: ['potion', 'healing', 'consumable'],
          imageUrl: '/images/items/health-potion.jpg',
          soundEffect: 'bubble.mp3',
          specialEffects: ['glow'],
          isTradeable: true,
          isSellable: true,
          baseValue: 25,
          category: 'potions'
        }
      },
      {
        id: 'leather-armor',
        name: 'Leather Armor',
        description: 'Basic leather armor for protection',
        category: 'armor',
        difficulty: 'novice',
        requiredLevel: 8,
        requiredSkill: 'tailoring',
        requiredSkillLevel: 2,
        ingredients: [
          {
            itemId: 'leather',
            itemName: 'Leather',
            quantity: 4,
            rarity: 'common',
            isConsumed: true
          },
          {
            itemId: 'thread',
            itemName: 'Thread',
            quantity: 2,
            rarity: 'common',
            isConsumed: true
          }
        ],
        result: {
          itemId: 'leather-armor',
          itemName: 'Leather Armor',
          quantity: 1,
          rarity: 'common',
          quality: 'common',
          durability: 80,
          maxDurability: 80,
          stats: {
            defense: 12,
            speed: -1
          }
        },
        craftingTime: 45,
        experienceReward: 75,
        isUnlocked: true,
        metadata: {
          tags: ['armor', 'leather', 'protection'],
          imageUrl: '/images/items/leather-armor.jpg',
          soundEffect: 'sewing.mp3',
          specialEffects: ['stitch'],
          isTradeable: true,
          isSellable: true,
          baseValue: 150,
          category: 'armor'
        }
      },
      {
        id: 'magic-ring',
        name: 'Magic Ring',
        description: 'A ring imbued with magical properties',
        category: 'jewelry',
        difficulty: 'intermediate',
        requiredLevel: 12,
        requiredSkill: 'jewelry',
        requiredSkillLevel: 3,
        ingredients: [
          {
            itemId: 'silver-ore',
            itemName: 'Silver Ore',
            quantity: 2,
            rarity: 'uncommon',
            isConsumed: true
          },
          {
            itemId: 'magic-crystal',
            itemName: 'Magic Crystal',
            quantity: 1,
            rarity: 'rare',
            isConsumed: true
          }
        ],
        result: {
          itemId: 'magic-ring',
          itemName: 'Magic Ring',
          quantity: 1,
          rarity: 'rare',
          quality: 'rare',
          durability: 200,
          maxDurability: 200,
          stats: {
            magic: 10,
            mana: 20
          }
        },
        craftingTime: 90,
        experienceReward: 150,
        isUnlocked: false,
        unlockRequirements: [
          {
            type: 'skill_level',
            value: 3,
            description: 'Jewelry skill level 3 required',
            isMet: false
          }
        ],
        metadata: {
          tags: ['jewelry', 'magic', 'ring'],
          imageUrl: '/images/items/magic-ring.jpg',
          soundEffect: 'magic-chime.mp3',
          specialEffects: ['magic-glow', 'sparkles'],
          isTradeable: true,
          isSellable: true,
          baseValue: 500,
          category: 'jewelry'
        }
      }
    ];

    defaultRecipes.forEach(recipe => {
      this.recipes.set(recipe.id, recipe);
    });
  }

  // Initialize resource nodes
  private initializeResourceNodes(): void {
    const defaultNodes: ResourceNode[] = [
      {
        id: 'iron-ore-node-1',
        name: 'Iron Ore Vein',
        type: 'ore',
        rarity: 'common',
        location: {
          x: 100,
          y: 200,
          mapId: 'main-world',
          area: 'mountain-region'
        },
        respawnTime: 300, // 5 minutes
        maxHarvests: 10,
        currentHarvests: 0,
        requiredTool: 'pickaxe',
        requiredLevel: 1,
        experienceReward: 10,
        possibleDrops: [
          {
            itemId: 'iron-ore',
            itemName: 'Iron Ore',
            dropRate: 0.8,
            minQuantity: 1,
            maxQuantity: 3,
            rarity: 'common'
          },
          {
            itemId: 'stone',
            itemName: 'Stone',
            dropRate: 0.6,
            minQuantity: 1,
            maxQuantity: 2,
            rarity: 'common'
          }
        ],
        isActive: true,
        metadata: {
          description: 'A rich vein of iron ore',
          imageUrl: '/images/resources/iron-ore-vein.jpg',
          soundEffect: 'mining.mp3',
          visualEffects: ['sparks'],
          seasonalAvailability: ['spring', 'summer', 'autumn', 'winter'],
          weatherDependency: []
        }
      },
      {
        id: 'healing-herb-patch-1',
        name: 'Healing Herb Patch',
        type: 'herbs',
        rarity: 'common',
        location: {
          x: 150,
          y: 300,
          mapId: 'main-world',
          area: 'forest-region'
        },
        respawnTime: 180, // 3 minutes
        maxHarvests: 5,
        currentHarvests: 0,
        requiredTool: 'sickle',
        requiredLevel: 1,
        experienceReward: 8,
        possibleDrops: [
          {
            itemId: 'healing-herb',
            itemName: 'Healing Herb',
            dropRate: 0.9,
            minQuantity: 1,
            maxQuantity: 2,
            rarity: 'common'
          },
          {
            itemId: 'wild-berries',
            itemName: 'Wild Berries',
            dropRate: 0.3,
            minQuantity: 1,
            maxQuantity: 1,
            rarity: 'common'
          }
        ],
        isActive: true,
        metadata: {
          description: 'A patch of healing herbs',
          imageUrl: '/images/resources/healing-herb-patch.jpg',
          soundEffect: 'harvest.mp3',
          visualEffects: ['leaves'],
          seasonalAvailability: ['spring', 'summer', 'autumn'],
          weatherDependency: ['sunny', 'cloudy']
        }
      },
      {
        id: 'ancient-tree-1',
        name: 'Ancient Oak Tree',
        type: 'wood',
        rarity: 'rare',
        location: {
          x: 300,
          y: 400,
          mapId: 'main-world',
          area: 'ancient-forest'
        },
        respawnTime: 600, // 10 minutes
        maxHarvests: 3,
        currentHarvests: 0,
        requiredTool: 'axe',
        requiredLevel: 5,
        experienceReward: 25,
        possibleDrops: [
          {
            itemId: 'oak-wood',
            itemName: 'Oak Wood',
            dropRate: 0.7,
            minQuantity: 2,
            maxQuantity: 4,
            rarity: 'uncommon'
          },
          {
            itemId: 'ancient-bark',
            itemName: 'Ancient Bark',
            dropRate: 0.4,
            minQuantity: 1,
            maxQuantity: 1,
            rarity: 'rare'
          }
        ],
        isActive: true,
        metadata: {
          description: 'An ancient oak tree with magical properties',
          imageUrl: '/images/resources/ancient-oak.jpg',
          soundEffect: 'tree-fall.mp3',
          visualEffects: ['magic-glow', 'falling-leaves'],
          seasonalAvailability: ['spring', 'summer', 'autumn', 'winter'],
          weatherDependency: []
        }
      }
    ];

    defaultNodes.forEach(node => {
      this.resourceNodes.set(node.id, node);
    });
  }

  // Initialize crafting stations
  private initializeCraftingStations(): void {
    const defaultStations: CraftingStation[] = [
      {
        id: 'forge-1',
        name: 'Master Forge',
        type: 'forge',
        location: {
          x: 200,
          y: 100,
          mapId: 'main-world',
          area: 'crafting-district'
        },
        requiredLevel: 1,
        availableRecipes: ['iron-sword', 'steel-sword', 'magic-sword'],
        bonuses: [
          {
            type: 'quality',
            value: 0.1,
            description: '10% quality bonus',
            isActive: true
          }
        ],
        isActive: true,
        metadata: {
          description: 'A master forge for metalworking',
          imageUrl: '/images/stations/forge.jpg',
          animationUrl: '/animations/forge-fire.mp4',
          soundEffect: 'forge-fire.mp3',
          specialEffects: ['fire', 'sparks'],
          capacity: 1,
          efficiency: 1.2
        }
      },
      {
        id: 'alchemy-table-1',
        name: 'Alchemy Table',
        type: 'alchemy_table',
        location: {
          x: 250,
          y: 150,
          mapId: 'main-world',
          area: 'crafting-district'
        },
        requiredLevel: 1,
        availableRecipes: ['health-potion', 'mana-potion', 'strength-potion'],
        bonuses: [
          {
            type: 'speed',
            value: 0.15,
            description: '15% speed bonus',
            isActive: true
          }
        ],
        isActive: true,
        metadata: {
          description: 'A mystical alchemy table',
          imageUrl: '/images/stations/alchemy-table.jpg',
          animationUrl: '/animations/alchemy-bubbles.mp4',
          soundEffect: 'alchemy-bubble.mp3',
          specialEffects: ['magic-glow', 'bubbles'],
          capacity: 2,
          efficiency: 1.0
        }
      }
    ];

    defaultStations.forEach(station => {
      this.craftingStations.set(station.id, station);
    });
  }

  // Start crafting scheduler
  private startCraftingScheduler(): void {
    setInterval(() => {
      this.updateCraftingSessions();
      this.updateResourceNodes();
    }, 1000); // Check every second
  }

  // Update crafting sessions
  private updateCraftingSessions(): void {
    this.craftingSessions.forEach((session, sessionId) => {
      if (session.status === 'in_progress') {
        const now = new Date();
        const elapsed = (now.getTime() - session.startTime.getTime()) / 1000;
        const recipe = this.recipes.get(session.recipeId);
        
        if (recipe && elapsed >= recipe.craftingTime) {
          this.completeCraftingSession(sessionId);
        } else {
          // Update progress
          session.progress = Math.min((elapsed / recipe!.craftingTime) * 100, 100);
          this.craftingSessions.set(sessionId, session);
          
          // Emit progress update
          this.io.emit('craftingProgress', {
            sessionId,
            progress: session.progress,
            timeRemaining: Math.max(0, recipe!.craftingTime - elapsed)
          });
        }
      }
    });
  }

  // Update resource nodes
  private updateResourceNodes(): void {
    this.resourceNodes.forEach((node, nodeId) => {
      if (!node.isActive && node.lastHarvested) {
        const now = new Date();
        const elapsed = (now.getTime() - node.lastHarvested.getTime()) / 1000;
        
        if (elapsed >= node.respawnTime) {
          node.isActive = true;
          node.currentHarvests = 0;
          this.resourceNodes.set(nodeId, node);
          this.io.emit('resourceNodeRespawned', node);
        }
      }
    });
  }

  // Complete crafting session
  private completeCraftingSession(sessionId: string): void {
    const session = this.craftingSessions.get(sessionId);
    if (!session) return;

    const recipe = this.recipes.get(session.recipeId);
    if (!recipe) return;

    session.status = 'completed';
    session.endTime = new Date();
    session.progress = 100;
    session.result = recipe.result;
    session.experienceGained = recipe.experienceReward;

    // Add result to user inventory
    this.addItemToInventory(session.userId, {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: recipe.result.itemId,
      itemName: recipe.result.itemName,
      quantity: recipe.result.quantity,
      rarity: recipe.result.rarity,
      quality: recipe.result.quality,
      durability: recipe.result.durability,
      maxDurability: recipe.result.maxDurability,
      stats: recipe.result.stats,
      metadata: recipe.metadata,
      acquiredAt: new Date(),
      isTradeable: recipe.metadata.isTradeable,
      isSellable: recipe.metadata.isSellable,
      value: recipe.metadata.baseValue
    });

    // Add experience to user skill
    this.addSkillExperience(session.userId, recipe.requiredSkill, recipe.experienceReward);

    this.craftingSessions.set(sessionId, session);
    this.io.emit('craftingCompleted', session);

    // Remove from queue
    const queue = this.craftingQueues.get(session.userId);
    if (queue) {
      queue.sessions = queue.sessions.filter(s => s.id !== sessionId);
      this.craftingQueues.set(session.userId, queue);
    }
  }

  // Add item to user inventory
  private addItemToInventory(userId: string, item: InventoryItem): void {
    const inventory = this.userInventories.get(userId) || [];
    
    // Check if item already exists and is stackable
    const existingItem = inventory.find(i => 
      i.itemId === item.itemId && 
      i.quality === item.quality && 
      i.rarity === item.rarity
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      inventory.push(item);
    }

    this.userInventories.set(userId, inventory);
    this.io.emit('inventoryUpdated', { userId, inventory });
  }

  // Add experience to user skill
  private addSkillExperience(userId: string, skillName: string, experience: number): void {
    const userSkills = this.userSkills.get(userId) || new Map();
    let skill = userSkills.get(skillName);

    if (!skill) {
      skill = {
        id: skillName,
        name: skillName,
        level: 1,
        experience: 0,
        experienceToNext: 100,
        maxLevel: 100,
        bonuses: [],
        unlockedRecipes: []
      };
    }

    skill.experience += experience;
    
    // Check for level up
    while (skill.experience >= skill.experienceToNext && skill.level < skill.maxLevel) {
      skill.experience -= skill.experienceToNext;
      skill.level++;
      skill.experienceToNext = Math.floor(skill.experienceToNext * 1.2);
      
      // Unlock new recipes
      this.unlockRecipesForSkill(userId, skillName, skill.level);
    }

    userSkills.set(skillName, skill);
    this.userSkills.set(userId, userSkills);
    this.io.emit('skillUpdated', { userId, skill });
  }

  // Unlock recipes for skill level
  private unlockRecipesForSkill(userId: string, skillName: string, level: number): void {
    const userSkills = this.userSkills.get(userId) || new Map();
    const skill = userSkills.get(skillName);
    if (!skill) return;

    this.recipes.forEach(recipe => {
      if (recipe.requiredSkill === skillName && 
          recipe.requiredSkillLevel <= level && 
          !skill.unlockedRecipes.includes(recipe.id)) {
        skill.unlockedRecipes.push(recipe.id);
        this.io.emit('recipeUnlocked', { userId, recipe });
      }
    });

    userSkills.set(skillName, skill);
    this.userSkills.set(userId, userSkills);
  }

  // Start crafting
  startCrafting(userId: string, recipeId: string, stationId?: string): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return false;

    // Check if user has required level and skill
    const userSkills = this.userSkills.get(userId) || new Map();
    const skill = userSkills.get(recipe.requiredSkill);
    if (!skill || skill.level < recipe.requiredSkillLevel) return false;

    // Check if user has required materials
    const inventory = this.userInventories.get(userId) || [];
    for (const ingredient of recipe.ingredients) {
      const item = inventory.find(i => i.itemId === ingredient.itemId);
      if (!item || item.quantity < ingredient.quantity) return false;
    }

    // Check station availability
    if (stationId) {
      const station = this.craftingStations.get(stationId);
      if (!station || !station.isActive || station.currentUser) return false;
      station.currentUser = userId;
      this.craftingStations.set(stationId, station);
    }

    // Consume materials
    for (const ingredient of recipe.ingredients) {
      if (ingredient.isConsumed) {
        const item = inventory.find(i => i.itemId === ingredient.itemId);
        if (item) {
          item.quantity -= ingredient.quantity;
          if (item.quantity <= 0) {
            const index = inventory.indexOf(item);
            inventory.splice(index, 1);
          }
        }
      }
    }
    this.userInventories.set(userId, inventory);

    // Create crafting session
    const session: CraftingSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      recipeId,
      startTime: new Date(),
      status: 'in_progress',
      progress: 0,
      quality: 'common',
      bonuses: [],
      materials: recipe.ingredients,
      experienceGained: 0
    };

    this.craftingSessions.set(session.id, session);

    // Add to queue
    const queue = this.craftingQueues.get(userId) || {
      userId,
      sessions: [],
      maxConcurrent: 1,
      isPaused: false
    };
    queue.sessions.push(session);
    this.craftingQueues.set(userId, queue);

    this.io.emit('craftingStarted', session);
    return true;
  }

  // Harvest resource node
  harvestResource(userId: string, nodeId: string, toolId?: string): boolean {
    const node = this.resourceNodes.get(nodeId);
    if (!node || !node.isActive) return false;

    // Check requirements
    if (node.requiredLevel > 1) { // Simplified level check
      return false;
    }

    // Check tool requirement
    if (node.requiredTool && toolId !== node.requiredTool) {
      return false;
    }

    // Generate drops
    const drops = this.generateResourceDrops(node);
    
    // Add drops to inventory
    drops.forEach(drop => {
      this.addItemToInventory(userId, {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemId: drop.itemId,
        itemName: drop.itemName,
        quantity: drop.quantity,
        rarity: drop.rarity,
        quality: 'common',
        metadata: {
          description: `Harvested ${drop.itemName}`,
          category: 'resource',
          tags: ['harvested', 'resource'],
          source: 'resource_gathering'
        },
        acquiredAt: new Date(),
        isTradeable: true,
        isSellable: true,
        value: this.getItemValue(drop.rarity)
      });
    });

    // Update node
    node.currentHarvests++;
    if (node.currentHarvests >= node.maxHarvests) {
      node.isActive = false;
      node.lastHarvested = new Date();
    }

    this.resourceNodes.set(nodeId, node);

    // Add experience
    this.addSkillExperience(userId, 'gardening', node.experienceReward);

    this.io.emit('resourceHarvested', { userId, nodeId, drops });
    return true;
  }

  // Generate resource drops
  private generateResourceDrops(node: ResourceNode): any[] {
    const drops: any[] = [];
    
    node.possibleDrops.forEach(drop => {
      if (Math.random() < drop.dropRate) {
        const quantity = Math.floor(Math.random() * (drop.maxQuantity - drop.minQuantity + 1)) + drop.minQuantity;
        drops.push({
          itemId: drop.itemId,
          itemName: drop.itemName,
          quantity,
          rarity: drop.rarity
        });
      }
    });

    return drops;
  }

  // Get item value based on rarity
  private getItemValue(rarity: string): number {
    const values = {
      'common': 10,
      'uncommon': 25,
      'rare': 50,
      'epic': 100,
      'legendary': 250,
      'mythic': 500
    };
    return values[rarity as keyof typeof values] || 10;
  }

  // Get user recipes
  getUserRecipes(userId: string): CraftingRecipe[] {
    const userSkills = this.userSkills.get(userId) || new Map();
    const recipes: CraftingRecipe[] = [];

    this.recipes.forEach(recipe => {
      const skill = userSkills.get(recipe.requiredSkill);
      if (skill && skill.unlockedRecipes.includes(recipe.id)) {
        recipes.push(recipe);
      }
    });

    return recipes;
  }

  // Get available resource nodes
  getAvailableResourceNodes(): ResourceNode[] {
    return Array.from(this.resourceNodes.values()).filter(node => node.isActive);
  }

  // Get user inventory
  getUserInventory(userId: string): InventoryItem[] {
    return this.userInventories.get(userId) || [];
  }

  // Get user skills
  getUserSkills(userId: string): CraftingSkill[] {
    const userSkills = this.userSkills.get(userId) || new Map();
    return Array.from(userSkills.values());
  }

  // Get crafting stations
  getCraftingStations(): CraftingStation[] {
    return Array.from(this.craftingStations.values());
  }

  // Get user crafting queue
  getUserCraftingQueue(userId: string): CraftingQueue | null {
    return this.craftingQueues.get(userId) || null;
  }

  // Cancel crafting session
  cancelCraftingSession(userId: string, sessionId: string): boolean {
    const session = this.craftingSessions.get(sessionId);
    if (!session || session.userId !== userId || session.status !== 'in_progress') {
      return false;
    }

    session.status = 'cancelled';
    session.endTime = new Date();
    this.craftingSessions.set(sessionId, session);

    // Return materials
    const inventory = this.userInventories.get(userId) || [];
    session.materials.forEach(material => {
      if (material.isConsumed) {
        this.addItemToInventory(userId, {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemId: material.itemId,
          itemName: material.itemName,
          quantity: material.quantity,
          rarity: material.rarity,
          quality: 'common',
          metadata: {
            description: `Returned ${material.itemName}`,
            category: 'material',
            tags: ['returned', 'material'],
            source: 'crafting_cancellation'
          },
          acquiredAt: new Date(),
          isTradeable: true,
          isSellable: true,
          value: this.getItemValue(material.rarity)
        });
      }
    });

    this.io.emit('craftingCancelled', session);
    return true;
  }

  // Get crafting stats
  getCraftingStats(userId: string): CraftingStats {
    const userSkills = this.userSkills.get(userId) || new Map();
    const inventory = this.userInventories.get(userId) || [];
    
    return {
      totalItemsCrafted: 0, // Would need to track this
      totalExperienceGained: Array.from(userSkills.values()).reduce((sum, skill) => sum + skill.experience, 0),
      favoriteCategory: 'weapons', // Would need to track this
      highestQuality: 'common', // Would need to track this
      totalTimeSpent: 0, // Would need to track this
      mostUsedRecipe: 'iron-sword', // Would need to track this
      skillLevels: Object.fromEntries(Array.from(userSkills.entries()).map(([name, skill]) => [name, skill.level])),
      achievements: [] // Would need to implement achievement system
    };
  }
}
