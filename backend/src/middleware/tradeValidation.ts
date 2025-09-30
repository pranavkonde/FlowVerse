import { Request, Response, NextFunction } from 'express';
import { tradeValidationService } from '../services/TradeValidationService';
import { tradingService } from '../services/TradingService';

export const validateTradeOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const offerId = req.params.offerId || req.body.offerId;
    if (!offerId) {
      return res.status(400).json({ error: 'Trade offer ID is required' });
    }

    const offer = await tradingService.getTradeOffer(offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Trade offer not found' });
    }

    const validation = await tradeValidationService.validateTradeOffer(offer);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid trade offer',
        details: validation.errors
      });
    }

    // Add validated offer to request for use in route handlers
    req.tradeOffer = offer;
    next();
  } catch (error) {
    console.error('Error validating trade offer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const validateTradeParticipant = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  const offer = req.tradeOffer;

  if (!userId || !offer) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (userId !== offer.initiatorId && userId !== offer.recipientId) {
    return res.status(403).json({ error: 'Not a participant in this trade' });
  }

  next();
};

export const validateTradeStatus = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const offer = req.tradeOffer;

  if (!offer) {
    return res.status(400).json({ error: 'Trade offer not found' });
  }

  if (offer.status !== 'pending') {
    return res.status(400).json({
      error: 'Invalid trade status',
      details: `Trade is ${offer.status}`
    });
  }

  next();
};

export const validateTradeItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items format' });
    }

    // Additional item-specific validations could be added here
    // For example, checking if items exist in inventory, are tradeable, etc.

    next();
  } catch (error) {
    console.error('Error validating trade items:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const validateTradeTokens = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { tokens } = req.body;

  if (typeof tokens !== 'undefined') {
    if (typeof tokens !== 'number' || tokens < 0) {
      return res.status(400).json({ error: 'Invalid token amount' });
    }
  }

  next();
};

// Rate limiting middleware to prevent trade spam
export const tradeRateLimit = (() => {
  const attempts = new Map<string, { count: number; timestamp: number }>();
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 60000; // 1 minute

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = Date.now();
    const userAttempts = attempts.get(userId);

    if (!userAttempts || (now - userAttempts.timestamp) > WINDOW_MS) {
      attempts.set(userId, { count: 1, timestamp: now });
    } else if (userAttempts.count >= MAX_ATTEMPTS) {
      return res.status(429).json({
        error: 'Too many trade attempts',
        retryAfter: Math.ceil((WINDOW_MS - (now - userAttempts.timestamp)) / 1000)
      });
    } else {
      attempts.set(userId, {
        count: userAttempts.count + 1,
        timestamp: userAttempts.timestamp
      });
    }

    next();
  };
})();

