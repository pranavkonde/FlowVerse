import { GameRoom, Player } from '../types/game';

export class RoomService {
  private rooms: Map<string, GameRoom> = new Map();
  private roomCodes: Set<string> = new Set();

  createRoom(roomCode?: string, maxPlayers: number = 10): GameRoom {
    const code = roomCode || this.generateUniqueRoomCode();
    
    const room: GameRoom = {
      code,
      players: new Map(),
      createdAt: new Date(),
      maxPlayers
    };
    
    this.rooms.set(code, room);
    this.roomCodes.add(code);
    
    console.log(`Room ${code} created with max ${maxPlayers} players`);
    return room;
  }

  joinRoom(roomCode: string, player: Player): { success: boolean; error?: string } {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.players.size >= room.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    if (room.players.has(player.id)) {
      return { success: false, error: 'Player already in room' };
    }

    room.players.set(player.id, player);
    console.log(`Player ${player.username} joined room ${roomCode}`);
    return { success: true };
  }

  leaveRoom(roomCode: string, playerId: string): { success: boolean; error?: string } {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (!room.players.has(playerId)) {
      return { success: false, error: 'Player not in room' };
    }

    room.players.delete(playerId);
    console.log(`Player ${playerId} left room ${roomCode}`);

    // Delete room if empty
    if (room.players.size === 0) {
      this.rooms.delete(roomCode);
      this.roomCodes.delete(roomCode);
      console.log(`Room ${roomCode} deleted (empty)`);
    }

    return { success: true };
  }

  getRoom(roomCode: string): GameRoom | undefined {
    return this.rooms.get(roomCode);
  }

  getRoomPlayers(roomCode: string): Player[] {
    const room = this.rooms.get(roomCode);
    return room ? Array.from(room.players.values()) : [];
  }

  getAllRooms(): GameRoom[] {
    return Array.from(this.rooms.values());
  }

  getRoomStats(roomCode: string): {
    playerCount: number;
    maxPlayers: number;
    createdAt: Date;
    isFull: boolean;
  } | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    return {
      playerCount: room.players.size,
      maxPlayers: room.maxPlayers,
      createdAt: room.createdAt,
      isFull: room.players.size >= room.maxPlayers
    };
  }

  searchRooms(query: string): GameRoom[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.rooms.values()).filter(room => 
      room.code.toLowerCase().includes(searchTerm)
    );
  }

  getPopularRooms(limit: number = 5): GameRoom[] {
    return Array.from(this.rooms.values())
      .sort((a, b) => b.players.size - a.players.size)
      .slice(0, limit);
  }

  getRecentRooms(limit: number = 5): GameRoom[] {
    return Array.from(this.rooms.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  private generateUniqueRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.roomCodes.has(code));
    
    return code;
  }

  cleanupInactiveRooms(): void {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [roomCode, room] of this.rooms.entries()) {
      const timeSinceCreation = now.getTime() - room.createdAt.getTime();
      
      if (room.players.size === 0 && timeSinceCreation > inactiveThreshold) {
        this.rooms.delete(roomCode);
        this.roomCodes.delete(roomCode);
        console.log(`Cleaned up inactive room: ${roomCode}`);
      }
    }
  }

  getTotalStats(): {
    totalRooms: number;
    totalPlayers: number;
    averagePlayersPerRoom: number;
  } {
    const totalRooms = this.rooms.size;
    const totalPlayers = Array.from(this.rooms.values())
      .reduce((sum, room) => sum + room.players.size, 0);
    const averagePlayersPerRoom = totalRooms > 0 ? totalPlayers / totalRooms : 0;

    return {
      totalRooms,
      totalPlayers,
      averagePlayersPerRoom: Math.round(averagePlayersPerRoom * 100) / 100
    };
  }
}
