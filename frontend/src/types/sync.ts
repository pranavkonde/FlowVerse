export interface SyncData {
  userId: string;
  deviceId: string;
  platform: 'web' | 'mobile' | 'desktop';
  lastSync: Date;
  version: string;
  data: {
    gameState: GameState;
    userProfile: UserProfile;
    achievements: AchievementData[];
    settings: UserSettings;
    progress: GameProgress;
    inventory: InventoryData;
    social: SocialData;
  };
}

export interface GameState {
  currentLevel: number;
  currentScore: number;
  currentLocation: string;
  currentGameMode: string;
  sessionData: SessionData;
  unlockedFeatures: string[];
  completedQuests: string[];
  activeQuests: string[];
}

export interface UserProfile {
  username: string;
  avatar: string;
  level: number;
  experience: number;
  rank: number;
  totalPlayTime: number;
  joinDate: Date;
  lastActive: Date;
  preferences: UserPreferences;
}

export interface AchievementData {
  id: string;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
}

export interface UserSettings {
  audio: AudioSettings;
  graphics: GraphicsSettings;
  controls: ControlSettings;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  muteAll: boolean;
}

export interface GraphicsSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: string;
  fullscreen: boolean;
  vsync: boolean;
  antiAliasing: boolean;
  shadows: boolean;
  particles: boolean;
}

export interface ControlSettings {
  sensitivity: number;
  keyBindings: { [key: string]: string };
  mouseInverted: boolean;
  autoRun: boolean;
  voiceCommands: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  showActivity: boolean;
  dataCollection: boolean;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  inGameNotifications: boolean;
  achievementNotifications: boolean;
  friendNotifications: boolean;
}

export interface GameProgress {
  totalScore: number;
  highScore: number;
  gamesPlayed: number;
  gamesWon: number;
  totalDistance: number;
  totalTime: number;
  completedLevels: number[];
  unlockedItems: string[];
  statistics: GameStatistics;
}

export interface GameStatistics {
  averageSessionTime: number;
  favoriteGameMode: string;
  bestStreak: number;
  totalInteractions: number;
  socialScore: number;
  tradingVolume: number;
}

export interface InventoryData {
  tokens: number;
  nfts: NFTData[];
  items: ItemData[];
  currency: { [currency: string]: number };
}

export interface NFTData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: string;
  acquiredAt: Date;
  metadata: any;
}

export interface ItemData {
  id: string;
  name: string;
  type: string;
  quantity: number;
  acquiredAt: Date;
  metadata: any;
}

export interface SocialData {
  friends: FriendData[];
  guilds: GuildData[];
  blockedUsers: string[];
  socialSettings: SocialSettings;
}

export interface FriendData {
  userId: string;
  username: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  friendshipLevel: number;
}

export interface GuildData {
  guildId: string;
  name: string;
  role: string;
  joinedAt: Date;
  contribution: number;
}

export interface SocialSettings {
  autoAcceptFriends: boolean;
  showOnlineStatus: boolean;
  allowGuildInvites: boolean;
  allowTradeRequests: boolean;
}

export interface SessionData {
  sessionId: string;
  startTime: Date;
  currentScore: number;
  currentLevel: number;
  checkpoints: CheckpointData[];
  temporaryData: any;
}

export interface CheckpointData {
  id: string;
  timestamp: Date;
  level: number;
  score: number;
  location: string;
  data: any;
}

export interface SyncConflict {
  id: string;
  type: 'data' | 'settings' | 'progress';
  field: string;
  localValue: any;
  remoteValue: any;
  lastModified: Date;
  resolution: 'local' | 'remote' | 'merge' | 'manual';
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date;
  syncInProgress: boolean;
  conflicts: SyncConflict[];
  devices: DeviceInfo[];
  autoSync: boolean;
  syncFrequency: number; // minutes
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  lastSeen: Date;
  isCurrent: boolean;
  version: string;
  capabilities: string[];
}

export interface SyncOperation {
  id: string;
  type: 'upload' | 'download' | 'merge';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  dataSize: number;
  transferredSize: number;
}

export interface CloudStorage {
  provider: 'aws' | 'google' | 'azure' | 'custom';
  bucket: string;
  region: string;
  credentials: any;
  encryption: boolean;
  compression: boolean;
  versioning: boolean;
}

export interface SyncConfig {
  autoSync: boolean;
  syncFrequency: number;
  conflictResolution: 'local' | 'remote' | 'prompt';
  compression: boolean;
  encryption: boolean;
  cloudStorage: CloudStorage;
  maxRetries: number;
  timeout: number;
  chunkSize: number;
}

export const SYNC_EVENTS = {
  SYNC_STARTED: 'sync_started',
  SYNC_PROGRESS: 'sync_progress',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  CONFLICT_DETECTED: 'conflict_detected',
  DEVICE_CONNECTED: 'device_connected',
  DEVICE_DISCONNECTED: 'device_disconnected',
  DATA_UPDATED: 'data_updated'
};

export const PLATFORMS = {
  WEB: 'web',
  MOBILE: 'mobile',
  DESKTOP: 'desktop'
} as const;

export const SYNC_STATUS = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  CONFLICT: 'conflict',
  ERROR: 'error',
  OFFLINE: 'offline'
} as const;
