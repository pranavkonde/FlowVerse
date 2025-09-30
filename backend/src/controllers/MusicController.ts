import { Request, Response } from 'express';
import { musicService } from '../services/MusicService';

export class MusicController {
  async startPerformance(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { scoreId, instrumentId } = req.body;
      if (!scoreId || !instrumentId) {
        return res.status(400).json({ error: 'Score ID and instrument ID are required' });
      }

      try {
        const performance = await musicService.startPerformance(
          userId,
          scoreId,
          instrumentId
        );
        return res.json(performance);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error starting performance:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async playNote(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { performanceId } = req.params;
      const { pitch, velocity, timestamp } = req.body;
      if (!performanceId || !pitch || typeof velocity !== 'number' || typeof timestamp !== 'number') {
        return res.status(400).json({ error: 'Invalid note data' });
      }

      try {
        await musicService.playNote(performanceId, { pitch, velocity, timestamp });
        return res.json({ success: true });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error playing note:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async endPerformance(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { performanceId } = req.params;
      if (!performanceId) {
        return res.status(400).json({ error: 'Performance ID is required' });
      }

      try {
        const performance = await musicService.endPerformance(performanceId);
        return res.json(performance);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error ending performance:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async listenToPerformance(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { performanceId } = req.params;
      if (!performanceId) {
        return res.status(400).json({ error: 'Performance ID is required' });
      }

      try {
        await musicService.listenToPerformance(performanceId, userId);
        return res.json({ success: true });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error listening to performance:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addReaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { performanceId } = req.params;
      const { type } = req.body;
      if (!performanceId || !type) {
        return res.status(400).json({ error: 'Performance ID and reaction type are required' });
      }

      try {
        await musicService.addReaction(performanceId, userId, type);
        return res.json({ success: true });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAvailableInstruments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const instruments = await musicService.getAvailableInstruments(userId);
      return res.json(instruments);
    } catch (error) {
      console.error('Error getting available instruments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAvailableScores(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const scores = await musicService.getAvailableScores(userId);
      return res.json(scores);
    } catch (error) {
      console.error('Error getting available scores:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getActivePerformances(req: Request, res: Response) {
    try {
      const performances = await musicService.getActivePerformances();
      return res.json(performances);
    } catch (error) {
      console.error('Error getting active performances:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await musicService.getStats(userId);
      return res.json(stats);
    } catch (error) {
      console.error('Error getting music stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const musicController = new MusicController();
