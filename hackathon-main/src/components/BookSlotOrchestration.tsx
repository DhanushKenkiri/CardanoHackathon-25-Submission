import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Car, 
  MapPin, 
  CreditCard, 
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface BookSlotOrchestrationProps {
  userId: string;
  vehicleId: string;
  onComplete?: (bookingId: string) => void;
  onCancel?: () => void;
}

interface OrchestrationStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  cost: number;
  icon: any;
  message?: string;
}

interface PaymentSession {
  session_id: string;
  minutes_elapsed: number;
  total_deducted_ada: number;
  rate_per_minute_ada: number;
  transactions: Array<{
    tx_hash: string;
    amount_ada: number;
    timestamp: string;
  }>;
  status: string;
}

export default function BookSlotOrchestration({ 
  userId, 
  vehicleId, 
  onComplete, 
  onCancel 
}: BookSlotOrchestrationProps) {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<OrchestrationStep[]>([
    { id: 'spot_finder', name: 'Finding Best Spot', status: 'pending', cost: 0.3, icon: MapPin },
    { id: 'vehicle_detector', name: 'Detecting Vehicle', status: 'pending', cost: 0.2, icon: Car },
    { id: 'payment_agent', name: 'Starting Payment', status: 'pending', cost: 0.4, icon: CreditCard }
  ]);

  const [orchestrating, setOrchestrating] = useState(false);
  const [orchestrationComplete, setOrchestrationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [spotId, setSpotId] = useState<string | null>(null);
  
  // Real-time payment session data
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
  const [pollingPayment, setPollingPayment] = useState(false);

  const updateStepStatus = (stepId: string, status: OrchestrationStep['status'], message?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, message } : step
    ));
  };

  const startOrchestration = async () => {
    setOrchestrating(true);
    setError(null);

    try {
      // Step 1: Start orchestration
      updateStepStatus('spot_finder', 'processing', 'Analyzing available spots...');

      const response = await fetch('http://localhost:5000/api/parking/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          vehicle_id: vehicleId,
          duration_hours: 2.0,
          user_location: { lat: 40.7128, lng: -74.0060 },
          vehicle_type: 'sedan',
          wallet_address: 'addr_test1vrjtn62vuzckgnw8fff7t246lq34633h4qkc8npvf5fzvrskjj36g'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Orchestration failed');
      }

      const result = data.orchestration_result;

      // Simulate step-by-step completion for UX
      setTimeout(() => {
        updateStepStatus('spot_finder', 'success', `Spot ${result.spot_id} selected`);
        setSpotId(result.spot_id);
        
        setTimeout(() => {
          updateStepStatus('vehicle_detector', 'processing', 'Validating vehicle...');
          
          setTimeout(() => {
            if (result.vehicle_detected && result.correct_vehicle) {
              updateStepStatus('vehicle_detector', 'success', 'Vehicle validated ✓');
              
              setTimeout(() => {
                updateStepStatus('payment_agent', 'processing', 'Initializing payment...');
                
                setTimeout(() => {
                  updateStepStatus('payment_agent', 'success', 'Payment started');
                  setOrchestrationComplete(true);
                  setBookingId(result.booking_id);
                  setSessionId(result.session_id);
                  
                  // Navigate to map view with spot details
                  setTimeout(() => {
                    navigate('/map', {
                      state: {
                        spotId: result.spot_id || 'A1',
                        bookingId: result.booking_id,
                        sessionId: result.session_id,
                        vehicleDetected: result.vehicle_detected,
                        correctVehicle: result.correct_vehicle
                      }
                    });
                  }, 1500);
                  
                  if (onComplete) onComplete(result.booking_id);
                }, 1000);
              }, 800);
            } else {
              updateStepStatus('vehicle_detector', 'failed', 'Vehicle validation failed');
              setError('Vehicle not detected or incorrect license plate');
            }
          }, 1500);
        }, 1000);
      }, 1200);

    } catch (err: any) {
      setError(err.message || 'Orchestration failed');
      // Mark all processing steps as failed
      setSteps(prev => prev.map(step => 
        step.status === 'processing' ? { ...step, status: 'failed' } : step
      ));
    } finally {
      setOrchestrating(false);
    }
  };

  // Poll payment session for real-time updates
  useEffect(() => {
    if (!pollingPayment || !sessionId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/payment-session/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPaymentSession(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch payment session:', err);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [pollingPayment, sessionId]);

  useEffect(() => {
    if (!orchestrating && !orchestrationComplete) {
      startOrchestration();
    }
  }, []);

  const getStepIcon = (step: OrchestrationStep) => {
    const Icon = step.icon;
    
    if (step.status === 'success') {
      return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    } else if (step.status === 'failed') {
      return <XCircle className="w-6 h-6 text-red-500" />;
    } else if (step.status === 'processing') {
      return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
    } else {
      return <Icon className="w-6 h-6 text-gray-500" />;
    }
  };

  const totalCost = steps.reduce((sum, step) => sum + step.cost, 0);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            Book Slot Orchestration
          </h1>
          <p className="text-gray-400">
            Executing 7-agent AI system with real Cardano payments
          </p>
        </motion.div>

        {/* Orchestration Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-6 rounded-lg border-2 transition-all duration-300
                ${step.status === 'success' ? 'border-green-500 bg-green-500/5' :
                  step.status === 'failed' ? 'border-red-500 bg-red-500/5' :
                  step.status === 'processing' ? 'border-blue-500 bg-blue-500/5 animate-pulse' :
                  'border-gray-800 bg-gray-900/50'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStepIcon(step)}
                  <div>
                    <h3 className="text-lg font-semibold">{step.name}</h3>
                    {step.message && (
                      <p className="text-sm text-gray-400 mt-1">{step.message}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-400">{step.cost} ADA</p>
                  <p className="text-xs text-gray-500">{step.status}</p>
                </div>
              </div>

              {/* Connector line to next step */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-full h-6 w-0.5 bg-gray-700 -translate-x-1/2" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Total Cost Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 p-6 rounded-lg bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30"
        >
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Total Agent Cost</span>
            <span className="text-3xl font-bold text-purple-400">{totalCost} ADA</span>
          </div>
        </motion.div>

        {/* Real-time Payment Progress Bar */}
        <AnimatePresence>
          {orchestrationComplete && paymentSession && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-8 rounded-lg bg-gradient-to-br from-green-900/30 to-blue-900/30 border-2 border-green-500/50"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-8 h-8 text-green-400 animate-pulse" />
                <h2 className="text-2xl font-bold">Real-time Payment Active</h2>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-black/50">
                  <p className="text-sm text-gray-400 mb-1">Time Elapsed</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {paymentSession.minutes_elapsed.toFixed(1)} min
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-black/50">
                  <p className="text-sm text-gray-400 mb-1">Total Deducted</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {paymentSession.total_deducted_ada.toFixed(4)} ADA
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-black/50">
                  <p className="text-sm text-gray-400 mb-1">Rate/Minute</p>
                  <p className="text-2xl font-bold text-green-400">
                    {paymentSession.rate_per_minute_ada.toFixed(4)} ADA
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((paymentSession.minutes_elapsed / 120) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Progress: {Math.min((paymentSession.minutes_elapsed / 120) * 100, 100).toFixed(1)}% (max 2 hours)
                </p>
              </div>

              {/* Transaction History */}
              {paymentSession.transactions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Transaction History</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {paymentSession.transactions.map((tx, idx) => (
                      <div key={idx} className="p-3 rounded bg-black/50 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-mono">
                              {tx.tx_hash.substring(0, 16)}...{tx.tx_hash.substring(tx.tx_hash.length - 8)}
                            </p>
                            <p className="text-xs text-gray-500">{tx.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-400 font-semibold">{tx.amount_ada} ADA</span>
                          <a
                            href={`https://preprod.cardanoscan.io/transaction/${tx.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Info */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Booking ID</p>
                    <p className="font-mono text-white">{bookingId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Spot ID</p>
                    <p className="font-mono text-white">{spotId}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-6 rounded-lg bg-red-900/20 border border-red-500"
            >
              <div className="flex items-center space-x-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <h3 className="font-semibold text-red-400">Orchestration Failed</h3>
                  <p className="text-sm text-gray-300 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          )}
          
          {orchestrationComplete && paymentSession && (
            <button
              onClick={() => {
                // End parking session
                alert('End parking functionality coming soon!');
              }}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-all"
            >
              End Parking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
