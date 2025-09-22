export interface TradeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'currency' | 'customization';
  value: number;
  quantity: number;
  stats?: {
    [key: string]: number;
  };
  isTradable: boolean;
  isStackable: boolean;
  maxStack?: number;
}

export interface TradeOffer {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  items: TradeItem[];
  askingPrice: number;
  currency: 'coins' | 'tokens' | 'items';
  description: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  views: number;
  likes: number;
}

export interface TradeRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  items: TradeItem[];
  offeringPrice: number;
  currency: 'coins' | 'tokens' | 'items';
  message: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface TradeHistory {
  id: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  items: TradeItem[];
  price: number;
  currency: 'coins' | 'tokens' | 'items';
  completedAt: Date;
  rating: number;
  review?: string;
}

export interface TradingStats {
  totalTrades: number;
  totalValue: number;
  averageRating: number;
  successfulTrades: number;
  failedTrades: number;
  favoriteCategories: string[];
  tradingLevel: number;
  reputation: number;
}

export interface MarketplaceFilters {
  category?: string;
  rarity?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  sortBy: 'price' | 'rarity' | 'date' | 'popularity';
  sortOrder: 'asc' | 'desc';
  searchQuery?: string;
}

export interface TradingNotification {
  id: string;
  type: 'offer_created' | 'offer_accepted' | 'offer_rejected' | 'trade_completed' | 'new_message';
  title: string;
  message: string;
  tradeId: string;
  isRead: boolean;
  createdAt: Date;
}
