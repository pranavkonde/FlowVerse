import { 
  SyncData, 
  SyncStatus, 
  SyncOperation, 
  SyncConfig, 
  SyncConflict, 
  DeviceInfo,
  GameState,
  UserProfile,
  AchievementData,
  UserSettings,
  GameProgress,
  InventoryData,
  SocialData,
  SYNC_EVENTS,
  SYNC_STATUS
} from '@/types/sync';

class SyncService {
  private config: SyncConfig;
  private syncStatus: SyncStatus;
  private operations: SyncOperation[] = [];
  private eventListeners: { [event: string]: Function[] } = {};
  private currentUserId: string | null = null;
  private deviceId: string;
  private platform: string;

  constructor() {
    this.deviceId = this.generateDeviceId();
    this.platform = this.detectPlatform();
    
    this.config = {
      autoSync: true,
      syncFrequency: 5, // minutes
      conflictResolution: 'prompt',
      compression: true,
      encryption: true,
      cloudStorage: {
        provider: 'aws',
        bucket: 'flowverse-sync',
        region: 'us-east-1',
        credentials: {},
        encryption: true,
        compression: true,
        versioning: true
      },
      maxRetries: 3,
      timeout: 30000,
      chunkSize: 1024 * 1024 // 1MB
    };

    this.syncStatus = {
      isOnline: navigator.onLine,
      lastSync: new Date(),
      syncInProgress: false,
      conflicts: [],
      devices: [],
      autoSync: true,
      syncFrequency: 5
    };

    this.initializeEventListeners();
    this.loadConfig();
    this.loadSyncStatus();
  }

