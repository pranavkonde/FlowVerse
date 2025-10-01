import { EventEmitter } from 'events';
import {
  FarmPlot,
  Crop,
  FarmingTool,
  CropTemplate,
  FarmingStats,
  Season,
  PlotStatus,
  CropType,
  GrowthStage,
  CropQuality,
  SoilType
} from '../types/farming';

export class FarmingService extends EventEmitter {
  private plots: Map<string, FarmPlot> = new Map();
  private tools: Map<string, FarmingTool> = new Map();
  private cropTemplates: Map<string, CropTemplate> = new Map();
  private userStats: Map<string, FarmingStats> = new Map();
  private currentSeason: Season;

  constructor() {
    super();
    this.currentSeason = this.calculateCurrentSeason();
    this.initializeCropTemplates();
    this.startGrowthCycle();
    this.startSeasonalCheck();
  }

  private calculateCurrentSeason(): Season {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'SPRING';
    if (month >= 5 && month <= 7) return 'SUMMER';
    if (month >= 8 && month <= 10) return 'FALL';
    return 'WINTER';
  }

  private initializeCropTemplates(): void {
    const templates: CropTemplate[] = [
      {
        name: 'Tomato',
        type: 'VEGETABLE',
        growthTime: 30, // 30 minutes for demo
        waterNeeded: 70,
        fertilityNeeded: 60,
        seasonalBonus: ['SUMMER'],
        possibleYield: { min: 3, max: 6 },
        value: 10
      },
      {
        name: 'Wheat',
        type: 'GRAIN',
        growthTime: 45,
        waterNeeded: 50,
        fertilityNeeded: 40,
        seasonalBonus: ['SUMMER', 'FALL'],
        possibleYield: { min: 4, max: 8 },
        value: 5
      },
      {
        name: 'Magic Mushroom',
        type: 'MAGICAL',
        growthTime: 60,
        waterNeeded: 80,
        fertilityNeeded: 90,
        seasonalBonus: ['SPRING', 'FALL'],
        possibleYield: { min: 1, max: 3 },
        value: 50
      }
      // Add more templates...
    ];

    templates.forEach(template => {
      this.cropTemplates.set(template.name, template);
    });
  }

  private startGrowthCycle(): void {
    setInterval(() => {
      for (const [plotId, plot] of this.plots) {
        if (!plot.crop || plot.status === 'DISEASED') continue;

        const now = new Date();
        const plantedTime = new Date(plot.crop.plantedAt);
        const harvestTime = new Date(plot.crop.harvestableAt);

        if (now >= harvestTime && plot.status === 'GROWING') {
          plot.status = 'HARVESTABLE';
          this.plots.set(plotId, plot);
          this.emit('crop:harvestable', { plotId });
          continue;
        }

        // Update growth stage based on progress
        const progress = (now.getTime() - plantedTime.getTime()) /
          (harvestTime.getTime() - plantedTime.getTime());

        let newStage: GrowthStage = 'SEED';
        if (progress >= 0.25) newStage = 'SPROUT';
        if (progress >= 0.5) newStage = 'GROWING';
        if (progress >= 0.75) newStage = 'FLOWERING';
        if (progress >= 1) newStage = 'MATURE';

        if (newStage !== plot.crop.growthStage) {
          plot.crop.growthStage = newStage;
          this.plots.set(plotId, plot);
          this.emit('crop:stage-changed', { plotId, stage: newStage });
        }

        // Check for disease
        if (
          plot.moisture < plot.crop.waterNeeded * 0.5 ||
          plot.fertility < plot.crop.fertilityNeeded * 0.5
        ) {
          const diseaseChance = Math.random();
          if (diseaseChance < 0.1) { // 10% chance of disease when conditions are poor
            plot.status = 'DISEASED';
            plot.crop.diseased = true;
            this.plots.set(plotId, plot);
            this.emit('crop:diseased', { plotId });
          }
        }
      }
    }, 60000); // Check every minute
  }

  private startSeasonalCheck(): void {
    setInterval(() => {
      const newSeason = this.calculateCurrentSeason();
      if (newSeason !== this.currentSeason) {
        this.currentSeason = newSeason;
        this.emit('season:changed', { season: this.currentSeason });
      }
    }, 3600000); // Check every hour
  }

  public async createPlot(
    userId: string,
    position: { x: number; y: number }
  ): Promise<FarmPlot> {
    const plot: FarmPlot = {
      id: `PLOT-${Date.now()}`,
      ownerId: userId,
      position,
      soil: 'BASIC',
      moisture: 50,
      fertility: 50,
      status: 'EMPTY'
    };

    this.plots.set(plot.id, plot);
    return plot;
  }

  public async tillPlot(
    userId: string,
    plotId: string,
    toolId: string
  ): Promise<FarmPlot> {
    const plot = this.plots.get(plotId);
    if (!plot || plot.ownerId !== userId) {
      throw new Error('Plot not found or unauthorized');
    }

    if (plot.status !== 'EMPTY') {
      throw new Error('Plot is not empty');
    }

    const tool = this.tools.get(toolId);
    if (!tool || tool.type !== 'HOE') {
      throw new Error('Invalid tool for tilling');
    }

    plot.status = 'TILLED';
    this.plots.set(plotId, plot);
    this.emit('plot:tilled', { plotId });

    return plot;
  }

