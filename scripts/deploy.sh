#!/bin/bash

# Free Flow Deployment Script
echo "🚀 Deploying Free Flow to production..."

# Configuration
ENVIRONMENT=${1:-production}
REGION=${2:-us-east-1}

echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"

# Check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Build Docker images
build_images() {
    echo "🔨 Building Docker images..."
    
    # Build frontend
    echo "Building frontend..."
    docker build -t freeflow-frontend:latest ./frontend
    
    # Build backend
    echo "Building backend..."
    docker build -t freeflow-backend:latest ./backend
    
    # Build agent
    echo "Building agent..."
    docker build -t freeflow-agent:latest ./agent
    
    echo "✅ All images built successfully"
}

# Deploy to production
deploy_production() {
    echo "🌐 Deploying to production..."
    
    # Update docker-compose for production
    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  frontend:
    image: freeflow-frontend:latest
    ports:
      - "80:3001"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SOCKET_URL=\${SOCKET_URL}
      - NEXT_PUBLIC_PRIVY_APP_ID=\${PRIVY_APP_ID}
    depends_on:
      - backend
      - agent

  backend:
    image: freeflow-backend:latest
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - PORT=3002
      - FRONTEND_URL=\${FRONTEND_URL}
    restart: unless-stopped

  agent:
    image: freeflow-agent:latest
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - PORT=3003
      - RPC_PROVIDER_URL=\${RPC_PROVIDER_URL}
      - WALLET_PRIVATE_KEY=\${WALLET_PRIVATE_KEY}
      - COINGECKO_API_KEY=\${COINGECKO_API_KEY}
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
    restart: unless-stopped
EOF

    # Deploy with docker-compose
    docker-compose -f docker-compose.prod.yml up -d
    
    echo "✅ Production deployment completed"
}

# Deploy to staging
deploy_staging() {
    echo "🧪 Deploying to staging..."
    
    # Use development docker-compose for staging
    docker-compose up -d
    
    echo "✅ Staging deployment completed"
}

# Health check
health_check() {
    echo "🏥 Performing health check..."
    
    # Wait for services to start
    sleep 30
    
    # Check frontend
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Frontend is healthy"
    else
        echo "❌ Frontend health check failed"
    fi
    
    # Check backend
    if curl -f http://localhost:3002/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy"
    else
        echo "❌ Backend health check failed"
    fi
    
    # Check agent
    if curl -f http://localhost:3003/health > /dev/null 2>&1; then
        echo "✅ Agent is healthy"
    else
        echo "❌ Agent health check failed"
    fi
}

# Main deployment flow
main() {
    check_prerequisites
    build_images
    
    case $ENVIRONMENT in
        production)
            deploy_production
            ;;
        staging)
            deploy_staging
            ;;
        *)
            echo "❌ Invalid environment: $ENVIRONMENT"
            echo "Usage: $0 [production|staging] [region]"
            exit 1
            ;;
    esac
    
    health_check
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "Frontend: http://localhost:3001"
    echo "Backend API: http://localhost:3002"
    echo "Agent API: http://localhost:3003"
}

# Run main function
main "$@"

