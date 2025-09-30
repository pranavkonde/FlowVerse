import { Request, Response } from 'express';
import { dailyChallengeService } from '../services/DailyChallengeService';

export class DailyChallengeController {
  async getCurrentChallenges(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const challenges = await dailyChallengeService.getCurrentChallenges();
      const userProgress = await dailyChallengeService.getUserProgress(userId);

      const challengesWithProgress = challenges.map(challenge => ({
        ...challenge,
        progress: userProgress.find(p => p.challengeId === challenge.id)?.progress || 0,
        completed: userProgress.find(p => p.challengeId === challenge.id)?.completed || false,
        claimed: userProgress.find(p => p.challengeId === challenge.id)?.claimed || false
      }));

      return res.json(challengesWithProgress);
    } catch (error) {
      console.error('Error getting daily challenges:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { challengeId, progress } = req.body;
      if (!challengeId || typeof progress !== 'number') {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      const updatedProgress = await dailyChallengeService.updateProgress(
        userId,
        challengeId,
        progress
      );

      return res.json(updatedProgress);
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async claimRewards(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { challengeId } = req.body;
      if (!challengeId) {
        return res.status(400).json({ error: 'Challenge ID is required' });
      }

      const claimed = await dailyChallengeService.claimRewards(userId, challengeId);
      if (!claimed) {
        return res.status(400).json({ error: 'Cannot claim rewards' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error claiming challenge rewards:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLeaderboard(req: Request, res: Response) {
    try {
      const leaderboard = await dailyChallengeService.getLeaderboard();
      return res.json(leaderboard);
    } catch (error) {
      console.error('Error getting challenge leaderboard:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const dailyChallengeController = new DailyChallengeController();
