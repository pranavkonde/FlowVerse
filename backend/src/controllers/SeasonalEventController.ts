import { Request, Response } from 'express';
import { SeasonalEventService } from '../services/SeasonalEventService';

export class SeasonalEventController {
  private eventService: SeasonalEventService;

  constructor(eventService: SeasonalEventService) {
    this.eventService = eventService;
  }

  public async getEventCalendar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const calendar = await this.eventService.getEventCalendar(userId);
      res.json(calendar);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch event calendar' });
    }
  }

  public async joinEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { eventId } = req.body;

      if (!eventId) {
        res.status(400).json({ error: 'Event ID is required' });
        return;
      }

      const progress = await this.eventService.joinEvent(userId, eventId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to join event' });
    }
  }

  public async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { eventId, requirementType, amount } = req.body;

      if (!eventId || !requirementType || typeof amount !== 'number') {
        res.status(400).json({ error: 'Invalid progress update parameters' });
        return;
      }

      const progress = await this.eventService.updateProgress(
        userId,
        eventId,
        requirementType,
        amount
      );
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update event progress' });
    }
  }

  public async claimReward(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { eventId, rewardIndex } = req.body;

      if (!eventId || typeof rewardIndex !== 'number') {
        res.status(400).json({ error: 'Invalid reward claim parameters' });
        return;
      }

      const progress = await this.eventService.claimReward(
        userId,
        eventId,
        rewardIndex
      );
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to claim reward' });
    }
  }
}