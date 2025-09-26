import { EventEmitter } from 'events';
import { 
  LandPlot, 
  Building, 
  LandResource, 
  Decoration, 
  LandPermission,
  LandType,
  BuildingType,
  ResourceType,
  DecorationType,
  LAND_EVENTS,
  LAND_NOTIFICATIONS
} from '../types/land';

export class LandService extends EventEmitter {
  private landPlots: Map<string, LandPlot> = new Map();
  private buildings: Map<string, Building> = new Map();
  private resources: Map<string, LandResource> = new Map();
  private decorations: Map<string, Decoration> = new Map();
  private userLands: Map<string, Set<string>> = new Map();
  private userBuildings: Map<string, Set<string>> = new Map();

  constructor() {
    super();
    this.initializeDefaultLands();
    this.startResourceRegeneration();
    this.startProductionCycle();
  }

  // Land Management
  async purchaseLand(landData: Partial<LandPlot>, buyerId: string, buyerAddress: string): Promise<LandPlot> {
    const land: LandPlot = {
      id: this.generateId(),
      tokenId: this.generateTokenId(),
      ownerId: buyerId,
      ownerAddress: buyerAddress,
      coordinates: landData.coordinates || { x: 0, y: 0, z: 0, world: 'main', region: 'central', chunk: '0,0', gridPosition: '0,0,0' },
      size: landData.size || { width: 100, height: 100, depth: 100, area: 10000, volume: 1000000 },
      type: landData.type || 'residential',
      rarity: landData.rarity || 'common',
      isActive: true,
      isForSale: false,
      isRentable: false,
      buildings: [],
      resources: landData.resources || [],
      decorations: [],
      permissions: [],
      metadata: landData.metadata || {
        description: 'A new land plot',
        tags: [],
        category: 'residential',
        isTradeable: true,
        isSellable: true,
        baseValue: 1000,
        marketValue: 1000,
        customizations: [],
        history: [],
        achievements: [],
        badges: []
      },
      blockchainData: landData.blockchainData || {
        contractAddress: '0x0000000000000000000000000000000000000000',
        tokenId: this.generateTokenId(),
        transactionHash: this.generateTransactionHash(),
        blockNumber: 0,
        gasUsed: 0,
        gasPrice: 0,
        network: 'mainnet',
        isVerified: false,
        metadata: {
          description: 'Land NFT',
          attributes: []
        }
      },
      createdAt: new Date(),
      lastModified: new Date()
    };

    this.landPlots.set(land.id, land);
    this.userLands.set(buyerId, (this.userLands.get(buyerId) || new Set()).add(land.id));
    
    this.emit(LAND_EVENTS.LAND_PURCHASED, land);
    return land;
  }

  async sellLand(landId: string, sellerId: string, buyerId: string, price: number): Promise<boolean> {
    const land = this.landPlots.get(landId);
    if (!land || land.ownerId !== sellerId) return false;

    // Update ownership
    land.ownerId = buyerId;
    land.isForSale = false;
    land.salePrice = undefined;
    land.lastModified = new Date();

    // Update user land mappings
    const sellerLands = this.userLands.get(sellerId);
    if (sellerLands) {
      sellerLands.delete(landId);
    }
    this.userLands.set(buyerId, (this.userLands.get(buyerId) || new Set()).add(landId));

    // Add to history
    land.metadata.history.push({
      id: this.generateId(),
      action: 'sold',
      userId: sellerId,
      username: 'Unknown',
      description: `Land sold for ${price} tokens`,
      timestamp: new Date(),
      metadata: {
        action: 'sold',
        details: { price, buyerId },
        location: land.coordinates.gridPosition,
        timestamp: new Date()
      }
    });

    this.emit(LAND_EVENTS.LAND_SOLD, { land, sellerId, buyerId, price });
    return true;
  }

  async rentLand(landId: string, renterId: string, duration: number, price: number): Promise<boolean> {
    const land = this.landPlots.get(landId);
    if (!land || !land.isRentable || land.currentRenter) return false;

    land.currentRenter = renterId;
    land.rentExpiry = new Date(Date.now() + duration);
    land.lastModified = new Date();

    // Add to history
    land.metadata.history.push({
      id: this.generateId(),
      action: 'rented',
      userId: renterId,
      username: 'Unknown',
      description: `Land rented for ${duration}ms at ${price} tokens`,
      timestamp: new Date(),
      metadata: {
        action: 'rented',
        details: { duration, price, renterId },
        location: land.coordinates.gridPosition,
        timestamp: new Date()
      }
    });

    this.emit(LAND_EVENTS.LAND_RENTED, { land, renterId, duration, price });
    return true;
  }

