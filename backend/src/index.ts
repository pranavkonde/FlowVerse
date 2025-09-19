import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameService } from './services/GameService';
import { GameController } from './controllers/GameController';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const gameService = new GameService();
const gameController = new GameController(gameService);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Free Flow Backend Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    rooms: gameService.getAllRooms().length,
    players: gameService['players'].size
  });
});

app.get('/rooms', (req, res) => {
  const rooms = gameService.getAllRooms().map(room => ({
    code: room.code,
    playerCount: room.players.size,
    maxPlayers: room.maxPlayers,
    createdAt: room.createdAt
  }));
  res.json({ rooms });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Game event handlers
  socket.on('join-game', (data) => {
    gameController.handleJoinGame(socket, data);
  });

  socket.on('leave-game', (data) => {
    gameController.handleLeaveGame(socket, data);
  });

  socket.on('player-move', (data) => {
    gameController.handlePlayerMove(socket, data);
  });

  socket.on('player-emote', (data) => {
    gameController.handlePlayerEmote(socket, data);
  });

  socket.on('voice-command', (data) => {
    gameController.handleVoiceCommand(socket, data);
  });

  socket.on('disconnect', () => {
    gameController.handleDisconnect(socket);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Cleanup inactive players every 5 minutes
setInterval(() => {
  gameService.cleanupInactivePlayers();
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`🚀 Free Flow Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3001"}`);
});
