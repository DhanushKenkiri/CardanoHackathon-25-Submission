# 🧪 ParknGo - Complete Testing Guide

> Comprehensive testing procedures for Cardano AI Hackathon 2025 submission

---

## 📋 Table of Contents

- [Pre-Testing Setup](#pre-testing-setup)
- [Quick Verification Tests](#quick-verification-tests)
- [Detailed Feature Tests](#detailed-feature-tests)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Pre-Testing Setup

### 1. Verify All Services Running

```bash
# Check Docker containers
docker ps

# Expected 6 containers:
✅ parkngo-api                 (Port 5000)
✅ masumi-registry-service     (Port 3000)
✅ masumi-payment-service      (Port 3001)
✅ masumi-postgres-registry    (Port 5432)
✅ masumi-postgres-payment     (Port 5433)
✅ parkngo-payment-monitor     (background)
```

### 2. Health Checks

```bash
# Backend API health
curl http://localhost:5000/api/health

# Masumi Registry health
curl http://localhost:3000/api/v1/health

# Masumi Payment health
curl http://localhost:3001/api/v1/health
```

### 3. Frontend Verification

```bash
# Open dashboard
open http://localhost:8080

# Or navigate manually in browser
```

---

## ⚡ Quick Verification Tests (5 minutes)

### Test 1: System Health Check ✅

**Time:** 1 minute

```bash
# Run health check script
curl -s http://localhost:5000/api/health | jq .

# Expected output:
{
  "status": "healthy",
  "agents": {
    "orchestrator": "ready",
    "spot_finder": "ready",
    "vehicle_detector": "ready",
    "payment_agent": "ready",
    "pricing_agent": "ready",
    "route_optimizer": "ready",
    "security_guard": "ready",
    "dispute_resolver": "ready"
  },
  "services": {
    "firebase": "connected",
    "gemini": "available",
    "masumi": "connected"
  },
  "timestamp": "2025-11-30T03:40:00Z"
}
```

**Pass Criteria:**
- ✅ Status: "healthy"
- ✅ All 7 agents: "ready"
- ✅ All 3 services: "connected"/"available"

---

### Test 2: Book Slot (Quick Test) ✅

**Time:** 2 minutes

**Steps:**
1. Open `http://localhost:8080`
2. Click "Proof of Concept" button
3. Click "Book Slot" button
4. Watch 3-step orchestration (10-15s)
5. Verify success message

**Pass Criteria:**
- ✅ All 3 steps complete with green checkmarks
- ✅ Total cost shows "0.9 ADA"
- ✅ Payment session created
- ✅ No errors in console

---

### Test 3: Payment Progress Bar ✅

**Time:** 2 minutes

**Steps:**
1. After booking, observe "Live Payment Session"
2. Watch progress bar for 2 minutes
3. Verify ADA amount increases

**Pass Criteria:**
- ✅ Progress bar animates smoothly
- ✅ Minutes increase: 1, 2, 3, 4...
- ✅ ADA increases: 0.02, 0.04, 0.06...
- ✅ Transaction history populates

---

## 🔬 Detailed Feature Tests (30 minutes)

### Test 4: Complete Agent Orchestration Flow

**Time:** 10 minutes

#### 4.1 API Test

```bash
curl -X POST http://localhost:5000/api/parking/book-slot \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_001",
    "vehicle_id": "TEST123",
    "duration_hours": 2.0
  }' | jq .
```

**Expected Response Structure:**
```json
{
  "success": true,
  "orchestration": {
    "step_1_spot_finder": {
      "agent_id": "spot_finder_001",
      "cost_ada": 0.3,
      "execution_time_ms": 1200,
      "result": {
        "spot_id": "spot_01",
        "confidence_score": 95,
        "distance_meters": 50,
        "status": "success"
      },
      "masumi_payment": {
        "tx_hash": "3f8e9d2a...",
        "status": "confirmed"
      }
    },
    "step_2_vehicle_detector": {
      "agent_id": "vehicle_detector_001",
      "cost_ada": 0.2,
      "execution_time_ms": 800,
      "result": {
        "vehicle_detected": true,
        "correct_vehicle": true,
        "plate_number": "TEST123",
        "confidence": 98,
        "status": "success"
      },
      "gate_check": {
        "passed": true,
        "vehicle_detected": true,
        "correct_vehicle": true
      },
      "masumi_payment": {
        "tx_hash": "7b4c1d9e...",
        "status": "confirmed"
      }
    },
    "step_3_payment_agent": {
      "agent_id": "payment_agent_001",
      "cost_ada": 0.4,
      "execution_time_ms": 500,
      "result": {
        "session_id": "ps_test_001_1701337200",
        "rate_per_minute": 0.02,
        "duration_minutes": 120,
        "total_estimated_cost": 2.4,
        "status": "active"
      },
      "masumi_payment": {
        "tx_hash": "2e5f6a1c...",
        "status": "confirmed"
      }
    }
  },
  "summary": {
    "total_agent_cost_ada": 0.9,
    "total_execution_time_ms": 2500,
    "all_steps_success": true,
    "gate_check_passed": true
  },
  "payment_session": {
    "session_id": "ps_test_001_1701337200",
    "firebase_path": "payment_sessions/ps_test_001_1701337200"
  },
  "blockchain": {
    "total_tx_count": 3,
    "total_ada_sent": 0.9,
    "cardanoscan_urls": [
      "https://preprod.cardanoscan.io/transaction/3f8e9d2a...",
      "https://preprod.cardanoscan.io/transaction/7b4c1d9e...",
      "https://preprod.cardanoscan.io/transaction/2e5f6a1c..."
    ]
  }
}
```

#### 4.2 UI Test

**Steps:**
1. Open dashboard → Click "Book Slot"
2. **Step 1: SpotFinder (0.3₳)**
   - Status changes: pending → processing → success
   - Time: 2-3 seconds
   - Verify: Green checkmark appears
   - Verify: Cost shows "0.3 ADA"
3. **Step 2: VehicleDetector (0.2₳)**
   - Status changes: pending → processing → success
   - Time: 2-3 seconds
   - Verify: Green checkmark appears
   - Verify: Cost shows "0.2 ADA"
   - Verify: Gate check details shown
4. **Step 3: PaymentAgent (0.4₳)**
   - Status changes: pending → processing → success
   - Time: 1-2 seconds
   - Verify: Green checkmark appears
   - Verify: Cost shows "0.4 ADA"
   - Verify: Session ID displayed

**Pass Criteria:**
- ✅ All 3 steps complete in 10-15 seconds
- ✅ No step shows "failed" status
- ✅ Total cost accurately displays "0.9 ADA"
- ✅ Payment session created in Firebase
- ✅ All 3 Cardano TXs submitted
- ✅ No console errors

#### 4.3 Gate Check Test (Negative Case)

Test when vehicle is NOT detected:

```bash
# Manually set vehicle_detected = false in Firebase
# Then try booking

# Expected: Step 2 should fail gate check
# Expected: Step 3 should NOT execute
# Expected: Error message shown to user
```

**Pass Criteria:**
- ✅ Orchestration stops at Step 2
- ✅ Error message: "Gate check failed"
- ✅ No payment session created
- ✅ User charged only 0.5₳ (Step 1 + Step 2)

---

### Test 5: Real-Time Payment Tracking

**Time:** 5 minutes

#### 5.1 API Polling Test

```bash
# Get session immediately after creation
curl http://localhost:5000/api/payment-session/ps_test_001_1701337200

# Wait 30 seconds, query again
sleep 30
curl http://localhost:5000/api/payment-session/ps_test_001_1701337200

# Wait 60 seconds, query again
sleep 60
curl http://localhost:5000/api/payment-session/ps_test_001_1701337200
```

**Expected Evolution:**

**Time 0s:**
```json
{
  "session_id": "ps_test_001_1701337200",
  "minutes_elapsed": 0,
  "total_deducted_ada": 0.0,
  "rate_per_minute": 0.02,
  "progress_percentage": 0.0,
  "status": "active"
}
```

**Time 30s:**
```json
{
  "minutes_elapsed": 1,
  "total_deducted_ada": 0.02,
  "progress_percentage": 0.83
}
```

**Time 90s:**
```json
{
  "minutes_elapsed": 2,
  "total_deducted_ada": 0.04,
  "progress_percentage": 1.67
}
```

#### 5.2 UI Polling Test

**Steps:**
1. After booking, keep orchestration modal open
2. Observe "Live Payment Session" section
3. Watch for 3-5 minutes
4. Record observations:
   - Progress bar movement
   - Minutes elapsed increment
   - ADA amount increase
   - Transaction history growth

**Data to Record:**

| Time | Minutes | Total ADA | Progress % | TX Count |
|------|---------|-----------|------------|----------|
| 0s   | 0       | 0.00      | 0.00%      | 0        |
| 30s  | 1       | 0.02      | 0.83%      | 1        |
| 60s  | 2       | 0.04      | 1.67%      | 2        |
| 90s  | 3       | 0.06      | 2.50%      | 3        |
| 120s | 4       | 0.08      | 3.33%      | 4        |
| 150s | 5       | 0.10      | 4.17%      | 5        |

**Pass Criteria:**
- ✅ Updates every 2 seconds (max)
- ✅ Minutes increment correctly
- ✅ ADA calculation: minutes × 0.02
- ✅ Progress %: (minutes / 120) × 100
- ✅ Transaction history grows
- ✅ No missed updates (no gaps)

#### 5.3 CardanoScan Verification

**Steps:**
1. Click any transaction hash in history
2. Verify CardanoScan opens in new tab
3. Check transaction details:
   - Transaction hash matches
   - Amount is 0.02₳ (or fee included)
   - Status: "Success"
   - Block confirmed

**Pass Criteria:**
- ✅ Link opens CardanoScan Preprod
- ✅ Transaction found on blockchain
- ✅ All details match session data
- ✅ No broken links

---

### Test 6: Transaction History

**Time:** 5 minutes

#### 6.1 Booking History Test

```bash
curl http://localhost:5000/api/bookings/history/test_user_001 | jq .
```

**Expected Response:**
```json
[
  {
    "booking_id": "bk_test_001",
    "user_id": "test_user_001",
    "spot_id": "spot_01",
    "vehicle_id": "TEST123",
    "start_time": "2025-11-30T03:40:00Z",
    "end_time": null,
    "duration_hours": 2.0,
    "total_cost_ada": 2.4,
    "agent_fees_ada": 0.9,
    "status": "active",
    "payment_session_id": "ps_test_001_1701337200"
  }
]
```

#### 6.2 Transaction History Test

```bash
curl http://localhost:5000/api/transactions/history/test_user_001 | jq .
```

**Expected Response:**
```json
[
  {
    "transaction_id": "tx_001",
    "booking_id": "bk_test_001",
    "amount_ada": 0.3,
    "agent": "SpotFinder",
    "tx_hash": "3f8e9d2a...",
    "timestamp": "2025-11-30T03:40:00Z",
    "status": "confirmed",
    "cardanoscan_url": "https://preprod.cardanoscan.io/transaction/3f8e9d2a..."
  },
  {
    "transaction_id": "tx_002",
    "amount_ada": 0.2,
    "agent": "VehicleDetector",
    "tx_hash": "7b4c1d9e...",
    "status": "confirmed"
  },
  ...
]
```

#### 6.3 Payment Sessions History

```bash
curl http://localhost:5000/api/payment-sessions/history/test_user_001 | jq .
```

#### 6.4 UI History Test

**Steps:**
1. Navigate to "History" tab
2. **Test Bookings Sub-Tab:**
   - Verify booking appears
   - Check spot ID, vehicle ID, times
   - Verify status badge color
   - Check summary stats at top
3. **Test Transactions Sub-Tab:**
   - Verify all 3 agent payments listed
   - Check amounts: 0.3, 0.2, 0.4
   - Verify TX hashes present
   - Test CardanoScan links
4. **Test Payment Sessions Sub-Tab:**
   - Verify session details
   - Check minutes elapsed
   - Verify total deducted amount
   - Check rate per minute

**Pass Criteria:**
- ✅ All 3 tabs load without errors
- ✅ Summary stats accurate:
  - Total Bookings: 1+
  - Total Transactions: 3+
  - Total ADA Spent: 0.9+
- ✅ All data displays correctly
- ✅ Status badges colored properly
- ✅ CardanoScan links work

---

### Test 7: Dispute Resolution

**Time:** 10 minutes

#### 7.1 Create Dispute Test

```bash
curl -X POST http://localhost:5000/api/disputes/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_001",
    "booking_id": "bk_test_001",
    "issue_description": "System charged me for time I did not use. I parked for only 1 hour but was charged for 2 hours.",
    "requested_refund_ada": 1.2
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "dispute_id": "dispute_test_12345",
  "status": "investigating",
  "created_at": "2025-11-30T03:45:00Z",
  "staking_required": {
    "user": 1.0,
    "owner": 1.0,
    "total_pot": 2.0
  },
  "ai_arbitration_fee": 0.5,
  "next_steps": [
    "User must stake 1.0 ADA",
    "Owner must stake 1.0 ADA",
    "AI will analyze evidence",
    "Winner receives 2.0 ADA"
  ]
}
```

#### 7.2 Add Messages Test

```bash
# User message
curl -X POST http://localhost:5000/api/disputes/dispute_test_12345/messages \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "user",
    "message": "I have screenshots showing I left after 1 hour"
  }'

# AI response
# (Automatically generated by DisputeResolver agent)
```

#### 7.3 Staking Test

```bash
# User stakes 1.0 ADA
curl -X POST http://localhost:5000/api/disputes/dispute_test_12345/stake \
  -H "Content-Type: application/json" \
  -d '{
    "party": "user",
    "amount_ada": 1.0,
    "wallet_address": "addr_test1..."
  }'

# Owner stakes 1.0 ADA (simulated after 3 seconds)
```

#### 7.4 Resolution Test

```bash
curl -X POST http://localhost:5000/api/disputes/dispute_test_12345/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "user_stake_confirmed": true,
    "owner_stake_confirmed": true
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "dispute_id": "dispute_test_12345",
  "status": "resolved",
  "resolution": {
    "winner": "user",
    "confidence_score": 85,
    "reasoning": "AI analysis of payment logs shows: 1) User's payment session ended at 4:40 PM (1 hour after start), 2) System error caused double charging, 3) Firebase timestamps confirm user's claim, 4) No evidence of actual 2-hour parking. Verdict: System error, user entitled to refund.",
    "evidence_analyzed": [
      "firebase_payment_logs",
      "sensor_data_timestamps",
      "cardano_transaction_history",
      "user_provided_screenshots"
    ]
  },
  "payout": {
    "winner": "user",
    "amount_ada": 2.0,
    "loser": "owner",
    "ai_fee_ada": 0.5,
    "tx_hash": "9e3f2a7c..."
  },
  "cardanoscan_url": "https://preprod.cardanoscan.io/transaction/9e3f2a7c..."
}
```

#### 7.5 UI Dispute Test

**Steps:**
1. Navigate to "Disputes" tab
2. Click "Raise a Ticket" button
3. **Chat Interface Test:**
   - Type: "I was overcharged by 1.2 ADA"
   - Press Enter or click Send
   - Verify message appears (user side, right)
   - Wait 2-3 seconds for AI response
   - Verify AI response (bot side, left)
4. **Staking Test:**
   - Click "Stake 1.0 ADA" button (user card)
   - Verify user stake card turns green
   - Wait 3 seconds for owner stake
   - Verify owner stake card turns green
   - Verify total pot shows "2.0 ADA"
5. **Resolution Test:**
   - Click "Resolve Dispute" button
   - Wait 5 seconds for AI analysis
   - Verify winner announcement appears:
     - Winner name (User/Owner)
     - Large confidence % (e.g., "85%")
     - Detailed reasoning paragraph
     - Evidence list
     - Payout details
6. **Verification:**
   - Click CardanoScan link
   - Verify 2.0₳ payout transaction

**Pass Criteria:**
- ✅ Chat works smoothly (no lag)
- ✅ Messages appear in correct order
- ✅ AI responses relevant and helpful
- ✅ Staking UI updates in real-time
- ✅ Both stakes confirmed (green)
- ✅ Total pot calculation correct
- ✅ AI analysis completes in 3-7s
- ✅ Winner determined fairly
- ✅ Confidence score shown (0-100)
- ✅ Reasoning is detailed and clear
- ✅ Evidence list makes sense
- ✅ Payout transaction on blockchain
- ✅ No errors or crashes

---

## 🎯 Performance Testing

### Test 8: Load Testing (10 concurrent bookings)

```bash
# Install Apache Bench (if not installed)
brew install httpd  # Mac
# or
sudo apt-get install apache2-utils  # Linux

# Run load test
ab -n 10 -c 10 -T application/json -p booking.json \
  http://localhost:5000/api/parking/book-slot

# booking.json:
# {"user_id":"load_test_001","vehicle_id":"LOAD123","duration_hours":2.0}
```

**Expected Results:**
```
Concurrency Level:      10
Time per request:       12500 ms (mean)
Requests per second:    0.8 [#/sec]
Failed requests:        0
```

**Pass Criteria:**
- ✅ All 10 requests succeed
- ✅ Average response time < 15s
- ✅ No failed requests
- ✅ No server errors

### Test 9: API Response Time Benchmarks

```bash
# Benchmark script
for i in {1..10}; do
  echo "Test $i:"
  time curl -s http://localhost:5000/api/health > /dev/null
done
```

**Target Response Times:**
| Endpoint | Target | Acceptable |
|----------|--------|------------|
| /api/health | < 100ms | < 200ms |
| /api/parking/spots | < 200ms | < 500ms |
| /api/parking/book-slot | < 15s | < 20s |
| /api/payment-session/{id} | < 200ms | < 500ms |
| /api/disputes/create | < 1s | < 2s |
| /api/disputes/{id}/resolve | < 7s | < 10s |

---

## 🔒 Security Testing

### Test 10: Input Validation

**Test malformed requests:**

```bash
# Missing required fields
curl -X POST http://localhost:5000/api/parking/book-slot \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 Bad Request

# Invalid data types
curl -X POST http://localhost:5000/api/parking/book-slot \
  -H "Content-Type: application/json" \
  -d '{"user_id":123,"vehicle_id":null,"duration_hours":"invalid"}'

# Expected: 400 Bad Request with validation errors

# SQL Injection attempt
curl -X POST http://localhost:5000/api/parking/book-slot \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user\'; DROP TABLE users;--","vehicle_id":"TEST","duration_hours":2}'

# Expected: Input sanitized, no SQL injection
```

### Test 11: Rate Limiting

```bash
# Rapid fire 100 requests
for i in {1..100}; do
  curl -s http://localhost:5000/api/health &
done
wait

# Expected: Some requests return 429 Too Many Requests
```

---

## 🐛 Troubleshooting

### Issue 1: Containers Not Running

**Symptom:** `docker ps` shows missing containers

**Solution:**
```bash
cd /Users/dsrk/Downloads/masumi
docker compose down
docker compose up -d --build
docker ps
```

### Issue 2: Frontend Not Loading

**Symptom:** localhost:8080 shows connection refused

**Solution:**
```bash
cd hackathon-main
npm install
npm run dev
```

### Issue 3: API Returns "Gemini Not Available"

**Symptom:** Agents fail with Gemini errors

**Solution:**
```bash
# Check .env file has valid key
cat .env | grep GEMINI_API_KEY

# Test key manually
curl -X POST https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=YOUR_KEY \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Issue 4: Masumi Services Unreachable

**Symptom:** 404 errors on agent registration

**Solution:**
```bash
# Restart Masumi services
docker restart masumi-registry-service
docker restart masumi-payment-service

# Check logs
docker logs masumi-registry-service
docker logs masumi-payment-service
```

### Issue 5: Firebase Connection Error

**Symptom:** "Firebase not connected" in health check

**Solution:**
```bash
# Verify credentials file exists
ls -la secrets/parkngo-firebase-adminsdk.json

# Check .env has correct URL
cat .env | grep FIREBASE_DATABASE_URL

# Test connection
curl -X GET https://parkngo-ai-default-rtdb.asia-southeast1.firebasedatabase.app/.json
```

---

## ✅ Testing Checklist

### Pre-Deployment Tests
- [ ] All Docker containers running
- [ ] Health checks pass (3/3)
- [ ] Frontend loads without errors
- [ ] API responds to test requests

### Core Feature Tests
- [ ] Book Slot orchestration (3 agents)
- [ ] Real-time payment progress (2-minute test)
- [ ] Transaction history (3 tabs)
- [ ] Dispute resolution (full flow)
- [ ] Wallet balance display

### Integration Tests
- [ ] Masumi payment distribution
- [ ] Cardano blockchain verification
- [ ] CardanoScan links work
- [ ] Firebase real-time updates

### Performance Tests
- [ ] Response times within targets
- [ ] Load test (10 concurrent users)
- [ ] No memory leaks (monitor for 10min)

### Security Tests
- [ ] Input validation works
- [ ] No SQL injection vulnerability
- [ ] Rate limiting active
- [ ] API keys secured

### User Experience Tests
- [ ] UI loads in < 2s
- [ ] Animations smooth (60fps)
- [ ] No console errors
- [ ] Mobile responsive (optional)

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Environment
- OS: macOS / Linux / Windows
- Docker Version: X.X.X
- Node Version: X.X.X
- Python Version: X.X.X

### Quick Tests (5 min)
- [ ] System Health: PASS/FAIL
- [ ] Book Slot: PASS/FAIL
- [ ] Payment Progress: PASS/FAIL

### Feature Tests (30 min)
- [ ] Agent Orchestration: PASS/FAIL
- [ ] Payment Tracking: PASS/FAIL
- [ ] Transaction History: PASS/FAIL
- [ ] Dispute Resolution: PASS/FAIL

### Performance Tests
- Average API Response: XXX ms
- Orchestration Time: XX.X s
- Load Test Success Rate: XX%

### Issues Found
1. [Description]
   - Severity: Low/Medium/High
   - Steps to Reproduce:
   - Expected vs Actual:

### Overall Result
✅ PASS / ❌ FAIL

### Notes
[Additional observations]
```

---

**Testing completed? Ready for hackathon submission! 🚀**
