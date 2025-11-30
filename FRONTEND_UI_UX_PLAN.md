# ParknGo Frontend UI/UX Enhancement Plan

**Date:** November 29, 2025  
**Framework:** React 18.2 + React Router 6  
**Current Status:** Basic Dashboard with Map  
**Target:** Full-featured User-facing Parking Application

---

## 📊 CURRENT FRONTEND ANALYSIS

### ✅ **What's Already Built**

#### Structure
```
frontend/
├── src/
│   ├── App.js (Router, Auth)
│   ├── components/
│   │   ├── Login.js (Owner portal)
│   │   ├── Dashboard.js (Admin view)
│   │   └── ParkingMap.js (Leaflet integration)
│   └── styles/
│       ├── App.css
│       ├── Dashboard.css
│       ├── Login.css
│       └── ParkingMap.css
```

#### Current Features
- ✅ **Login System** - Owner authentication (`owner@ambmall`)
- ✅ **Dashboard View** - Stats cards, agent earnings, wallet info
- ✅ **Live Map** - Leaflet.js with OpenStreetMap
- ✅ **Real-time Updates** - 5-second polling intervals
- ✅ **Blockchain Integration** - Transaction display
- ✅ **Responsive Grid** - Auto-fit layouts
- ✅ **Gradient Design** - Purple gradient theme

#### Current Dependencies
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1"
}
```

---

## 🎯 **NEW VISION: Dual-Mode Application**

### **MODE 1: Customer App** (Public-facing)
- Connect Cardano wallet
- Find parking spots
- Make payments
- Track active parking
- View history

### **MODE 2: Owner Dashboard** (Admin)
- Current dashboard (keep existing)
- Agent earnings monitoring
- System analytics
- Manual operations

---

## 🚀 **PHASE 1: CARDANO WALLET INTEGRATION**

### Task 1.1: Install Wallet Libraries
**Priority:** CRITICAL  
**Files:** `package.json`

```bash
npm install @meshsdk/core @meshsdk/react
npm install @cardano-foundation/cardano-connect-with-wallet
npm install lucid-cardano
```

**Purpose:**
- `@meshsdk/core` - Build Cardano transactions
- `@meshsdk/react` - React hooks for wallet
- `lucid-cardano` - Alternative lightweight library

---

### Task 1.2: Create Wallet Context
**Priority:** CRITICAL  
**New File:** `src/contexts/WalletContext.js`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserWallet } from '@meshsdk/core';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Detect available wallets
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    detectWallets();
    checkPreviousConnection();
  }, []);

  const detectWallets = async () => {
    const wallets = await BrowserWallet.getInstalledWallets();
    setAvailableWallets(wallets);
  };

  const checkPreviousConnection = async () => {
    const savedWallet = localStorage.getItem('connected_wallet');
    if (savedWallet) {
      await connectWallet(savedWallet);
    }
  };

  const connectWallet = async (walletName) => {
    setLoading(true);
    try {
      const wallet = await BrowserWallet.enable(walletName);
      const addresses = await wallet.getUsedAddresses();
      const address = addresses[0];
      const balanceValue = await wallet.getBalance();

      setWallet(wallet);
      setAddress(address);
      setBalance(balanceValue);
      setConnected(true);

      localStorage.setItem('connected_wallet', walletName);
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setConnected(false);
    setAddress('');
    setBalance(0);
    localStorage.removeItem('connected_wallet');
  };

  return (
    <WalletContext.Provider value={{
      wallet,
      connected,
      address,
      balance,
      loading,
      availableWallets,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
```

---

### Task 1.3: Create WalletConnect Component
**Priority:** CRITICAL  
**New File:** `src/components/WalletConnect.js`

