#!/bin/bash

# Free Flow Development Setup Script
echo "🚀 Setting up Free Flow development environment..."

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "🔍 Checking prerequisites..."
check_command "node"
check_command "pnpm"
check_command "git"

# Install dependencies for all services
echo "📦 Installing dependencies..."

echo "Installing frontend dependencies..."
cd frontend && pnpm install && cd ..

echo "Installing backend dependencies..."
cd backend && npm install && cd ..

echo "Installing agent dependencies..."
cd agent && pnpm install && cd ..

echo "Installing contract dependencies..."
cd contracts && npm install && cd ..

# Create environment files if they don't exist
echo "📝 Setting up environment files..."

if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
NEXT_PUBLIC_FLOW_RPC_URL=https://testnet.evm.nodes.onflow.org
NEXT_PUBLIC_FLOW_CHAIN_ID=545
EOF
fi

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env..."
    cat > backend/.env << EOF
PORT=3002
FRONTEND_URL=http://localhost:3001
EOF
fi

if [ ! -f "agent/.env" ]; then
    echo "Creating agent/.env..."
    cat > agent/.env << EOF
WALLET_PRIVATE_KEY=your_flow_private_key_here
RPC_PROVIDER_URL=https://testnet.evm.nodes.onflow.org
COINGECKO_API_KEY=your_coingecko_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3003
EOF
fi

# Build all services
echo "🔨 Building all services..."

echo "Building frontend..."
cd frontend && pnpm build && cd ..

echo "Building backend..."
cd backend && npm run build && cd ..

echo "Building agent..."
cd agent && pnpm build && cd ..

echo "✅ Setup complete!"
echo ""
echo "🎮 To start the development servers:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Agent: cd agent && pnpm dev"
echo "3. Frontend: cd frontend && pnpm dev"
echo ""
echo "🌐 Access the application at:"
echo "- Frontend: http://localhost:3001"
echo "- Backend API: http://localhost:3002"
echo "- Agent API: http://localhost:3003"
echo ""
echo "📝 Don't forget to update the environment variables with your actual API keys!"
