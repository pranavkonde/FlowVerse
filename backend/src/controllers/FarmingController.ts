import { Request, Response } from 'express';
import { FarmingService } from '../services/FarmingService';

export class FarmingController {
  private farmingService: FarmingService;

  constructor(farmingService: FarmingService) {
    this.farmingService = farmingService;
  }

  public async createPlot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { position } = req.body;

      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        res.status(400).json({ error: 'Invalid position coordinates' });
        return;
      }

      const plot = await this.farmingService.createPlot(userId, position);
      res.json(plot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create plot' });
    }
  }

  public async tillPlot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { plotId, toolId } = req.body;

      if (!plotId || !toolId) {
        res.status(400).json({ error: 'Plot ID and tool ID are required' });
        return;
      }

      const plot = await this.farmingService.tillPlot(userId, plotId, toolId);
      res.json(plot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to till plot' });
    }
  }

  public async plantCrop(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { plotId, cropName } = req.body;

      if (!plotId || !cropName) {
        res.status(400).json({ error: 'Plot ID and crop name are required' });
        return;
      }

      const plot = await this.farmingService.plantCrop(userId, plotId, cropName);
      res.json(plot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to plant crop' });
    }
  }

  public async waterPlot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { plotId, toolId } = req.body;

      if (!plotId || !toolId) {
        res.status(400).json({ error: 'Plot ID and tool ID are required' });
        return;
      }

      const plot = await this.farmingService.waterPlot(userId, plotId, toolId);
      res.json(plot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to water plot' });
    }
  }

  public async fertilizePlot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { plotId, toolId } = req.body;

      if (!plotId || !toolId) {
        res.status(400).json({ error: 'Plot ID and tool ID are required' });
        return;
      }

      const plot = await this.farmingService.fertilizePlot(userId, plotId, toolId);
      res.json(plot);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fertilize plot' });
    }
  }

  public async harvestCrop(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { plotId, toolId } = req.body;

      if (!plotId || !toolId) {
        res.status(400).json({ error: 'Plot ID and tool ID are required' });
        return;
      }

      const result = await this.farmingService.harvestCrop(userId, plotId, toolId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to harvest crop' });
    }
  }

  public async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const stats = await this.farmingService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch farming stats' });
    }
  }

  public async getUserPlots(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const plots = await this.farmingService.getUserPlots(userId);
      res.json(plots);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user plots' });
    }
  }

  public async getAvailableCrops(req: Request, res: Response): Promise<void> {
    try {
      const crops = await this.farmingService.getAvailableCrops();
      res.json(crops);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch available crops' });
    }
  }
}