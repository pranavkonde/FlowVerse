import { TradeOffer, TradeRequest, TradeHistory, TradingStats, MarketplaceFilters, TradingNotification } from '@/types/trading';

class TradingService {
  private offers: TradeOffer[] = [];
  private requests: TradeRequest[] = [];
  private history: TradeHistory[] = [];
  private notifications: TradingNotification[] = [];

  // Mock data for demonstration
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock trade offers
    this.offers = [
      {
        id: 'offer1',
        sellerId: 'player1',
        sellerName: 'CryptoTrader',
        sellerAvatar: '👨‍💼',
        items: [{
          id: 'item1',
          name: 'Legendary Sword',
          description: 'A powerful weapon with fire damage',
          icon: '⚔️',
          rarity: 'legendary',
          category: 'weapon',
          value: 5000,
          quantity: 1,
          stats: { damage: 100, fire: 50 },
          isTradable: true,
          isStackable: false
        }],
        askingPrice: 4500,
        currency: 'coins',
        description: 'Selling my legendary sword, perfect for high-level players',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
        views: 15,
        likes: 3
      },
      {
        id: 'offer2',
        sellerId: 'player2',
        sellerName: 'ItemCollector',
        sellerAvatar: '👩‍🎨',
        items: [{
          id: 'item2',
          name: 'Rare Armor Set',
          description: 'Complete armor set with defense bonus',
          icon: '🛡️',
          rarity: 'rare',
          category: 'armor',
          value: 2500,
          quantity: 1,
          stats: { defense: 75, health: 50 },
          isTradable: true,
          isStackable: false
        }],
        askingPrice: 2000,
        currency: 'coins',
        description: 'Full armor set, great for tank builds',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000),
        isActive: true,
        views: 8,
        likes: 1
      }
    ];

    // Mock trade requests
    this.requests = [
      {
        id: 'request1',
        buyerId: 'player3',
        buyerName: 'NewPlayer',
        buyerAvatar: '👶',
        items: [{
          id: 'item3',
          name: 'Health Potion',
          description: 'Restores 100 HP',
          icon: '🧪',
          rarity: 'common',
          category: 'consumable',
          value: 50,
          quantity: 10,
          isTradable: true,
          isStackable: true,
          maxStack: 99
        }],
        offeringPrice: 500,
        currency: 'coins',
        message: 'Looking for health potions, willing to pay fair price',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        status: 'pending'
      }
    ];

    // Mock trade history
    this.history = [
      {
        id: 'trade1',
        buyerId: 'player4',
        sellerId: 'player1',
        buyerName: 'TradingPro',
        sellerName: 'CryptoTrader',
        items: [{
          id: 'item4',
          name: 'Magic Ring',
          description: 'Increases mana regeneration',
          icon: '💍',
          rarity: 'epic',
          category: 'accessory',
          value: 1500,
          quantity: 1,
          stats: { mana: 30 },
          isTradable: true,
          isStackable: false
        }],
        price: 1200,
        currency: 'coins',
        completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        rating: 5,
        review: 'Great trade, fast and reliable!'
      }
    ];
  }

  // Get all active trade offers
  getOffers(filters?: MarketplaceFilters): TradeOffer[] {
    let filteredOffers = this.offers.filter(offer => offer.isActive);

    if (filters) {
      if (filters.category) {
        filteredOffers = filteredOffers.filter(offer => 
          offer.items.some(item => item.category === filters.category)
        );
      }

      if (filters.rarity) {
        filteredOffers = filteredOffers.filter(offer => 
          offer.items.some(item => item.rarity === filters.rarity)
        );
      }

      if (filters.minPrice !== undefined) {
        filteredOffers = filteredOffers.filter(offer => offer.askingPrice >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        filteredOffers = filteredOffers.filter(offer => offer.askingPrice <= filters.maxPrice!);
      }

      if (filters.currency) {
        filteredOffers = filteredOffers.filter(offer => offer.currency === filters.currency);
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredOffers = filteredOffers.filter(offer => 
          offer.items.some(item => 
            item.name.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)
          ) ||
          offer.description.toLowerCase().includes(query)
        );
      }

      // Sort offers
      filteredOffers.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'price':
            comparison = a.askingPrice - b.askingPrice;
            break;
          case 'rarity':
            const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
            comparison = rarityOrder[a.items[0]?.rarity || 'common'] - rarityOrder[b.items[0]?.rarity || 'common'];
            break;
          case 'date':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case 'popularity':
            comparison = b.views - a.views;
            break;
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filteredOffers;
  }

  // Get trade requests
  getRequests(): TradeRequest[] {
    return this.requests.filter(request => request.status === 'pending');
  }

  // Get trade history
  getHistory(): TradeHistory[] {
    return this.history.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  // Create a new trade offer
  createOffer(offer: Omit<TradeOffer, 'id' | 'createdAt' | 'views' | 'likes'>): TradeOffer {
    const newOffer: TradeOffer = {
      ...offer,
      id: `offer_${Date.now()}`,
      createdAt: new Date(),
      views: 0,
      likes: 0
    };

    this.offers.push(newOffer);
    return newOffer;
  }

  // Create a trade request
  createRequest(request: Omit<TradeRequest, 'id' | 'createdAt' | 'status'>): TradeRequest {
    const newRequest: TradeRequest = {
      ...request,
      id: `request_${Date.now()}`,
      createdAt: new Date(),
      status: 'pending'
    };

    this.requests.push(newRequest);
    return newRequest;
  }

  // Accept a trade offer
  acceptOffer(offerId: string, buyerId: string): boolean {
    const offer = this.offers.find(o => o.id === offerId);
    if (!offer || !offer.isActive) return false;

    // Mark offer as inactive
    offer.isActive = false;

    // Create trade history entry
    const trade: TradeHistory = {
      id: `trade_${Date.now()}`,
      buyerId,
      sellerId: offer.sellerId,
      buyerName: 'CurrentPlayer', // This would come from user context
      sellerName: offer.sellerName,
      items: offer.items,
      price: offer.askingPrice,
      currency: offer.currency,
      completedAt: new Date(),
      rating: 0
    };

    this.history.push(trade);

    // Add notification
    this.addNotification({
      type: 'trade_completed',
      title: 'Trade Completed',
      message: `Successfully purchased ${offer.items[0].name} from ${offer.sellerName}`,
      tradeId: trade.id,
      isRead: false,
      createdAt: new Date()
    });

    return true;
  }

  // Get trading statistics
  getStats(): TradingStats {
    const completedTrades = this.history.length;
    const totalValue = this.history.reduce((sum, trade) => sum + trade.price, 0);
    const averageRating = this.history.length > 0 
      ? this.history.reduce((sum, trade) => sum + trade.rating, 0) / this.history.length 
      : 0;

    const categories = this.history.flatMap(trade => 
      trade.items.map(item => item.category)
    );
    const categoryCounts = categories.reduce((acc, category) => {
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return {
      totalTrades: completedTrades,
      totalValue,
      averageRating,
      successfulTrades: completedTrades,
      failedTrades: 0,
      favoriteCategories,
      tradingLevel: Math.floor(completedTrades / 10) + 1,
      reputation: Math.floor(averageRating * 20)
    };
  }

  // Get notifications
  getNotifications(): TradingNotification[] {
    return this.notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Add notification
  private addNotification(notification: Omit<TradingNotification, 'id'>): void {
    const newNotification: TradingNotification = {
      ...notification,
      id: `notification_${Date.now()}`
    };
    this.notifications.push(newNotification);
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  // Like an offer
  likeOffer(offerId: string): void {
    const offer = this.offers.find(o => o.id === offerId);
    if (offer) {
      offer.likes++;
    }
  }

  // View an offer
  viewOffer(offerId: string): void {
    const offer = this.offers.find(o => o.id === offerId);
    if (offer) {
      offer.views++;
    }
  }
}

export const tradingService = new TradingService();
