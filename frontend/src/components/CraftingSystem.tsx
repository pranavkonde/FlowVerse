'use client';

import React, { useState, useEffect } from 'react';
import { 
  Hammer,
  Package,
  Star,
  Clock,
  Filter,
  Search,
  Settings,
  X,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Sword,
  Gem,
  Leaf,
  TreePine,
  Pickaxe,
  Wrench,
  Flask,
  Scissors,
  Crown,
  Cog,
  Sparkles,
  Target,
  BarChart3,
  BookOpen,
  MapPin,
  Timer
} from 'lucide-react';
import { 
  CraftingRecipe,
  ResourceNode,
  CraftingSkill,
  InventoryItem,
  CraftingSession,
  CraftingQueue,
  CraftingStation,
  CraftingStats,
  CraftingCategory,
  CraftingDifficulty,
  ResourceType,
  ItemRarity,
  ItemQuality,
  CraftingStatus
} from '../types/crafting';
import { craftingService } from '../services/CraftingService';

interface CraftingSystemProps {
  userId: string;
  onCraftingStart?: (recipeId: string) => void;
  onCraftingComplete?: (session: CraftingSession) => void;
  isVisible?: boolean;
  onToggle?: () => void;
}

const CraftingSystem: React.FC<CraftingSystemProps> = ({ 
  userId, 
  onCraftingStart,
  onCraftingComplete,
  isVisible = true,
  onToggle
}) => {
  const [recipes, setRecipes] = useState<CraftingRecipe[]>([]);
  const [resourceNodes, setResourceNodes] = useState<ResourceNode[]>([]);
  const [userSkills, setUserSkills] = useState<CraftingSkill[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [craftingQueue, setCraftingQueue] = useState<CraftingQueue | null>(null);
  const [craftingStations, setCraftingStations] = useState<CraftingStation[]>([]);
  const [craftingStats, setCraftingStats] = useState<CraftingStats | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<CraftingRecipe | null>(null);
  const [selectedNode, setSelectedNode] = useState<ResourceNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recipes' | 'resources' | 'inventory' | 'skills' | 'queue' | 'stats'>('recipes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CraftingCategory | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<CraftingDifficulty | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeCraftingSystem();
    return () => {
      craftingService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedRecipe) {
      // Load recipe details if needed
    }
  }, [selectedRecipe]);

  const initializeCraftingSystem = async () => {
    try {
      setLoading(true);
      craftingService.initializeSocket();
      
      // Load initial data
      await Promise.all([
        loadUserRecipes(),
        loadResourceNodes(),
        loadUserSkills(),
        loadUserInventory(),
        loadCraftingQueue(),
        loadCraftingStations(),
        loadCraftingStats()
      ]);
    } catch (error) {
      console.error('Error initializing crafting system:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRecipes = async () => {
    const userRecipes = await craftingService.getUserRecipes(userId);
    setRecipes(userRecipes);
  };

  const loadResourceNodes = async () => {
    const nodes = await craftingService.getAvailableResourceNodes();
    setResourceNodes(nodes);
  };

  const loadUserSkills = async () => {
    const skills = await craftingService.getUserSkills(userId);
    setUserSkills(skills);
  };

  const loadUserInventory = async () => {
    const userInventory = await craftingService.getUserInventory(userId);
    setInventory(userInventory);
  };

  const loadCraftingQueue = async () => {
    const queue = await craftingService.getUserCraftingQueue(userId);
    setCraftingQueue(queue);
  };

  const loadCraftingStations = async () => {
    const stations = await craftingService.getCraftingStations();
    setCraftingStations(stations);
  };

  const loadCraftingStats = async () => {
    const stats = await craftingService.getCraftingStats(userId);
    setCraftingStats(stats);
  };

  const handleStartCrafting = async (recipeId: string, stationId?: string) => {
    const success = await craftingService.startCrafting(userId, recipeId, stationId);
    if (success) {
      await loadCraftingQueue();
      await loadUserInventory();
      onCraftingStart?.(recipeId);
    }
  };

  const handleCancelCrafting = async (sessionId: string) => {
    const success = await craftingService.cancelCraftingSession(userId, sessionId);
    if (success) {
      await loadCraftingQueue();
      await loadUserInventory();
    }
  };

  const handleHarvestResource = async (nodeId: string, toolId?: string) => {
    const success = await craftingService.harvestResource(userId, nodeId, toolId);
    if (success) {
      await loadResourceNodes();
      await loadUserInventory();
      await loadUserSkills();
    }
  };

  const getRecipeDifficultyColor = (difficulty: CraftingDifficulty): string => {
    return craftingService.getRecipeDifficultyColor(difficulty);
  };

  const getRarityColor = (rarity: ItemRarity): string => {
    return craftingService.getRarityColor(rarity);
  };

  const getQualityColor = (quality: ItemQuality): string => {
    return craftingService.getQualityColor(quality);
  };

  const getCategoryIcon = (category: CraftingCategory): string => {
    return craftingService.getCraftingCategoryIcon(category);
  };

  const getResourceTypeIcon = (type: ResourceType): string => {
    return craftingService.getResourceTypeIcon(type);
  };

  const getStationIcon = (type: string): string => {
    return craftingService.getCraftingStationIcon(type as any);
  };

  const formatCraftingTime = (seconds: number): string => {
    return craftingService.formatCraftingTime(seconds);
  };

  const canCraftRecipe = (recipe: CraftingRecipe): boolean => {
    return craftingService.canCraftRecipe(recipe, userSkills, inventory);
  };

  const canHarvestResource = (node: ResourceNode): boolean => {
    return craftingService.canHarvestResource(node, 1); // Assuming level 1 for now
  };

  const getResourceNodeStatus = (node: ResourceNode): string => {
    return craftingService.getResourceNodeStatus(node);
  };

  // Filter recipes based on search and filters
  const getFilteredRecipes = (): CraftingRecipe[] => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
      const matchesDifficulty = filterDifficulty === 'all' || recipe.difficulty === filterDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  };

  // Filter resource nodes
  const getFilteredResourceNodes = (): ResourceNode[] => {
    return resourceNodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           node.metadata.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  // Filter inventory
  const getFilteredInventory = (): InventoryItem[] => {
    return craftingService.searchInventory(inventory, searchQuery);
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
            <Hammer className="w-6 h-6 text-orange-400" />
            <h2 className="text-white text-xl font-bold">Crafting System</h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Star className="w-4 h-4" />
              <span>Level {userSkills.reduce((sum, skill) => sum + skill.level, 0)}</span>
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
              <X className="w-5 h-5" />
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
                placeholder="Search recipes, resources, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            {activeTab === 'recipes' && (
              <>
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
                  <option value="materials">Materials</option>
                  <option value="decorations">Decorations</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="potions">Potions</option>
                  <option value="food">Food</option>
                  <option value="clothing">Clothing</option>
                  <option value="furniture">Furniture</option>
                  <option value="vehicles">Vehicles</option>
                </select>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value as CraftingDifficulty | 'all')}
                  className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="novice">Novice</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                  <option value="master">Master</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex gap-2">
            {[
              { key: 'recipes', label: 'Recipes', count: recipes.length, icon: <BookOpen className="w-4 h-4" /> },
              { key: 'resources', label: 'Resources', count: resourceNodes.length, icon: <TreePine className="w-4 h-4" /> },
              { key: 'inventory', label: 'Inventory', count: inventory.length, icon: <Package className="w-4 h-4" /> },
              { key: 'skills', label: 'Skills', count: userSkills.length, icon: <TrendingUp className="w-4 h-4" /> },
              { key: 'queue', label: 'Queue', count: craftingQueue?.sessions.length || 0, icon: <Clock className="w-4 h-4" /> },
              { key: 'stats', label: 'Stats', count: 0, icon: <BarChart3 className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-orange-500 text-white' 
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
          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div className="space-y-4">
              {getFilteredRecipes().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">🔨</div>
                  <p>No recipes available</p>
                  <p className="text-sm">Level up your skills to unlock more recipes!</p>
                </div>
              ) : (
                getFilteredRecipes().map(recipe => (
                  <div key={recipe.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-6 hover:border-slate-500 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(recipe.category)}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{recipe.name}</h3>
                          <p className="text-slate-300">{recipe.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${getRecipeDifficultyColor(recipe.difficulty)} bg-slate-600`}>
                              {recipe.difficulty}
                            </span>
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                              {recipe.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-slate-400">
                          {formatCraftingTime(recipe.craftingTime)}
                        </span>
                        <p className="text-sm text-slate-400">
                          {recipe.experienceReward} XP
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Required Materials:</h4>
                      <div className="flex flex-wrap gap-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center gap-1 text-sm bg-slate-600 px-2 py-1 rounded">
                            <span className={getRarityColor(ingredient.rarity)}>
                              {ingredient.itemName}
                            </span>
                            <span className="text-slate-400">x{ingredient.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {recipe.requiredSkill} Lv.{recipe.requiredSkillLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Lv.{recipe.requiredLevel}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedRecipe(recipe)}
                          className="px-4 py-2 text-blue-400 border border-blue-400 rounded-md hover:bg-blue-400/10 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleStartCrafting(recipe.id)}
                          disabled={!canCraftRecipe(recipe)}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            canCraftRecipe(recipe)
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Play className="w-4 h-4 inline mr-1" />
                          Craft
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              {getFilteredResourceNodes().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">🌿</div>
                  <p>No resource nodes available</p>
                  <p className="text-sm">Explore the world to find resource nodes!</p>
                </div>
              ) : (
                getFilteredResourceNodes().map(node => (
                  <div key={node.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-6 hover:border-slate-500 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getResourceTypeIcon(node.type)}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{node.name}</h3>
                          <p className="text-slate-300">{node.metadata.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${craftingService.getResourceNodeRarityColor(node.rarity)} bg-slate-600`}>
                              {node.rarity}
                            </span>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                              {node.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${node.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          {node.isActive ? 'Available' : 'Depleted'}
                        </span>
                        <p className="text-sm text-slate-400">
                          {node.experienceReward} XP
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Possible Drops:</h4>
                      <div className="flex flex-wrap gap-2">
                        {node.possibleDrops.map((drop, index) => (
                          <div key={index} className="flex items-center gap-1 text-sm bg-slate-600 px-2 py-1 rounded">
                            <span className={getRarityColor(drop.rarity)}>
                              {drop.itemName}
                            </span>
                            <span className="text-slate-400">
                              {Math.round(drop.dropRate * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          Lv.{node.requiredLevel}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {formatCraftingTime(node.respawnTime)}
                        </span>
                        {node.requiredTool && (
                          <span className="flex items-center gap-1">
                            <Wrench className="w-4 h-4" />
                            {node.requiredTool}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleHarvestResource(node.id)}
                        disabled={!canHarvestResource(node)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          canHarvestResource(node)
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Pickaxe className="w-4 h-4 inline mr-1" />
                        Harvest
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {getFilteredInventory().length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">📦</div>
                  <p>Your inventory is empty</p>
                  <p className="text-sm">Start gathering resources to fill it up!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredInventory().map(item => (
                    <div key={item.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-4 hover:border-slate-500 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCategoryIcon(item.metadata.category as CraftingCategory)}</span>
                          <div>
                            <h4 className="font-medium text-white">{item.itemName}</h4>
                            <p className="text-xs text-slate-400">x{item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(item.rarity)} bg-slate-600`}>
                            {item.rarity}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{item.metadata.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                          Value: {craftingService.calculateItemValue(item)} gold
                        </span>
                        {item.durability && (
                          <span className="text-slate-400">
                            {item.durability}/{item.maxDurability} durability
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {userSkills.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">📈</div>
                  <p>No skills available</p>
                  <p className="text-sm">Start crafting to develop your skills!</p>
                </div>
              ) : (
                userSkills.map(skill => (
                  <div key={skill.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-6 hover:border-slate-500 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(skill.id as CraftingCategory)}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-white capitalize">{skill.name}</h3>
                          <p className="text-slate-300">Level {skill.level} / {skill.maxLevel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-slate-400">
                          {skill.experience} / {skill.experienceToNext} XP
                        </span>
                        <p className="text-sm text-slate-400">
                          {skill.unlockedRecipes.length} recipes unlocked
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-300">Progress to next level</span>
                        <span className="text-slate-300">{craftingService.getSkillProgressPercentage(skill)}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${craftingService.getSkillProgressPercentage(skill)}%` }}
                        ></div>
                      </div>
                    </div>

                    {skill.bonuses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Active Bonuses:</h4>
                        <div className="flex flex-wrap gap-2">
                          {skill.bonuses.map((bonus, index) => (
                            <div key={index} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                              {bonus.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              {!craftingQueue || craftingQueue.sessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">⏰</div>
                  <p>No crafting sessions in queue</p>
                  <p className="text-sm">Start crafting to see your progress here!</p>
                </div>
              ) : (
                craftingQueue.sessions.map(session => {
                  const recipe = recipes.find(r => r.id === session.recipeId);
                  if (!recipe) return null;

                  return (
                    <div key={session.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-6 hover:border-slate-500 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getCategoryIcon(recipe.category)}</span>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{recipe.name}</h3>
                            <p className="text-slate-300">
                              Status: <span className={`font-medium ${
                                session.status === 'in_progress' ? 'text-green-400' :
                                session.status === 'completed' ? 'text-blue-400' :
                                session.status === 'cancelled' ? 'text-red-400' :
                                'text-yellow-400'
                              }`}>
                                {session.status}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-slate-400">
                            {session.experienceGained} XP
                          </span>
                          <p className="text-sm text-slate-400">
                            Started {session.startTime.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {session.status === 'in_progress' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-300">Progress</span>
                            <span className="text-slate-300">{Math.round(session.progress)}%</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${session.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                          <span>Materials: {session.materials.length} items</span>
                        </div>
                        {session.status === 'in_progress' && (
                          <button
                            onClick={() => handleCancelCrafting(session.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                          >
                            <Pause className="w-4 h-4 inline mr-1" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {!craftingStats ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">📊</div>
                  <p>No crafting statistics available</p>
                  <p className="text-sm">Start crafting to generate statistics!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Overall Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total Items Crafted:</span>
                        <span className="text-white font-medium">{craftingStats.totalItemsCrafted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Total Experience:</span>
                        <span className="text-white font-medium">{craftingStats.totalExperienceGained}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Favorite Category:</span>
                        <span className="text-white font-medium capitalize">{craftingStats.favoriteCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Highest Quality:</span>
                        <span className={`font-medium ${getQualityColor(craftingStats.highestQuality)}`}>
                          {craftingStats.highestQuality}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Skill Levels</h3>
                    <div className="space-y-3">
                      {Object.entries(craftingStats.skillLevels).map(([skillName, level]) => (
                        <div key={skillName} className="flex justify-between">
                          <span className="text-slate-300 capitalize">{skillName}:</span>
                          <span className="text-white font-medium">Level {level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recipe Details Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getCategoryIcon(selectedRecipe.category)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedRecipe.name}</h2>
                      <p className="text-slate-300">{selectedRecipe.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Recipe Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Category:</span>
                        <span className="capitalize text-white">{selectedRecipe.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Difficulty:</span>
                        <span className={`capitalize ${getRecipeDifficultyColor(selectedRecipe.difficulty)}`}>
                          {selectedRecipe.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Crafting Time:</span>
                        <span className="text-white">{formatCraftingTime(selectedRecipe.craftingTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Experience:</span>
                        <span className="text-white">{selectedRecipe.experienceReward} XP</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Requirements</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Skill:</span>
                        <span className="text-white">{selectedRecipe.requiredSkill} Lv.{selectedRecipe.requiredSkillLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Level:</span>
                        <span className="text-white">Lv.{selectedRecipe.requiredLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-white mb-3">Required Materials</h3>
                  <div className="space-y-3">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={getRarityColor(ingredient.rarity)}>
                              {ingredient.itemName}
                            </span>
                            <span className="text-slate-400">x{ingredient.quantity}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            {ingredient.isConsumed ? 'Consumed' : 'Required'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleStartCrafting(selectedRecipe.id)}
                    disabled={!canCraftRecipe(selectedRecipe)}
                    className={`px-6 py-2 rounded-md transition-colors ${
                      canCraftRecipe(selectedRecipe)
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-4 h-4 inline mr-1" />
                    Start Crafting
                  </button>
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="px-6 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CraftingSystem;