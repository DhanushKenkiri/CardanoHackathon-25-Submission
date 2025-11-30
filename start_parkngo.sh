#!/bin/bash
# ParknGo Complete System Startup Script

echo "🅿️  Starting ParknGo - AI-Powered Blockchain Parking System"
echo "============================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is already running
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Backend already running on port 5000${NC}"
else
    echo -e "${BLUE}🚀 Starting Flask Backend (Python)...${NC}"
    cd "$(dirname "$0")" && python3 app.py &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
fi

echo ""

# Wait for backend to be ready
echo -e "${BLUE}⏳ Waiting for backend to be ready...${NC}"
sleep 5

# Check if frontend is already running
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Frontend already running on port 5173${NC}"
else
    echo -e "${BLUE}🚀 Starting React Frontend...${NC}"
    cd hackathon-main && npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
fi

echo ""
echo "============================================================"
echo -e "${GREEN}🎉 ParknGo is LIVE!${NC}"
echo "============================================================"
echo ""
echo -e "${BLUE}📱 Frontend:${NC}  http://localhost:5173"
echo -e "${BLUE}🔧 Backend:${NC}   http://localhost:5000"
echo -e "${BLUE}💚 Health:${NC}    http://localhost:5000/health"
echo ""
echo -e "${YELLOW}📝 To stop all services:${NC}"
echo "   pkill -f 'python3 app.py'"
echo "   pkill -f 'vite'"
echo ""
echo -e "${GREEN}✨ Ready to test real blockchain payments!${NC}"
echo ""
