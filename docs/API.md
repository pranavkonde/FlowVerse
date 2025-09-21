# Free Flow API Documentation

## Overview

The Free Flow API provides endpoints for the multiplayer game, AI agent services, and blockchain interactions. All APIs follow RESTful conventions and return JSON responses.

## Base URLs

- **Backend API**: `http://localhost:3002`
- **Agent API**: `http://localhost:3003`
- **Frontend**: `http://localhost:3001`

## Authentication

Most endpoints require authentication via Privy wallet integration. Include the user ID in request headers or body where specified.

## Backend API

### Health Check

#### GET /health

Returns the health status of the backend server.

**Response:**
```json
{
  "status": "healthy",
  "rooms": 5,
  "players": 12,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Room Management

#### GET /rooms

Get a list of all active rooms.

**Response:**
```json
{
  "rooms": [
    {
      "code": "ABC123",
      "playerCount": 3,
      "maxPlayers": 10,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

## Agent API

### Health Check

#### GET /health

Returns the health status of the AI agent server.

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "blockchain": "connected",
    "ai": "ready"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Voice Commands

#### POST /api/voice-command

Process a voice command through the AI agent.

**Request Body:**
```json
{
  "command": "price of FLOW",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "response": "The current price of FLOW is $0.85",
  "action": {
    "type": "price",
    "data": {
      "tokenAddress": "0x7e60df042a9c0868"
    }
  }
}
```

### Token Operations

#### GET /api/price/:tokenAddress

Get the current price of a token.

**Parameters:**
- `tokenAddress` (string): The contract address of the token

**Query Parameters:**
- `vsCurrency` (string, optional): Currency to compare against (default: "usd")

**Response:**
```json
{
  "success": true,
  "price": 0.85
}
```

#### POST /api/swap

Execute a token swap.

**Request Body:**
```json
{
  "fromToken": "0x7e60df042a9c0868",
  "toToken": "0x1654653399040a61",
  "amount": "100",
  "userAddress": "0x...",
  "slippage": 0.5
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "estimatedOutput": "95.5"
}
```

#### POST /api/transfer

Transfer tokens to another address.

**Request Body:**
```json
{
  "toAddress": "0x...",
  "amount": "50",
  "tokenAddress": "0x7e60df042a9c0868",
  "userAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x..."
}
```

#### GET /api/token/:tokenAddress

Get information about a specific token.

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "FLOW",
    "name": "Flow",
    "address": "0x7e60df042a9c0868",
    "decimals": 18
  }
}
```

#### GET /api/balance/:address

Get the token balance for an address.

**Query Parameters:**
- `tokenAddress` (string, optional): Specific token address (default: native FLOW)

**Response:**
```json
{
  "success": true,
  "balance": "1000.0"
}
```

## WebSocket Events

### Connection

Connect to the backend WebSocket server for real-time multiplayer functionality.

**URL:** `ws://localhost:3002`

### Client Events

#### join-game
Join a game room.

```json
{
  "userId": "user123",
  "username": "Player1",
  "roomCode": "ABC123"
}
```

#### leave-game
Leave the current game room.

```json
{
  "userId": "user123",
  "roomCode": "ABC123"
}
```

#### player-move
Update player position.

```json
{
  "userId": "user123",
  "x": 100,
  "y": 200
}
```

#### player-emote
Send an emote.

```json
{
  "userId": "user123",
  "emote": "wave"
}
```

#### voice-command
Broadcast a voice command to other players.

```json
{
  "userId": "user123",
  "command": "Hello everyone!"
}
```

### Server Events

#### game-update
Receive game state updates.

```json
{
  "players": [...],
  "roomCode": "ABC123"
}
```

#### player-joined
Notification when a player joins.

```json
{
  "id": "user123",
  "username": "Player1",
  "x": 100,
  "y": 200,
  "isOnline": true
}
```

#### player-left
Notification when a player leaves.

```json
{
  "playerId": "user123"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **API Endpoints**: 20 requests per minute
- **Voice Commands**: 10 requests per minute

## Security

- All inputs are validated and sanitized
- CORS is configured for specific origins
- Rate limiting prevents abuse
- Security headers are applied
- Request logging for monitoring

## Examples

### JavaScript/TypeScript

```typescript
// Get token price
const response = await fetch('http://localhost:3003/api/price/0x7e60df042a9c0868');
const data = await response.json();
console.log('FLOW price:', data.price);

// Process voice command
const voiceResponse = await fetch('http://localhost:3003/api/voice-command', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    command: 'swap 100 FLOW to WFLOW',
    userId: 'user123'
  })
});
const result = await voiceResponse.json();
console.log('AI response:', result.response);
```

### WebSocket Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3002');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Join a game room
  socket.emit('join-game', {
    userId: 'user123',
    username: 'Player1',
    roomCode: 'ABC123'
  });
});

socket.on('player-joined', (player) => {
  console.log('Player joined:', player.username);
});

socket.on('game-update', (data) => {
  console.log('Game state updated:', data);
});
```
