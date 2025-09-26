import React, { useState, useEffect } from 'react';
import { Building, BuildingType, BuildingCategory, LAND_EVENTS } from '../types/land';
import { useSocket } from '../hooks/useSocket';
import LandService from '../services/LandService';

interface BuildingsProps {
  landId?: string;
  onBuildingSelect?: (building: Building) => void;
}

const Buildings: React.FC<BuildingsProps> = ({ landId, onBuildingSelect }) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ type?: BuildingType; category?: BuildingCategory; isConstructed?: boolean }>({});
  
  const socket = useSocket();
  const landService = new LandService(socket);

  useEffect(() => {
    loadBuildings();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, [landId]);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      setError(null);
      const buildingList = await landService.getBuildings(filters);
      // Filter by landId if provided
      const filteredBuildings = landId 
        ? buildingList.filter(building => building.landId === landId)
        : buildingList;
      setBuildings(filteredBuildings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    landService.on(LAND_EVENTS.BUILDING_CONSTRUCTED, (data: any) => {
      if (!landId || data.landId === landId) {
        setBuildings(prev => [data.building, ...prev]);
      }
    });

    landService.on(LAND_EVENTS.BUILDING_DEMOLISHED, (data: any) => {
      setBuildings(prev => prev.filter(building => building.id !== data.building.id));
    });

    landService.on(LAND_EVENTS.BUILDING_UPGRADED, (data: any) => {
      setBuildings(prev => prev.map(building => building.id === data.building.id ? data.building : building));
      if (selectedBuilding?.id === data.building.id) {
        setSelectedBuilding(data.building);
        onBuildingSelect?.(data.building);
      }
    });
  };

  const cleanupEventListeners = () => {
    // Cleanup would be handled by the service
  };

  const handleSelectBuilding = (building: Building) => {
    setSelectedBuilding(building);
    onBuildingSelect?.(building);
  };

  const handleFilterChange = (newFilters: { type?: BuildingType; category?: BuildingCategory; isConstructed?: boolean }) => {
    setFilters(newFilters);
    loadBuildings();
  };

  const getBuildingTypeColor = (type: BuildingType): string => {
    const colors = {
      house: 'bg-blue-100 text-blue-800',
      apartment: 'bg-indigo-100 text-indigo-800',
      office: 'bg-gray-100 text-gray-800',
      shop: 'bg-green-100 text-green-800',
      factory: 'bg-orange-100 text-orange-800',
      warehouse: 'bg-yellow-100 text-yellow-800',
      farm: 'bg-emerald-100 text-emerald-800',
      school: 'bg-purple-100 text-purple-800',
      hospital: 'bg-red-100 text-red-800',
      park: 'bg-green-100 text-green-800',
      monument: 'bg-yellow-100 text-yellow-800',
      tower: 'bg-gray-100 text-gray-800',
      bridge: 'bg-blue-100 text-blue-800',
      road: 'bg-gray-100 text-gray-800',
      utility: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getBuildingTypeIcon = (type: BuildingType): string => {
    const icons = {
      house: '🏠',
      apartment: '🏢',
      office: '🏢',
      shop: '🏪',
      factory: '🏭',
      warehouse: '🏬',
      farm: '🚜',
      school: '🎓',
      hospital: '🏥',
      park: '🌳',
      monument: '🗽',
      tower: '🗼',
      bridge: '🌉',
      road: '🛣️',
      utility: '⚡'
    };
    return icons[type] || '🏗️';
  };

  const getCategoryColor = (category: BuildingCategory): string => {
    const colors = {
      residential: 'bg-blue-100 text-blue-800',
      commercial: 'bg-green-100 text-green-800',
      industrial: 'bg-gray-100 text-gray-800',
      agricultural: 'bg-yellow-100 text-yellow-800',
      recreational: 'bg-pink-100 text-pink-800',
      educational: 'bg-purple-100 text-purple-800',
      governmental: 'bg-red-100 text-red-800',
      infrastructure: 'bg-indigo-100 text-indigo-800',
      utility: 'bg-orange-100 text-orange-800',
      special: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getConstructionStatus = (building: Building): { status: string; color: string; progress: number } => {
    if (building.isConstructed) {
      return { status: 'Constructed', color: 'bg-green-100 text-green-800', progress: 100 };
    }
    
    const progress = (building.constructionProgress / building.constructionTime) * 100;
    if (progress >= 100) {
      return { status: 'Ready', color: 'bg-blue-100 text-blue-800', progress: 100 };
    }
    
    return { status: 'Constructing', color: 'bg-yellow-100 text-yellow-800', progress };
  };

  const formatSize = (size: { width: number; height: number; depth: number }): string => {
    return `${size.width}×${size.height}×${size.depth}`;
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && buildings.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading buildings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400 mr-2">⚠️</div>
          <div className="text-red-800">{error}</div>
        </div>
        <button 
          onClick={loadBuildings}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Buildings</h2>
        <div className="flex space-x-2">
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange({ ...filters, type: e.target.value as BuildingType || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="office">Office</option>
            <option value="shop">Shop</option>
            <option value="factory">Factory</option>
            <option value="warehouse">Warehouse</option>
            <option value="farm">Farm</option>
            <option value="school">School</option>
            <option value="hospital">Hospital</option>
            <option value="park">Park</option>
            <option value="monument">Monument</option>
            <option value="tower">Tower</option>
            <option value="bridge">Bridge</option>
            <option value="road">Road</option>
            <option value="utility">Utility</option>
          </select>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange({ ...filters, category: e.target.value as BuildingCategory || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="agricultural">Agricultural</option>
            <option value="recreational">Recreational</option>
            <option value="educational">Educational</option>
            <option value="governmental">Governmental</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="utility">Utility</option>
            <option value="special">Special</option>
          </select>
          <button
            onClick={() => handleFilterChange({ ...filters, isConstructed: !filters.isConstructed })}
            className={`px-3 py-2 rounded-md ${
              filters.isConstructed 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Constructed
          </button>
        </div>
      </div>

      {/* Selected Building */}
      {selectedBuilding && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getBuildingTypeIcon(selectedBuilding.type)}</span>
              <div>
                <h3 className="text-lg font-semibold text-green-900">{selectedBuilding.name}</h3>
                <p className="text-green-700">{selectedBuilding.metadata.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBuildingTypeColor(selectedBuilding.type)}`}>
                    {selectedBuilding.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedBuilding.category)}`}>
                    {selectedBuilding.category}
                  </span>
                  <span className="text-sm text-green-600">
                    Level {selectedBuilding.level}/{selectedBuilding.maxLevel}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {selectedBuilding.isConstructed ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  ✅ Constructed
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  🏗️ Constructing
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Building List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map((building) => {
          const constructionStatus = getConstructionStatus(building);
          
          return (
            <div
              key={building.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                selectedBuilding?.id === building.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onClick={() => handleSelectBuilding(building)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getBuildingTypeIcon(building.type)}</span>
                  <h3 className="font-semibold text-gray-900">{building.name}</h3>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBuildingTypeColor(building.type)}`}>
                    {building.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(building.category)}`}>
                    {building.category}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>📏 {formatSize(building.size)}</span>
                  <span>📊 Level {building.level}/{building.maxLevel}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>🏭 {building.production.length} production</span>
                  <span>👥 {building.workers.length} workers</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>📦 {building.storage.length} storage</span>
                  <span>⬆️ {building.upgrades.length} upgrades</span>
                </div>
              </div>
              
              {/* Construction Progress */}
              {!building.isConstructed && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Construction Progress</span>
                    <span>{Math.round(constructionStatus.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${constructionStatus.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {building.metadata.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${constructionStatus.color}`}>
                  {constructionStatus.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {buildings.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🏗️</div>
          <p className="text-gray-600">No buildings found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default Buildings;
