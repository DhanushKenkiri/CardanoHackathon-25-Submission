# Quick Start: Wallet Integration (First Feature)

**Time to Complete:** 2-3 hours  
**Difficulty:** Medium  
**Prerequisites:** Node.js 18+, React basics, Nami wallet installed

---

## 🎯 GOAL

Add Cardano wallet connection to the ParknGo React frontend so users can:
1. See "Connect Wallet" button
2. Click and choose wallet (Nami/Eternl/Flint)
3. See their wallet address and balance
4. Disconnect wallet

---

## 📋 STEP-BY-STEP GUIDE

### **STEP 1: Install Dependencies (5 minutes)**

```bash
cd /Users/dsrk/Downloads/masumi/frontend

# Install Mesh SDK
npm install @meshsdk/core @meshsdk/react

# Install QR code library (for later)
npm install qrcode.react

# Install animation library (for later)
npm install framer-motion

# Verify installation
npm list @meshsdk/core
```

**Expected Output:**
```
parkngo-frontend@1.0.0 /Users/dsrk/Downloads/masumi/frontend
└── @meshsdk/core@1.5.0
```

---

### **STEP 2: Create WalletContext (30 minutes)**

Create new file: `frontend/src/contexts/WalletContext.js`

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
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    detectWallets();
    checkPreviousConnection();
  }, []);

  const detectWallets = async () => {
    try {
      const wallets = await BrowserWallet.getInstalledWallets();
      console.log('Detected wallets:', wallets);
      setAvailableWallets(wallets);
    } catch (error) {
      console.error('Error detecting wallets:', error);
      setAvailableWallets([]);
    }
  };

  const checkPreviousConnection = async () => {
    const savedWallet = localStorage.getItem('parkngo_connected_wallet');
    if (savedWallet) {
      console.log('Found previous wallet connection:', savedWallet);
      await connectWallet(savedWallet);
    }
  };

  const connectWallet = async (walletName) => {
    setLoading(true);
    try {
      console.log('Connecting to wallet:', walletName);
      
      const walletInstance = await BrowserWallet.enable(walletName);
      console.log('Wallet enabled');

      const addresses = await walletInstance.getUsedAddresses();
      const walletAddress = addresses[0];
      console.log('Wallet address:', walletAddress);

      const balanceValue = await walletInstance.getBalance();
      console.log('Wallet balance:', balanceValue);

      setWallet(walletInstance);
      setAddress(walletAddress);
      setBalance(balanceValue);
      setConnected(true);

      localStorage.setItem('parkngo_connected_wallet', walletName);
      
      console.log('✅ Wallet connected successfully!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet: ' + error.message);
      disconnectWallet();
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setConnected(false);
    setAddress('');
    setBalance(0);
    localStorage.removeItem('parkngo_connected_wallet');
    console.log('Wallet disconnected');
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

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
```

---

### **STEP 3: Wrap App with WalletProvider (5 minutes)**

Edit `frontend/src/App.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { WalletProvider } from './contexts/WalletContext'; // ADD THIS
import './App.css';

// SECURE: Only owner knows these credentials
const OWNER_CREDENTIALS = {
  username: 'owner@ambmall',
  password: 'ParknGo2025!Secure'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem('parkngo_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (username, password) => {
    if (username === OWNER_CREDENTIALS.username && password === OWNER_CREDENTIALS.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem('parkngo_auth', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('parkngo_auth');
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <WalletProvider> {/* WRAP EVERYTHING HERE */}
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </WalletProvider> {/* CLOSE WRAPPER */}
  );
}

export default App;
```

---

### **STEP 4: Create WalletConnect Component (45 minutes)**

Create new file: `frontend/src/components/WalletConnect.js`

```javascript
import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import './WalletConnect.css';

function WalletConnect() {
  const { 
    connected, 
    address, 
    balance, 
    availableWallets, 
    connectWallet, 
    disconnectWallet, 
    loading 
  } = useWallet();
  
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async (walletName) => {
    await connectWallet(walletName);
    setShowModal(false);
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
  };

  const formatBalance = (balanceArray) => {
    if (!balanceArray || balanceArray.length === 0) return '0.00';
    
    // Balance is returned as array: [{unit: 'lovelace', quantity: '1500000'}]
    const lovelace = balanceArray.find(b => b.unit === 'lovelace');
    if (!lovelace) return '0.00';
    
    return (parseInt(lovelace.quantity) / 1000000).toFixed(2);
  };

  if (connected) {
    return (
      <div className="wallet-connected">
        <div className="wallet-badge">
          <i className="fas fa-wallet"></i>
          <div className="wallet-info">
            <div className="wallet-address">{formatAddress(address)}</div>
            <div className="wallet-balance">{formatBalance(balance)} ADA</div>
          </div>
        </div>
        <button className="disconnect-btn" onClick={disconnectWallet} title="Disconnect">
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    );
  }

  return (
    <>
      <button 
        className="connect-wallet-btn" 
        onClick={() => setShowModal(true)}
        disabled={loading}
      >
        <i className="fas fa-wallet"></i>
        {loading ? 'Connecting...' : 'Connect Wallet'}
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

            <p className="modal-description">
              Choose a Cardano wallet to connect. Make sure you have it installed and unlocked.
            </p>

            <div className="wallet-list">
              {availableWallets.length > 0 ? (
                availableWallets.map((w) => (
                  <button
                    key={w.name}
                    className="wallet-option"
                    onClick={() => handleConnect(w.name)}
                    disabled={loading}
                  >
                    <img src={w.icon} alt={w.name} className="wallet-icon" />
                    <span className="wallet-name">{w.name}</span>
                    <i className="fas fa-arrow-right"></i>
                  </button>
                ))
              ) : (
                <div className="no-wallets">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>No Cardano wallets detected</p>
                  <p className="help-text">Please install one of the following:</p>
                  <div className="wallet-links">
                    <a href="https://namiwallet.io" target="_blank" rel="noopener noreferrer">
                      Nami Wallet
                    </a>
                    <a href="https://eternl.io" target="_blank" rel="noopener noreferrer">
                      Eternl
                    </a>
                    <a href="https://flint-wallet.com" target="_blank" rel="noopener noreferrer">
                      Flint
                    </a>
                  </div>
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

---

### **STEP 5: Create CSS for WalletConnect (20 minutes)**

Create new file: `frontend/src/components/WalletConnect.css`

```css
/* Connect Wallet Button */
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
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.connect-wallet-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.connect-wallet-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Connected Wallet Display */
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

.wallet-badge i {
  font-size: 1.3rem;
  color: #667eea;
}

.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wallet-address {
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  color: #1a202c;
  font-weight: 500;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.disconnect-btn:hover {
  background: #ef4444;
  color: white;
}

/* Modal */
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.wallet-modal {
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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
  margin-bottom: 10px;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #1a202c;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  transition: color 0.3s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #1a202c;
}

.modal-description {
  color: #718096;
  margin-bottom: 20px;
  font-size: 0.95rem;
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

.wallet-option:hover:not(:disabled) {
  border-color: #667eea;
  background: #f7fafc;
  transform: translateX(5px);
}

.wallet-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.wallet-name {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a202c;
  text-align: left;
}

.wallet-option i {
  color: #cbd5e0;
  transition: color 0.3s;
}

.wallet-option:hover i {
  color: #667eea;
}

/* No Wallets State */
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
  margin-bottom: 10px;
}

.no-wallets .help-text {
  font-size: 0.9rem;
  margin-top: 20px;
}

.wallet-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.wallet-links a {
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 500;
}

.wallet-links a:hover {
  background: #5568d3;
  transform: scale(1.05);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .wallet-modal {
    width: 95%;
    padding: 20px;
  }
  
  .wallet-badge {
    padding: 8px 12px;
  }
  
  .wallet-address {
    font-size: 0.8rem;
  }
  
  .connect-wallet-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
```

---

### **STEP 6: Add WalletConnect to Dashboard (10 minutes)**

Edit `frontend/src/components/Dashboard.js` - replace the wallet section in the header:

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ParkingMap from './ParkingMap';
import WalletConnect from './WalletConnect'; // ADD THIS IMPORT
import { useWallet } from '../contexts/WalletContext'; // ADD THIS IMPORT
import './Dashboard.css';

function Dashboard({ onLogout }) { // REMOVE walletAddress prop
  const { connected, address, balance } = useWallet(); // ADD THIS HOOK
  
  // ... rest of the component stays the same ...

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <i className="fas fa-parking"></i>
            <div>
              <h1>ParknGo</h1>
              <span>AMB Mall - Hyderabad</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <WalletConnect /> {/* REPLACE OLD WALLET DISPLAY WITH THIS */}
          <button className="logout-btn" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </header>
      
      {/* Rest of dashboard... */}
    </div>
  );
}

export default Dashboard;
```

---

### **STEP 7: Test the Integration (15 minutes)**

1. **Start the frontend:**
```bash
cd /Users/dsrk/Downloads/masumi/frontend
npm start
```

2. **Open browser:** http://localhost:3000

3. **Login to dashboard:**
   - Username: `owner@ambmall`
   - Password: `ParknGo2025!Secure`

4. **Test wallet connection:**
   - Click "Connect Wallet" button
   - Modal should open
   - If Nami installed → Click "Nami"
   - Nami popup should appear → Click "Access"
   - Modal closes, wallet badge appears
   - Should see your address (truncated)
   - Should see your ADA balance

5. **Test disconnect:**
   - Click disconnect button (red icon)
   - Wallet badge disappears
   - "Connect Wallet" button reappears

6. **Test persistence:**
   - Connect wallet
   - Refresh page
   - Should auto-reconnect

---

### **STEP 8: Troubleshooting**

#### Problem: "No wallets detected"
**Solution:**
- Install Nami wallet extension: https://namiwallet.io
- Unlock the wallet
- Refresh the page

#### Problem: "Failed to connect wallet"
**Solution:**
- Check browser console for errors
- Make sure wallet is unlocked
- Try different wallet (Eternl, Flint)
- Clear browser cache

#### Problem: Balance shows 0.00
**Solution:**
- Get test ADA from faucet: https://docs.cardano.org/cardano-testnet/tools/faucet
- Switch wallet to Preprod testnet
- Wait for transaction confirmation

#### Problem: Console error: "BrowserWallet is not defined"
**Solution:**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Dependencies installed
- [ ] WalletContext created
- [ ] App wrapped with WalletProvider
- [ ] WalletConnect component created
- [ ] CSS file created
- [ ] Dashboard updated to use WalletConnect
- [ ] Frontend runs without errors
- [ ] Can open wallet modal
- [ ] Can connect Nami wallet
- [ ] Address displays correctly
- [ ] Balance displays correctly
- [ ] Can disconnect wallet
- [ ] Wallet persists after refresh

---

## 🎉 CONGRATULATIONS!

You've successfully integrated Cardano wallet connection! 

**What you can do now:**
- Users can connect their Cardano wallets
- Display wallet address and balance
- Persist connection across page refreshes
- Disconnect wallet

**Next steps:**
1. Add payment functionality (build transactions)
2. Create payment modal
3. Implement payment confirmation
4. Add QR code generation

**Estimated time for next steps:** 4-6 hours

---

## 📚 RESOURCES

- **Mesh SDK Docs:** https://meshjs.dev
- **Cardano Docs:** https://developers.cardano.org
- **Nami Wallet:** https://namiwallet.io
- **Test ADA Faucet:** https://docs.cardano.org/cardano-testnet/tools/faucet

---

**Need help?** Check the browser console for detailed error messages!
