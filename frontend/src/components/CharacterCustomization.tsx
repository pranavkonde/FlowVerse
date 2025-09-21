'use client';

import { useState, useEffect } from 'react';
import { User, Palette, Shirt, Sparkles, Zap, Star, Crown, Lock } from 'lucide-react';
import { CharacterProfile, CUSTOMIZATION_ITEMS, CUSTOMIZATION_CATEGORIES } from '@/types/customization';

interface CharacterCustomizationProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function CharacterCustomization({ isVisible, onToggle }: CharacterCustomizationProps) {
  const [selectedCategory, setSelectedCategory] = useState('avatar');
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile>({
    id: 'player1',
    username: 'Player',
    level: 1,
    experience: 0,
    coins: 1000,
    avatar: 'avatar_default',
    clothing: {},
    accessories: {},
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#fbbf24'
    },
    animations: {
      walk: 'walk_normal',
      idle: 'idle_default',
      emote: 'emote_wave'
    },
    unlockedItems: ['avatar_default', 'color_blue', 'walk_normal'],
    equippedItems: ['avatar_default', 'color_blue', 'walk_normal']
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'avatar': return <User className="w-5 h-5" />;
      case 'clothing': return <Shirt className="w-5 h-5" />;
      case 'accessories': return <Sparkles className="w-5 h-5" />;
      case 'colors': return <Palette className="w-5 h-5" />;
      case 'animations': return <Zap className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4 text-gray-400" />;
      case 'rare': return <Star className="w-4 h-4 text-blue-400" />;
      case 'epic': return <Star className="w-4 h-4 text-purple-400" />;
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
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

  const filteredItems = CUSTOMIZATION_ITEMS.filter(item => item.category === selectedCategory);

  const handleItemSelect = (itemId: string) => {
    const item = CUSTOMIZATION_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if (item.isUnlocked) {
      setCharacterProfile(prev => ({
        ...prev,
        equippedItems: [...prev.equippedItems.filter(id => id !== itemId), itemId]
      }));
    }
  };

  const handleItemPurchase = (itemId: string) => {
    const item = CUSTOMIZATION_ITEMS.find(i => i.id === itemId);
    if (!item || characterProfile.coins < item.price) return;

    setCharacterProfile(prev => ({
      ...prev,
      coins: prev.coins - item.price,
      unlockedItems: [...prev.unlockedItems, itemId]
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-blue-400" />
              <h2 className="text-white text-2xl font-bold">Character Customization</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-600 px-3 py-1 rounded">
                <span className="text-yellow-400">💰</span>
                <span className="text-white font-medium">{characterProfile.coins}</span>
              </div>
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-96">
          {/* Category Sidebar */}
          <div className="w-48 bg-slate-700/50 p-4 border-r border-slate-600">
            <div className="space-y-2">
              {CUSTOMIZATION_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-3 rounded transition-colors flex items-center gap-3 ${
                    selectedCategory === category.id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {getCategoryIcon(category.id)}
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs opacity-75">{category.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map(item => {
                const isUnlocked = characterProfile.unlockedItems.includes(item.id);
                const isEquipped = characterProfile.equippedItems.includes(item.id);
                const canAfford = characterProfile.coins >= item.price;

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      isEquipped 
                        ? 'border-green-400 bg-green-400/20' 
                        : isUnlocked 
                          ? 'border-blue-400 bg-blue-400/10 hover:bg-blue-400/20'
                          : getRarityColor(item.rarity)
                    } ${!isUnlocked ? 'opacity-60' : ''}`}
                    onClick={() => isUnlocked ? handleItemSelect(item.id) : null}
                  >
                    {/* Item Icon */}
                    <div className="text-center mb-3">
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <div className="flex items-center justify-center gap-1">
                        {getRarityIcon(item.rarity)}
                        <span className="text-xs text-slate-400 capitalize">
                          {item.rarity}
                        </span>
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="text-center">
                      <h3 className="text-white font-medium text-sm mb-1">
                        {item.name}
                      </h3>
                      <p className="text-slate-400 text-xs mb-3">
                        {item.description}
                      </p>

                      {/* Stats */}
                      {item.stats && (
                        <div className="mb-3 space-y-1">
                          {Object.entries(item.stats).map(([stat, value]) => (
                            <div key={stat} className="text-xs text-slate-300">
                              {stat}: +{value}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Price/Status */}
                      <div className="flex items-center justify-center gap-2">
                        {isUnlocked ? (
                          isEquipped ? (
                            <div className="text-green-400 text-sm font-medium">
                              ✓ Equipped
                            </div>
                          ) : (
                            <div className="text-blue-400 text-sm font-medium">
                              Equip
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-1">
                            {canAfford ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemPurchase(item.id);
                                }}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs transition-colors"
                              >
                                Buy {item.price}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-slate-400">
                                <Lock className="w-3 h-3" />
                                <span className="text-xs">{item.price}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-slate-400 text-lg mb-2">No items available</div>
                <div className="text-slate-500 text-sm">
                  Check back later for new customization options
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-4 border-t border-slate-600">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-sm">
              Customize your character to express your unique style!
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors">
                Reset
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
