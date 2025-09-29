import { EventEmitter } from 'events';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  channel: string;
  emotes?: string[];
  reactions?: { [userId: string]: string };
  mentions?: string[];
}

export interface Emote {
  id: string;
  code: string;
  url: string;
  isAnimated: boolean;
  isUnlockable: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export class ChatService {
  private static instance: ChatService;
  private eventEmitter: EventEmitter;
  private messages: Map<string, ChatMessage[]>; // channel -> messages
  private emotes: Map<string, Emote>;
  private userEmotes: Map<string, Set<string>>; // userId -> emote ids
  private readonly MAX_MESSAGES_PER_CHANNEL = 200;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.messages = new Map();
    this.emotes = new Map();
    this.userEmotes = new Map();
    this.initializeDefaultEmotes();
  }

  private initializeDefaultEmotes() {
    const defaultEmotes: Emote[] = [
      {
        id: 'smile',
        code: ':smile:',
        url: '/emotes/smile.png',
        isAnimated: false,
        isUnlockable: false,
        rarity: 'common'
      },
      {
        id: 'wave',
        code: ':wave:',
        url: '/emotes/wave.png',
        isAnimated: true,
        isUnlockable: false,
        rarity: 'common'
      },
      {
        id: 'heart',
        code: ':heart:',
        url: '/emotes/heart.png',
        isAnimated: true,
        isUnlockable: false,
        rarity: 'common'
      }
    ];

    defaultEmotes.forEach(emote => {
      this.emotes.set(emote.id, emote);
    });
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async sendMessage(
    senderId: string,
    senderName: string,
    content: string,
    channel: string
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      senderId,
      senderName,
      content,
      timestamp: new Date(),
      channel,
      emotes: this.extractEmotes(content),
      reactions: {},
      mentions: this.extractMentions(content)
    };

    let channelMessages = this.messages.get(channel) || [];
    channelMessages.push(message);

    // Keep only the last MAX_MESSAGES_PER_CHANNEL messages
    if (channelMessages.length > this.MAX_MESSAGES_PER_CHANNEL) {
      channelMessages = channelMessages.slice(-this.MAX_MESSAGES_PER_CHANNEL);
    }

    this.messages.set(channel, channelMessages);
    this.eventEmitter.emit('newMessage', { channel, message });

    return message;
  }

  private extractEmotes(content: string): string[] {
    const emotes: string[] = [];
    const emoteRegex = /:([\w-]+):/g;
    let match;

    while ((match = emoteRegex.exec(content)) !== null) {
      const emoteCode = match[1];
      const emote = Array.from(this.emotes.values()).find(e => e.code === `:${emoteCode}:`);
      if (emote) {
        emotes.push(emote.id);
      }
    }

    return emotes;
  }

  private extractMentions(content: string): string[] {
    const mentions: string[] = [];
    const mentionRegex = /@(\w+)/g;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  async getChannelMessages(channel: string, limit = 50): Promise<ChatMessage[]> {
    const channelMessages = this.messages.get(channel) || [];
    return channelMessages.slice(-limit);
  }

  async addReaction(messageId: string, userId: string, emoteId: string): Promise<boolean> {
    for (const [channel, messages] of this.messages.entries()) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.reactions = message.reactions || {};
        message.reactions[userId] = emoteId;
        this.eventEmitter.emit('messageReaction', { channel, messageId, userId, emoteId });
        return true;
      }
    }
    return false;
  }

  async removeReaction(messageId: string, userId: string): Promise<boolean> {
    for (const [channel, messages] of this.messages.entries()) {
      const message = messages.find(m => m.id === messageId);
      if (message && message.reactions) {
        delete message.reactions[userId];
        this.eventEmitter.emit('messageReactionRemoved', { channel, messageId, userId });
        return true;
      }
    }
    return false;
  }

  async unlockEmote(userId: string, emoteId: string): Promise<boolean> {
    const emote = this.emotes.get(emoteId);
    if (!emote || !emote.isUnlockable) {
      return false;
    }
    
    let userEmoteSet = this.userEmotes.get(userId);
    if (!userEmoteSet) {
      userEmoteSet = new Set();
      this.userEmotes.set(userId, userEmoteSet);
    }

    userEmoteSet.add(emoteId);
    return true;
  }

  async getUserEmotes(userId: string): Promise<Emote[]> {
    const userEmoteSet = this.userEmotes.get(userId) || new Set();
    const defaultEmotes = Array.from(this.emotes.values()).filter(e => !e.isUnlockable);
    const unlockedEmotes = Array.from(userEmoteSet).map(id => this.emotes.get(id)!);
    
    return [...defaultEmotes, ...unlockedEmotes];
  }

  onNewMessage(callback: (data: { channel: string; message: ChatMessage }) => void): void {
    this.eventEmitter.on('newMessage', callback);
  }

  onMessageReaction(callback: (data: { channel: string; messageId: string; userId: string; emoteId: string }) => void): void {
    this.eventEmitter.on('messageReaction', callback);
  }
}

export const chatService = ChatService.getInstance();