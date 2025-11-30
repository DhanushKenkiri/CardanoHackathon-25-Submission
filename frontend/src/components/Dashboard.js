import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ParkingMap from './ParkingMap';
import './Dashboard.css';

function Dashboard({ onLogout, walletAddress }) {
  const [stats, setStats] = useState({ available_spots: 0, active_sessions: 0 });
  const [earnings, setEarnings] = useState({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, earningsRes, txRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/agents/earnings'),
        axios.get('/api/blockchain/transactions')
      ]);

      setStats(statsRes.data);
      setEarnings(earningsRes.data.earnings || {});

      // Calculate wallet balance from earnings
      const total = Object.values(earningsRes.data.earnings || {}).reduce((a, b) => a + b, 0);
      setWalletBalance((total / 100000000).toFixed(2)); // Convert Lovelace to ADA
      
      // Set blockchain transactions
      setTransactions(txRes.data.transactions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };  const triggerEntry = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/trigger/vehicle-entry', {
        vehicle_id: `CAR_${Date.now()}`,
        user_id: 'owner',
        spot_id: 'A1'
      });

      if (res.data.success) {
        setActiveSession({
          id: res.data.session_id,
          startTime: Date.now(),
          spot: 'A1-15'
        });
        
        alert('✅ Vehicle entry triggered! Orchestration running...');
        
        // Refresh data after 20 seconds
        setTimeout(fetchData, 20000);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalEarningsADA = Object.values(earnings).reduce((a, b) => a + b, 0) / 100000000;

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
          <div className="wallet">
            <i className="fab fa-bitcoin"></i>
            <div>
              <div className="wallet-label">Wallet Balance</div>
              <div className="wallet-amount">{walletBalance} ADA</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#48bb7820', color: '#48bb78'}}>
            <i className="fas fa-parking"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.available_spots || 0}</div>
            <div className="stat-label">Available Spots</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: '#667eea20', color: '#667eea'}}>
            <i className="fas fa-car"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.active_sessions || 0}</div>
            <div className="stat-label">Active Sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: '#f6ad5520', color: '#f6ad55'}}>
            <i className="fas fa-coins"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalEarningsADA.toFixed(2)}</div>
            <div className="stat-label">Total Earnings (ADA)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{background: '#764ba220', color: '#764ba2'}}>
            <i className="fas fa-robot"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">7/7</div>
            <div className="stat-label">AI Agents Active</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-grid">
        {/* Map Section */}
        <div className="section">
          <div className="section-header">
            <h2><i className="fas fa-map-marked-alt"></i> Live Parking Map</h2>
          </div>
          <ParkingMap />
        </div>

        {/* Actions & AI Features */}
        <div>
          {/* Active Session */}
          {activeSession && (
            <div className="active-session">
              <div className="session-header">
                <span className="session-badge">● ACTIVE</span>
                <span className="session-spot">Spot: {activeSession.spot}</span>
              </div>
              <div className="session-time">
                Running... {Math.floor((Date.now() - activeSession.startTime) / 1000)}s
              </div>
            </div>
          )}

          {/* Main Action */}
          <button 
            className="main-action-btn" 
            onClick={triggerEntry}
            disabled={loading || activeSession}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Processing...
              </>
            ) : activeSession ? (
              <>
                <i className="fas fa-check-circle"></i>
                Session Active
              </>
            ) : (
              <>
                <i className="fas fa-car"></i>
                Trigger Vehicle Entry
              </>
            )}
          </button>

          {/* AI Agent Earnings */}
          <div className="section">
            <div className="section-header">
              <h2><i className="fas fa-robot"></i> AI Agent Earnings</h2>
            </div>
            <div className="agents-list">
              {[
                { key: 'orchestrator', name: 'Orchestrator', rate: '0.4 ADA', icon: 'brain' },
                { key: 'spot_finder', name: 'Spot Finder', rate: '0.3 ADA', icon: 'search-location' },
                { key: 'pricing_agent', name: 'Pricing Agent', rate: '0.4 ADA', icon: 'tags' },
                { key: 'route_optimizer', name: 'Route Optimizer', rate: '0.2 ADA', icon: 'route' },
                { key: 'payment_verifier', name: 'Payment Verifier', rate: '0.2 ADA', icon: 'credit-card' },
                { key: 'security_guard', name: 'Security Guard', rate: '20% fines', icon: 'shield-alt' },
                { key: 'dispute_resolver', name: 'Dispute Resolver', rate: '$2/case', icon: 'gavel' }
              ].map(agent => (
                <div className="agent-item" key={agent.key}>
                  <div className="agent-icon">
                    <i className={`fas fa-${agent.icon}`}></i>
                  </div>
                  <div className="agent-details">
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-rate">{agent.rate}</div>
                  </div>
                  <div className="agent-earned">
                    {((earnings[agent.key] || 0) / 100000000).toFixed(4)} ADA
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet Info */}
          <div className="section">
            <div className="section-header">
              <h2><i className="fas fa-wallet"></i> Wallet Details</h2>
            </div>
            <div className="wallet-details">
              <div className="wallet-field">
                <div className="field-label">Address</div>
                <div className="field-value mono">{walletAddress.substring(0, 20)}...</div>
              </div>
              <div className="wallet-field">
                <div className="field-label">Network</div>
                <div className="field-value">Cardano Preprod</div>
              </div>
              <div className="wallet-field">
                <div className="field-label">Balance</div>
                <div className="field-value">{walletBalance} ADA</div>
              </div>
            </div>
          </div>

          {/* Blockchain Transactions */}
          <div className="section">
            <div className="section-header">
              <h2><i className="fas fa-link"></i> Blockchain Transactions</h2>
            </div>
            <div className="transactions-list">
              {transactions.length === 0 ? (
                <div className="no-transactions">
                  <i className="fas fa-info-circle"></i>
                  <p>No blockchain transactions yet. Trigger a parking session to see real Cardano transactions.</p>
                </div>
              ) : (
                transactions.slice(0, 10).map((tx, index) => (
                  <div key={index} className="transaction-item">
                    <div className="tx-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="tx-details">
                      <div className="tx-agent">{tx.agent_name.replace('_', ' ')}</div>
                      <div className="tx-hash" title={tx.tx_hash}>
                        {tx.tx_hash.substring(0, 16)}...
                      </div>
                    </div>
                    <div className="tx-amount">
                      +{tx.amount_ada} ADA
                    </div>
                    <a 
                      href={tx.explorer_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="tx-explorer-btn"
                      title="View on CardanoScan"
                    >
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
