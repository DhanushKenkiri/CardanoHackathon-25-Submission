import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './ParkingMap.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function ParkingMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([17.4239, 78.4738], 17);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Fetch parking spots
    fetchSpots();
    const interval = setInterval(fetchSpots, 5000);

    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && spots.length > 0) {
      updateMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots]);

  const fetchSpots = async () => {
    try {
      const res = await axios.get('/api/parking/spots');
      if (res.data.spots) {
        setSpots(res.data.spots);
      }
    } catch (error) {
      console.error('Error fetching spots:', error);
    }
  };

  const updateMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    spots.forEach(spot => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-content ${spot.occupied ? 'occupied' : 'available'}">
            <div class="marker-icon">
              <i class="fas fa-parking"></i>
            </div>
            <div class="marker-label">${spot.spot_id}</div>
          </div>
        `
      });

      const marker = L.marker([spot.location.lat, spot.location.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="marker-popup">
            <h3>Spot ${spot.spot_id}</h3>
            <p><strong>Status:</strong> ${spot.occupied ? 'Occupied' : 'Available'}</p>
            <p><strong>Type:</strong> ${spot.type || 'Standard'}</p>
            <p><strong>Rate:</strong> ₹40/hour</p>
          </div>
        `);

      markersRef.current.push(marker);
    });
  };

  return <div ref={mapRef} className="parking-map"></div>;
}

export default ParkingMap;
