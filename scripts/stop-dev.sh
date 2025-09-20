#!/bin/bash

# Free Flow Development Stop Script
echo "🛑 Stopping Free Flow development servers..."

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file="$service_name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "Stopping $service_name (PID: $pid)..."
            kill $pid
            rm "$pid_file"
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name was not running"
            rm "$pid_file"
        fi
    else
        echo "⚠️  No PID file found for $service_name"
    fi
}

# Stop all services
stop_service "backend"
stop_service "agent"
stop_service "frontend"

echo ""
echo "✅ All services stopped!"
echo ""
echo "🧹 To clean up, you can also run:"
echo "- pkill -f 'npm run dev'"
echo "- pkill -f 'pnpm dev'"
