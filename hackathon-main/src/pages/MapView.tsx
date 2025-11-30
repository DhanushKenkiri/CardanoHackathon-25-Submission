import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Navigation, 
  Car, 
  CheckCircle, 
  Clock,
  MapPin,
  Send,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { subscribeToSpot, subscribeToQrScans } from '@/services/firebaseService';

interface LocationState {
  spotId: string;
  bookingId: string;
  sessionId: string;
  vehicleDetected: boolean;
  correctVehicle: boolean;
}

export default function MapView() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const [paymentStarted, setPaymentStarted] = useState(false);
  const [slotOccupied, setSlotOccupied] = useState(false);
  const [latestQrScan, setLatestQrScan] = useState<any | null>(null);
  const [previousSpotState, setPreviousSpotState] = useState<boolean | null>(null);

  // Monitor Firebase spot occupancy in real-time - ONLY TRIGGER FOR SPOT OCCUPIED
  useEffect(() => {
    if (!state?.spotId) return;

    console.log('🎯 Setting up Firebase spot occupancy listener...');

    const unsubscribeSpot = subscribeToSpot(state.spotId, (spot) => {
      const currentOccupied = Boolean(spot?.occupied);
      
      console.log(`📡 Spot update received - occupied: ${currentOccupied}, previous: ${previousSpotState}`);
      setSlotOccupied(currentOccupied);

      // CRITICAL: Only trigger payment when spot changes from false to true
      if (previousSpotState === false && currentOccupied === true) {
        console.log('🚨 SPOT OCCUPIED STATE CHANGED: false → true - TRIGGERING REAL-TIME PAYMENT!');
        if (!paymentStarted) {
          setPaymentStarted(true);
          
          // Navigate to dashboard with payment active
          setTimeout(() => {
            navigate('/dashboard', { 
              state: { 
                sessionId: state?.sessionId,
                bookingId: state?.bookingId,
                paymentActive: true,
                spotOccupied: true
              } 
            });
          }, 2000);
        }
      } else if (previousSpotState === null && currentOccupied === true) {
        console.log('✅ Spot already occupied on initial load');
        // Don't trigger payment on first load if already occupied
      } else if (previousSpotState === null && currentOccupied === false) {
        console.log('⏳ Initial state: spot not occupied yet, waiting...');
      }
      
      setPreviousSpotState(currentOccupied);
    });

    return () => {
      console.log('🔌 Unsubscribing from spot occupancy listener');
      unsubscribeSpot?.();
    };
  }, [state?.spotId, state?.sessionId, state?.bookingId, previousSpotState, paymentStarted, navigate]);

  // Monitor QR scans for display purposes only (not payment trigger)
  useEffect(() => {
    const unsubscribeQr = subscribeToQrScans((scan) => {
      console.log('📱 QR scan update (display only):', scan);
      setLatestQrScan(scan);
    });

    return () => {
      unsubscribeQr?.();
    };
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No booking data found</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-xl font-bold">Your Parking Spot</h1>
            <p className="text-sm text-gray-400">Booking ID: {state.bookingId}</p>
          </div>
          <div className="w-32" /> {/* Spacer for center alignment */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 3D Map Section - Large */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800 overflow-hidden">
              <CardContent className="p-0">
                {/* 3D Parking Lot Map - Sketchfab Embed */}
                <div className="relative h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                  <div className="sketchfab-embed-wrapper h-full w-full">
                    <iframe 
                      title="Modern Parking Area" 
                      frameBorder="0" 
                      allowFullScreen 
                      allow="autoplay; fullscreen; xr-spatial-tracking" 
                      src="https://sketchfab.com/models/a99ebc86d6224bffbaf310db880d72b6/embed"
                      className="w-full h-full"
                    />
                  </div>

                  {/* Legend Overlay */}
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span className="text-sm text-gray-300">Your Spot (A1)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-700 rounded" />
                        <span className="text-sm text-gray-300">Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Navigation className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-300">Interactive 3D View</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Status & Actions */}
          <div className="space-y-6">
            {/* Spot Details */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-bold">Spot Details</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Spot ID:</span>
                    <span className="font-semibold">{state.spotId || 'A1'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Row:</span>
                    <span className="font-semibold">A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Distance:</span>
                    <span className="font-semibold text-green-500">25m from entrance</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rate:</span>
                    <span className="font-semibold">1.2 ADA/hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-5 h-5 text-green-400" />
                      <span>Spot Occupancy</span>
                    </div>
                    {slotOccupied ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <Car className="w-5 h-5 text-blue-400" />
                      <span>Camera Detection</span>
                    </div>
                    {slotOccupied ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <span>QR Code Scan</span>
                    </div>
                    {latestQrScan ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                </div>

                {slotOccupied && paymentStarted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Spot Occupied - Payment Started!</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Real-time payment monitoring active. Redirecting to dashboard...
                    </p>
                  </motion.div>
                )}

                {!slotOccupied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 text-blue-400">
                      <Clock className="w-5 h-5 animate-pulse" />
                      <span className="font-semibold">Waiting for Vehicle</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Payment will start automatically when spot is occupied
                    </p>
                  </motion.div>
                )}

                {latestQrScan && (
                  <div className="mt-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-3">
                      <ImageIcon className="w-4 h-4 text-purple-400" />
                      <p className="text-sm font-semibold">Latest QR Scan</p>
                      <Badge variant="outline" className="text-xs">
                        {latestQrScan?.date} • {latestQrScan?.time}
                      </Badge>
                    </div>
                    {typeof latestQrScan.content === 'string' && latestQrScan.content.startsWith('data:image') ? (
                      <img
                        src={latestQrScan.content}
                        alt="Latest QR scan"
                        className="rounded-lg border border-gray-700"
                      />
                    ) : (
                      <div className="text-xs text-gray-400">
                        <p>Type: {latestQrScan?.type || 'Unknown'}</p>
                        <p>Payload: {latestQrScan?.content || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send to Vehicle Button */}
            <Card className="bg-gradient-to-r from-purple-900 to-pink-900 border-purple-700">
              <CardContent className="p-6">
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6"
                  disabled
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send to Your Vehicle
                </Button>
                <p className="text-xs text-gray-300 text-center mt-3">
                  Coming soon: Auto-navigation integration
                </p>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Session ID</h3>
                <p className="text-xs font-mono text-gray-500 break-all">{state.sessionId}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
