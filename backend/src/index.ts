import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameService } from './services/GameService';
import { GameController } from './controllers/GameController';
import { 
  securityHeaders, 
  createRateLimit, 
  requestLogger, 
  errorHandler, 
  corsOptions 
} from './middleware/security';

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

// Security middleware
app.use(securityHeaders);
app.use(requestLogger);

// Rate limiting
app.use(createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
app.use('/api/', createRateLimit(60 * 1000, 20)); // 20 API requests per minute

// CORS and parsing
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Free Flow Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3001"}`);
});


