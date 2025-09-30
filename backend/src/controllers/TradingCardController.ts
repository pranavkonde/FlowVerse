import { Request, Response } from 'express';
import { tradingCardService } from '../services/TradingCardService';

export class TradingCardController {
  async generateCard(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { type } = req.body;
      if (!type) {
        return res.status(400).json({ error: 'Card type is required' });
      }

      const card = await tradingCardService.generateCard(userId, type);
      await tradingCardService.addCardToCollection(userId, card);

      return res.json(card);
    } catch (error) {
      console.error('Error generating card:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCollection(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const collection = await tradingCardService.getCollection(userId);
      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      return res.json(collection);
    } catch (error) {
      console.error('Error getting collection:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCard(req: Request, res: Response) {
    try {
      const { cardId } = req.params;
      if (!cardId) {
        return res.status(400).json({ error: 'Card ID is required' });
      }

      const card = await tradingCardService.getCard(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      return res.json(card);
    } catch (error) {
      console.error('Error getting card:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async tradeCard(req: Request, res: Response) {
    try {
      const fromUserId = req.user?.id;
      if (!fromUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { toUserId, cardId } = req.body;
      if (!toUserId || !cardId) {
        return res.status(400).json({ error: 'Recipient ID and card ID are required' });
      }

      const success = await tradingCardService.tradeCard(fromUserId, toUserId, cardId);
      if (!success) {
        return res.status(400).json({ error: 'Trade failed' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error trading card:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const tradingCardController = new TradingCardController();
