# 🎯 Quick Reference - ParknGo Theater Layout

## 🚀 Start the App
```bash
cd /Users/dsrk/Downloads/masumi/hackathon-main
npm run dev
# Open: http://localhost:8080
```

## 🎬 Theater-Style Parking Grid

### Layout Overview
```
        🚗 ENTRANCE
        ═══════════
           ↓
    VIP (6) - V01 is REAL ✅
    EV (4) - Mock mix
    2-Wheeler (20) - Mock mix  
    Regular A (10) - Mock mix
    Regular B (10) - All mock
    Regular C (10) - Mock mix
```

### Color Guide
- 🟢 **Green** = Available (can click if real)
- 🔵 **Blue Ring** = Selected
- 🔴 **Red** = Occupied (disabled)

### Real vs Mock
| Spot | Type | Status | Functional? |
|------|------|--------|-------------|
| **V01** | VIP | Available | ✅ YES - Real Firebase + Cardano |
| V02-V06 | VIP | Occupied | ❌ Mock decoration |
| E01-E04 | EV | Mixed | ❌ Mock decoration |
| B01-B20 | 2-Wheeler | Mixed | ❌ Mock decoration |
| A01-A10 | Regular | Mixed | ❌ Mock decoration |
| B01-B10 | Regular | All Occupied | ❌ Mock decoration |
| C01-C10 | Regular | Mixed | ❌ Mock decoration |

**Total: 1 Real Spot (V01), 60+ Mock Spots**

## 🔑 Blockfrost API Key
```
preprodjS5RhT8YJhKZAPETX88FyGQGU6a9wJBa
```

## 👛 Wallet Integration

### Customer Wallet
```
addr_test1vrjtn62vuzckgnw8fff7t246lq34633h4qkc8npvf5fzvrskjj36g
```

### Balance Display
- **Location**: Sidebar top card
- **Updates**: Every 10 seconds
- **Network**: ADA-Preprod
- **Fallback**: Direct Blockfrost if backend down

## 📱 Sidebar Tabs

1. **Parking Overview** 
   - Theater-style grid
   - Stats cards (1 available, 0 occupied, 1 total)
   - Click V01 to book

2. **My Booking**
   - Shows selected spot
   - Start/End parking buttons
   - Real-time cost meter

3. **Transaction History**
   - Last 5 Cardano TXs
   - Links to CardanoScan
   - Amount + timestamp

4. **Dispute Management**
   - AI-powered resolution
   - (No active disputes)

## 🎮 User Flow

### Step 1: Landing Page
```
http://localhost:8080/
↓ Click big purple button
"Book Best Spot Now"
```

### Step 2: Select Spot
```
Dashboard → Overview Tab
↓ Click V01 (VIP section)
Only clickable spot
```

### Step 3: AI Reservation
```
7 AI Agents execute
↓ Real ₳1.2 payment
"Spot V01 reserved! 7 AI agents used"
```

### Step 4: Start Parking
```
My Booking Tab
↓ Click "Start Parking"
Real blockchain TX
Cost meter starts
```

### Step 5: End Parking
```
Click "End Parking"
↓ Final payment based on time
TX hash displayed
Wallet balance updated
```

## 🎨 Visual Features

### Entrance Indicator
```css
🚗 ENTRANCE
Main Entry Gate
```
Blue gradient bar at top (like movie screen)

### Section Headers
- 🌟 **VIP** (Yellow dot)
- ⚡ **EV** (Green dot)
- 🏍️ **2-Wheeler** (Cyan dot)
- 🚗 **Regular** (Blue dot)

### Hover Effects
- Scale up 1.05x
- Cursor changes to pointer
- Border brightens

### Selection State
- Blue ring appears
- Background brightens
- Stays highlighted

## 🔧 Troubleshooting

### Wallet Balance Error?
1. Check `.env` has Blockfrost key
2. Wait 10 seconds for retry
3. Check browser console
4. Backend optional (fallback works)

### Can't Click Spots?
- ✅ Only V01 is clickable
- ❌ Others are disabled decoration
- Refresh if V01 not responding

### Backend Down?
- Frontend still works
- Wallet balance loads via Blockfrost
- Booking requires backend running

## 📊 Stats Explained

**Available Spots: 1**
- Only V01 counts (real)
- Mock spots excluded

**Occupied Spots: 0**  
- Real spots only
- Mock don't count

**Total Capacity: 1**
- Firebase spot count
- V01 = spot_01

## 🎯 Files Changed

```
hackathon-main/
├── .env (Blockfrost key)
├── src/pages/Dashboard.tsx (Theater layout)
├── src/services/walletService.ts (Smart fallback)
└── src/services/blockfrostService.ts (Direct API)

masumi/
└── .env (Blockfrost key)
```

## ✅ Success Checklist

- [x] Theater-style grid layout
- [x] VIP, EV, 2-Wheeler, Regular sections
- [x] Entrance indicator
- [x] V01 real + functional
- [x] 60+ mock decoration slots
- [x] Color-coded availability
- [x] Hover animations
- [x] Selection highlighting
- [x] Wallet balance with fallback
- [x] New Blockfrost API key
- [x] Sidebar navigation
- [x] Real-time updates
- [x] Transaction history
- [x] CardanoScan links

## 🎉 You're All Set!

**Refresh browser → See theater layout → Click V01 → Watch magic happen! 🚀**
