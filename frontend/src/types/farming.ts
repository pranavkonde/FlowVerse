export interface FarmPlot {
  id: string;
  ownerId: string;
  position: { x: number; y: number };
  crop?: Crop;
  soil: SoilType;
  moisture: number;
  fertility: number;
  status: PlotStatus;
  lastWatered?: string;
  lastFertilized?: string;
}

export interface Crop {
  id: string;
  name: string;
  type: CropType;
  growthStage: GrowthStage;
  plantedAt: string;
  harvestableAt: string;
  quality: CropQuality;
  diseased: boolean;
  waterNeeded: number;
  fertilityNeeded: number;
}

export type SoilType =
  | 'BASIC'
  | 'FERTILE'
  | 'RICH'
  | 'SANDY'
  | 'CLAY'
  | 'LOAMY';

export type PlotStatus =
  | 'EMPTY'
  | 'TILLED'
  | 'PLANTED'
  | 'GROWING'
  | 'HARVESTABLE'
  | 'DISEASED';

export type CropType =
  | 'VEGETABLE'
  | 'FRUIT'
  | 'GRAIN'
  | 'HERB'
  | 'FLOWER'
  | 'MAGICAL';

export type GrowthStage =
  | 'SEED'
  | 'SPROUT'
  | 'GROWING'
  | 'FLOWERING'
  | 'MATURE';

export type CropQuality =
  | 'POOR'
  | 'NORMAL'
  | 'GOOD'
  | 'EXCELLENT'
  | 'PERFECT';

export interface FarmingTool {
  id: string;
  name: string;
  type: ToolType;
  durability: number;
  efficiency: number;
  bonusEffects: ToolBonus[];
}

export type ToolType =
  | 'HOE'
  | 'WATERING_CAN'
  | 'FERTILIZER'
  | 'PESTICIDE'
  | 'HARVEST_BASKET';

export interface ToolBonus {
  type: BonusType;
  value: number;
}

export type BonusType =
  | 'GROWTH_SPEED'
  | 'WATER_RETENTION'
  | 'FERTILITY_BOOST'
  | 'DISEASE_RESISTANCE'
  | 'YIELD_INCREASE';

export interface CropTemplate {
  name: string;
  type: CropType;
  growthTime: number; // in minutes
  waterNeeded: number;
  fertilityNeeded: number;
  seasonalBonus: Season[];
  possibleYield: { min: number; max: number };
  value: number;
}

export type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER';

export interface FarmingStats {
  totalHarvests: number;
  cropsByType: Record<CropType, number>;
  qualityAchieved: Record<CropQuality, number>;
  diseaseRate: number;
  perfectCrops: number;
  totalEarnings: number;
}