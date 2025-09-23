'use client';

import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertTriangle, X, Settings, Smartphone, Monitor, Globe, Wifi, WifiOff, Clock, Download, Upload, AlertCircle } from 'lucide-react';
import { SyncStatus, SyncOperation, SyncConflict, DeviceInfo, SYNC_EVENTS } from '@/types/sync';
import { syncService } from '@/services/SyncService';

interface CrossPlatformSyncProps {
  isVisible: boolean;
  onToggle: () => void;
  userId: string;
}

export default function CrossPlatformSync({ isVisible, onToggle, userId }: CrossPlatformSyncProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [operations, setOperations] = useState<SyncOperation[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState(5);

  useEffect(() => {
    if (isVisible && userId) {
      initializeSync();
    }
  }, [isVisible, userId]);

  const initializeSync = async () => {
    try {
      await syncService.initialize(userId);
      updateSyncData();
    } catch (error) {
      console.error('Failed to initialize sync:', error);
    }
  };

  const updateSyncData = () => {
    setSyncStatus(syncService.getSyncStatus());
    setOperations(syncService.getOperations());
    setConflicts(syncService.getSyncStatus().conflicts);
  };

  useEffect(() => {
    // Set up event listeners
    const handleSyncStarted = () => {
      setIsSyncing(true);
      updateSyncData();
    };

    const handleSyncCompleted = () => {
      setIsSyncing(false);
      updateSyncData();
    };

    const handleSyncFailed = () => {
      setIsSyncing(false);
      updateSyncData();
    };

    const handleConflictDetected = (newConflicts: SyncConflict[]) => {
      setConflicts(newConflicts);
      updateSyncData();
    };

    syncService.on(SYNC_EVENTS.SYNC_STARTED, handleSyncStarted);
    syncService.on(SYNC_EVENTS.SYNC_COMPLETED, handleSyncCompleted);
    syncService.on(SYNC_EVENTS.SYNC_FAILED, handleSyncFailed);
    syncService.on(SYNC_EVENTS.CONFLICT_DETECTED, handleConflictDetected);

    return () => {
      syncService.off(SYNC_EVENTS.SYNC_STARTED, handleSyncStarted);
      syncService.off(SYNC_EVENTS.SYNC_COMPLETED, handleSyncCompleted);
      syncService.off(SYNC_EVENTS.SYNC_FAILED, handleSyncFailed);
      syncService.off(SYNC_EVENTS.CONFLICT_DETECTED, handleConflictDetected);
    };
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await syncService.forceSync(userId);
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setIsSyncing(false);
      updateSyncData();
    }
  };

  const handleResolveConflict = (conflictId: string, resolution: 'local' | 'remote') => {
    // In a real implementation, this would update the conflict resolution
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    syncService.clearConflicts();
  };

  const getDeviceIcon = (platform: string) => {
    switch (platform) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'desktop': return <Monitor className="w-5 h-5" />;
      case 'web': return <Globe className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400';
      case 'failed': return 'text-red-400 bg-red-400/10 border-red-400';
      case 'in_progress': return 'text-blue-400 bg-blue-400/10 border-blue-400';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4 animate-spin" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cloud className="w-6 h-6 text-blue-400" />
            <h2 className="text-white text-xl font-bold">Cross-Platform Sync</h2>
            {syncStatus?.isOnline ? (
              <div className="flex items-center gap-1 text-green-400">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
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

        <div className="p-6 space-y-6">
          {/* Sync Status */}
          <div className="bg-slate-700/50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium text-lg">Sync Status</h3>
              <button
                onClick={handleForceSync}
                disabled={isSyncing || !syncStatus?.isOnline}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">
                  {syncStatus?.lastSync ? formatTimeAgo(syncStatus.lastSync) : 'Never'}
                </div>
                <div className="text-sm text-slate-400">Last Sync</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">
                  {syncStatus?.devices.length || 0}
                </div>
                <div className="text-sm text-slate-400">Connected Devices</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">
                  {conflicts.length}
                </div>
                <div className="text-sm text-slate-400">Conflicts</div>
              </div>
            </div>
          </div>

          {/* Settings */}
          {showSettings && (
            <div className="bg-slate-700/50 p-6 rounded-lg">
              <h3 className="text-white font-medium text-lg mb-4">Sync Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Auto Sync</div>
                    <div className="text-sm text-slate-400">Automatically sync data in the background</div>
                  </div>
                  <button
                    onClick={() => setAutoSync(!autoSync)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      autoSync ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      autoSync ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Sync Frequency</div>
                    <div className="text-sm text-slate-400">How often to sync data</div>
                  </div>
                  <select
                    value={syncFrequency}
                    onChange={(e) => setSyncFrequency(Number(e.target.value))}
                    className="bg-slate-600 text-white px-3 py-2 rounded-lg border border-slate-500"
                  >
                    <option value={1}>Every minute</option>
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every hour</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Connected Devices */}
          <div className="bg-slate-700/50 p-6 rounded-lg">
            <h3 className="text-white font-medium text-lg mb-4">Connected Devices</h3>
            <div className="space-y-3">
              {syncStatus?.devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.platform)}
                    <div>
                      <div className="text-white font-medium">{device.name}</div>
                      <div className="text-sm text-slate-400">
                        {device.platform} • {formatTimeAgo(device.lastSeen)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.isCurrent && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                    <span className="text-xs text-slate-400">v{device.version}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Operations */}
          {operations.length > 0 && (
            <div className="bg-slate-700/50 p-6 rounded-lg">
              <h3 className="text-white font-medium text-lg mb-4">Recent Operations</h3>
              <div className="space-y-3">
                {operations.slice(-5).map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {operation.type === 'upload' ? (
                        <Upload className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Download className="w-5 h-5 text-green-400" />
                      )}
                      <div>
                        <div className="text-white font-medium capitalize">{operation.type}</div>
                        <div className="text-sm text-slate-400">
                          {formatFileSize(operation.dataSize)} • {formatTimeAgo(operation.startTime)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusColor(operation.status)}`}>
                        {getStatusIcon(operation.status)}
                        <span className="text-sm font-medium capitalize">{operation.status}</span>
                      </div>
                      {operation.status === 'in_progress' && (
                        <div className="text-sm text-slate-400">
                          {operation.progress}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="bg-slate-700/50 p-6 rounded-lg">
              <h3 className="text-white font-medium text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Data Conflicts
              </h3>
              <div className="space-y-3">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="p-4 bg-slate-800 rounded-lg border border-yellow-400/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white font-medium">{conflict.field}</div>
                      <div className="text-sm text-slate-400">
                        {formatTimeAgo(conflict.lastModified)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Local Value</div>
                        <div className="text-white bg-slate-700 p-2 rounded text-sm">
                          {JSON.stringify(conflict.localValue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Remote Value</div>
                        <div className="text-white bg-slate-700 p-2 rounded text-sm">
                          {JSON.stringify(conflict.remoteValue)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveConflict(conflict.id, 'local')}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Keep Local
                      </button>
                      <button
                        onClick={() => handleResolveConflict(conflict.id, 'remote')}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Use Remote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
