export interface FishingSpot {
  id: string;
  name: string;
  type: SpotType;
  difficulty: number;
  availableFish: Fish[];
  requiredLevel: number;
  requiredEquipment: string[];
  weatherEffects: WeatherEffect[];
  seasonalBonus: Season[];
  position: { x: number; y: number };
  cooldown?: number;
  lastFished?: string;
}

export interface Fish {
  id: string;
  name: string;
  type: FishType;
  rarity: FishRarity;
  size: { min: number; max: number };
  weight: { min: number; max: number };
  value: number;
  season: Season[];
  timeOfDay: TimeOfDay[];
  catchDifficulty: number;
  specialEffects: SpecialEffect[];
  description: string;
  imageUrl: string;
}

export type SpotType =
  | 'LAKE'
  | 'RIVER'
  | 'OCEAN'
  | 'POND'
  | 'STREAM'
  | 'DEEP_SEA'
  | 'CAVE';

export type FishType =
  | 'COMMON'
  | 'PREDATOR'
  | 'DEEP_WATER'
  | 'SURFACE'
  | 'CAVE'
  | 'LEGENDARY'
  | 'MAGICAL';

export type FishRarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'MYTHICAL';

export type Season = 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER';

export type TimeOfDay = 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT';

export type WeatherEffect =
  | 'RAIN'
  | 'STORM'
  | 'CLEAR'
  | 'CLOUDY'
  | 'WINDY'
  | 'FOG';

export interface SpecialEffect {
  type: EffectType;
  value: number;
  duration?: number;
}

export type EffectType =
  | 'LUCK_BOOST'
  | 'SKILL_BOOST'
  | 'VALUE_BOOST'
  | 'SIZE_BOOST'
  | 'RARE_CHANCE'
  | 'DOUBLE_CATCH';

export interface FishingEquipment {
  id: string;
  name: string;
  type: EquipmentType;
  quality: EquipmentQuality;
  stats: EquipmentStats;
  durability: number;
  maxDurability: number;
  requirements: {
    level: number;
    skill?: string;
  };
  specialEffects: SpecialEffect[];
}

export type EquipmentType =
  | 'ROD'
  | 'REEL'
  | 'LINE'
  | 'BAIT'
  | 'LURE'
  | 'NET'
  | 'TRAP';

export type EquipmentQuality =
  | 'BASIC'
  | 'GOOD'
  | 'GREAT'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY';

export interface EquipmentStats {
  power: number;
  accuracy: number;
  speed: number;
  luck: number;
  durability: number;
}

export interface FishingAttempt {
  id: string;
  userId: string;
  spotId: string;
  equipment: {
    rod?: string;
    reel?: string;
    line?: string;
    bait?: string;
    lure?: string;
  };
  startedAt: string;
  endedAt?: string;
  status: AttemptStatus;
  progress: number;
  difficulty: number;
  result?: FishingResult;
}

export type AttemptStatus =
  | 'CASTING'
  | 'WAITING'
  | 'BITING'
  | 'REELING'
  | 'COMPLETED'
  | 'FAILED';

export interface FishingResult {
  success: boolean;
  fish?: Fish;
  size?: number;
  weight?: number;
  quality?: CatchQuality;
  bonus?: {
    type: string;
    value: number;
  };
  experience: number;
}

export type CatchQuality =
  | 'POOR'
  | 'NORMAL'
  | 'GOOD'
  | 'GREAT'
  | 'PERFECT';

export interface FishingStats {
  totalCatches: number;
  rarityCount: Record<FishRarity, number>;
  typeCount: Record<FishType, number>;
  biggestCatch: {
    fish: Fish;
    size: number;
    weight: number;
  };
  totalValue: number;
  perfectCatches: number;
  specialCatches: number;
  achievements: string[];
}