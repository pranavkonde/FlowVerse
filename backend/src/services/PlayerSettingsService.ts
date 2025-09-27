import { Server as SocketIOServer } from 'socket.io';
import { EventEmitter } from 'events';

export interface PlayerSettings {
  userId: string;
  gameSettings: GameSettings;
  uiSettings: UISettings;
  audioSettings: AudioSettings;
  accessibilitySettings: AccessibilitySettings;
  privacySettings: PrivacySettings;
  socialSettings: SocialSettings;
  notificationSettings: NotificationSettings;
  lastUpdated: Date;
  version: string;
}

export interface GameSettings {
  // Graphics & Performance
  graphicsQuality: GraphicsQuality;
  frameRate: FrameRate;
  resolution: Resolution;
  fullscreen: boolean;
  vsync: boolean;
  antiAliasing: boolean;
  shadows: boolean;
  particles: boolean;
  effects: boolean;
  
  // Gameplay
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  confirmActions: boolean;
  tooltips: boolean;
  minimap: boolean;
  healthBars: boolean;
  damageNumbers: boolean;
  combatLog: boolean;
  
  // Controls
  mouseSensitivity: number;
  keyboardLayout: KeyboardLayout;
  keyBindings: KeyBindings;
  invertMouse: boolean;
  mouseAcceleration: boolean;
  
  // Camera
  cameraDistance: number;
  cameraAngle: number;
  cameraSmoothing: boolean;
  cameraShake: boolean;
  
  // Language & Region
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: TimeFormat;
  currency: string;
}

export interface UISettings {
  // Theme & Appearance
  theme: Theme;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  fontFamily: string;
  uiScale: number;
  opacity: number;
  
  // Layout
  layout: Layout;
  sidebarPosition: SidebarPosition;
  chatPosition: ChatPosition;
  minimapPosition: MinimapPosition;
  
  // Panels & Windows
  showSidebar: boolean;
  showChat: boolean;
  showMinimap: boolean;
  showActionBar: boolean;
  showInventory: boolean;
  showCharacter: boolean;
  showQuestLog: boolean;
  showFriends: boolean;
  showGuild: boolean;
  
  // Animations
  animations: boolean;
  transitions: boolean;
  hoverEffects: boolean;
  loadingAnimations: boolean;
  
  // Notifications
  showNotifications: boolean;
  notificationPosition: NotificationPosition;
  notificationDuration: number;
  showToastNotifications: boolean;
}

export interface AudioSettings {
  // Master Volume
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  
  // Audio Quality
  audioQuality: AudioQuality;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  
  // 3D Audio
  spatialAudio: boolean;
  audioDistance: number;
  audioFalloff: number;
  
  // Voice Chat
  voiceChat: boolean;
  voiceActivation: boolean;
  voiceActivationThreshold: number;
  pushToTalk: boolean;
  pushToTalkKey: string;
  
  // Audio Effects
  reverb: boolean;
  echo: boolean;
  compression: boolean;
  equalizer: EqualizerSettings;
}

export interface AccessibilitySettings {
  // Visual Accessibility
  highContrast: boolean;
  colorBlindSupport: ColorBlindSupport;
  textToSpeech: boolean;
  screenReader: boolean;
  largeText: boolean;
  textSize: number;
  
  // Motor Accessibility
  oneHandedMode: boolean;
  stickyKeys: boolean;
  slowKeys: boolean;
  bounceKeys: boolean;
  mouseKeys: boolean;
  
  // Cognitive Accessibility
  simplifiedUI: boolean;
  reducedMotion: boolean;
  clearInstructions: boolean;
  progressIndicators: boolean;
  errorMessages: boolean;
  
  // Hearing Accessibility
  visualAlerts: boolean;
  subtitles: boolean;
  captionSize: number;
  captionColor: string;
  captionBackground: string;
}

export interface PrivacySettings {
  // Profile Visibility
  profileVisibility: ProfileVisibility;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showLocation: boolean;
  showLevel: boolean;
  showAchievements: boolean;
  
  // Friend Requests
  allowFriendRequests: boolean;
  allowGuildInvites: boolean;
  allowTradeRequests: boolean;
  allowDuelRequests: boolean;
  
  // Data Collection
  analytics: boolean;
  crashReports: boolean;
  performanceData: boolean;
  usageStatistics: boolean;
  
  // Communication
  allowPrivateMessages: boolean;
  allowGuildMessages: boolean;
  allowGlobalChat: boolean;
  filterProfanity: boolean;
  blockList: string[];
}