  // Building Management
  async constructBuilding(landId: string, buildingData: Partial<Building>, constructorId: string): Promise<Building> {
    const land = this.landPlots.get(landId);
    if (!land) throw new Error('Land not found');

    if (land.ownerId !== constructorId && land.currentRenter !== constructorId) {
      throw new Error('Insufficient permissions to construct building');
    }

    const building: Building = {
      id: this.generateId(),
      name: buildingData.name || 'New Building',
      type: buildingData.type || 'house',
      category: buildingData.category || 'residential',
      level: 1,
      maxLevel: buildingData.maxLevel || 5,
      coordinates: buildingData.coordinates || { x: 0, y: 0, z: 0, rotation: 0, scale: 1 },
      size: buildingData.size || { width: 10, height: 10, depth: 10, area: 100, volume: 1000 },
      isActive: true,
      isConstructed: false,
      constructionProgress: 0,
      constructionTime: buildingData.constructionTime || 3600000, // 1 hour default
      constructionStartTime: new Date(),
      constructionEndTime: new Date(Date.now() + (buildingData.constructionTime || 3600000)),
      resources: buildingData.resources || [],
      production: buildingData.production || [],
      storage: buildingData.storage || [],
      workers: [],
      upgrades: buildingData.upgrades || [],
      effects: buildingData.effects || [],
      requirements: buildingData.requirements || [],
      metadata: buildingData.metadata || {
        description: 'A new building',
        tags: [],
        category: 'residential',
        isTradeable: true,
        isSellable: true,
        baseValue: 500,
        marketValue: 500,
        customizations: []
      },
      blockchainData: buildingData.blockchainData || {
        contractAddress: '0x0000000000000000000000000000000000000000',
        tokenId: this.generateTokenId(),
        transactionHash: this.generateTransactionHash(),
        blockNumber: 0,
        gasUsed: 0,
        gasPrice: 0,
        network: 'mainnet',
        isVerified: false,
        metadata: {
          description: 'Building NFT',
          attributes: []
        }
      },
      createdAt: new Date(),
      lastModified: new Date()
    };

    this.buildings.set(building.id, building);
    land.buildings.push(building.id);
    this.userBuildings.set(constructorId, (this.userBuildings.get(constructorId) || new Set()).add(building.id));

    this.emit(LAND_EVENTS.BUILDING_CONSTRUCTED, { building, landId, constructorId });
    return building;
  }

  async demolishBuilding(buildingId: string, demolisherId: string): Promise<boolean> {
    const building = this.buildings.get(buildingId);
    if (!building) return false;

    // Find the land that contains this building
    let landId: string | null = null;
    for (const [id, land] of this.landPlots.entries()) {
      if (land.buildings.includes(buildingId)) {
        landId = id;
        break;
      }
    }

    if (!landId) return false;

    const land = this.landPlots.get(landId);
    if (!land) return false;

    if (land.ownerId !== demolisherId && land.currentRenter !== demolisherId) {
      throw new Error('Insufficient permissions to demolish building');
    }

    // Remove building from land
    land.buildings = land.buildings.filter(id => id !== buildingId);
    land.lastModified = new Date();

    // Remove building from user's buildings
    const userBuildings = this.userBuildings.get(demolisherId);
    if (userBuildings) {
      userBuildings.delete(buildingId);
    }

    this.buildings.delete(buildingId);
    this.emit(LAND_EVENTS.BUILDING_DEMOLISHED, { building, landId, demolisherId });
    return true;
  }

  async upgradeBuilding(buildingId: string, upgradeData: Partial<Building>, upgraderId: string): Promise<Building | null> {
    const building = this.buildings.get(buildingId);
    if (!building) return null;

    // Find the land that contains this building
    let landId: string | null = null;
    for (const [id, land] of this.landPlots.entries()) {
      if (land.buildings.includes(buildingId)) {
        landId = id;
        break;
      }
    }

    if (!landId) return null;

    const land = this.landPlots.get(landId);
    if (!land) return null;

    if (land.ownerId !== upgraderId && land.currentRenter !== upgraderId) {
      throw new Error('Insufficient permissions to upgrade building');
    }

    if (building.level >= building.maxLevel) {
      throw new Error('Building is already at maximum level');
    }

    // Upgrade building
    building.level++;
    building.lastModified = new Date();

    // Update construction time for next level
    building.constructionTime = building.constructionTime * 1.5; // 50% increase per level

    this.emit(LAND_EVENTS.BUILDING_UPGRADED, { building, landId, upgraderId });
    return building;
  }

  // Resource Management
  async harvestResource(resourceId: string, harvesterId: string, amount: number): Promise<number> {
    const resource = this.resources.get(resourceId);
    if (!resource) return 0;

    if (amount > resource.amount) {
      amount = resource.amount;
    }

    resource.amount -= amount;
    resource.lastHarvested = new Date();

    this.emit(LAND_EVENTS.RESOURCE_HARVESTED, { resource, harvesterId, amount });
    return amount;
  }

