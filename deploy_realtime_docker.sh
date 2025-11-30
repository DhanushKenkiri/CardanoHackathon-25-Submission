#!/bin/bash

# Docker Deployment Script for ParknGo Real-Time System

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  🚀 PARKNGO REAL-TIME PAYMENT SYSTEM - DOCKER DEPLOYMENT"
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

echo "📦 Building Docker images and starting services..."
echo ""

# Stop existing containers
docker compose down 2>/dev/null

# Build and start all services
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "⏳ Waiting for services to be healthy..."
    sleep 10
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  ✅ PARKNGO REAL-TIME SYSTEM DEPLOYED SUCCESSFULLY"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "  Services running:"
    echo ""
    echo "  🌐 ParknGo API:            http://localhost:5000"
    echo "  💰 Payment Monitor:        Running in background"
    echo "  🔧 Masumi Payment Service: http://localhost:3001"
    echo "  📋 Masumi Registry:        http://localhost:3000"
    echo "  🗄️  PostgreSQL (Registry):  localhost:5432"
    echo "  🗄️  PostgreSQL (Payment):   localhost:5433"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "  📊 View container status:"
    echo "     docker compose ps"
    echo ""
    echo "  📡 Watch transaction hashes (IMPORTANT - run in separate terminal):"
    echo "     ./view_transaction_hashes.sh"
    echo ""
    echo "  📝 View all logs:"
    echo "     docker compose logs -f"
    echo ""
    echo "  📝 View payment monitor logs only:"
    echo "     docker compose logs -f payment-monitor"
    echo ""
    echo "  🛑 Stop all services:"
    echo "     docker compose down"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "  🧪 To test real-time payments:"
    echo ""
    echo "  1. Open NEW terminal and run:"
    echo "     ./view_transaction_hashes.sh"
    echo ""
    echo "  2. Trigger parking (choose one):"
    echo "     • Hardware sensor sets spot_01.occupied = true"
    echo "     • OR run: ./test_start_parking.sh"
    echo "     • OR set manually in Firebase Console"
    echo ""
    echo "  3. Watch the magic happen:"
    echo "     ✨ Terminal: TX hashes appear every 60 seconds"
    echo "     ✨ Frontend: Live charging UI (if running)"
    echo "     ✨ Firebase: Real-time payment records"
    echo ""
    echo "  4. End parking:"
    echo "     ./test_end_parking.sh"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "  💡 IMPORTANT:"
    echo "     The payment monitor runs INSIDE Docker."
    echo "     To see TX hashes, you MUST run:"
    echo "     ./view_transaction_hashes.sh"
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
else
    echo ""
    echo "❌ Deployment failed. Check logs:"
    echo "   docker compose logs"
    exit 1
fi
