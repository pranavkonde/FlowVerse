import { EventEmitter } from 'events';
import { CraftingService } from './CraftingService';
import { LandService } from './LandService';
import { InventoryService } from './InventoryService';

export interface Crop {
  id: string;
  name: string;
  description: string;
  growthTime: number; // in milliseconds
  stages: {
    name: string;
    duration: number;
    imageUrl: string;
  }[];
  requirements: {
    level: number;
    tools?: string[];
    items?: { id: string; quantity: number }[];
  };
  yield: {
    itemId: string;
    name: string;
    baseQuantity: number;
    qualityMultiplier: number;
  };
  wateringInterval: number; // in milliseconds
  fertilizable: boolean;
  harvestable: boolean;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all';
}

export interface Plot {
  id: string;
  ownerId: string;
  position: { x: number; y: number };
  status: 'empty' | 'tilled' | 'planted' | 'ready';
  crop?: {
    id: string;
    plantedAt: Date;
    lastWatered: Date;
    lastFertilized?: Date;
    currentStage: number;
    quality: number; // 0-100
    diseased: boolean;
  };
}

export class FarmingService extends EventEmitter {
  private static instance: FarmingService;
  private plots: Map<string, Plot> = new Map();
  private crops: Map<string, Crop> = new Map();
  private growthIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor(
    private craftingService: CraftingService,
    private landService: LandService,
    private inventoryService: InventoryService
  ) {
    super();
    this.initializeDefaultCrops();
    this.startGrowthCycle();
  }

  static getInstance(
    craftingService: CraftingService,
    landService: LandService,
    inventoryService: InventoryService
  ): FarmingService {
    if (!FarmingService.instance) {
      FarmingService.instance = new FarmingService(
        craftingService,
        landService,
        inventoryService
      );
    }
    return FarmingService.instance;
  }

  private initializeDefaultCrops() {
    const defaultCrops: Crop[] = [
      {
        id: 'carrot',
        name: 'Carrot',
        description: 'A basic root vegetable, perfect for beginners',
        growthTime: 5 * 60 * 1000, // 5 minutes for testing (would be longer in production)
        stages: [
          { name: 'seed', duration: 1000, imageUrl: '/assets/crops/carrot_seed.png' },
          { name: 'sprout', duration: 2000, imageUrl: '/assets/crops/carrot_sprout.png' },
          { name: 'growing', duration: 1000, imageUrl: '/assets/crops/carrot_growing.png' },
          { name: 'mature', duration: 1000, imageUrl: '/assets/crops/carrot_mature.png' }
        ],
        requirements: {
          level: 1,
          tools: ['basic_hoe'],
          items: [{ id: 'carrot_seeds', quantity: 1 }]
        },
        yield: {
          itemId: 'carrot',
          name: 'Carrot',
          baseQuantity: 3,
          qualityMultiplier: 1.2
        },
        wateringInterval: 2 * 60 * 1000, // 2 minutes
        fertilizable: true,
        harvestable: true,
        season: 'spring'
      },
      {
        id: 'tomato',
        name: 'Tomato',
        description: 'A versatile fruit that grows on vines',
        growthTime: 8 * 60 * 1000, // 8 minutes for testing
        stages: [
          { name: 'seed', duration: 2000, imageUrl: '/assets/crops/tomato_seed.png' },
          { name: 'sprout', duration: 2000, imageUrl: '/assets/crops/tomato_sprout.png' },
          { name: 'growing', duration: 2000, imageUrl: '/assets/crops/tomato_growing.png' },
          { name: 'mature', duration: 2000, imageUrl: '/assets/crops/tomato_mature.png' }
        ],
        requirements: {
          level: 2,
          tools: ['basic_hoe'],
          items: [{ id: 'tomato_seeds', quantity: 1 }]
        },
        yield: {
          itemId: 'tomato',
          name: 'Tomato',
          baseQuantity: 4,
          qualityMultiplier: 1.3
        },
        wateringInterval: 3 * 60 * 1000, // 3 minutes
        fertilizable: true,
        harvestable: true,
        season: 'summer'
      }
      // Add more crops as needed
    ];

    defaultCrops.forEach(crop => this.crops.set(crop.id, crop));
  }