  async regenerateResource(resourceId: string): Promise<void> {
    const resource = this.resources.get(resourceId);
    if (!resource || !resource.isRenewable) return;

    const now = new Date();
    const timeSinceLastHarvest = now.getTime() - resource.lastHarvested.getTime();
    const regenerationAmount = (timeSinceLastHarvest / 1000) * resource.regenerationRate;

    if (regenerationAmount > 0) {
      resource.amount = Math.min(resource.maxAmount, resource.amount + regenerationAmount);
      resource.lastHarvested = now;
    }

    this.emit(LAND_EVENTS.RESOURCE_REGENERATED, { resource });
  }

  // Decoration Management
  async placeDecoration(landId: string, decorationData: Partial<Decoration>, placerId: string): Promise<Decoration> {
    const land = this.landPlots.get(landId);
    if (!land) throw new Error('Land not found');

    if (land.ownerId !== placerId && land.currentRenter !== placerId) {
      throw new Error('Insufficient permissions to place decoration');
    }

    const decoration: Decoration = {
      id: this.generateId(),
      name: decorationData.name || 'New Decoration',
      type: decorationData.type || 'furniture',
      category: decorationData.category || 'decorative',
      coordinates: decorationData.coordinates || { x: 0, y: 0, z: 0, rotation: 0, scale: 1 },
      size: decorationData.size || { width: 1, height: 1, depth: 1 },
      isActive: true,
      effects: decorationData.effects || [],
      requirements: decorationData.requirements || [],
      metadata: decorationData.metadata || {
        icon: '🎨',
        description: 'A decorative item',
        tags: [],
        category: 'decorative',
        isTradeable: true,
        isSellable: true,
        baseValue: 50
      },
      blockchainData: decorationData.blockchainData || {
        contractAddress: '0x0000000000000000000000000000000000000000',
        tokenId: this.generateTokenId(),
        transactionHash: this.generateTransactionHash(),
        blockNumber: 0,
        gasUsed: 0,
        gasPrice: 0,
        network: 'mainnet',
        isVerified: false,
        metadata: {
          description: 'Decoration NFT',
          attributes: []
        }
      },
      createdAt: new Date()
    };

    this.decorations.set(decoration.id, decoration);
    land.decorations.push(decoration.id);
    land.lastModified = new Date();

    this.emit(LAND_EVENTS.DECORATION_PLACED, { decoration, landId, placerId });
    return decoration;
  }

  async removeDecoration(decorationId: string, removerId: string): Promise<boolean> {
    const decoration = this.decorations.get(decorationId);
    if (!decoration) return false;

    // Find the land that contains this decoration
    let landId: string | null = null;
    for (const [id, land] of this.landPlots.entries()) {
      if (land.decorations.includes(decorationId)) {
        landId = id;
        break;
      }
    }

    if (!landId) return false;

    const land = this.landPlots.get(landId);
    if (!land) return false;

    if (land.ownerId !== removerId && land.currentRenter !== removerId) {
      throw new Error('Insufficient permissions to remove decoration');
    }

    // Remove decoration from land
    land.decorations = land.decorations.filter(id => id !== decorationId);
    land.lastModified = new Date();

    this.decorations.delete(decorationId);
    this.emit(LAND_EVENTS.DECORATION_REMOVED, { decoration, landId, removerId });
    return true;
  }

  // Permission Management
  async grantPermission(landId: string, permissionData: Partial<LandPermission>, granterId: string): Promise<LandPermission> {
    const land = this.landPlots.get(landId);
    if (!land) throw new Error('Land not found');

    if (land.ownerId !== granterId) {
      throw new Error('Only land owner can grant permissions');
    }

    const permission: LandPermission = {
      id: this.generateId(),
      type: permissionData.type || 'visitor',
      userId: permissionData.userId || '',
      username: permissionData.username || 'Unknown',
      permissions: permissionData.permissions || [],
      grantedBy: granterId,
      grantedAt: new Date(),
      expiresAt: permissionData.expiresAt,
      isActive: true
    };

    land.permissions.push(permission);
    land.lastModified = new Date();

    this.emit(LAND_EVENTS.PERMISSION_GRANTED, { permission, landId, granterId });
    return permission;
  }

