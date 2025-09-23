import { ChatMessage, ChatRoom, VoiceRecording, ChatSettings, ChatStats, CHAT_EVENTS, ChatEventType } from '@/types/chat';
import { io, Socket } from 'socket.io-client';

export class ChatService {
  private socket: Socket | null = null;
  private messages: ChatMessage[] = [];
  private rooms: Map<string, ChatRoom> = new Map();
  private currentRoom: string = 'global';
  private settings: ChatSettings;
  private isRecording: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private eventListeners: Map<ChatEventType, Function[]> = new Map();
  private typingUsers: Set<string> = new Set();
  private typingTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.settings = this.loadSettings();
    this.initializeEventListeners();
  }

  private loadSettings(): ChatSettings {
    const defaultSettings: ChatSettings = {
      enableVoiceMessages: true,
      enableNotifications: true,
      showTimestamps: true,
      showUserColors: true,
      maxMessageHistory: 100,
      autoScroll: true,
      soundEffects: true
    };

    const stored = localStorage.getItem('freeflow_chat_settings');
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to load chat settings:', error);
      }
    }
    return defaultSettings;
  }

  private saveSettings(): void {
    localStorage.setItem('freeflow_chat_settings', JSON.stringify(this.settings));
  }

  private initializeEventListeners(): void {
    Object.values(CHAT_EVENTS).forEach(event => {
      this.eventListeners.set(event, []);
    });
  }

  public connect(userId: string, username: string): void {
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002', {
      auth: { userId, username }
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.emit(CHAT_EVENTS.USER_JOINED, { userId: this.socket?.id });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    this.socket.on('chat:message', (message: ChatMessage) => {
      this.addMessage(message);
      this.emit(CHAT_EVENTS.MESSAGE_RECEIVED, message);
      
      if (this.settings.enableNotifications && this.settings.soundEffects) {
        this.playNotificationSound();
      }
    });

    this.socket.on('chat:voice_message', (message: ChatMessage) => {
      this.addMessage(message);
      this.emit(CHAT_EVENTS.VOICE_MESSAGE_SENT, message);
    });

    this.socket.on('chat:typing', (data: { userId: string; username: string; isTyping: boolean }) => {
      if (data.isTyping) {
        this.typingUsers.add(data.username);
      } else {
        this.typingUsers.delete(data.username);
      }
      this.emit(CHAT_EVENTS.TYPING_START, data);
    });

    this.socket.on('chat:user_joined', (data: { userId: string; username: string }) => {
      this.emit(CHAT_EVENTS.USER_JOINED, data);
    });

    this.socket.on('chat:user_left', (data: { userId: string; username: string }) => {
      this.emit(CHAT_EVENTS.USER_LEFT, data);
    });

    this.socket.on('chat:message_moderated', (messageId: string) => {
      this.moderateMessage(messageId);
      this.emit(CHAT_EVENTS.MESSAGE_MODERATED, messageId);
    });
  }

  public sendMessage(message: string, roomCode?: string): void {
    if (!this.socket?.connected || !message.trim()) return;

    const chatMessage: ChatMessage = {
      id: this.generateMessageId(),
      userId: this.socket.id || 'unknown',
      username: 'You', // This should come from auth
      message: message.trim(),
      timestamp: new Date(),
      type: 'text',
      roomCode: roomCode || this.currentRoom
    };

    this.socket.emit('chat:send_message', chatMessage);
    this.emit(CHAT_EVENTS.MESSAGE_SENT, chatMessage);
  }

  public async startVoiceRecording(): Promise<void> {
    if (this.isRecording || !this.settings.enableVoiceMessages) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.emit(CHAT_EVENTS.VOICE_RECORDING_START);
    } catch (error) {
      console.error('Failed to start voice recording:', error);
    }
  }

  public stopVoiceRecording(): void {
    if (!this.isRecording || !this.mediaRecorder) return;

    this.mediaRecorder.stop();
    this.isRecording = false;
    this.emit(CHAT_EVENTS.VOICE_RECORDING_STOP);
  }

  private async sendVoiceMessage(audioBlob: Blob): Promise<void> {
    if (!this.socket?.connected) return;

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const voiceMessage: ChatMessage = {
        id: this.generateMessageId(),
        userId: this.socket.id || 'unknown',
        username: 'You',
        message: 'Voice message',
        timestamp: new Date(),
        type: 'voice',
        roomCode: this.currentRoom,
        voiceData: {
          audioBlob,
          duration: audioBlob.size / 1000, // Rough estimate
          waveform: this.generateWaveform(audioBlob)
        }
      };

      this.socket.emit('chat:send_voice_message', {
        ...voiceMessage,
        voiceData: {
          ...voiceMessage.voiceData,
          audioBlob: base64Audio
        }
      });

      this.emit(CHAT_EVENTS.VOICE_MESSAGE_SENT, voiceMessage);
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  }

  private generateWaveform(audioBlob: Blob): number[] {
    // Simplified waveform generation - in a real app, you'd use Web Audio API
    const waveform = [];
    for (let i = 0; i < 50; i++) {
      waveform.push(Math.random() * 100);
    }
    return waveform;
  }

  public sendTypingIndicator(isTyping: boolean): void {
    if (!this.socket?.connected) return;

    this.socket.emit('chat:typing', { isTyping });

    if (isTyping) {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      this.typingTimeout = setTimeout(() => {
        this.sendTypingIndicator(false);
      }, 3000);
    }
  }

  public joinRoom(roomCode: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('chat:join_room', roomCode);
    this.currentRoom = roomCode;
    this.emit(CHAT_EVENTS.ROOM_CHANGED, roomCode);
  }

  public leaveRoom(roomCode: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('chat:leave_room', roomCode);
  }

  private addMessage(message: ChatMessage): void {
    this.messages.push(message);
    
    // Keep only the last N messages
    if (this.messages.length > this.settings.maxMessageHistory) {
      this.messages = this.messages.slice(-this.settings.maxMessageHistory);
    }
  }

  private moderateMessage(messageId: string): void {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.isModerated = true;
      message.message = '[Message moderated]';
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private playNotificationSound(): void {
    // Simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  // Public getters
  public getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  public getCurrentRoom(): string {
    return this.currentRoom;
  }

  public getTypingUsers(): string[] {
    return Array.from(this.typingUsers);
  }

  public getSettings(): ChatSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<ChatSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public isRecordingVoice(): boolean {
    return this.isRecording;
  }

  // Event system
  public on(event: ChatEventType, callback: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
  }

  public off(event: ChatEventType, callback: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    this.eventListeners.set(event, listeners);
  }

  private emit(event: ChatEventType, data?: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getStats(): ChatStats {
    const voiceMessages = this.messages.filter(m => m.type === 'voice').length;
    const totalLength = this.messages.reduce((sum, m) => sum + m.message.length, 0);
    
    return {
      totalMessages: this.messages.length,
      voiceMessages,
      activeUsers: this.typingUsers.size,
      averageMessageLength: this.messages.length > 0 ? totalLength / this.messages.length : 0,
      peakActivity: new Date() // Simplified - would track actual peak activity
    };
  }
}

// Singleton instance
export const chatService = new ChatService();
