import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BlockchainService } from './services/BlockchainService';
import { AIService } from './services/AIService';
import { AgentController } from './controllers/AgentController';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const blockchainService = new BlockchainService(
  process.env.RPC_PROVIDER_URL || 'https://testnet.evm.nodes.onflow.org',
  process.env.WALLET_PRIVATE_KEY || '',
  process.env.COINGECKO_API_KEY || ''
);

const aiService = new AIService(
  process.env.OPENAI_API_KEY || ''
);

const agentController = new AgentController(blockchainService, aiService);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Free Flow AI Agent Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      blockchain: 'connected',
      ai: 'ready'
    },
    timestamp: new Date().toISOString()
  });
});

// AI Agent endpoints
app.post('/api/voice-command', (req, res) => {
  agentController.handleVoiceCommand(req, res);
});

// Blockchain endpoints
app.get('/api/price/:tokenAddress', (req, res) => {
  agentController.getTokenPrice(req, res);
});

app.post('/api/swap', (req, res) => {
  agentController.swapTokens(req, res);
});

app.post('/api/transfer', (req, res) => {
  agentController.transferTokens(req, res);
});

app.get('/api/token/:tokenAddress', (req, res) => {
  agentController.getTokenInfo(req, res);
});

app.get('/api/balance/:address', (req, res) => {
  agentController.getAccountBalance(req, res);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`🤖 Free Flow AI Agent Server running on port ${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧠 AI capabilities: Voice commands, token swaps, price checks, transfers`);
});
