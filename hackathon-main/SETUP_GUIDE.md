# 🅿️ ParknGo - AI-Powered Blockchain Parking System

**The world's first blockchain-secured parking system with 7 specialized AI agents**

![ParknGo](https://img.shields.io/badge/ParknGo-v1.0-blue)
![Cardano](https://img.shields.io/badge/Cardano-Preprod-green)
![React](https://img.shields.io/badge/React-18.3-61DAFB)
![Python](https://img.shields.io/badge/Python-3.14-3776AB)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

---

## 🎯 What Makes ParknGo Different

- **NO MOCK DATA**: Every payment is a real Cardano blockchain transaction
- **NO LOGIN REQUIRED**: Direct access to the parking app
- **7 AI AGENTS**: Specialized AI agents for spot finding, pricing, routing, verification, security, and dispute resolution
- **REAL-TIME UPDATES**: Firebase synchronization for live parking availability
- **TRANSPARENT PRICING**: Pay per feature, pay per minute - all on-chain

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/bun
- **Python** 3.14
- **Cardano Wallet** with Preprod testnet ADA (get from [Masumi Dispenser](https://preprod.masumi.network))

### 1. Install Dependencies

```bash
# Frontend (React + TypeScript + shadcn/ui)
cd hackathon-main
npm install  # or: bun install

# Backend (Python + Flask)
cd ..
pip3 install -r requirements.txt
```

### 2. Configure Environment

The `.env` files are already configured. Verify these settings:

**Backend** (`/masumi/.env`):
```env
# Flask Backend
FLASK_PORT=5000

# Cardano Blockchain
BLOCKFROST_PROJECT_ID=preprod4cdqcEwOm0BdBbwGKaevFWTZnczoko1r
CUSTOMER_WALLET_ADDRESS=addr_test1vrjtn62vuzckgnw8fff7t246lq34633h4qkc8npvf5fzvrskjj36g

# Firebase
FIREBASE_DATABASE_URL=https://parkngo-ai-default-rtdb.asia-southeast1.firebasedatabase.app

# AI (Google Gemini)
GEMINI_API_KEY=AIzaSyAev0zQDBDpjCxKHVgDX0tVvz6aQOiDfWg
```

**Frontend** (`/hackathon-main/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_DATABASE_URL=https://parkngo-ai-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_CUSTOMER_WALLET=addr_test1vrjtn62vuzckgnw8fff7t246lq34633h4qkc8npvf5fzvrskjj36g
```

### 3. Start the System

**Terminal 1 - Backend (Flask API + AI Agents)**:
```bash
cd /Users/dsrk/Downloads/masumi
python3 app.py
```

✅ Backend running at: `http://localhost:5000`

**Terminal 2 - Frontend (React App)**:
```bash
cd /Users/dsrk/Downloads/masumi/hackathon-main
npm run dev  # or: bun dev
```

✅ Frontend running at: `http://localhost:5173`

### 4. Access the App

1. Open browser: **http://localhost:5173**
2. Landing page shows 3D parking visualization
3. Click **"Launch App"** to access the dashboard
4. **NO LOGIN REQUIRED** - direct access to parking features

---

## 🏗️ System Architecture

### Frontend Stack
- **React 18** with TypeScript
- **shadcn/ui** for beautiful components
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **React Query** for API state management
- **Firebase SDK** for real-time updates

### Backend Stack
- **Flask** REST API server
- **PyCardano** for Cardano blockchain
- **Firebase Admin** for database
- **Google Gemini AI** for all 7 agents
- **Blockfrost API** for Cardano network

### 7 AI Agents

| Agent | Purpose | Payment |
|-------|---------|---------|
| **Orchestrator** | Master coordinator | 1.5 ADA |
| **SpotFinder** | AI spot ranking & recommendation | 1.3 ADA |
| **Pricing** | Dynamic pricing with demand forecasting | 1.4 ADA |
| **Route Optimizer** | AI-powered navigation | 1.2 ADA |
| **Payment Verifier** | Fraud detection & validation | 1.2 ADA |
| **Security Guard** | Anomaly detection | 1.25 ADA |
| **Dispute Resolver** | AI arbitration | 1.15 ADA |

---

## 📱 Features & UI Flow

### Landing Page (`/`)
- **3D Parking Visualization**: Interactive Sketchfab model
- **Live Stats**: Real-time zone availability
- **Feature Showcase**: All 7 AI agents explained
- **Technology Stack**: Cardano + Gemini + Firebase

### Dashboard (`/dashboard`)
1. **Parking Overview**
   - Interactive slot grid with real-time availability
   - Smart route assistant with mini-map
   - Suggested nearest slot (AI-powered)

2. **My Booking**
   - Cardano wallet balance (real blockchain data)
   - Active parking session with live charging
   - Transaction history with CardanoScan links

3. **History**
   - Past parking sessions
   - Blockchain transaction receipts

4. **Dispute Management**
   - AI-powered dispute resolution
   - Gemini AI arbitration

---

## 🔄 Real Transaction Flow

### 1. Select Parking Spot
```
User clicks spot → Frontend sends to /api/parking/reserve
```

### 2. AI Agents Execute
```
SpotFinder → Evaluates spot quality
Pricing → Calculates dynamic rate
RouteOptimizer → Generates directions
```

### 3. Blockchain Payment
```
PaymentVerifier → Validates transaction
CardanoPaymentService → Executes real ADA payment
Transaction submitted to Cardano Preprod network
```

### 4. TX Hash Displayed
```
Frontend shows: 
✅ Transaction Hash: 61fb055510...
🔗 View on CardanoScan
```

### 5. Real-Time Charging
```
Firebase listener detects occupied=true
Per-minute charging begins (1.2 ADA/min)
Payment Verifier validates each transaction
All TX hashes displayed in terminal + UI
```

---

## 🔐 Blockchain Integration

### Real Cardano Payments

Every payment is a **real transaction** on Cardano Preprod Testnet:

- **Customer Wallet**: `addr_test1vrjtn62vuzckgnw8fff7t246lq34633h4qkc8npvf5fzvrskjj36g`
- **Network**: Cardano Preprod (testnet)
- **Explorer**: [CardanoScan Preprod](https://preprod.cardanoscan.io)
- **Minimum UTXO**: 1.2 ADA (Cardano protocol requirement)

### Transaction Verification

1. Payment sent via `PyCardano`
2. Signed with customer wallet key
3. Submitted to Blockfrost API
4. Confirmed on Cardano blockchain
5. TX hash returned and displayed

**Example TX**: 
```
https://preprod.cardanoscan.io/transaction/61fb0555108cac2bbcca31e150f6e6d5c047beb6743d837b2f737ffcadf578de
```

---

## 📊 API Endpoints

### Parking Operations
- `GET /api/parking/spots/available` - Get all parking spots (real-time Firebase data)
- `POST /api/parking/reserve` - Create reservation (executes AI agents)
- `POST /api/parking/start` - Start session (Cardano payment)
- `POST /api/parking/end` - End session (final payment)

### Wallet Operations
- `GET /api/wallet/balance/:address` - Get real blockchain balance
- `GET /api/wallet/transactions/:address` - Transaction history

### Agent Operations
- `GET /api/agents/earnings` - Agent earnings summary
- `POST /api/trigger/vehicle-entry` - Trigger orchestration

### System
- `GET /health` - Health check

---

## 🧪 Testing the System

### Test Real Blockchain Payment

```bash
cd /Users/dsrk/Downloads/masumi
python3 simple_tx_test.py
```

Output:
```
✅ TRANSACTION SUCCESSFUL
Transaction Hash: 61fb055510...
Explorer Link: https://preprod.cardanoscan.io/transaction/...
Amount: 1.2 ADA
Network: Cardano Preprod Testnet
```

### Test Full Parking Flow

1. **Open Frontend**: http://localhost:5173
2. **Go to Dashboard**: Click "Launch App"
3. **Select Spot**: Click any green slot
4. **Confirm Booking**: Click "Confirm Slot"
5. **Watch Magic**:
   - AI agents execute
   - Real Cardano payment submitted
   - TX hash displayed in UI
   - Per-minute charging begins
   - All TX hashes shown in terminal

---

## 🐛 Troubleshooting

### Backend Issues

**"Module not found"**
```bash
pip3 install -r requirements.txt
```

**"Firebase error"**
```bash
# Check firebase credentials exist
ls secrets/parkngo-firebase-adminsdk.json
```

**"Cardano transaction failed"**
- Verify wallet has sufficient balance (>5 ADA)
- Check Blockfrost API key is valid
- Ensure using Preprod network

### Frontend Issues

**"Cannot connect to API"**
```bash
# Verify backend is running
curl http://localhost:5000/health
```

**"Missing dependencies"**
```bash
cd hackathon-main
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 Project Structure

```
masumi/
├── app.py                          # Flask REST API server
├── simple_tx_test.py               # Blockchain payment tester
├── requirements.txt                # Python dependencies
├── .env                            # Backend configuration
│
├── agents/                         # 7 AI Agents
│   ├── orchestrator.py
│   ├── spot_finder.py
│   ├── pricing_agent.py
│   ├── route_optimizer.py
│   ├── payment_verifier.py
│   ├── security_guard.py
│   └── dispute_resolver.py
│
├── services/                       # Core services
│   ├── cardano_payment_service.py  # Blockchain integration
│   ├── firebase_service.py         # Real-time database
│   ├── gemini_service.py           # AI integration
│   └── masumi_service.py           # Masumi network
│
├── secrets/
│   └── parkngo-firebase-adminsdk.json
│
└── hackathon-main/                 # React Frontend
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.tsx     # 3D visualization + features
    │   │   └── Dashboard.tsx       # Main parking app
    │   ├── services/
    │   │   └── parkingApi.ts       # Real backend API
    │   ├── config/
    │   │   └── api.ts              # API configuration
    │   └── components/             # shadcn/ui components
    ├── package.json
    └── .env                        # Frontend configuration
```

---

## 💡 Key Features Explained

### 1. NO LOGIN System
- **Why**: Simplified user experience
- **How**: Direct access to dashboard, wallet-based identification
- **Security**: Blockchain provides authentication

### 2. Real-Time Updates
- **Firebase Listeners**: `parking_spots` database changes
- **Instant Sync**: Occupied status updates across all clients
- **Event-Driven**: Triggers AI agents automatically

### 3. Transaction Transparency
- **Every TX Hash Shown**: In UI + terminal
- **CardanoScan Links**: Direct blockchain verification
- **Immutable Record**: Can't be faked or modified

### 4. Pay-Per-Feature Pricing
- **No Subscriptions**: Pay only for features used
- **AI Agent Costs**: 1.2-1.5 ADA per agent
- **Per-Minute Charging**: Real-time blockchain payments

---

## 🌟 Demo Highlights

### What You'll See

1. **Beautiful Landing Page**
   - Animated 3D parking lot (Sketchfab embed)
   - Live availability stats
   - Feature showcase with gradients

2. **Interactive Dashboard**
   - Color-coded slot grid (green/red/orange)
   - Smart nearest slot suggestion
   - Mini-map route guidance

3. **Real Blockchain Payments**
   - TX hashes displayed immediately
   - CardanoScan explorer links
   - Real wallet balance updates

4. **AI Agents in Action**
   - Terminal shows agent execution
   - Gemini AI responses
   - Payment verification logs

---

## 📞 Support & Contact

**Built by**: ActuAlte Robotics  
**Website**: https://actualte.tech  
**Technology**: Cardano + Gemini + Firebase + React

---

## 🏆 Production Ready

This is **NOT a prototype**. Every feature is fully functional:

- ✅ Real Cardano blockchain transactions
- ✅ Real AI agents (Google Gemini)
- ✅ Real-time Firebase database
- ✅ Production-ready UI/UX
- ✅ Error handling & validation
- ✅ Transaction verification
- ✅ Complete logging

**No mock data. No fake transactions. No placeholders.**

---

## 🚀 Ready to Launch?

```bash
# Terminal 1: Backend
cd /Users/dsrk/Downloads/masumi && python3 app.py

# Terminal 2: Frontend  
cd /Users/dsrk/Downloads/masumi/hackathon-main && npm run dev

# Browser
open http://localhost:5173
```

**Welcome to the future of parking!** 🅿️✨
