import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';

const WalletConnectModal = ({ isOpen, onClose }) => {
  const { connectWallet, loading, error, meshLoaded } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState('nami');

  const wallets = [
    { id: 'nami', name: 'Nami', icon: '🦊', description: 'Most popular Cardano wallet' },
    { id: 'eternl', name: 'Eternl', icon: '💎', description: 'Feature-rich wallet' },
    { id: 'flint', name: 'Flint', icon: '🔥', description: 'Simple and secure' }
  ];

  const handleConnect = async () => {
    try {
      await connectWallet(selectedWallet);
      onClose();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border-2 border-blue-500">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-white mb-4"
                >
                  Connect Cardano Wallet
                </Dialog.Title>

                {!meshLoaded && (
                  <div className="mb-4 p-3 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <div className="text-blue-400 text-sm">Loading wallet library...</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {wallets.map((wallet) => (
                    <motion.button
                      key={wallet.id}
                      onClick={() => setSelectedWallet(wallet.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        selectedWallet === wallet.id
                          ? 'border-blue-500 bg-blue-500 bg-opacity-20'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{wallet.icon}</span>
                        <div className="text-left flex-1">
                          <div className="text-white font-bold">{wallet.name}</div>
                          <div className="text-gray-400 text-sm">{wallet.description}</div>
                        </div>
                        {selectedWallet === wallet.id && (
                          <span className="text-blue-500 text-xl">✓</span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                    <div className="text-red-500 text-sm">{error}</div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={loading || !meshLoaded}
                    className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Connecting...' : !meshLoaded ? 'Loading...' : 'Connect'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default WalletConnectModal;
