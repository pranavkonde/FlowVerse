'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Package,
  Lock,
  Unlock,
  Heart,
  Star,
  Trash2,
  Move,
  Tag,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Settings,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  DragHandle,
  ShoppingCart,
  Gift,
  Zap,
  Shield,
  Sword,
  Crown,
  Gem,
  Coins,
  Clock,
  Calendar,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';

interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  name: string;
  description: string;
  type: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  quantity: number;
  maxStack: number;
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    speed?: number;
    luck?: number;
    durability?: number;
    maxDurability?: number;
    level?: number;
  };
  metadata?: {
    source?: string;
    craftedBy?: string;
    tradeable?: boolean;
    sellable?: boolean;
  };
  acquiredAt: Date;
  lastModified: Date;
  position?: {
    slot: number;
    bag: string;
  };
  isEquipped?: boolean;
  isLocked?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  customName?: string;
}

interface InventoryBag {
  id: string;
  userId: string;
  name: string;
  type: string;
  size: number;
  isDefault: boolean;
  isLocked: boolean;
  position: number;
  createdAt: Date;
}

interface AdvancedInventoryProps {
  userId: string;
  onItemSelect?: (item: InventoryItem) => void;
  onItemAction?: (item: InventoryItem, action: string) => void;
  onClose?: () => void;
  isVisible?: boolean;
}

