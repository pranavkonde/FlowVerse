import { Request, Response } from 'express';
import { referralService } from '../services/ReferralService';

export class ReferralController {
  async createReferralCode(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { maxUses, expiresIn, campaign, customMessage } = req.body;
      const code = await referralService.createReferralCode(userId, {
        maxUses,
        expiresIn,
        campaign,
        customMessage
      });

      return res.json(code);
    } catch (error) {
      console.error('Error creating referral code:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async useReferralCode(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Referral code is required' });
      }

      try {
        const use = await referralService.useReferralCode(code, userId);
        return res.json(use);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error using referral code:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async claimReferralRewards(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { useId, claimerType } = req.body;
      if (!useId || !claimerType) {
        return res.status(400).json({ error: 'Use ID and claimer type are required' });
      }

      const use = await referralService.getReferralUse(useId);
      if (!use) {
        return res.status(404).json({ error: 'Referral use not found' });
      }

      // Verify the user is either the referrer or referee
      if (
        (claimerType === 'referrer' && use.referrerId !== userId) ||
        (claimerType === 'referee' && use.refereeId !== userId)
      ) {
        return res.status(403).json({ error: 'Not authorized to claim these rewards' });
      }

      const success = await referralService.claimReferralRewards(useId, claimerType);
      if (!success) {
        return res.status(400).json({ error: 'Failed to claim rewards' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error claiming referral rewards:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserCodes(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const codes = await referralService.getUserCodes(userId);
      return res.json(codes);
    } catch (error) {
      console.error('Error getting user codes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getReferralStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await referralService.getUserStats(userId);
      if (!stats) {
        return res.status(404).json({ error: 'Stats not found' });
      }

      return res.json(stats);
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const referralController = new ReferralController();
