'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Phaser from 'phaser';
import { GameScene } from '@/scenes/GameScene';
import { useSocket } from '@/hooks/useSocket';
import { useGameState } from '@/hooks/useGameState';
import VoiceCommand from './VoiceCommand';

export default function Game() {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const { user } = usePrivy();
  const { socket, isConnected } = useSocket();
  const { gameState, updateGameState } = useGameState();
  const [voiceCommand, setVoiceCommand] = useState<string>('');

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1200,
      height: 800,
      parent: gameRef.current,
      backgroundColor: '#1e293b',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      // Join game room
      socket.emit('join-game', {
        userId: user.id,
        username: user.email?.address || 'Anonymous',
        roomCode: gameState.roomCode || 'default'
      });

      // Listen for game updates
      socket.on('game-update', (data) => {
        updateGameState(data);
      });

      socket.on('player-joined', (player) => {
        console.log('Player joined:', player);
      });

      socket.on('player-left', (playerId) => {
        console.log('Player left:', playerId);
      });

      socket.on('voice-command', (data) => {
        console.log('Voice command from another player:', data);
      });

      return () => {
        socket.off('game-update');
        socket.off('player-joined');
        socket.off('player-left');
        socket.off('voice-command');
      };
    }
  }, [socket, user, gameState.roomCode, updateGameState]);

  // Handle voice command processing
  const handleVoiceCommand = async (command: string) => {
    setVoiceCommand(command);
    
    // Send to agent for processing
    try {
      const response = await fetch('http://localhost:3003/api/voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          userId: user?.id
        })
      });
      
      const result = await response.json();
      console.log('Voice command result:', result);
      
      // Broadcast to other players
      if (socket) {
        socket.emit('voice-command', {
          userId: user?.id,
          command: result.response
        });
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Game Header */}
      <div className="bg-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-bold text-xl">Free Flow</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-slate-300 text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-slate-300 text-sm">
            Room: {gameState.roomCode || 'default'}
          </div>
          <div className="text-slate-300 text-sm">
            Players: {gameState.players?.length || 0}
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 relative">
        <div ref={gameRef} className="w-full h-full" />
        
        {/* Game UI Overlay */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-3">
            <div className="text-white text-sm font-medium">Controls</div>
            <div className="text-slate-300 text-xs space-y-1">
              <div>Arrow Keys - Move</div>
              <div>X - Emote</div>
              <div>Space - Voice Command</div>
            </div>
          </div>
          
          <VoiceCommand 
            onCommand={handleVoiceCommand}
            className="w-80"
          />
        </div>
      </div>
    </div>
  );
}


