import { Request, Response } from 'express';
import { CraftingService } from '../services/CraftingService';

export class CraftingController {
  private craftingService: CraftingService;

  constructor() {
    this.craftingService = new CraftingService();
  }

  /**
   * Get all available recipes for a player
   */
  async getRecipes(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { category, skillLevel } = req.query;

      const recipes = await this.craftingService.getAvailableRecipes(
        playerId,
        category as string,
        parseInt(skillLevel as string) || 1
      );

      res.json({
        success: true,
        data: recipes
      });
    } catch (error) {
      console.error('Error getting recipes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recipes'
      });
    }
  }

  /**
   * Get player's crafting progress and skills
   */
  async getCraftingProgress(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;

      const progress = await this.craftingService.getCraftingProgress(playerId);

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error('Error getting crafting progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get crafting progress'
      });
    }
  }

  /**
   * Craft an item
   */
  async craftItem(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { recipeId, quantity = 1 } = req.body;

      const result = await this.craftingService.craftItem(playerId, recipeId, quantity);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error crafting item:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to craft item'
      });
    }
  }

  /**
   * Discover a new recipe
   */
  async discoverRecipe(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { ingredients } = req.body;

      const result = await this.craftingService.discoverRecipe(playerId, ingredients);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error discovering recipe:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to discover recipe'
      });
    }
  }

  /**
   * Get crafting materials and resources
   */
  async getMaterials(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;

      const materials = await this.craftingService.getPlayerMaterials(playerId);

      res.json({
        success: true,
        data: materials
      });
    } catch (error) {
      console.error('Error getting materials:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get materials'
      });
    }
  }

  /**
   * Upgrade crafting skill
   */
  async upgradeSkill(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;
      const { skillType } = req.body;

      const result = await this.craftingService.upgradeSkill(playerId, skillType);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error upgrading skill:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upgrade skill'
      });
    }
  }

  /**
   * Get crafting workshop status
   */
  async getWorkshopStatus(req: Request, res: Response): Promise<void> {
    try {
      const { playerId } = req.params;

      const status = await this.craftingService.getWorkshopStatus(playerId);

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error getting workshop status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get workshop status'
      });
    }
  }
}
