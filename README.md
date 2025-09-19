# Free Flow - NYC Virtual Environment

Free Flow transports users to an interactive, 2D multiplayer virtual environment inspired by the iconic New York skyline. This project aims to create a fun, gamified social space where users can explore, interact with each other in real-time, and engage seamlessly with decentralized applications and blockchain functionalities integrated directly into the environment.

## 🌟 Features

### Multiplayer Arena
- Real-time character movement and synchronization using Socket.io
- See other players' avatars, usernames, and emotes
- Form and join teams with unique room codes

### Interactive 2D World
- Navigate a themed New York skyscraper environment
- Discover and approach various interactive locations (DeFi Agents)
- Engaging user interactions with intuitive keyboard controls

### User Interactions
- **Movement**: Arrow keys for character navigation
- **Emotes**: X key for expressing emotions
- **Voice Commands**: Spacebar for voice recognition and AI agent interaction
- **Audio Feedback**: Text-to-Speech via ElevenLabs

### AI-Powered DeFi Integration
- GOAT SDK integration for on-chain operations
- Conversational AI for natural language blockchain interactions
- Custom token swap functionality for Flow ecosystem
- Price checking and token transfer capabilities

### Audio-Visual Experience
- Ambient background sound upon entering Free Flow
- Character graphics and NYC skyscraper designs
- Modern UI with dark theme and gradient backgrounds

## 🏗️ Architecture

This multiplayer 2D virtual NYC skyscraper environment consists of three main components:

### Frontend (Next.js + TypeScript)
- **Main game arena**: Interactive 2D multiplayer game environment
- **Real-time communication**: Socket.io client for multiplayer synchronization
- **Web3 integration**: Privy for authentication, Wagmi/Viem for blockchain interactions

**Key components:**
- Character movement system with keyboard controls
- Interactive locations (DeFi agents)
- Team/room system for multiplayer sessions
- Speech recognition and text-to-speech for AI agent interaction
- Emote system for player expression

### Backend Services
- **Socket.io Server**: Real-time multiplayer synchronization
  - Room/team management with unique codes
  - Player position, emote, and username updates
- **AI Agent Server**: Blockchain operations and AI interaction
  - GOAT SDK integration for on-chain operations
  - Custom token swap plugin for Flow ecosystem
  - OpenAI integration for conversational AI

### Smart Contracts
- **FreeFlowDEX.sol**: DEX functionality for Flow blockchain
- **Flow Testnet** (Chain ID: 545):
  - FreeFlowSwap: `0x3DDfe46Bb38474D5179bFfE7451aA9268E5098bb`
  - FlowSwapRouter: `0x8F90f58F9A67AFf3c1E8803DF843a15d40800FdE`

## 🛠️ Technologies Used

- **Blockchain**: Flow Testnet
- **Frontend**: Next.js, TypeScript, Phaser.js, Socket.io
- **Backend**: Node.js, Express, Socket.io, TypeScript
- **AI**: GOAT SDK, OpenAI, ElevenLabs
- **Authentication/Wallet**: Privy, Wagmi, Viem
- **Package Manager**: pnpm
- **Real-time**: WebSocket-based multiplayer

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FlowVerse
   ```

2. **Install dependencies for all services**
   ```bash
   # Frontend
   cd frontend && pnpm install
   
   # Backend
   cd ../backend && npm install
   
   # Agent (when implemented)
   cd ../agent && pnpm install
   ```

3. **Environment Setup**
   
   Create `.env.local` files in the respective directories:
   
   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
   NEXT_PUBLIC_FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
   NEXT_PUBLIC_FLOW_CHAIN_ID=545
   ```
   
   **Backend** (`backend/.env`):
   ```env
   PORT=3002
   FRONTEND_URL=http://localhost:3001
   ```
   
   **Agent** (`agent/.env`):
   ```env
   WALLET_PRIVATE_KEY=your_flow_private_key
   RPC_PROVIDER_URL=https://testnet.evm.nodes.onflow.org
   COINGECKO_API_KEY=your_coingecko_api_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=3003
   ```

### Development Commands

#### Frontend (Next.js)
```bash
cd frontend
pnpm dev          # Run development server (port 3001)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Lint code
```

#### Backend (Socket.io Server)
```bash
cd backend
npm run dev       # Run development server (port 3002)
npm start         # Start production server
```

#### AI Agent Server
```bash
cd agent
pnpm dev          # Run development server (port 3003)
pnpm build        # Build TypeScript
pnpm start        # Start production server
```

### Starting the Application

1. **Start backend**: `cd backend && npm run dev` (port 3002)
2. **Start agent**: `cd agent && pnpm dev` (port 3003)
3. **Start frontend**: `cd frontend && pnpm dev` (port 3001)
4. **Deploy contracts**: Deploy FreeFlowDEX.sol to Flow testnet/mainnet
5. **Update contract addresses**: Update plugin with deployed contract addresses

## 🎮 Game Controls

- **Arrow Keys / WASD**: Move character
- **X**: Show emote
- **Spacebar**: Voice command
- **Mouse**: Interact with DeFi agents

## 🔧 Key Technical Details

- **Supported Chains**: Flow Testnet (545)
- **Token Support**: FLOW, WFLOW (native and wrapped FLOW)
- **Real-time Features**: WebSocket-based multiplayer with Socket.io
- **AI Integration**: GOAT SDK for blockchain operations, OpenAI for conversation

## 📁 Project Structure

```
FlowVerse/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── scenes/         # Phaser game scenes
│   │   ├── types/          # TypeScript type definitions
│   │   └── config/         # Configuration files
│   └── package.json
├── backend/                 # Socket.io server
│   ├── src/
│   │   ├── controllers/    # Game controllers
│   │   ├── services/       # Business logic
│   │   └── types/          # TypeScript types
│   └── package.json
├── agent/                   # AI agent server (GOAT SDK)
│   ├── src/
│   │   └── plugins/        # Blockchain plugins
│   └── package.json
├── contracts/               # Smart contracts
│   └── FreeFlowDEX.sol
└── README.md
```

## 🚀 Deployment

### Smart Contract Deployment
The project includes FreeFlowSwap.sol which provides Swap functionality for the Flow blockchain. Deploy this contract to your chosen network and update the contract addresses in the agent plugin configuration.

### Frontend Deployment
Deploy the frontend to Vercel, Netlify, or any static hosting service.

### Backend Deployment
Deploy the backend to services like Railway, Render, or AWS.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Flow blockchain for providing the infrastructure
- Privy for wallet authentication
- Socket.io for real-time communication
- Phaser.js for 2D game development
- GOAT SDK for blockchain operations

## 📞 Support

For support, email support@freeflow.xyz or join our Discord community.

---

**Built with ❤️ for the Flow ecosystem**
