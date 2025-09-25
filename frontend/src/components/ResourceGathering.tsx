'use client';

import React, { useState, useEffect } from 'react';
import { 
  TreePine,
  Pickaxe,
  MapPin,
  Clock,
  Star,
  Zap,
  Shield,
  Target,
  Timer,
  Search,
  Filter,
  Settings,
  X,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Award,
  Gem,
  Leaf,
  Wrench,
  Flask,
  Scissors,
  Crown,
  Cog,
  Sparkles,
  BarChart3,
  BookOpen,
  Package
} from 'lucide-react';
import { 
  ResourceNode,
  ResourceType,
  ResourceRarity,
  InventoryItem,
  CraftingSkill
} from '../types/crafting';
import { craftingService } from '../services/CraftingService';

interface ResourceGatheringProps {
  userId: string;
  onResourceHarvest?: (nodeId: string, drops: any[]) => void;
  isVisible?: boolean;
  onToggle?: () => void;
}

const ResourceGathering: React.FC<ResourceGatheringProps> = ({ 
  userId, 
  onResourceHarvest,
  isVisible = true,
  onToggle
}) => {
  const [resourceNodes, setResourceNodes] = useState<ResourceNode[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [userSkills, setUserSkills] = useState<CraftingSkill[]>([]);
  const [selectedNode, setSelectedNode] = useState<ResourceNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'nodes' | 'inventory' | 'skills' | 'map'>('nodes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<ResourceRarity | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [harvestingInProgress, setHarvestingInProgress] = useState<string | null>(null);

  useEffect(() => {
    initializeResourceGathering();
    return () => {
      craftingService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedNode) {
      // Load node details if needed
    }
  }, [selectedNode]);

  const initializeResourceGathering = async () => {
    try {
      setLoading(true);
      craftingService.initializeSocket();
      
      // Load initial data
      await Promise.all([
        loadResourceNodes(),
        loadUserInventory(),
        loadUserSkills()
      ]);
    } catch (error) {
      console.error('Error initializing resource gathering:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResourceNodes = async () => {
    const nodes = await craftingService.getAvailableResourceNodes();
    setResourceNodes(nodes);
  };

  const loadUserInventory = async () => {
    const userInventory = await craftingService.getUserInventory(userId);
    setInventory(userInventory);
  };

  const loadUserSkills = async () => {
    const skills = await craftingService.getUserSkills(userId);
    setUserSkills(skills);
  };

  const handleHarvestResource = async (nodeId: string, toolId?: string) => {
    if (harvestingInProgress) return;
    
    setHarvestingInProgress(nodeId);
    try {
      const success = await craftingService.harvestResource(userId, nodeId, toolId);
      if (success) {
        await loadResourceNodes();
        await loadUserInventory();
        await loadUserSkills();
        onResourceHarvest?.(nodeId, []);
      }
    } catch (error) {
      console.error('Error harvesting resource:', error);
    } finally {
      setHarvestingInProgress(null);
    }
  };

  const getResourceTypeIcon = (type: ResourceType): string => {
    return craftingService.getResourceTypeIcon(type);
  };

  const getRarityColor = (rarity: ResourceRarity): string => {
    return craftingService.getResourceNodeRarityColor(rarity);
  };

  const getResourceNodeStatus = (node: ResourceNode): string => {
    return craftingService.getResourceNodeStatus(node);
  };

  const canHarvestResource = (node: ResourceNode): boolean => {
    return craftingService.canHarvestResource(node, 1); // Assuming level 1 for now
  };

  const formatCraftingTime = (seconds: number): string => {
    return craftingService.formatCraftingTime(seconds);
  };

  // Filter resource nodes
  const getFilteredResourceNodes = (): ResourceNode[] => {
    return resourceNodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           node.metadata.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || node.type === filterType;
      const matchesRarity = filterRarity === 'all' || node.rarity === filterRarity;
      
      return matchesSearch && matchesType && matchesRarity;
    });
  };

  // Filter inventory
  const getFilteredInventory = (): InventoryItem[] => {
    return craftingService.searchInventory(inventory, searchQuery);
  };

  // Get resource nodes by location
  const getResourceNodesByLocation = (): Record<string, ResourceNode[]> => {
    const nodesByLocation: Record<string, ResourceNode[]> = {};
    
    resourceNodes.forEach(node => {
      const location = `${node.location.area} (${node.location.mapId})`;
      if (!nodesByLocation[location]) {
        nodesByLocation[location] = [];
      }
      nodesByLocation[location].push(node);
    });
    
    return nodesByLocation;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Loading resource gathering...</span>
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
            <TreePine className="w-6 h-6 text-green-400" />
            <h2 className="text-white text-xl font-bold">Resource Gathering</h2>
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
                placeholder="Search resource nodes or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-green-500 focus:outline-none"
              />
            </div>
            {activeTab === 'nodes' && (
              <>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ResourceType | 'all')}
                  className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-green-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="ore">Ore</option>
                  <option value="wood">Wood</option>
                  <option value="herbs">Herbs</option>
                  <option value="gems">Gems</option>
                  <option value="leather">Leather</option>
                  <option value="cloth">Cloth</option>
                  <option value="bone">Bone</option>
                  <option value="crystal">Crystal</option>
                  <option value="essence">Essence</option>
                  <option value="food">Food</option>
                </select>
                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value as ResourceRarity | 'all')}
                  className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-green-500 focus:outline-none"
                >
                  <option value="all">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                  <option value="mythic">Mythic</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex gap-2">
            {[
              { key: 'nodes', label: 'Resource Nodes', count: resourceNodes.length, icon: <TreePine className="w-4 h-4" /> },
              { key: 'inventory', label: 'Inventory', count: inventory.length, icon: <Package className="w-4 h-4" /> },
              { key: 'skills', label: 'Skills', count: userSkills.length, icon: <TrendingUp className="w-4 h-4" /> },
              { key: 'map', label: 'Map', count: 0, icon: <MapPin className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-green-500 text-white' 
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
          {/* Resource Nodes Tab */}
          {activeTab === 'nodes' && (
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
                            <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(node.rarity)} bg-slate-600`}>
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
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {node.location.area}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedNode(node)}
                          className="px-4 py-2 text-blue-400 border border-blue-400 rounded-md hover:bg-blue-400/10 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleHarvestResource(node.id)}
                          disabled={!canHarvestResource(node) || harvestingInProgress === node.id}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            canHarvestResource(node) && harvestingInProgress !== node.id
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {harvestingInProgress === node.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-1"></div>
                              Harvesting...
                            </>
                          ) : (
                            <>
                              <Pickaxe className="w-4 h-4 inline mr-1" />
                              Harvest
                            </>
                          )}
                        </button>
                      </div>
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
                          <span className="text-lg">{getResourceTypeIcon(item.metadata.category as ResourceType)}</span>
                          <div>
                            <h4 className="font-medium text-white">{item.itemName}</h4>
                            <p className="text-xs text-slate-400">x{item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${craftingService.getRarityColor(item.rarity)} bg-slate-600`}>
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
                  <p className="text-sm">Start gathering resources to develop your skills!</p>
                </div>
              ) : (
                userSkills.map(skill => (
                  <div key={skill.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-6 hover:border-slate-500 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getResourceTypeIcon(skill.id as ResourceType)}</span>
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
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
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

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Resource Node Locations</h3>
                <div className="space-y-4">
                  {Object.entries(getResourceNodesByLocation()).map(([location, nodes]) => (
                    <div key={location} className="bg-slate-600/50 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {nodes.map(node => (
                          <div key={node.id} className="flex items-center gap-2 text-sm bg-slate-700/50 p-2 rounded">
                            <span className="text-lg">{getResourceTypeIcon(node.type)}</span>
                            <div className="flex-1">
                              <span className="text-white">{node.name}</span>
                              <div className="flex items-center gap-1">
                                <span className={`text-xs ${getRarityColor(node.rarity)}`}>
                                  {node.rarity}
                                </span>
                                <span className={`text-xs ${node.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                  {node.isActive ? 'Available' : 'Depleted'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resource Node Details Modal */}
        {selectedNode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getResourceTypeIcon(selectedNode.type)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedNode.name}</h2>
                      <p className="text-slate-300">{selectedNode.metadata.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-white mb-2">Node Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Type:</span>
                        <span className="capitalize text-white">{selectedNode.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rarity:</span>
                        <span className={`capitalize ${getRarityColor(selectedNode.rarity)}`}>
                          {selectedNode.rarity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Required Level:</span>
                        <span className="text-white">Lv.{selectedNode.requiredLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Experience:</span>
                        <span className="text-white">{selectedNode.experienceReward} XP</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2">Location & Timing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Area:</span>
                        <span className="text-white">{selectedNode.location.area}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Map:</span>
                        <span className="text-white">{selectedNode.location.mapId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Respawn Time:</span>
                        <span className="text-white">{formatCraftingTime(selectedNode.respawnTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Harvests:</span>
                        <span className="text-white">{selectedNode.maxHarvests}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-white mb-3">Possible Drops</h3>
                  <div className="space-y-3">
                    {selectedNode.possibleDrops.map((drop, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={getRarityColor(drop.rarity)}>
                              {drop.itemName}
                            </span>
                            <span className="text-slate-400">
                              {drop.minQuantity}-{drop.maxQuantity} items
                            </span>
                          </div>
                          <span className="text-sm text-slate-400">
                            {Math.round(drop.dropRate * 100)}% chance
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleHarvestResource(selectedNode.id)}
                    disabled={!canHarvestResource(selectedNode) || harvestingInProgress === selectedNode.id}
                    className={`px-6 py-2 rounded-md transition-colors ${
                      canHarvestResource(selectedNode) && harvestingInProgress !== selectedNode.id
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {harvestingInProgress === selectedNode.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-1"></div>
                        Harvesting...
                      </>
                    ) : (
                      <>
                        <Pickaxe className="w-4 h-4 inline mr-1" />
                        Harvest Resource
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedNode(null)}
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

export default ResourceGathering;