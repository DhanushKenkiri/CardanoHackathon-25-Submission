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
} from 'lucide-react';
import { subscribeToParkingSpots } from '@/services/firebaseService';

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

  const features = [
    {
      icon: Brain,
      title: 'AI Spot Finder',
      description: 'Smart recommendations based on proximity and availability',
      price: '0.3 ADA',
    },
    {
      icon: DollarSign,
      title: 'Dynamic Pricing',
      description: 'Fair rates adjusted by demand and location',
      price: '0.3 ADA',
    },
    {
      icon: Navigation,
      title: 'Route Optimizer',
      description: 'Fastest path to your spot with turn-by-turn directions',
      price: '0.3 ADA',
    },
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Transparent payments on Cardano Preprod network',
      price: 'Free',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center py-20 px-6">
          <div className="container mx-auto max-w-7xl">
            {/* Text Content - Full Width on Top */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="inline-block mb-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-semibold text-blue-300">Live • {stats.available}/{stats.total} Available</span>
                </div>
              </div>

              <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AI-Powered
                </span>
                <br />
                <span className="text-white">Smart Parking</span>
              </h1>
              
              <p className="text-2xl text-gray-400 mb-4 max-w-3xl mx-auto">
                7 Specialized AI Agents • Real Cardano Blockchain • Instant Booking
              </p>

              {/* Live Stats Row */}
              <div className="flex justify-center gap-6 mb-10">
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-xl px-8 py-4 border border-green-500/20">
                  <div className="text-4xl font-black text-green-400 mb-1">{stats.available}</div>
                  <div className="text-xs text-green-300/70 uppercase tracking-wider">Available Now</div>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm rounded-xl px-8 py-4 border border-red-500/20">
                  <div className="text-4xl font-black text-red-400 mb-1">{stats.occupied}</div>
                  <div className="text-xs text-red-300/70 uppercase tracking-wider">Occupied</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl px-8 py-4 border border-blue-500/20">
                  <div className="text-4xl font-black text-blue-400 mb-1">{stats.total}</div>
                  <div className="text-xs text-blue-300/70 uppercase tracking-wider">Total Capacity</div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-2xl px-16 py-8 rounded-2xl shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-all mb-3"
              >
                <Sparkles className="w-7 h-7 mr-3" />
                Launch Dashboard
                <ArrowRight className="w-7 h-7 ml-3" />
              </Button>
              
              <p className="text-sm text-gray-500">
                No sign-up required • Instant access • Blockchain secured
              </p>
            </motion.div>

            {/* 3D Parking Visualization - Full Width Below */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full"
            >
              <div className="relative mx-auto max-w-6xl">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-1 border border-white/10">
                  <div className="bg-black rounded-2xl overflow-hidden">
                    <div className="aspect-video w-full bg-gradient-to-br from-gray-950 to-black relative">
                      {/* Placeholder for 3D viewer with grid pattern */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🅿️</div>
                          <div className="text-2xl font-bold text-white/90 mb-2">Interactive Parking Layout</div>
                          <div className="text-sm text-gray-500">Real-time 3D visualization powered by AI</div>
                          
                          {/* Visual parking grid representation */}
                          <div className="mt-8 grid grid-cols-8 gap-2 max-w-lg mx-auto">
                            {Array.from({ length: 24 }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-8 rounded ${
                                  i < stats.available 
                                    ? 'bg-green-500/30 border border-green-400/50' 
                                    : 'bg-red-500/30 border border-red-400/50'
                                } animate-pulse`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend Below */}
                <div className="flex items-center justify-center gap-8 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded border border-green-400" />
                    <span className="text-sm text-gray-400">Available Spots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded border border-red-400" />
                    <span className="text-sm text-gray-400">Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded border border-blue-400" />
                    <span className="text-sm text-gray-400">Selected</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-black pointer-events-none" />
          <div className="container mx-auto max-w-7xl relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Powered by AI Agents
                </span>
              </h2>
              <p className="text-xl text-gray-400">
                Each agent specializes in a unique task to give you the best parking experience
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="bg-gradient-to-br from-gray-900/50 to-black border border-white/5 backdrop-blur-sm hover:border-blue-500/30 transition-all group h-full">
                    <CardHeader>
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all">
                        <feature.icon className="w-7 h-7 text-blue-400" />
                      </div>
                      <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{feature.description}</p>
                      <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30">
                        <span className="text-green-400 text-sm font-bold">{feature.price}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        {/* How It Works */}
        <section className="py-20 px-6 bg-gradient-to-b from-black via-purple-950/10 to-black">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-6xl font-black mb-4 text-white">How It Works</h2>
              <p className="text-xl text-gray-400">From search to payment in 4 simple steps</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: MapPin, title: '1. Find Your Spot', desc: 'AI analyzes all available spots and recommends the best one', color: 'blue' },
                { icon: Wallet, title: '2. Reserve Instantly', desc: 'One click to secure your spot with blockchain payment', color: 'purple' },
                { icon: Navigation, title: '3. Navigate There', desc: 'Follow optimized route with turn-by-turn directions', color: 'pink' },
                { icon: Clock, title: '4. Pay Fairly', desc: 'Only pay for time used, verified on Cardano blockchain', color: 'green' },
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`flex gap-6 p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black border border-${step.color}-500/20 hover:border-${step.color}-500/50 transition-all`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-${step.color}-500/50`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
          </div>
        </section>
        {/* Tech Stack */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-5xl font-black mb-12 text-white">Built With Cutting-Edge Tech</h2>
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { name: 'Cardano Blockchain', icon: '₳', gradient: 'from-blue-500 to-blue-600' },
                  { name: 'Google Gemini AI', icon: '✨', gradient: 'from-purple-500 to-pink-500' },
                  { name: 'Firebase Realtime', icon: '🔥', gradient: 'from-orange-500 to-red-500' },
                  { name: 'React + TypeScript', icon: '⚛️', gradient: 'from-cyan-500 to-blue-500' },
                ].map((tech, index) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="group"
                  >
                    <div className={`px-8 py-4 rounded-2xl bg-gradient-to-r ${tech.gradient} bg-opacity-10 border border-white/10 backdrop-blur-sm hover:border-white/30 transition-all`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{tech.icon}</span>
                        <span className="text-white font-bold">{tech.name}</span>
                      </div>
        {/* Final CTA */}
        <section className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 via-purple-950/20 to-black pointer-events-none" />
          <div className="container mx-auto max-w-5xl text-center relative">
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
                No sign-up required. No credit card needed. Start parking smarter right now.
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
                    Launch Dashboard Now
                    <ArrowRight className="w-10 h-10 ml-4" />
                  </span>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
                </Button>
              </motion.div>

              <div className="mt-10 flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <span>Blockchain Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>AI-Powered</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
};

export default LandingPage;
