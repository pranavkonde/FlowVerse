import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';

interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'cosmetic';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stackable: boolean;
  quantity: number;
  stats?: {
    damage?: number;
    defense?: number;
    healing?: number;
    durability?: number;
  };
  equipped?: boolean;
  position: {
    x: number;
    y: number;
  };
}

interface InventorySlot {
  id: string;
  item: InventoryItem | null;
  type: 'general' | 'equipment' | 'quickbar';
  position: {
    x: number;
    y: number;
  };
}

const InventorySlotComponent: React.FC<{
  slot: InventorySlot;
  onMove: (fromId: string, toId: string) => void;
}> = ({ slot, onMove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'INVENTORY_ITEM',
    item: { sourceSlotId: slot.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'INVENTORY_ITEM',
    drop: (item: { sourceSlotId: string }) => {
      onMove(item.sourceSlotId, slot.id);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const getRarityColor = (rarity: InventoryItem['rarity']) => {
    const colors = {
      common: 'border-gray-400',
      uncommon: 'border-green-400',
      rare: 'border-blue-400',
      epic: 'border-purple-400',
      legendary: 'border-yellow-400'
    };
    return colors[rarity] || colors.common;
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`
        w-16 h-16 border-2 rounded-lg
        ${isOver ? 'bg-gray-600' : 'bg-gray-700'}
        ${slot.item ? getRarityColor(slot.item.rarity) : 'border-gray-600'}
        transition-colors duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {slot.item && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full h-full p-1 cursor-move"
        >
          <div className="relative w-full h-full">
            {/* Item icon/image would go here */}
            <div className="absolute bottom-0 right-0 text-xs bg-gray-800 px-1 rounded">
              {slot.item.quantity > 1 && slot.item.quantity}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const EquipmentSlots: React.FC<{
  slots: InventorySlot[];
  onMove: (fromId: string, toId: string) => void;
}> = ({ slots, onMove }) => {
  return (
    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-800 rounded-lg">
      {slots.map((slot) => (
        <InventorySlotComponent key={slot.id} slot={slot} onMove={onMove} />
      ))}
    </div>
  );
};

const QuickbarSlots: React.FC<{
  slots: InventorySlot[];
  onMove: (fromId: string, toId: string) => void;
}> = ({ slots, onMove }) => {
  return (
    <div className="flex gap-2 p-4 bg-gray-800 rounded-lg">
      {slots.map((slot) => (
        <InventorySlotComponent key={slot.id} slot={slot} onMove={onMove} />
      ))}
    </div>
  );
};

export const InventoryGrid: React.FC = () => {
  const [inventory, setInventory] = useState<InventorySlot[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleMove = async (fromSlotId: string, toSlotId: string) => {
    try {
      const response = await fetch('/api/inventory/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromSlotId,
          toSlotId,
        }),
      });

      if (response.ok) {
        fetchInventory(); // Refresh inventory after successful move
      }
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  const equipmentSlots = inventory.filter(slot => slot.type === 'equipment');
  const quickbarSlots = inventory.filter(slot => slot.type === 'quickbar');
  const generalSlots = inventory.filter(slot => slot.type === 'general');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg max-w-4xl">
        <div className="flex gap-4">
          <div className="flex-1">
            <h2 className="text-white text-lg font-semibold mb-2">Equipment</h2>
            <EquipmentSlots slots={equipmentSlots} onMove={handleMove} />
          </div>
          
          {selectedItem && (
            <div className="w-64 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white font-semibold">{selectedItem.name}</h3>
              <p className="text-gray-400 text-sm">{selectedItem.description}</p>
              {selectedItem.stats && (
                <div className="mt-2">
                  {Object.entries(selectedItem.stats).map(([stat, value]) => (
                    <div key={stat} className="text-sm text-gray-300">
                      {stat}: {value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-white text-lg font-semibold mb-2">Quickbar</h2>
          <QuickbarSlots slots={quickbarSlots} onMove={handleMove} />
        </div>

        <div>
          <h2 className="text-white text-lg font-semibold mb-2">Inventory</h2>
          <div className="grid grid-cols-8 gap-2 p-4 bg-gray-800 rounded-lg">
            {generalSlots.map((slot) => (
              <InventorySlotComponent
                key={slot.id}
                slot={slot}
                onMove={handleMove}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

