import { Request, Response } from 'express';
import { DailyChallengeService } from '../services/DailyChallengeService';

export class DailyChallengeController {
  private challengeService: DailyChallengeService;

  constructor(challengeService: DailyChallengeService) {
    this.challengeService = challengeService;
  }

  public async getChallenges(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id; // Assuming auth middleware sets user
      const challenges = await this.challengeService.getUserChallenges(userId);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch challenges' });
    }
  }

  public async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { challengeId, progress } = req.body;

      if (!challengeId || typeof progress !== 'number') {
        res.status(400).json({ error: 'Invalid request parameters' });
        return;
      }

      const updatedProgress = await this.challengeService.updateProgress(
        userId,
        challengeId,
        progress
      );
      res.json(updatedProgress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update challenge progress' });
    }
  }

  public async claimReward(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { challengeId } = req.body;

      if (!challengeId) {
        res.status(400).json({ error: 'Challenge ID is required' });
        return;
      }

      const progress = await this.challengeService.claimReward(userId, challengeId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to claim reward' });
    }
  }
}