import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ParkingLot3D = ({ onSpotSelect, selectedSpot }) => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    fetchSpots();
    const interval = setInterval(fetchSpots, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await axios.get('/api/parking/spots/available');
      if (response.data.success) {
        setSpots(response.data.spots);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching spots:', error);
      setLoading(false);
    }
  };

  // Group spots by zone
  const groupedSpots = spots.reduce((acc, spot) => {
    const zone = spot.zone || 'A';
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(spot);
    return acc;
  }, {});

  const getZoneStats = (zone) => {
    const zoneSpots = groupedSpots[zone] || [];
    const available = zoneSpots.filter(s => !s.occupied).length;
    const total = zoneSpots.length;
    return { available, total, percentage: total > 0 ? (available / total) * 100 : 0 };
  };

  const getZoneColor = (zone) => {
    const stats = getZoneStats(zone);
    if (stats.percentage > 50) return '#10b981'; // Green - plenty available
    if (stats.percentage > 20) return '#f59e0b'; // Orange - limited
    if (stats.percentage > 0) return '#ef4444'; // Red - almost full
    return '#6b7280'; // Gray - full
  };

  // Parking zone positions (overlaid on 3D model)
  const zones = [
    { id: 'A', name: 'Zone A - Premium', top: '25%', left: '20%', width: '25%', height: '30%' },
    { id: 'B', name: 'Zone B - Regular', top: '25%', left: '50%', width: '25%', height: '30%' },
    { id: 'C', name: 'Zone C - Economy', top: '60%', left: '35%', width: '25%', height: '25%' }
  ];

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Sketchfab 3D Model Embed */}
      <iframe
        title="Modern Parking Area"
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allowFullScreen
        mozAllowFullScreen="true"
        webkitAllowFullScreen="true"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        xr-spatial-tracking="true"
        execution-while-out-of-viewport="true"
        execution-while-not-rendered="true"
        web-share="true"
        src="https://sketchfab.com/models/a99ebc86d6224bffbaf310db880d72b6/embed?autostart=1&ui_theme=dark&ui_hint=0&ui_controls=1&ui_infos=0&ui_inspector=0&ui_watermark=0"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="text-white text-xl">Loading parking data...</div>
        </div>
      )}

      {/* Interactive Zone Overlays */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {zones.map((zone) => {
          const stats = getZoneStats(zone.id);
          const color = getZoneColor(zone.id);
          const isHovered = hoveredZone === zone.id;
          const isSelected = selectedSpot?.zone === zone.id;

          return (
            <motion.div
              key={zone.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                top: zone.top,
                left: zone.left,
                width: zone.width,
                height: zone.height
              }}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => {
                if (stats.available > 0) {
                  // Select first available spot in zone
                  const availableSpot = groupedSpots[zone.id]?.find(s => !s.occupied);
                  if (availableSpot && onSpotSelect) {
                    onSpotSelect(availableSpot);
                  }
                }
              }}
              whileHover={{ scale: 1.02 }}
              animate={{
                scale: isSelected ? 1.05 : 1,
                opacity: isHovered || isSelected ? 0.9 : 0.6
              }}
            >
              {/* Zone Overlay */}
              <div
                className="w-full h-full rounded-lg border-4 transition-all duration-300"
                style={{
                  backgroundColor: `${color}20`,
                  borderColor: color,
                  boxShadow: isHovered || isSelected ? `0 0 30px ${color}` : 'none'
                }}
              >
                {/* Zone Info Card */}
                <div
                  className="absolute top-2 left-2 bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-lg p-3 border-2"
                  style={{ borderColor: color }}
                >
                  <div className="text-white font-bold text-sm mb-1">{zone.name}</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-white text-xs font-semibold">
                      {stats.available}/{stats.total} Available
                    </span>
                  </div>
                  {isHovered && stats.available > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-green-400 font-semibold"
                    >
                      Click to select
                    </motion.div>
                  )}
                  {stats.available === 0 && (
                    <div className="mt-2 text-xs text-red-400 font-semibold">
                      FULL
                    </div>
                  )}
                </div>

                {/* Pulsing Animation for Selected Zone */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    style={{ borderColor: color }}
                    animate={{
                      borderWidth: ['4px', '8px', '4px'],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 right-8 bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 z-30 border-2 border-gray-700">
        <div className="text-white font-bold text-sm mb-3">Legend</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-white text-xs">Plenty Available (&gt;50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span className="text-white text-xs">Limited (20-50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-white text-xs">Almost Full (&lt;20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500" />
            <span className="text-white text-xs">Full</span>
          </div>
        </div>
      </div>

      {/* Total Stats */}
      <div className="absolute top-8 left-8 bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 z-30 border-2 border-blue-500">
        <div className="text-white font-bold text-lg mb-2">ParknGo Live</div>
        <div className="text-gray-300 text-sm">
          Total Available: <span className="text-green-400 font-bold">
            {spots.filter(s => !s.occupied).length}
          </span> / {spots.length}
        </div>
      </div>
    </div>
  );
};

export default ParkingLot3D;
