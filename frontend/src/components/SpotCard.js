import React from 'react';
import '../styles/SpotCard.css';

function SpotCard({ spot, user, onSelect }) {
  const getHourlyRate = () => {
    return (spot.hourly_rate_lovelace / 1000000).toFixed(1);
  };

  const getDistance = () => {
    // Calculate distance from user location (mock for now)
    // In production, use user's geolocation
    return Math.floor(Math.random() * 150) + 20;
  };

  const getAIScore = () => {
    // AI recommendation score (mock for now)
    // In production, call pricing agent
    return Math.floor(Math.random() * 25) + 75;
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      'covered': '☂️',
      'ev_charging': '⚡',
      'accessible': '♿',
      'premium': '⭐',
      'regular': '🚗',
      'open': '🌤️'
    };
    return icons[feature] || '🅿️';
  };

  const getFeatureLabel = (feature) => {
    const labels = {
      'covered': 'Covered',
      'ev_charging': 'EV Charging',
      'accessible': 'Accessible',
      'premium': 'Premium',
      'regular': 'Regular',
      'open': 'Open Air'
    };
    return labels[feature] || feature;
  };

  return (
    <div className="spot-card">
      <div className="spot-card-header">
        <div className="spot-status-indicator">
          <span className="status-dot available"></span>
          <span className="spot-id">{spot.id}</span>
          <span className="spot-zone">Zone {spot.zone}</span>
        </div>
        <div className="ai-score-badge">
          ⭐ {getAIScore()}/100
        </div>
      </div>

      <div className="spot-card-body">
        <div className="spot-metrics">
          <div className="metric">
            <span className="metric-icon">📏</span>
            <span className="metric-value">{getDistance()}m away</span>
          </div>
          <div className="metric">
            <span className="metric-icon">💰</span>
            <span className="metric-value">{getHourlyRate()} ADA/hr</span>
          </div>
        </div>

        {spot.features && spot.features.length > 0 && (
          <div className="spot-features">
            {spot.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="feature-tag">
                {getFeatureIcon(feature)} {getFeatureLabel(feature)}
              </span>
            ))}
            {spot.features.length > 3 && (
              <span className="feature-tag more">
                +{spot.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {spot.location && (
          <div className="spot-location">
            <span className="location-icon">📍</span>
            <span className="location-text">
              {spot.location.description || `Lat: ${spot.location.lat}, Lng: ${spot.location.lng}`}
            </span>
          </div>
        )}
      </div>

      <div className="spot-card-footer">
        <button 
          className="select-spot-btn"
          onClick={onSelect}
          disabled={!user}
        >
          {user ? 'Select Spot →' : 'Login to Book'}
        </button>
        {!user && (
          <p className="login-hint">
            <a href="/login">Sign in</a> to book this spot
          </p>
        )}
      </div>
    </div>
  );
}

export default SpotCard;
