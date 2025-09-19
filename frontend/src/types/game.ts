export interface Player {
  id: string;
  username: string;
  x: number;
  y: number;
  emote?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface GameState {
  roomCode: string;
  players: Player[];
  currentPlayer: Player | null;
  isInGame: boolean;
}

export interface SocketEvents {
  'join-game': (data: { userId: string; username: string; roomCode: string }) => void;
  'leave-game': (data: { userId: string; roomCode: string }) => void;
  'player-move': (data: { userId: string; x: number; y: number }) => void;
  'player-emote': (data: { userId: string; emote: string }) => void;
  'voice-command': (data: { userId: string; command: string }) => void;
  'game-update': (data: Partial<GameState>) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
}

export interface DeFiAgent {
  id: string;
  name: string;
  type: 'swap' | 'price' | 'transfer' | 'info';
  x: number;
  y: number;
  description: string;
  isActive: boolean;
}

export interface Emote {
  id: string;
  name: string;
  emoji: string;
  duration: number;
}