export interface SocialSettings {
  // Friend System
  autoAcceptFriends: boolean;
  showFriendActivity: boolean;
  friendNotifications: boolean;
  friendOnlineNotifications: boolean;
  
  // Guild System
  guildNotifications: boolean;
  guildChatNotifications: boolean;
  guildEventNotifications: boolean;
  guildWarNotifications: boolean;
  
  // Trading
  allowTrades: boolean;
  tradeNotifications: boolean;
  autoAcceptTrades: boolean;
  tradeConfirmation: boolean;
  
  // PvP
  allowPvP: boolean;
  pvpNotifications: boolean;
  duelNotifications: boolean;
  tournamentNotifications: boolean;
}

export interface NotificationSettings {
  // General
  enableNotifications: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;
  
  // Categories
  achievementNotifications: boolean;
  questNotifications: boolean;
  levelUpNotifications: boolean;
  itemNotifications: boolean;
  combatNotifications: boolean;
  socialNotifications: boolean;
  systemNotifications: boolean;
  
  // Timing
  quietHours: boolean;
  quietStart: string; // HH:MM format
  quietEnd: string; // HH:MM format
  timezone: string;
  
  // Channels
  inGameNotifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// Enums
export enum GraphicsQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra',
  CUSTOM = 'custom'
}

export enum FrameRate {
  FPS_30 = '30',
  FPS_60 = '60',
  FPS_120 = '120',
  UNLIMITED = 'unlimited'
}

export enum Resolution {
  HD_720 = '1280x720',
  HD_1080 = '1920x1080',
  QHD_1440 = '2560x1440',
  UHD_4K = '3840x2160',
  CUSTOM = 'custom'
}

export enum KeyboardLayout {
  QWERTY = 'qwerty',
  AZERTY = 'azerty',
  QWERTZ = 'qwertz',
  DVORAK = 'dvorak',
  CUSTOM = 'custom'
}

export enum TimeFormat {
  H12 = '12h',
  H24 = '24h'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
  CUSTOM = 'custom'
}

export enum ColorScheme {
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  RED = 'red',
  ORANGE = 'orange',
  CUSTOM = 'custom'
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large'
}

export enum Layout {
  COMPACT = 'compact',
  NORMAL = 'normal',
  SPACIOUS = 'spacious',
  CUSTOM = 'custom'
}

export enum SidebarPosition {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom'
}

export enum ChatPosition {
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right'
}

export enum MinimapPosition {
  TOP_RIGHT = 'top_right',
  TOP_LEFT = 'top_left',
  BOTTOM_RIGHT = 'bottom_right',
  BOTTOM_LEFT = 'bottom_left'
}

export enum NotificationPosition {
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
  CENTER = 'center'
}

export enum AudioQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  LOSSLESS = 'lossless'
}

export enum ColorBlindSupport {
  NONE = 'none',
  PROTANOPIA = 'protanopia',
  DEUTERANOPIA = 'deuteranopia',
  TRITANOPIA = 'tritanopia',
  MONOCHROMACY = 'monochromacy'
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  GUILD = 'guild',
  PRIVATE = 'private'
}

export interface KeyBindings {
  [key: string]: string;
}

export interface EqualizerSettings {
  bass: number;
  mid: number;
  treble: number;
  custom: number[];
}

