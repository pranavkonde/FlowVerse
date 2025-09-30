import { Request, Response } from 'express';
import { inventoryService } from '../services/InventoryService';

export class InventoryController {
  async getInventory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const inventory = await inventoryService.getInventory(userId);
      return res.json(inventory);
    } catch (error) {
      console.error('Error getting inventory:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const item = req.body;
      if (!item || !item.itemId || !item.name || !item.type) {
        return res.status(400).json({ error: 'Invalid item data' });
      }

      const success = await inventoryService.addItem(userId, item);
      if (!success) {
        return res.status(400).json({ error: 'Inventory is full' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error adding item:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async removeItem(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { itemId, quantity } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: 'Item ID is required' });
      }

      const success = await inventoryService.removeItem(userId, itemId, quantity);
      if (!success) {
        return res.status(404).json({ error: 'Item not found' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error removing item:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async moveItem(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { fromSlotId, toSlotId } = req.body;
      if (!fromSlotId || !toSlotId) {
        return res.status(400).json({ error: 'Source and destination slot IDs are required' });
      }

      const success = await inventoryService.moveItem(userId, fromSlotId, toSlotId);
      if (!success) {
        return res.status(400).json({ error: 'Invalid move operation' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error moving item:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEquippedItems(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const equippedItems = await inventoryService.getEquippedItems(userId);
      return res.json(equippedItems);
    } catch (error) {
      console.error('Error getting equipped items:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getQuickbarItems(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const quickbarItems = await inventoryService.getQuickbarItems(userId);
      return res.json(quickbarItems);
    } catch (error) {
      console.error('Error getting quickbar items:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const inventoryController = new InventoryController();