```javascript
import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import './WalletConnect.css';

function WalletConnect() {
  const { connected, address, balance, availableWallets, connectWallet, disconnectWallet, loading } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async (walletName) => {
    await connectWallet(walletName);
    setShowModal(false);
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
  };

  const formatBalance = (bal) => {
    return (bal / 1000000).toFixed(2); // Lovelace to ADA
  };

  if (connected) {
    return (
      <div className="wallet-connected">
        <div className="wallet-badge">
          <i className="fas fa-wallet"></i>
          <div>
            <div className="wallet-address">{formatAddress(address)}</div>
            <div className="wallet-balance">{formatBalance(balance)} ADA</div>
          </div>
        </div>
        <button className="disconnect-btn" onClick={disconnectWallet}>
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    );
  }

  return (
    <>
      <button className="connect-wallet-btn" onClick={() => setShowModal(true)}>
        <i className="fas fa-wallet"></i>
        Connect Wallet
      </button>

      {showModal && (
        <div className="wallet-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect Your Wallet</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="wallet-list">
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.name}
                  className="wallet-option"
                  onClick={() => handleConnect(wallet.name)}
                  disabled={loading}
                >
                  <img src={wallet.icon} alt={wallet.name} />
                  <span>{wallet.name}</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              ))}

              {availableWallets.length === 0 && (
                <div className="no-wallets">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>No Cardano wallets detected</p>
                  <a href="https://namiwallet.io" target="_blank" rel="noopener noreferrer">
                    Install Nami Wallet
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WalletConnect;
```

**CSS:** `src/components/WalletConnect.css`
```css
.connect-wallet-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
}

.connect-wallet-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.wallet-connected {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wallet-badge {
  background: white;
  padding: 10px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.wallet-address {
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  color: #1a202c;
}

.wallet-balance {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
}

.disconnect-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.disconnect-btn:hover {
  background: #ef4444;
  color: white;
}

.wallet-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.wallet-modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #1a202c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #1a202c;
}

.wallet-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallet-option {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.wallet-option:hover {
  border-color: #667eea;
  background: #f7fafc;
  transform: translateX(5px);
}

.wallet-option img {
  width: 40px;
  height: 40px;
}

.wallet-option span {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
}

.no-wallets {
  text-align: center;
  padding: 40px 20px;
}

.no-wallets i {
  font-size: 3rem;
  color: #f6ad55;
  margin-bottom: 15px;
}

.no-wallets p {
  color: #718096;
  margin-bottom: 15px;
}

.no-wallets a {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
}

.no-wallets a:hover {
  background: #5568d3;
}
```

---

## 🎨 **PHASE 2: NEW USER INTERFACE PAGES**

### Task 2.1: Create Home/Landing Page
**Priority:** HIGH  
**New File:** `src/pages/Home.js`

```javascript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import WalletConnect from '../components/WalletConnect';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { connected } = useWallet();

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">
          <i className="fas fa-parking"></i>
          <span>ParknGo</span>
        </div>
        <WalletConnect />
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Smart Parking, Powered by AI</h1>
          <p>Find, book, and pay for parking spots using blockchain technology</p>
          
          <div className="hero-actions">
            <button 
              className="primary-btn" 
              onClick={() => navigate(connected ? '/find-parking' : '/connect')}
            >
              <i className="fas fa-search"></i>
              Find Parking Spot
            </button>
            
            <button 
              className="secondary-btn" 
              onClick={() => navigate('/check-availability')}
            >
              <i className="fas fa-map-marked-alt"></i>
              Check Availability (Free)
            </button>
          </div>
        </div>

        <div className="hero-features">
          <div className="feature-card">
            <i className="fas fa-robot"></i>
            <h3>AI-Powered</h3>
            <p>7 specialized agents find the best spot for you</p>
          </div>
          
          <div className="feature-card">
            <i className="fas fa-coins"></i>
            <h3>Dynamic Pricing</h3>
            <p>Fair prices based on real-time demand</p>
          </div>
          
          <div className="feature-card">
            <i className="fas fa-link"></i>
            <h3>Blockchain Secure</h3>
            <p>Payments secured on Cardano network</p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">5+</div>
          <div className="stat-label">Available Spots</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">7</div>
          <div className="stat-label">AI Agents</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">100%</div>
          <div className="stat-label">Secure</div>
        </div>
      </section>
    </div>
  );
}

export default Home;
```

