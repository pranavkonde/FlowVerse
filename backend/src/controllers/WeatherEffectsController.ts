import { Request, Response } from 'express';
import { weatherEffectsService } from '../services/WeatherEffectsService';

export class WeatherEffectsController {
  async updatePlayerPosition(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { x, y } = req.body;
      if (typeof x !== 'number' || typeof y !== 'number') {
        return res.status(400).json({ error: 'Valid position coordinates are required' });
      }

      await weatherEffectsService.updatePlayerPosition(userId, { x, y });
      return res.json({ success: true });
    } catch (error) {
      console.error('Error updating player position:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getZoneWeather(req: Request, res: Response) {
    try {
      const { zoneId } = req.params;
      if (!zoneId) {
        return res.status(400).json({ error: 'Zone ID is required' });
      }

      try {
        const weather = await weatherEffectsService.getZoneWeather(zoneId);
        return res.json(weather);
      } catch (err) {
        return res.status(404).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error getting zone weather:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPlayerWeather(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const weather = await weatherEffectsService.getPlayerWeather(userId);
      return res.json(weather);
    } catch (error) {
      console.error('Error getting player weather:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAllZones(req: Request, res: Response) {
    try {
      const zones = await weatherEffectsService.getAllZones();
      return res.json(zones);
    } catch (error) {
      console.error('Error getting all zones:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const weatherEffectsController = new WeatherEffectsController();
