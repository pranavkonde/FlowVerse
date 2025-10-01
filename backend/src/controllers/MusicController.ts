import { Request, Response } from 'express';
import { MusicService } from '../services/MusicService';

export class MusicController {
  private musicService: MusicService;

  constructor(musicService: MusicService) {
    this.musicService = musicService;
  }

  public async getInstruments(req: Request, res: Response): Promise<void> {
    try {
      const instruments = await this.musicService.getInstruments();
      res.json(instruments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch instruments' });
    }
  }

  public async getSongs(req: Request, res: Response): Promise<void> {
    try {
      const songs = await this.musicService.getSongs();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch songs' });
    }
  }

  public async startPerformance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { instrumentId, songId } = req.body;

      if (!instrumentId || !songId) {
        res.status(400).json({ error: 'Instrument ID and Song ID are required' });
        return;
      }

      const performance = await this.musicService.startPerformance(
        userId,
        instrumentId,
        songId
      );
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start performance' });
    }
  }

  public async endPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { performanceId, stats } = req.body;

      if (!performanceId || !stats) {
        res.status(400).json({ error: 'Performance ID and stats are required' });
        return;
      }

      const performance = await this.musicService.endPerformance(
        performanceId,
        stats
      );
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to end performance' });
    }
  }

  public async addReaction(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { performanceId, type } = req.body;

      if (!performanceId || !type) {
        res.status(400).json({ error: 'Performance ID and reaction type are required' });
        return;
      }

      const performance = await this.musicService.addReaction(
        performanceId,
        userId,
        type
      );
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add reaction' });
    }
  }

  public async addAudienceMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { performanceId } = req.params;

      if (!performanceId) {
        res.status(400).json({ error: 'Performance ID is required' });
        return;
      }

      const performance = await this.musicService.addAudienceMember(
        performanceId,
        userId
      );
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to join audience' });
    }
  }

  public async addEffect(req: Request, res: Response): Promise<void> {
    try {
      const { performanceId, effect } = req.body;

      if (!performanceId || !effect) {
        res.status(400).json({ error: 'Performance ID and effect details are required' });
        return;
      }

      const performance = await this.musicService.addEffect(
        performanceId,
        effect
      );
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add effect' });
    }
  }

  public async getPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { performanceId } = req.params;

      if (!performanceId) {
        res.status(400).json({ error: 'Performance ID is required' });
        return;
      }

      const performance = await this.musicService.getPerformance(performanceId);
      if (!performance) {
        res.status(404).json({ error: 'Performance not found' });
        return;
      }

      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch performance' });
    }
  }

  public async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const stats = await this.musicService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  }
}