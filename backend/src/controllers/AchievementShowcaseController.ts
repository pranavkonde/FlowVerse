import { Request, Response } from 'express';
import { achievementShowcaseService } from '../services/AchievementShowcaseService';

export class AchievementShowcaseController {
  async createShowcase(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, description, layout, themeId, isPublic } = req.body;
      if (!title || !layout || !themeId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const showcase = await achievementShowcaseService.createShowcase(userId, {
        title,
        description,
        layout,
        themeId,
        isPublic: isPublic ?? true
      });

      return res.json(showcase);
    } catch (error) {
      console.error('Error creating showcase:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addAchievement(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { showcaseId } = req.params;
      const { achievementId, position, scale, rotation, customDescription, customStyle } = req.body;
      if (!showcaseId || !achievementId || !position) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const achievement = await achievementShowcaseService.addAchievementToShowcase(
        showcaseId,
        userId,
        {
          achievementId,
          position,
          scale: scale || 1,
          rotation: rotation || 0,
          customDescription,
          customStyle
        }
      );

      return res.json(achievement);
    } catch (error) {
      console.error('Error adding achievement:', error);
      if (error.message.includes('not found or unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateAchievement(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { showcaseId, achievementId } = req.params;
      const updates = req.body;
      if (!showcaseId || !achievementId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const achievement = await achievementShowcaseService.updateAchievementInShowcase(
        showcaseId,
        achievementId,
        userId,
        updates
      );

      return res.json(achievement);
    } catch (error) {
      console.error('Error updating achievement:', error);
      if (error.message.includes('not found or unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removeAchievement(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { showcaseId, achievementId } = req.params;
      if (!showcaseId || !achievementId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const success = await achievementShowcaseService.removeAchievementFromShowcase(
        showcaseId,
        achievementId,
        userId
      );

      if (!success) {
        return res.status(404).json({ error: 'Achievement not found in showcase' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error removing achievement:', error);
      if (error.message.includes('not found or unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateShowcase(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { showcaseId } = req.params;
      const updates = req.body;
      if (!showcaseId) {
        return res.status(400).json({ error: 'Showcase ID is required' });
      }

      const showcase = await achievementShowcaseService.updateShowcase(
        showcaseId,
        userId,
        updates
      );

      return res.json(showcase);
    } catch (error) {
      console.error('Error updating showcase:', error);
      if (error.message.includes('not found or unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteShowcase(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { showcaseId } = req.params;
      if (!showcaseId) {
        return res.status(400).json({ error: 'Showcase ID is required' });
      }

      const success = await achievementShowcaseService.deleteShowcase(showcaseId, userId);
      if (!success) {
        return res.status(404).json({ error: 'Showcase not found' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting showcase:', error);
      if (error.message.includes('not found or unauthorized')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getShowcase(req: Request, res: Response) {
    try {
      const { showcaseId } = req.params;
      if (!showcaseId) {
        return res.status(400).json({ error: 'Showcase ID is required' });
      }

      const showcase = await achievementShowcaseService.getShowcase(showcaseId);
      if (!showcase) {
        return res.status(404).json({ error: 'Showcase not found' });
      }

      // Record view if viewer is authenticated
      if (req.user?.id) {
        await achievementShowcaseService.viewShowcase(showcaseId, req.user.id);
      }

      return res.json(showcase);
    } catch (error) {
      console.error('Error getting showcase:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserShowcases(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const showcases = await achievementShowcaseService.getUserShowcases(userId);
      return res.json(showcases);
    } catch (error) {
      console.error('Error getting user showcases:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPublicShowcases(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const showcases = await achievementShowcaseService.getPublicShowcases(limit, offset);
      return res.json(showcases);
    } catch (error) {
      console.error('Error getting public showcases:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async likeShowcase(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { showcaseId } = req.params;
      if (!showcaseId) {
        return res.status(400).json({ error: 'Showcase ID is required' });
      }

      const success = await achievementShowcaseService.likeShowcase(showcaseId, userId);
      return res.json({ success });
    } catch (error) {
      console.error('Error liking showcase:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async unlikeShowcase(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { showcaseId } = req.params;
      if (!showcaseId) {
        return res.status(400).json({ error: 'Showcase ID is required' });
      }

      const success = await achievementShowcaseService.unlikeShowcase(showcaseId, userId);
      return res.json({ success });
    } catch (error) {
      console.error('Error unliking showcase:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getShowcaseThemes(req: Request, res: Response) {
    try {
      const themes = await achievementShowcaseService.getShowcaseThemes();
      return res.json(themes);
    } catch (error) {
      console.error('Error getting showcase themes:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const achievementShowcaseController = new AchievementShowcaseController();
