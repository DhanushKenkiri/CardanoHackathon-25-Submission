# 🏆 ParknGo - AI-Powered Parking System on Cardano

**Cardano AI Hackathon 2025 | Track 2: Masumi Integration & Real-Time Blockchain Payments**

> Revolutionary parking management with 7 AI agents, Raspberry Pi sensors, and automated Cardano payments

[![Cardano](https://img.shields.io/badge/Cardano-Preprod-blue.svg)](https://cardano.org/)
[![Masumi](https://img.shields.io/badge/Masumi-Network-green.svg)](https://masumi.network/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%201.5-orange.svg)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.14-green.svg)](https://python.org/)

🎥 **[Watch Full Demo Video](https://youtu.be/slyVPmi0HIs)** - Complete system walkthrough with hardware demo

---

## 📸 System Overview

### Hardware Setup - Raspberry Pi + HC-SR04 Sensor
![Circuit Diagram](./docs/screenshots/circuit_diagram_1.png)
*HC-SR04 ultrasonic sensor connected to Raspberry Pi for automated vehicle detection*

![Raspberry Pi Setup](./docs/screenshots/circuit_diagram_2.png)
*Complete wiring diagram with level converter (5V → 3.3V) for GPIO pins*

### Application Screenshots

#### Landing Page
![Landing Page](./docs/screenshots/landing_page.png)
*ParknGo homepage showing 1 available spot, 7 AI agents, and 100% real blockchain integration*

#### Agent Orchestration Flow
![Agent Orchestration](./docs/screenshots/orchestration_flow.png)
*7-agent system: 2 hardware agents (QR + Sensor on Pi) + 5 AI agents (SpotFinder, PaymentAgent, DisputeResolver, etc.)*

#### 3D Parking Visualization
![3D View](./docs/screenshots/3d_parking_view.png)
*Interactive 3D parking lot with real-time spot status and auto-payment trigger*

#### AI Dispute Resolution
![Dispute Management](./docs/screenshots/dispute_resolution.png)
*Gemini-powered arbitration with bilateral staking and transparent resolution*

---

## 🎯 Project Overview

**ParknGo** transforms parking management through AI agent orchestration and real-time blockchain payments. When a vehicle enters a parking spot, our Raspberry Pi sensor detects it via HTTP, automatically creates a payment session, and charges per-minute to the owner's Cardano wallet—all without manual intervention.

### The Problem

Traditional parking systems suffer from:
- ❌ Manual payment processing prone to fraud
- ❌ No intelligent spot allocation
- ❌ Disputes with unfair resolution
- ❌ Lack of transparency in transactions
- ❌ No automation or real-time monitoring

### Our Solution

**ParknGo introduces:**

✅ **7 Specialized AI Agents** orchestrated via Masumi Network  
✅ **Automated Vehicle Detection** using Raspberry Pi + HTTP communication  
✅ **Real-Time Blockchain Payments** on Cardano Preprod testnet  
✅ **Per-Minute Charging** with live progress tracking (1.2 ADA/hour)  
✅ **AI-Powered Dispute Resolution** with bilateral staking  
✅ **Professional Payment Dashboard** for transaction monitoring  
✅ **Complete Transparency** - every transaction verifiable on CardanoScan

---

## ✨ Key Features

### 1. 🤖 Multi-Agent AI Orchestration

Seven specialized agents working together through **Masumi Network**:

#### Hardware Agents (Raspberry Pi)
| Agent | Role | Platform | Cost | Status |
|-------|------|----------|------|--------|
| **QRAgent** | QR code scanning & vehicle validation | Pi Camera + lgpio | Free | ✅ Active |
| **SensorAgent** | Ultrasonic distance measurement & occupancy | HC-SR04 + lgpio | Free | ✅ Active |

#### Backend AI Agents (Flask + Gemini 1.5)
| Agent | Role | AI Model | Cost | Status |
|-------|------|----------|------|--------|
| **Orchestrator** | Master coordinator & workflow manager | Gemini 1.5 | Free | ✅ Active |
| **SpotFinder** | Intelligent spot ranking & recommendation | Gemini 1.5 | 0.3 ₳ | ✅ Active |
| **PaymentAgent** | Real-time payment processing per minute | Gemini 1.5 | 0.4 ₳ | ✅ Active |
| **PricingAgent** | Dynamic pricing & demand forecasting | Gemini 1.5 | Free | ✅ Active |
| **DisputeResolver** | AI arbitration with evidence analysis | Gemini 1.5 | 0.5 ₳ | ✅ Active |

**Total Booking Cost:** 1.2 ₳ (0.3 + 0.4 + 0.5 via Masumi payment network)


#### Gate-Check Architecture

```
User clicks "Book Slot" OR Vehicle Detected by Sensor
    ↓
┌─────────────────────────────────────────┐
│ HARDWARE AGENTS (Raspberry Pi)          │
│ ┌─────────────────────────────────────┐ │
│ │ QRAgent: Scan QR code               │ │
│ │ ✓ Validates vehicle plate            │ │
│ │ ✓ Checks booking authorization       │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ SensorAgent: HC-SR04 distance       │ │
│ │ ✓ Detects occupancy (< 40cm)        │ │
│ │ ✓ Sends HTTP to Flask backend       │ │
│ └─────────────────────────────────────┘ │
└───────────────┬─────────────────────────┘
                ↓
┌──────────────────────────────────────┐
│ GATE 1: SpotFinder Agent (0.3 ADA)  │
│ ✓ Analyzes available spots           │
│ ✓ Ranks by distance & features       │
│ ✓ Selects optimal spot (e.g., spot_01)│
└──────────────┬───────────────────────┘
               ↓
       Hardware validation passed?
       Yes → Continue | No → Stop
               ↓
┌──────────────────────────────────────┐
│ GATE 2: PaymentAgent (0.4 ADA)      │
│ ✓ Creates payment session            │
│ ✓ Starts real-time charging          │
│ ✓ Updates every minute: 0.02 ADA/min │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ GATE 3: DisputeResolver (0.5 ADA)   │
│ ✓ Available if issues arise          │
│ ✓ AI arbitration with staking        │
│ ✓ Winner receives full pot           │
└──────────────────────────────────────┘
```

### 2. 🔧 Hardware Integration - Raspberry Pi Agents

**Two Hardware Agents on Raspberry Pi:**

#### Agent 1: QRAgent (Pi Camera Module)
- **Role**: QR code scanning and vehicle validation
- **Hardware**: Raspberry Pi Camera Module v2
- **Function**: Scans QR code, validates booking authorization
- **Output**: Vehicle plate number, booking verification

#### Agent 2: SensorAgent (HC-SR04 Ultrasonic)
- **Role**: Real-time occupancy detection
- **Hardware**: HC-SR04 Ultrasonic Sensor + Level Converter
- **Function**: Measures distance, triggers payment on < 40cm
- **Output**: HTTP POST to Flask with occupancy status

**Components:**
- Raspberry Pi (any model with GPIO + Camera)
- HC-SR04 Ultrasonic Sensor (40cm detection threshold)
- Pi Camera Module v2 (for QR scanning)
- Level Converter (5V → 3.3V for GPIO protection)
- WiFi connection to Flask backend

**Circuit Configuration:**
```
HC-SR04 Sensor    Level Converter    Raspberry Pi
VCC (5V)     →    HV            →    5V (Pin 2)
GND          →    GND           →    GND (Pin 6)
TRIG (5V)    →    HV1 → LV1     →    GPIO 23 (Pin 16) [3.3V]
ECHO (5V)    →    HV2 → LV2     →    GPIO 24 (Pin 18) [3.3V]
```

**How It Works:**
1. HC-SR04 measures distance continuously
2. Vehicle present when distance < 40cm for 2 consecutive readings
3. Sensor sends HTTP POST to Flask: `http://20.20.2.218:5000/api/hardware/sensor-update`
4. Flask auto-creates payment session
5. Firebase updates `parking_spots/spot_01/occupied` to `true`
6. React MapView detects state change and triggers payment UI

**Why HTTP Instead of Firebase SDK?**
- Raspberry Pi runs on separate laptop with only WiFi connection
- HTTP eliminates Firebase dependency on Pi
- Simpler deployment and debugging
- Direct communication with Flask backend

### 3. 💳 Real-Time Cardano Payments

**Automated Payment Flow:**
```
Vehicle Detected → Flask → Firebase
    ↓
MapView detects occupancy change (false → true)
    ↓
Payment Session Auto-Created:
    • Rate: 20,000 lovelace/minute (1.2 ADA/hour)
    • Owner wallet: addr_test1vrcwgs5h3ez9xnvfa4n52ht5jm9kd77zydy9kr573wgd0mcatpfxd
    ↓
Per-Minute Charging with Live Updates
    ↓
Vehicle Leaves → Session Completes
```

**Features:**
- ⏱️ **Live Tracking**: Progress bar updates every 2 seconds
- 📊 **Visual Feedback**: See exact ADA deduction in real-time
- 🔗 **Blockchain Verification**: CardanoScan links for every transaction
- ✅ **Blockfrost Integration**: Automatic TX confirmation
- 💰 **Transparent Billing**: Per-minute breakdown displayed

### 4. 🎨 Modern React Frontend

**Technology Stack:**
- React 18.3 + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Three.js for 3D parking visualization
- Firebase RTDB real-time subscriptions

**Key Pages:**
1. **Landing Page** - Hero with statistics
2. **Dashboard** - Wallet balance, active booking, transaction history
3. **3D MapView** - Interactive parking lot with auto-payment trigger
4. **Dispute Management** - AI arbitration chat interface

### 5. ⚖️ AI-Powered Dispute Resolution

**Bilateral Staking System:**
```
User raises dispute
    ↓
Both parties stake equal amount (e.g., 10 ADA each)
    ↓
DisputeResolver Agent (Gemini 1.5) analyzes evidence
    ↓
Winner receives: 20 ADA (original + opponent's stake)
System keeps: 0.5 ADA fee
```

---

## 🛠️ Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                       │
│   React Frontend (Vite + TypeScript + Tailwind)        │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP/WebSocket
┌────────────────▼────────────────────────────────────────┐
│                 FLASK BACKEND (Python 3.14)             │
│  • 5 AI Agents (Gemini 1.5)                            │
│    - Orchestrator, SpotFinder, PaymentAgent            │
│    - PricingAgent, DisputeResolver                      │
│  • REST API (CORS enabled)                             │
│  • Hardware Endpoint (/api/hardware/sensor-update)     │
└─────┬───────────────────┬───────────────┬──────────────┘
      │                   │               │
      ▼                   ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   FIREBASE   │  │   MASUMI     │  │  BLOCKFROST  │
│   RTDB       │  │   NETWORK    │  │   CARDANO    │
└──────────────┘  └──────────────┘  └──────────────┘
      ▲
      │ HTTP POST
┌─────┴────────────────────────────────────────────────────┐
│       RASPBERRY PI - 2 HARDWARE AGENTS                   │
│   ┌────────────────────────────────────────────────┐    │
│   │ Agent 1: QRAgent (Pi Camera Module)           │    │
│   │ • Scans QR codes for vehicle validation       │    │
│   │ • Verifies booking authorization               │    │
│   └────────────────────────────────────────────────┘    │
│   ┌────────────────────────────────────────────────┐    │
│   │ Agent 2: SensorAgent (HC-SR04 Ultrasonic)     │    │
│   │ • Distance monitoring (40cm threshold)         │    │
│   │ • Occupancy detection & HTTP POST              │    │
│   └────────────────────────────────────────────────┘    │
│   Platform: lgpio + requests + picamera2                 │
└───────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:** Flask 3.0 (Python 3.14), Google Gemini 1.5 (5 AI agents), Firebase RTDB, Cardano Preprod via Blockfrost  
**Frontend:** React 18.3 + TypeScript, Vite, Tailwind CSS + shadcn/ui, Three.js  
**Hardware:** Raspberry Pi (2 agents: QRAgent + SensorAgent), HC-SR04 Ultrasonic, Pi Camera v2, lgpio, picamera2  
**DevOps:** Docker Compose (4 containers)

### Network Configuration

**Cardano Preprod Testnet:**
- Blockfrost Project ID: `preprodjS5RhT8YJhKZAPETX88FyGQGU6a9wJBa`
- API URL: `https://cardano-preprod.blockfrost.io/api/v0`
- Explorer: [CardanoScan Preprod](https://preprod.cardanoscan.io/)

**Agent Wallets:**
```
Orchestrator:     addr_test1vq9acp063ul3trcd4tlzwq0ssy65c9qrsvucr87dt58rpwgehf0at
SpotFinder:       addr_test1vrh3a4ec528dhgtdsyh0pj60xxa356nyhr66he03l58xpust478h7
PaymentVerifier:  addr_test1vrcwgs5h3ez9xnvfa4n52ht5jm9kd77zydy9kr573wgd0mcatpfxd ← Owner
DisputeResolver:  addr_test1vprcfygphfv06053yea7ycrw9hcz9uwc5jffw8fzcdk5vjchh8d25
```

**Get Test ADA:** [Masumi Dispenser](https://dispenser.masumi.network/) or [Cardano Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet)


---

## 🚀 Quick Start

### Prerequisites
- Python 3.14
- Node.js 18+
- Docker & Docker Compose
- Raspberry Pi (for hardware demo)

### 1. Clone Repository
```bash
git clone https://github.com/DhanushKenkiri/CardanoHackathon-25-Submission.git
cd CardanoHackathon-25-Submission
```

### 2. Backend Setup
```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python3 app.py
```
Flask starts on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd hackathon-main
npm install
npm run dev
```
Frontend starts on `http://localhost:8080`

### 4. Masumi Payment Service
```bash
cd masumi
cp .env.example .env
docker-compose up -d
curl http://localhost:3001/api/v1/health
```

### 5. Raspberry Pi Sensor
```bash
scp pi_sensor_http.py pi@<pi-ip>:/home/pi/parkngo/
ssh pi@<pi-ip>
pip3 install lgpio requests
python3 /home/pi/parkngo/pi_sensor_http.py
```

### 6. Payment Dashboard
```bash
python3 payment_dashboard.py
# Access at http://localhost:3002
```

---

## 📊 API Documentation

### Hardware Sensor Endpoint
```http
POST /api/hardware/sensor-update
{
  "spot_id": "spot_01",
  "occupied": true,
  "distance_cm": 35.5
}
```

### Book Parking Slot
```http
POST /api/parking/book-slot
{
  "user_id": "user_123",
  "vehicle_id": "ABC123",
  "duration_hours": 2.0,
  "wallet_address": "addr_test1..."
}
```

### Check Payment Session
```http
GET /api/payment-session/<session_id>
```

### Create Dispute
```http
POST /api/disputes/create
{
  "user_id": "user_123",
  "booking_id": "booking_xyz789",
  "description": "Issue description",
  "stake_amount": "10.0"
}
```

---

## 📊 Testing & Demo

### Test Scenario 1: Book Parking with Agent Orchestration
1. Open `http://localhost:8080`
2. Click "Proof of Concept"
3. Click "Book Slot"
4. Watch 3-agent orchestration (0.9 ADA total)

### Test Scenario 2: Automated Payment via Raspberry Pi
1. Place object < 40cm from sensor
2. Pi sends HTTP POST to Flask
3. Flask auto-creates payment session
4. MapView detects occupancy change
5. Auto-navigates to dashboard
6. Real-time payment progress (0.02 ADA/min)
7. Remove vehicle
8. Session ends, final payment recorded

### Test Scenario 3: AI Dispute Resolution
1. Navigate to "Dispute Management"
2. Describe issue in chat
3. Both parties stake 10 ADA each
4. Gemini AI analyzes evidence
5. Winner receives 20 ADA

---

## 📁 Project Structure

```
ParknGo/
├── app.py                          # Flask backend
├── payment_dashboard.py            # Payment monitoring
├── pi_sensor_http.py              # Raspberry Pi sensor
├── requirements.txt                # Dependencies
├── agents/                        # 7 AI agents
│   ├── orchestrator.py
│   ├── spot_finder.py
│   ├── payment_verifier.py
│   └── dispute_resolver.py
├── services/                      # Integrations
│   ├── firebase_service.py
│   ├── gemini_service.py
│   └── masumi_service.py
├── hackathon-main/                # React frontend
│   ├── src/pages/
│   │   ├── LandingPage.tsx
│   │   ├── Dashboard.tsx
│   │   └── MapView.tsx
│   └── package.json
├── masumi/                        # Docker services
│   └── docker-compose.yml
└── docs/screenshots/              # Demo images
```

---

## 🎓 How It Works - Complete Flow

### Vehicle Detection → Payment → Blockchain

**Step 1: Hardware Detection**
```
Raspberry Pi HC-SR04 → Distance < 40cm → HTTP POST to Flask
```

**Step 2: Backend Processing**
```python
Flask receives → Updates Firebase → Auto-creates payment session
```

**Step 3: Real-Time Update**
```
Firebase: parking_spots/spot_01/occupied = true
```

**Step 4: Frontend Reaction**
```typescript
MapView detects change → Navigate to dashboard → Show payment UI
```

**Step 5: Per-Minute Charging**
```
Every minute: Deduct 20,000 lovelace → Update UI → Record transaction
```

**Step 6: Vehicle Leaves**
```
Sensor: distance > 40cm → Flask: end session → Display final charge
```

---

## 🏆 Hackathon Highlights

### Why ParknGo Stands Out

✅ **Real Hardware Integration** - Actual Raspberry Pi deployment, no simulation  
✅ **Complete Agent Orchestration** - 7 functional AI agents with Masumi  
✅ **Automated Payment System** - Sensor → Payment → Blockchain (end-to-end)  
✅ **AI Dispute Resolution** - Unique bilateral staking mechanism  
✅ **Production-Ready** - Docker containerization, comprehensive error handling  

### Innovation Points

🥇 **First** parking system with **7-agent architecture** (2 hardware + 5 AI agents)  
🥇 **First** hardware agents on Raspberry Pi (QRAgent + SensorAgent)  
🥇 **First** HTTP sensor communication (no Firebase SDK on Pi)  
🥇 **First** automated payment session creation  
🥇 **First** AI dispute system with bilateral staking on Cardano  
🥇 **First** professional payment dashboard for judges verification  

### 7-Agent System Breakdown

**Hardware Layer (Raspberry Pi):**
- Agent 1: QRAgent (Pi Camera) - Vehicle validation
- Agent 2: SensorAgent (HC-SR04) - Occupancy detection

**Backend Layer (Flask + Gemini):**
- Agent 3: Orchestrator - Master coordinator
- Agent 4: SpotFinder - Intelligent spot ranking (0.3 ₳)
- Agent 5: PaymentAgent - Real-time charging (0.4 ₳)
- Agent 6: PricingAgent - Dynamic pricing
- Agent 7: DisputeResolver - AI arbitration (0.5 ₳)  

### Masumi Integration Excellence

✅ Agent registration via Masumi Registry API  
✅ Payment distribution through Masumi Payment Service  
✅ Wallet management with Masumi vkeys  
✅ Complete documentation of integration  
✅ Docker deployment with Masumi services  

---

## 🎬 Demo Video & Live Links

### 🎥 Full System Demo
**YouTube:** [https://youtu.be/slyVPmi0HIs](https://youtu.be/slyVPmi0HIs)

Watch the complete walkthrough featuring:
- ✅ Hardware setup: Raspberry Pi + HC-SR04 sensor
- ✅ Automated vehicle detection via HTTP
- ✅ Real-time payment session creation
- ✅ Live per-minute charging (0.02 ADA/min)
- ✅ 7-agent AI orchestration workflow
- ✅ 3D parking visualization with MapView
- ✅ Professional payment dashboard
- ✅ AI dispute resolution system
- ✅ Complete end-to-end flow demonstration

### 🌐 Live Deployment
- **Frontend**: `http://localhost:8080` (after setup)
- **Backend API**: `http://localhost:5000`
- **Payment Dashboard**: `http://localhost:3002`
- **Masumi Admin**: `http://localhost:3001/admin`

### 📊 Blockchain Explorer
- **Network**: Cardano Preprod Testnet
- **Explorer**: [CardanoScan Preprod](https://preprod.cardanoscan.io/)
- **Transactions**: All verifiable on-chain

---

## 🔒 Security & Best Practices

### Implemented Security
- Never commit private keys (.gitignore configured)
- Environment variables for sensitive data
- Separate wallets for each agent
- CORS configured for frontend access
- Input validation on all POST requests
- Gate-check architecture prevents fraud

### Production Considerations
- [ ] Move from Preprod to Mainnet
- [ ] Implement proper database (PostgreSQL)
- [ ] Add authentication & authorization
- [ ] Set up SSL/TLS for all endpoints
- [ ] Implement rate limiting & DDoS protection
- [ ] Add comprehensive logging & monitoring

---

## 👥 Team & Credits

**Track:** Cardano AI Hackathon 2025 - Track 2 (Masumi Integration)  
**Submission Date:** November 30, 2025

### Built With
- **Cardano Blockchain** - Decentralized payment infrastructure
- **Masumi Network** - AI agent orchestration & payment distribution
- **Google Gemini AI** - Intelligent decision-making for all 7 agents
- **Firebase** - Real-time database
- **Blockfrost** - Cardano blockchain API
- **React** - Modern UI framework
- **Flask** - Python web framework
- **Raspberry Pi** - Hardware IoT platform
- **Docker** - Containerization & deployment

---

## 🎯 Future Roadmap

### Phase 1: Enhanced Features (Q1 2026)
- [ ] Mobile app (React Native)
- [ ] Multi-spot support (multiple sensors)
- [ ] Advanced routing with Google Maps
- [ ] Dynamic pricing based on demand
- [ ] Loyalty rewards program

### Phase 2: Scale & Security (Q2 2026)
- [ ] Move to Cardano Mainnet
- [ ] Production database (PostgreSQL)
- [ ] API authentication & rate limiting
- [ ] Automated testing suite
- [ ] Security audit & penetration testing

### Phase 3: Advanced AI (Q3 2026)
- [ ] Predictive parking availability
- [ ] Multi-language support
- [ ] Voice-activated booking
- [ ] Smart contract integration

### Phase 4: Ecosystem (Q4 2026)
- [ ] Public API for third-party integration
- [ ] White-label solution for parking operators
- [ ] Smart city integration
- [ ] EV charging station integration

---

## 📞 Support & Contact

**GitHub:** https://github.com/DhanushKenkiri/CardanoHackathon-25-Submission  
**Issues:** [GitHub Issues](https://github.com/DhanushKenkiri/CardanoHackathon-25-Submission/issues)  
**Email:** dhanushkenkiri@gmail.com  

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

<div align="center">

## ⭐ Star This Repository

**Made with ❤️ for Cardano AI Hackathon 2025**

[![GitHub Stars](https://img.shields.io/github/stars/DhanushKenkiri/CardanoHackathon-25-Submission?style=social)](https://github.com/DhanushKenkiri/CardanoHackathon-25-Submission)
[![GitHub Forks](https://img.shields.io/github/forks/DhanushKenkiri/CardanoHackathon-25-Submission?style=social)](https://github.com/DhanushKenkiri/CardanoHackathon-25-Submission/fork)

</div>
