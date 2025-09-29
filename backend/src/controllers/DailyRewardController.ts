import { Request, Response } from 'express';
import { dailyRewardService } from '../services/DailyRewardService';

export class DailyRewardController {
  async claimDailyReward(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const reward = await dailyRewardService.claimDailyReward(userId);
      if (!reward) {
        return res.status(400).json({ error: 'Cannot claim reward yet' });
      }

      return res.json({ success: true, reward });
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStreakInfo(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const streakInfo = await dailyRewardService.getStreakInfo(userId);
      return res.json(streakInfo);
    } catch (error) {
      console.error('Error getting streak info:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const dailyRewardController = new DailyRewardController();
