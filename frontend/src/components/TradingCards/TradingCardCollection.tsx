import React, { useState } from 'react';
import { TradingCard, CardCollection, RARITY_COLORS, CARD_TYPES } from '../../types/tradingCards';
import { useTradingCards } from '../../hooks/useTradingCards';

export const TradingCardCollection: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<TradingCard | null>(null);
  const { collection, loading, error, generateCard, tradeCard } = useTradingCards();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading collection: {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Trading Card Collection</h2>
        <button
          onClick={() => generateCard('character')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Generate New Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <CollectionStats collection={collection} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {collection?.cards.map((card) => (
          <CardDisplay
            key={card.id}
            card={card}
            onClick={() => setSelectedCard(card)}
          />
        ))}
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onTrade={tradeCard}
        />
      )}
    </div>
  );
};

const CollectionStats: React.FC<{ collection: CardCollection | null }> = ({ collection }) => {
  if (!collection) return null;

  return (
    <>
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Collection Stats</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Total Cards:</span>
            <span className="text-white">{collection.stats.totalCards}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Unique Cards:</span>
            <span className="text-white">{collection.stats.uniqueCards}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Rarity Distribution</h3>
        <div className="space-y-2">
          {Object.entries(collection.stats.rarityCount).map(([rarity, count]) => (
            <div key={rarity} className="flex justify-between">
              <span className={`text-${RARITY_COLORS[rarity as keyof typeof RARITY_COLORS]}-400`}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}:
              </span>
              <span className="text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const CardDisplay: React.FC<{
  card: TradingCard;
  onClick: () => void;
}> = ({ card, onClick }) => {
  const rarityColor = RARITY_COLORS[card.rarity];
  
  return (
    <div
      onClick={onClick}
      className={`bg-gray-700 rounded-lg p-4 cursor-pointer transform hover:scale-105 transition-transform border-2 border-${rarityColor}-500`}
    >
      <div className="relative">
        <img
          src={card.metadata.imageUrl}
          alt={card.name}
          className="w-full h-48 object-cover rounded"
        />
        <span className={`absolute top-2 right-2 px-2 py-1 rounded text-sm bg-${rarityColor}-500 text-white`}>
          {card.rarity}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-white">{card.name}</h3>
        <p className="text-gray-300 text-sm">{CARD_TYPES[card.type]}</p>
        
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Level:</span>
            <span className="text-white">{card.stats.level}</span>
          </div>
          {card.stats.specialAbility && (
            <div className="text-sm text-primary">{card.stats.specialAbility}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const CardModal: React.FC<{
  card: TradingCard;
  onClose: () => void;
  onTrade: (cardId: string, toUserId: string) => Promise<void>;
}> = ({ card, onClose, onTrade }) => {
  const [tradingWith, setTradingWith] = useState('');
  const [isTrading, setIsTrading] = useState(false);

  const handleTrade = async () => {
    if (!tradingWith) return;
    
    setIsTrading(true);
    try {
      await onTrade(card.id, tradingWith);
      onClose();
    } catch (error) {
      console.error('Trade failed:', error);
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">{card.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <img
            src={card.metadata.imageUrl}
            alt={card.name}
            className="w-full h-64 object-cover rounded"
          />

          <div className="space-y-2">
            <p className="text-gray-300">{card.metadata.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-400">Stats</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Level:</span>
                    <span className="text-white">{card.stats.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Experience:</span>
                    <span className="text-white">{card.stats.experience}</span>
                  </div>
                  {card.stats.combatRating && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Combat:</span>
                      <span className="text-white">{card.stats.combatRating}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-400">Details</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Edition:</span>
                    <span className="text-white">{card.metadata.edition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Condition:</span>
                    <span className="text-white">{card.mintCondition}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Serial:</span>
                    <span className="text-white">{card.metadata.serialNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {card.tradeable && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Trade Card</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tradingWith}
                    onChange={(e) => setTradingWith(e.target.value)}
                    placeholder="Enter player ID"
                    className="flex-1 bg-gray-700 text-white rounded px-3 py-2"
                  />
                  <button
                    onClick={handleTrade}
                    disabled={!tradingWith || isTrading}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                  >
                    {isTrading ? 'Trading...' : 'Trade'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
