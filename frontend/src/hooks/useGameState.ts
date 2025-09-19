import { useState, useCallback } from 'react';
import { GameState, Player } from '@/types/game';

const initialState: GameState = {
  roomCode: 'default',
  players: [],
  currentPlayer: null,
  isInGame: false,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  }, []);

  const addPlayer = useCallback((player: Player) => {
    setGameState(prev => ({
      ...prev,
      players: [...prev.players.filter(p => p.id !== player.id), player]
    }));
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  }, []);

  const updatePlayerPosition = useCallback((playerId: string, x: number, y: number) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, x, y } : p
      )
    }));
  }, []);

  const resetGameState = useCallback(() => {
    setGameState(initialState);
  }, []);

  return {
    gameState,
    updateGameState,
    addPlayer,
    removePlayer,
    updatePlayerPosition,
    resetGameState,
  };
}
