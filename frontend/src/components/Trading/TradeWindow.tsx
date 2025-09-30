import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { InventoryItem } from '../Inventory/InventoryGrid';

interface TradeOffer {
  id: string;
  initiatorId: string;
  recipientId: string;
  initiatorItems: InventoryItem[];
  recipientItems: InventoryItem[];
  initiatorTokens: number;
  recipientTokens: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  initiatorAccepted: boolean;
  recipientAccepted: boolean;
  createdAt: Date;
  expiresAt: Date;
}

interface TradeSlotProps {
  item: InventoryItem | null;
  onRemove: () => void;
  isLocked: boolean;
}

const TradeSlot: React.FC<TradeSlotProps> = ({ item, onRemove, isLocked }) => {
  return (
    <div className="w-16 h-16 border-2 rounded-lg bg-gray-700 relative">
      {item && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full h-full p-1"
        >
          <div className="relative w-full h-full">
            {/* Item icon/image would go here */}
            <div className="absolute bottom-0 right-0 text-xs bg-gray-800 px-1 rounded">
              {item.quantity > 1 && item.quantity}
            </div>
            {!isLocked && (
              <button
                onClick={onRemove}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export const TradeWindow: React.FC<{
  tradePartnerId: string;
  onClose: () => void;
}> = ({ tradePartnerId, onClose }) => {
  const [offer, setOffer] = useState<TradeOffer | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [initiatorTokens, setInitiatorTokens] = useState(0);
  const [recipientTokens, setRecipientTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'tradeUpdate' && data.offer.id === offer?.id) {
        setOffer(data.offer);
      }
    };

    return () => ws.close();
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const createOffer = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/trading/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: tradePartnerId,
          initiatorItems: [],
          initiatorTokens: 0,
        }),
      });

      const data = await response.json();
      setOffer(data);
    } catch (error) {
      console.error('Error creating trade offer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOffer = async (items: InventoryItem[], tokens: number, isInitiator: boolean) => {
    if (!offer) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/trading/offers/${offer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          tokens,
          isInitiator,
        }),
      });

      const data = await response.json();
      setOffer(data);
    } catch (error) {
      console.error('Error updating trade offer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptOffer = async () => {
    if (!offer) return;

    try {
      setIsLoading(true);
      await fetch(`/api/trading/offers/${offer.id}/accept`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error accepting trade offer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const rejectOffer = async () => {
    if (!offer) return;

    try {
      setIsLoading(true);
      await fetch(`/api/trading/offers/${offer.id}/reject`, {
        method: 'POST',
      });
      onClose();
    } catch (error) {
      console.error('Error rejecting trade offer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Trade Window</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="flex gap-8">
            {/* Your Offer */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-4">Your Offer</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {offer?.initiatorItems.map((item, index) => (
                  <TradeSlot
                    key={index}
                    item={item}
                    onRemove={() => {
                      const newItems = offer.initiatorItems.filter((_, i) => i !== index);
                      updateOffer(newItems, initiatorTokens, true);
                    }}
                    isLocked={offer.initiatorAccepted}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="number"
                  value={initiatorTokens}
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    setInitiatorTokens(value);
                    if (offer) {
                      updateOffer(offer.initiatorItems, value, true);
                    }
                  }}
                  className="bg-gray-700 text-white px-4 py-2 rounded w-32"
                  placeholder="Tokens"
                  disabled={offer?.initiatorAccepted}
                />
                <span className="text-gray-400">Tokens</span>
              </div>
            </div>

            {/* Their Offer */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-4">Their Offer</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {offer?.recipientItems.map((item, index) => (
                  <TradeSlot
                    key={index}
                    item={item}
                    onRemove={() => {
                      const newItems = offer.recipientItems.filter((_, i) => i !== index);
                      updateOffer(newItems, recipientTokens, false);
                    }}
                    isLocked={offer.recipientAccepted}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="number"
                  value={recipientTokens}
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    setRecipientTokens(value);
                    if (offer) {
                      updateOffer(offer.recipientItems, value, false);
                    }
                  }}
                  className="bg-gray-700 text-white px-4 py-2 rounded w-32"
                  placeholder="Tokens"
                  disabled={offer?.recipientAccepted}
                />
                <span className="text-gray-400">Tokens</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={acceptOffer}
              disabled={isLoading || !offer}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Accept
            </button>
            <button
              onClick={rejectOffer}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              Reject
            </button>
          </div>

          {/* Trade Status */}
          {offer && (
            <div className="mt-4 text-center">
              <p className="text-gray-400">
                {offer.initiatorAccepted && 'You have accepted the trade. '}
                {offer.recipientAccepted && 'They have accepted the trade. '}
                {!offer.initiatorAccepted && !offer.recipientAccepted &&
                  'Waiting for both parties to accept...'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </DndProvider>
  );
};

