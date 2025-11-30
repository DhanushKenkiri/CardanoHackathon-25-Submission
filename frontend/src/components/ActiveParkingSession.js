import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';

const ActiveParkingSession = ({ sessionId }) => {
  const [session, setSession] = useState(null);
  const [payments, setPayments] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#0f172a',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
    },
    // Header with pulsing status
    header: {
      backgroundColor: '#1e293b',
      padding: '1.5rem',
      borderBottom: '2px solid #10b981',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      color: '#10b981',
      padding: '0.75rem 1.25rem',
      borderRadius: '2rem',
      fontSize: '0.95rem',
      fontWeight: '600',
      border: '2px solid #10b981',
    },
    pulse: {
      width: '12px',
      height: '12px',
      backgroundColor: '#10b981',
      borderRadius: '50%',
      animation: 'pulse 2s infinite',
    },
    // Main content area
    content: {
      flex: 1,
      overflowY: 'auto',
      padding: '2rem',
    },
    // Spot info card
    spotCard: {
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
      border: '2px solid rgba(59, 130, 246, 0.3)',
    },
    spotTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
    },
    spotDetails: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    detailItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '1rem',
      borderRadius: '0.5rem',
    },
    detailLabel: {
      fontSize: '0.85rem',
      color: '#94a3b8',
      marginBottom: '0.25rem',
    },
    detailValue: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
    },
    // Charging meter
    meterCard: {
      backgroundColor: '#1e293b',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
      border: '2px solid rgba(16, 185, 129, 0.3)',
    },
    meterTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    meterValue: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem',
      textAlign: 'center',
    },
    meterSubtext: {
      fontSize: '1rem',
      color: '#94a3b8',
      textAlign: 'center',
      marginBottom: '2rem',
    },
    progressBar: {
      height: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '1rem',
      overflow: 'hidden',
      marginBottom: '1rem',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
      transition: 'width 0.3s ease',
    },
    // Payments timeline
    timelineCard: {
      backgroundColor: '#1e293b',
      borderRadius: '1rem',
      padding: '2rem',
      marginBottom: '2rem',
    },
    timelineTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1.5rem',
    },
    timelineList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    paymentItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderRadius: '0.75rem',
      border: '1px solid rgba(16, 185, 129, 0.3)',
    },
    paymentIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
    },
    paymentDetails: {
      flex: 1,
    },
    paymentTime: {
      fontSize: '0.85rem',
      color: '#94a3b8',
      marginBottom: '0.25rem',
    },
    paymentAmount: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#10b981',
    },
    paymentHash: {
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      color: '#64748b',
      marginTop: '0.25rem',
    },
    txLink: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontSize: '0.85rem',
    },
    // Bottom actions
    actions: {
      backgroundColor: '#1e293b',
      padding: '1.5rem',
      borderTop: '2px solid rgba(255, 255, 255, 0.1)',
    },
    endButton: {
      width: '100%',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      padding: '1.25rem',
      borderRadius: '0.75rem',
      border: 'none',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    helpText: {
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '0.85rem',
      marginTop: '1rem',
    },
  };

  // Listen to session updates
  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = ref(db, `active_sessions/${sessionId}`);
    const paymentsRef = ref(db, `realtime_payments/${sessionId}`);

    const unsubscribeSession = onValue(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        setSession(snapshot.val());
        setLoading(false);
      }
    });

    const unsubscribePayments = onValue(paymentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const paymentsData = snapshot.val();
        const paymentsArray = Object.values(paymentsData).sort(
          (a, b) => b.payment_number - a.payment_number
        );
        setPayments(paymentsArray);
      }
    });

    return () => {
      unsubscribeSession();
      unsubscribePayments();
    };
  }, [sessionId]);

  // Update elapsed time every second
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      const startTime = session.start_time || 0;
      const elapsedSeconds = Math.floor(Date.now() / 1000) - startTime;
      setElapsed(elapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const nextPaymentIn = () => {
    const lastPaymentTime = session?.last_payment_time || session?.start_time || 0;
    const nextPaymentTime = lastPaymentTime + 60; // Next minute
    const secondsUntilNext = Math.max(0, nextPaymentTime - Math.floor(Date.now() / 1000));
    return secondsUntilNext;
  };

  const progressPercent = () => {
    const secondsUntilNext = nextPaymentIn();
    return ((60 - secondsUntilNext) / 60) * 100;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.content, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Loading session...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.statusBadge}>
          <div style={styles.pulse} />
          <span>Parking Active - Charging Per Minute</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Spot Info */}
        <div style={styles.spotCard}>
          <div style={styles.spotTitle}>🅿️ {session.spot_id}</div>
          <div style={styles.spotDetails}>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Vehicle</div>
              <div style={styles.detailValue}>{session.vehicle_id}</div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Session ID</div>
              <div style={{ ...styles.detailValue, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                {session.session_id.slice(0, 20)}...
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Started</div>
              <div style={styles.detailValue}>
                {new Date(session.start_time * 1000).toLocaleTimeString()}
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailLabel}>Duration</div>
              <div style={styles.detailValue}>{formatDuration(elapsed)}</div>
            </div>
          </div>
        </div>

        {/* Charging Meter */}
        <div style={styles.meterCard}>
          <div style={styles.meterTitle}>
            <span>⚡</span>
            <span>Live Charging</span>
          </div>
          <div style={styles.meterValue}>
            {((session.total_charged_lovelace || 0) / 1000000).toFixed(2)} ADA
          </div>
          <div style={styles.meterSubtext}>
            {session.payment_count || 0} payments • 0.2 ADA per minute
          </div>
          
          {/* Progress to next payment */}
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progressPercent()}%` }} />
          </div>
          <div style={{ ...styles.meterSubtext, marginBottom: 0 }}>
            Next payment in {nextPaymentIn()} seconds
          </div>
        </div>

        {/* Payment Timeline */}
        <div style={styles.timelineCard}>
          <div style={styles.timelineTitle}>💰 Payment History</div>
          <div style={styles.timelineList}>
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                First payment will be charged in {nextPaymentIn()} seconds
              </div>
            ) : (
              payments.map((payment, idx) => (
                <div key={idx} style={styles.paymentItem}>
                  <div style={styles.paymentIcon}>✅</div>
                  <div style={styles.paymentDetails}>
                    <div style={styles.paymentTime}>
                      Payment #{payment.payment_number} • {formatTime(payment.timestamp)}
                    </div>
                    <div style={styles.paymentAmount}>
                      {payment.amount_ada} ADA ({payment.amount_lovelace.toLocaleString()} Lovelace)
                    </div>
                    {payment.tx_hash && (
                      <>
                        <div style={styles.paymentHash}>
                          TX: {payment.tx_hash.slice(0, 16)}...{payment.tx_hash.slice(-8)}
                        </div>
                        <a
                          href={payment.explorer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.txLink}
                        >
                          View on CardanoScan →
                        </a>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={styles.actions}>
        <button
          style={styles.endButton}
          onClick={async () => {
            if (window.confirm('Are you sure you want to end this parking session?')) {
              // End session logic - set spot to unoccupied
              const spotRef = ref(db, `parking_spots/${session.spot_id}`);
              await update(spotRef, { occupied: false });
              
              // Reload page to show normal view
              window.location.reload();
            }
          }}
          onMouseOver={(e) => (e.target.style.transform = 'scale(1.02)')}
          onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
        >
          End Parking Session
        </button>
        <div style={styles.helpText}>
          Payment Agent automatically charges 0.2 ADA every minute
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.2);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ActiveParkingSession;