  public async plantCrop(
    userId: string,
    plotId: string,
    cropName: string
  ): Promise<FarmPlot> {
    const plot = this.plots.get(plotId);
    if (!plot || plot.ownerId !== userId) {
      throw new Error('Plot not found or unauthorized');
    }

    if (plot.status !== 'TILLED') {
      throw new Error('Plot is not ready for planting');
    }

    const template = this.cropTemplates.get(cropName);
    if (!template) {
      throw new Error('Invalid crop type');
    }

    const now = new Date();
    const harvestTime = new Date(
      now.getTime() + template.growthTime * 60000
    );

    const crop: Crop = {
      id: `CROP-${Date.now()}`,
      name: template.name,
      type: template.type,
      growthStage: 'SEED',
      plantedAt: now.toISOString(),
      harvestableAt: harvestTime.toISOString(),
      quality: 'NORMAL',
      diseased: false,
      waterNeeded: template.waterNeeded,
      fertilityNeeded: template.fertilityNeeded
    };

    plot.crop = crop;
    plot.status = 'PLANTED';
    this.plots.set(plotId, plot);
    this.emit('crop:planted', { plotId });

    return plot;
  }

  public async waterPlot(
    userId: string,
    plotId: string,
    toolId: string
  ): Promise<FarmPlot> {
    const plot = this.plots.get(plotId);
    if (!plot || plot.ownerId !== userId) {
      throw new Error('Plot not found or unauthorized');
    }

    const tool = this.tools.get(toolId);
    if (!tool || tool.type !== 'WATERING_CAN') {
      throw new Error('Invalid tool for watering');
    }

    plot.moisture = Math.min(100, plot.moisture + 30 * tool.efficiency);
    plot.lastWatered = new Date().toISOString();
    this.plots.set(plotId, plot);
    this.emit('plot:watered', { plotId });

    return plot;
  }

  public async fertilizePlot(
    userId: string,
    plotId: string,
    toolId: string
  ): Promise<FarmPlot> {
    const plot = this.plots.get(plotId);
    if (!plot || plot.ownerId !== userId) {
      throw new Error('Plot not found or unauthorized');
    }

    const tool = this.tools.get(toolId);
    if (!tool || tool.type !== 'FERTILIZER') {
      throw new Error('Invalid tool for fertilizing');
    }

    plot.fertility = Math.min(100, plot.fertility + 20 * tool.efficiency);
    plot.lastFertilized = new Date().toISOString();
    this.plots.set(plotId, plot);
    this.emit('plot:fertilized', { plotId });

    return plot;
  }

  public async harvestCrop(
    userId: string,
    plotId: string,
    toolId: string
  ): Promise<{ plot: FarmPlot; yield: number; quality: CropQuality }> {
    const plot = this.plots.get(plotId);
    if (!plot || plot.ownerId !== userId || !plot.crop) {
      throw new Error('Plot not found, unauthorized, or no crop');
    }

    if (plot.status !== 'HARVESTABLE') {
      throw new Error('Crop is not ready for harvest');
    }

    const tool = this.tools.get(toolId);
    if (!tool || tool.type !== 'HARVEST_BASKET') {
      throw new Error('Invalid tool for harvesting');
    }

    const template = this.cropTemplates.get(plot.crop.name);
    if (!template) {
      throw new Error('Crop template not found');
    }

    // Calculate quality based on conditions
    let quality: CropQuality = 'NORMAL';
    const conditions = (plot.moisture / plot.crop.waterNeeded) +
      (plot.fertility / plot.crop.fertilityNeeded);
    
    if (conditions >= 2) quality = 'PERFECT';
    else if (conditions >= 1.75) quality = 'EXCELLENT';
    else if (conditions >= 1.5) quality = 'GOOD';
    else if (conditions < 1) quality = 'POOR';

    // Calculate yield
    const baseYield = Math.floor(
      Math.random() * (template.possibleYield.max - template.possibleYield.min + 1) +
      template.possibleYield.min
    );

    let finalYield = baseYield;
    if (template.seasonalBonus.includes(this.currentSeason)) {
      finalYield = Math.ceil(finalYield * 1.5);
    }

    // Update stats
    let stats = this.userStats.get(userId);
    if (!stats) {
      stats = {
        totalHarvests: 0,
        cropsByType: {} as Record<CropType, number>,
        qualityAchieved: {} as Record<CropQuality, number>,
        diseaseRate: 0,
        perfectCrops: 0,
        totalEarnings: 0
      };
    }

    stats.totalHarvests++;
    stats.cropsByType[plot.crop.type] = (stats.cropsByType[plot.crop.type] || 0) + 1;
    stats.qualityAchieved[quality] = (stats.qualityAchieved[quality] || 0) + 1;
    if (quality === 'PERFECT') stats.perfectCrops++;
    stats.totalEarnings += template.value * finalYield;

    this.userStats.set(userId, stats);

    // Reset plot
    plot.crop = undefined;
    plot.status = 'EMPTY';
    plot.moisture = 50;
    plot.fertility = 50;
    this.plots.set(plotId, plot);

    this.emit('crop:harvested', {
      plotId,
      yield: finalYield,
      quality,
      earnings: template.value * finalYield
    });

    return { plot, yield: finalYield, quality };
  }

  public async getUserStats(userId: string): Promise<FarmingStats> {
    return (
      this.userStats.get(userId) || {
        totalHarvests: 0,
        cropsByType: {},
        qualityAchieved: {},
        diseaseRate: 0,
        perfectCrops: 0,
        totalEarnings: 0
      }
    );
  }

  public async getUserPlots(userId: string): Promise<FarmPlot[]> {
    return Array.from(this.plots.values()).filter(
      plot => plot.ownerId === userId
    );
  }

  public async getAvailableCrops(): Promise<CropTemplate[]> {
    return Array.from(this.cropTemplates.values()).filter(template =>
      template.seasonalBonus.includes(this.currentSeason)
    );
  }
}