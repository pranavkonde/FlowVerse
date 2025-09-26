import React, { useState, useEffect } from 'react';
import { SocialHub as SocialHubType, HubType, SOCIAL_EVENTS } from '../types/social';
import { useSocket } from '../hooks/useSocket';
import SocialService from '../services/SocialService';

interface SocialHubProps {
  hubId?: string;
  onHubChange?: (hub: SocialHubType) => void;
}

const SocialHub: React.FC<SocialHubProps> = ({ hubId, onHubChange }) => {
  const [hubs, setHubs] = useState<SocialHubType[]>([]);
  const [currentHub, setCurrentHub] = useState<SocialHubType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ type?: HubType; isPublic?: boolean }>({});
  
  const socket = useSocket();
  const socialService = new SocialService(socket);

  useEffect(() => {
    loadHubs();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  useEffect(() => {
    if (hubId) {
      const hub = hubs.find(h => h.id === hubId);
      if (hub) {
        setCurrentHub(hub);
        onHubChange?.(hub);
      }
    }
  }, [hubId, hubs, onHubChange]);

  const loadHubs = async () => {
    try {
      setLoading(true);
      setError(null);
      const hubList = await socialService.getHubs(filters);
      setHubs(hubList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hubs');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    socialService.on(SOCIAL_EVENTS.HUB_CREATED, (data: any) => {
      setHubs(prev => [data, ...prev]);
    });

    socialService.on(SOCIAL_EVENTS.HUB_UPDATED, (data: any) => {
      setHubs(prev => prev.map(hub => hub.id === data.id ? data : hub));
      if (currentHub?.id === data.id) {
        setCurrentHub(data);
        onHubChange?.(data);
      }
    });

    socialService.on(SOCIAL_EVENTS.HUB_JOINED, (data: any) => {
      if (data.hubId === currentHub?.id) {
        setCurrentHub(prev => prev ? { ...prev, currentUsers: prev.currentUsers + 1 } : null);
      }
    });

    socialService.on(SOCIAL_EVENTS.HUB_LEFT, (data: any) => {
      if (data.hubId === currentHub?.id) {
        setCurrentHub(prev => prev ? { ...prev, currentUsers: Math.max(0, prev.currentUsers - 1) } : null);
      }
    });
  };

  const cleanupEventListeners = () => {
    // Cleanup would be handled by the service
  };

  const handleJoinHub = async (hub: SocialHubType) => {
    try {
      setLoading(true);
      await socialService.joinHub(hub.id);
      setCurrentHub(hub);
      onHubChange?.(hub);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join hub');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveHub = async () => {
    if (!currentHub) return;
    
    try {
      setLoading(true);
      await socialService.leaveHub(currentHub.id);
      setCurrentHub(null);
      onHubChange?.(null as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave hub');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: { type?: HubType; isPublic?: boolean }) => {
    setFilters(newFilters);
    loadHubs();
  };

  const getHubTypeColor = (type: HubType): string => {
    const colors = {
      public: 'bg-blue-100 text-blue-800',
      private: 'bg-gray-100 text-gray-800',
      guild: 'bg-purple-100 text-purple-800',
      event: 'bg-green-100 text-green-800',
      party: 'bg-yellow-100 text-yellow-800',
      trading: 'bg-orange-100 text-orange-800',
      gaming: 'bg-red-100 text-red-800',
      social: 'bg-pink-100 text-pink-800',
      educational: 'bg-indigo-100 text-indigo-800',
      entertainment: 'bg-teal-100 text-teal-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getHubTypeIcon = (type: HubType): string => {
    const icons = {
      public: '🌐',
      private: '🔒',
      guild: '⚔️',
      event: '🎉',
      party: '🎊',
      trading: '💰',
      gaming: '🎮',
      social: '👥',
      educational: '📚',
      entertainment: '🎭'
    };
    return icons[type] || '🏠';
  };

  if (loading && hubs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading hubs...</span>
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
          onClick={loadHubs}
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
        <h2 className="text-2xl font-bold text-gray-900">Social Hubs</h2>
        <div className="flex space-x-2">
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange({ ...filters, type: e.target.value as HubType || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="guild">Guild</option>
            <option value="event">Event</option>
            <option value="party">Party</option>
            <option value="trading">Trading</option>
            <option value="gaming">Gaming</option>
            <option value="social">Social</option>
            <option value="educational">Educational</option>
            <option value="entertainment">Entertainment</option>
          </select>
          <button
            onClick={() => handleFilterChange({ ...filters, isPublic: !filters.isPublic })}
            className={`px-3 py-2 rounded-md ${
              filters.isPublic 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Public Only
          </button>
        </div>
      </div>

      {/* Current Hub */}
      {currentHub && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getHubTypeIcon(currentHub.type)}</span>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">{currentHub.name}</h3>
                <p className="text-blue-700">{currentHub.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHubTypeColor(currentHub.type)}`}>
                    {currentHub.type}
                  </span>
                  <span className="text-sm text-blue-600">
                    {currentHub.currentUsers}/{currentHub.capacity} users
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLeaveHub}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Leave Hub
            </button>
          </div>
        </div>
      )}

      {/* Hub List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hubs.map((hub) => (
          <div
            key={hub.id}
            className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
              currentHub?.id === hub.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getHubTypeIcon(hub.type)}</span>
                <h3 className="font-semibold text-gray-900">{hub.name}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHubTypeColor(hub.type)}`}>
                {hub.type}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{hub.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{hub.currentUsers}/{hub.capacity} users</span>
              <span>{hub.features.length} features</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {hub.metadata.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleJoinHub(hub)}
                disabled={loading || currentHub?.id === hub.id}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  currentHub?.id === hub.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentHub?.id === hub.id ? 'Current' : 'Join'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {hubs.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🏠</div>
          <p className="text-gray-600">No hubs found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default SocialHub;
