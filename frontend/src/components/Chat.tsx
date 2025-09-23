'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, Mic, MicOff, Volume2, Settings, X, Smile, Reply } from 'lucide-react';
import { ChatMessage, CHAT_EVENTS } from '@/types/chat';
import { chatService } from '@/services/ChatService';

interface ChatProps {
  isOpen: boolean;
  onToggle: () => void;
  playerCount: number;
  userId: string;
  username: string;
}

export default function Chat({ isOpen, onToggle, playerCount, userId, username }: ChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Connect to chat service
    chatService.connect(userId, username);
    
    // Set up event listeners
    const handleMessageReceived = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleTyping = (data: { username: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.username) ? prev : [...prev, data.username];
        } else {
          return prev.filter(user => user !== data.username);
        }
      });
    };

    const handleVoiceRecordingStart = () => {
      setIsRecording(true);
    };

    const handleVoiceRecordingStop = () => {
      setIsRecording(false);
    };

    chatService.on(CHAT_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
    chatService.on(CHAT_EVENTS.TYPING_START, handleTyping);
    chatService.on(CHAT_EVENTS.VOICE_RECORDING_START, handleVoiceRecordingStart);
    chatService.on(CHAT_EVENTS.VOICE_RECORDING_STOP, handleVoiceRecordingStop);

    return () => {
      chatService.off(CHAT_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
      chatService.off(CHAT_EVENTS.TYPING_START, handleTyping);
      chatService.off(CHAT_EVENTS.VOICE_RECORDING_START, handleVoiceRecordingStart);
      chatService.off(CHAT_EVENTS.VOICE_RECORDING_STOP, handleVoiceRecordingStop);
    };
  }, [userId, username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      chatService.sendMessage(inputMessage.trim());
      setInputMessage('');
      setReplyTo(null);
    }
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      chatService.stopVoiceRecording();
    } else {
      chatService.startVoiceRecording();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    chatService.sendTypingIndicator(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const playVoiceMessage = (voiceData: any) => {
    // Convert base64 back to audio and play
    const audio = new Audio();
    audio.src = `data:audio/webm;base64,${voiceData.audioBlob}`;
    audio.play();
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-slate-800 rounded-lg shadow-2xl border border-slate-700">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-t-lg">
        <div 
          className="flex items-center gap-2 cursor-pointer flex-1"
          onClick={onToggle}
        >
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <span className="text-white font-medium text-sm">Chat</span>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Users className="w-3 h-3" />
            <span>{playerCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="text-slate-400 text-xs cursor-pointer" onClick={onToggle}>
            {isOpen ? '▼' : '▲'}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      {isOpen && (
        <>
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-4">
                No messages yet. Start chatting!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.type === 'system' 
                      ? 'items-center' 
                      : 'items-start'
                  }`}
                >
                  {msg.type === 'system' ? (
                    <div className="text-slate-400 text-xs bg-slate-700 px-2 py-1 rounded">
                      {msg.message}
                    </div>
                  ) : (
                    <div className="w-full group">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-400 text-xs font-medium">
                          {msg.username}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {formatTime(msg.timestamp)}
                        </span>
                        {msg.type === 'voice' && (
                          <span className="text-green-400 text-xs">🎤</span>
                        )}
                        <button
                          onClick={() => handleReply(msg)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-all"
                          title="Reply"
                        >
                          <Reply className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-white text-sm bg-slate-700 p-2 rounded">
                        {msg.type === 'voice' && msg.voiceData ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => playVoiceMessage(msg.voiceData)}
                              className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span>Play ({Math.round(msg.voiceData.duration)}s)</span>
                            </button>
                          </div>
                        ) : (
                          msg.message
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="text-slate-400 text-xs italic">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Preview */}
          {replyTo && (
            <div className="p-2 bg-slate-700 border-l-2 border-blue-500">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Replying to {replyTo.username}
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="text-xs text-slate-300 truncate">
                {replyTo.message}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder={replyTo ? `Reply to ${replyTo.username}...` : "Type a message..."}
                className="flex-1 bg-slate-700 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                maxLength={200}
              />
              <button
                type="button"
                onClick={handleVoiceRecord}
                disabled={!chatService.isConnected()}
                className={`p-2 rounded transition-colors ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isRecording ? "Stop recording" : "Record voice message"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-xs mt-1">
              <span>Press Enter to send • {inputMessage.length}/200</span>
              {isRecording && (
                <span className="text-red-400 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  Recording...
                </span>
              )}
            </div>
          </form>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-3 border-t border-slate-700 bg-slate-700/50">
              <div className="text-white text-sm font-medium mb-2">Chat Settings</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Voice Messages</span>
                  <button
                    onClick={() => chatService.updateSettings({ enableVoiceMessages: !chatService.getSettings().enableVoiceMessages })}
                    className={`w-8 h-4 rounded-full transition-colors ${
                      chatService.getSettings().enableVoiceMessages ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                      chatService.getSettings().enableVoiceMessages ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Sound Effects</span>
                  <button
                    onClick={() => chatService.updateSettings({ soundEffects: !chatService.getSettings().soundEffects })}
                    className={`w-8 h-4 rounded-full transition-colors ${
                      chatService.getSettings().soundEffects ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                      chatService.getSettings().soundEffects ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

