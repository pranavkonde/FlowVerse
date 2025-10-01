import { Request, Response } from 'express';
import { AchievementShowcaseService } from '../services/AchievementShowcaseService';

export class AchievementShowcaseController {
  private showcaseService: AchievementShowcaseService;

  constructor(showcaseService: AchievementShowcaseService) {
    this.showcaseService = showcaseService;
  }

  public async createShowcase(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const showcase = await this.showcaseService.createShowcase(userId, req.body);
      res.json(showcase);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create showcase' });
    }
  }

  public async updateShowcase(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { showcaseId } = req.params;
      const showcase = await this.showcaseService.updateShowcase(
        userId,
        showcaseId,
        req.body
      );
      res.json(showcase);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update showcase' });
    }
  }

  public async addAchievement(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { showcaseId } = req.params;
      const { achievement } = req.body;

      if (!achievement) {
        res.status(400).json({ error: 'Achievement data is required' });
        return;
      }

      const showcase = await this.showcaseService.addAchievement(
        userId,
        showcaseId,
        achievement
      );
      res.json(showcase);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add achievement' });
    }
  }

  public async removeAchievement(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { showcaseId, achievementId } = req.params;

      const showcase = await this.showcaseService.removeAchievement(
        userId,
        showcaseId,
        achievementId
      );
      res.json(showcase);
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove achievement' });
    }
  }

  public async updateAchievementPosition(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { showcaseId, achievementId } = req.params;
      const { position, scale, rotation } = req.body;

      if (!position) {
        res.status(400).json({ error: 'Position is required' });
        return;
      }

      const showcase = await this.showcaseService.updateAchievementPosition(
        userId,
        showcaseId,
        achievementId,
        position,
        scale,
        rotation
      );
      res.json(showcase);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update achievement position' });
    }
  }

  public async likeShowcase(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { showcaseId } = req.params;

      const showcase = await this.showcaseService.likeShowcase(userId, showcaseId);
      res.json(showcase);
    } catch (error) {
      res.status(500).json({ error: 'Failed to like showcase' });
    }
  }

  public async viewShowcase(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { showcaseId } = req.params;

      const showcase = await this.showcaseService.viewShowcase(userId, showcaseId);
      res.json(showcase);
    } catch (error) {
      res.status(500).json({ error: 'Failed to record showcase view' });
    }
  }

  public async addComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { showcaseId } = req.params;
      const { content } = req.body;

      if (!content) {
        res.status(400).json({ error: 'Comment content is required' });
        return;
      }

      const comment = await this.showcaseService.addComment(
        userId,
        showcaseId,
        content
      );
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }

  public async getShowcaseComments(req: Request, res: Response): Promise<void> {
    try {
      const { showcaseId } = req.params;
      const comments = await this.showcaseService.getShowcaseComments(showcaseId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }

  public async getUserShowcases(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const showcases = await this.showcaseService.getUserShowcases(userId);
      res.json(showcases);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user showcases' });
    }
  }

  public async getPublicShowcases(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.query;
      const showcases = await this.showcaseService.getPublicShowcases(filter);
      res.json(showcases);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch public showcases' });
    }
  }

  public async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const stats = await this.showcaseService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  }
}