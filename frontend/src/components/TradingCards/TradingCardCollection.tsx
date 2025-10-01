import React, { useState } from 'react';
import { useTradingCards } from '../../hooks/useTradingCards';
import { TradingCard, CardRarity } from '../../types/tradingCards';

const RARITY_COLORS = {
  COMMON: 'bg-gray-500',
  UNCOMMON: 'bg-green-500',
  RARE: 'bg-blue-500',
  EPIC: 'bg-purple-500',
  LEGENDARY: 'bg-yellow-500',
  MYTHIC: 'bg-red-500'
};

export function TradingCardCollection() {
  const {
    collection,
    activeTrades,
    loading,
    error,
    mintCard,
    createTrade,
    respondToTrade
  } = useTradingCards();

  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [tradeMode, setTradeMode] = useState(false);

  if (loading) {
    return <div className="p-4">Loading card collection...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!collection) {
    return <div className="p-4">No collection found</div>;
  }

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCards(newSelection);
  };

  const renderCard = (card: TradingCard) => (
    <div
      key={card.id}
      className={`
        relative rounded-lg overflow-hidden shadow-lg
        ${tradeMode ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''}
        ${selectedCards.has(card.id) ? 'ring-2 ring-blue-500' : ''}
      `}
      onClick={() => tradeMode && toggleCardSelection(card.id)}
    >
      <img
        src={card.imageUrl}
        alt={card.name}
        className="w-full h-48 object-cover"
      />
      <div className={`${RARITY_COLORS[card.rarity]} p-2`}>
        <h3 className="text-white font-bold">{card.name}</h3>
        <p className="text-white text-sm">{card.description}</p>
      </div>
      <div className="p-2 bg-gray-800">
        <div className="flex justify-between text-white text-sm">
          <span>#{card.mintNumber}</span>
          <span>{card.type}</span>
        </div>
        {card.attributes && (
          <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
            {Object.entries(card.attributes).map(([key, value]) => (
              typeof value === 'number' && (
                <div key={key} className="text-gray-300">
                  {key}: {value}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold text-white mb-2">Collection Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-white">
          <span className="block text-gray-400">Total Cards</span>
          {collection.stats.totalCards}
        </div>
        <div className="text-white">
          <span className="block text-gray-400">Unique Cards</span>
          {collection.stats.uniqueCards}
        </div>
        <div className="text-white">
          <span className="block text-gray-400">Complete Sets</span>
          {collection.stats.completeSets}
        </div>
        <div className="text-white">
          <span className="block text-gray-400">Rarest Card</span>
          {Object.entries(collection.stats.byRarity)
            .sort(([a], [b]) => {
              const rarityOrder = ['MYTHIC', 'LEGENDARY', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON'];
              return rarityOrder.indexOf(a as CardRarity) - rarityOrder.indexOf(b as CardRarity);
            })[0][0]}
        </div>
      </div>
    </div>
  );

  const renderTrades = () => (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold text-white mb-2">Active Trades</h2>
      <div className="space-y-2">
        {activeTrades.map(trade => (
          <div
            key={trade.id}
            className="bg-gray-700 rounded p-2 flex justify-between items-center"
          >
            <div className="text-white">
              <span className="block text-sm">
                {trade.initiatorId === collection.userId ? 'Outgoing' : 'Incoming'} Trade
              </span>
              <span className="text-sm text-gray-400">
                Offering: {trade.offeredCards.length} cards
                Requesting: {trade.requestedCards.length} cards
              </span>
            </div>
            {trade.receiverId === collection.userId && (
              <div className="space-x-2">
                <button
                  onClick={() => respondToTrade(trade.id, true)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => respondToTrade(trade.id, false)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      {renderStats()}
      {activeTrades.length > 0 && renderTrades()}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Your Cards</h2>
        <div className="space-x-2">
          <button
            onClick={() => setTradeMode(!tradeMode)}
            className={`px-4 py-2 rounded ${
              tradeMode
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {tradeMode ? 'Cancel Trade' : 'Trade Cards'}
          </button>
          <button
            onClick={() => mintCard('Dragon Warrior')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            Mint New Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {collection.cards.map(renderCard)}
      </div>
    </div>
  );
}