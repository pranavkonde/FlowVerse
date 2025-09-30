export interface Crop {
  id: string;
  name: string;
  description: string;
  growthTime: number;
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
  wateringInterval: number;
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
    quality: number;
    diseased: boolean;
  };
}

export const PLOT_STATUS_COLORS = {
  empty: 'gray',
  tilled: 'brown',
  planted: 'green',
  ready: 'yellow'
} as const;

export const SEASON_COLORS = {
  spring: ['#90EE90', '#98FB98'],
  summer: ['#FFD700', '#FFA500'],
  fall: ['#D2691E', '#CD853F'],
  winter: ['#87CEEB', '#B0E0E6']
} as const;

export const QUALITY_LEVELS = {
  poor: { min: 0, max: 30, color: 'red' },
  average: { min: 31, max: 60, color: 'yellow' },
  good: { min: 61, max: 90, color: 'green' },
  excellent: { min: 91, max: 100, color: 'blue' }
} as const;
