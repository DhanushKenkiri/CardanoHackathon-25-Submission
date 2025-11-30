import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Scale,
  DollarSign,
  User,
  Bot,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface DisputeChatbotProps {
  userId: string;
  sessionId?: string;
  bookingId?: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  message: string;
  timestamp: Date;
}

interface DisputeData {
  dispute_id: string;
  status: string;
  created_at: string;
  user_stake_lovelace: number;
  owner_stake_lovelace: number;
  arbitration_fee_lovelace: number;
  total_pot_lovelace: number;
  ruling?: {
    winner: 'customer' | 'owner';
    confidence: number;
    reasoning: string;
  };
}

export default function DisputeChatbot({ 
  userId, 
  sessionId, 
  bookingId, 
  onClose 
}: DisputeChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'system',
      message: 'Welcome to AI Dispute Resolution. Please describe your issue in detail.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Dispute state
  const [disputeCreated, setDisputeCreated] = useState(false);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeData, setDisputeData] = useState<DisputeData | null>(null);
  const [stakeAmount, setStakeAmount] = useState(1.0); // ADA
  const [staked, setStaked] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      // If dispute not created yet, create it
      if (!disputeCreated) {
        const response = await fetch('http://localhost:5000/api/disputes/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            session_id: sessionId || 'session_demo',
            booking_id: bookingId || 'booking_demo',
            dispute_type: 'general',
            description: inputMessage,
            evidence: [],
            disputed_amount_lovelace: 1000000 // 1 ADA default
          })
        });

        const data = await response.json();

        if (data.success) {
          setDisputeCreated(true);
          setDisputeId(data.dispute_id);
          
          const systemMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'system',
            message: `✅ Dispute case created: ${data.dispute_id}\n\nTo proceed with AI arbitration, both parties must stake the disputed amount. You will stake ${stakeAmount} ADA, and the parking owner will stake an equal amount. Winner takes all stakes.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, systemMessage]);

          const agentMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            sender: 'agent',
            message: 'I understand your concern. I\'ll analyze the evidence from both sides. Please confirm your stake to proceed with arbitration.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, agentMessage]);
        } else {
          throw new Error(data.error || 'Failed to create dispute');
        }
      } else {
        // Continue conversation
        const agentMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          message: 'Thank you for the additional information. I\'m recording all details for the arbitration analysis.',
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setMessages(prev => [...prev, agentMessage]);
        }, 800);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'system',
        message: `❌ Error: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleStake = async () => {
    if (!disputeId) {
      toast.error('No active dispute');
      return;
    }

    setSending(true);
    try {
      // Simulate staking process
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStaked(true);
      
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'system',
        message: `✅ You have staked ${stakeAmount} ADA\n\n⏳ Waiting for parking owner to stake their portion...\n\nOnce both parties have staked, AI arbitration will begin automatically.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);

      // Simulate owner staking after 3 seconds
      setTimeout(async () => {
        const ownerMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'system',
          message: '✅ Parking owner has staked their portion.\n\n🤖 AI Dispute Resolver is now analyzing all evidence...',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, ownerMessage]);

        // Auto-resolve after 5 seconds
        setTimeout(() => {
          handleResolveDispute();
        }, 5000);
      }, 3000);

      toast.success('Stake confirmed!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to stake');
    } finally {
      setSending(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!disputeId) return;

    setResolving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        const ruling = data.ruling;
        const winner = ruling?.winner || 'customer';
        const confidence = ruling?.confidence || 85;
        const reasoning = ruling?.reasoning || 'Based on evidence analysis, customer claim is valid.';

        setDisputeData({
          dispute_id: disputeId,
          status: 'resolved',
          created_at: new Date().toISOString(),
          user_stake_lovelace: stakeAmount * 1000000,
          owner_stake_lovelace: stakeAmount * 1000000,
          arbitration_fee_lovelace: 500000,
          total_pot_lovelace: (stakeAmount * 2) * 1000000,
          ruling: {
            winner,
            confidence,
            reasoning
          }
        });

        setResolved(true);

        const resultMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'agent',
          message: `🎯 **ARBITRATION COMPLETE**\n\n**Winner:** ${winner === 'customer' ? '👤 Customer (You)' : '🏢 Parking Owner'}\n**Confidence:** ${confidence}%\n\n**Reasoning:**\n${reasoning}\n\n**Payout:** ${winner === 'customer' ? `You receive ${stakeAmount * 2} ADA` : `Owner receives ${stakeAmount * 2} ADA`}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, resultMessage]);

        if (winner === 'customer') {
          toast.success(`🎉 You won! Receiving ${stakeAmount * 2} ADA`);
        } else {
          toast.error('Dispute ruled in favor of owner');
        }
      } else {
        throw new Error(data.error || 'Resolution failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  const getMessageIcon = (sender: ChatMessage['sender']) => {
    if (sender === 'user') return <User className="w-5 h-5" />;
    if (sender === 'agent') return <Bot className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getMessageBg = (sender: ChatMessage['sender']) => {
    if (sender === 'user') return 'bg-blue-600';
    if (sender === 'agent') return 'bg-purple-600';
    return 'bg-gray-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-4xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Scale className="w-7 h-7 text-purple-400" />
                  AI Dispute Resolution
                </CardTitle>
                <p className="text-sm text-gray-400 mt-2">
                  Powered by Gemini AI • Bilateral Escrow • 0.5 ADA Arbitration Fee
                </p>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-black/50 border-gray-700 hover:bg-gray-800"
              >
                ✕ Close
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Staking Status */}
        {disputeCreated && !resolved && (
          <Card className="mt-4 bg-gradient-to-br from-gray-900 to-black border-gray-800">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-1">Your Stake</p>
                  <p className="text-lg font-bold text-blue-400">{stakeAmount} ADA</p>
                  <Badge className={`mt-2 ${staked ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {staked ? '✓ Staked' : 'Pending'}
                  </Badge>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <DollarSign className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-1">Owner Stake</p>
                  <p className="text-lg font-bold text-purple-400">{stakeAmount} ADA</p>
                  <Badge className={`mt-2 ${staked ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {staked ? '✓ Staked' : 'Waiting'}
                  </Badge>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-1">Total Pot</p>
                  <p className="text-lg font-bold text-green-400">{stakeAmount * 2} ADA</p>
                  <p className="text-xs text-gray-500 mt-1">Winner takes all</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="mt-4 flex-1 flex flex-col bg-black border-gray-800">
          <CardContent className="flex-1 flex flex-col p-0">
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`p-2 rounded-full ${getMessageBg(msg.sender)}`}>
                      {getMessageIcon(msg.sender)}
                    </div>
                    <div className={`flex-1 max-w-[70%] ${msg.sender === 'user' ? 'text-right' : ''}`}>
                      <div 
                        className={`inline-block p-4 rounded-2xl ${
                          msg.sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : msg.sender === 'agent'
                            ? 'bg-purple-900/50 text-white border border-purple-500/30'
                            : 'bg-gray-800 text-gray-300 border border-gray-700'
                        }`}
                      >
                        <p className="whitespace-pre-line text-sm">{msg.message}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {sending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 rounded-full bg-purple-600">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-purple-900/50 border border-purple-500/30 rounded-2xl p-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </motion.div>
              )}

              {resolving && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 rounded-full bg-purple-600">
                    <Scale className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="bg-purple-900/50 border border-purple-500/30 rounded-2xl p-4">
                    <p className="text-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing evidence and deliberating...
                    </p>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {!resolved && (
              <div className="border-t border-gray-800 p-4">
                {!staked && disputeCreated && (
                  <div className="mb-4">
                    <Button
                      onClick={handleStake}
                      disabled={sending}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white font-bold py-6 text-lg"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing Stake...
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-5 h-5 mr-2" />
                          Stake {stakeAmount} ADA to Proceed
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Describe your issue or add details..."
                    disabled={sending || resolving}
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 focus:border-purple-500 focus:outline-none text-white placeholder-gray-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || sending || resolving}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Resolved View */}
            {resolved && disputeData?.ruling && (
              <div className="border-t border-gray-800 p-6">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={`p-6 rounded-lg border-2 ${
                    disputeData.ruling.winner === 'customer'
                      ? 'bg-green-900/20 border-green-500'
                      : 'bg-red-900/20 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {disputeData.ruling.winner === 'customer' ? (
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-400" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold">
                          {disputeData.ruling.winner === 'customer' ? '🎉 You Won!' : '❌ Dispute Lost'}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Confidence: {disputeData.ruling.confidence}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        {disputeData.ruling.winner === 'customer' ? '+' : '-'}{stakeAmount * 2} ADA
                      </p>
                      <p className="text-xs text-gray-500">
                        {disputeData.ruling.winner === 'customer' ? 'Added to wallet' : 'Paid to owner'}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                  >
                    Close Dispute
                  </Button>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
