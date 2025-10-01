import { Request, Response } from 'express';
import { FishingService } from '../services/FishingService';

export class FishingController {
  private fishingService: FishingService;

  constructor(fishingService: FishingService) {
    this.fishingService = fishingService;
  }

  public async getSpots(req: Request, res: Response): Promise<void> {
    try {
      const spots = await this.fishingService.getSpots();
      res.json(spots);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch fishing spots' });
    }
  }

  public async startFishing(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { spotId, equipment } = req.body;

      if (!spotId) {
        res.status(400).json({ error: 'Spot ID is required' });
        return;
      }

      const attempt = await this.fishingService.startFishing(
        userId,
        spotId,
        equipment
      );
      res.json(attempt);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start fishing' });
    }
  }

  public async respondToBite(req: Request, res: Response): Promise<void> {
    try {
      const { attemptId } = req.params;

      if (!attemptId) {
        res.status(400).json({ error: 'Attempt ID is required' });
        return;
      }

      const attempt = await this.fishingService.respondToBite(attemptId);
      res.json(attempt);
    } catch (error) {
      res.status(500).json({ error: 'Failed to respond to bite' });
    }
  }

  public async getAttempt(req: Request, res: Response): Promise<void> {
    try {
      const { attemptId } = req.params;

      if (!attemptId) {
        res.status(400).json({ error: 'Attempt ID is required' });
        return;
      }

      const attempt = await this.fishingService.getAttempt(attemptId);
      if (!attempt) {
        res.status(404).json({ error: 'Attempt not found' });
        return;
      }

      res.json(attempt);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch attempt' });
    }
  }

  public async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const stats = await this.fishingService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  }

  public async getCurrentConditions(req: Request, res: Response): Promise<void> {
    try {
      const conditions = this.fishingService.getCurrentConditions();
      res.json(conditions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch current conditions' });
    }
  }
}