---

### Task 2.2: Create Check Availability Page (Free Mode)
**Priority:** HIGH  
**New File:** `src/pages/CheckAvailability.js`

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ParkingMap from '../components/ParkingMap';
import './CheckAvailability.css';

function CheckAvailability() {
  const [spots, setSpots] = useState([]);
  const [filters, setFilters] = useState({
    zone: 'all',
    type: 'all',
    features: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSpots();
  }, [filters]);

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.zone !== 'all') params.append('zone', filters.zone);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.features.length > 0) params.append('features', filters.features.join(','));

      const res = await axios.get(`/api/agents/spot-finder/available?${params}`);
      setSpots(res.data.spots || []);
    } catch (error) {
      console.error('Error fetching spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  return (
    <div className="check-availability">
      <div className="page-header">
        <h1>Check Parking Availability</h1>
        <p>Browse available spots without connecting your wallet</p>
      </div>

      <div className="content-layout">
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3>Zone</h3>
            <select value={filters.zone} onChange={(e) => setFilters({...filters, zone: e.target.value})}>
              <option value="all">All Zones</option>
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
              <option value="C">Zone C</option>
            </select>
          </div>

          <div className="filter-section">
            <h3>Type</h3>
            <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
              <option value="all">All Types</option>
              <option value="regular">Regular</option>
              <option value="premium">Premium</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div className="filter-section">
            <h3>Features</h3>
            {['covered', 'ev_charging', 'handicap'].map(feature => (
              <label key={feature} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.features.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                />
                <span>{feature.replace('_', ' ')}</span>
              </label>
            ))}
          </div>

          <button className="apply-filters-btn" onClick={fetchSpots} disabled={loading}>
            {loading ? 'Loading...' : 'Apply Filters'}
          </button>
        </aside>

        <main className="spots-content">
          <div className="map-container">
            <ParkingMap spots={spots} />
          </div>

          <div className="spots-list">
            <h2>Available Spots ({spots.length})</h2>
            <div className="spots-grid">
              {spots.map(spot => (
                <div key={spot.spot_id} className="spot-card">
                  <div className="spot-header">
                    <h3>{spot.spot_id}</h3>
                    <span className="spot-zone">Zone {spot.zone}</span>
                  </div>
                  <div className="spot-details">
                    <div className="detail-row">
                      <i className="fas fa-ruler"></i>
                      <span>{spot.distance_meters}m away</span>
                    </div>
                    <div className="detail-row">
                      <i className="fas fa-star"></i>
                      <span>AI Score: {spot.ai_score}/100</span>
                    </div>
                    <div className="detail-row">
                      <i className="fas fa-money-bill"></i>
                      <span>{spot.estimated_price}</span>
                    </div>
                  </div>
                  <div className="spot-features">
                    {spot.features.map(feature => (
                      <span key={feature} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CheckAvailability;
```

---

### Task 2.3: Create Find Parking Page (Paid Mode)
**Priority:** CRITICAL  
**New File:** `src/pages/FindParking.js`

This page includes:
- Spot selection with AI recommendations
- Price breakdown display
- Payment modal with wallet integration
- Transaction status tracking
- QR code generation for vehicle entry

---

### Task 2.4: Create Active Parking Page
**Priority:** HIGH  
**New File:** `src/pages/ActiveParking.js`

Features:
- Live timer showing parking duration
- Current charges calculation
- Spot location on map
- End parking button
- Overstay warnings

---

### Task 2.5: Create Payment History Page
**Priority:** MEDIUM  
**New File:** `src/pages/PaymentHistory.js`

Shows:
- All past parking sessions
- Payment receipts
- Blockchain transaction links
- Download receipt button

---

## 🔧 **PHASE 3: ENHANCED COMPONENTS**

### Task 3.1: Agent Cards Component
**New File:** `src/components/AgentCards.js`

Interactive cards for each of the 7 agents with "Try Agent" functionality.

### Task 3.2: Price Breakdown Component
**New File:** `src/components/PriceBreakdown.js`

```javascript
function PriceBreakdown({ parkingFee, agentFees, total }) {
  return (
    <div className="price-breakdown">
      <div className="price-row">
        <span>Parking Fee</span>
        <span>{parkingFee} ADA</span>
      </div>
      <div className="price-row">
        <span>Agent Fees (7 agents)</span>
        <span>{agentFees} ADA</span>
      </div>
      <div className="price-divider"></div>
      <div className="price-row total">
        <span>Total</span>
        <span>{total} ADA</span>
      </div>
      <div className="agent-split">
        <small>
          Orchestrator (0.4) + SpotFinder (0.3) + Pricing (0.4) + 
          Route (0.2) + Payment (0.2) + QRScanner (0.3) + VehicleRec (0.2)
        </small>
      </div>
    </div>
  );
}
```

### Task 3.3: Payment Progress Component
**New File:** `src/components/PaymentProgress.js`

Step-by-step progress indicator:
1. Building transaction...
2. Awaiting signature...
3. Submitting to blockchain...
4. Confirming (1/1 blocks)...
5. Payment confirmed ✅
6. Orchestrating agents...
7. Parking activated! 🎉

### Task 3.4: QR Code Display Component
**New File:** `src/components/QRCodeDisplay.js`

```bash
npm install qrcode.react
```

```javascript
import QRCode from 'qrcode.react';

function QRCodeDisplay({ sessionId, spotId, userId }) {
  const qrData = JSON.stringify({
    session_id: sessionId,
    spot_id: spotId,
    user_id: userId,
    timestamp: Date.now()
  });

  return (
    <div className="qr-code-container">
      <h3>Scan this QR code at entry gate</h3>
      <QRCode value={qrData} size={256} />
      <p className="qr-hint">Valid for 10 minutes</p>
    </div>
  );
}
```

---

## 📱 **PHASE 4: MOBILE RESPONSIVENESS**

### Task 4.1: Responsive Breakpoints

```css
/* Mobile First Design */
.container {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
  }
  .content-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### Task 4.2: Mobile Navigation
**New File:** `src/components/MobileNav.js`

Bottom navigation bar for mobile:
- Home
- Find Parking
- Active Session
- History
- Profile

### Task 4.3: Touch Gestures
- Swipe to refresh
- Pull-down to update
- Tap outside modal to close
- Swipe between pages

---

## 🎭 **PHASE 5: ANIMATIONS & MICRO-INTERACTIONS**

### Task 5.1: Install Animation Library
```bash
npm install framer-motion
```

### Task 5.2: Page Transitions
```javascript
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function Page() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {/* Page content */}
    </motion.div>
  );
}
```

### Task 5.3: Loading States
- Skeleton screens for data loading
- Shimmer effect on cards
- Spinner with branded colors
- Progress bars for payments

### Task 5.4: Success Animations
```bash
npm install react-confetti
```

```javascript
import Confetti from 'react-confetti';

function PaymentSuccess() {
  return (
    <div>
      <Confetti numberOfPieces={200} recycle={false} />
      <div className="success-message">
        <i className="fas fa-check-circle"></i>
        <h2>Payment Successful!</h2>
      </div>
    </div>
  );
}
```

---

## 🎨 **DESIGN SYSTEM**

### Colors
```css
:root {
  /* Primary */
  --primary-500: #667eea;
  --primary-600: #5568d3;
  --primary-700: #4c51bf;
  
  /* Secondary */
  --secondary-500: #764ba2;
  --secondary-600: #68409d;
  
  /* Success */
  --success-500: #10b981;
  --success-600: #059669;
  
  /* Warning */
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  
  /* Error */
  --error-500: #ef4444;
  --error-600: #dc2626;
  
  /* Neutral */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-500: #6b7280;
  --gray-700: #374151;
  --gray-900: #111827;
}
```

### Typography
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1 { font-size: 2.5rem; font-weight: 700; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }
p { font-size: 1rem; line-height: 1.6; }
```

### Shadows
```css
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
```

### Border Radius
```css
.rounded-sm { border-radius: 4px; }
.rounded { border-radius: 8px; }
.rounded-md { border-radius: 12px; }
.rounded-lg { border-radius: 16px; }
.rounded-xl { border-radius: 20px; }
.rounded-full { border-radius: 9999px; }
```

---

## 📁 **UPDATED PROJECT STRUCTURE**

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   ├── index.css
│   │
│   ├── contexts/
│   │   ├── WalletContext.js ← NEW
│   │   └── ParkingContext.js ← NEW
│   │
│   ├── pages/
│   │   ├── Home.js ← NEW
│   │   ├── CheckAvailability.js ← NEW
│   │   ├── FindParking.js ← NEW
│   │   ├── ActiveParking.js ← NEW
│   │   ├── PaymentHistory.js ← NEW
│   │   └── OwnerDashboard.js (rename from Dashboard)
│   │
│   ├── components/
│   │   ├── WalletConnect.js ← NEW
│   │   ├── PriceBreakdown.js ← NEW
│   │   ├── PaymentProgress.js ← NEW
│   │   ├── QRCodeDisplay.js ← NEW
│   │   ├── AgentCards.js ← NEW
│   │   ├── ParkingTimer.js ← NEW
│   │   ├── MobileNav.js ← NEW
│   │   ├── ParkingMap.js (existing)
│   │   └── Login.js (existing)
│   │
│   ├── services/
│   │   ├── cardanoService.js ← NEW
│   │   ├── apiService.js ← NEW
│   │   └── paymentService.js ← NEW
│   │
│   ├── hooks/
│   │   ├── useWallet.js ← NEW
│   │   ├── useParking.js ← NEW
│   │   └── usePayment.js ← NEW
│   │
│   └── utils/
│       ├── formatters.js ← NEW
│       └── validators.js ← NEW
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### Week 1: Wallet Integration
- [ ] Install @meshsdk/core and @meshsdk/react
- [ ] Create WalletContext
- [ ] Create WalletConnect component
- [ ] Test wallet connection (Nami, Eternl, Flint)
- [ ] Implement wallet disconnect
- [ ] Add wallet persistence (localStorage)

### Week 2: Core Pages
- [ ] Create Home page
- [ ] Create CheckAvailability page
- [ ] Create FindParking page
- [ ] Create ActiveParking page
- [ ] Update routing in App.js
- [ ] Test navigation flow

### Week 3: Payment Flow
- [ ] Create PaymentModal component
- [ ] Implement transaction building
- [ ] Add payment confirmation
- [ ] Create PaymentProgress component
- [ ] Test end-to-end payment
- [ ] Add error handling

### Week 4: Polish & Mobile
- [ ] Add responsive breakpoints
- [ ] Create MobileNav
- [ ] Add animations (framer-motion)
- [ ] Implement loading states
- [ ] Add success animations
- [ ] Test on mobile devices

### Week 5: Testing & Deployment
- [ ] Cross-browser testing
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Build for production
- [ ] Deploy frontend

---

## 🎯 **SUCCESS METRICS**

- [ ] Wallet connects in < 5 seconds
- [ ] Page load time < 2 seconds
- [ ] Mobile responsive on all breakpoints
- [ ] Lighthouse score > 90
- [ ] Zero console errors
- [ ] Smooth animations (60fps)
- [ ] Accessible (WCAG AA)

---

**End of Frontend UI/UX Plan**
