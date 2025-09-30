import { Request, Response } from 'express';
import { fishingService } from '../services/FishingService';

export class FishingController {
  async startFishing(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { spotId, rodId, baitId } = req.body;
      if (!spotId) {
        return res.status(400).json({ error: 'Fishing spot ID is required' });
      }

      const session = await fishingService.startFishing(
        userId,
        spotId,
        rodId,
        baitId
      );

      return res.json(session);
    } catch (error) {
      console.error('Error starting fishing:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async cast(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = await fishingService.getSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ error: 'Invalid session' });
      }

      await fishingService.cast(sessionId);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error casting line:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async hook(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = await fishingService.getSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ error: 'Invalid session' });
      }

      await fishingService.hook(sessionId);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error hooking fish:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async updateMinigame(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      const { progress } = req.body;
      if (!sessionId || typeof progress !== 'number') {
        return res.status(400).json({ error: 'Session ID and progress are required' });
      }

      const session = await fishingService.getSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ error: 'Invalid session' });
      }

      const result = await fishingService.updateMinigame(sessionId, progress);
      return res.json(result);
    } catch (error) {
      console.error('Error updating minigame:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async getFishingSpots(req: Request, res: Response) {
    try {
      const spots = await fishingService.getFishingSpots();
      return res.json(spots);
    } catch (error) {
      console.error('Error getting fishing spots:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAvailableFish(req: Request, res: Response) {
    try {
      const fish = await fishingService.getAvailableFish();
      return res.json(fish);
    } catch (error) {
      console.error('Error getting available fish:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await fishingService.getStats(userId);
      return res.json(stats);
    } catch (error) {
      console.error('Error getting fishing stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { sessionId } = req.params;
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = await fishingService.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      return res.json(session);
    } catch (error) {
      console.error('Error getting fishing session:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const fishingController = new FishingController();
