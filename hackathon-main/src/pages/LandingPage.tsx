import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Brain,
  DollarSign,
  Navigation,
  Shield,
  MapPin,
  Clock,
  Wallet,
  CheckCircle,
  GitBranch,
  Database,
  Cpu,
  Network,
  Lock,
  Eye,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { subscribeToParkingSpots } from '@/services/firebaseService';
import LightRays from '@/components/LightRays';
import FloatingParticles from '@/components/FloatingParticles';

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 30, available: 0, occupied: 0 });

  useEffect(() => {
    const unsubscribe = subscribeToParkingSpots((spots: any) => {
      const available = spots.filter((s: any) => !s.occupied).length;
      const occupied = spots.filter((s: any) => s.occupied).length;
      setStats({ total: spots.length, available, occupied });
    });
    return unsubscribe;
  }, []);

  const agents = [
    {
      name: 'Spot Finder',
      icon: Brain,
      description: 'AI analyzes all spots, evaluates proximity, availability, and user preferences',
      cost: '0.3 ADA',
      color: 'blue',
      features: ['Real-time availability', 'Proximity analysis', 'Preference matching']
    },
    {
      name: 'Pricing Agent',
      icon: DollarSign,
      description: 'Dynamic pricing based on demand, location, time, and market conditions',
      cost: '0.3 ADA',
      color: 'purple',
      features: ['Demand-based pricing', 'Time-of-day rates', 'Fair market value']
    },
    {
      name: 'Route Optimizer',
      icon: Navigation,
      description: 'Calculates fastest path from entry to your assigned spot',
      cost: '0.3 ADA',
      color: 'green',
      features: ['Turn-by-turn directions', 'Traffic awareness', 'ETA calculation']
    },
    {
      name: 'Payment Verifier',
      icon: Shield,
      description: 'Validates Cardano transactions and ensures payment security',
      cost: '0.4 ADA',
      color: 'orange',
      features: ['Blockchain verification', 'Transaction monitoring', 'Payment security']
    },
    {
      name: 'Vehicle Detector',
      icon: Eye,
      description: 'Computer vision validates correct vehicle in assigned spot',
      cost: '0.2 ADA',
      color: 'pink',
      features: ['License plate recognition', 'Vehicle matching', 'Real-time validation']
    },
    {
      name: 'Security Guard',
      icon: Lock,
      description: 'Monitors overstay violations and unauthorized parking',
      cost: '0.2 ADA',
      color: 'red',
      features: ['Violation detection', '20% commission', '24/7 monitoring']
    },
    {
      name: 'Dispute Resolver',
      icon: Users,
      description: 'AI-powered arbitration for parking disputes with staking',
      cost: '0.5 ADA',
      color: 'cyan',
      features: ['Staking mechanism', 'Evidence review', 'Fair resolution']
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* Animated Light Rays Background */}
      <div className="fixed inset-0 pointer-events-none z-0">\n        <LightRays
          raysOrigin="top-center"
          raysColor="#3b82f6"
          raysSpeed={1.2}
          lightSpread={0.6}
          rayLength={1.5}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.05}
          distortion={0.03}
          pulsating={false}
          fadeDistance={1.2}
          saturation={0.8}
        />
      </div>

      {/* Multi-layer Dark Background with Depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }} />
        
        {/* Animated grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
        
        {/* Radial gradient spotlight */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/10 via-transparent to-transparent" />
        
        {/* Dramatic dark gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-[#0a0a0f] to-purple-950/20" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/5 via-transparent to-purple-900/5" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center py-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ParknGo
                </span>
              </h1>
              
              <p className="text-3xl text-gray-300 mb-10 max-w-4xl mx-auto font-light">
                Future of parking, with <span className="font-bold text-blue-400">agentic orchestration</span> powered by <span className="font-bold text-green-400">cardano</span>
              </p>

              {/* Live Stats Row */}
              <div className="flex justify-center gap-6 mb-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-green-500/20 to-green-900/10 backdrop-blur-md rounded-2xl px-10 py-6 border border-green-400/30 shadow-lg shadow-green-500/10"
                >
                  <div className="text-5xl font-black text-green-400 mb-2">{stats.available}</div>
                  <div className="text-xs text-green-200/80 uppercase tracking-widest font-semibold">Available Now</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-blue-500/20 to-blue-900/10 backdrop-blur-md rounded-2xl px-10 py-6 border border-blue-400/30 shadow-lg shadow-blue-500/10"
                >
                  <div className="text-5xl font-black text-blue-400 mb-2">7</div>
                  <div className="text-xs text-blue-200/80 uppercase tracking-widest font-semibold">AI Agents</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-purple-500/20 to-purple-900/10 backdrop-blur-md rounded-2xl px-10 py-6 border border-purple-400/30 shadow-lg shadow-purple-500/10"
                >
                  <div className="text-5xl font-black text-purple-400 mb-2">100%</div>
                  <div className="text-xs text-purple-200/80 uppercase tracking-widest font-semibold">Real Blockchain</div>
                </motion.div>
              </div>

              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-2xl px-16 py-8 rounded-2xl shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-all mb-3"
              >
                <Sparkles className="w-7 h-7 mr-3" />
                Proof of Concept
                <ArrowRight className="w-7 h-7 ml-3" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* System Architecture Diagram */}
        <section className="py-20 px-6 bg-gradient-to-b from-[#0a0a0f] via-blue-950/20 to-[#0a0a0f] border-y border-blue-900/10">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-6xl font-black mb-4">System Architecture</h2>
              <p className="text-xl text-gray-400">Complete production-ready infrastructure</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Frontend */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-blue-950/40 to-[#0a0a0f] border border-blue-500/20 h-full shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-800/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <Cpu className="w-6 h-6" />
                      Frontend Layer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">React 18 + TypeScript</div>
                        <div className="text-sm text-gray-400">Type-safe UI components</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">shadcn/ui + Tailwind</div>
                        <div className="text-sm text-gray-400">Modern design system</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">Framer Motion</div>
                        <div className="text-sm text-gray-400">Smooth animations</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">Real-time Firebase</div>
                        <div className="text-sm text-gray-400">Live updates</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Backend */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-purple-950/40 to-[#0a0a0f] border border-purple-500/20 h-full shadow-xl shadow-purple-900/10 hover:shadow-2xl hover:shadow-purple-800/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-400">
                      <Network className="w-6 h-6" />
                      Backend Layer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">Flask REST API</div>
                        <div className="text-sm text-gray-400">Python 3.14 server</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">7 AI Agents</div>
                        <div className="text-sm text-gray-400">Google Gemini powered</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">PyCardano</div>
                        <div className="text-sm text-gray-400">Blockchain integration</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">Firebase Admin</div>
                        <div className="text-sm text-gray-400">Real-time database</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Blockchain */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-green-950/40 to-[#0a0a0f] border border-green-500/20 h-full shadow-xl shadow-green-900/10 hover:shadow-2xl hover:shadow-green-800/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                      <Lock className="w-6 h-6" />
                      Blockchain Layer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">Cardano Preprod</div>
                        <div className="text-sm text-gray-400">Testnet network</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">Blockfrost API</div>
                        <div className="text-sm text-gray-400">Network access</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">Real ADA Payments</div>
                        <div className="text-sm text-gray-400">No mock data</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">Transaction Tracking</div>
                        <div className="text-sm text-gray-400">Full transparency</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Agent Orchestration Flow */}
        <section className="py-20 px-6 bg-gradient-to-b from-[#0a0a0f] to-purple-950/10">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Agent Orchestration Flow
                </span>
              </h2>
              <p className="text-xl text-gray-400">How 7 autonomous agents work together</p>
            </motion.div>

            {/* Simplified flow visualization */}
            <div className="max-w-4xl mx-auto space-y-6">
              <motion.div 
                whileInView={{ opacity: 1, x: 0 }} 
                initial={{ opacity: 0, x: -30 }} 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center shadow-2xl shadow-blue-500/20"
              >
                <div className="text-3xl font-black">1. User Clicks "Book Slot" → Orchestration Starts</div>
              </motion.div>
              
              <div className="flex justify-center">
                <motion.div 
                  initial={{ height: 0 }}
                  whileInView={{ height: 48 }}
                  transition={{ duration: 0.6 }}
                  className="w-1 bg-gradient-to-b from-purple-500 to-blue-500"
                />
              </div>

              <motion.div 
                whileInView={{ opacity: 1, x: 0 }} 
                initial={{ opacity: 0, x: 30 }} 
                whileHover={{ scale: 1.02, x: 10 }}
                className="bg-gradient-to-br from-blue-950/60 to-[#0a0a0f] border border-blue-400/30 rounded-2xl p-8 shadow-xl shadow-blue-900/10"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-400/30">
                    <Brain className="w-12 h-12 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-300">2. Spot Finder Agent → Picks Best Slot</div>
                    <div className="text-gray-400 mt-2">AI analyzes proximity, availability, preferences</div>
                  </div>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.div whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.9 }} className="bg-gradient-to-br from-pink-900/50 to-black border border-pink-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-10 h-10 text-pink-400" />
                    <div className="text-lg font-bold">3a. Vehicle Detected</div>
                  </div>
                  <div className="text-sm text-gray-400">Computer vision validates vehicle</div>
                </motion.div>

                <motion.div whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.9 }} className="bg-gradient-to-br from-pink-900/50 to-black border border-pink-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-10 h-10 text-pink-400" />
                    <div className="text-lg font-bold">3b. Correct Vehicle</div>
                  </div>
                  <div className="text-sm text-gray-400">License plate confirmation</div>
                </motion.div>
              </div>

              <div className="flex justify-center">
                <div className="py-3 px-6 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 font-bold">
                  ✓ Both Approvals Required to Proceed
                </div>
              </div>

              <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -30 }} className="bg-gradient-to-br from-orange-900/50 to-black border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-center gap-4">
                  <Wallet className="w-12 h-12 text-orange-400" />
                  <div>
                    <div className="text-xl font-bold">4. Real-time Payment Agent Activated</div>
                    <div className="text-sm text-gray-400">Per-minute ADA deduction • Live progress bar • TX hashes displayed</div>
                  </div>
                </div>
              </motion.div>

              <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: 30 }} className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-6 text-center">
                <div className="text-2xl font-bold">5. Booking Complete ✓ History Stored</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="container mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                Ready to Experience
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  The Future of Parking?
                </span>
              </h2>
              <p className="text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
                7 AI agents • Real blockchain • Live payments • Instant booking
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="relative group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-3xl px-20 py-10 rounded-3xl shadow-2xl shadow-blue-500/30 transition-all"
                >
                  <span className="relative z-10 flex items-center">
                    <Zap className="w-10 h-10 mr-4" />
                    Proof of Concept
                    <ArrowRight className="w-10 h-10 ml-4" />
                  </span>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
