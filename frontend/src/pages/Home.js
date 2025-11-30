import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Home.css';
import LiveParkingMap from '../components/LiveParkingMap';
import SpotCard from '../components/SpotCard';

function Home() {
  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    zone: 'all',
    type: 'all',
    features: 'all'
  });
  const [activeSession, setActiveSession] = useState(null);

  // Load user from localStorage (if logged in)
  useEffect(() => {
    const storedUser = localStorage.getItem('parkngo_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchActiveSession(userData.user_id);
    }
  }, []);

  // Fetch available parking spots (FREE - no auth required)
  useEffect(() => {
    fetchAvailableSpots();
    const interval = setInterval(fetchAvailableSpots, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Apply filters when spots or filters change
  useEffect(() => {
    applyFilters();
  }, [spots, filters]);

  const fetchAvailableSpots = async () => {
    try {
      const response = await axios.get('/api/parking/spots/available');
      setSpots(response.data.spots || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching spots:', error);
      setLoading(false);
    }
  };

  const fetchActiveSession = async (userId) => {
    try {
      const response = await axios.get(`/api/user/${userId}/active-session`);
      if (response.data.session) {
        setActiveSession(response.data.session);
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...spots];

    if (filters.zone !== 'all') {
      filtered = filtered.filter(spot => spot.zone === filters.zone);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(spot => 
        spot.features?.includes(filters.type.toLowerCase())
      );
    }

    if (filters.features !== 'all') {
      filtered = filtered.filter(spot => 
        spot.features?.includes(filters.features.toLowerCase())
      );
    }

    setFilteredSpots(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getBalance = () => {
    if (!user || !user.balance_lovelace) return '0.0';
    return (user.balance_lovelace / 1000000).toFixed(1);
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <h1 className="logo">🅿️ ParknGo</h1>
          <span className="tagline">Smart AI Parking</span>
        </div>
        <div className="header-right">
          {user ? (
            <>
              <div className="balance-display">
                <span className="balance-label">Balance:</span>
                <span className="balance-amount">{getBalance()} ADA</span>
                <button className="add-funds-btn" onClick={() => window.location.href = '/add-funds'}>
                  + Add
                </button>
              </div>
              <button className="profile-btn" onClick={() => window.location.href = '/profile'}>
                👤 Profile
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={() => window.location.href = '/login'}>
              Login / Sign Up
            </button>
          )}
        </div>
      </header>

      {/* Parking Info Banner */}
      <div className="parking-info-banner">
        <div className="info-item">
          <span className="info-icon">📍</span>
          <span className="info-text">AMB Mall Parking</span>
        </div>
        <div className="info-item">
          <span className="info-icon">⭐</span>
          <span className="info-text">{filteredSpots.length} spots available</span>
        </div>
        <div className="info-item">
          <span className="info-icon">💰</span>
          <span className="info-text">From 1.0 ADA/hr</span>
        </div>
      </div>

      {/* Live Map */}
      <div className="map-section">
        <h2 className="section-title">Live Parking Map</h2>
        <LiveParkingMap spots={spots} />
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3 className="filters-title">Filters:</h3>
        <select 
          className="filter-select"
          value={filters.zone}
          onChange={(e) => handleFilterChange('zone', e.target.value)}
        >
          <option value="all">All Zones</option>
          <option value="A">Zone A</option>
          <option value="B">Zone B</option>
          <option value="C">Zone C</option>
        </select>

        <select 
          className="filter-select"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="covered">Covered</option>
          <option value="open">Open Air</option>
        </select>

        <select 
          className="filter-select"
          value={filters.features}
          onChange={(e) => handleFilterChange('features', e.target.value)}
        >
          <option value="all">All Features</option>
          <option value="ev_charging">EV Charging</option>
          <option value="accessible">Accessible</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* Active Parking Session */}
      {activeSession && user && (
        <div className="active-session-section">
          <h3 className="section-title">My Active Parking</h3>
          <div className="active-session-card">
            <div className="session-info">
              <span className="session-icon">🚗</span>
              <div className="session-details">
                <h4>Parked at {activeSession.spot_id}</h4>
                <p className="session-time">
                  ⏱️ {calculateDuration(activeSession.start_time)} • 
                  💰 Current: {calculateCurrentCost(activeSession)} ADA
                </p>
              </div>
            </div>
            <div className="session-actions">
              <button 
                className="view-qr-btn"
                onClick={() => window.location.href = `/my-qr/${activeSession.session_id}`}
              >
                View QR
              </button>
              <button 
                className="end-parking-btn"
                onClick={() => handleEndParking(activeSession.session_id)}
              >
                End Parking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Spots List */}
      <div className="spots-section">
        <h2 className="section-title">
          Available Spots ({filteredSpots.length})
        </h2>
        
        {loading ? (
          <div className="loading-spinner">Loading spots...</div>
        ) : filteredSpots.length === 0 ? (
          <div className="no-spots-message">
            <p>😔 No spots available with current filters</p>
            <button onClick={() => setFilters({ zone: 'all', type: 'all', features: 'all' })}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="spots-grid">
            {filteredSpots.map(spot => (
              <SpotCard 
                key={spot.id} 
                spot={spot} 
                user={user}
                onSelect={() => handleSelectSpot(spot)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <p>🤖 Powered by 7 AI Agents • 🔗 Cardano Blockchain</p>
        <p className="footer-note">
          ✨ Browse spots for FREE • Add balance to book instantly
        </p>
      </footer>
    </div>
  );
}

// Helper functions
function calculateDuration(startTime) {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
}

function calculateCurrentCost(session) {
  const start = new Date(session.start_time);
  const now = new Date();
  const hours = (now - start) / (1000 * 60 * 60);
  const rate = session.hourly_rate_lovelace / 1000000;
  return (hours * rate).toFixed(2);
}

function handleSelectSpot(spot) {
  // Navigate to spot booking page
  window.location.href = `/book/${spot.id}`;
}

async function handleEndParking(sessionId) {
  if (!window.confirm('Are you sure you want to end this parking session?')) {
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem('parkngo_user'));
    const response = await axios.post('/api/parking/end-session', {
      session_id: sessionId,
      user_id: user.user_id
    });

    if (response.data.success) {
      alert(`Parking ended! ${response.data.refund_amount ? 
        `Refund: ${response.data.refund_amount / 1000000} ADA` : 
        `Extra charge: ${response.data.extra_charge / 1000000} ADA`
      }`);
      window.location.reload();
    }
  } catch (error) {
    console.error('Error ending parking:', error);
    alert('Failed to end parking session');
  }
}

export default Home;
