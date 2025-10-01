import { Request, Response } from 'express';
import { TradingCardService } from '../services/TradingCardService';

export class TradingCardController {
  private cardService: TradingCardService;

  constructor(cardService: TradingCardService) {
    this.cardService = cardService;
  }

  public async mintCard(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { templateName } = req.body;

      if (!templateName) {
        res.status(400).json({ error: 'Template name is required' });
        return;
      }

      const card = await this.cardService.mintCard(userId, templateName);
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mint card' });
    }
  }

  public async getCollection(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const collection = await this.cardService.getUserCollection(userId);
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch collection' });
    }
  }

  public async createTrade(req: Request, res: Response): Promise<void> {
    try {
      const initiatorId = req.user.id;
      const { receiverId, offeredCards, requestedCards } = req.body;

      if (!receiverId || !offeredCards || !requestedCards) {
        res.status(400).json({ error: 'Missing required trade parameters' });
        return;
      }

      const trade = await this.cardService.createTrade(
        initiatorId,
        receiverId,
        offeredCards,
        requestedCards
      );
      res.json(trade);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create trade' });
    }
  }

  public async respondToTrade(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { tradeId, accept } = req.body;

      if (typeof accept !== 'boolean' || !tradeId) {
        res.status(400).json({ error: 'Invalid trade response parameters' });
        return;
      }

      const trade = await this.cardService.respondToTrade(tradeId, userId, accept);
      res.json(trade);
    } catch (error) {
      res.status(500).json({ error: 'Failed to respond to trade' });
    }
  }
}