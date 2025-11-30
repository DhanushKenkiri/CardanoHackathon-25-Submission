import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { WalletProvider } from './contexts/WalletContext';
import './App.css';

// SECURE: Only owner knows these credentials
const OWNER_CREDENTIALS = {
  username: 'owner@ambmall',
  password: 'ParknGo2025!Secure'
};

// Cardano Preprod Testnet Customer Wallet (get test ADA from Masumi Dispenser)
export const WALLET_ADDRESS = 'addr_test1vrjtn62vuzckgnw8fff7t246lq34633h4qkc8npvf5fzvrskjj36g';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const auth = sessionStorage.getItem('parkngo_auth');
    const user = localStorage.getItem('parkngo_user');
    if (auth === 'true' && user) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (username, password) => {
    if (username === OWNER_CREDENTIALS.username && password === OWNER_CREDENTIALS.password) {
      setIsAuthenticated(true);
      sessionStorage.setItem('parkngo_auth', 'true');
      
      // Store test user data (in production, fetch from Firebase)
      const testUser = {
        user_id: 'user_123',
        wallet_address: WALLET_ADDRESS,
        balance_lovelace: 50000000, // 50 ADA
        vehicle: {
          number: 'TS09EA1234',
          type: 'sedan',
          color: 'blue',
          model: 'Honda City'
        }
      };
      localStorage.setItem('parkngo_user', JSON.stringify(testUser));
      
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('parkngo_auth');
    localStorage.removeItem('parkngo_user');
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <WalletProvider>
      <Router>
        <Routes>
          {/* Landing Page - Product Showcase */}
          <Route path="/" element={<LandingPage />} />
          
          {/* App Page with 3D Parking Map - Wallet-based system */}
          <Route path="/app" element={<HomePage />} />
          
          {/* Login Page */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          
          {/* Owner Dashboard (protected) */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard onLogout={handleLogout} walletAddress={WALLET_ADDRESS} /> : 
              <Navigate to="/login" />
            } 
          />
        </Routes>
      </Router>
    </WalletProvider>
  );
}

export default App;
