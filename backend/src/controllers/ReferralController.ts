import { Request, Response } from 'express';
import { referralService } from '../services/ReferralService';

export class ReferralController {
  async generateReferralCode(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const code = await referralService.generateReferralCode(userId);
      return res.json({ code });
    } catch (error) {
      console.error('Error generating referral code:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async applyReferralCode(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { referralCode } = req.body;
      if (!referralCode) {
        return res.status(400).json({ error: 'Referral code is required' });
      }

      const success = await referralService.applyReferralCode(userId, referralCode);
      if (!success) {
        return res.status(400).json({ error: 'Invalid referral code' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error applying referral code:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async completeReferral(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await referralService.completeReferral(userId);
      return res.json(result);
    } catch (error) {
      console.error('Error completing referral:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getReferralStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await referralService.getReferralStats(userId);
      return res.json(stats);
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const referralController = new ReferralController();
