import { Request, Response } from 'express';
import { tradingService } from '../services/TradingService';

export class TradingController {
  async createTradeOffer(req: Request, res: Response) {
    try {
      const initiatorId = req.user?.id;
      if (!initiatorId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { recipientId, initiatorItems, initiatorTokens } = req.body;
      if (!recipientId || !initiatorItems) {
        return res.status(400).json({ error: 'Recipient ID and initiator items are required' });
      }

      const offer = await tradingService.createTradeOffer(
        initiatorId,
        recipientId,
        initiatorItems,
        initiatorTokens
      );

      return res.json(offer);
    } catch (error) {
      console.error('Error creating trade offer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTradeOffer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({ error: 'Offer ID is required' });
      }

      const offer = await tradingService.getTradeOffer(offerId);
      if (!offer) {
        return res.status(404).json({ error: 'Trade offer not found' });
      }

      // Only allow participants to view the offer
      if (userId !== offer.initiatorId && userId !== offer.recipientId) {
        return res.status(403).json({ error: 'Not authorized to view this trade offer' });
      }

      return res.json(offer);
    } catch (error) {
      console.error('Error getting trade offer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserActiveOffers(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const offers = await tradingService.getUserActiveOffers(userId);
      return res.json(offers);
    } catch (error) {
      console.error('Error getting user active offers:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateRecipientOffer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { offerId } = req.params;
      const { recipientItems, recipientTokens } = req.body;
      if (!offerId || !recipientItems) {
        return res.status(400).json({ error: 'Offer ID and recipient items are required' });
      }

      const offer = await tradingService.getTradeOffer(offerId);
      if (!offer) {
        return res.status(404).json({ error: 'Trade offer not found' });
      }

      // Only recipient can update their offer
      if (userId !== offer.recipientId) {
        return res.status(403).json({ error: 'Not authorized to update this trade offer' });
      }

      const updatedOffer = await tradingService.updateRecipientOffer(
        offerId,
        recipientItems,
        recipientTokens
      );

      if (!updatedOffer) {
        return res.status(400).json({ error: 'Failed to update trade offer' });
      }

      return res.json(updatedOffer);
    } catch (error) {
      console.error('Error updating recipient offer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async acceptOffer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({ error: 'Offer ID is required' });
      }

      const success = await tradingService.acceptOffer(offerId, userId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to accept trade offer' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error accepting trade offer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async rejectOffer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({ error: 'Offer ID is required' });
      }

      const success = await tradingService.rejectOffer(offerId, userId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to reject trade offer' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error rejecting trade offer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async cancelOffer(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({ error: 'Offer ID is required' });
      }

      const success = await tradingService.cancelOffer(offerId, userId);
      if (!success) {
        return res.status(400).json({ error: 'Failed to cancel trade offer' });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Error cancelling trade offer:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const tradingController = new TradingController();
