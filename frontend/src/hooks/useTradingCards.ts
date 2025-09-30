import { useState, useEffect } from 'react';
import { TradingCard, CardCollection } from '../types/tradingCards';
import { api } from '../services/api';

interface UseTradingCardsResult {
  collection: CardCollection | null;
  loading: boolean;
  error: string | null;
  generateCard: (type: TradingCard['type']) => Promise<void>;
  tradeCard: (cardId: string, toUserId: string) => Promise<void>;
  refreshCollection: () => Promise<void>;
}

export function useTradingCards(): UseTradingCardsResult {
  const [collection, setCollection] = useState<CardCollection | null>(null);
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
      console.error('Error fetching card collection:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateCard = async (type: TradingCard['type']) => {
    try {
      const response = await api.post('/trading-cards/generate', { type });
      if (collection) {
        setCollection({
          ...collection,
          cards: [...collection.cards, response.data],
          stats: {
            ...collection.stats,
            totalCards: collection.stats.totalCards + 1,
            rarityCount: {
              ...collection.stats.rarityCount,
              [response.data.rarity]: (collection.stats.rarityCount[response.data.rarity] || 0) + 1
            }
          }
        });
      }
    } catch (err) {
      console.error('Error generating card:', err);
      throw err;
    }
  };

  const tradeCard = async (cardId: string, toUserId: string) => {
    try {
      await api.post('/trading-cards/trade', { cardId, toUserId });
      
      if (collection) {
        const tradedCard = collection.cards.find(card => card.id === cardId);
        if (tradedCard) {
          setCollection({
            ...collection,
            cards: collection.cards.filter(card => card.id !== cardId),
            stats: {
              ...collection.stats,
              totalCards: collection.stats.totalCards - 1,
              rarityCount: {
                ...collection.stats.rarityCount,
                [tradedCard.rarity]: collection.stats.rarityCount[tradedCard.rarity] - 1
              }
            }
          });
        }
      }
    } catch (err) {
      console.error('Error trading card:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCollection();
  }, []);

  return {
    collection,
    loading,
    error,
    generateCard,
    tradeCard,
    refreshCollection: fetchCollection
  };
}
