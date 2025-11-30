import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/LiveParkingMap.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function LiveParkingMap({ spots }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // AMB Mall parking location (Hyderabad)
  const center = [17.4239, 78.4738];
  const zoom = 18;

  useEffect(() => {
    // Initialize map only once
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add "You are here" marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div class="user-marker">📍</div>',
        iconSize: [30, 30],
      });

      L.marker(center, { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>You are here</b><br>Current Location');
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when spots change
  useEffect(() => {
    if (!mapInstanceRef.current || !spots) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    spots.forEach((spot, index) => {
      // Generate random location around AMB Mall
      const lat = center[0] + (Math.random() - 0.5) * 0.002;
      const lng = center[1] + (Math.random() - 0.5) * 0.002;

      const isOccupied = spot.occupied || false;
      const markerColor = isOccupied ? '#f44336' : '#4caf50';

      // Custom icon
      const customIcon = L.divIcon({
        className: 'custom-parking-marker',
        html: `
          <div class="marker-pin" style="background-color: ${markerColor}">
            <span class="marker-label">${spot.id}</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(mapInstanceRef.current);

      // Popup content
      const popupContent = `
        <div class="spot-popup">
          <h3 class="popup-title">${isOccupied ? '🔴' : '🟢'} ${spot.id}</h3>
          <p class="popup-detail"><strong>Zone:</strong> ${spot.zone}</p>
          <p class="popup-detail"><strong>Status:</strong> ${isOccupied ? 'Occupied' : 'Available'}</p>
          <p class="popup-detail"><strong>Rate:</strong> ${(spot.hourly_rate_lovelace / 1000000).toFixed(1)} ADA/hr</p>
          ${spot.features ? `
            <p class="popup-detail"><strong>Features:</strong></p>
            <div class="popup-features">
              ${spot.features.map(f => `<span class="popup-feature-tag">${f}</span>`).join('')}
            </div>
          ` : ''}
          ${!isOccupied ? `
            <button class="popup-book-btn" onclick="window.location.href='/book/${spot.id}'">
              Book This Spot
            </button>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      });

      markersRef.current[spot.id] = marker;
    });
  }, [spots]);

  return (
    <div className="live-parking-map-container">
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot occupied"></span>
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">📍</span>
          <span>Your Location</span>
        </div>
      </div>
      <div ref={mapRef} className="map-element" />
    </div>
  );
}

export default LiveParkingMap;
