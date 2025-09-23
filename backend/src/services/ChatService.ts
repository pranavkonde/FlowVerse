import { Server as SocketIOServer, Socket } from 'socket.io';
import { ChatMessage, ChatRoom, ChatModeration } from '../types/chat';

export class ChatService {
  private io: SocketIOServer;
  private rooms: Map<string, ChatRoom> = new Map();
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set of room codes
  private messageHistory: Map<string, ChatMessage[]> = new Map(); // roomCode -> messages
  private moderation: ChatModeration;
  private userMessageCounts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.moderation = {
      blockedWords: ['spam', 'hack', 'cheat', 'bot'],
      maxMessagesPerMinute: 10,
      muteDuration: 5,
      autoModeration: true
    };
    
    this.initializeDefaultRooms();
    this.setupSocketHandlers();
  }

  private initializeDefaultRooms(): void {
    const globalRoom: ChatRoom = {
      code: 'global',
      name: 'Global Chat',
      type: 'global',
      participants: [],
      messageHistory: [],
      settings: {
        allowVoice: true,
        allowEmojis: true,
        maxMessageLength: 200,
        moderationEnabled: true
      },
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms.set('global', globalRoom);
    this.messageHistory.set('global', []);
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Chat user connected: ${socket.id}`);

      // Join global room by default
      this.joinRoom(socket, 'global');

      socket.on('chat:send_message', (message: ChatMessage) => {
        this.handleMessage(socket, message);
      });

      socket.on('chat:send_voice_message', (message: ChatMessage) => {
        this.handleVoiceMessage(socket, message);
      });

      socket.on('chat:join_room', (roomCode: string) => {
        this.joinRoom(socket, roomCode);
      });

      socket.on('chat:leave_room', (roomCode: string) => {
        this.leaveRoom(socket, roomCode);
      });

      socket.on('chat:typing', (data: { isTyping: boolean }) => {
        this.handleTyping(socket, data.isTyping);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private joinRoom(socket: Socket, roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) {
      // Create room if it doesn't exist
      this.createRoom(roomCode, 'Custom Room', 'room');
    }

    socket.join(roomCode);
    
    // Add user to room participants
    const userId = socket.id;
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(roomCode);

    // Add user to room participants list
    const room = this.rooms.get(roomCode)!;
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
    }

    // Send room history to user
    const history = this.messageHistory.get(roomCode) || [];
    socket.emit('chat:room_history', history);

    // Notify others in room
    socket.to(roomCode).emit('chat:user_joined', {
      userId,
      username: socket.data.username || 'Anonymous'
    });

    console.log(`User ${userId} joined room ${roomCode}`);
  }

  private leaveRoom(socket: Socket, roomCode: string): void {
    const userId = socket.id;
    
    socket.leave(roomCode);
    
    // Remove user from room participants
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.delete(roomCode);
    }

    const room = this.rooms.get(roomCode);
    if (room) {
      room.participants = room.participants.filter(id => id !== userId);
    }

    // Notify others in room
    socket.to(roomCode).emit('chat:user_left', {
      userId,
      username: socket.data.username || 'Anonymous'
    });

    console.log(`User ${userId} left room ${roomCode}`);
  }

  private handleMessage(socket: Socket, message: ChatMessage): void {
    const userId = socket.id;
    
    // Rate limiting check
    if (!this.checkRateLimit(userId)) {
      socket.emit('chat:error', { message: 'Message rate limit exceeded' });
      return;
    }

    // Moderation check
    if (this.moderation.autoModeration && this.isMessageBlocked(message.message)) {
      message.message = '[Message moderated]';
      message.isModerated = true;
    }

    // Set proper user info
    message.userId = userId;
    message.username = socket.data.username || 'Anonymous';
    message.timestamp = new Date();
    message.roomCode = message.roomCode || 'global';

    // Store message
    this.storeMessage(message);

    // Broadcast to room
    this.io.to(message.roomCode).emit('chat:message', message);

    console.log(`Message from ${message.username} in ${message.roomCode}: ${message.message}`);
  }

  private handleVoiceMessage(socket: Socket, message: ChatMessage): void {
    const userId = socket.id;
    
    // Rate limiting check
    if (!this.checkRateLimit(userId)) {
      socket.emit('chat:error', { message: 'Voice message rate limit exceeded' });
      return;
    }

    // Set proper user info
    message.userId = userId;
    message.username = socket.data.username || 'Anonymous';
    message.timestamp = new Date();
    message.roomCode = message.roomCode || 'global';

    // Store message
    this.storeMessage(message);

    // Broadcast to room
    this.io.to(message.roomCode).emit('chat:voice_message', message);

    console.log(`Voice message from ${message.username} in ${message.roomCode}`);
  }

  private handleTyping(socket: Socket, isTyping: boolean): void {
    const userId = socket.id;
    const username = socket.data.username || 'Anonymous';
    
    // Get all rooms the user is in
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.forEach(roomCode => {
        socket.to(roomCode).emit('chat:typing', {
          userId,
          username,
          isTyping
        });
      });
    }
  }

  private handleDisconnect(socket: Socket): void {
    const userId = socket.id;
    const username = socket.data.username || 'Anonymous';
    
    // Leave all rooms
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.forEach(roomCode => {
        this.leaveRoom(socket, roomCode);
      });
    }

    // Clean up user data
    this.userRooms.delete(userId);
    this.userMessageCounts.delete(userId);

    console.log(`Chat user disconnected: ${username} (${userId})`);
  }

  private storeMessage(message: ChatMessage): void {
    const roomCode = message.roomCode || 'global';
    const history = this.messageHistory.get(roomCode) || [];
    
    history.push(message);
    
    // Keep only last 100 messages per room
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.messageHistory.set(roomCode, history);

    // Update room last activity
    const room = this.rooms.get(roomCode);
    if (room) {
      room.lastActivity = new Date();
    }
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userData = this.userMessageCounts.get(userId);
    
    if (!userData || now > userData.resetTime) {
      // Reset or initialize
      this.userMessageCounts.set(userId, {
        count: 1,
        resetTime: now + (60 * 1000) // 1 minute
      });
      return true;
    }
    
    if (userData.count >= this.moderation.maxMessagesPerMinute) {
      return false;
    }
    
    userData.count++;
    return true;
  }

  private isMessageBlocked(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.moderation.blockedWords.some(word => lowerMessage.includes(word));
  }

  public createRoom(code: string, name: string, type: 'global' | 'room' | 'guild' | 'private'): ChatRoom {
    const room: ChatRoom = {
      code,
      name,
      type,
      participants: [],
      messageHistory: [],
      settings: {
        allowVoice: true,
        allowEmojis: true,
        maxMessageLength: 200,
        moderationEnabled: true
      },
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms.set(code, room);
    this.messageHistory.set(code, []);
    
    console.log(`Created chat room: ${name} (${code})`);
    return room;
  }

  public getRoom(roomCode: string): ChatRoom | undefined {
    return this.rooms.get(roomCode);
  }

  public getAllRooms(): ChatRoom[] {
    return Array.from(this.rooms.values());
  }

  public getRoomHistory(roomCode: string): ChatMessage[] {
    return this.messageHistory.get(roomCode) || [];
  }

  public getActiveUsers(): number {
    return this.userRooms.size;
  }

  public getRoomUserCount(roomCode: string): number {
    const room = this.rooms.get(roomCode);
    return room ? room.participants.length : 0;
  }

  public updateModerationSettings(settings: Partial<ChatModeration>): void {
    this.moderation = { ...this.moderation, ...settings };
  }

  public moderateMessage(messageId: string, roomCode: string): void {
    const history = this.messageHistory.get(roomCode);
    if (history) {
      const message = history.find(m => m.id === messageId);
      if (message) {
        message.isModerated = true;
        message.message = '[Message moderated]';
        
        // Notify clients
        this.io.to(roomCode).emit('chat:message_moderated', messageId);
      }
    }
  }

  public getStats(): {
    totalRooms: number;
    totalMessages: number;
    activeUsers: number;
    mostActiveRoom: string;
  } {
    const totalMessages = Array.from(this.messageHistory.values())
      .reduce((sum, messages) => sum + messages.length, 0);
    
    let mostActiveRoom = 'global';
    let maxMessages = 0;
    
    this.messageHistory.forEach((messages, roomCode) => {
      if (messages.length > maxMessages) {
        maxMessages = messages.length;
        mostActiveRoom = roomCode;
      }
    });

    return {
      totalRooms: this.rooms.size,
      totalMessages,
      activeUsers: this.userRooms.size,
      mostActiveRoom
    };
  }
}
