import { EventEmitter } from 'events';
import { InventoryService } from './InventoryService';
import { TradingService } from './TradingService';
import { LeaderboardService } from './LeaderboardService';

export interface TradingCard {
  id: string;
  playerId: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  type: 'character' | 'achievement' | 'special' | 'event';
  stats: {
    level: number;
    experience: number;
    achievements: number;
    combatRating?: number;
    craftingLevel?: number;
    specialAbility?: string;
  };
  metadata: {
    imageUrl: string;
    description: string;
    issueDate: Date;
    serialNumber: string;
    edition: string;
  };
  tradeable: boolean;
  mintCondition: number; // 0-100
}

export interface CardCollection {
  userId: string;
  cards: TradingCard[];
  stats: {
    totalCards: number;
    uniqueCards: number;
    rarityCount: Record<string, number>;
  };
}

export class TradingCardService {
  private static instance: TradingCardService;
  private eventEmitter: EventEmitter = new EventEmitter();
  private collections: Map<string, CardCollection> = new Map();
  private cards: Map<string, TradingCard> = new Map();

  private constructor(
    private inventoryService: InventoryService,
    private tradingService: TradingService,
    private leaderboardService: LeaderboardService
  ) {}

  static getInstance(
    inventoryService: InventoryService,
    tradingService: TradingService,
    leaderboardService: LeaderboardService
  ): TradingCardService {
    if (!TradingCardService.instance) {
      TradingCardService.instance = new TradingCardService(
        inventoryService,
        tradingService,
        leaderboardService
      );
    }
    return TradingCardService.instance;
  }

  async generateCard(playerId: string, type: TradingCard['type']): Promise<TradingCard> {
    const playerStats = await this.leaderboardService.getPlayerStats(playerId);
    if (!playerStats) {
      throw new Error('Player not found');
    }

    const card: TradingCard = {
      id: crypto.randomUUID(),
      playerId,
      name: playerStats.name,
      rarity: this.calculateRarity(playerStats),
      type,
      stats: {
        level: playerStats.level || 1,
        experience: playerStats.experience || 0,
        achievements: playerStats.achievements || 0,
        combatRating: playerStats.combatRating,
        craftingLevel: playerStats.craftingLevel,
        specialAbility: this.generateSpecialAbility(type, playerStats)
      },
      metadata: {
        imageUrl: playerStats.avatarUrl || 'default_card.png',
        description: this.generateDescription(type, playerStats),
        issueDate: new Date(),
        serialNumber: this.generateSerialNumber(),
        edition: 'First Edition'
      },
      tradeable: true,
      mintCondition: 100
    };

    this.cards.set(card.id, card);
    return card;
  }

  private calculateRarity(playerStats: any): TradingCard['rarity'] {
    const score = (
      playerStats.level +
      playerStats.achievements * 2 +
      (playerStats.combatRating || 0) / 100 +
      (playerStats.craftingLevel || 0)
    );

    if (score >= 1000) return 'legendary';
    if (score >= 500) return 'epic';
    if (score >= 250) return 'rare';
    if (score >= 100) return 'uncommon';
    return 'common';
  }

  private generateSpecialAbility(type: TradingCard['type'], stats: any): string {
    const abilities = {
      character: ['Double XP', 'Critical Hit', 'Resource Boost', 'Trading Bonus'],
      achievement: ['Achievement Boost', 'Rare Find', 'Bonus Rewards'],
      special: ['Unique Emote', 'Custom Title', 'Aura Effect'],
      event: ['Event Bonus', 'Special Access', 'Bonus Rewards']
    };

    const typeAbilities = abilities[type];
    return typeAbilities[Math.floor(Math.random() * typeAbilities.length)];
  }

  private generateDescription(type: TradingCard['type'], stats: any): string {
    switch (type) {
      case 'character':
        return `Level ${stats.level} adventurer with ${stats.achievements} achievements`;
      case 'achievement':
        return `Accomplished player with notable achievements in combat and crafting`;
      case 'special':
        return `Special edition card featuring unique abilities and bonuses`;
      case 'event':
        return `Event participation card with special event bonuses`;
      default:
        return `A collectible card from the FlowVerse universe`;
    }
  }

  private generateSerialNumber(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  }

  async addCardToCollection(userId: string, card: TradingCard): Promise<void> {
    let collection = this.collections.get(userId);
    if (!collection) {
      collection = {
        userId,
        cards: [],
        stats: {
          totalCards: 0,
          uniqueCards: 0,
          rarityCount: {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0
          }
        }
      };
    }

    collection.cards.push(card);
    collection.stats.totalCards++;
    collection.stats.rarityCount[card.rarity]++;
    
    // Calculate unique cards
    const uniqueCardIds = new Set(collection.cards.map(c => c.id));
    collection.stats.uniqueCards = uniqueCardIds.size;

    this.collections.set(userId, collection);
    this.eventEmitter.emit('cardAdded', { userId, card });
  }

  async getCollection(userId: string): Promise<CardCollection | null> {
    return this.collections.get(userId) || null;
  }

  async getCard(cardId: string): Promise<TradingCard | null> {
    return this.cards.get(cardId) || null;
  }

  async tradeCard(
    fromUserId: string,
    toUserId: string,
    cardId: string
  ): Promise<boolean> {
    const card = await this.getCard(cardId);
    if (!card || !card.tradeable) {
      return false;
    }

    const fromCollection = await this.getCollection(fromUserId);
    const toCollection = await this.getCollection(toUserId);

    if (!fromCollection || !toCollection) {
      return false;
    }

    // Remove card from source collection
    fromCollection.cards = fromCollection.cards.filter(c => c.id !== cardId);
    fromCollection.stats.totalCards--;
    fromCollection.stats.rarityCount[card.rarity]--;

    // Add card to destination collection
    await this.addCardToCollection(toUserId, card);

    // Update collections
    this.collections.set(fromUserId, fromCollection);

    this.eventEmitter.emit('cardTraded', {
      fromUserId,
      toUserId,
      card
    });

    return true;
  }

  onCardAdded(callback: (event: { userId: string; card: TradingCard }) => void) {
    this.eventEmitter.on('cardAdded', callback);
  }

  onCardTraded(
    callback: (event: {
      fromUserId: string;
      toUserId: string;
      card: TradingCard;
    }) => void
  ) {
    this.eventEmitter.on('cardTraded', callback);
  }
}

export const tradingCardService = TradingCardService.getInstance(
  new InventoryService(),
  TradingService.getInstance(),
  new LeaderboardService()
);
