import { Player, GameRoom } from '../types/game';

export class GameService {
  private rooms: Map<string, GameRoom> = new Map();
  private players: Map<string, Player> = new Map();

  createRoom(roomCode: string, maxPlayers: number = 10): GameRoom {
    const room: GameRoom = {
      code: roomCode,
      players: new Map(),
      createdAt: new Date(),
      maxPlayers
    };
    
    this.rooms.set(roomCode, room);
    console.log(`Room ${roomCode} created`);
    return room;
  }

  joinRoom(roomCode: string, player: Player): boolean {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      // Create room if it doesn't exist
      this.createRoom(roomCode);
      return this.joinRoom(roomCode, player);
    }

    if (room.players.size >= room.maxPlayers) {
      return false; // Room is full
    }

    // Remove player from any existing room
    this.leaveRoom(player.id);

    // Add player to new room
    room.players.set(player.id, player);
    this.players.set(player.id, player);
    
    console.log(`Player ${player.username} joined room ${roomCode}`);
    return true;
  }

  leaveRoom(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    const room = this.rooms.get(player.roomCode);
    if (room) {
      room.players.delete(playerId);
      
      // Delete room if empty
      if (room.players.size === 0) {
        this.rooms.delete(player.roomCode);
        console.log(`Room ${player.roomCode} deleted (empty)`);
      }
    }

    this.players.delete(playerId);
    console.log(`Player ${player.username} left room ${player.roomCode}`);
  }

  updatePlayerPosition(playerId: string, x: number, y: number): void {
    const player = this.players.get(playerId);
    if (player) {
      player.x = x;
      player.y = y;
      player.lastSeen = new Date();
    }
  }

  updatePlayerEmote(playerId: string, emote: string): void {
    const player = this.players.get(playerId);
    if (player) {
      player.emote = emote;
      player.lastSeen = new Date();
    }
  }

  getRoom(roomCode: string): GameRoom | undefined {
    return this.rooms.get(roomCode);
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getRoomPlayers(roomCode: string): Player[] {
    const room = this.rooms.get(roomCode);
    return room ? Array.from(room.players.values()) : [];
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  cleanupInactivePlayers(): void {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [playerId, player] of this.players.entries()) {
      if (now.getTime() - player.lastSeen.getTime() > inactiveThreshold) {
        console.log(`Removing inactive player: ${player.username}`);
        this.leaveRoom(playerId);
      }
    }
  }
}


