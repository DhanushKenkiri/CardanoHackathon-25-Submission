import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import ParkingLot3D from '../components/ParkingLot3D';
import AgentExecutor from '../components/AgentExecutor';
import WalletConnectModal from '../components/WalletConnectModal';
import AddBalanceModal from '../components/AddBalanceModal';
import ActiveParkingSession from '../components/ActiveParkingSession';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

const HomePage = () => {
  const { connected, balance, walletAddress, meshLoaded, disconnectWallet } = useWallet();
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [spotOccupied, setSpotOccupied] = useState(false);

  // Monitor spot_01 for active sessions
  useEffect(() => {
    const spotRef = ref(db, 'parking_spots/spot_01');
    
    const unsubscribe = onValue(spotRef, (snapshot) => {
      if (snapshot.exists()) {
        const spotData = snapshot.val();
        setSpotOccupied(spotData.occupied || false);
        
        // If occupied, find the active session
        if (spotData.occupied) {
          const sessionsRef = ref(db, 'active_sessions');
          onValue(sessionsRef, (sessionsSnapshot) => {
            if (sessionsSnapshot.exists()) {
              const sessions = sessionsSnapshot.val();
              // Find session for spot_01
              const activeSessionData = Object.values(sessions).find(
                s => s.spot_id === 'spot_01' && s.status === 'active'
              );
              if (activeSessionData) {
                setActiveSession(activeSessionData.session_id);
              }
            }
          }, { onlyOnce: true });
        } else {
          setActiveSession(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSpotSelect = (spot) => {
    setSelectedSpot(spot);
    setShowSidebar(true);
  };

  const handleAgentResult = (agentId, result) => {
    console.log(`Agent ${agentId} result:`, result);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#111827',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      backgroundColor: '#1f2937',
      borderBottom: '2px solid #374151',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '1rem 1.5rem',
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    logoIcon: {
      fontSize: '2.5rem',
    },
    logoText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.5rem',
    },
    logoSubtext: {
      color: '#9ca3af',
      fontSize: '0.75rem',
    },
    walletSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    balanceCard: {
      backgroundColor: '#374151',
      borderRadius: '0.5rem',
      padding: '0.75rem 1.5rem',
      border: '2px solid #10b981',
    },
    balanceLabel: {
      color: '#9ca3af',
      fontSize: '0.75rem',
      marginBottom: '0.25rem',
    },
    balanceAmount: {
      color: '#10b981',
      fontWeight: 'bold',
      fontSize: '1.5rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s',
    },
    addBalanceBtn: {
      backgroundColor: '#10b981',
      color: 'white',
    },
    walletCard: {
      backgroundColor: '#374151',
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      border: '2px solid #3b82f6',
    },
    walletAddress: {
      color: 'white',
      fontSize: '0.875rem',
      fontFamily: 'monospace',
    },
    disconnectBtn: {
      color: '#ef4444',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      border: 'none',
      padding: '0.5rem 1rem',
    },
    connectBtn: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '0.75rem 2rem',
      fontSize: '1.125rem',
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      position: 'relative',
    },
    mapContainer: {
      flex: 1,
      position: 'relative',
    },
    toggleBtn: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      backgroundColor: 'rgba(31, 41, 55, 0.9)',
      color: 'white',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '2px solid #374151',
      cursor: 'pointer',
      zIndex: 30,
    },
    sidebar: {
      width: '500px',
      backgroundColor: '#1f2937',
      borderLeft: '2px solid #374151',
      overflowY: 'auto',
      zIndex: 30,
    },
    sidebarContent: {
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    spotCard: {
      backgroundColor: '#374151',
      borderRadius: '0.5rem',
      padding: '1rem',
      border: '2px solid #3b82f6',
    },
    spotTitle: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.125rem',
      marginBottom: '0.75rem',
    },
    spotDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      fontSize: '0.875rem',
    },
    spotRow: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    spotLabel: {
      color: '#9ca3af',
    },
    spotValue: {
      color: 'white',
      fontWeight: '600',
    },
    emptyCard: {
      backgroundColor: '#374151',
      borderRadius: '0.5rem',
      padding: '1rem',
      border: '2px solid #4b5563',
      textAlign: 'center',
      color: '#9ca3af',
    },
    warningCard: {
      borderRadius: '0.5rem',
      padding: '1.5rem',
      textAlign: 'center',
      border: '2px solid',
    },
    warningIcon: {
      fontSize: '2.5rem',
      marginBottom: '0.75rem',
    },
    warningTitle: {
      fontWeight: 'bold',
      fontSize: '1.125rem',
      marginBottom: '0.5rem',
    },
    warningText: {
      color: '#d1d5db',
      fontSize: '0.875rem',
      marginBottom: '1rem',
    },
    sectionTitle: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      marginBottom: '1rem',
    },
    sectionSubtext: {
      color: '#9ca3af',
      fontSize: '0.875rem',
      marginBottom: '1rem',
    },
    bookingCard: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      borderRadius: '0.5rem',
      padding: '1.5rem',
    },
    bookingTitle: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      marginBottom: '0.5rem',
    },
    bookingText: {
      color: '#dbeafe',
      fontSize: '0.875rem',
      marginBottom: '1rem',
    },
    bookBtn: {
      width: '100%',
      backgroundColor: 'white',
      color: '#2563eb',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
    },
  };

  // If there's an active session, show the dynamic charging view
  if (activeSession && spotOccupied) {
    return <ActiveParkingSession sessionId={activeSession} />;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🅿️</div>
            <div>
              <div style={styles.logoText}>ParknGo</div>
              <div style={styles.logoSubtext}>AI-Powered Parking System</div>
            </div>
          </div>

          <div style={styles.walletSection}>
            {connected ? (
              <>
                <div style={styles.balanceCard}>
                  <div style={styles.balanceLabel}>Balance</div>
                  <div style={styles.balanceAmount}>{balance} ADA</div>
                </div>
                <button
                  onClick={() => setShowBalanceModal(true)}
                  style={{ ...styles.button, ...styles.addBalanceBtn }}
                >
                  + Add Balance
                </button>
                <div style={styles.walletCard}>
                  <div style={styles.balanceLabel}>Wallet</div>
                  <div style={styles.walletAddress}>
                    {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                  </div>
                </div>
                <button onClick={disconnectWallet} style={styles.disconnectBtn}>
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                disabled={!meshLoaded}
                style={{
                  ...styles.button,
                  ...styles.connectBtn,
                  opacity: meshLoaded ? 1 : 0.5,
                  cursor: meshLoaded ? 'pointer' : 'not-allowed',
                }}
              >
                {meshLoaded ? 'Connect Wallet' : 'Loading...'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.mapContainer}>
          <ParkingLot3D onSpotSelect={handleSpotSelect} selectedSpot={selectedSpot} />
          <button onClick={() => setShowSidebar(!showSidebar)} style={styles.toggleBtn}>
            {showSidebar ? '→ Hide Controls' : '← Show Controls'}
          </button>
        </div>

        {showSidebar && (
          <div style={styles.sidebar}>
            <div style={styles.sidebarContent}>
              {/* Selected Spot */}
              {selectedSpot ? (
                <div style={styles.spotCard}>
                  <div style={styles.spotTitle}>Selected Spot: {selectedSpot.spot_id}</div>
                  <div style={styles.spotDetails}>
                    <div style={styles.spotRow}>
                      <span style={styles.spotLabel}>Zone:</span>
                      <span style={styles.spotValue}>{selectedSpot.zone}</span>
                    </div>
                    <div style={styles.spotRow}>
                      <span style={styles.spotLabel}>Type:</span>
                      <span style={{ ...styles.spotValue, textTransform: 'capitalize' }}>
                        {selectedSpot.type}
                      </span>
                    </div>
                    <div style={styles.spotRow}>
                      <span style={styles.spotLabel}>Status:</span>
                      <span
                        style={{
                          fontWeight: '600',
                          color: selectedSpot.occupied ? '#ef4444' : '#10b981',
                        }}
                      >
                        {selectedSpot.occupied ? 'Occupied' : 'Available'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyCard}>
                  👆 Click on a parking zone on the 3D map to select a spot
                </div>
              )}

              {/* Wallet/Balance Guards */}
              {!connected ? (
                <div
                  style={{
                    ...styles.warningCard,
                    backgroundColor: 'rgba(234, 179, 8, 0.2)',
                    borderColor: '#eab308',
                  }}
                >
                  <div style={styles.warningIcon}>🔒</div>
                  <div style={{ ...styles.warningTitle, color: '#eab308' }}>
                    Wallet Not Connected
                  </div>
                  <div style={styles.warningText}>
                    Connect your Cardano wallet to access AI-powered parking features
                  </div>
                  <button
                    onClick={() => setShowWalletModal(true)}
                    style={{ ...styles.button, backgroundColor: '#3b82f6', color: 'white' }}
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : balance === 0 ? (
                <div
                  style={{
                    ...styles.warningCard,
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    borderColor: '#f97316',
                  }}
                >
                  <div style={styles.warningIcon}>💰</div>
                  <div style={{ ...styles.warningTitle, color: '#f97316' }}>No Balance</div>
                  <div style={styles.warningText}>
                    Add balance to use AI agents. All features require payment.
                  </div>
                  <button
                    onClick={() => setShowBalanceModal(true)}
                    style={{ ...styles.button, backgroundColor: '#10b981', color: 'white' }}
                  >
                    Add Balance
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <div style={styles.sectionTitle}>AI Parking Agents</div>
                    <div style={styles.sectionSubtext}>
                      Execute individual AI agents to get smart parking recommendations, pricing,
                      and routing.
                      <span style={{ color: '#eab308', fontWeight: '600' }}>
                        {' '}
                        All agents require payment.
                      </span>
                    </div>
                    <AgentExecutor selectedSpot={selectedSpot} onAgentResult={handleAgentResult} />
                  </div>

                  {selectedSpot && !selectedSpot.occupied && (
                    <div style={styles.bookingCard}>
                      <div style={styles.bookingTitle}>Ready to Book?</div>
                      <div style={styles.bookingText}>
                        Execute agents above to get pricing and route optimization before booking.
                      </div>
                      <button style={styles.bookBtn}>Book Spot {selectedSpot.spot_id}</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <WalletConnectModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} />
      <AddBalanceModal isOpen={showBalanceModal} onClose={() => setShowBalanceModal(false)} />
    </div>
  );
};

export default HomePage;
