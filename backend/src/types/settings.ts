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

export const SETTINGS_EVENTS = {
  SETTINGS_UPDATED: 'settingsUpdated',
  SETTINGS_RESET: 'settingsReset',
  SETTINGS_EXPORTED: 'settingsExported',
  SETTINGS_IMPORTED: 'settingsImported'
} as const;

export const SETTINGS_NOTIFICATIONS = {
  SETTINGS_SAVED: 'settings_saved',
  SETTINGS_RESET: 'settings_reset',
  SETTINGS_EXPORTED: 'settings_exported',
  SETTINGS_IMPORTED: 'settings_imported',
  SETTINGS_ERROR: 'settings_error'
} as const;
