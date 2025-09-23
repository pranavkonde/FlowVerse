export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'voice' | 'emoji';
  roomCode?: string;
  voiceData?: {
    audioBlob: string; // Base64 encoded audio data
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

export interface ChatModeration {
  blockedWords: string[];
  maxMessagesPerMinute: number;
  muteDuration: number; // in minutes
  autoModeration: boolean;
}

export interface ChatStats {
  totalRooms: number;
  totalMessages: number;
  activeUsers: number;
  mostActiveRoom: string;
}
