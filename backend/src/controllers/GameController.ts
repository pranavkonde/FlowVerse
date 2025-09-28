import { Socket } from 'socket.io';
import { GameService } from '../services/GameService';
import { AchievementService } from '../services/AchievementService';
import { Player } from '../types/game';
import { RequirementType } from '../types/achievements';

export class GameController {
  private gameService: GameService;
  private achievementService: AchievementService;

  constructor(gameService: GameService, achievementService?: AchievementService) {
    this.gameService = gameService;
    this.achievementService = achievementService || new AchievementService();
  }

  handleJoinGame(socket: Socket, data: { userId: string; username: string; roomCode: string }) {
    try {
      const player: Player = {
        id: data.userId,
        username: data.username,
        x: 600, // Default spawn position
        y: 400,
        isOnline: true,
        lastSeen: new Date(),
        socketId: socket.id,
        roomCode: data.roomCode
      };

      const success = this.gameService.joinRoom(data.roomCode, player);
      
      if (success) {
        socket.join(data.roomCode);
        socket.emit('room-joined', data.roomCode);
        
        // Notify other players in the room
        const roomPlayers = this.gameService.getRoomPlayers(data.roomCode);
        socket.to(data.roomCode).emit('player-joined', player);
        
        // Send current room state to the joining player
        socket.emit('game-update', {
          players: roomPlayers,
          roomCode: data.roomCode
        });

        console.log(`Player ${data.username} joined room ${data.roomCode}`);
        
        // Track achievement progress
        this.achievementService.updateUserProgress(data.userId, RequirementType.ROOMS_VISITED, 1);
      } else {
        socket.emit('error', 'Failed to join room. Room may be full.');
      }
    } catch (error) {
      console.error('Error handling join game:', error);
      socket.emit('error', 'Failed to join game');
    }
  }

  handleLeaveGame(socket: Socket, data: { userId: string; roomCode: string }) {
    try {
      const player = this.gameService.getPlayer(data.userId);
      if (player) {
        this.gameService.leaveRoom(data.userId);
        socket.leave(data.roomCode);
        socket.to(data.roomCode).emit('player-left', data.userId);
        console.log(`Player ${player.username} left room ${data.roomCode}`);
      }
    } catch (error) {
      console.error('Error handling leave game:', error);
    }
  }

  handlePlayerMove(socket: Socket, data: { userId: string; x: number; y: number }) {
    try {
      const player = this.gameService.getPlayer(data.userId);
      if (player) {
        // Calculate distance moved
        const distance = Math.sqrt(
          Math.pow(data.x - player.x, 2) + Math.pow(data.y - player.y, 2)
        );
        
        this.gameService.updatePlayerPosition(data.userId, data.x, data.y);
        
        // Track distance traveled for achievements
        this.achievementService.updateUserProgress(data.userId, RequirementType.DISTANCE_TRAVELED, distance);
        
        // Broadcast movement to other players in the same room
        socket.to(player.roomCode).emit('player-move', {
          userId: data.userId,
          x: data.x,
          y: data.y
        });
      }
    } catch (error) {
      console.error('Error handling player move:', error);
    }
  }

  handlePlayerEmote(socket: Socket, data: { userId: string; emote: string }) {
    try {
      this.gameService.updatePlayerEmote(data.userId, data.emote);
      
      // Track emote usage for achievements
      this.achievementService.updateUserProgress(data.userId, RequirementType.EMOTES_USED, 1);
      
      const player = this.gameService.getPlayer(data.userId);
      if (player) {
        // Broadcast emote to other players in the same room
        socket.to(player.roomCode).emit('player-emote', {
          userId: data.userId,
          emote: data.emote
        });
      }
    } catch (error) {
      console.error('Error handling player emote:', error);
    }
  }

  handleVoiceCommand(socket: Socket, data: { userId: string; command: string }) {
    try {
      const player = this.gameService.getPlayer(data.userId);
      if (player) {
        // Track voice command usage for achievements
        this.achievementService.updateUserProgress(data.userId, RequirementType.VOICE_COMMANDS, 1);
        
        // Broadcast voice command to other players in the same room
        socket.to(player.roomCode).emit('voice-command', {
          userId: data.userId,
          command: data.command
        });
        
        console.log(`Voice command from ${player.username}: ${data.command}`);
      }
    } catch (error) {
      console.error('Error handling voice command:', error);
    }
  }

  handleDisconnect(socket: Socket) {
    try {
      // Find player by socket ID and remove them
      for (const [playerId, player] of this.gameService['players'].entries()) {
        if (player.socketId === socket.id) {
          this.gameService.leaveRoom(playerId);
          socket.to(player.roomCode).emit('player-left', playerId);
          console.log(`Player ${player.username} disconnected`);
          break;
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }
}


