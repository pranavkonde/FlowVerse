import { Request, Response } from 'express';
import { JournalService } from '../services/JournalService';

export class JournalController {
  private journalService: JournalService;

  constructor(journalService: JournalService) {
    this.journalService = journalService;
  }

  public async createEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const entry = await this.journalService.createEntry(userId, req.body);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create journal entry' });
    }
  }

  public async updateEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { entryId } = req.params;

      const entry = await this.journalService.updateEntry(
        userId,
        entryId,
        req.body
      );
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update journal entry' });
    }
  }

  public async deleteEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { entryId } = req.params;

      await this.journalService.deleteEntry(userId, entryId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete journal entry' });
    }
  }

  public async createCollection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const collection = await this.journalService.createCollection(
        userId,
        req.body
      );
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create collection' });
    }
  }

  public async updateCollection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { collectionId } = req.params;

      const collection = await this.journalService.updateCollection(
        userId,
        collectionId,
        req.body
      );
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update collection' });
    }
  }

  public async addEntryToCollection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { collectionId, entryId } = req.params;

      const collection = await this.journalService.addEntryToCollection(
        userId,
        entryId,
        collectionId
      );
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add entry to collection' });
    }
  }

  public async removeEntryFromCollection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { collectionId, entryId } = req.params;

      const collection = await this.journalService.removeEntryFromCollection(
        userId,
        entryId,
        collectionId
      );
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove entry from collection' });
    }
  }

  public async searchEntries(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const entries = await this.journalService.searchEntries(
        userId,
        req.query
      );
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search entries' });
    }
  }

  public async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const stats = await this.journalService.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  }

  public async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await this.journalService.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  public async getUserCollections(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const collections = await this.journalService.getUserCollections(userId);
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user collections' });
    }
  }

  public async getEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { entryId } = req.params;

      const entry = await this.journalService.getEntry(userId, entryId);
      if (!entry) {
        res.status(404).json({ error: 'Entry not found' });
        return;
      }

      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch entry' });
    }
  }
}