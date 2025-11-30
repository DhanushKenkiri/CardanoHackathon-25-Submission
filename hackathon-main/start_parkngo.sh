#!/bin/bash

echo "🚀 Starting ParknGo with Real Integrations..."
echo ""

# Check if backend is running
if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "⚠️  Backend not running!"
    echo "Please start the backend in a separate terminal:"
    echo "   cd /Users/dsrk/Downloads/masumi && python3 app.py"
    echo ""
fi

echo "✅ Frontend starting at http://localhost:8080"
echo "✅ Real Cardano wallet balance (updates every 10s)"
echo "✅ Real-time Firebase parking spots"
echo "✅ Golden ratio UI design"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd /Users/dsrk/Downloads/masumi/hackathon-main
npm run dev
