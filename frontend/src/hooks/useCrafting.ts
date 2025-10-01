import { useState, useEffect } from 'react';
import { 
  CraftingRecipe, 
  CraftingProgress, 
  CraftingMaterial, 
  CraftingResult,
  SkillUpgrade 
} from '../types/crafting';

interface UseCraftingReturn {
  recipes: CraftingRecipe[] | null;
  progress: CraftingProgress | null;
  materials: CraftingMaterial[] | null;
  loading: boolean;
  error: string | null;
  fetchRecipes: (category?: string, skillLevel?: number) => Promise<void>;
  fetchProgress: () => Promise<void>;
  fetchMaterials: () => Promise<void>;
  craftItem: (recipeId: string, quantity?: number) => Promise<CraftingResult>;
  discoverRecipe: (ingredients: string[]) => Promise<{ success: boolean; recipe?: CraftingRecipe; message: string }>;
  upgradeSkill: (skillType: string) => Promise<SkillUpgrade>;
}

export const useCrafting = (playerId: string): UseCraftingReturn => {
  const [recipes, setRecipes] = useState<CraftingRecipe[] | null>(null);
  const [progress, setProgress] = useState<CraftingProgress | null>(null);
  const [materials, setMaterials] = useState<CraftingMaterial[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchRecipes = async (category?: string, skillLevel: number = 1): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('skillLevel', skillLevel.toString());

      const response = await fetch(`${API_BASE_URL}/crafting/${playerId}/recipes?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setRecipes(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch recipes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/crafting/${playerId}/progress`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setProgress(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch crafting progress');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching crafting progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/crafting/${playerId}/materials`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMaterials(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch materials');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const craftItem = async (recipeId: string, quantity: number = 1): Promise<CraftingResult> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/crafting/${playerId}/craft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId, quantity }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to craft item');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error crafting item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const discoverRecipe = async (ingredients: string[]): Promise<{ success: boolean; recipe?: CraftingRecipe; message: string }> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/crafting/${playerId}/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to discover recipe');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error discovering recipe:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const upgradeSkill = async (skillType: string): Promise<SkillUpgrade> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/crafting/${playerId}/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skillType }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to upgrade skill');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error upgrading skill:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch data when playerId changes
  useEffect(() => {
    if (playerId) {
      fetchRecipes();
      fetchProgress();
      fetchMaterials();
    }
  }, [playerId]);

  return {
    recipes,
    progress,
    materials,
    loading,
    error,
    fetchRecipes,
    fetchProgress,
    fetchMaterials,
    craftItem,
    discoverRecipe,
    upgradeSkill,
  };
};
