# 🔍 Real-Time Payment Verification Scripts

Complete transaction hash monitoring for ParknGo's dual payment system.

## 📋 Overview

These scripts verify **ALL blockchain transactions** in real-time:

### 1. **User → Owner Payments** (Per-Minute Charging)
- **Amount**: 0.2 ADA per minute (200,000 Lovelace)
- **Trigger**: Firebase `parking_spots/spot_01.occupied = true`
- **Source**: Customer Wallet
- **Destination**: Payment Verifier Agent (collecting for owner)
- **Frequency**: Every 60 seconds while vehicle is parked

### 2. **Owner → Agent Payments** (Revenue Distribution)
- **Trigger**: Vehicle entry event in Firebase
- **7 Agents Paid**:
  - Orchestrator: 1.5 ADA (1,500,000 Lovelace)
  - Pricing Agent: 1.4 ADA (1,400,000 Lovelace)
  - Spot Finder: 1.3 ADA (1,300,000 Lovelace)
  - Security Guard: 1.25 ADA (1,250,000 Lovelace)
  - Payment Verifier: 1.2 ADA (1,200,000 Lovelace)
  - Route Optimizer: 1.2 ADA (1,200,000 Lovelace)
  - Dispute Resolver: 1.15 ADA (1,150,000 Lovelace)

---

## 🚀 Quick Start

### **Option 1: Python Live Monitor (Recommended)**
```bash
python3 monitor_live_payments.py
```

**Features**:
- ✅ Real-time Firebase listeners
- ✅ Formatted transaction boxes
- ✅ Automatic service management
- ✅ Clean colored output
- ✅ Transaction summary
- ✅ 3-minute monitoring period

**Output Example**:
```
┌────────────────────────────────────────────────────────────────────┐
│ 💰 USER → OWNER PAYMENT #1
├────────────────────────────────────────────────────────────────────┤
│ Amount:   0.2 ADA
│ Purpose:  Per-minute parking charge
│
│ TX Hash:
│ a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0
│
│ https://preprod.cardanoscan.io/transaction/a1b2c3d4e5f6...
└────────────────────────────────────────────────────────────────────┘
```

---

### **Option 2: Live TX Stream Monitor**
```bash
./live_tx_monitor.sh
```

**Features**:
- ✅ Beautiful ASCII art boxes
- ✅ Real-time log tailing
- ✅ Color-coded transactions
- ✅ Auto-cleanup
- ✅ Firebase summary

**Best for**: Visual real-time streaming display

---

### **Option 3: Complete Verification**
```bash
./verify_realtime_complete.sh
```

**Features**:
- ✅ Full 8-step verification process
- ✅ Configuration checks
- ✅ Detailed transaction tracking
- ✅ Firebase data validation
- ✅ Log file preservation

**Best for**: Comprehensive testing and debugging

---

## 📊 What Gets Verified

### ✅ Firebase State Changes
- `parking_spots/spot_01.occupied: false → true`
- Vehicle entry events trigger agent payments
- Real-time session tracking

### ✅ Transaction Hash Display
Every blockchain transaction shows:
- **TX Hash**: Full 64-character hash
- **Amount**: ADA and Lovelace
- **Explorer Link**: Direct CardanoScan URL
- **Timestamp**: When transaction occurred
- **Purpose**: Payment type and reason

### ✅ Payment Flow
```
1. spot_01.occupied = true (Firebase)
        ↓
2. Vehicle entry event created
        ↓
3. Firebase listener triggers agent payments
        ↓
4. 7 blockchain transactions (Owner → Agents)
        ↓ [All TX hashes displayed]
        ↓
5. Payment monitor starts per-minute charging
        ↓
6. Payment #1: 0.2 ADA (immediate)
        ↓ [TX hash displayed]
        ↓
7. Payment #2: 0.2 ADA (60 seconds later)
        ↓ [TX hash displayed]
        ↓
8. Payment #3: 0.2 ADA (120 seconds later)
        ↓ [TX hash displayed]
```

---

## 🔍 Firebase Database Schema

### `parking_spots/spot_01`
```json
{
  "occupied": true,          // Triggers per-minute charging
  "sensor_id": "pi5_sensor_01",
  "median_cm": 4.9,
  "last_seen": 1764425380
}
```

### `realtime_payments/{session_id}/{payment_number}`
```json
{
  "payment_id": "payment_session_123_1",
  "session_id": "session_123",
  "payment_number": 1,
  "amount_lovelace": 200000,
  "amount_ada": 0.2,
  "tx_hash": "a1b2c3d4e5f6...",
  "agent": "payment_verifier",
  "status": "confirmed",
  "timestamp": "2025-11-29T12:34:56Z",
  "explorer_url": "https://preprod.cardanoscan.io/transaction/..."
}
```

