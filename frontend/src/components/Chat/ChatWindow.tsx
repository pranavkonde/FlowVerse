import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
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

interface Emote {
  id: string;
  code: string;
  url: string;
  isAnimated: boolean;
  isUnlockable: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [messageInput, setMessageInput] = useState('');
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchMessages();
    fetchUserEmotes();
    setupWebSocket();
  }, [currentChannel]);

  const setupWebSocket = () => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message' && data.channel === currentChannel) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    return () => ws.close();
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${currentChannel}/messages`);
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchUserEmotes = async () => {
    try {
      const response = await fetch('/api/chat/emotes');
      const data = await response.json();
      setEmotes(data);
    } catch (error) {
      console.error('Error fetching emotes:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageInput,
          channel: currentChannel,
        }),
      });

      if (response.ok) {
        setMessageInput('');
        setShowEmotePicker(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReaction = async (messageId: string, emoteId: string) => {
    try {
      await fetch('/api/chat/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          emoteId,
        }),
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing event to server
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit stopped typing event to server
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-800 rounded-lg overflow-hidden">
      {/* Channel Header */}
      <div className="bg-gray-700 px-4 py-2 flex items-center">
        <h2 className="text-white font-semibold">#{currentChannel}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative"
          >
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0" />
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="font-semibold text-white">{message.senderName}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-300">{message.content}</p>
                
                {/* Reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(message.reactions).map(([userId, emoteId]) => {
                      const emote = emotes.find(e => e.id === emoteId);
                      return emote && (
                        <img
                          key={`${message.id}-${userId}`}
                          src={emote.url}
                          alt={emote.code}
                          className="w-5 h-5"
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Reaction Button */}
            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowEmotePicker(true)}
                className="text-gray-400 hover:text-white"
              >
                +
              </button>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowEmotePicker(!showEmotePicker)}
            className="text-gray-400 hover:text-white"
          >
            😊
          </button>
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>

      {/* Emote Picker */}
      <AnimatePresence>
        {showEmotePicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-4 bg-gray-700 p-4 rounded-lg shadow-lg"
          >
            <div className="grid grid-cols-6 gap-2">
              {emotes.map((emote) => (
                <button
                  key={emote.id}
                  onClick={() => {
                    setMessageInput(prev => prev + ' ' + emote.code + ' ');
                    setShowEmotePicker(false);
                  }}
                  className="hover:bg-gray-600 p-1 rounded"
                >
                  <img src={emote.url} alt={emote.code} className="w-6 h-6" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


