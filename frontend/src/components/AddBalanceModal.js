import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';

const AddBalanceModal = ({ isOpen, onClose }) => {
  const { addFunds, balance, loading } = useWallet();
  const [amount, setAmount] = useState('10');
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const presetAmounts = [5, 10, 25, 50, 100];

  const handleAddFunds = async () => {
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum < 1) {
      setError('Minimum deposit is 1 ADA');
      return;
    }

    try {
      setError(null);
      setSuccess(false);
      
      const result = await addFunds(amountNum);
      
      if (result.success) {
        setTxHash(result.txHash);
        setSuccess(true);
        setAmount('10');
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setTxHash(null);
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add funds. Please try again.');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      setTxHash(null);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border-2 border-green-500">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-white mb-2"
                >
                  Add Balance
                </Dialog.Title>

                <div className="text-gray-400 text-sm mb-6">
                  Current Balance: <span className="text-green-400 font-bold">{balance} ADA</span>
                </div>

                {!success ? (
                  <>
                    {/* Amount Input */}
                    <div className="mb-4">
                      <label className="text-white text-sm font-semibold mb-2 block">
                        Amount (ADA)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="1"
                          step="0.1"
                          className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white text-xl font-bold focus:border-green-500 focus:outline-none"
                          placeholder="Enter amount"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">
                          ADA
                        </span>
                      </div>
                    </div>

                    {/* Preset Amounts */}
                    <div className="mb-6">
                      <div className="text-white text-sm font-semibold mb-2">Quick Select</div>
                      <div className="grid grid-cols-5 gap-2">
                        {presetAmounts.map((preset) => (
                          <motion.button
                            key={preset}
                            onClick={() => setAmount(preset.toString())}
                            className={`py-2 px-3 rounded-lg font-bold transition-all ${
                              amount === preset.toString()
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {preset}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Fees Info */}
                    <div className="mb-6 p-3 bg-gray-700 rounded-lg">
                      <div className="text-gray-300 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>You're adding:</span>
                          <span className="font-bold text-white">{amount || '0'} ADA</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Network fee:</span>
                          <span className="font-bold text-yellow-400">~0.17 ADA</span>
                        </div>
                        <div className="border-t border-gray-600 pt-1 mt-1 flex justify-between">
                          <span className="font-bold">Total from wallet:</span>
                          <span className="font-bold text-white">
                            ~{(parseFloat(amount || 0) + 0.17).toFixed(2)} ADA
                          </span>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                        <div className="text-red-500 text-sm">{error}</div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddFunds}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
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
                            Processing...
                          </span>
                        ) : (
                          'Add Funds'
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="text-6xl mb-4">✅</div>
                    <div className="text-green-400 font-bold text-xl mb-2">
                      Funds Added Successfully!
                    </div>
                    <div className="text-gray-400 text-sm mb-4">
                      Your balance will update shortly
                    </div>
                    {txHash && (
                      <div className="text-xs text-gray-500 break-all">
                        Transaction: {txHash.slice(0, 20)}...
                      </div>
                    )}
                  </motion.div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddBalanceModal;
