import { io, Socket } from 'socket.io-client';
import {
  House,
  Room,
  Decoration,
  Furniture,
  HouseVisitor,
  HouseTemplate,
  HouseStats,
  HouseLeaderboard,
  HouseNotification,
  HouseEvent,
  HouseVisit,
  HouseInvite,
  HousePermission,
  HouseShare,
  HouseType,
  HouseSize,
  HouseTheme,
  RoomType,
  RoomTheme,
  DecorationType,
  DecorationRarity,
  DecorationCategory,
  FurnitureType,
  FurnitureRarity,
  FurnitureCategory,
  FurnitureFunctionality,
  HouseNotificationType,
  HouseEventType,
  HousePermissionType,
  HouseShareType,
  HOUSE_EVENTS,
  HOUSE_NOTIFICATIONS
} from '../types/housing';

export class HousingService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Function[]> = new Map();
  private houses: Map<string, House> = new Map();
  private templates: Map<string, HouseTemplate> = new Map();
  private decorations: Map<string, Decoration> = new Map();
  private furniture: Map<string, Furniture> = new Map();

  constructor() {
    this.initializeSocket();
    this.initializeDefaultData();
  }

  private initializeSocket(): void {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
    this.socket = io(socketUrl);

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Connected to housing service');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Disconnected from housing service');
    });

    // Housing system specific listeners
    this.socket.on('houseUpdate', (data: any) => {
      this.emit('houseUpdate', data);
    });

    this.socket.on('decorationPlaced', (data: any) => {
      this.emit('decorationPlaced', data);
    });

    this.socket.on('furniturePlaced', (data: any) => {
      this.emit('furniturePlaced', data);
    });

    this.socket.on('visitorArrived', (data: any) => {
      this.emit('visitorArrived', data);
    });

    this.socket.on('visitorLeft', (data: any) => {
      this.emit('visitorLeft', data);
    });

    this.socket.on('houseNotification', (notification: HouseNotification) => {
      this.emit('houseNotification', notification);
    });
  }

  private initializeDefaultData(): void {
    // Initialize default house templates
    const defaultTemplates: HouseTemplate[] = [
      {
        id: 'cottage-template',
        name: 'Cozy Cottage',
        description: 'A small, comfortable cottage perfect for beginners',
        type: 'cottage',
        size: 'small',
        theme: 'nature',
        level: 1,
        cost: 1000,
        isUnlocked: true,
        prerequisites: [],
        rooms: [
          {
            id: 'living-room',
            name: 'Living Room',
            type: 'living_room',
            size: { width: 4, height: 4 },
            theme: 'cozy',
            decorations: [],
            furniture: []
          },
          {
            id: 'bedroom',
            name: 'Bedroom',
            type: 'bedroom',
            size: { width: 3, height: 3 },
            theme: 'cozy',
            decorations: [],
            furniture: []
          }
        ],
        decorations: [],
        furniture: [],
        metadata: {
          imageUrl: '/images/houses/cottage.png',
          previewImages: ['/images/houses/cottage-1.png', '/images/houses/cottage-2.png'],
          tags: ['beginner', 'cozy', 'nature'],
          difficulty: 'easy',
          estimatedTime: 30,
          popularity: 85,
          rating: 4.2
        }
      },
      {
        id: 'mansion-template',
        name: 'Grand Mansion',
        description: 'A luxurious mansion with multiple rooms and grand architecture',
        type: 'mansion',
        size: 'large',
        theme: 'elegant',
        level: 5,
        cost: 50000,
        isUnlocked: false,
        prerequisites: [
          { type: 'level', value: 5, description: 'Player level 5 required' }
        ],
        rooms: [
          {
            id: 'grand-hall',
            name: 'Grand Hall',
            type: 'living_room',
            size: { width: 6, height: 6 },
            theme: 'elegant',
            decorations: [],
            furniture: []
          },
          {
            id: 'master-bedroom',
            name: 'Master Bedroom',
            type: 'bedroom',
            size: { width: 5, height: 4 },
            theme: 'elegant',
            decorations: [],
            furniture: []
          },
          {
            id: 'library',
            name: 'Library',
            type: 'library',
            size: { width: 4, height: 4 },
            theme: 'classic',
            decorations: [],
            furniture: []
          }
        ],
        decorations: [],
        furniture: [],
        metadata: {
          imageUrl: '/images/houses/mansion.png',
          previewImages: ['/images/houses/mansion-1.png', '/images/houses/mansion-2.png'],
          tags: ['luxury', 'elegant', 'grand'],
          difficulty: 'hard',
          estimatedTime: 120,
          popularity: 95,
          rating: 4.8
        }
      }
    ];

    // Initialize default decorations
    const defaultDecorations: Decoration[] = [
      {
        id: 'basic-painting',
        type: 'painting',
        name: 'Basic Painting',
        description: 'A simple painting to decorate your walls',
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        layer: 1,
        isVisible: true,
        isInteractive: false,
        rarity: 'common',
        category: 'art',
        source: 'purchased',
        houseId: '',
        metadata: {
          imageUrl: '/images/decorations/basic-painting.png',
          interactable: false,
          collectible: true,
          tradeable: true,
          stackable: true,
          stackSize: 10,
          value: 50,
          weight: 1,
          dimensions: { width: 1, height: 1, depth: 0.1 },
          tags: ['art', 'wall', 'basic']
        },
        acquiredAt: new Date()
      },
      {
        id: 'magical-crystal',
        type: 'crystal',
        name: 'Magical Crystal',
        description: 'A glowing crystal with mysterious properties',
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        layer: 1,
        isVisible: true,
        isInteractive: true,
        rarity: 'rare',
        category: 'special',
        source: 'quest',
        houseId: '',
        metadata: {
          imageUrl: '/images/decorations/magical-crystal.png',
          animationUrl: '/animations/crystal-glow.gif',
          particleEffect: 'sparkles',
          interactable: true,
          collectible: true,
          tradeable: false,
          stackable: false,
          stackSize: 1,
          value: 500,
          weight: 2,
          dimensions: { width: 0.5, height: 0.5, depth: 0.5 },
          tags: ['magical', 'special', 'interactive']
        },
        acquiredAt: new Date()
      }
    ];

    // Initialize default furniture
    const defaultFurniture: Furniture[] = [
      {
        id: 'wooden-chair',
        type: 'chair',
        name: 'Wooden Chair',
        description: 'A sturdy wooden chair for seating',
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        layer: 1,
        isVisible: true,
        isInteractive: true,
        functionality: 'seating',
        rarity: 'common',
        category: 'seating',
        source: 'crafted',
        houseId: '',
        metadata: {
          imageUrl: '/images/furniture/wooden-chair.png',
          interactable: true,
          collectible: true,
          tradeable: true,
          stackable: true,
          stackSize: 5,
          value: 100,
          weight: 5,
          dimensions: { width: 1, height: 1, depth: 1 },
          functionality: ['seating'],
          tags: ['wooden', 'seating', 'basic']
        },
        acquiredAt: new Date()
      },
      {
        id: 'magical-bookshelf',
        type: 'bookshelf',
        name: 'Magical Bookshelf',
        description: 'A bookshelf that glows with magical energy',
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        layer: 1,
        isVisible: true,
        isInteractive: true,
        functionality: 'storage',
        rarity: 'epic',
        category: 'storage',
        source: 'achievement',
        houseId: '',
        metadata: {
          imageUrl: '/images/furniture/magical-bookshelf.png',
          animationUrl: '/animations/bookshelf-glow.gif',
          soundEffect: '/sounds/magical-hum.mp3',
          interactable: true,
          collectible: true,
          tradeable: false,
          stackable: false,
          stackSize: 1,
          value: 2000,
          weight: 20,
          dimensions: { width: 2, height: 3, depth: 1 },
          functionality: ['storage', 'decoration'],
          tags: ['magical', 'storage', 'epic']
        },
        acquiredAt: new Date()
      }
    ];

    // Store default data
    defaultTemplates.forEach(template => this.templates.set(template.id, template));
    defaultDecorations.forEach(decoration => this.decorations.set(decoration.id, decoration));
    defaultFurniture.forEach(furniture => this.furniture.set(furniture.id, furniture));
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Connection management
  initializeSocket(): void {
    if (!this.socket || !this.isConnected) {
      this.initializeSocket();
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isConnected(): boolean {
    return this.isConnected;
  }

  // House management
  async getHouses(userId: string): Promise<House[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getHouses', userId, (response: { success: boolean; houses?: House[]; error?: string }) => {
        if (response.success && response.houses) {
          resolve(response.houses);
        } else {
          reject(new Error(response.error || 'Failed to get houses'));
        }
      });
    });
  }

  async getHouseById(houseId: string): Promise<House | null> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getHouseById', houseId, (response: { success: boolean; house?: House; error?: string }) => {
        if (response.success) {
          resolve(response.house || null);
        } else {
          reject(new Error(response.error || 'Failed to get house'));
        }
      });
    });
  }

  async createHouse(userId: string, templateId: string, name: string, description: string): Promise<House> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('createHouse', { userId, templateId, name, description }, (response: { success: boolean; house?: House; error?: string }) => {
        if (response.success && response.house) {
          resolve(response.house);
        } else {
          reject(new Error(response.error || 'Failed to create house'));
        }
      });
    });
  }

  async updateHouse(houseId: string, updates: Partial<House>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('updateHouse', { houseId, updates }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to update house'));
        }
      });
    });
  }

  async deleteHouse(houseId: string, userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('deleteHouse', { houseId, userId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to delete house'));
        }
      });
    });
  }

  // Room management
  async addRoom(houseId: string, room: Omit<Room, 'id' | 'houseId'>): Promise<Room> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('addRoom', { houseId, room }, (response: { success: boolean; room?: Room; error?: string }) => {
        if (response.success && response.room) {
          resolve(response.room);
        } else {
          reject(new Error(response.error || 'Failed to add room'));
        }
      });
    });
  }

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('updateRoom', { roomId, updates }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to update room'));
        }
      });
    });
  }

  async removeRoom(roomId: string, houseId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('removeRoom', { roomId, houseId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to remove room'));
        }
      });
    });
  }

  // Decoration management
  async placeDecoration(houseId: string, roomId: string | null, decoration: Omit<Decoration, 'id' | 'houseId' | 'roomId'>): Promise<Decoration> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('placeDecoration', { houseId, roomId, decoration }, (response: { success: boolean; decoration?: Decoration; error?: string }) => {
        if (response.success && response.decoration) {
          resolve(response.decoration);
        } else {
          reject(new Error(response.error || 'Failed to place decoration'));
        }
      });
    });
  }

  async moveDecoration(decorationId: string, newPosition: { x: number; y: number }, newRotation?: number, newScale?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('moveDecoration', { decorationId, newPosition, newRotation, newScale }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to move decoration'));
        }
      });
    });
  }

  async removeDecoration(decorationId: string, houseId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('removeDecoration', { decorationId, houseId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to remove decoration'));
        }
      });
    });
  }

  // Furniture management
  async placeFurniture(houseId: string, roomId: string | null, furniture: Omit<Furniture, 'id' | 'houseId' | 'roomId'>): Promise<Furniture> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('placeFurniture', { houseId, roomId, furniture }, (response: { success: boolean; furniture?: Furniture; error?: string }) => {
        if (response.success && response.furniture) {
          resolve(response.furniture);
        } else {
          reject(new Error(response.error || 'Failed to place furniture'));
        }
      });
    });
  }

  async moveFurniture(furnitureId: string, newPosition: { x: number; y: number }, newRotation?: number, newScale?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('moveFurniture', { furnitureId, newPosition, newRotation, newScale }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to move furniture'));
        }
      });
    });
  }

  async removeFurniture(furnitureId: string, houseId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('removeFurniture', { furnitureId, houseId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to remove furniture'));
        }
      });
    });
  }

  // Template management
  async getTemplates(): Promise<HouseTemplate[]> {
    return Array.from(this.templates.values());
  }

  async getTemplateById(templateId: string): Promise<HouseTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  async getUnlockedTemplates(userId: string): Promise<HouseTemplate[]> {
    return Array.from(this.templates.values()).filter(template => template.isUnlocked);
  }

  // Visitor management
  async visitHouse(houseId: string, visitorId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('visitHouse', { houseId, visitorId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to visit house'));
        }
      });
    });
  }

  async leaveHouse(houseId: string, visitorId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('leaveHouse', { houseId, visitorId }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to leave house'));
        }
      });
    });
  }

  async rateHouse(houseId: string, visitorId: string, rating: number, comment?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('rateHouse', { houseId, visitorId, rating, comment }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to rate house'));
        }
      });
    });
  }

  // Statistics
  async getHouseStats(userId: string): Promise<HouseStats> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getHouseStats', userId, (response: { success: boolean; stats?: HouseStats; error?: string }) => {
        if (response.success && response.stats) {
          resolve(response.stats);
        } else {
          reject(new Error(response.error || 'Failed to get house stats'));
        }
      });
    });
  }

  // Leaderboards
  async getHouseLeaderboard(category: 'visitors' | 'rating' | 'value' | 'creativity', period: 'daily' | 'weekly' | 'monthly' | 'all'): Promise<HouseLeaderboard> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getHouseLeaderboard', { category, period }, (response: { success: boolean; leaderboard?: HouseLeaderboard; error?: string }) => {
        if (response.success && response.leaderboard) {
          resolve(response.leaderboard);
        } else {
          reject(new Error(response.error || 'Failed to get house leaderboard'));
        }
      });
    });
  }

  // Notifications
  async getNotifications(userId: string): Promise<HouseNotification[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('getHouseNotifications', userId, (response: { success: boolean; notifications?: HouseNotification[]; error?: string }) => {
        if (response.success && response.notifications) {
          resolve(response.notifications);
        } else {
          reject(new Error(response.error || 'Failed to get notifications'));
        }
      });
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('markHouseNotificationAsRead', notificationId, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          resolve(true);
        } else {
          reject(new Error(response.error || 'Failed to mark notification as read'));
        }
      });
    });
  }

  // Utility functions
  getHouseTypeIcon(type: HouseType): string {
    const icons = {
      cottage: '🏠',
      mansion: '🏰',
      castle: '🏰',
      apartment: '🏢',
      treehouse: '🌳',
      cave: '🕳️',
      floating: '☁️',
      underground: '⛰️',
      sky: '🌌',
      water: '🌊'
    };
    return icons[type] || '🏠';
  }

  getHouseSizeColor(size: HouseSize): string {
    const colors = {
      small: 'text-green-400',
      medium: 'text-blue-400',
      large: 'text-purple-400',
      extra_large: 'text-orange-400',
      mega: 'text-red-400'
    };
    return colors[size] || 'text-gray-400';
  }

  getHouseThemeColor(theme: HouseTheme): string {
    const colors = {
      modern: 'text-blue-400',
      medieval: 'text-yellow-400',
      fantasy: 'text-purple-400',
      sci_fi: 'text-cyan-400',
      nature: 'text-green-400',
      gothic: 'text-gray-400',
      minimalist: 'text-white',
      vintage: 'text-orange-400',
      tropical: 'text-green-400',
      winter: 'text-blue-300',
      spring: 'text-green-300',
      summer: 'text-yellow-300',
      autumn: 'text-orange-300'
    };
    return colors[theme] || 'text-gray-400';
  }

  getDecorationRarityColor(rarity: DecorationRarity): string {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
      mythic: 'text-red-400'
    };
    return colors[rarity] || 'text-gray-400';
  }

  getFurnitureRarityColor(rarity: FurnitureRarity): string {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
      mythic: 'text-red-400'
    };
    return colors[rarity] || 'text-gray-400';
  }

  calculateHouseValue(house: House): number {
    let totalValue = 0;
    
    // Add decoration values
    house.decorations.forEach(decoration => {
      totalValue += decoration.metadata.value;
    });
    
    // Add furniture values
    house.furniture.forEach(furniture => {
      totalValue += furniture.metadata.value;
    });
    
    // Add room values (base value per room)
    house.rooms.forEach(room => {
      totalValue += room.size.width * room.size.height * 100;
    });
    
    return totalValue;
  }

  calculateHouseLevel(house: House): number {
    const experience = house.experience;
    const maxExperience = house.maxExperience;
    
    if (experience >= maxExperience) {
      return house.level + 1;
    }
    
    return house.level;
  }

  getHouseProgress(house: House): number {
    return (house.experience / house.maxExperience) * 100;
  }

  formatHouseSize(size: HouseSize): string {
    const sizes = {
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      extra_large: 'Extra Large',
      mega: 'Mega'
    };
    return sizes[size] || 'Unknown';
  }

  formatHouseType(type: HouseType): string {
    const types = {
      cottage: 'Cottage',
      mansion: 'Mansion',
      castle: 'Castle',
      apartment: 'Apartment',
      treehouse: 'Treehouse',
      cave: 'Cave',
      floating: 'Floating House',
      underground: 'Underground House',
      sky: 'Sky House',
      water: 'Water House'
    };
    return types[type] || 'Unknown';
  }

  formatHouseTheme(theme: HouseTheme): string {
    const themes = {
      modern: 'Modern',
      medieval: 'Medieval',
      fantasy: 'Fantasy',
      sci_fi: 'Sci-Fi',
      nature: 'Nature',
      gothic: 'Gothic',
      minimalist: 'Minimalist',
      vintage: 'Vintage',
      tropical: 'Tropical',
      winter: 'Winter',
      spring: 'Spring',
      summer: 'Summer',
      autumn: 'Autumn'
    };
    return themes[theme] || 'Unknown';
  }
}

// Export singleton instance
export const housingService = new HousingService();

