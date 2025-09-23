export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'voice' | 'emoji';
  roomCode?: string;
  voiceData?: {
    audioBlob: Blob;
    duration: number;
    waveform?: number[];
  };
  isModerated?: boolean;
  replyTo?: string; // Message ID being replied to
}

export interface ChatRoom {
  code: string;
  name: string;
  type: 'global' | 'room' | 'guild' | 'private';
  participants: string[];
  messageHistory: ChatMessage[];
  settings: {
    allowVoice: boolean;
    allowEmojis: boolean;
    maxMessageLength: number;
    moderationEnabled: boolean;
  };
  createdAt: Date;
  lastActivity: Date;
}

export interface VoiceRecording {
  id: string;
  audioBlob: Blob;
  duration: number;
  waveform: number[];
  isRecording: boolean;
}

export interface ChatSettings {
  enableVoiceMessages: boolean;
  enableNotifications: boolean;
  showTimestamps: boolean;
  showUserColors: boolean;
  maxMessageHistory: number;
  autoScroll: boolean;
  soundEffects: boolean;
}

export interface ChatModeration {
  blockedWords: string[];
  maxMessagesPerMinute: number;
  muteDuration: number; // in minutes
  autoModeration: boolean;
}

export interface ChatStats {
  totalMessages: number;
  voiceMessages: number;
  activeUsers: number;
  averageMessageLength: number;
  peakActivity: Date;
}

export const CHAT_EVENTS = {
  MESSAGE_SENT: 'chat:message_sent',
  MESSAGE_RECEIVED: 'chat:message_received',
  VOICE_RECORDING_START: 'chat:voice_recording_start',
  VOICE_RECORDING_STOP: 'chat:voice_recording_stop',
  VOICE_MESSAGE_SENT: 'chat:voice_message_sent',
  USER_JOINED: 'chat:user_joined',
  USER_LEFT: 'chat:user_left',
  ROOM_CHANGED: 'chat:room_changed',
  MESSAGE_MODERATED: 'chat:message_moderated',
  TYPING_START: 'chat:typing_start',
  TYPING_STOP: 'chat:typing_stop'
} as const;

export type ChatEventType = typeof CHAT_EVENTS[keyof typeof CHAT_EVENTS];
