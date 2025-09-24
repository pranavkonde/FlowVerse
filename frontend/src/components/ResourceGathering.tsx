'use client';

import React, { useState, useEffect } from 'react';
import { 
  TreePine,
  Pickaxe,
  Fish,
  Target,
  MapPin,
  Clock,
  Star,
  Zap,
  Package,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import {
  Resource,
  ResourceNode,
  ResourceGatheringSession,
  ResourceStats,
  ResourceLeaderboard,
  ResourceType,
  ResourceRarity,
  ResourceCategory,
  GatheringStatus
} from '../types/crafting';
import { craftingService } from '../services/CraftingService';

interface ResourceGatheringProps {
  isVisible: boolean;
  onToggle: () => void;
  userId: string;
  playerPosition?: { x: number; y: number };
}

export default function ResourceGathering({ isVisible, onToggle, userId, playerPosition }: ResourceGatheringProps) {
  const [activeTab, setActiveTab] = useState<'nodes' | 'sessions' | 'stats' | 'leaderboard'>('nodes');
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceNodes, setResourceNodes] = useState<ResourceNode[]>([]);
  const [gatheringSessions, setGatheringSessions] = useState<ResourceGatheringSession[]>([]);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [selectedNode, setSelectedNode] = useState<ResourceNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<ResourceRarity | 'all'>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [showOnlyNearby, setShowOnlyNearby] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      initializeResourceGathering();
    }
  }, [isVisible]);

  const initializeResourceGathering = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadResources(),
        loadResourceNodes(),
        loadGatheringSessions(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error initializing resource gathering:', error);
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

  const loadGatheringSessions = async () => {
    // This would be implemented in the backend
    setGatheringSessions([]);
  };

  const loadStats = async () => {
    try {
      const statsData = await craftingService.getResourceStats(userId);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleGatherResource = async (node: ResourceNode) => {
    try {
      const success = await craftingService.gatherResource(node.id, userId);
      if (success) {
        await loadResourceNodes();
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to gather resource:', error);
    }
  };

  const handleStartGathering = async (node: ResourceNode) => {
    setSelectedNode(node);
    // Start gathering session
  };

  const handleStopGathering = async () => {
    setSelectedNode(null);
    // Stop gathering session
  };

  // Filter functions
  const getFilteredNodes = (): ResourceNode[] => {
    return resourceNodes.filter(node => {
      const resource = resources.find(r => r.id === node.resourceId);
      if (!resource) return false;

      const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           node.area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || resource.type === filterType;
      const matchesRarity = filterRarity === 'all' || resource.rarity === filterRarity;
      const matchesArea = filterArea === 'all' || node.area === filterArea;
      
      let matchesDistance = true;
      if (showOnlyNearby && playerPosition) {
        const distance = Math.sqrt(
          Math.pow(node.position.x - playerPosition.x, 2) + 
          Math.pow(node.position.y - playerPosition.y, 2)
        );
        matchesDistance = distance <= 100; // Within 100 units
      }
      
      return matchesSearch && matchesType && matchesRarity && matchesArea && matchesDistance;
    });
  };

  const getUniqueAreas = (): string[] => {
    const areas = resourceNodes.map(node => node.area);
    return Array.from(new Set(areas));
  };

  const getResourceTypeIcon = (type: ResourceType): string => {
    const icons = {
      ore: '⛏️',
      wood: '🪵',
      plant: '🌿',
      crystal: '💎',
      gem: '💠',
      metal: '🔩',
      fiber: '🧵',
      leather: '🦌',
      bone: '🦴',
      essence: '✨'
    };
    return icons[type] || '📦';
  };

  const getResourceRarityColor = (rarity: ResourceRarity): string => {
    return craftingService.getResourceRarityColor(rarity);
  };

  const getResourceRarityBgColor = (rarity: ResourceRarity): string => {
    return craftingService.getResourceRarityBgColor(rarity);
  };

  const getNodeStatusColor = (node: ResourceNode): string => {
    if (!node.isActive) return 'text-red-400';
    if (node.lastHarvested) {
      const timeSinceHarvest = Date.now() - node.lastHarvested.getTime();
      const respawnTime = node.respawnTime * 1000;
      if (timeSinceHarvest < respawnTime) {
        return 'text-yellow-400';
      }
    }
    return 'text-green-400';
  };

  const getNodeStatusText = (node: ResourceNode): string => {
    if (!node.isActive) return 'Depleted';
    if (node.lastHarvested) {
      const timeSinceHarvest = Date.now() - node.lastHarvested.getTime();
      const respawnTime = node.respawnTime * 1000;
      if (timeSinceHarvest < respawnTime) {
        const remainingTime = Math.ceil((respawnTime - timeSinceHarvest) / 1000);
        return `Respawn in ${remainingTime}s`;
      }
    }
    return 'Available';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading resource gathering...</span>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TreePine className="w-6 h-6 text-green-400" />
            <h2 className="text-white text-xl font-bold">Resource Gathering</h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{getFilteredNodes().length} nodes</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnlyNearby(!showOnlyNearby)}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                showOnlyNearby 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-600 text-slate-300'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Nearby Only
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
                placeholder="Search resources, areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ResourceType | 'all')}
              className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="ore">Ore</option>
              <option value="wood">Wood</option>
              <option value="plant">Plant</option>
              <option value="crystal">Crystal</option>
              <option value="gem">Gem</option>
              <option value="metal">Metal</option>
              <option value="fiber">Fiber</option>
              <option value="leather">Leather</option>
              <option value="bone">Bone</option>
              <option value="essence">Essence</option>
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
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Areas</option>
              {getUniqueAreas().map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-700/50 p-4 border-b border-slate-600">
          <div className="flex gap-2">
            {[
              { key: 'nodes', label: 'Resource Nodes', icon: <TreePine className="w-4 h-4" />, count: getFilteredNodes().length },
              { key: 'sessions', label: 'Gathering Sessions', icon: <Play className="w-4 h-4" />, count: gatheringSessions.length },
              { key: 'stats', label: 'Statistics', icon: <BarChart3 className="w-4 h-4" />, count: 0 },
              { key: 'leaderboard', label: 'Leaderboard', icon: <TrendingUp className="w-4 h-4" />, count: 0 }
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredNodes().map(node => {
                  const resource = resources.find(r => r.id === node.resourceId);
                  if (!resource) return null;

                  return (
                    <div key={node.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-4 hover:border-slate-500 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getResourceTypeIcon(resource.type)}</div>
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
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-300">Status</span>
                          <span className={`${getNodeStatusColor(node)}`}>
                            {getNodeStatusText(node)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-300">Position</span>
                          <span className="text-slate-400">
                            ({node.position.x}, {node.position.y})
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-300">Respawn Time</span>
                          <span className="text-slate-400">
                            {Math.floor(node.respawnTime / 60)}m {node.respawnTime % 60}s
                          </span>
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartGathering(node)}
                            disabled={!node.isActive || selectedNode?.id === node.id}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              node.isActive && selectedNode?.id !== node.id
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {selectedNode?.id === node.id ? 'Gathering...' : 'Start'}
                          </button>
                          <button
                            onClick={() => handleGatherResource(node)}
                            disabled={!node.isActive}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              node.isActive
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            Quick Gather
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gathering Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {gatheringSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">⏱️</div>
                  <p>No active gathering sessions</p>
                  <p className="text-sm">Start gathering resources to see your sessions here</p>
                </div>
              ) : (
                gatheringSessions.map(session => (
                  <div key={session.id} className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">⏱️</div>
                        <div>
                          <h3 className="text-white font-medium">Gathering Session</h3>
                          <p className="text-slate-300 text-sm">
                            Started {session.startTime.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          {session.status}
                        </span>
                        <p className="text-slate-400 text-xs mt-1">
                          {session.efficiency}% efficiency
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Package className="w-6 h-6 text-blue-400" />
                      <div>
                        <h3 className="text-white font-medium">Total Resources</h3>
                        <p className="text-slate-300 text-sm">Resources gathered</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.totalResourcesGathered}</div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-6 h-6 text-yellow-400" />
                      <div>
                        <h3 className="text-white font-medium">Total Experience</h3>
                        <p className="text-slate-300 text-sm">XP gained</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.totalExperience}</div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="w-6 h-6 text-green-400" />
                      <div>
                        <h3 className="text-white font-medium">Efficiency</h3>
                        <p className="text-slate-300 text-sm">Gathering efficiency</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.efficiency}%</div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-6 h-6 text-purple-400" />
                      <div>
                        <h3 className="text-white font-medium">Nodes Visited</h3>
                        <p className="text-slate-300 text-sm">Unique nodes</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.nodesVisited}</div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-6 h-6 text-orange-400" />
                      <div>
                        <h3 className="text-white font-medium">Time Spent</h3>
                        <p className="text-slate-300 text-sm">Hours gathering</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{Math.round(stats.totalTimeSpent / 3600)}h</div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Star className="w-6 h-6 text-pink-400" />
                      <div>
                        <h3 className="text-white font-medium">Average Quality</h3>
                        <p className="text-slate-300 text-sm">Resource quality</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.averageQuality}%</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <div className="text-4xl mb-4">📊</div>
                  <p>No statistics available</p>
                  <p className="text-sm">Start gathering resources to see your stats</p>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">🏆</div>
              <p>Resource gathering leaderboards coming soon!</p>
              <p className="text-sm">Compete with other players in resource gathering</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
