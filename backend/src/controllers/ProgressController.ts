import { Request, Response } from 'express';
import { progressTrackingService } from '../services/ProgressTrackingService';

export class ProgressController {
  async getProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const progress = await progressTrackingService.getProgress(userId);
      return res.json(progress);
    } catch (error) {
      console.error('Error getting user progress:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addExperience(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { amount } = req.body;
      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Valid experience amount is required' });
      }

      const result = await progressTrackingService.addExperience(userId, amount);
      return res.json(result);
    } catch (error) {
      console.error('Error adding experience:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateDailyStreak(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await progressTrackingService.updateDailyStreak(userId);
      return res.json(result);
    } catch (error) {
      console.error('Error updating daily streak:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async completeQuest(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { questId } = req.body;
      if (!questId) {
        return res.status(400).json({ error: 'Quest ID is required' });
      }

      const completed = await progressTrackingService.completeQuest(userId, questId);
      return res.json({ success: completed });
    } catch (error) {
      console.error('Error completing quest:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateTutorialProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { stepId, completed } = req.body;
      if (!stepId) {
        return res.status(400).json({ error: 'Step ID is required' });
      }

      await progressTrackingService.updateTutorialProgress(userId, stepId, completed);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error updating tutorial progress:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateStatistics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updates = req.body;
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: 'Valid statistics updates are required' });
      }

      await progressTrackingService.updateStatistics(userId, updates);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error updating statistics:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getRankings(req: Request, res: Response) {
    try {
      const { category } = req.params;
      if (!category) {
        return res.status(400).json({ error: 'Ranking category is required' });
      }

      const rankings = await progressTrackingService.getRankings(category as any);
      return res.json(rankings);
    } catch (error) {
      console.error('Error getting rankings:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const progressController = new ProgressController();
