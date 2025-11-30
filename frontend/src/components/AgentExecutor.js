import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import axios from 'axios';

const AgentExecutor = ({ selectedSpot, onAgentResult }) => {
  const { userId, balance, hasSufficientBalance, refreshBalance } = useWallet();
  const [executingAgent, setExecutingAgent] = useState(null);
  const [agentResults, setAgentResults] = useState({});
  const [error, setError] = useState(null);

  const agents = [
    {
      id: 'spot_finder',
      name: 'SpotFinder AI',
      description: 'Get AI-powered spot recommendations based on your preferences',
      cost: 0.3,
      icon: '🎯',
      endpoint: '/api/agents/spot-finder/execute',
      color: 'blue'
    },
    {
      id: 'pricing',
      name: 'Dynamic Pricing AI',
      description: 'Get real-time pricing with demand forecasting and optimization',
      cost: 0.4,
      icon: '💰',
      endpoint: '/api/agents/pricing/execute',
      color: 'green'
    },
    {
      id: 'route_optimizer',
      name: 'Route Optimizer AI',
      description: 'Get optimized walking directions from your location to the spot',
      cost: 0.2,
      icon: '🗺️',
      endpoint: '/api/agents/route-optimizer/execute',
      color: 'purple'
    }
  ];

  const executeAgent = async (agent) => {
    if (!userId) {
      setError('Please connect your wallet first');
      return;
    }

    if (!hasSufficientBalance(agent.cost)) {
      setError(`Insufficient balance. You need ${agent.cost} ADA to execute ${agent.name}. Current balance: ${balance} ADA`);
      return;
    }

    try {
      setExecutingAgent(agent.id);
      setError(null);

      let payload = { user_id: userId };

      // Add agent-specific parameters
      if (agent.id === 'spot_finder') {
        payload.preferences = {
          user_location: { lat: 17.4239, lng: 78.4738 }, // Default location (can be replaced with actual)
          car_type: 'sedan',
          features_preferred: ['covered', 'ev_charging']
        };
      } else if (agent.id === 'pricing') {
        if (!selectedSpot) {
          setError('Please select a parking spot first');
          setExecutingAgent(null);
          return;
        }
        payload.spot_id = selectedSpot.spot_id;
        payload.duration_hours = 2.0;
      } else if (agent.id === 'route_optimizer') {
        if (!selectedSpot) {
          setError('Please select a parking spot first');
          setExecutingAgent(null);
          return;
        }
        payload.spot_id = selectedSpot.spot_id;
        payload.user_location = { lat: 17.4239, lng: 78.4738 };
      }

      // Execute agent via backend
      const response = await axios.post(agent.endpoint, payload);

      if (response.data.success) {
        setAgentResults(prev => ({
          ...prev,
          [agent.id]: response.data.result
        }));

        // Refresh balance after execution
        await refreshBalance();

        // Notify parent component
        if (onAgentResult) {
          onAgentResult(agent.id, response.data.result);
        }
      } else {
        setError(response.data.message || 'Agent execution failed');
      }
    } catch (err) {
      console.error(`Error executing ${agent.name}:`, err);
      setError(err.response?.data?.message || err.message || 'Failed to execute agent');
    } finally {
      setExecutingAgent(null);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        border: 'border-blue-500',
        text: 'text-blue-500'
      },
      green: {
        bg: 'bg-green-500',
        hover: 'hover:bg-green-600',
        border: 'border-green-500',
        text: 'text-green-500'
      },
      purple: {
        bg: 'bg-purple-500',
        hover: 'hover:bg-purple-600',
        border: 'border-purple-500',
        text: 'text-purple-500'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500 bg-opacity-20 border-2 border-red-500 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="text-red-500 font-bold mb-1">Error</div>
                <div className="text-white text-sm">{error}</div>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const colors = getColorClasses(agent.color);
          const isExecuting = executingAgent === agent.id;
          const hasResult = agentResults[agent.id];
          const canAfford = hasSufficientBalance(agent.cost);

          return (
            <motion.div
              key={agent.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 ${colors.border} ${
                hasResult ? 'border-opacity-100' : 'border-opacity-30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <div className="text-5xl mb-3 text-center">{agent.icon}</div>

              {/* Name */}
              <div className="text-white font-bold text-lg mb-2 text-center">
                {agent.name}
              </div>

              {/* Description */}
              <div className="text-gray-400 text-sm mb-4 text-center min-h-[40px]">
                {agent.description}
              </div>

              {/* Cost */}
              <div className="text-center mb-4">
                <span className={`${colors.text} font-bold text-xl`}>
                  {agent.cost} ADA
                </span>
              </div>

              {/* Execute Button */}
              <button
                onClick={() => executeAgent(agent)}
                disabled={isExecuting || !canAfford || !userId}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 ${
                  isExecuting
                    ? 'bg-gray-600 cursor-wait'
                    : canAfford && userId
                    ? `${colors.bg} ${colors.hover}`
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                {isExecuting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Executing...
                  </span>
                ) : hasResult ? (
                  '✓ Executed'
                ) : !userId ? (
                  'Connect Wallet'
                ) : !canAfford ? (
                  'Insufficient Balance'
                ) : (
                  `Execute (${agent.cost} ADA)`
                )}
              </button>

              {/* Result Badge */}
              {hasResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-3 text-center text-sm ${colors.text} font-semibold`}
                >
                  ✓ Results available
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Results Display */}
      <AnimatePresence>
        {Object.keys(agentResults).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700"
          >
            <div className="text-white font-bold text-xl mb-4">Agent Results</div>
            <div className="space-y-4">
              {Object.entries(agentResults).map(([agentId, result]) => {
                const agent = agents.find(a => a.id === agentId);
                const colors = getColorClasses(agent.color);

                return (
                  <div key={agentId} className="bg-gray-900 rounded-lg p-4">
                    <div className={`flex items-center gap-2 mb-2 ${colors.text} font-bold`}>
                      <span>{agent.icon}</span>
                      <span>{agent.name}</span>
                    </div>
                    <pre className="text-gray-300 text-sm overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentExecutor;
