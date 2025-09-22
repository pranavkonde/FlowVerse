'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Star, Eye, Heart, Clock, TrendingUp, DollarSign, Shield, Zap, Crown } from 'lucide-react';
import { TradeOffer, MarketplaceFilters, TradingStats } from '@/types/trading';
import { tradingService } from '@/services/TradingService';

interface TradingMarketplaceProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function TradingMarketplace({ isVisible, onToggle }: TradingMarketplaceProps) {
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  useEffect(() => {
    if (isVisible) {
      loadOffers();
      loadStats();
    }
  }, [isVisible, filters, searchQuery, selectedCategory, selectedRarity]);

  const loadOffers = () => {
    const currentFilters = {
      ...filters,
      searchQuery: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      rarity: selectedRarity !== 'all' ? selectedRarity : undefined
    };
    const loadedOffers = tradingService.getOffers(currentFilters);
    setOffers(loadedOffers);
  };

  const loadStats = () => {
    const loadedStats = tradingService.getStats();
    setStats(loadedStats);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Shield className="w-4 h-4 text-gray-400" />;
      case 'rare': return <Star className="w-4 h-4 text-blue-400" />;
      case 'epic': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-400/10';
      case 'rare': return 'border-blue-400 bg-blue-400/10';
      case 'epic': return 'border-purple-400 bg-purple-400/10';
      case 'legendary': return 'border-yellow-400 bg-yellow-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  const handleLikeOffer = (offerId: string) => {
    tradingService.likeOffer(offerId);
    loadOffers();
  };

  const handleViewOffer = (offerId: string) => {
    tradingService.viewOffer(offerId);
  };

  const handleAcceptOffer = (offerId: string) => {
    const success = tradingService.acceptOffer(offerId, 'currentPlayer');
    if (success) {
      loadOffers();
      loadStats();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-green-400" />
              <h2 className="text-white text-2xl font-bold">Trading Marketplace</h2>
            </div>
            <div className="flex items-center gap-4">
              {stats && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">Level {stats.tradingLevel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">{stats.reputation} Rep</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">{stats.totalValue} Total</span>
                  </div>
                </div>
              )}
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="weapon">Weapons</option>
              <option value="armor">Armor</option>
              <option value="accessory">Accessories</option>
              <option value="consumable">Consumables</option>
              <option value="currency">Currency</option>
              <option value="customization">Customization</option>
            </select>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:outline-none"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-400 focus:outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="rarity">Sort by Rarity</option>
              <option value="popularity">Sort by Popularity</option>
            </select>
          </div>
        </div>

        <div className="flex h-96">
          {/* Offers Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map(offer => (
                <div
                  key={offer.id}
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-blue-400 transition-colors"
                >
                  {/* Seller Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{offer.sellerAvatar}</div>
                    <div>
                      <div className="text-white font-medium">{offer.sellerName}</div>
                      <div className="text-slate-400 text-sm">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4">
                    {offer.items.map(item => (
                      <div
                        key={item.id}
                        className={`p-3 rounded border-2 ${getRarityColor(item.rarity)}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{item.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-medium">{item.name}</h3>
                              {getRarityIcon(item.rarity)}
                            </div>
                            <p className="text-slate-400 text-sm">{item.description}</p>
                            {item.stats && (
                              <div className="mt-1 text-xs text-slate-300">
                                {Object.entries(item.stats).map(([stat, value]) => (
                                  <span key={stat} className="mr-2">
                                    {stat}: +{value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-green-400 font-bold text-lg">
                      {offer.askingPrice} {offer.currency === 'coins' ? '💰' : '🪙'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLikeOffer(offer.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <span className="text-slate-400 text-sm">{offer.likes}</span>
                      <button
                        onClick={() => handleViewOffer(offer.id)}
                        className="text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <span className="text-slate-400 text-sm">{offer.views}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm mt-3 mb-4">{offer.description}</p>

                  {/* Expiry */}
                  <div className="flex items-center gap-1 text-slate-400 text-sm mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Expires in {Math.ceil((offer.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))}h</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      Buy Now
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {offers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">No offers found</div>
                <div className="text-slate-500 text-sm">
                  Try adjusting your filters or check back later
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-4 border-t border-slate-600">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              {offers.length} offers available • Trade safely with our secure system
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors">
                My Offers
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                Create Offer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
