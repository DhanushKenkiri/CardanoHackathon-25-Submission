import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(0); // in ADA
  const [balanceLovelace, setBalanceLovelace] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meshLoaded, setMeshLoaded] = useState(false);

  // Convert Lovelace to ADA
  const lovelaceToAda = (lovelace) => {
    return (lovelace / 1000000).toFixed(2);
  };

  // Convert ADA to Lovelace
  const adaToLovelace = (ada) => {
    return Math.floor(ada * 1000000);
  };

  // Initialize Mesh SDK dynamically
  useEffect(() => {
    const loadMesh = async () => {
      try {
        // Dynamically import BrowserWallet to avoid WASM loading issues
        const { BrowserWallet } = await import('@meshsdk/core');
        window.BrowserWallet = BrowserWallet;
        setMeshLoaded(true);
      } catch (err) {
        console.error('Failed to load Mesh SDK:', err);
        setError('Failed to load wallet library. Please refresh the page.');
      }
    };
    loadMesh();
  }, []);

  // Connect wallet
  const connectWallet = async (walletName = 'nami') => {
    if (!meshLoaded || !window.BrowserWallet) {
      setError('Wallet library still loading. Please wait a moment and try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const BrowserWallet = window.BrowserWallet;
      const availableWallets = BrowserWallet.getInstalledWallets();
      
      if (availableWallets.length === 0) {
        throw new Error('No Cardano wallets found. Please install Nami, Eternl, or Flint wallet.');
      }

      const selectedWallet = availableWallets.find(w => w.name.toLowerCase() === walletName.toLowerCase());
      
      if (!selectedWallet) {
        throw new Error(`${walletName} wallet not found. Available: ${availableWallets.map(w => w.name).join(', ')}`);
      }

      const walletInstance = await BrowserWallet.enable(selectedWallet.name);
      setWallet(walletInstance);

      const address = await walletInstance.getChangeAddress();
      setWalletAddress(address);

      // Fetch user profile from backend
      await fetchUserProfile(address);

      setConnected(true);
      setLoading(false);
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet(null);
    setConnected(false);
    setWalletAddress(null);
    setBalance(0);
    setBalanceLovelace(0);
    setUserId(null);
    setUserProfile(null);
  };

  // Fetch user profile from backend
  const fetchUserProfile = async (address) => {
    try {
      // Try to find existing user by wallet address
      const response = await axios.get(`/api/user/by-wallet/${address}`);
      
      if (response.data.success) {
        const profile = response.data.user;
        setUserProfile(profile);
        setUserId(profile.user_id);
        setBalanceLovelace(profile.balance_lovelace || 0);
        setBalance(parseFloat(lovelaceToAda(profile.balance_lovelace || 0)));
      } else {
        // Create new user if not found
        const createResponse = await axios.post('/api/user/create', {
          wallet_address: address
        });
        
        if (createResponse.data.success) {
          setUserProfile(createResponse.data.user);
          setUserId(createResponse.data.user.user_id);
          setBalanceLovelace(0);
          setBalance(0);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Create user with default values if API fails
      const tempUserId = `user_${address.slice(-8)}`;
      setUserId(tempUserId);
      setBalanceLovelace(0);
      setBalance(0);
    }
  };

  // Refresh balance from backend
  const refreshBalance = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`/api/user/${userId}`);
      if (response.data.success) {
        setBalanceLovelace(response.data.user.balance_lovelace || 0);
        setBalance(parseFloat(lovelaceToAda(response.data.user.balance_lovelace || 0)));
        setUserProfile(response.data.user);
      }
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  };

  // Add funds to balance
  const addFunds = async (amountAda) => {
    if (!wallet || !userId) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const amountLovelace = adaToLovelace(amountAda);

      // Build and sign transaction using Mesh SDK
      const systemWallet = 'addr_test1vrjtn62vuzckgnw8fff7t246lq34633h4qkc8npvf5fzvrskjj36g'; // System master wallet
      
      const tx = await wallet.createTx()
        .payToAddress(systemWallet, [{ unit: 'lovelace', quantity: amountLovelace.toString() }])
        .complete();

      const signedTx = await wallet.signTx(tx);
      const txHash = await wallet.submitTx(signedTx);

      // Notify backend about the deposit
      const response = await axios.post('/api/user/add-funds', {
        user_id: userId,
        amount_lovelace: amountLovelace,
        tx_hash: txHash,
        wallet_address: walletAddress
      });

      if (response.data.success) {
        await refreshBalance();
        setLoading(false);
        return { success: true, txHash, newBalance: response.data.new_balance };
      } else {
        throw new Error(response.data.message || 'Failed to add funds');
      }
    } catch (err) {
      console.error('Add funds error:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Check if user has sufficient balance
  const hasSufficientBalance = (requiredAda) => {
    return balance >= requiredAda;
  };

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (connected && userId) {
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [connected, userId]);

  const value = {
    wallet,
    connected,
    walletAddress,
    balance,
    balanceLovelace,
    userId,
    userProfile,
    loading,
    error,
    meshLoaded,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    addFunds,
    hasSufficientBalance,
    lovelaceToAda,
    adaToLovelace
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
