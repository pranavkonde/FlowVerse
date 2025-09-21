'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Mic, MessageCircle } from 'lucide-react';

interface MobileControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onEmote: () => void;
  onVoiceCommand: () => void;
  onChat: () => void;
  isVisible: boolean;
}

export default function MobileControls({ 
  onMove, 
  onEmote, 
  onVoiceCommand, 
  onChat, 
  isVisible 
}: MobileControlsProps) {
  const [isPressed, setIsPressed] = useState<string | null>(null);

  const handleTouchStart = (direction: string) => {
    setIsPressed(direction);
    onMove(direction as 'up' | 'down' | 'left' | 'right');
  };

  const handleTouchEnd = () => {
    setIsPressed(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 p-4 z-50">
      {/* Movement Controls */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          {/* Up Arrow */}
          <button
            onTouchStart={() => handleTouchStart('up')}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart('up')}
            onMouseUp={handleTouchEnd}
            className={`absolute -top-12 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center transition-all ${
              isPressed === 'up' ? 'bg-blue-500 scale-110' : 'hover:bg-slate-600'
            }`}
          >
            <ArrowUp className="w-6 h-6 text-white" />
          </button>

          {/* Left Arrow */}
          <button
            onTouchStart={() => handleTouchStart('left')}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart('left')}
            onMouseUp={handleTouchEnd}
            className={`absolute top-0 -left-12 w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center transition-all ${
              isPressed === 'left' ? 'bg-blue-500 scale-110' : 'hover:bg-slate-600'
            }`}
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          {/* Center Circle */}
          <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-slate-500 rounded-full"></div>
          </div>

          {/* Right Arrow */}
          <button
            onTouchStart={() => handleTouchStart('right')}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart('right')}
            onMouseUp={handleTouchEnd}
            className={`absolute top-0 -right-12 w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center transition-all ${
              isPressed === 'right' ? 'bg-blue-500 scale-110' : 'hover:bg-slate-600'
            }`}
          >
            <ArrowRight className="w-6 h-6 text-white" />
          </button>

          {/* Down Arrow */}
          <button
            onTouchStart={() => handleTouchStart('down')}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleTouchStart('down')}
            onMouseUp={handleTouchEnd}
            className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center transition-all ${
              isPressed === 'down' ? 'bg-blue-500 scale-110' : 'hover:bg-slate-600'
            }`}
          >
            <ArrowDown className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onEmote}
          className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
        >
          <span className="text-white text-xl">😊</span>
        </button>

        <button
          onClick={onVoiceCommand}
          className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
        >
          <Mic className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={onChat}
          className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-slate-400 text-xs mt-2">
        Touch and hold to move • Tap buttons for actions
      </div>
    </div>
  );
}
