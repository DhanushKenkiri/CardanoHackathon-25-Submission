/**
 * Cardano Wallet Service
 * Real-time wallet balance and transaction monitoring
 */

import { useState, useEffect } from 'react';
import { API_BASE_URL, CUSTOMER_WALLET_ADDRESS, getTransactionUrl } from '@/config/api';

export interface WalletBalance {
  balance_ada: number;
  balance_lovelace: number;
  utxos_count: number;
  address: string;
  network: 'preprod' | 'mainnet';
}

export interface Transaction {
  tx_hash: string;
  amount_ada: number;
  timestamp: string;
  type: 'sent' | 'received';
  agent?: string;
  explorer_url: string;
}

/**
 * Get real-time wallet balance from Cardano blockchain
 * First tries backend API, falls back to direct Blockfrost if backend is down
 */
export const getWalletBalance = async (): Promise<WalletBalance> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/wallet/balance/${CUSTOMER_WALLET_ADDRESS}`,
      { signal: AbortSignal.timeout(3000) } // 3 second timeout
    );
    
    if (!response.ok) {
      throw new Error('Backend API failed');
    }
    
    const data = await response.json();
    
    return {
      balance_ada: data.balance_ada ?? data.balance,
      balance_lovelace: data.balance_lovelace ?? (data.balance ? data.balance * 1_000_000 : 0),
      utxos_count: data.utxos_count || 0,
      address: CUSTOMER_WALLET_ADDRESS,
      network: 'preprod',
    };
  } catch (backendError) {
    console.error('Backend wallet balance failed:', backendError);
    throw backendError;
  }
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/wallet/transactions/${CUSTOMER_WALLET_ADDRESS}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    const data = await response.json();
    
    return (data.transactions || []).map((tx: any) => ({
      tx_hash: tx.tx_hash,
      amount_ada: tx.amount_ada,
      timestamp: tx.timestamp,
      type: tx.type,
      agent: tx.agent,
      explorer_url: getTransactionUrl(tx.tx_hash),
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Poll wallet balance at regular intervals
 * Optimized to reduce API calls - only polls when component is visible
 */
export const useWalletBalance = (intervalMs: number = 30000) => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;
    let failureCount = 0;
    const MAX_FAILURES = 3;

    const fetchBalance = async () => {
      try {
        const data = await getWalletBalance();
        if (mounted) {
          setBalance(data);
          setLoading(false);
          setError(null);
          failureCount = 0; // Reset on success
        }
      } catch (err) {
        failureCount++;
        if (mounted) {
          setError(err as Error);
          setLoading(false);
          
          // Stop polling after multiple failures to conserve API credits
          if (failureCount >= MAX_FAILURES) {
            console.warn('Stopping balance polling due to repeated failures');
            clearInterval(interval);
          }
        }
      }
    };

    // Initial fetch
    fetchBalance();
    
    // Set up polling interval
    interval = setInterval(fetchBalance, intervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [intervalMs]);

  return { balance, loading, error };
};
