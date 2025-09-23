import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameService } from './services/GameService';
import { GameController } from './controllers/GameController';
import { ChatService } from './services/ChatService';
import { MiniGameService } from './services/MiniGameService';
import { NPCService } from './services/NPCService';
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
const chatService = new ChatService(io);
const miniGameService = new MiniGameService();
const npcService = new NPCService();

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

// Mini-games API routes
app.get('/api/minigames', (req, res) => {
  const games = miniGameService.getGames();
  res.json({ games });
});

app.get('/api/minigames/:gameId', (req, res) => {
  const game = miniGameService.getGame(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  res.json({ game });
});

app.get('/api/minigames/:gameId/leaderboard', (req, res) => {
  const leaderboard = miniGameService.getLeaderboard(req.params.gameId);
  if (!leaderboard) {
    return res.status(404).json({ error: 'Leaderboard not found' });
  }
  res.json({ leaderboard });
});

app.get('/api/minigames/:gameId/scores', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const scores = miniGameService.getScores(req.params.gameId, limit);
  res.json({ scores });
});

app.post('/api/minigames/:gameId/scores', (req, res) => {
  try {
    const score = miniGameService.submitScore(req.body);
    res.json({ score });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/minigames/stats/global', (req, res) => {
  const stats = miniGameService.getGlobalStats();
  res.json({ stats });
});

app.get('/api/minigames/stats/user/:userId', (req, res) => {
  const stats = miniGameService.getUserStats(req.params.userId);
  res.json({ stats });
});

// NPC API routes
app.get('/api/npcs', (req, res) => {
  const npcs = npcService.getNPCs();
  res.json({ npcs });
});

app.get('/api/npcs/:npcId', (req, res) => {
  const npc = npcService.getNPC(req.params.npcId);
  if (!npc) {
    return res.status(404).json({ error: 'NPC not found' });
  }
  res.json({ npc });
});

app.get('/api/npcs/area/:area', (req, res) => {
  const npcs = npcService.getNPCsInArea(req.params.area);
  res.json({ npcs });
});

app.get('/api/npcs/near/:x/:y/:radius', (req, res) => {
  const x = parseFloat(req.params.x);
  const y = parseFloat(req.params.y);
  const radius = parseFloat(req.params.radius);
  const npcs = npcService.getNPCsNearPosition(x, y, radius);
  res.json({ npcs });
});

app.post('/api/npcs/:npcId/conversation', (req, res) => {
  try {
    const conversation = npcService.startConversation(req.params.npcId, req.body.playerId);
    res.json({ conversation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/npcs/conversation/:conversationId/message', (req, res) => {
  try {
    npcService.sendMessage(req.params.conversationId, req.body.message, req.body.speaker);
    const conversation = npcService.getConversation(req.params.conversationId);
    res.json({ conversation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/npcs/conversation/:conversationId', (req, res) => {
  npcService.endConversation(req.params.conversationId);
  res.json({ success: true });
});

app.get('/api/npcs/stats', (req, res) => {
  const stats = npcService.getStats();
  res.json({ stats });
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


