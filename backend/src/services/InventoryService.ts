export interface InventoryItem {
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

export interface InventorySlot {
  id: string;
  item: InventoryItem | null;
  type: 'general' | 'equipment' | 'quickbar';
  position: {
    x: number;
    y: number;
  };
}

export class InventoryService {
  private static readonly INVENTORY_SIZE = {
    general: { width: 8, height: 5 },
    equipment: { slots: 6 },
    quickbar: { slots: 8 }
  };

  private inventories: Map<string, InventorySlot[]> = new Map();

  async initializeInventory(userId: string): Promise<InventorySlot[]> {
    const slots: InventorySlot[] = [];

    // Initialize general inventory slots
    for (let y = 0; y < this.INVENTORY_SIZE.general.height; y++) {
      for (let x = 0; x < this.INVENTORY_SIZE.general.width; x++) {
        slots.push({
          id: `general-${x}-${y}`,
          item: null,
          type: 'general',
          position: { x, y }
        });
      }
    }

    // Initialize equipment slots
    for (let i = 0; i < this.INVENTORY_SIZE.equipment.slots; i++) {
      slots.push({
        id: `equipment-${i}`,
        item: null,
        type: 'equipment',
        position: { x: i, y: 0 }
      });
    }

    // Initialize quickbar slots
    for (let i = 0; i < this.INVENTORY_SIZE.quickbar.slots; i++) {
      slots.push({
        id: `quickbar-${i}`,
        item: null,
        type: 'quickbar',
        position: { x: i, y: 0 }
      });
    }

    this.inventories.set(userId, slots);
    return slots;
  }

  async getInventory(userId: string): Promise<InventorySlot[]> {
    let inventory = this.inventories.get(userId);
    if (!inventory) {
      inventory = await this.initializeInventory(userId);
    }
    return inventory;
  }

  async addItem(userId: string, item: Omit<InventoryItem, 'id' | 'position'>): Promise<boolean> {
    const inventory = await this.getInventory(userId);
    
    // Check for stackable items first
    if (item.stackable) {
      const existingSlot = inventory.find(
        slot => slot.item?.itemId === item.itemId && slot.item.quantity < 99
      );

      if (existingSlot && existingSlot.item) {
        existingSlot.item.quantity += item.quantity;
        return true;
      }
    }

    // Find first empty general slot
    const emptySlot = inventory.find(
      slot => slot.type === 'general' && !slot.item
    );

    if (!emptySlot) {
      return false; // Inventory full
    }

    emptySlot.item = {
      ...item,
      id: crypto.randomUUID(),
      position: emptySlot.position
    };

    return true;
  }

  async removeItem(userId: string, itemId: string, quantity = 1): Promise<boolean> {
    const inventory = await this.getInventory(userId);
    const slot = inventory.find(slot => slot.item?.id === itemId);

    if (!slot || !slot.item) {
      return false;
    }

    if (slot.item.stackable && slot.item.quantity > quantity) {
      slot.item.quantity -= quantity;
    } else {
      slot.item = null;
    }

    return true;
  }

  async moveItem(
    userId: string,
    fromSlotId: string,
    toSlotId: string
  ): Promise<boolean> {
    const inventory = await this.getInventory(userId);
    const fromSlot = inventory.find(slot => slot.id === fromSlotId);
    const toSlot = inventory.find(slot => slot.id === toSlotId);

    if (!fromSlot || !toSlot || !fromSlot.item) {
      return false;
    }

    // Check equipment slot compatibility
    if (toSlot.type === 'equipment') {
      // Add equipment type validation here
      if (!this.canEquipItem(fromSlot.item, toSlot.position.x)) {
        return false;
      }
    }

    // Handle item swapping
    const tempItem = toSlot.item;
    toSlot.item = {
      ...fromSlot.item,
      position: toSlot.position,
      equipped: toSlot.type === 'equipment'
    };
    fromSlot.item = tempItem ? {
      ...tempItem,
      position: fromSlot.position,
      equipped: fromSlot.type === 'equipment'
    } : null;

    return true;
  }

  private canEquipItem(item: InventoryItem, slotIndex: number): boolean {
    // Equipment slot mapping
    const slotTypes: Record<number, string[]> = {
      0: ['weapon'],
      1: ['armor'],
      2: ['armor'],
      3: ['armor'],
      4: ['armor'],
      5: ['cosmetic']
    };

    return slotTypes[slotIndex]?.includes(item.type) || false;
  }

  async getEquippedItems(userId: string): Promise<InventoryItem[]> {
    const inventory = await this.getInventory(userId);
    return inventory
      .filter(slot => slot.type === 'equipment' && slot.item)
      .map(slot => slot.item!)
      .filter(item => item.equipped);
  }

  async getQuickbarItems(userId: string): Promise<InventoryItem[]> {
    const inventory = await this.getInventory(userId);
    return inventory
      .filter(slot => slot.type === 'quickbar' && slot.item)
      .map(slot => slot.item!);
  }
}

export const inventoryService = new InventoryService();


