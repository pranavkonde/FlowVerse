'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

interface VoiceCommandProps {
  onCommand: (command: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function VoiceCommand({ onCommand, onError, className = '' }: VoiceCommandProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    clearTranscript
  } = useVoiceCommands({
    onCommand: (command) => {
      setLastCommand(command);
      setCommandHistory(prev => [command, ...prev.slice(0, 4)]); // Keep last 5 commands
      onCommand(command);
    },
    onError: (error) => {
      if (onError) onError(error);
    }
  });

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Auto-stop listening after 10 seconds of inactivity
  useEffect(() => {
    if (isListening) {
      const timer = setTimeout(() => {
        stopListening();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isListening, stopListening]);

  if (!isSupported) {
    return (
      <div className={`bg-red-500/20 border border-red-500/50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <MicOff className="w-4 h-4" />
          <span className="text-sm">Voice commands not supported</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium text-sm">Voice Commands</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="p-1 rounded hover:bg-slate-700 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-green-400" />
            )}
          </button>
          <button
            onClick={handleToggleListening}
            className={`p-2 rounded-full transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-white" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs">
          {error}
        </div>
      )}

      {isListening && (
        <div className="mb-3 p-2 bg-blue-500/20 border border-blue-500/50 rounded">
          <div className="flex items-center gap-2 text-blue-400 text-xs">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Listening...</span>
          </div>
          {transcript && (
            <div className="mt-2 text-white text-sm">
              "{transcript}"
            </div>
          )}
        </div>
      )}

      {lastCommand && (
        <div className="mb-3 p-2 bg-green-500/20 border border-green-500/50 rounded">
          <div className="text-green-400 text-xs mb-1">Last command:</div>
          <div className="text-white text-sm">"{lastCommand}"</div>
        </div>
      )}

      {commandHistory.length > 0 && (
        <div className="space-y-1">
          <div className="text-slate-400 text-xs">Recent commands:</div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {commandHistory.slice(0, 3).map((cmd, index) => (
              <div
                key={index}
                className="text-slate-300 text-xs p-1 bg-slate-700/50 rounded truncate"
                title={cmd}
              >
                {cmd}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-slate-400">
        <div>Try saying:</div>
        <div className="mt-1 space-y-1">
          <div>• "price of FLOW"</div>
          <div>• "swap 100 FLOW to WFLOW"</div>
          <div>• "send 50 FLOW to 0x..."</div>
        </div>
      </div>
    </div>
  );
}
