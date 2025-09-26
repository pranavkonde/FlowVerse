import React, { useState, useEffect } from 'react';
import { LandPlot, LandType, LandRarity, LAND_EVENTS } from '../types/land';
import { useSocket } from '../hooks/useSocket';
import LandService from '../services/LandService';

interface LandPlotsProps {
  onLandSelect?: (land: LandPlot) => void;
}

const LandPlots: React.FC<LandPlotsProps> = ({ onLandSelect }) => {
  const [lands, setLands] = useState<LandPlot[]>([]);
  const [selectedLand, setSelectedLand] = useState<LandPlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ type?: LandType; isForSale?: boolean; isRentable?: boolean }>({});
  
  const socket = useSocket();
  const landService = new LandService(socket);

  useEffect(() => {
    loadLands();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  const loadLands = async () => {
    try {
      setLoading(true);
      setError(null);
      const landList = await landService.getLands(filters);
      setLands(landList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lands');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    landService.on(LAND_EVENTS.LAND_PURCHASED, (data: any) => {
      setLands(prev => [data, ...prev]);
    });

    landService.on(LAND_EVENTS.LAND_SOLD, (data: any) => {
      setLands(prev => prev.map(land => land.id === data.land.id ? data.land : land));
    });

    landService.on(LAND_EVENTS.LAND_RENTED, (data: any) => {
      setLands(prev => prev.map(land => land.id === data.land.id ? data.land : land));
    });
  };

  const cleanupEventListeners = () => {
    // Cleanup would be handled by the service
  };

  const handleSelectLand = (land: LandPlot) => {
    setSelectedLand(land);
    onLandSelect?.(land);
  };

  const handleFilterChange = (newFilters: { type?: LandType; isForSale?: boolean; isRentable?: boolean }) => {
    setFilters(newFilters);
    loadLands();
  };

  const getLandTypeColor = (type: LandType): string => {
    const colors = {
      residential: 'bg-blue-100 text-blue-800',
      commercial: 'bg-green-100 text-green-800',
      industrial: 'bg-gray-100 text-gray-800',
      agricultural: 'bg-yellow-100 text-yellow-800',
      recreational: 'bg-pink-100 text-pink-800',
      educational: 'bg-purple-100 text-purple-800',
      governmental: 'bg-red-100 text-red-800',
      mixed_use: 'bg-indigo-100 text-indigo-800',
      special: 'bg-orange-100 text-orange-800',
      wilderness: 'bg-emerald-100 text-emerald-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getLandTypeIcon = (type: LandType): string => {
    const icons = {
      residential: '🏠',
      commercial: '🏢',
      industrial: '🏭',
      agricultural: '🚜',
      recreational: '🎡',
      educational: '🎓',
      governmental: '🏛️',
      mixed_use: '🏘️',
      special: '⭐',
      wilderness: '🌲'
    };
    return icons[type] || '🏞️';
  };

  const getRarityColor = (rarity: LandRarity): string => {
    const colors = {
      common: 'bg-gray-100 text-gray-800',
      uncommon: 'bg-green-100 text-green-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-orange-100 text-orange-800',
      mythic: 'bg-red-100 text-red-800',
      unique: 'bg-yellow-100 text-yellow-800'
    };
    return colors[rarity] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatSize = (size: { width: number; height: number; depth: number }): string => {
    return `${size.width}×${size.height}×${size.depth}`;
  };

  if (loading && lands.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading lands...</span>
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
          onClick={loadLands}
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
        <h2 className="text-2xl font-bold text-gray-900">Land Plots</h2>
        <div className="flex space-x-2">
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange({ ...filters, type: e.target.value as LandType || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="agricultural">Agricultural</option>
            <option value="recreational">Recreational</option>
            <option value="educational">Educational</option>
            <option value="governmental">Governmental</option>
            <option value="mixed_use">Mixed Use</option>
            <option value="special">Special</option>
            <option value="wilderness">Wilderness</option>
          </select>
          <button
            onClick={() => handleFilterChange({ ...filters, isForSale: !filters.isForSale })}
            className={`px-3 py-2 rounded-md ${
              filters.isForSale 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            For Sale
          </button>
          <button
            onClick={() => handleFilterChange({ ...filters, isRentable: !filters.isRentable })}
            className={`px-3 py-2 rounded-md ${
              filters.isRentable 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rentable
          </button>
        </div>
      </div>

      {/* Selected Land */}
      {selectedLand && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getLandTypeIcon(selectedLand.type)}</span>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">{selectedLand.metadata.description}</h3>
                <p className="text-blue-700">Coordinates: {selectedLand.coordinates.gridPosition}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLandTypeColor(selectedLand.type)}`}>
                    {selectedLand.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(selectedLand.rarity)}`}>
                    {selectedLand.rarity}
                  </span>
                  <span className="text-sm text-blue-600">
                    {formatSize(selectedLand.size)} units
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {selectedLand.isForSale && selectedLand.salePrice && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {formatPrice(selectedLand.salePrice)}
                </span>
              )}
              {selectedLand.isRentable && selectedLand.rentPrice && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {formatPrice(selectedLand.rentPrice)}/month
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Land List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lands.map((land) => (
          <div
            key={land.id}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
              selectedLand?.id === land.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => handleSelectLand(land)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getLandTypeIcon(land.type)}</span>
                <h3 className="font-semibold text-gray-900">{land.metadata.description}</h3>
              </div>
              <div className="flex flex-col space-y-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLandTypeColor(land.type)}`}>
                  {land.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(land.rarity)}`}>
                  {land.rarity}
                </span>
              </div>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>📍 {land.coordinates.gridPosition}</span>
                <span>📏 {formatSize(land.size)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>🏗️ {land.buildings.length} buildings</span>
                <span>🌿 {land.resources.length} resources</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>🎨 {land.decorations.length} decorations</span>
                <span>👥 {land.permissions.length} permissions</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {land.metadata.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex space-x-1">
                {land.isForSale && land.salePrice && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {formatPrice(land.salePrice)}
                  </span>
                )}
                {land.isRentable && land.rentPrice && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {formatPrice(land.rentPrice)}/mo
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lands.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🏞️</div>
          <p className="text-gray-600">No lands found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default LandPlots;
