import { Request, Response } from 'express';
import { farmingService } from '../services/FarmingService';

export class FarmingController {
  async createPlot(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { position } = req.body;
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        return res.status(400).json({ error: 'Valid position coordinates are required' });
      }

      const plot = await farmingService.createPlot(userId, position);
      return res.json(plot);
    } catch (error) {
      console.error('Error creating plot:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async tillPlot(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { plotId, toolId } = req.body;
      if (!plotId || !toolId) {
        return res.status(400).json({ error: 'Plot ID and tool ID are required' });
      }

      const success = await farmingService.tillPlot(plotId, userId, toolId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to till plot' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error tilling plot:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async plantCrop(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { plotId, cropId } = req.body;
      if (!plotId || !cropId) {
        return res.status(400).json({ error: 'Plot ID and crop ID are required' });
      }

      const success = await farmingService.plantCrop(plotId, userId, cropId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to plant crop' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error planting crop:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async waterCrop(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { plotId } = req.body;
      if (!plotId) {
        return res.status(400).json({ error: 'Plot ID is required' });
      }

      const success = await farmingService.waterCrop(plotId, userId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to water crop' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error watering crop:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async fertilizeCrop(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { plotId, fertilizerId } = req.body;
      if (!plotId || !fertilizerId) {
        return res.status(400).json({ error: 'Plot ID and fertilizer ID are required' });
      }

      const success = await farmingService.fertilizeCrop(plotId, userId, fertilizerId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to fertilize crop' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error fertilizing crop:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async harvestCrop(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { plotId } = req.body;
      if (!plotId) {
        return res.status(400).json({ error: 'Plot ID is required' });
      }

      const success = await farmingService.harvestCrop(plotId, userId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to harvest crop' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error harvesting crop:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPlot(req: Request, res: Response) {
    try {
      const { plotId } = req.params;
      if (!plotId) {
        return res.status(400).json({ error: 'Plot ID is required' });
      }

      const plot = await farmingService.getPlot(plotId);
      if (!plot) {
        return res.status(404).json({ error: 'Plot not found' });
      }

      return res.json(plot);
    } catch (error) {
      console.error('Error getting plot:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserPlots(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const plots = await farmingService.getUserPlots(userId);
      return res.json(plots);
    } catch (error) {
      console.error('Error getting user plots:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAvailableCrops(req: Request, res: Response) {
    try {
      const { season } = req.query;
      if (typeof season !== 'string') {
        return res.status(400).json({ error: 'Valid season is required' });
      }

      const crops = await farmingService.getAvailableCrops(season);
      return res.json(crops);
    } catch (error) {
      console.error('Error getting available crops:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const farmingController = new FarmingController();