  private startGrowthCycle() {
    // Check crop growth every minute
    setInterval(() => {
      const now = new Date();
      
      this.plots.forEach((plot, plotId) => {
        if (plot.status !== 'planted' || !plot.crop) return;

        const crop = this.crops.get(plot.crop.id);
        if (!crop) return;

        // Calculate current stage
        const elapsedTime = now.getTime() - plot.crop.plantedAt.getTime();
        let totalStageDuration = 0;
        let currentStage = 0;

        for (let i = 0; i < crop.stages.length; i++) {
          totalStageDuration += crop.stages[i].duration;
          if (elapsedTime >= totalStageDuration) {
            currentStage = i + 1;
          }
        }

        // Update stage if changed
        if (currentStage !== plot.crop.currentStage) {
          plot.crop.currentStage = currentStage;
          this.emit('cropStageChanged', { plotId, stage: currentStage });
        }

        // Check if crop needs water
        const timeSinceWatered = now.getTime() - plot.crop.lastWatered.getTime();
        if (timeSinceWatered > crop.wateringInterval) {
          plot.crop.quality = Math.max(0, plot.crop.quality - 10);
          this.emit('cropNeedsWater', { plotId });
        }

        // Check if crop is ready to harvest
        if (elapsedTime >= crop.growthTime && plot.status !== 'ready') {
          plot.status = 'ready';
          this.emit('cropReady', { plotId, cropId: crop.id });
        }

        this.plots.set(plotId, plot);
      });
    }, 60000); // Check every minute
  }

  async createPlot(ownerId: string, position: { x: number; y: number }): Promise<Plot> {
    const plot: Plot = {
      id: crypto.randomUUID(),
      ownerId,
      position,
      status: 'empty'
    };

    this.plots.set(plot.id, plot);
    return plot;
  }

  async tillPlot(plotId: string, userId: string, toolId: string): Promise<boolean> {
    const plot = this.plots.get(plotId);
    if (!plot || plot.status !== 'empty' || plot.ownerId !== userId) {
      return false;
    }

    // Verify tool ownership and type
    // This would integrate with your inventory system
    
    plot.status = 'tilled';
    this.plots.set(plotId, plot);
    this.emit('plotTilled', { plotId, userId });
    return true;
  }

  async plantCrop(
    plotId: string,
    userId: string,
    cropId: string
  ): Promise<boolean> {
    const plot = this.plots.get(plotId);
    const crop = this.crops.get(cropId);

    if (
      !plot ||
      !crop ||
      plot.status !== 'tilled' ||
      plot.ownerId !== userId
    ) {
      return false;
    }

    // Verify requirements
    // This would integrate with your inventory and level systems

    plot.status = 'planted';
    plot.crop = {
      id: cropId,
      plantedAt: new Date(),
      lastWatered: new Date(),
      currentStage: 0,
      quality: 100,
      diseased: false
    };

    this.plots.set(plotId, plot);
    this.emit('cropPlanted', { plotId, cropId, userId });
    return true;
  }

  async waterCrop(plotId: string, userId: string): Promise<boolean> {
    const plot = this.plots.get(plotId);
    if (!plot || !plot.crop || plot.ownerId !== userId) {
      return false;
    }

    plot.crop.lastWatered = new Date();
    plot.crop.quality = Math.min(100, plot.crop.quality + 5);

    this.plots.set(plotId, plot);
    this.emit('cropWatered', { plotId, userId });
    return true;
  }

  async fertilizeCrop(
    plotId: string,
    userId: string,
    fertilizerId: string
  ): Promise<boolean> {
    const plot = this.plots.get(plotId);
    if (
      !plot ||
      !plot.crop ||
      plot.ownerId !== userId ||
      !plot.crop.lastFertilized
    ) {
      return false;
    }

    // Verify fertilizer ownership and apply effects
    // This would integrate with your inventory system

    plot.crop.lastFertilized = new Date();
    plot.crop.quality = Math.min(100, plot.crop.quality + 10);

    this.plots.set(plotId, plot);
    this.emit('cropFertilized', { plotId, userId, fertilizerId });
    return true;
  }

  async harvestCrop(plotId: string, userId: string): Promise<boolean> {
    const plot = this.plots.get(plotId);
    if (!plot || !plot.crop || plot.status !== 'ready' || plot.ownerId !== userId) {
      return false;
    }

    const crop = this.crops.get(plot.crop.id);
    if (!crop) {
      return false;
    }

    // Calculate yield based on quality
    const yieldQuantity = Math.floor(
      crop.yield.baseQuantity * (plot.crop.quality / 100) * crop.yield.qualityMultiplier
    );

    // Add harvested items to inventory
    // This would integrate with your inventory system

    // Reset plot
    plot.status = 'empty';
    plot.crop = undefined;

    this.plots.set(plotId, plot);
    this.emit('cropHarvested', {
      plotId,
      userId,
      cropId: crop.id,
      quantity: yieldQuantity,
      quality: plot.crop.quality
    });

    return true;
  }

  async getPlot(plotId: string): Promise<Plot | null> {
    return this.plots.get(plotId) || null;
  }

  async getUserPlots(userId: string): Promise<Plot[]> {
    return Array.from(this.plots.values()).filter(plot => plot.ownerId === userId);
  }

  async getCrop(cropId: string): Promise<Crop | null> {
    return this.crops.get(cropId) || null;
  }

  async getAvailableCrops(season: string): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(
      crop => crop.season === season || crop.season === 'all'
    );
  }
}

export const farmingService = FarmingService.getInstance(
  new CraftingService(null as any), // Pass proper SocketIO instance
  new LandService(),
  new InventoryService()
);