  // Event System
  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Configuration
  getConfig(): SyncConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  // Sync Status
  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.saveSyncStatus();
  }

  // Device Management
  getDeviceId(): string {
    return this.deviceId;
  }

  getPlatform(): string {
    return this.platform;
  }

  registerDevice(userId: string): void {
    this.currentUserId = userId;
    const deviceInfo: DeviceInfo = {
      id: this.deviceId,
      name: this.getDeviceName(),
      platform: this.platform,
      lastSeen: new Date(),
      isCurrent: true,
      version: '1.0.0',
      capabilities: this.getDeviceCapabilities()
    };

    this.syncStatus.devices = this.syncStatus.devices.filter(d => d.id !== this.deviceId);
    this.syncStatus.devices.push(deviceInfo);
    this.saveSyncStatus();
  }

  // Data Synchronization
  async syncData(userId: string, forceSync: boolean = false): Promise<boolean> {
    if (this.syncStatus.syncInProgress && !forceSync) {
      return false;
    }

    if (!this.syncStatus.isOnline) {
      this.emit(SYNC_EVENTS.SYNC_FAILED, { error: 'No internet connection' });
      return false;
    }

    this.syncStatus.syncInProgress = true;
    this.updateSyncStatus({ syncInProgress: true });

    const operation: SyncOperation = {
      id: Date.now().toString(),
      type: 'upload',
      status: 'in_progress',
      progress: 0,
      startTime: new Date(),
      dataSize: 0,
      transferredSize: 0
    };

    this.operations.push(operation);
    this.emit(SYNC_EVENTS.SYNC_STARTED, operation);

    try {
      // Get local data
      const localData = this.getLocalData(userId);
      operation.dataSize = this.calculateDataSize(localData);

      // Get remote data
      const remoteData = await this.getRemoteData(userId);
      
      // Check for conflicts
      const conflicts = this.detectConflicts(localData, remoteData);
      if (conflicts.length > 0) {
        this.syncStatus.conflicts = conflicts;
        this.updateSyncStatus({ conflicts });
        this.emit(SYNC_EVENTS.CONFLICT_DETECTED, conflicts);
        
        // Handle conflicts based on config
        const resolvedData = await this.resolveConflicts(localData, remoteData, conflicts);
        await this.uploadData(userId, resolvedData, operation);
      } else {
        // No conflicts, merge data
        const mergedData = this.mergeData(localData, remoteData);
        await this.uploadData(userId, mergedData, operation);
      }

      // Download latest data
      const latestData = await this.downloadData(userId);
      this.saveLocalData(userId, latestData);

      operation.status = 'completed';
      operation.endTime = new Date();
      operation.progress = 100;

      this.syncStatus.lastSync = new Date();
      this.syncStatus.syncInProgress = false;
      this.updateSyncStatus({ 
        lastSync: new Date(), 
        syncInProgress: false,
        conflicts: []
      });

      this.emit(SYNC_EVENTS.SYNC_COMPLETED, operation);
      return true;

    } catch (error) {
      operation.status = 'failed';
      operation.endTime = new Date();
      operation.error = error instanceof Error ? error.message : 'Unknown error';

      this.syncStatus.syncInProgress = false;
      this.updateSyncStatus({ syncInProgress: false });

      this.emit(SYNC_EVENTS.SYNC_FAILED, { operation, error });
      return false;
    }
  }

  // Data Management
  private getLocalData(userId: string): SyncData {
    const data = localStorage.getItem(`flowverse_sync_${userId}`);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        lastSync: new Date(parsed.lastSync),
        data: {
          ...parsed.data,
          userProfile: {
            ...parsed.data.userProfile,
            joinDate: new Date(parsed.data.userProfile.joinDate),
            lastActive: new Date(parsed.data.userProfile.lastActive)
          },
          achievements: parsed.data.achievements.map((a: any) => ({
            ...a,
            unlockedAt: new Date(a.unlockedAt)
          }))
        }
      };
    }

    // Return default data structure
    return this.createDefaultSyncData(userId);
  }

  private saveLocalData(userId: string, data: SyncData): void {
    localStorage.setItem(`flowverse_sync_${userId}`, JSON.stringify(data));
  }

  private async getRemoteData(userId: string): Promise<SyncData | null> {
    try {
      // Simulate API call
      const response = await fetch(`/api/sync/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          lastSync: new Date(data.lastSync),
          data: {
            ...data.data,
            userProfile: {
              ...data.data.userProfile,
              joinDate: new Date(data.data.userProfile.joinDate),
              lastActive: new Date(data.data.userProfile.lastActive)
            },
            achievements: data.data.achievements.map((a: any) => ({
              ...a,
              unlockedAt: new Date(a.unlockedAt)
            }))
          }
        };
      }
    } catch (error) {
      console.error('Failed to fetch remote data:', error);
    }
    return null;
  }

  private async uploadData(userId: string, data: SyncData, operation: SyncOperation): Promise<void> {
    try {
      const response = await fetch(`/api/sync/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      // Simulate progress updates
      for (let i = 0; i <= 100; i += 10) {
        operation.progress = i;
        operation.transferredSize = (operation.dataSize * i) / 100;
        this.emit(SYNC_EVENTS.SYNC_PROGRESS, operation);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      throw new Error(`Upload failed: ${error}`);
    }
  }

  private async downloadData(userId: string): Promise<SyncData> {
    const remoteData = await this.getRemoteData(userId);
    if (remoteData) {
      return remoteData;
    }
    return this.getLocalData(userId);
  }

  // Conflict Resolution
  private detectConflicts(localData: SyncData, remoteData: SyncData | null): SyncConflict[] {
    if (!remoteData) return [];

    const conflicts: SyncConflict[] = [];
    const localLastSync = localData.lastSync.getTime();
    const remoteLastSync = remoteData.lastSync.getTime();

    // Check if both were modified since last sync
    if (localLastSync > remoteLastSync && remoteLastSync > localLastSync) {
      // Both modified, check for conflicts
      conflicts.push(...this.compareData(localData.data, remoteData.data));
    }

    return conflicts;
  }

  private compareData(localData: any, remoteData: any, path: string = ''): SyncConflict[] {
    const conflicts: SyncConflict[] = [];

    for (const key in localData) {
      const localValue = localData[key];
      const remoteValue = remoteData[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof localValue === 'object' && typeof remoteValue === 'object') {
        conflicts.push(...this.compareData(localValue, remoteValue, currentPath));
      } else if (localValue !== remoteValue) {
        conflicts.push({
          id: Date.now().toString() + Math.random(),
          type: 'data',
          field: currentPath,
          localValue,
          remoteValue,
          lastModified: new Date(),
          resolution: 'manual'
        });
      }
    }

    return conflicts;
  }

  private async resolveConflicts(localData: SyncData, remoteData: SyncData, conflicts: SyncConflict[]): Promise<SyncData> {
    const resolvedData = { ...localData };

    for (const conflict of conflicts) {
      switch (this.config.conflictResolution) {
        case 'local':
          this.setNestedValue(resolvedData.data, conflict.field, conflict.localValue);
          break;
        case 'remote':
          this.setNestedValue(resolvedData.data, conflict.field, conflict.remoteValue);
          break;
        case 'prompt':
          // In a real implementation, this would show a UI prompt
          // For now, default to local
          this.setNestedValue(resolvedData.data, conflict.field, conflict.localValue);
          break;
        case 'merge':
          // Implement merge logic based on data type
          const mergedValue = this.mergeValues(conflict.localValue, conflict.remoteValue);
          this.setNestedValue(resolvedData.data, conflict.field, mergedValue);
          break;
      }
    }

    return resolvedData;
  }

  private mergeData(localData: SyncData, remoteData: SyncData | null): SyncData {
    if (!remoteData) return localData;

    // Merge strategy: prefer newer data, combine arrays, merge objects
    const mergedData = { ...localData };

    // Merge user profile (prefer local for preferences, remote for stats)
    mergedData.data.userProfile = {
      ...remoteData.data.userProfile,
      ...localData.data.userProfile,
      preferences: localData.data.userProfile.preferences
    };

    // Merge achievements (combine arrays)
    const localAchievements = localData.data.achievements;
    const remoteAchievements = remoteData.data.achievements;
    const mergedAchievements = [...remoteAchievements];
    
    localAchievements.forEach(localAchievement => {
      const existing = mergedAchievements.find(a => a.id === localAchievement.id);
      if (!existing) {
        mergedAchievements.push(localAchievement);
      } else if (localAchievement.progress > existing.progress) {
        Object.assign(existing, localAchievement);
      }
    });

    mergedData.data.achievements = mergedAchievements;

    // Merge game progress (prefer higher values)
    mergedData.data.progress = {
      ...remoteData.data.progress,
      totalScore: Math.max(localData.data.progress.totalScore, remoteData.data.progress.totalScore),
      highScore: Math.max(localData.data.progress.highScore, remoteData.data.progress.highScore),
      gamesPlayed: Math.max(localData.data.progress.gamesPlayed, remoteData.data.progress.gamesPlayed),
      gamesWon: Math.max(localData.data.progress.gamesWon, remoteData.data.progress.gamesWon)
    };

    return mergedData;
  }

  // Utility Methods
  private createDefaultSyncData(userId: string): SyncData {
    return {
      userId,
      deviceId: this.deviceId,
      platform: this.platform,
      lastSync: new Date(),
      version: '1.0.0',
      data: {
        gameState: {
          currentLevel: 1,
          currentScore: 0,
          currentLocation: 'spawn',
          currentGameMode: 'classic',
          sessionData: {
            sessionId: '',
            startTime: new Date(),
            currentScore: 0,
            currentLevel: 1,
            checkpoints: [],
            temporaryData: {}
          },
          unlockedFeatures: [],
          completedQuests: [],
          activeQuests: []
        },
        userProfile: {
          username: `User_${userId.slice(-4)}`,
          avatar: '',
          level: 1,
          experience: 0,
          rank: 0,
          totalPlayTime: 0,
          joinDate: new Date(),
          lastActive: new Date(),
          preferences: {}
        },
        achievements: [],
        settings: {
          audio: {
            masterVolume: 1.0,
            musicVolume: 0.8,
            sfxVolume: 1.0,
            voiceVolume: 1.0,
            muteAll: false
          },
          graphics: {
            quality: 'medium',
            resolution: '1920x1080',
            fullscreen: false,
            vsync: true,
            antiAliasing: true,
            shadows: true,
            particles: true
          },
          controls: {
            sensitivity: 1.0,
            keyBindings: {},
            mouseInverted: false,
            autoRun: false,
            voiceCommands: true
          },
          privacy: {
            showOnlineStatus: true,
            allowFriendRequests: true,
            showActivity: true,
            dataCollection: true
          },
          notifications: {
            pushNotifications: true,
            emailNotifications: false,
            inGameNotifications: true,
            achievementNotifications: true,
            friendNotifications: true
          }
        },
        progress: {
          totalScore: 0,
          highScore: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          totalDistance: 0,
          totalTime: 0,
          completedLevels: [],
          unlockedItems: [],
          statistics: {
            averageSessionTime: 0,
            favoriteGameMode: 'classic',
            bestStreak: 0,
            totalInteractions: 0,
            socialScore: 0,
            tradingVolume: 0
          }
        },
        inventory: {
          tokens: 0,
          nfts: [],
          items: [],
          currency: {}
        },
        social: {
          friends: [],
          guilds: [],
          blockedUsers: [],
          socialSettings: {
            autoAcceptFriends: false,
            showOnlineStatus: true,
            allowGuildInvites: true,
            allowTradeRequests: true
          }
        }
      }
    };
  }

  private generateDeviceId(): string {
    let deviceId = localStorage.getItem('flowverse_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('flowverse_device_id', deviceId);
    }
    return deviceId;
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
      return 'mobile';
    }
    if (/electron/.test(userAgent)) {
      return 'desktop';
    }
    return 'web';
  }

  private getDeviceName(): string {
    const platform = this.platform;
    const deviceId = this.deviceId.slice(-4);
    return `${platform.charAt(0).toUpperCase() + platform.slice(1)} Device ${deviceId}`;
  }

  private getDeviceCapabilities(): string[] {
    const capabilities = ['sync', 'storage'];
    if (navigator.onLine) capabilities.push('online');
    if ('serviceWorker' in navigator) capabilities.push('pwa');
    if ('geolocation' in navigator) capabilities.push('location');
    return capabilities;
  }

  private getAuthToken(): string {
    return localStorage.getItem('flowverse_auth_token') || '';
  }

  private calculateDataSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  private mergeValues(localValue: any, remoteValue: any): any {
    if (typeof localValue === 'number' && typeof remoteValue === 'number') {
      return Math.max(localValue, remoteValue);
    }
    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      return [...new Set([...localValue, ...remoteValue])];
    }
    if (typeof localValue === 'object' && typeof remoteValue === 'object') {
      return { ...remoteValue, ...localValue };
    }
    return localValue; // Default to local value
  }

  // Event Listeners
  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.updateSyncStatus({ isOnline: true });
      if (this.config.autoSync && this.currentUserId) {
        this.syncData(this.currentUserId);
      }
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.updateSyncStatus({ isOnline: false });
    });

    // Auto-sync interval
    setInterval(() => {
      if (this.config.autoSync && this.currentUserId && this.syncStatus.isOnline && !this.syncStatus.syncInProgress) {
        this.syncData(this.currentUserId);
      }
    }, this.config.syncFrequency * 60 * 1000);
  }

  // Data Persistence
  private saveConfig(): void {
    localStorage.setItem('flowverse_sync_config', JSON.stringify(this.config));
  }

  private loadConfig(): void {
    const saved = localStorage.getItem('flowverse_sync_config');
    if (saved) {
      this.config = { ...this.config, ...JSON.parse(saved) };
    }
  }

  private saveSyncStatus(): void {
    localStorage.setItem('flowverse_sync_status', JSON.stringify(this.syncStatus));
  }

  private loadSyncStatus(): void {
    const saved = localStorage.getItem('flowverse_sync_status');
    if (saved) {
      const parsed = JSON.parse(saved);
      this.syncStatus = {
        ...this.syncStatus,
        ...parsed,
        lastSync: new Date(parsed.lastSync),
        devices: parsed.devices.map((d: any) => ({
          ...d,
          lastSeen: new Date(d.lastSeen)
        }))
      };
    }
  }

  // Public API
  async initialize(userId: string): Promise<void> {
    this.registerDevice(userId);
    await this.syncData(userId);
  }

  async forceSync(userId: string): Promise<boolean> {
    return await this.syncData(userId, true);
  }

  getOperations(): SyncOperation[] {
    return this.operations;
  }

  clearConflicts(): void {
    this.syncStatus.conflicts = [];
    this.updateSyncStatus({ conflicts: [] });
  }
}

export const syncService = new SyncService();
