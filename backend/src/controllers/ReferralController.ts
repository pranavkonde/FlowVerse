import { Request, Response } from 'express';
import { ReferralService } from '../services/ReferralService';

export class ReferralController {
  private referralService: ReferralService;

  constructor(referralService: ReferralService) {
    this.referralService = referralService;
  }

  public async generateCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { expiresIn, maxUses } = req.body;

      const code = await this.referralService.generateCode(userId, {
        expiresIn,
        maxUses
      });
      res.json(code);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate referral code' });
    }
  }

  public async useCode(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { code } = req.body;

      if (!code) {
        res.status(400).json({ error: 'Referral code is required' });
        return;
      }

      const use = await this.referralService.useCode(userId, code);
      res.json(use);
    } catch (error) {
      res.status(500).json({ error: 'Failed to use referral code' });
    }
  }

  public async claimRewards(req: Request, res: Response): Promise<void> {
    try {
      const { useId } = req.body;

      if (!useId) {
        res.status(400).json({ error: 'Use ID is required' });
        return;
      }

      const use = await this.referralService.claimRewards(useId);
      res.json(use);
    } catch (error) {
      res.status(500).json({ error: 'Failed to claim rewards' });
    }
  }

  public async getReferralProgram(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const program = await this.referralService.getReferralProgram(userId);
      res.json(program);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch referral program' });
    }
  }

  public async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const stats = await this.referralService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
  }

  public async getUserCodes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const codes = await this.referralService.getUserCodes(userId);
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user codes' });
    }
  }
}