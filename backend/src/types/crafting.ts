export interface CraftingRecipe {
  id: string;
  name: string;
  category: string;
  description: string;
  requiredSkill: number;
  difficulty: number;
  experienceReward: number;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  resultItem: {
    id: string;
    name: string;
    quantity: number;
    rarity: string;
    description: string;
  };
}

export interface CraftingProgress {
  playerId: string;
  skills: {
    weaponsmithing: SkillData;
    armorsmithing: SkillData;
    alchemy: SkillData;
    cooking: SkillData;
    engineering: SkillData;
  };
  discoveredRecipes: string[];
  totalItemsCrafted: number;
  lastCrafted: Date | null;
  achievements: string[];
}

export interface SkillData {
  level: number;
  experience: number;
  maxExperience: number;
}

export interface CraftingResult {
  success: boolean;
  item: {
    id: string;
    name: string;
    quantity: number;
    rarity: string;
    description: string;
  };
  experienceGained: number;
  materialsConsumed: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  skillLevelUp: number;
  message: string;
}

export interface CraftingMaterial {
  id: string;
  name: string;
  quantity: number;
  rarity: string;
  category: string;
}

export interface WorkshopStatus {
  playerId: string;
  isUnlocked: boolean;
  level: number;
  totalMaterials: number;
  availableRecipes: number;
  totalRecipes: number;
  lastActivity: Date | null;
  upgrades: {
    efficiency: number;
    successRate: number;
    experienceBonus: number;
  };
}

export interface SkillUpgrade {
  skillType: string;
  newLevel: number;
  cost: number;
  message: string;
}
