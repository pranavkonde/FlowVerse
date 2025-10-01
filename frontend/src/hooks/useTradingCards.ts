import { useState, useEffect } from 'react';
import {
  TradingCard,
  CardCollection,
  CardTrade,
  TradeStatus
} from '../types/tradingCards';
import { api } from '../services/api';

interface UseTradingCardsResult {
  collection: CardCollection | null;
  activeTrades: CardTrade[];
  loading: boolean;
  error: string | null;
  mintCard: (templateName: string) => Promise<TradingCard>;
  refreshCollection: () => Promise<void>;
  createTrade: (
    receiverId: string,
    offeredCards: string[],
    requestedCards: string[]
  ) => Promise<CardTrade>;
  respondToTrade: (tradeId: string, accept: boolean) => Promise<CardTrade>;
}

export function useTradingCards(): UseTradingCardsResult {
  const [collection, setCollection] = useState<CardCollection | null>(null);
  const [activeTrades, setActiveTrades] = useState<CardTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trading-cards/collection');
      setCollection(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load card collection');
      console.error('Error fetching collection:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTrades = async () => {
    try {
      const response = await api.get('/trading-cards/trades/active');
      setActiveTrades(response.data);
    } catch (err) {
      console.error('Error fetching active trades:', err);
    }
  };

  const mintCard = async (templateName: string): Promise<TradingCard> => {
    try {
      const response = await api.post('/trading-cards/mint', { templateName });
      const newCard = response.data;
      
      setCollection(current => {
        if (!current) return null;
        return {
          ...current,
          cards: [...current.cards, newCard]
        };
      });

      return newCard;
    } catch (err) {
      console.error('Error minting card:', err);
      throw err;
    }
  };

  const createTrade = async (
    receiverId: string,
    offeredCards: string[],
    requestedCards: string[]
  ): Promise<CardTrade> => {
    try {
      const response = await api.post('/trading-cards/trades', {
        receiverId,
        offeredCards,
        requestedCards
      });
      
      const newTrade = response.data;
      setActiveTrades(current => [...current, newTrade]);
      
      return newTrade;
    } catch (err) {
      console.error('Error creating trade:', err);
      throw err;
    }
  };

  const respondToTrade = async (
    tradeId: string,
    accept: boolean
  ): Promise<CardTrade> => {
    try {
      const response = await api.post('/trading-cards/trades/respond', {
        tradeId,
        accept
      });
      
      const updatedTrade = response.data;
      setActiveTrades(current =>
        current.map(trade =>
          trade.id === tradeId ? updatedTrade : trade
        ).filter(trade => trade.status === 'PENDING')
      );

      if (updatedTrade.status === 'COMPLETED') {
        // Refresh collection to get updated cards
        await fetchCollection();
      }
      
      return updatedTrade;
    } catch (err) {
      console.error('Error responding to trade:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCollection();
    fetchActiveTrades();

    // Set up WebSocket listeners for real-time updates
    const socket = api.socket;

    socket.on('trade:created', ({ trade }) => {
      setActiveTrades(current => [...current, trade]);
    });

    socket.on('trade:responded', ({ trade }) => {
      setActiveTrades(current =>
        current.map(t => (t.id === trade.id ? trade : t))
          .filter(t => t.status === 'PENDING')
      );

      if (trade.status === 'COMPLETED') {
        fetchCollection();
      }
    });

    socket.on('trade:expired', ({ tradeId }) => {
      setActiveTrades(current =>
        current.filter(trade => trade.id !== tradeId)
      );
    });

    return () => {
      socket.off('trade:created');
      socket.off('trade:responded');
      socket.off('trade:expired');
    };
  }, []);

  return {
    collection,
    activeTrades,
    loading,
    error,
    mintCard,
    refreshCollection: fetchCollection,
    createTrade,
    respondToTrade
  };
}