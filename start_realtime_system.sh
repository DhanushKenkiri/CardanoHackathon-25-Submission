#!/bin/bash

# ParknGo Real-Time Payment System Startup Script
# Starts both the backend API and real-time payment monitor

echo "=========================================="
echo "🚀 STARTING PARKNGO REAL-TIME SYSTEM"
echo "=========================================="
echo ""

# Check if in correct directory
if [ ! -f "realtime_payment_monitor.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check Python dependencies
echo "📦 Checking Python dependencies..."
python3 -c "import firebase_admin, dotenv" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Missing Python dependencies. Installing..."
    pip3 install firebase-admin python-dotenv pycardano blockfrost-python
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Please create .env with Firebase and Blockfrost credentials"
    exit 1
fi

echo "✅ Dependencies OK"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "python3 app.py" 2>/dev/null
pkill -f "python3 realtime_payment_monitor.py" 2>/dev/null
pkill -f "npm start" 2>/dev/null
sleep 2

# Start backend API
echo "🔧 Starting Flask API (port 5000)..."
cd "$(dirname "$0")"
python3 app.py > /tmp/parkngo-api.log 2>&1 &
API_PID=$!
echo "   PID: $API_PID"
sleep 3

# Start real-time payment monitor
echo "💰 Starting Real-Time Payment Monitor..."
python3 realtime_payment_monitor.py > /tmp/parkngo-monitor.log 2>&1 &
MONITOR_PID=$!
echo "   PID: $MONITOR_PID"
echo "   Logs: tail -f /tmp/parkngo-monitor.log"
sleep 2

# Start frontend (optional)
if [ -d "frontend" ]; then
    echo "🎨 Starting Frontend (port 3002)..."
    cd frontend
    PORT=3002 BROWSER=none npm start > /tmp/parkngo-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   PID: $FRONTEND_PID"
    cd ..
fi

echo ""
echo "=========================================="
echo "✅ PARKNGO SYSTEM RUNNING"
echo "=========================================="
echo ""
echo "📊 Services:"
echo "   • Flask API: http://localhost:5000"
echo "   • Payment Monitor: Running (check logs below)"
echo "   • Frontend: http://localhost:3002"
echo ""
echo "📝 Monitor real-time payments:"
echo "   tail -f /tmp/parkngo-monitor.log"
echo ""
echo "🧪 To test:"
echo "   1. Open Firebase Console"
echo "   2. Go to Database -> parking_spots -> spot_01"
echo "   3. Set 'occupied' to true"
echo "   4. Watch terminal for payment transactions!"
echo ""
echo "🛑 To stop all services:"
echo "   pkill -f 'python3 app.py'"
echo "   pkill -f 'python3 realtime_payment_monitor.py'"
echo "   pkill -f 'npm start'"
echo ""
echo "=========================================="
echo ""

# Follow monitor logs
echo "📡 Following payment monitor logs (Ctrl+C to stop watching)..."
echo ""
tail -f /tmp/parkngo-monitor.log
