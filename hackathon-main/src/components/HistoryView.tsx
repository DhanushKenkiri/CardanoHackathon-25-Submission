import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Booking {
  booking_id: string;
  spot_id: string;
  vehicle_id: string;
  session_id: string;
  status: string;
  created_at: string;
  start_time: number;
  end_time?: number;
  duration_hours: number;
  orchestration_costs: {
    spot_finder_cost_ada: number;
    vehicle_detector_cost_ada: number;
    payment_agent_cost_ada: number;
    total_agent_cost_ada: number;
  };
  vehicle_validation: {
    detected: boolean;
    correct: boolean;
  };
}

interface Transaction {
  transaction_id: string;
  tx_hash: string;
  amount_lovelace: number;
  amount_ada: number;
  timestamp: string;
  type: string;
  status: string;
  booking_id?: string;
  session_id?: string;
  description: string;
  explorer_url: string;
}

interface PaymentSession {
  session_id: string;
  booking_id: string;
  spot_id: string;
  status: string;
  started_at: number;
  ended_at?: number;
  minutes_elapsed: number;
  total_deducted_lovelace: number;
  total_deducted_ada: number;
  rate_per_minute_ada: number;
  transactions_count: number;
}

interface HistoryViewProps {
  userId: string;
}

export default function HistoryView({ userId }: HistoryViewProps) {
  const [activeView, setActiveView] = useState<'bookings' | 'transactions' | 'sessions'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sessions, setSessions] = useState<PaymentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    fetchHistoryData();
  }, [userId, activeView]);

  const fetchHistoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeView === 'bookings') {
        const response = await fetch(`http://localhost:5000/api/bookings/history/${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setBookings(data.bookings);
        } else {
          setError(data.error);
        }
      } else if (activeView === 'transactions') {
        const response = await fetch(`http://localhost:5000/api/transactions/history/${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setTransactions(data.transactions);
          setTotalSpent(data.total_ada_spent);
        } else {
          setError(data.error);
        }
      } else if (activeView === 'sessions') {
        const response = await fetch(`http://localhost:5000/api/payment-sessions/history/${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setSessions(data.sessions);
        } else {
          setError(data.error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      active: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: Activity },
      completed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: CheckCircle },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: XCircle },
      confirmed: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border px-3 py-1`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatDate = (timestamp: string | number) => {
    const date = new Date(typeof timestamp === 'string' ? timestamp : timestamp * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-purple-400">{bookings.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Transactions</p>
                <p className="text-3xl font-bold text-blue-400">{transactions.length}</p>
              </div>
              <CreditCard className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-green-400">{totalSpent.toFixed(2)} ADA</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-800">
        <button
          onClick={() => setActiveView('bookings')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeView === 'bookings'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Bookings
        </button>
        <button
          onClick={() => setActiveView('transactions')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeView === 'transactions'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Transactions
        </button>
        <button
          onClick={() => setActiveView('sessions')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            activeView === 'sessions'
              ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Payment Sessions
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-400">Error Loading History</h3>
                <p className="text-sm text-gray-300 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings View */}
      {!loading && activeView === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="py-12 text-center">
                <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No bookings yet</p>
                <p className="text-gray-500 text-sm mt-2">Book a parking spot to see your history here</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking, idx) => (
              <motion.div
                key={booking.booking_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:border-purple-500/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Spot {booking.spot_id}
                        </h3>
                        <p className="text-sm text-gray-400 font-mono">{booking.booking_id}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                        <p className="text-sm font-semibold text-white">{booking.vehicle_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-semibold text-white">{booking.duration_hours}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Created</p>
                        <p className="text-sm font-semibold text-white">
                          {formatDate(booking.created_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Agent Cost</p>
                        <p className="text-sm font-semibold text-purple-400">
                          {booking.orchestration_costs?.total_agent_cost_ada || 0.9} ADA
                        </p>
                      </div>
                    </div>

                    {booking.vehicle_validation && (
                      <div className="flex gap-2 mt-4">
                        <Badge className={`${booking.vehicle_validation.detected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-0`}>
                          {booking.vehicle_validation.detected ? '✓' : '✗'} Vehicle Detected
                        </Badge>
                        <Badge className={`${booking.vehicle_validation.correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-0`}>
                          {booking.vehicle_validation.correct ? '✓' : '✗'} Correct Vehicle
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Transactions View */}
      {!loading && activeView === 'transactions' && (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="py-12 text-center">
                <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-2">Your Cardano blockchain transactions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            transactions.map((tx, idx) => (
              <motion.div
                key={tx.transaction_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:border-blue-500/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-blue-400">
                            {tx.amount_ada.toFixed(6)} ADA
                          </h3>
                          {getStatusBadge(tx.status)}
                        </div>
                        <p className="text-sm text-gray-400">{tx.description}</p>
                        <p className="text-xs text-gray-500 font-mono mt-2">
                          {tx.tx_hash ? (
                            <>
                              {tx.tx_hash.substring(0, 16)}...{tx.tx_hash.substring(tx.tx_hash.length - 8)}
                            </>
                          ) : (
                            'Pending transaction hash'
                          )}
                        </p>
                      </div>
                      {tx.explorer_url && (
                        <a
                          href={tx.explorer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2"
                        >
                          View on CardanoScan
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                        <p className="text-sm font-semibold text-white">
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="text-sm font-semibold text-white capitalize">{tx.type}</p>
                      </div>
                      {tx.booking_id && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                          <p className="text-xs font-mono text-white">{tx.booking_id}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Payment Sessions View */}
      {!loading && activeView === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="py-12 text-center">
                <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No payment sessions yet</p>
                <p className="text-gray-500 text-sm mt-2">Active payment sessions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session, idx) => (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 hover:border-green-500/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Spot {session.spot_id}
                        </h3>
                        <p className="text-sm text-gray-400 font-mono">{session.session_id}</p>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-semibold text-white">
                          {session.minutes_elapsed.toFixed(1)} min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Deducted</p>
                        <p className="text-sm font-semibold text-green-400">
                          {session.total_deducted_ada.toFixed(4)} ADA
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rate/Min</p>
                        <p className="text-sm font-semibold text-purple-400">
                          {session.rate_per_minute_ada.toFixed(4)} ADA
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Transactions</p>
                        <p className="text-sm font-semibold text-blue-400">
                          {session.transactions_count}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500 mb-1">Started</p>
                        <p className="text-white font-mono">{formatDate(session.started_at)}</p>
                      </div>
                      {session.ended_at && (
                        <div>
                          <p className="text-gray-500 mb-1">Ended</p>
                          <p className="text-white font-mono">{formatDate(session.ended_at)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
