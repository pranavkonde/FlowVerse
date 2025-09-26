import React, { useState, useEffect } from 'react';
import { LandPlot, Building, LAND_NOTIFICATIONS } from '../types/land';
import { useSocket } from '../hooks/useSocket';
import LandService from '../services/LandService';
import LandPlots from './LandPlots';
import Buildings from './Buildings';

interface LandSystemProps {
  onNotification?: (notification: any) => void;
}

const LandSystem: React.FC<LandSystemProps> = ({ onNotification }) => {
  const [activeTab, setActiveTab] = useState<'lands' | 'buildings' | 'resources' | 'market'>('lands');
  const [currentLand, setCurrentLand] = useState<LandPlot | null>(null);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const socket = useSocket();
  const landService = new LandService(socket);

  useEffect(() => {
    setupNotificationListeners();
    
    return () => {
      cleanupNotificationListeners();
    };
  }, []);

  const setupNotificationListeners = () => {
    // Land notifications
    landService.onNotification(LAND_NOTIFICATIONS.LAND_PURCHASE_OFFER, (data: any) => {
      addNotification('Land Purchase Offer', `You have received an offer for ${data.landName}`, 'info');
    });

    landService.onNotification(LAND_NOTIFICATIONS.LAND_RENTAL_OFFER, (data: any) => {
      addNotification('Land Rental Offer', `You have received a rental offer for ${data.landName}`, 'info');
    });

    // Building notifications
    landService.onNotification(LAND_NOTIFICATIONS.BUILDING_CONSTRUCTION_COMPLETE, (data: any) => {
      addNotification('Construction Complete', `${data.buildingName} construction is complete!`, 'success');
    });

    // Resource notifications
    landService.onNotification(LAND_NOTIFICATIONS.RESOURCE_READY, (data: any) => {
      addNotification('Resource Ready', `${data.resourceName} is ready for harvest`, 'info');
    });

    landService.onNotification(LAND_NOTIFICATIONS.RESOURCE_DEPLETED, (data: any) => {
      addNotification('Resource Depleted', `${data.resourceName} has been depleted`, 'warning');
    });

    // Production notifications
    landService.onNotification(LAND_NOTIFICATIONS.PRODUCTION_COMPLETE, (data: any) => {
      addNotification('Production Complete', `${data.productionName} production is complete`, 'success');
    });

    // Worker notifications
    landService.onNotification(LAND_NOTIFICATIONS.WORKER_TASK_ASSIGNED, (data: any) => {
      addNotification('Task Assigned', `You have been assigned a new task: ${data.taskName}`, 'info');
    });

    landService.onNotification(LAND_NOTIFICATIONS.WORKER_EFFICIENCY_LOW, (data: any) => {
      addNotification('Low Efficiency', `Worker efficiency is low in ${data.buildingName}`, 'warning');
    });

    // Upgrade notifications
    landService.onNotification(LAND_NOTIFICATIONS.UPGRADE_AVAILABLE, (data: any) => {
      addNotification('Upgrade Available', `New upgrade available for ${data.buildingName}`, 'info');
    });

    // Permission notifications
    landService.onNotification(LAND_NOTIFICATIONS.PERMISSION_REQUEST, (data: any) => {
      addNotification('Permission Request', `${data.userName} is requesting access to your land`, 'info');
    });

    // Rent notifications
    landService.onNotification(LAND_NOTIFICATIONS.RENT_EXPIRING, (data: any) => {
      addNotification('Rent Expiring', `Your rent for ${data.landName} is expiring soon`, 'warning');
    });

    // Achievement notifications
    landService.onNotification(LAND_NOTIFICATIONS.ACHIEVEMENT_UNLOCKED, (data: any) => {
      addNotification('Achievement Unlocked', `Achievement: ${data.achievementName}`, 'success');
    });

    landService.onNotification(LAND_NOTIFICATIONS.BADGE_EARNED, (data: any) => {
      addNotification('Badge Earned', `Badge: ${data.badgeName}`, 'success');
    });

    // Storage notifications
    landService.onNotification(LAND_NOTIFICATIONS.STORAGE_FULL, (data: any) => {
      addNotification('Storage Full', `Storage in ${data.buildingName} is full`, 'warning');
    });

    // Maintenance notifications
    landService.onNotification(LAND_NOTIFICATIONS.BUILDING_MAINTENANCE_REQUIRED, (data: any) => {
      addNotification('Maintenance Required', `${data.buildingName} requires maintenance`, 'warning');
    });
  };

  const cleanupNotificationListeners = () => {
    // Cleanup would be handled by the service
  };

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10 notifications
    onNotification?.(notification);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string): string => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  };

  const getNotificationColor = (type: string): string => {
    const colors = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Land & Building System</h1>
        <p className="text-gray-600">Own, build, and manage your virtual real estate empire</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'lands', label: 'Land Plots', icon: '🏞️' },
            { id: 'buildings', label: 'Buildings', icon: '🏗️' },
            { id: 'resources', label: 'Resources', icon: '🌿' },
            { id: 'market', label: 'Market', icon: '💰' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-3 flex items-center justify-between ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <div>
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm opacity-90">{notification.message}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs opacity-75">{formatTime(notification.timestamp)}</span>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-lg hover:opacity-75"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'lands' && (
          <div className="p-6">
            <LandPlots
              onLandSelect={setCurrentLand}
            />
          </div>
        )}

        {activeTab === 'buildings' && (
          <div className="p-6">
            <Buildings
              landId={currentLand?.id}
              onBuildingSelect={setCurrentBuilding}
            />
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🌿</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Resource Management</h3>
              <p className="text-gray-600 mb-4">Manage and harvest resources from your land plots</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-800 text-sm">
                  Resource management features will be available in the next update. 
                  This will include harvesting, regeneration, and resource trading.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Land Market</h3>
              <p className="text-gray-600 mb-4">Buy, sell, and trade land plots and buildings</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-800 text-sm">
                  Land marketplace features will be available in the next update. 
                  This will include auctions, trading, and price discovery.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Selection Summary */}
      {(currentLand || currentBuilding) && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentLand && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🏞️</span>
                  <h4 className="font-medium text-gray-900">Selected Land</h4>
                </div>
                <p className="text-sm text-gray-600">{currentLand.metadata.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {currentLand.type}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    {currentLand.rarity}
                  </span>
                </div>
              </div>
            )}
            
            {currentBuilding && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🏗️</span>
                  <h4 className="font-medium text-gray-900">Selected Building</h4>
                </div>
                <p className="text-sm text-gray-600">{currentBuilding.name}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {currentBuilding.type}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    Level {currentBuilding.level}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandSystem;
