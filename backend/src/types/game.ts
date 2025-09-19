export interface Player {
  id: string;
  username: string;
  x: number;
  y: number;
  emote?: string;
  isOnline: boolean;
  lastSeen: Date;
  socketId: string;
  roomCode: string;
}

export interface GameRoom {
  code: string;
  players: Map<string, Player>;
  createdAt: Date;
  maxPlayers: number;
}

export interface SocketEvents {
  'join-game': (data: { userId: string; username: string; roomCode: string }) => void;
  'leave-game': (data: { userId: string; roomCode: string }) => void;
  'player-move': (data: { userId: string; x: number; y: number }) => void;
  'player-emote': (data: { userId: string; emote: string }) => void;
  'voice-command': (data: { userId: string; command: string }) => void;
  'game-update': (data: any) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'room-created': (roomCode: string) => void;
  'room-joined': (roomCode: string) => void;
  'error': (message: string) => void;
}
