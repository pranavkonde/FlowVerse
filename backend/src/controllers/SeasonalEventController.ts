import { Request, Response } from 'express';
import { seasonalEventService } from '../services/SeasonalEventService';

export class SeasonalEventController {
  async getCurrentSeason(req: Request, res: Response) {
    try {
      const season = await seasonalEventService.getCurrentSeason();
      if (!season) {
        return res.status(404).json({ error: 'No active season found' });
      }

      return res.json(season);
    } catch (error) {
      console.error('Error getting current season:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUpcomingSeasons(req: Request, res: Response) {
    try {
      const seasons = await seasonalEventService.getUpcomingSeasons();
      return res.json(seasons);
    } catch (error) {
      console.error('Error getting upcoming seasons:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getSeasonEvents(req: Request, res: Response) {
    try {
      const { seasonId } = req.params;
      if (!seasonId) {
        return res.status(400).json({ error: 'Season ID is required' });
      }

      const events = await seasonalEventService.getSeasonEvents(seasonId);
      return res.json(events);
    } catch (error) {
      console.error('Error getting season events:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async joinEvent(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { eventId } = req.params;
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      const success = await seasonalEventService.joinEvent(eventId, userId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to join event' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error joining event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateEventProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { eventId } = req.params;
      const { objectiveType, progress } = req.body;
      if (!eventId || !objectiveType || typeof progress !== 'number') {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      const success = await seasonalEventService.updateEventProgress(
        eventId,
        userId,
        objectiveType,
        progress
      );

      if (!success) {
        return res.status(400).json({ error: 'Failed to update progress' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error updating event progress:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEventProgress(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { eventId } = req.params;
      if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
      }

      const progress = await seasonalEventService.getEventProgress(eventId, userId);
      return res.json(progress);
    } catch (error) {
      console.error('Error getting event progress:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const seasonalEventController = new SeasonalEventController();
