import { Request, Response } from 'express';
import { journalService } from '../services/JournalService';

export class JournalController {
  async createEntry(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { type, title, description, category, tags, metadata } = req.body;
      if (!type || !title || !description || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const entry = await journalService.createEntry({
        userId,
        type,
        title,
        description,
        category,
        tags: tags || [],
        metadata: metadata || {}
      });

      return res.json(entry);
    } catch (error) {
      console.error('Error creating journal entry:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateEntry(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { entryId } = req.params;
      const updates = req.body;
      if (!entryId) {
        return res.status(400).json({ error: 'Entry ID is required' });
      }

      try {
        const entry = await journalService.updateEntry(entryId, userId, updates);
        return res.json(entry);
      } catch (err) {
        return res.status(403).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error updating journal entry:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteEntry(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { entryId } = req.params;
      if (!entryId) {
        return res.status(400).json({ error: 'Entry ID is required' });
      }

      try {
        await journalService.deleteEntry(entryId, userId);
        return res.json({ success: true });
      } catch (err) {
        return res.status(403).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createCollection(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, description, isDefault } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Collection name is required' });
      }

      const collection = await journalService.createCollection(userId, {
        name,
        description: description || '',
        isDefault
      });

      return res.json(collection);
    } catch (error) {
      console.error('Error creating journal collection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateCollection(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { collectionId } = req.params;
      const updates = req.body;
      if (!collectionId) {
        return res.status(400).json({ error: 'Collection ID is required' });
      }

      try {
        const collection = await journalService.updateCollection(
          collectionId,
          userId,
          updates
        );
        return res.json(collection);
      } catch (err) {
        return res.status(403).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error updating journal collection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteCollection(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { collectionId } = req.params;
      if (!collectionId) {
        return res.status(400).json({ error: 'Collection ID is required' });
      }

      try {
        await journalService.deleteCollection(collectionId, userId);
        return res.json({ success: true });
      } catch (err) {
        return res.status(403).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error deleting journal collection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addEntryToCollection(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { collectionId, entryId } = req.params;
      if (!collectionId || !entryId) {
        return res.status(400).json({ error: 'Collection ID and Entry ID are required' });
      }

      try {
        await journalService.addEntryToCollection(entryId, collectionId, userId);
        return res.json({ success: true });
      } catch (err) {
        return res.status(403).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error adding entry to collection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removeEntryFromCollection(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { collectionId, entryId } = req.params;
      if (!collectionId || !entryId) {
        return res.status(400).json({ error: 'Collection ID and Entry ID are required' });
      }

      try {
        await journalService.removeEntryFromCollection(entryId, collectionId, userId);
        return res.json({ success: true });
      } catch (err) {
        return res.status(403).json({ error: err.message });
      }
    } catch (error) {
      console.error('Error removing entry from collection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserEntries(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        type,
        category,
        tags,
        startDate,
        endDate,
        searchText
      } = req.query;

      const filters: any = {};
      if (type) filters.type = type;
      if (category) filters.category = category;
      if (tags) filters.tags = (tags as string).split(',');
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (searchText) filters.searchText = searchText;

      const entries = await journalService.getUserEntries(userId, filters);
      return res.json(entries);
    } catch (error) {
      console.error('Error getting user entries:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserCollections(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const collections = await journalService.getUserCollections(userId);
      return res.json(collections);
    } catch (error) {
      console.error('Error getting user collections:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await journalService.getStats(userId);
      return res.json(stats);
    } catch (error) {
      console.error('Error getting journal stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const journalController = new JournalController();
