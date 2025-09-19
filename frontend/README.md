# Free Flow Frontend

This is the frontend application for Free Flow - a 2D multiplayer virtual environment with DeFi integration on the Flow blockchain.

## 🎮 Features

- **2D Multiplayer Game**: Built with Phaser.js for smooth gameplay
- **Real-time Communication**: Socket.io integration for multiplayer synchronization
- **Web3 Authentication**: Privy wallet integration for seamless blockchain access
- **Interactive Environment**: NYC skyscraper-themed world with DeFi agents
- **Voice Commands**: Speech recognition for AI agent interaction
- **Emote System**: Express yourself with animated emotes

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Game Engine**: Phaser.js
- **Real-time**: Socket.io Client
- **Web3**: Privy, Wagmi, Viem
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Setup**
   
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
   NEXT_PUBLIC_FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
   NEXT_PUBLIC_FLOW_CHAIN_ID=545
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🎮 Game Controls

- **Arrow Keys / WASD**: Move character
- **X**: Show emote
- **Spacebar**: Voice command
- **Mouse**: Interact with DeFi agents

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Game.tsx           # Main game component
│   └── Login.tsx          # Authentication component
├── hooks/                 # Custom React hooks
│   ├── useSocket.ts       # Socket.io connection
│   └── useGameState.ts    # Game state management
├── scenes/                # Phaser game scenes
│   └── GameScene.ts       # Main game scene
├── types/                 # TypeScript definitions
│   └── game.ts            # Game-related types
└── config/                # Configuration
    └── environment.ts     # Environment variables
```

## 🚀 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🔧 Development

### Adding New Components
1. Create component in `src/components/`
2. Export from component file
3. Import and use in your pages

### Adding New Game Features
1. Modify `GameScene.ts` for game logic
2. Update `useGameState.ts` for state management
3. Add new types in `types/game.ts`

### Web3 Integration
- Authentication handled by Privy
- Blockchain interactions via Wagmi/Viem
- Flow blockchain support

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Netlify
- AWS Amplify
- Railway
- Render

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
