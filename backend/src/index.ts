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
import { AntiCheatService } from './services/AntiCheatService';
import { AnalyticsService } from './services/AnalyticsService';
import { EventService } from './services/EventService';
import { AchievementService } from './services/AchievementService';
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
const achievementService = new AchievementService();
const gameController = new GameController(gameService, achievementService);
const chatService = new ChatService(io);
const miniGameService = new MiniGameService();
const npcService = new NPCService();
const antiCheatService = new AntiCheatService();
const analyticsService = new AnalyticsService();
const eventService = new EventService(io);

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

// Security API routes
app.get('/api/security/config', (req, res) => {
  const config = antiCheatService.getConfig();
  res.json({ config });
});

app.get('/api/security/rules', (req, res) => {
  const rules = antiCheatService.getRules();
  res.json({ rules });
});

app.get('/api/security/events', (req, res) => {
  const events = antiCheatService.getEvents();
  res.json({ events });
});

app.get('/api/security/stats', (req, res) => {
  const stats = antiCheatService.getStats();
  res.json({ stats });
});

app.post('/api/security/validate/movement', (req, res) => {
  try {
    const { userId, fromX, fromY, toX, toY, timestamp } = req.body;
    const validation = antiCheatService.validateMovement(userId, fromX, fromY, toX, toY, timestamp);
    res.json({ validation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/security/validate/action', (req, res) => {
  try {
    const { userId, actionType, timestamp } = req.body;
    const validation = antiCheatService.validateAction(userId, actionType, timestamp);
    res.json({ validation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Analytics API routes
app.get('/api/analytics/dashboard', (req, res) => {
  const timeRange = req.query.timeRange as '1h' | '24h' | '7d' | '30d' || '24h';
  const dashboard = analyticsService.getDashboard(timeRange);
  res.json({ dashboard });
});

app.get('/api/analytics/events', (req, res) => {
  const timeRange = parseInt(req.query.timeRange as string) || undefined;
  const events = analyticsService.getEvents(timeRange);
  res.json({ events });
});

app.get('/api/analytics/metrics', (req, res) => {
  const timeRange = parseInt(req.query.timeRange as string) || undefined;
  const metrics = analyticsService.getMetrics(timeRange);
  res.json({ metrics });
});

app.post('/api/analytics/events', (req, res) => {
  try {
    analyticsService.recordEvent(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/analytics/metrics', (req, res) => {
  try {
    analyticsService.recordMetric(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analytics/stats', (req, res) => {
  const stats = analyticsService.getStats();
  res.json({ stats });
});

// Event API routes
app.get('/api/events/active', (req, res) => {
  const events = eventService.getActiveEvents();
  res.json(events);
});

app.get('/api/events/upcoming', (req, res) => {
  const events = eventService.getUpcomingEvents();
  res.json(events);
});

app.get('/api/events/:eventId', (req, res) => {
  const event = eventService.getEventById(req.params.eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

app.post('/api/events/:eventId/join', (req, res) => {
  try {
    const { userId } = req.body;
    const success = eventService.joinEvent(req.params.eventId, userId);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to join event' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/events/:eventId/leave', (req, res) => {
  try {
    const { userId } = req.body;
    const success = eventService.leaveEvent(req.params.eventId, userId);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to leave event' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/events/participation/:userId', (req, res) => {
  const participation = eventService.getUserParticipation(req.params.userId);
  res.json(participation);
});

app.get('/api/events/:eventId/leaderboard', (req, res) => {
  const leaderboard = eventService.getEventLeaderboard(req.params.eventId);
  if (!leaderboard) {
    return res.status(404).json({ error: 'Leaderboard not found' });
  }
  res.json(leaderboard);
});

app.get('/api/events/:eventId/objectives', (req, res) => {
  const objectives = eventService.getEventObjectives(req.params.eventId);
  res.json(objectives);
});

app.post('/api/events/:eventId/objectives/:objectiveId/progress', (req, res) => {
  try {
    const { userId, progress } = req.body;
    const success = eventService.updateObjectiveProgress(
      req.params.eventId,
      req.params.objectiveId,
      userId,
      progress
    );
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to update progress' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/events/:eventId/rewards/:rewardId/claim', (req, res) => {
  try {
    const { userId } = req.body;
    const success = eventService.claimReward(req.params.eventId, req.params.rewardId, userId);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to claim reward' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/events/notifications/:userId', (req, res) => {
  const notifications = eventService.getEventNotifications(req.params.userId);
  res.json(notifications);
});

app.post('/api/events/notifications/:notificationId/read', (req, res) => {
  try {
    const success = eventService.markNotificationAsRead(req.params.notificationId);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to mark notification as read' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/events/seasonal/:season', (req, res) => {
  const events = eventService.getSeasonalEvents(req.params.season);
  res.json(events);
});

app.get('/api/events/limited-time', (req, res) => {
  const events = eventService.getLimitedTimeEvents();
  res.json(events);
});

app.get('/api/events/stats', (req, res) => {
  const stats = eventService.getEventStats();
  res.json({ stats });
});

// Achievement API routes
app.get('/api/achievements', (req, res) => {
  const achievements = achievementService.getAchievements();
  res.json({ achievements });
});

app.get('/api/achievements/:achievementId', (req, res) => {
  const achievement = achievementService.getAchievement(req.params.achievementId);
  if (!achievement) {
    return res.status(404).json({ error: 'Achievement not found' });
  }
  res.json({ achievement });
});

app.get('/api/achievements/category/:category', (req, res) => {
  const achievements = achievementService.getAchievementsByCategory(req.params.category as any);
  res.json({ achievements });
});

app.get('/api/achievements/user/:userId', (req, res) => {
  const userAchievements = achievementService.getUserAchievements(req.params.userId);
  res.json({ userAchievements });
});

app.get('/api/achievements/user/:userId/progress/:achievementId', (req, res) => {
  const progress = achievementService.getUserAchievementProgress(
    req.params.userId, 
    req.params.achievementId
  );
  if (!progress) {
    return res.status(404).json({ error: 'Achievement progress not found' });
  }
  res.json({ progress });
});

app.get('/api/achievements/user/:userId/stats', (req, res) => {
  const stats = achievementService.getUserAchievementStats(req.params.userId);
  res.json({ stats });
});

app.post('/api/achievements/user/:userId/progress', (req, res) => {
  try {
    const { requirementType, amount, metadata } = req.body;
    achievementService.updateUserProgress(req.params.userId, requirementType, amount, metadata);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/achievements/user/:userId/claim/:achievementId', (req, res) => {
  try {
    const success = achievementService.claimAchievementReward(req.params.userId, req.params.achievementId);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Failed to claim reward' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin achievement routes
app.post('/api/admin/achievements', (req, res) => {
  try {
    const achievement = achievementService.createAchievement(req.body);
    res.json({ achievement });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/achievements/:achievementId', (req, res) => {
  try {
    const achievement = achievementService.updateAchievement(req.params.achievementId, req.body);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    res.json({ achievement });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/achievements/:achievementId', (req, res) => {
  try {
    const success = achievementService.deleteAchievement(req.params.achievementId);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Achievement not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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


