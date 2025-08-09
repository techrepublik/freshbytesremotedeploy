#!/bin/bash

# FreshBytes Admin Deployment Script for Ubuntu Server
set -e

echo "🚀 Starting FreshBytes Admin deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker is already installed"
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose is already installed"
fi

# Create production environment file if it doesn't exist
if [ ! -f .env.production ]; then
    echo "📝 Creating production environment file..."
    cat > .env.production << EOF
# Production Environment Variables
API_LINK=https://your-api-domain.com
NITRO_HOST=0.0.0.0
NITRO_PORT=3000
NODE_ENV=production
EOF
    echo "⚠️  Please update .env.production with your actual API configuration"
fi

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose -f docker-compose.yml --env-file .env.production up -d --build

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be running at http://your-server-ip:3000"
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down" 