export default function AdvancedInventory({ 
  userId, 
  onItemSelect, 
  onItemAction, 
  onClose, 
  isVisible = true 
}: AdvancedInventoryProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [bags, setBags] = useState<InventoryBag[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeBag, setActiveBag] = useState<string>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('acquiredAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    type: 'all',
    rarity: 'all',
    equipped: 'all',
    locked: 'all',
    favorite: 'all',
    tradeable: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    uniqueItems: 0
  });

  const inventoryRef = useRef<HTMLDivElement>(null);
  const dragPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      loadInventory();
      loadBags();
      loadStats();
    }
  }, [isVisible, userId]);

  useEffect(() => {
    if (selectedItems.size > 0) {
      setShowBulkActions(true);
    } else {
      setShowBulkActions(false);
    }
  }, [selectedItems]);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual service call
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          userId,
          itemId: 'sword_001',
          name: 'Iron Sword',
          description: 'A sturdy iron sword with decent attack power',
          type: 'weapon',
          category: 'sword',
          rarity: 'common',
          quantity: 1,
          maxStack: 1,
          stats: { attack: 15, durability: 100, maxDurability: 100, level: 5 },
          metadata: { tradeable: true, sellable: true },
          acquiredAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          lastModified: new Date(),
          position: { slot: 0, bag: 'main' },
          isEquipped: false,
          isLocked: false,
          isFavorite: false,
          tags: ['weapon', 'iron']
        },
        {
          id: '2',
          userId,
          itemId: 'potion_001',
          name: 'Health Potion',
          description: 'Restores 50 health points',
          type: 'consumable',
          category: 'potion',
          rarity: 'common',
          quantity: 5,
          maxStack: 99,
          stats: { health: 50 },
          metadata: { tradeable: true, sellable: true },
          acquiredAt: new Date(Date.now() - 1000 * 60 * 30),
          lastModified: new Date(),
          position: { slot: 1, bag: 'main' },
          isEquipped: false,
          isLocked: false,
          isFavorite: false,
          tags: ['consumable', 'healing']
        },
        {
          id: '3',
          userId,
          itemId: 'ring_001',
          name: 'Ring of Power',
          description: 'A magical ring that increases all stats',
          type: 'accessory',
          category: 'ring',
          rarity: 'epic',
          quantity: 1,
          maxStack: 1,
          stats: { attack: 5, defense: 5, health: 20, mana: 20, level: 10 },
          metadata: { tradeable: true, sellable: true },
          acquiredAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          lastModified: new Date(),
          position: { slot: 2, bag: 'main' },
          isEquipped: true,
          isLocked: true,
          isFavorite: true,
          tags: ['accessory', 'magic', 'epic']
        }
      ];
      
      setItems(mockItems);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBags = async () => {
    try {
      // Simulate API call
      const mockBags: InventoryBag[] = [
        {
          id: 'main',
          userId,
          name: 'Main Bag',
          type: 'main',
          size: 50,
          isDefault: true,
          isLocked: false,
          position: 0,
          createdAt: new Date()
        },
        {
          id: 'equipment',
          userId,
          name: 'Equipment',
          type: 'equipment',
          size: 20,
          isDefault: true,
          isLocked: false,
          position: 1,
          createdAt: new Date()
        }
      ];
      
      setBags(mockBags);
    } catch (error) {
      console.error('Error loading bags:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Simulate API call
      setStats({
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalValue: items.reduce((sum, item) => sum + (getItemValue(item) * item.quantity), 0),
        uniqueItems: items.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getItemValue = (item: InventoryItem): number => {
    const rarityMultiplier = {
      common: 1,
      uncommon: 2,
      rare: 5,
      epic: 10,
      legendary: 25,
      mythic: 50
    };
    
    let baseValue = rarityMultiplier[item.rarity] * 10;
    if (item.stats) {
      const statSum = Object.values(item.stats).reduce((sum, stat) => sum + (stat || 0), 0);
      baseValue += statSum * 2;
    }
    return Math.floor(baseValue);
  };

  const getRarityColor = (rarity: string): string => {
    const colors = {
      common: 'text-gray-600 bg-gray-100',
      uncommon: 'text-green-600 bg-green-100',
      rare: 'text-blue-600 bg-blue-100',
      epic: 'text-purple-600 bg-purple-100',
      legendary: 'text-orange-600 bg-orange-100',
      mythic: 'text-red-600 bg-red-100'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Sword className="w-4 h-4" />;
      case 'armor':
        return <Shield className="w-4 h-4" />;
      case 'accessory':
        return <Crown className="w-4 h-4" />;
      case 'consumable':
        return <Gift className="w-4 h-4" />;
      case 'material':
        return <Gem className="w-4 h-4" />;
      case 'currency':
        return <Coins className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredAndSortedItems = items
    .filter(item => {
      if (activeBag !== 'all' && item.position?.bag !== activeBag) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !item.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.rarity !== 'all' && item.rarity !== filters.rarity) return false;
      if (filters.equipped !== 'all' && item.isEquipped !== (filters.equipped === 'equipped')) return false;
      if (filters.locked !== 'all' && item.isLocked !== (filters.locked === 'locked')) return false;
      if (filters.favorite !== 'all' && item.isFavorite !== (filters.favorite === 'favorite')) return false;
      if (filters.tradeable !== 'all' && item.metadata?.tradeable !== (filters.tradeable === 'tradeable')) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
          aValue = rarityOrder.indexOf(a.rarity);
          bValue = rarityOrder.indexOf(b.rarity);
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'acquiredAt':
          aValue = a.acquiredAt.getTime();
          bValue = b.acquiredAt.getTime();
          break;
        case 'value':
          aValue = getItemValue(a);
          bValue = getItemValue(b);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleItemSelect = (item: InventoryItem) => {
    onItemSelect?.(item);
  };

  const handleItemAction = (item: InventoryItem, action: string) => {
    onItemAction?.(item, action);
  };

  const handleItemClick = (item: InventoryItem, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else {
      // Single select
      setSelectedItems(new Set([item.id]));
      handleItemSelect(item);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: InventoryItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent, slot: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slot);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlot: number) => {
    e.preventDefault();
    if (draggedItem) {
      // Handle item move logic here
      console.log(`Moving item ${draggedItem.id} to slot ${targetSlot}`);
      setDraggedItem(null);
      setDragOverSlot(null);
    }
  };

  const handleBulkAction = (action: string) => {
    const selectedItemsList = Array.from(selectedItems);
    console.log(`Bulk action: ${action} on items:`, selectedItemsList);
    
    switch (action) {
      case 'delete':
        // Handle bulk delete
        break;
      case 'lock':
        // Handle bulk lock
        break;
      case 'unlock':
        // Handle bulk unlock
        break;
      case 'favorite':
        // Handle bulk favorite
        break;
      case 'unfavorite':
        // Handle bulk unfavorite
        break;
      case 'sell':
        // Handle bulk sell
        break;
    }
    
    setSelectedItems(new Set());
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Advanced Inventory</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{stats.totalItems} items</span>
              <span>•</span>
              <span>{stats.uniqueItems} unique</span>
              <span>•</span>
              <span>{stats.totalValue.toLocaleString()} value</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Bag Selector */}
              <select
                value={activeBag}
                onChange={(e) => setActiveBag(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Bags</option>
                {bags.map(bag => (
                  <option key={bag.id} value={bag.id}>{bag.name}</option>
                ))}
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                  showFilters ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Sort Options */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => toggleSort('name')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                    sortField === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>Name</span>
                  {sortField === 'name' && (sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                </button>
                <button
                  onClick={() => toggleSort('rarity')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                    sortField === 'rarity' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>Rarity</span>
                  {sortField === 'rarity' && (sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                </button>
                <button
                  onClick={() => toggleSort('value')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
                    sortField === 'value' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>Value</span>
                  {sortField === 'value' && (sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="weapon">Weapon</option>
                    <option value="armor">Armor</option>
                    <option value="accessory">Accessory</option>
                    <option value="consumable">Consumable</option>
                    <option value="material">Material</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
                  <select
                    value={filters.rarity}
                    onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Rarities</option>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                    <option value="mythic">Mythic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.equipped}
                    onChange={(e) => setFilters(prev => ({ ...prev, equipped: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Items</option>
                    <option value="equipped">Equipped</option>
                    <option value="unequipped">Unequipped</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special</label>
                  <select
                    value={filters.favorite}
                    onChange={(e) => setFilters(prev => ({ ...prev, favorite: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Items</option>
                    <option value="favorite">Favorites</option>
                    <option value="locked">Locked</option>
                    <option value="tradeable">Tradeable</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="p-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('favorite')}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  <Star className="w-4 h-4" />
                  <span>Favorite</span>
                </button>
                <button
                  onClick={() => handleBulkAction('lock')}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock</span>
                </button>
                <button
                  onClick={() => handleBulkAction('sell')}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Sell</span>
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Loading inventory...</p>
              </div>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No items found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {filteredAndSortedItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={(e) => handleItemClick(item, e)}
                      className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedItems.has(item.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${item.isEquipped ? 'ring-2 ring-green-500' : ''}`}
                    >
                      {/* Item Icon */}
                      <div className="flex items-center justify-center h-12 mb-2">
                        {getTypeIcon(item.type)}
                      </div>

                      {/* Item Name */}
                      <div className="text-xs font-medium text-gray-900 truncate mb-1">
                        {item.customName || item.name}
                      </div>

                      {/* Quantity */}
                      {item.quantity > 1 && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">
                          {item.quantity}
                        </div>
                      )}

                      {/* Rarity Badge */}
                      <div className={`absolute top-1 left-1 px-1 py-0.5 rounded text-xs font-medium ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </div>

                      {/* Status Icons */}
                      <div className="absolute bottom-1 right-1 flex space-x-1">
                        {item.isEquipped && <CheckCircle className="w-3 h-3 text-green-500" />}
                        {item.isLocked && <Lock className="w-3 h-3 text-gray-500" />}
                        {item.isFavorite && <Star className="w-3 h-3 text-yellow-500" />}
                      </div>

                      {/* Drag Handle */}
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
                        <DragHandle className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAndSortedItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={(e) => handleItemClick(item, e)}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                        selectedItems.has(item.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${item.isEquipped ? 'ring-2 ring-green-500' : ''}`}
                    >
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => {
                          setSelectedItems(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(item.id)) {
                              newSet.delete(item.id);
                            } else {
                              newSet.add(item.id);
                            }
                            return newSet;
                          });
                        }}
                        className="mr-3"
                      />

                      {/* Item Icon */}
                      <div className="flex items-center justify-center w-10 h-10 mr-3">
                        {getTypeIcon(item.type)}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.customName || item.name}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                          <span>Type: {item.type}</span>
                          <span>Value: {getItemValue(item).toLocaleString()}</span>
                          <span>Acquired: {item.acquiredAt.toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="text-sm font-medium text-gray-900 mr-3">
                        {item.quantity > 1 ? `x${item.quantity}` : ''}
                      </div>

                      {/* Status Icons */}
                      <div className="flex items-center space-x-2">
                        {item.isEquipped && <CheckCircle className="w-4 h-4 text-green-500" title="Equipped" />}
                        {item.isLocked && <Lock className="w-4 h-4 text-gray-500" title="Locked" />}
                        {item.isFavorite && <Star className="w-4 h-4 text-yellow-500" title="Favorite" />}
                      </div>

                      {/* Actions */}
                      <div className="ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemAction(item, 'view');
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedItems.length} of {items.length} items
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                Export
              </button>
              <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                Create Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
