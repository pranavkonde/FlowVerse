import { EventEmitter } from 'events';
import {
  TradingCard,
  CardCollection,
  CardTrade,
  CardRarity,
  CardType,
  TradeStatus
} from '../types/tradingCards';

export class TradingCardService extends EventEmitter {
  private cards: Map<string, TradingCard> = new Map();
  private collections: Map<string, CardCollection> = new Map();
  private trades: Map<string, CardTrade> = new Map();
  private cardTemplates: Map<string, Partial<TradingCard>> = new Map();

  constructor() {
    super();
    this.initializeCardTemplates();
    this.startTradeExpiryChecker();
  }

  private initializeCardTemplates(): void {
    // Initialize some basic card templates
    const templates: Partial<TradingCard>[] = [
      {
        name: 'Dragon Warrior',
        description: 'A mighty warrior with dragon blood',
        rarity: 'LEGENDARY',
        type: 'CHARACTER',
        attributes: {
          power: 90,
          defense: 85,
          magic: 70,
          speed: 75,
          special: ['Dragon Breath', 'Scale Armor']
        }
      },
      // Add more templates...
    ];

    templates.forEach(template => {
      this.cardTemplates.set(template.name!, template);
    });
  }

  private startTradeExpiryChecker(): void {
    setInterval(() => {
      const now = new Date();
      for (const [tradeId, trade] of this.trades) {
        if (
          trade.status === 'PENDING' &&
          new Date(trade.expiresAt) <= now
        ) {
          trade.status = 'EXPIRED';
          this.trades.set(tradeId, trade);
          this.emit('trade:expired', { tradeId });
        }
      }
    }, 60000); // Check every minute
  }

  public async mintCard(
    userId: string,
    templateName: string
  ): Promise<TradingCard> {
    const template = this.cardTemplates.get(templateName);
    if (!template) {
      throw new Error('Card template not found');
    }

    const totalMinted = Array.from(this.cards.values()).filter(
      card => card.name === templateName
    ).length;

    const card: TradingCard = {
      id: `${templateName}-${Date.now()}-${totalMinted + 1}`,
      ...template,
      mintNumber: totalMinted + 1,
      totalMinted: totalMinted + 1,
      createdAt: new Date().toISOString(),
      ownerId: userId,
      imageUrl: `/cards/${templateName.toLowerCase().replace(/\s+/g, '-')}.png`
    } as TradingCard;

    this.cards.set(card.id, card);
    await this.addCardToCollection(userId, card);

    return card;
  }

  private async addCardToCollection(
    userId: string,
    card: TradingCard
  ): Promise<void> {
    let collection = this.collections.get(userId);
    if (!collection) {
      collection = {
        userId,
        cards: [],
        stats: {
          totalCards: 0,
          byRarity: {} as Record<CardRarity, number>,
          byType: {} as Record<CardType, number>,
          uniqueCards: 0,
          completeSets: 0
        },
        achievements: []
      };
      this.collections.set(userId, collection);
    }

    collection.cards.push(card);
    this.updateCollectionStats(collection);
  }

  private updateCollectionStats(collection: CardCollection): void {
    const stats = collection.stats;
    const cards = collection.cards;

    stats.totalCards = cards.length;
    stats.uniqueCards = new Set(cards.map(c => c.name)).size;

    // Reset counters
    stats.byRarity = {} as Record<CardRarity, number>;
    stats.byType = {} as Record<CardType, number>;

    // Count cards by rarity and type
    cards.forEach(card => {
      stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
      stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
    });

    // Calculate complete sets
    const cardsBySet = cards.reduce((sets, card) => {
      sets[card.name] = (sets[card.name] || 0) + 1;
      return sets;
    }, {} as Record<string, number>);

    stats.completeSets = Object.values(cardsBySet).filter(count => count >= 3).length;
  }

  public async getUserCollection(userId: string): Promise<CardCollection> {
    const collection = this.collections.get(userId);
    if (!collection) {
      throw new Error('Collection not found');
    }
    return collection;
  }

  public async createTrade(
    initiatorId: string,
    receiverId: string,
    offeredCardIds: string[],
    requestedCardIds: string[]
  ): Promise<CardTrade> {
    // Validate cards ownership
    for (const cardId of offeredCardIds) {
      const card = this.cards.get(cardId);
      if (!card || card.ownerId !== initiatorId) {
        throw new Error('Invalid offered card');
      }
    }

    for (const cardId of requestedCardIds) {
      const card = this.cards.get(cardId);
      if (!card || card.ownerId !== receiverId) {
        throw new Error('Invalid requested card');
      }
    }

    const trade: CardTrade = {
      id: `TRADE-${Date.now()}`,
      initiatorId,
      receiverId,
      offeredCards: offeredCardIds,
      requestedCards: requestedCardIds,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    this.trades.set(trade.id, trade);
    this.emit('trade:created', { trade });

    return trade;
  }

  public async respondToTrade(
    tradeId: string,
    userId: string,
    accept: boolean
  ): Promise<CardTrade> {
    const trade = this.trades.get(tradeId);
    if (!trade || trade.receiverId !== userId) {
      throw new Error('Trade not found or unauthorized');
    }

    if (trade.status !== 'PENDING') {
      throw new Error('Trade is no longer pending');
    }

    if (accept) {
      // Execute the trade
      await this.executeTrade(trade);
      trade.status = 'COMPLETED';
    } else {
      trade.status = 'REJECTED';
    }

    trade.updatedAt = new Date().toISOString();
    this.trades.set(trade.id, trade);
    this.emit('trade:responded', { trade });

    return trade;
  }

  private async executeTrade(trade: CardTrade): Promise<void> {
    // Update card ownership
    for (const cardId of trade.offeredCards) {
      const card = this.cards.get(cardId)!;
      card.ownerId = trade.receiverId;
      this.cards.set(cardId, card);
    }

    for (const cardId of trade.requestedCards) {
      const card = this.cards.get(cardId)!;
      card.ownerId = trade.initiatorId;
      this.cards.set(cardId, card);
    }

    // Update collections
    const initiatorCollection = this.collections.get(trade.initiatorId)!;
    const receiverCollection = this.collections.get(trade.receiverId)!;

    initiatorCollection.cards = initiatorCollection.cards.filter(
      card => !trade.offeredCards.includes(card.id)
    );
    initiatorCollection.cards.push(
      ...trade.requestedCards.map(id => this.cards.get(id)!)
    );

    receiverCollection.cards = receiverCollection.cards.filter(
      card => !trade.requestedCards.includes(card.id)
    );
    receiverCollection.cards.push(
      ...trade.offeredCards.map(id => this.cards.get(id)!)
    );

    this.updateCollectionStats(initiatorCollection);
    this.updateCollectionStats(receiverCollection);
  }
}