export class PlayerSettingsService extends EventEmitter {
  private settings: Map<string, PlayerSettings> = new Map();
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    super();
    this.io = io;
    this.initializeDefaultSettings();
  }

  // Get player settings
  async getPlayerSettings(userId: string): Promise<PlayerSettings> {
    const settings = this.settings.get(userId);
    if (!settings) {
      // Create default settings for new user
      const defaultSettings = this.createDefaultSettings(userId);
      this.settings.set(userId, defaultSettings);
      return defaultSettings;
    }
    return settings;
  }

  // Update player settings
  async updatePlayerSettings(
    userId: string,
    updates: Partial<PlayerSettings>
  ): Promise<PlayerSettings> {
    const currentSettings = await this.getPlayerSettings(userId);
    const updatedSettings: PlayerSettings = {
      ...currentSettings,
      ...updates,
      userId,
      lastUpdated: new Date(),
      version: this.getCurrentVersion()
    };

    // Validate settings
    this.validateSettings(updatedSettings);

    this.settings.set(userId, updatedSettings);
    
    this.emit('settingsUpdated', { userId, settings: updatedSettings });
    this.sendSettingsUpdate(userId, 'settingsUpdated', updatedSettings);
    
    return updatedSettings;
  }

  // Update specific settings category
  async updateGameSettings(userId: string, gameSettings: Partial<GameSettings>): Promise<PlayerSettings> {
    const currentSettings = await this.getPlayerSettings(userId);
    return this.updatePlayerSettings(userId, {
      gameSettings: { ...currentSettings.gameSettings, ...gameSettings }
    });
  }

  async updateUISettings(userId: string, uiSettings: Partial<UISettings>): Promise<PlayerSettings> {
    const currentSettings = await this.getPlayerSettings(userId);
    return this.updatePlayerSettings(userId, {
      uiSettings: { ...currentSettings.uiSettings, ...uiSettings }
    });
  }

  async updateAudioSettings(userId: string, audioSettings: Partial<AudioSettings>): Promise<PlayerSettings> {
    const currentSettings = await this.getPlayerSettings(userId);
    return this.updatePlayerSettings(userId, {
      audioSettings: { ...currentSettings.audioSettings, ...audioSettings }
    });
  }

  async updateAccessibilitySettings(userId: string, accessibilitySettings: Partial<AccessibilitySettings>): Promise<PlayerSettings> {
    const currentSettings = await this.getPlayerSettings(userId);
    return this.updatePlayerSettings(userId, {
      accessibilitySettings: { ...currentSettings.accessibilitySettings, ...accessibilitySettings }
    });
  }

  async updatePrivacySettings(userId: string, privacySettings: Partial<PrivacySettings>): Promise<PlayerSettings> {
    const currentSettings = await this.getPlayerSettings(userId);
    return this.updatePlayerSettings(userId, {
      privacySettings: { ...currentSettings.privacySettings, ...privacySettings }
    });
  }

  async updateSocialSettings(userId: string, socialSettings: Partial<SocialSettings>): Promise<PlayerSettings> {
    const currentSettings = await this.getPlayerSettings(userId);
    return this.updatePlayerSettings(userId, {
      socialSettings: { ...currentSettings.socialSettings, ...socialSettings }
    });
  }

  async updateNotificationSettings(userId: string, notificationSettings: Partial<NotificationSettings>): Promise<PlayerSettings> {
    const currentSettings = await this.getPlayerSettings(userId);
    return this.updatePlayerSettings(userId, {
      notificationSettings: { ...currentSettings.notificationSettings, ...notificationSettings }
    });
  }

  // Reset settings to default
  async resetPlayerSettings(userId: string, category?: string): Promise<PlayerSettings> {
    const defaultSettings = this.createDefaultSettings(userId);
    
    if (category) {
      const currentSettings = await this.getPlayerSettings(userId);
      const updatedSettings = { ...currentSettings };
      
      switch (category) {
        case 'game':
          updatedSettings.gameSettings = defaultSettings.gameSettings;
          break;
        case 'ui':
          updatedSettings.uiSettings = defaultSettings.uiSettings;
          break;
        case 'audio':
          updatedSettings.audioSettings = defaultSettings.audioSettings;
          break;
        case 'accessibility':
          updatedSettings.accessibilitySettings = defaultSettings.accessibilitySettings;
          break;
        case 'privacy':
          updatedSettings.privacySettings = defaultSettings.privacySettings;
          break;
        case 'social':
          updatedSettings.socialSettings = defaultSettings.socialSettings;
          break;
        case 'notifications':
          updatedSettings.notificationSettings = defaultSettings.notificationSettings;
          break;
      }
      
      return this.updatePlayerSettings(userId, updatedSettings);
    } else {
      return this.updatePlayerSettings(userId, defaultSettings);
    }
  }

  // Export settings
  async exportPlayerSettings(userId: string): Promise<string> {
    const settings = await this.getPlayerSettings(userId);
    return JSON.stringify(settings, null, 2);
  }

  // Import settings
  async importPlayerSettings(userId: string, settingsJson: string): Promise<PlayerSettings> {
    try {
      const importedSettings = JSON.parse(settingsJson) as PlayerSettings;
      
      // Validate imported settings
      this.validateSettings(importedSettings);
      
      // Update with imported settings
      return this.updatePlayerSettings(userId, importedSettings);
    } catch (error) {
      throw new Error('Invalid settings format');
    }
  }

  // Get settings statistics
  async getSettingsStats(): Promise<{
    totalUsers: number;
    mostPopularTheme: string;
    mostPopularLanguage: string;
    averageGraphicsQuality: string;
    accessibilityUsage: number;
  }> {
    const allSettings = Array.from(this.settings.values());
    
    const themeCounts: { [key: string]: number } = {};
    const languageCounts: { [key: string]: number } = {};
    const graphicsCounts: { [key: string]: number } = {};
    let accessibilityUsers = 0;
    
    allSettings.forEach(settings => {
      // Count themes
      themeCounts[settings.uiSettings.theme] = (themeCounts[settings.uiSettings.theme] || 0) + 1;
      
      // Count languages
      languageCounts[settings.gameSettings.language] = (languageCounts[settings.gameSettings.language] || 0) + 1;
      
      // Count graphics quality
      graphicsCounts[settings.gameSettings.graphicsQuality] = (graphicsCounts[settings.gameSettings.graphicsQuality] || 0) + 1;
      
      // Count accessibility usage
      if (settings.accessibilitySettings.highContrast || 
          settings.accessibilitySettings.colorBlindSupport !== ColorBlindSupport.NONE ||
          settings.accessibilitySettings.textToSpeech ||
          settings.accessibilitySettings.screenReader) {
        accessibilityUsers++;
      }
    });
    
    const mostPopularTheme = Object.keys(themeCounts).reduce((a, b) => themeCounts[a] > themeCounts[b] ? a : b);
    const mostPopularLanguage = Object.keys(languageCounts).reduce((a, b) => languageCounts[a] > languageCounts[b] ? a : b);
    const averageGraphicsQuality = Object.keys(graphicsCounts).reduce((a, b) => graphicsCounts[a] > graphicsCounts[b] ? a : b);
    
    return {
      totalUsers: allSettings.length,
      mostPopularTheme,
      mostPopularLanguage,
      averageGraphicsQuality,
      accessibilityUsage: Math.round((accessibilityUsers / allSettings.length) * 100)
    };
  }

  // Private helper methods
  private createDefaultSettings(userId: string): PlayerSettings {
    return {
      userId,
      gameSettings: {
        graphicsQuality: GraphicsQuality.HIGH,
        frameRate: FrameRate.FPS_60,
        resolution: Resolution.HD_1080,
        fullscreen: false,
        vsync: true,
        antiAliasing: true,
        shadows: true,
        particles: true,
        effects: true,
        autoSave: true,
        autoSaveInterval: 5,
        confirmActions: true,
        tooltips: true,
        minimap: true,
        healthBars: true,
        damageNumbers: true,
        combatLog: true,
        mouseSensitivity: 1.0,
        keyboardLayout: KeyboardLayout.QWERTY,
        keyBindings: this.getDefaultKeyBindings(),
        invertMouse: false,
        mouseAcceleration: false,
        cameraDistance: 1.0,
        cameraAngle: 0.0,
        cameraSmoothing: true,
        cameraShake: true,
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: TimeFormat.H12,
        currency: 'USD'
      },
      uiSettings: {
        theme: Theme.DARK,
        colorScheme: ColorScheme.BLUE,
        fontSize: FontSize.MEDIUM,
        fontFamily: 'Inter',
        uiScale: 1.0,
        opacity: 1.0,
        layout: Layout.NORMAL,
        sidebarPosition: SidebarPosition.LEFT,
        chatPosition: ChatPosition.BOTTOM_LEFT,
        minimapPosition: MinimapPosition.TOP_RIGHT,
        showSidebar: true,
        showChat: true,
        showMinimap: true,
        showActionBar: true,
        showInventory: true,
        showCharacter: true,
        showQuestLog: true,
        showFriends: true,
        showGuild: true,
        animations: true,
        transitions: true,
        hoverEffects: true,
        loadingAnimations: true,
        showNotifications: true,
        notificationPosition: NotificationPosition.TOP_RIGHT,
        notificationDuration: 5000,
        showToastNotifications: true
      },
      audioSettings: {
        masterVolume: 0.8,
        musicVolume: 0.7,
        sfxVolume: 0.8,
        voiceVolume: 0.9,
        ambientVolume: 0.6,
        audioQuality: AudioQuality.HIGH,
        sampleRate: 44100,
        bitDepth: 16,
        channels: 2,
        spatialAudio: true,
        audioDistance: 1.0,
        audioFalloff: 1.0,
        voiceChat: true,
        voiceActivation: false,
        voiceActivationThreshold: 0.5,
        pushToTalk: true,
        pushToTalkKey: 'V',
        reverb: true,
        echo: false,
        compression: true,
        equalizer: {
          bass: 0,
          mid: 0,
          treble: 0,
          custom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      },
      accessibilitySettings: {
        highContrast: false,
        colorBlindSupport: ColorBlindSupport.NONE,
        textToSpeech: false,
        screenReader: false,
        largeText: false,
        textSize: 1.0,
        oneHandedMode: false,
        stickyKeys: false,
        slowKeys: false,
        bounceKeys: false,
        mouseKeys: false,
        simplifiedUI: false,
        reducedMotion: false,
        clearInstructions: true,
        progressIndicators: true,
        errorMessages: true,
        visualAlerts: false,
        subtitles: false,
        captionSize: 1.0,
        captionColor: '#FFFFFF',
        captionBackground: '#000000'
      },
      privacySettings: {
        profileVisibility: ProfileVisibility.FRIENDS,
        showOnlineStatus: true,
        showLastSeen: true,
        showLocation: false,
        showLevel: true,
        showAchievements: true,
        allowFriendRequests: true,
        allowGuildInvites: true,
        allowTradeRequests: true,
        allowDuelRequests: true,
        analytics: true,
        crashReports: true,
        performanceData: true,
        usageStatistics: true,
        allowPrivateMessages: true,
        allowGuildMessages: true,
        allowGlobalChat: true,
        filterProfanity: true,
        blockList: []
      },
      socialSettings: {
        autoAcceptFriends: false,
        showFriendActivity: true,
        friendNotifications: true,
        friendOnlineNotifications: true,
        guildNotifications: true,
        guildChatNotifications: true,
        guildEventNotifications: true,
        guildWarNotifications: true,
        allowTrades: true,
        tradeNotifications: true,
        autoAcceptTrades: false,
        tradeConfirmation: true,
        allowPvP: true,
        pvpNotifications: true,
        duelNotifications: true,
        tournamentNotifications: true
      },
      notificationSettings: {
        enableNotifications: true,
        notificationSound: true,
        notificationVibration: false,
        achievementNotifications: true,
        questNotifications: true,
        levelUpNotifications: true,
        itemNotifications: true,
        combatNotifications: true,
        socialNotifications: true,
        systemNotifications: true,
        quietHours: false,
        quietStart: '22:00',
        quietEnd: '08:00',
        timezone: 'UTC',
        inGameNotifications: true,
        pushNotifications: true,
        emailNotifications: false,
        smsNotifications: false
      },
      lastUpdated: new Date(),
      version: this.getCurrentVersion()
    };
  }

  private getDefaultKeyBindings(): KeyBindings {
    return {
      'move_up': 'W',
      'move_down': 'S',
      'move_left': 'A',
      'move_right': 'D',
      'jump': 'Space',
      'interact': 'E',
      'inventory': 'I',
      'character': 'C',
      'quest_log': 'J',
      'map': 'M',
      'chat': 'Enter',
      'push_to_talk': 'V',
      'screenshot': 'F12',
      'fullscreen': 'F11',
      'settings': 'Escape'
    };
  }

  private validateSettings(settings: PlayerSettings): void {
    // Validate numeric ranges
    if (settings.gameSettings.mouseSensitivity < 0.1 || settings.gameSettings.mouseSensitivity > 5.0) {
      throw new Error('Mouse sensitivity must be between 0.1 and 5.0');
    }
    
    if (settings.uiSettings.uiScale < 0.5 || settings.uiSettings.uiScale > 2.0) {
      throw new Error('UI scale must be between 0.5 and 2.0');
    }
    
    if (settings.audioSettings.masterVolume < 0 || settings.audioSettings.masterVolume > 1) {
      throw new Error('Master volume must be between 0 and 1');
    }
    
    // Validate enum values
    if (!Object.values(GraphicsQuality).includes(settings.gameSettings.graphicsQuality)) {
      throw new Error('Invalid graphics quality');
    }
    
    if (!Object.values(Theme).includes(settings.uiSettings.theme)) {
      throw new Error('Invalid theme');
    }
    
    // Validate time format
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(settings.notificationSettings.quietStart)) {
      throw new Error('Invalid quiet hours start time format');
    }
    
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(settings.notificationSettings.quietEnd)) {
      throw new Error('Invalid quiet hours end time format');
    }
  }

  private getCurrentVersion(): string {
    return '1.0.0';
  }

  private initializeDefaultSettings(): void {
    // Initialize with default settings for demo users
    // In production, this would be loaded from database
  }

  private sendSettingsUpdate(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit('settingsUpdate', { event, data });
  }
}
