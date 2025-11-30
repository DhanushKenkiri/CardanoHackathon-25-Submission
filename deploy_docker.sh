#!/bin/bash

# Docker Deployment Script for ParknGo Real-Time System

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  🚀 PARKNGO DOCKER DEPLOYMENT"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Please create .env with Firebase and Cardano credentials"
    exit 1
fi

# Check if Firebase credentials exist
if [ ! -f "secrets/parkngo-firebase-adminsdk.json" ]; then
    echo "❌ Error: Firebase credentials not found"
    echo "   Please add secrets/parkngo-firebase-adminsdk.json"
    exit 1
fi

echo "📦 Building Docker images..."
echo ""

# Build and start services
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  ✅ PARKNGO SYSTEM DEPLOYED SUCCESSFULLY"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "  Services running:"
    echo ""
    echo "  🌐 Frontend:         http://localhost:3002"
    echo "  🔧 API:              http://localhost:5000"
    echo "  💰 Payment Monitor:  Running in background"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "  📊 View container status:"
    echo "     docker-compose ps"
    echo ""
    echo "  📡 Watch transaction hashes (run in separate terminal):"
    echo "     ./view_transaction_hashes.sh"
    echo ""
    echo "  📝 View all logs:"
    echo "     docker-compose logs -f"
    echo ""
    echo "  🛑 Stop all services:"
    echo "     docker-compose down"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "  🧪 To test parking:"
    echo "     1. Set spot_01.occupied = true in Firebase"
    echo "     2. Run: ./view_transaction_hashes.sh"
    echo "     3. Watch TX hashes appear every 60 seconds"
    echo "     4. Visit: http://localhost:3002/app"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
else
    echo ""
    echo "❌ Deployment failed. Check logs:"
    echo "   docker-compose logs"
    exit 1
fi
