import { Request, Response } from 'express';
import { tutorialService } from '../services/TutorialService';

export class TutorialController {
  async getCurrentStep(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const currentStep = await tutorialService.getCurrentStep(userId);
      return res.json(currentStep);
    } catch (error) {
      console.error('Error getting tutorial step:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async completeAction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { action } = req.body;
      if (!action) {
        return res.status(400).json({ error: 'Action is required' });
      }

      const result = await tutorialService.completeAction(userId, action);
      return res.json(result);
    } catch (error) {
      console.error('Error completing tutorial action:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async resetTutorial(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await tutorialService.resetTutorial(userId);
      return res.json({ success: true });
    } catch (error) {
      console.error('Error resetting tutorial:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const tutorialController = new TutorialController();


