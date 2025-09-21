'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users } from 'lucide-react';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'voice';
}

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  playerCount: number;
}

export default function Chat({ messages, onSendMessage, isOpen, onToggle, playerCount }: ChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
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
      <div 
        className="flex items-center justify-between p-3 bg-slate-700 rounded-t-lg cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <span className="text-white font-medium text-sm">Chat</span>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Users className="w-3 h-3" />
            <span>{playerCount}</span>
          </div>
        </div>
        <div className="text-slate-400 text-xs">
          {isOpen ? '▼' : '▲'}
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
                    <div className="w-full">
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
                      </div>
                      <div className="text-white text-sm bg-slate-700 p-2 rounded">
                        {msg.message}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-700 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-2 rounded transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-slate-400 text-xs mt-1">
              Press Enter to send • {inputMessage.length}/200
            </div>
          </form>
        </>
      )}
    </div>
  );
}

