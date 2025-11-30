# 🏆 ParknGo - AI-Powered Parking on Cardano

**Cardano AI Hackathon 2025 | Track 2: Masumi Integration & AI Agent Orchestration**

> Future of parking with agentic orchestration powered by Cardano blockchain

[![Cardano](https://img.shields.io/badge/Cardano-Preprod-blue.svg)](https://cardano.org/)
[![Masumi](https://img.shields.io/badge/Masumi-Network-green.svg)](https://masumi.network/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%201.5-orange.svg)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docker.com/)

---

## 🎯 Hackathon Quick Links

| Resource | Link |
|----------|------|
| **📘 Submission Document** | [HACKATHON_SUBMISSION.md](./HACKATHON_SUBMISSION.md) |
| **🧪 Testing Guide** | [TESTING_GUIDE.md](./TESTING_GUIDE.md) |
| **🏗️ Architecture** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **🚀 Live Demo** | `http://localhost:8080` (after setup) |
| **📊 API Docs** | [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) |
| **🎥 Demo Video** | [YouTube Link](#) |

| **🎥 Demo Video** | [YouTube Link](#) |
| **💻 GitHub Repo** | [github.com/YourUsername/ParknGo](https://github.com/) |

---

## 📸 Screenshots & Demo

### 🎬 Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400?text=ParknGo+Dashboard)

### 🤖 Agent Orchestration in Action
![Orchestration](https://via.placeholder.com/800x400?text=3-Agent+Orchestration+Flow)

### 💳 Real-Time Payment Tracking
![Payments](https://via.placeholder.com/800x400?text=Live+Payment+Progress+Bar)

### ⚖️ AI Dispute Resolution
![Disputes](https://via.placeholder.com/800x400?text=AI-Powered+Arbitration)

---

## 🎯 Project Overview

**ParknGo** is a revolutionary AI-powered parking management system that demonstrates the **future of autonomous service orchestration** on the Cardano blockchain. Built for **Cardano AI Hackathon 2025 Track 2**, it showcases:

✅ **7 AI Agents** orchestrated through Masumi Network  
✅ **Real-time Cardano payments** with transparent tracking  
✅ **AI-powered dispute resolution** with bilateral staking  
✅ **Smart agent orchestration** with gate checks  
✅ **Production-ready** Docker deployment

### The Problem

Traditional parking systems suffer from:
- ❌ Manual payment processes and fraud
- ❌ No intelligent spot recommendations
- ❌ Disputes with no fair arbitration
- ❌ Lack of payment transparency
- ❌ No real-time monitoring

### Our Solution

ParknGo introduces:
- ✅ **Multi-Agent AI System** - 7 specialized agents working together
- ✅ **Blockchain Payments** - Transparent Cardano transactions via Masumi
- ✅ **Real-time Tracking** - Live payment progress with 2s updates
- ✅ **AI Arbitration** - Gemini-powered dispute resolution
- ✅ **Complete Transparency** - Every transaction on CardanoScan

---

## ✨ Key Features

### 1. 🤖 7-Agent AI Orchestration (Masumi Integration)

All agents registered and coordinated through **Masumi Network**:

| Agent | Purpose | AI Model | Cost | Masumi |
|-------|---------|----------|------|--------|
| **SpotFinder** | Rank & select best parking spot | Gemini 1.5 | 0.3₳ | ✅ |
| **VehicleDetector** | Validate vehicle presence & plate | Gemini 1.5 | 0.2₳ | ✅ |
| **PaymentAgent** | Process real-time parking payments | Gemini 1.5 | 0.4₳ | ✅ |
| **Orchestrator** | Coordinate agent workflow & gates | Gemini 1.5 | 0₳ | ✅ |
| **DisputeResolver** | AI arbitration with staking | Gemini 1.5 | 0.5₳ | ✅ |
| **SecurityGuard** | Monitor sessions & detect fraud | Gemini 1.5 | 0₳ | ✅ |
| **PricingAgent** | Dynamic pricing & forecasting | Gemini 1.5 | 0₳ | ✅ |

**Total Agent Cost per Booking:** 0.9₳ (distributed automatically via Masumi)

### 2. 💳 Real-Time Cardano Payments

- ⏱️ **Live tracking**: Progress bar updates every 2 seconds
- 📊 **Visual feedback**: See ADA deduction in real-time (0.02₳/min)
- 🔗 **Blockchain verification**: Direct CardanoScan links for every TX
- ✅ **Blockfrost integration**: Automatic transaction verification
- 💰 **Transparent costs**: All fees displayed upfront

### 3. ⚖️ AI-Powered Dispute Resolution

**Bilateral Staking + Gemini AI Arbitration:**
1. User and owner both stake 1.0₳ (total pot: 2.0₳)
2. AI analyzes evidence (payment logs, timestamps, sensor data)
3. Winner determined with confidence score (0-100%)
4. Winner receives entire 2.0₳ pot
5. AI fee: 0.5₳ (separate charge)

### 4. 🎨 Modern React Dashboard

**Complete UI with shadcn/ui + Tailwind CSS:**
- ✅ Book Slot orchestration modal with 3-step visualization
- ✅ Real-time payment progress bar with live updates
- ✅ Transaction history (3 tabs: Bookings/Transactions/Sessions)
- ✅ Dispute chat interface with AI responses
- ✅ Live wallet balance from Blockfrost
- ✅ CardanoScan integration for all transactions

### 5. 🐳 Production-Ready Docker Deployment

**6 Docker containers orchestrated:**
- `parkngo-api` - Flask backend (Port 5000)
- `masumi-registry-service` - Agent registry (Port 3000)
- `masumi-payment-service` - Payment processor (Port 3001)
- `parkngo-payment-monitor` - Real-time monitoring
- `masumi-postgres-registry` - Registry DB (Port 5432)
- `masumi-postgres-payment` - Payment DB (Port 5433)

---

## 🏗️ System Architecture

```
USER → React Dashboard (8080)
         ↓ REST API
      Flask Backend (5000)
         ↓
    ORCHESTRATOR AGENT
    ├─ SpotFinder (0.3₳)
    ├─ VehicleDetector (0.2₳)
    └─ PaymentAgent (0.4₳)
         ↓
    Masumi Network (3000/3001)
         ↓
    Cardano Preprod Testnet
         ↓
    CardanoScan Explorer
```

**Detailed diagrams:** See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Docker & Docker Compose
- Firebase account + credentials
- Google Gemini API key
- Blockfrost API key (Cardano preprod)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/DhanushKenkiri/Parkngo.git
cd Parkngo

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Add Firebase credentials
# Place parkngo-firebase-adminsdk.json in secrets/

# 5. Start Masumi services
cd masumi
docker compose up -d
cd ..

# 6. Start API server
python app.py
```

**Or use the automated startup script:**
```powershell
# Windows
.\start.ps1

# Linux/Mac
chmod +x start.sh && ./start.sh
```

### Verify Installation

```bash
# Check health
curl http://localhost:5000/api/health

# Get available spots
curl http://localhost:5000/api/parking/spots

# View statistics
curl http://localhost:5000/api/stats
```

---

## 📡 API Endpoints

### Parking Operations
- `POST /api/parking/reserve` - Create reservation (Orchestrator + all agents)
- `GET /api/parking/spots` - Get available spots
- `POST /api/parking/price` - Calculate dynamic price (Gemini AI)

### Payments
- `POST /api/payment/verify` - Verify blockchain payment (Gemini fraud detection)
- `GET /api/payment/status/{id}` - Check payment status

### Disputes
- `POST /api/disputes/create` - Create dispute (Gemini investigation)
- `GET /api/disputes/{id}` - Get dispute status
- `POST /api/disputes/{id}/resolve` - AI arbitration

### Monitoring
- `GET /api/monitoring/sessions` - Security Guard monitoring
- `GET /api/agents/earnings` - Agent payment distribution

### System
- `GET /api/health` - Health check
- `GET /api/stats` - System statistics

**Full API documentation:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 📖 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Step-by-step setup
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment
- **[Hardware Team Guide](docs/HARDWARE_TEAM_README.md)** - Raspberry Pi setup
- **[Backend Team Guide](docs/BACKEND_TEAM_README.md)** - Agent architecture
- **[Frontend Team Guide](docs/FRONTEND_TEAM_README.md)** - Mobile/web integration
- **[Masumi Setup](MASUMI_SETUP_GUIDE.md)** - Blockchain services

---

## 🧪 Testing

```bash
# Run full test suite
python tests/test_api.py

# Test specific endpoint
curl -X POST http://localhost:5000/api/parking/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "user_location": {"lat": 40.7128, "lng": -74.0060},
    "vehicle_type": "sedan",
    "desired_features": ["covered"],
    "duration_hours": 2.0,
    "wallet_address": "addr1qy..."
  }'
```

---

## 🏭 Production Deployment

### Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f parkngo-api
```

### Manual Deployment

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn (4 workers)
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for cloud deployment (AWS, GCP, Heroku), scaling, and monitoring.

---

## 📊 Project Statistics

- **Total Lines of Code**: ~5,600+
- **AI Agents**: 7 (all using Gemini API)
- **API Endpoints**: 12
- **Service Modules**: 3 (Firebase, Gemini, Masumi)
- **Test Coverage**: 10+ integration tests
- **Documentation Pages**: 7

---

## 🤝 Team Structure

This project is designed for 3 teams:

### Hardware Team
- Raspberry Pi setup with IR sensors
- Real-time Firebase sync
- GPIO pin management
- See: [HARDWARE_TEAM_README.md](docs/HARDWARE_TEAM_README.md)

### Backend Team
- AI agent development
- API endpoint implementation
- Blockchain integration
- See: [BACKEND_TEAM_README.md](docs/BACKEND_TEAM_README.md)

### Frontend Team
- Mobile app (React Native)
- Web dashboard (React)
- Real-time updates
- See: [FRONTEND_TEAM_README.md](docs/FRONTEND_TEAM_README.md)

---

## 🔧 Configuration

### Environment Variables

```bash
# Firebase
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Blockchain
BLOCKFROST_PROJECT_ID=your_blockfrost_project_id

# Masumi Network
MASUMI_PAYMENT_SERVICE_URL=http://localhost:3001
MASUMI_REGISTRY_SERVICE_URL=http://localhost:3000
```

---

## 🛠️ Development

### Project Structure

```
ParknGo/
├── agents/              # 7 AI agents
│   ├── orchestrator.py
│   ├── spot_finder.py
│   ├── pricing_agent.py
│   ├── route_optimizer.py
│   ├── payment_verifier.py
│   ├── security_guard.py
│   └── dispute_resolver.py
├── services/            # Core services
│   ├── firebase_service.py
│   ├── gemini_service.py
│   └── masumi_service.py
├── tests/               # Test suite
│   └── test_api.py
├── docs/                # Team documentation
├── masumi/              # Blockchain services
├── app.py               # Flask API server
└── requirements.txt     # Python dependencies
```

### Adding New Features

1. Create new agent in `agents/`
2. Add to `agents/__init__.py`
3. Integrate in `app.py`
4. Add tests in `tests/`
5. Update documentation

---

## 🐛 Troubleshooting

**Masumi services not running:**
```bash
cd masumi
docker compose down
docker compose up -d
```

**Firebase connection error:**
- Check `secrets/parkngo-firebase-adminsdk.json` exists
- Verify FIREBASE_DATABASE_URL in `.env`

**Gemini API errors:**
- Verify GEMINI_API_KEY in `.env`
- Check quota limits at https://ai.google.dev/

**Port conflicts:**
```bash
# Change port
export PORT=5001
python app.py
```

---

## 🙏 Acknowledgments

- **Google Gemini** - AI capabilities across all agents
- **Masumi Network** - Blockchain payment infrastructure
- **Cardano** - Secure blockchain platform
- **Firebase** - Real-time database
- **Flask** - Web framework

---

## 📞 Support

- **Repository**: https://github.com/DhanushKenkiri/Parkngo
- **Issues**: [Create a GitHub issue](https://github.com/DhanushKenkiri/Parkngo/issues)
- **Documentation**: See `docs/` folder

---

## 🎯 Roadmap

- [x] Multi-agent system with Gemini AI
- [x] Blockchain payment integration
- [x] REST API with 12 endpoints
- [x] Real-time monitoring
- [ ] Mobile app (React Native)
- [ ] Web dashboard (React)
- [ ] Machine learning for demand prediction
- [ ] License plate recognition
- [ ] Multi-language support
- [ ] Analytics dashboard

---

**Built with ❤️ using AI, Blockchain, and IoT**
