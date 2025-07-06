#!/bin/bash

# Inboxed Production Deployment Script
set -e

echo "🚀 Starting Inboxed deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env.production file exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found. Please create it with your production settings."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p nginx/ssl

# Check if SSL certificates exist (if using nginx)
if [ -f "docker-compose.prod.yml" ] && grep -q "nginx:" docker-compose.prod.yml; then
    if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
        print_warning "SSL certificates not found in nginx/ssl/"
        print_warning "You'll need to obtain SSL certificates before enabling nginx"
        print_warning "Consider using Let's Encrypt with certbot"
    fi
fi

# Build the application
print_status "Building Docker image..."
docker-compose build

# Skip tests during deployment (already tested locally)
print_status "Skipping tests (run locally before deployment)..."

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Start the application
print_status "Starting Inboxed in production mode..."
if [ -f "docker-compose.prod.yml" ]; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
else
    docker-compose up -d
fi

# Wait for health check
print_status "Waiting for application to be ready..."
sleep 10

# Check health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "✅ Inboxed is running successfully!"
    print_status "Health check: http://localhost:3000/health"
    print_status "API endpoint: http://localhost:3000/api/form/submit"
else
    print_error "❌ Health check failed. Check logs with: docker-compose logs"
    exit 1
fi

# Show running containers
print_status "Running containers:"
docker-compose ps

print_status "🎉 Deployment completed successfully!"
print_status "View logs with: docker-compose logs -f"
print_status "Stop with: docker-compose down"
