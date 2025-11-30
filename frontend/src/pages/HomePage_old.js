import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import ParkingLot3D from '../components/ParkingLot3D';
import AgentExecutor from '../components/AgentExecutor';
import WalletConnectModal from '../components/WalletConnectModal';
import AddBalanceModal from '../components/AddBalanceModal';

const HomePage = () => {
  const { connected, balance, walletAddress, meshLoaded, disconnectWallet } = useWallet();
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [agentResults, setAgentResults] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSpotSelect = (spot) => {
    setSelectedSpot(spot);
    setShowSidebar(true);
  };

  const handleAgentResult = (agentId, result) => {
    setAgentResults(prev => ({
      ...prev,
      [agentId]: result
    }));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: '#1f2937', 
        borderBottom: '2px solid #374151',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '1rem 1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🅿️</div>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.5rem' }}>ParknGo</div>
              <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>AI-Powered Parking System</div>
            </div>
          </div>

          {/* Wallet Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {connected ? (
              <>
                {/* Balance Display */}
                <div style={{
                  backgroundColor: '#374151',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #10b981'
                }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Balance</div>
                  <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    {balance} ADA
                  </div>
                </div>

                {/* Add Balance Button */}
                <button
                  onClick={() => setShowBalanceModal(true)}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  + Add Balance
                </button>

                {/* Wallet Address */}
                <div style={{
                  backgroundColor: '#374151',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                  border: '2px solid #3b82f6'
                }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Wallet</div>
                  <div style={{ color: 'white', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                    {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                  </div>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  style={{
                    color: '#ef4444',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                disabled={!meshLoaded}
                style={{
                  backgroundColor: meshLoaded ? '#3b82f6' : '#6b7280',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  cursor: meshLoaded ? 'pointer' : 'not-allowed',
                  border: 'none',
                  opacity: meshLoaded ? 1 : 0.5
                }}
              >
                {meshLoaded ? 'Connect Wallet' : 'Loading...'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* 3D Parking Lot */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ParkingLot3D 
            onSpotSelect={handleSpotSelect}
            selectedSpot={selectedSpot}
          />

          {/* Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: 'rgba(31, 41, 55, 0.9)',
              backdropFilter: 'blur(4px)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '2px solid #374151',
              cursor: 'pointer',
              zIndex: 30
            }}
          >
            {showSidebar ? '→ Hide Controls' : '← Show Controls'}
          </button>
        </div>

        {/* Right Sidebar */}
        {showSidebar && (
          <div style={{
            width: '500px',
            backgroundColor: '#1f2937',
            borderLeft: '2px solid #374151',
            overflowY: 'auto',
            zIndex: 30
          }}>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Selected Spot Info */}
                {selectedSpot ? (
                  <div className="bg-gray-700 rounded-lg p-4 border-2 border-blue-500">
                    <div className="text-white font-bold text-lg mb-3">
                      Selected Spot: {selectedSpot.spot_id}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Zone:</span>
                        <span className="text-white font-semibold">{selectedSpot.zone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white font-semibold capitalize">{selectedSpot.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`font-semibold ${selectedSpot.occupied ? 'text-red-400' : 'text-green-400'}`}>
                          {selectedSpot.occupied ? 'Occupied' : 'Available'}
                        </span>
                      </div>
                      {selectedSpot.features && selectedSpot.features.length > 0 && (
                        <div>
                          <div className="text-gray-400 mb-1">Features:</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedSpot.features.map((feature, idx) => (
                              <span key={idx} className="bg-blue-500 bg-opacity-20 text-blue-400 px-2 py-1 rounded text-xs font-semibold">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded-lg p-4 border-2 border-gray-600">
                    <div className="text-gray-400 text-center">
                      👆 Click on a parking zone on the 3D map to select a spot
                    </div>
                  </div>
                )}

                {/* Connection Guard */}
                {!connected ? (
                  <div className="bg-yellow-500 bg-opacity-20 border-2 border-yellow-500 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">🔒</div>
                    <div className="text-yellow-500 font-bold text-lg mb-2">
                      Wallet Not Connected
                    </div>
                    <div className="text-gray-300 text-sm mb-4">
                      Connect your Cardano wallet to access AI-powered parking features
                    </div>
                    <button
                      onClick={() => setShowWalletModal(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      Connect Wallet
                    </button>
                  </div>
                ) : balance === 0 ? (
                  <div className="bg-orange-500 bg-opacity-20 border-2 border-orange-500 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-3">💰</div>
                    <div className="text-orange-500 font-bold text-lg mb-2">
                      No Balance
                    </div>
                    <div className="text-gray-300 text-sm mb-4">
                      Add balance to use AI agents. All features require payment.
                    </div>
                    <button
                      onClick={() => setShowBalanceModal(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      Add Balance
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Agent Executor */}
                    <div>
                      <div className="text-white font-bold text-xl mb-4">
                        AI Parking Agents
                      </div>
                      <div className="text-gray-400 text-sm mb-4">
                        Execute individual AI agents to get smart parking recommendations, pricing, and routing.
                        <span className="text-yellow-400 font-semibold"> All agents require payment.</span>
                      </div>
                      <AgentExecutor 
                        selectedSpot={selectedSpot}
                        onAgentResult={handleAgentResult}
                      />
                    </div>

                    {/* Booking Section - Placeholder */}
                    {selectedSpot && !selectedSpot.occupied && (
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6">
                        <div className="text-white font-bold text-xl mb-2">
                          Ready to Book?
                        </div>
                        <div className="text-blue-100 text-sm mb-4">
                          Execute agents above to get pricing and route optimization before booking.
                        </div>
                        <button className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                          Book Spot {selectedSpot.spot_id}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <WalletConnectModal 
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
      <AddBalanceModal 
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
      />
    </div>
  );
};

export default HomePage;
