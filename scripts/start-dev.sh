#!/bin/bash

# Free Flow Development Start Script
echo "🚀 Starting Free Flow development servers..."

# Function to start a service in the background
start_service() {
    local service_name=$1
    local service_dir=$2
    local start_command=$3
    
    echo "Starting $service_name..."
    cd $service_dir
    $start_command &
    local pid=$!
    echo "$service_name started with PID $pid"
    echo $pid > "../$service_name.pid"
    cd ..
}

# Start all services
echo "🔧 Starting backend server..."
start_service "backend" "backend" "npm run dev"

echo "🤖 Starting agent server..."
start_service "agent" "agent" "pnpm dev"

echo "🎮 Starting frontend server..."
start_service "frontend" "frontend" "pnpm dev"

echo ""
echo "✅ All services started!"
echo ""
echo "🌐 Access the application:"
echo "- Frontend: http://localhost:3001"
echo "- Backend API: http://localhost:3002"
echo "- Agent API: http://localhost:3003"
echo ""
echo "📊 Health checks:"
echo "- Backend: http://localhost:3002/health"
echo "- Agent: http://localhost:3003/health"
echo ""
echo "🛑 To stop all services, run: ./scripts/stop-dev.sh"
