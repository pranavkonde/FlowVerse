'use client';

import React, { useState, useEffect } from 'react';
import { 
  Hammer,
  Package,
  TreePine,
  Pickaxe,
  Star,
  Clock,
  Users,
  Trophy,
  Settings,
  Search,
  Filter,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  Award,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import {
  Resource,
  ResourceNode,
  CraftingRecipe,
  InventoryItem,
  CraftingSession,
  CraftingSkill,
  CraftingStats,
  ResourceStats,
  CraftingLeaderboard,
  ResourceLeaderboard,
  CraftingNotification,
  ResourceType,
  ResourceRarity,
  CraftingCategory,
  CraftingStatus,
  CRAFTING_EVENTS,
  CRAFTING_NOTIFICATIONS
} from '../types/crafting';
import { craftingService } from '../services/CraftingService';

interface CraftingSystemProps {
  isVisible: boolean;
  onToggle: () => void;
  userId: string;
}

export default function CraftingSystem({ isVisible, onToggle, userId }: CraftingSystemProps) {
  const [activeTab, setActiveTab] = useState<'crafting' | 'resources' | 'inventory' | 'skills' | 'leaderboard' | 'notifications'>('crafting');
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceNodes, setResourceNodes] = useState<ResourceNode[]>([]);
  const [recipes, setRecipes] = useState<CraftingRecipe[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [skills, setSkills] = useState<CraftingSkill[]>([]);
  const [craftingSessions, setCraftingSessions] = useState<CraftingSession[]>([]);
  const [notifications, setNotifications] = useState<CraftingNotification[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CraftingCategory | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<ResourceRarity | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      initializeCraftingSystem();
    }
  }, [isVisible]);

  const initializeCraftingSystem = async () => {
    try {
      setLoading(true);
      craftingService.initializeSocket();
      
      // Load initial data
      await Promise.all([
        loadResources(),
        loadResourceNodes(),
        loadRecipes(),
        loadInventory(),
        loadSkills(),
        loadCraftingSessions(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error initializing crafting system:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const resourceData = await craftingService.getResources();
      setResources(resourceData);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  const loadResourceNodes = async () => {
    try {
      const nodeData = await craftingService.getResourceNodes();
      setResourceNodes(nodeData);
    } catch (error) {
      console.error('Failed to load resource nodes:', error);
    }
  };

  const loadRecipes = async () => {
    try {
      const recipeData = await craftingService.getRecipes();
      setRecipes(recipeData);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    }
  };

  const loadInventory = async () => {
    try {
      const inventoryData = await craftingService.getInventory(userId);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  };

  const loadSkills = async () => {
    try {
      const skillData = await craftingService.getSkills(userId);
      setSkills(skillData);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const loadCraftingSessions = async () => {
    try {
      const sessionData = await craftingService.getCraftingSessions(userId);
      setCraftingSessions(sessionData);
    } catch (error) {
      console.error('Failed to load crafting sessions:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const notificationData = await craftingService.getNotifications(userId);
      setNotifications(notificationData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleStartCrafting = async (recipe: CraftingRecipe) => {
    try {
      const success = await craftingService.startCrafting(recipe.id, userId);
      if (success) {
        await loadCraftingSessions();
        await loadInventory();
      }
    } catch (error) {
      console.error('Failed to start crafting:', error);
    }
  };

  const handleGatherResource = async (node: ResourceNode) => {
    try {
      const success = await craftingService.gatherResource(node.id, userId);
      if (success) {
        await loadInventory();
        await loadResourceNodes();
      }
    } catch (error) {
      console.error('Failed to gather resource:', error);
    }
  };

  const handleCancelCrafting = async (session: CraftingSession) => {
    try {
      const success = await craftingService.cancelCrafting(session.id, userId);
      if (success) {
        await loadCraftingSessions();
      }
    } catch (error) {
      console.error('Failed to cancel crafting:', error);
    }
  };

  // Filter functions
  const getFilteredRecipes = (): CraftingRecipe[] => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const getFilteredResources = (): Resource[] => {
    return resources.filter(resource => {
      const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRarity = filterRarity === 'all' || resource.rarity === filterRarity;
      
      return matchesSearch && matchesRarity;
    });
  };

  const getFilteredInventory = (): InventoryItem[] => {
    return inventory.filter(item => {
      const resource = resources.find(r => r.id === item.resourceId);
      if (!resource) return false;
      
      const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRarity = filterRarity === 'all' || resource.rarity === filterRarity;
      
      return matchesSearch && matchesRarity;
    });
  };

  // Utility functions
  const getResourceRarityColor = (rarity: ResourceRarity): string => {
    return craftingService.getResourceRarityColor(rarity);
  };

  const getResourceRarityBgColor = (rarity: ResourceRarity): string => {
    return craftingService.getResourceRarityBgColor(rarity);
  };

  const formatCraftingTime = (seconds: number): string => {
    return craftingService.formatCraftingTime(seconds);
  };

  const getSkillProgress = (skill: CraftingSkill): number => {
    return craftingService.getSkillProgress(skill);
  };

  const canCraftRecipe = (recipe: CraftingRecipe): boolean => {
    return craftingService.canCraftRecipe(recipe, inventory);
  };

  const getRequiredMaterials = (recipe: CraftingRecipe) => {
    return craftingService.getRequiredMaterials(recipe, inventory);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading crafting system...</span>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-slate-800 rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hammer className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-bold">Crafting & Resources</h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Package className="w-4 h-4" />
              <span>{inventory.length} items</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white transition-colors p-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search items, recipes, resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as CraftingCategory | 'all')}
              className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="weapons">Weapons</option>
              <option value="armor">Armor</option>
              <option value="tools">Tools</option>
              <option value="consumables">Consumables</option>
              <option value="decorations">Decorations</option>
              <option value="materials">Materials</option>
              <option value="special">Special</option>
            </select>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value as ResourceRarity | 'all')}
              className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex gap-2">
            {[
              { key: 'crafting', label: 'Crafting', icon: <Hammer className="w-4 h-4" />, count: recipes.length },
              { key: 'resources', label: 'Resources', icon: <TreePine className="w-4 h-4" />, count: resourceNodes.length },
              { key: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" />, count: inventory.length },
              { key: 'skills', label: 'Skills', icon: <Star className="w-4 h-4" />, count: skills.length },
              { key: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" />, count: 0 },
              { key: 'notifications', label: 'Notifications', icon: <AlertCircle className="w-4 h-4" />, count: notifications.filter(n => !n.isRead).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span className="px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Crafting Tab */}
          {activeTab === 'crafting' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredRecipes().map(recipe => (
                  <div key={recipe.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-4 hover:border-slate-500 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">⚒️</div>
                        <div>
                          <h3 className="text-white font-medium text-lg">{recipe.name}</h3>
                          <p className="text-slate-300 text-sm">{recipe.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          Level {recipe.level}
                        </span>
                        <p className="text-slate-400 text-xs mt-1">
                          {formatCraftingTime(recipe.craftingTime)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-slate-300 text-sm font-medium mb-2">Materials Required:</h4>
                      <div className="space-y-1">
                        {getRequiredMaterials(recipe).map(({ material, available, required }) => {
                          const resource = resources.find(r => r.id === material.resourceId);
                          const hasEnough = available >= required;
                          
                          return (
                            <div key={material.resourceId} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{resource?.icon || '📦'}</span>
                                <span className="text-slate-300">{resource?.name || material.resourceId}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                                  {available}/{required}
                                </span>
                                {hasEnough ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-red-400" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {recipe.experience} XP
                        </span>
                      </div>
                      <button
                        onClick={() => handleStartCrafting(recipe)}
                        disabled={!canCraftRecipe(recipe) || !recipe.isUnlocked}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          canCraftRecipe(recipe) && recipe.isUnlocked
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {recipe.isUnlocked ? 'Craft' : 'Locked'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourceNodes.map(node => {
                  const resource = resources.find(r => r.id === node.resourceId);
                  if (!resource) return null;

                  return (
                    <div key={node.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-4 hover:border-slate-500 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{resource.icon}</div>
                          <div>
                            <h3 className="text-white font-medium text-lg">{resource.name}</h3>
                            <p className="text-slate-300 text-sm">{node.area}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${getResourceRarityBgColor(resource.rarity)} ${getResourceRarityColor(resource.rarity)}`}>
                            {resource.rarity}
                          </span>
                          <p className="text-slate-400 text-xs mt-1">
                            Level {node.level}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-slate-300 text-sm font-medium mb-2">Possible Drops:</h4>
                        <div className="space-y-1">
                          {node.drops.map((drop, index) => {
                            const dropResource = resources.find(r => r.id === drop.resourceId);
                            return (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{dropResource?.icon || '📦'}</span>
                                  <span className="text-slate-300">{dropResource?.name || drop.resourceId}</span>
                                </div>
                                <div className="text-slate-400">
                                  {drop.minAmount}-{drop.maxAmount} ({Math.round(drop.chance)}%)
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            {node.experience} XP
                          </span>
                        </div>
                        <button
                          onClick={() => handleGatherResource(node)}
                          disabled={!node.isActive}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            node.isActive
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {node.isActive ? 'Gather' : 'Depleted'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getFilteredInventory().map(item => {
                  const resource = resources.find(r => r.id === item.resourceId);
                  if (!resource) return null;

                  return (
                    <div key={item.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-4 hover:border-slate-500 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl">{resource.icon}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getResourceRarityBgColor(resource.rarity)} ${getResourceRarityColor(resource.rarity)}`}>
                          {resource.rarity}
                        </span>
                      </div>
                      <h3 className="text-white font-medium text-sm mb-1">{resource.name}</h3>
                      <p className="text-slate-400 text-xs mb-2">Quantity: {item.amount}</p>
                      <p className="text-slate-400 text-xs">Quality: {item.quality}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map(skill => (
                  <div key={skill.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">⭐</div>
                        <div>
                          <h3 className="text-white font-medium text-lg capitalize">{skill.category}</h3>
                          <p className="text-slate-300 text-sm">Level {skill.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                          {skill.recipesUnlocked.length} recipes
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-300">Experience</span>
                        <span className="text-slate-300">{skill.experience}/{skill.maxExperience}</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getSkillProgress(skill)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {skill.maxExperience - skill.experience} XP to next level
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">🏆</div>
              <p>Leaderboards coming soon!</p>
              <p className="text-sm">Compete with other players in crafting and resource gathering</p>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">🔔</div>
                  <p>No crafting notifications</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`bg-slate-700/50 rounded-lg border p-4 ${
                      !notification.isRead ? 'border-l-4 border-blue-500' : 'border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{notification.title}</h4>
                        <p className="text-slate-300 text-sm mt-1">{notification.message}</p>
                        <p className="text-slate-400 text-xs mt-2">
                          {notification.timestamp.toLocaleString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => craftingService.markNotificationAsRead(notification.id)}
                          className="ml-4 px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
