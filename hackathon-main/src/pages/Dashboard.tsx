import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  MapPin,
  Wallet,
  Sparkles,
  Navigation,
  AlertCircle,
  CheckCircle,
  XCircle,
  Menu,
  Home,
  History,
  Shield,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

import { subscribeToParkingSpots } from '@/services/firebaseService';
import { useWalletBalance, getTransactionHistory, type WalletBalance, type Transaction } from '@/services/walletService';
import { createReservation, startParking, endParking, type ParkingSpot } from '@/services/parkingApi';
import { CUSTOMER_WALLET_ADDRESS } from '@/config/api';
import BookSlotOrchestration from '@/components/BookSlotOrchestration';
import HistoryView from '@/components/HistoryView';
import DisputeChatbot from '@/components/DisputeChatbot';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'booking' | 'history' | 'disputes'>('overview');
  const [showBookingUI, setShowBookingUI] = useState(false);
  const [showOrchestration, setShowOrchestration] = useState(false);
  const [showDisputeChat, setShowDisputeChat] = useState(false);
  
  // Poll every 30 seconds to conserve Blockfrost API credits
  const { balance, loading: balanceLoading, error: balanceError } = useWalletBalance(30000);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentCost, setCurrentCost] = useState(0);
  const [txHistory, setTxHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToParkingSpots((spots: any) => {
      const firebaseSpot = Array.isArray(spots) && spots.length > 0 ? spots[0] : null;
      const singleSpot: ParkingSpot = {
        id: firebaseSpot?.id || 'spot_01',
        zone: 'A',
        floor: 'Ground Floor',
        row: 'A',
        column: 1,
        status: firebaseSpot?.occupied ? 'occupied' : 'available',
        occupied: firebaseSpot?.occupied || false,
        features: ['standard'],
        distanceFromEntrance: firebaseSpot?.distance_from_entrance || 25,
      };
      setParkingSpots([singleSpot]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getTransactionHistory();
        setTxHistory(history.slice(0, 5));
      } catch (error) {
        console.error('Failed to load transaction history:', error);
      }
    };
    loadHistory();
  }, [refreshKey]);

  useEffect(() => {
    if (!sessionStartTime) return;
    const interval = setInterval(() => {
      const now = new Date();
      const durationMinutes = Math.floor((now.getTime() - sessionStartTime.getTime()) / 60000);
      setCurrentCost(durationMinutes * 0.01);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const handleReserveSpot = async (spotId: string) => {
    try {
      toast.loading('AI agents finding best spot...');
      const result = await createReservation({
        user_id: 'demo_user',
        spot_id: spotId,
        vehicle_type: 'sedan',
        wallet_address: CUSTOMER_WALLET_ADDRESS,
      });
      setSelectedSpot(spotId);
      setActiveSession(result.session_id);
      toast.success(`Spot ${spotId} reserved! ${result.agents_executed.length} AI agents used.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reserve spot');
    }
  };

  const handleStartParking = async () => {
    if (!selectedSpot || !activeSession) return;
    try {
      toast.loading('Starting parking session...');
      const result = await startParking({
        session_id: activeSession,
        spot_id: selectedSpot,
        wallet_address: CUSTOMER_WALLET_ADDRESS,
      });
      setBookingId(result.booking_id);
      setSessionStartTime(new Date());
      toast.success(`Parking started! TX: ${result.initial_payment_tx_hash.substring(0, 12)}...`);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start parking');
    }
  };

  const handleEndParking = async () => {
    if (!activeSession || !bookingId) return;
    try {
      toast.loading('Ending parking session...');
      const result = await endParking({
        session_id: activeSession,
        booking_id: bookingId,
      });
      toast.success(`Parking ended! Total: ${result.total_cost_ada} ADA. TX: ${result.final_payment_tx_hash.substring(0, 12)}...`);
      setActiveSession(null);
      setSelectedSpot(null);
      setBookingId(null);
      setSessionStartTime(null);
      setCurrentCost(0);
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Failed to end parking');
    }
  };

  const availableSpots = parkingSpots.filter(spot => spot.status === 'available');
  const occupiedSpots = parkingSpots.filter(spot => spot.status === 'occupied');
  const sidebarWidth = sidebarOpen ? '300px' : '0px';
  const contentMargin = sidebarOpen ? '300px' : '0px';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-gray-950 to-black border-r border-white/10 backdrop-blur-xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="text-4xl">🅿️</div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ParknGo
              </h1>
              <p className="text-xs text-gray-400">PREPROD</p>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-400/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Wallet className="w-4 h-4" />
                  <span>Wallet Balance</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRefreshKey(prev => prev + 1)}
                  disabled={balanceLoading}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`w-3 h-3 ${balanceLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {balanceError ? (
                <p className="text-red-400 text-sm">Error loading balance</p>
              ) : (
                <>
                  <div className="text-3xl font-bold mb-1">
                    {balanceLoading ? '...' : (balance?.balance_ada?.toFixed(2) ?? '0.00')} ADA
                  </div>
                  <div className="text-xs text-gray-400">
                    Network: <Badge variant="outline" className="ml-1">ADA-Preprod</Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <nav className="space-y-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'overview' ? 'bg-blue-600' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Home className="w-4 h-4 mr-3" />
              Parking Overview
            </Button>
            <Button
              variant={activeTab === 'booking' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'booking' ? 'bg-blue-600' : ''}`}
              onClick={() => setActiveTab('booking')}
            >
              <MapPin className="w-4 h-4 mr-3" />
              My Booking
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'history' ? 'bg-blue-600' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History className="w-4 h-4 mr-3" />
              Transaction History
            </Button>
            <Button
              variant={activeTab === 'disputes' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'disputes' ? 'bg-blue-600' : ''}`}
              onClick={() => setActiveTab('disputes')}
            >
              <Shield className="w-4 h-4 mr-3" />
              Dispute Management
            </Button>
          </nav>

          {activeSession && (
            <Card className="mt-8 bg-green-600/20 border-green-400/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-semibold">Active Session</span>
                </div>
                <div className="text-2xl font-bold mb-1">{currentCost.toFixed(3)} ADA</div>
                <div className="text-xs text-gray-400">
                  Spot: {selectedSpot} • {sessionStartTime ? Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000) : 0} min
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.aside>

      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 z-40 bg-black/95 backdrop-blur-xl border border-blue-500/30 hover:border-blue-400/60"
        size="icon"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <main className="min-h-screen transition-all duration-300 p-8 relative z-10" style={{ marginLeft: contentMargin }}>
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && !showBookingUI && (
            <div className="min-h-[60vh] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-2xl"
              >
                <div className="mb-8">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-8xl mb-6"
                  >
                    🅿️
                  </motion.div>
                  <h2 className="text-6xl font-black mb-6">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Find Your Perfect Spot
                    </span>
                  </h2>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/30">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-lg text-green-400 font-semibold">
                      {availableSpots.length} spots available now
                    </span>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={() => setShowOrchestration(true)}
                    className="relative group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-3xl px-20 py-10 rounded-3xl shadow-2xl shadow-blue-500/30 transition-all"
                  >
                    <span className="relative z-10 flex items-center">
                      <MapPin className="w-10 h-10 mr-4" />
                      Book a Slot
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          )}

          {activeTab === 'overview' && showBookingUI && (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingUI(false)}
                  className="bg-white/5 border-white/10"
                >
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to Overview
                </Button>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span>Available: {availableSpots.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span>Occupied: {occupiedSpots.length}</span>
                  </div>
                </div>
              </div>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Parking Layout - Real-Time Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Entrance Indicator */}
                  <div className="mb-8 flex items-center justify-center">
                    <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-400/50 rounded-lg px-12 py-3 text-center">
                      <div className="text-sm font-semibold text-blue-300 mb-1">🚗 ENTRANCE</div>
                      <div className="text-xs text-gray-400">Main Entry Gate</div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* VIP Parking Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <h3 className="text-lg font-bold text-yellow-400">VIP Parking</h3>
                        <span className="text-xs text-gray-500">Premium spots near entrance</span>
                      </div>
                      <div className="grid grid-cols-6 gap-3">
                        {/* Real spot - spot_01 */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            className={`w-full h-20 flex flex-col items-center justify-center gap-1 ${
                              selectedSpot === 'spot_01' 
                                ? 'bg-blue-600/40 border-blue-400 ring-2 ring-blue-400' 
                                : 'bg-green-600/20 border-green-400/50 hover:bg-green-600/30'
                            }`}
                            onClick={() => handleReserveSpot('spot_01')}
                          >
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span className="font-semibold text-xs">V01</span>
                            <span className="text-[10px] text-green-400">Available</span>
                          </Button>
                        </motion.div>
                        
                        {/* Mock VIP spots - occupied */}
                        {['V02', 'V03', 'V04', 'V05', 'V06'].map((spot) => (
                          <div key={spot} className="opacity-60 cursor-not-allowed">
                            <Button
                              variant="outline"
                              disabled
                              className="w-full h-20 flex flex-col items-center justify-center gap-1 bg-red-600/20 border-red-400/50"
                            >
                              <MapPin className="w-4 h-4 text-red-400" />
                              <span className="font-semibold text-xs">{spot}</span>
                              <span className="text-[10px] text-red-400">Occupied</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* EV Charging Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <h3 className="text-lg font-bold text-green-400">EV Charging Stations</h3>
                        <span className="text-xs text-gray-500">Electric vehicle parking with charging</span>
                      </div>
                      <div className="grid grid-cols-8 gap-3">
                        {['E01', 'E02', 'E03', 'E04'].map((spot, idx) => (
                          <div key={spot} className={idx % 2 === 0 ? "opacity-60 cursor-not-allowed" : ""}>
                            <Button
                              variant="outline"
                              disabled={idx % 2 === 0}
                              className={`w-full h-20 flex flex-col items-center justify-center gap-1 ${
                                idx % 2 === 0
                                  ? 'bg-red-600/20 border-red-400/50'
                                  : 'bg-green-600/20 border-green-400/50 hover:bg-green-600/30'
                              }`}
                            >
                              <span className="text-lg">⚡</span>
                              <span className="font-semibold text-xs">{spot}</span>
                              <span className={`text-[10px] ${idx % 2 === 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {idx % 2 === 0 ? 'Occupied' : 'Available'}
                              </span>
                            </Button>
                          </div>
                        ))}
                        <div className="col-span-4"></div>
                      </div>
                    </div>

                    {/* 2-Wheeler Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <h3 className="text-lg font-bold text-cyan-400">2-Wheeler Parking</h3>
                        <span className="text-xs text-gray-500">Bikes & scooters</span>
                      </div>
                      <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: 20 }, (_, i) => `B${String(i + 1).padStart(2, '0')}`).map((spot, idx) => (
                          <div key={spot} className={idx > 5 ? "opacity-60 cursor-not-allowed" : ""}>
                            <Button
                              variant="outline"
                              disabled={idx > 5}
                              className={`w-full h-16 flex flex-col items-center justify-center gap-1 ${
                                idx > 5
                                  ? 'bg-red-600/20 border-red-400/50'
                                  : 'bg-green-600/20 border-green-400/50 hover:bg-green-600/30'
                              }`}
                            >
                              <span className="text-sm">🏍️</span>
                              <span className="font-semibold text-[10px]">{spot}</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Regular Parking - Multiple Rows */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <h3 className="text-lg font-bold text-blue-400">Regular Parking</h3>
                        <span className="text-xs text-gray-500">Standard 4-wheeler spots</span>
                      </div>
                      
                      {/* Row A */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-gray-400 mb-2">Row A</div>
                        <div className="grid grid-cols-10 gap-3">
                          {Array.from({ length: 10 }, (_, i) => `A${String(i + 1).padStart(2, '0')}`).map((spot, idx) => (
                            <div key={spot} className={idx < 3 ? "" : "opacity-60 cursor-not-allowed"}>
                              <Button
                                variant="outline"
                                disabled={idx >= 3}
                                className={`w-full h-20 flex flex-col items-center justify-center gap-1 ${
                                  idx < 3
                                    ? 'bg-green-600/20 border-green-400/50 hover:bg-green-600/30'
                                    : 'bg-red-600/20 border-red-400/50'
                                }`}
                              >
                                <MapPin className={`w-4 h-4 ${idx < 3 ? 'text-green-400' : 'text-red-400'}`} />
                                <span className="font-semibold text-xs">{spot}</span>
                                <span className={`text-[10px] ${idx < 3 ? 'text-green-400' : 'text-red-400'}`}>
                                  {idx < 3 ? 'Free' : 'Taken'}
                                </span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Row B */}
                      <div className="mb-4">
                        <div className="text-xs font-semibold text-gray-400 mb-2">Row B</div>
                        <div className="grid grid-cols-10 gap-3">
                          {Array.from({ length: 10 }, (_, i) => `B${String(i + 1).padStart(2, '0')}`).map((spot, idx) => (
                            <div key={spot} className="opacity-60 cursor-not-allowed">
                              <Button
                                variant="outline"
                                disabled
                                className="w-full h-20 flex flex-col items-center justify-center gap-1 bg-red-600/20 border-red-400/50"
                              >
                                <MapPin className="w-4 h-4 text-red-400" />
                                <span className="font-semibold text-xs">{spot}</span>
                                <span className="text-[10px] text-red-400">Taken</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Row C */}
                      <div>
                        <div className="text-xs font-semibold text-gray-400 mb-2">Row C</div>
                        <div className="grid grid-cols-10 gap-3">
                          {Array.from({ length: 10 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`).map((spot, idx) => (
                            <div key={spot} className={idx % 3 === 0 ? "" : "opacity-60 cursor-not-allowed"}>
                              <Button
                                variant="outline"
                                disabled={idx % 3 !== 0}
                                className={`w-full h-20 flex flex-col items-center justify-center gap-1 ${
                                  idx % 3 === 0
                                    ? 'bg-green-600/20 border-green-400/50 hover:bg-green-600/30'
                                    : 'bg-red-600/20 border-red-400/50'
                                }`}
                              >
                                <MapPin className={`w-4 h-4 ${idx % 3 === 0 ? 'text-green-400' : 'text-red-400'}`} />
                                <span className="font-semibold text-xs">{spot}</span>
                                <span className={`text-[10px] ${idx % 3 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {idx % 3 === 0 ? 'Free' : 'Taken'}
                                </span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-8 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-600/30 border border-green-400/50"></div>
                      <span className="text-gray-400">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-600/40 border border-blue-400 ring-2 ring-blue-400"></div>
                      <span className="text-gray-400">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-600/30 border border-red-400/50"></div>
                      <span className="text-gray-400">Occupied</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-6">
              {selectedSpot ? (
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Spot {selectedSpot}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Status</div>
                        <Badge className={bookingId ? 'bg-green-600' : 'bg-yellow-600'}>
                          {bookingId ? 'Active' : 'Reserved'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Current Cost</div>
                        <div className="text-2xl font-bold">{currentCost.toFixed(3)} ADA</div>
                      </div>
                    </div>

                    {!bookingId ? (
                      <Button onClick={handleStartParking} className="w-full bg-gradient-to-r from-blue-600 to-purple-600" size="lg">
                        <Navigation className="w-5 h-5 mr-2" />
                        Start Parking
                      </Button>
                    ) : (
                      <Button onClick={handleEndParking} className="w-full bg-gradient-to-r from-red-600 to-orange-600" size="lg">
                        <XCircle className="w-5 h-5 mr-2" />
                        End Parking
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No active booking</p>
                    <p className="text-gray-500 text-sm mt-2">Select a spot from the overview to begin</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryView userId="user_001" />
          )}

          {activeTab === 'disputes' && (
            <div className="space-y-6">
              {/* Dispute Info Card */}
              <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    AI Dispute Resolution System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Our AI-powered dispute resolution system provides fair, transparent arbitration using Gemini AI and bilateral escrow on the Cardano blockchain.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="p-4 rounded-lg bg-black/30 border border-purple-500/20">
                        <div className="text-3xl mb-2">💬</div>
                        <h4 className="font-semibold text-white mb-1">Chat Interface</h4>
                        <p className="text-sm text-gray-400">Describe your issue to our AI agent</p>
                      </div>
                      <div className="p-4 rounded-lg bg-black/30 border border-purple-500/20">
                        <div className="text-3xl mb-2">💰</div>
                        <h4 className="font-semibold text-white mb-1">Bilateral Staking</h4>
                        <p className="text-sm text-gray-400">Both parties stake equal amounts</p>
                      </div>
                      <div className="p-4 rounded-lg bg-black/30 border border-purple-500/20">
                        <div className="text-3xl mb-2">⚖️</div>
                        <h4 className="font-semibold text-white mb-1">AI Arbitration</h4>
                        <p className="text-sm text-gray-400">Gemini AI analyzes and decides winner</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-400 mb-1">How It Works</h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Click "Raise a Ticket" to start a dispute</li>
                            <li>• Describe your issue in the chat interface</li>
                            <li>• Stake the disputed amount (owner stakes equal)</li>
                            <li>• AI analyzes evidence from both parties</li>
                            <li>• Winner receives all staked funds</li>
                            <li>• 0.5 ADA arbitration fee applies</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-6"
                    >
                      <Button
                        onClick={() => setShowDisputeChat(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-6 text-lg"
                      >
                        <Shield className="w-6 h-6 mr-2" />
                        Raise a Ticket
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Past Disputes */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Past Disputes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No disputes filed yet</p>
                    <p className="text-gray-500 text-sm mt-1">Your dispute history will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Book Slot Orchestration Modal */}
      {showOrchestration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
        >
          <BookSlotOrchestration
            userId="user_001"
            vehicleId="ABC123"
            onComplete={(bookingId) => {
              setActiveTab('booking');
              toast.success(`Booking complete! ID: ${bookingId}`);
            }}
            onCancel={() => {
              setShowOrchestration(false);
              setActiveTab('overview');
            }}
          />
        </motion.div>
      )}

      {/* Dispute Chatbot Modal */}
      {showDisputeChat && (
        <DisputeChatbot
          userId="user_001"
          sessionId={activeSession || undefined}
          bookingId={bookingId || undefined}
          onClose={() => setShowDisputeChat(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