### `blockchain_transactions/{session_id}`
```json
{
  "session_id": "session_123",
  "total_sent_ada": 8.95,
  "successful_payments": 7,
  "failed_payments": 0,
  "timestamp": "2025-11-29T12:34:56Z",
  "transactions": [
    {
      "success": true,
      "tx_hash": "x9y8z7w6v5u4...",
      "agent_name": "orchestrator",
      "amount_lovelace": 1500000,
      "timestamp": "2025-11-29T12:34:56Z"
    },
    // ... 6 more agent payments
  ]
}
```

### `active_sessions/{session_id}`
```json
{
  "session_id": "session_123",
  "spot_id": "spot_01",
  "vehicle_id": "TS09EA1234",
  "start_time": 1764425380,
  "total_charged_lovelace": 600000,
  "payment_count": 3,
  "last_payment_tx": "a1b2c3d4e5f6...",
  "last_payment_time": 1764425500
}
```

---

## 🎯 Expected Results

### After 3 Minutes:
- **10 Total Transactions** (7 agent + 3 user)
- **Agent Payments**: 8.95 ADA distributed
- **User Payments**: 0.6 ADA charged (3 × 0.2 ADA)
- **Total Value**: 9.55 ADA transferred on blockchain

### Terminal Output:
```
💰 USER → OWNER PAYMENTS: 3
   Total: 0.6 ADA

🎯 OWNER → AGENT PAYMENTS: 7
   Total: 8.95 ADA

🔗 TOTAL TRANSACTIONS: 10
💵 TOTAL VALUE: 9.55 ADA
```

---

## 🛠️ Troubleshooting

### No Transactions Appearing?

**1. Check Firebase Connection**
```bash
# Verify credentials exist
ls -la secrets/parkngo-firebase-adminsdk.json

# Check .env file
cat .env | grep FIREBASE
```

**2. Verify Cardano Wallets**
```bash
# Check wallet file
ls -la CARDANO_WALLETS_PREPROD.json

# Verify customer wallet has funds
python3 -c "from services.cardano_payment_service import cardano_payment_service; print(f'Balance: {cardano_payment_service.get_customer_balance()} ADA')"
```

**3. Check Services Running**
```bash
ps aux | grep realtime_payment_monitor
ps aux | grep firebase_listener
```

**4. View Logs**
```bash
tail -f /tmp/parkngo_payment_monitor_*.log
tail -f /tmp/parkngo_firebase_listener_*.log
```

### Transactions Not Confirming?

- **Network**: Cardano Preprod testnet may have delays
- **Funds**: Ensure customer wallet has sufficient ADA
- **Blockfrost**: Check API key is valid (`BLOCKFROST_PROJECT_ID`)

---

## 📝 Manual Firebase Testing

### Set Occupied via Firebase Console:
1. Go to: https://console.firebase.google.com
2. Navigate to **Realtime Database**
3. Find: `parking_spots/spot_01/occupied`
4. Change value: `false` → `true`
5. Watch terminal for transaction hashes

### Via Python:
```python
python3 << 'EOF'
import firebase_admin
from firebase_admin import credentials, db
import os
from dotenv import load_dotenv

load_dotenv()
cred = credentials.Certificate('secrets/parkngo-firebase-adminsdk.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': os.getenv('FIREBASE_DATABASE_URL')
})

# Trigger parking
db.reference('parking_spots/spot_01').update({'occupied': True})
print("✅ Parking triggered!")
EOF
```

---

## 🔐 Security Notes

- All transactions on **Cardano Preprod Testnet**
- Customer wallet private key loaded from `CARDANO_WALLETS_PREPROD.json`
- Transaction hashes displayed in **terminal only** (not in UI for production)
- Real blockchain confirmations via Blockfrost API

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `realtime_payment_monitor.py` | Watches spot occupancy, charges per minute |
| `firebase_listener.py` | Triggers agent payments on vehicle entry |
| `services/cardano_payment_service.py` | Executes blockchain transactions |
| `frontend/src/components/ActiveParkingSession.js` | UI for live charging view |

---

## ✅ Verification Checklist

- [ ] Firebase credentials present
- [ ] Cardano wallet file exists
- [ ] Customer wallet has funds (check balance)
- [ ] Blockfrost API key configured
- [ ] Python dependencies installed
- [ ] Services start without errors
- [ ] Firebase `occupied` state changes
- [ ] Agent payments execute (7 TX hashes)
- [ ] Per-minute charging starts (0.2 ADA/min)
- [ ] All TX hashes displayed in terminal
- [ ] Transactions visible on CardanoScan

---

## 🎉 Success Indicators

You'll know it's working when you see:

```
✅ Services started
✅ Parking event triggered
┌────────────────────────────────────────────┐
│ 🎯 OWNER → AGENT PAYMENT                   │
├────────────────────────────────────────────┤
│ Agent:   Orchestrator Agent                │
│ Amount:  1.5 ADA                           │
│ TX Hash: a1b2c3d4e5f6...                   │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ 💰 USER → OWNER PAYMENT #1                 │
├────────────────────────────────────────────┤
│ Amount:  0.2 ADA                           │
│ TX Hash: x9y8z7w6v5u4...                   │
└────────────────────────────────────────────┘
```

**All transaction hashes are real and verifiable on Cardano blockchain!** 🚀