  async revokePermission(permissionId: string, revokerId: string): Promise<boolean> {
    // Find the land that contains this permission
    let landId: string | null = null;
    for (const [id, land] of this.landPlots.entries()) {
      if (land.permissions.some(p => p.id === permissionId)) {
        landId = id;
        break;
      }
    }

    if (!landId) return false;

    const land = this.landPlots.get(landId);
    if (!land) return false;

    if (land.ownerId !== revokerId) {
      throw new Error('Only land owner can revoke permissions');
    }

    const permission = land.permissions.find(p => p.id === permissionId);
    if (!permission) return false;

    land.permissions = land.permissions.filter(p => p.id !== permissionId);
    land.lastModified = new Date();

    this.emit(LAND_EVENTS.PERMISSION_REVOKED, { permission, landId, revokerId });
    return true;
  }

  // Query Methods
  async getLands(filters?: { type?: LandType; isForSale?: boolean; isRentable?: boolean; ownerId?: string }): Promise<LandPlot[]> {
    let lands = Array.from(this.landPlots.values());
    
    if (filters) {
      if (filters.type) lands = lands.filter(l => l.type === filters.type);
      if (filters.isForSale !== undefined) lands = lands.filter(l => l.isForSale === filters.isForSale);
      if (filters.isRentable !== undefined) lands = lands.filter(l => l.isRentable === filters.isRentable);
      if (filters.ownerId) lands = lands.filter(l => l.ownerId === filters.ownerId);
    }
    
    return lands.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserLands(userId: string): Promise<LandPlot[]> {
    const userLandIds = this.userLands.get(userId) || new Set();
    return Array.from(userLandIds).map(id => this.landPlots.get(id)).filter(Boolean) as LandPlot[];
  }

  async getBuildings(filters?: { type?: BuildingType; category?: string; isConstructed?: boolean }): Promise<Building[]> {
    let buildings = Array.from(this.buildings.values());
    
    if (filters) {
      if (filters.type) buildings = buildings.filter(b => b.type === filters.type);
      if (filters.category) buildings = buildings.filter(b => b.category === filters.category);
      if (filters.isConstructed !== undefined) buildings = buildings.filter(b => b.isConstructed === filters.isConstructed);
    }
    
    return buildings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserBuildings(userId: string): Promise<Building[]> {
    const userBuildingIds = this.userBuildings.get(userId) || new Set();
    return Array.from(userBuildingIds).map(id => this.buildings.get(id)).filter(Boolean) as Building[];
  }

  // Private Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateTokenId(): string {
    return '0x' + Math.random().toString(16).substr(2, 8) + Date.now().toString(16);
  }

  private generateTransactionHash(): string {
    return '0x' + Math.random().toString(16).substr(2, 64);
  }

  private initializeDefaultLands(): void {
    // Create some default land plots for demonstration
    const defaultLands = [
      {
        coordinates: { x: 0, y: 0, z: 0, world: 'main', region: 'central', chunk: '0,0', gridPosition: '0,0,0' },
        size: { width: 100, height: 100, depth: 100, area: 10000, volume: 1000000 },
        type: 'residential' as LandType,
        rarity: 'common' as const,
        resources: [
          {
            id: 'wood-1',
            type: 'wood' as ResourceType,
            name: 'Oak Wood',
            amount: 1000,
            maxAmount: 1000,
            regenerationRate: 0.1,
            lastHarvested: new Date(),
            quality: 'good' as const,
            rarity: 'common' as const,
            isRenewable: true,
            harvestRequirements: [],
            metadata: {
              icon: '🌳',
              description: 'High-quality oak wood',
              tags: ['wood', 'oak', 'building'],
              category: 'material',
              isTradeable: true,
              isSellable: true,
              baseValue: 10
            }
          }
        ],
        metadata: {
          description: 'A peaceful residential area with oak trees',
          tags: ['residential', 'peaceful', 'oak'],
          category: 'residential',
          isTradeable: true,
          isSellable: true,
          baseValue: 1000,
          marketValue: 1000,
          customizations: [],
          history: [],
          achievements: [],
          badges: []
        }
      }
    ];

    defaultLands.forEach(landData => {
      this.purchaseLand(landData, 'system', '0x0000000000000000000000000000000000000000');
    });
  }

  private startResourceRegeneration(): void {
    // Regenerate resources every 5 minutes
    setInterval(() => {
      for (const resource of this.resources.values()) {
        this.regenerateResource(resource.id);
      }
    }, 300000); // 5 minutes
  }

  private startProductionCycle(): void {
    // Update building production every minute
    setInterval(() => {
      for (const building of this.buildings.values()) {
        if (building.isConstructed && building.production.length > 0) {
          // Update production
          for (const production of building.production) {
            const now = new Date();
            const timeSinceLastProduction = now.getTime() - production.lastProduced.getTime();
            const productionAmount = (timeSinceLastProduction / 1000) * production.rate * production.efficiency;

            if (productionAmount > 0) {
              production.amount += productionAmount;
              production.lastProduced = now;
            }
          }
        }
      }
    }, 60000); // 1 minute
  }
}

export default LandService;
