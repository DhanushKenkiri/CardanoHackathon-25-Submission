"""
Payment Distribution Service for ParknGo
Handles distributing earnings to individual agent wallets on Cardano mainnet
"""

import os
import logging
from typing import Dict, Optional
from services import firebase_service

logger = logging.getLogger(__name__)

# Agent wallet addresses from environment
AGENT_WALLETS = {
    'orchestrator': os.getenv('ORCHESTRATOR_WALLET_ADDRESS'),
    'spot_finder': os.getenv('SPOTFINDER_WALLET_ADDRESS'),
    'pricing': os.getenv('PRICING_WALLET_ADDRESS'),
    'route_optimizer': os.getenv('ROUTEOPTIMIZER_WALLET_ADDRESS'),
    'payment_verifier': os.getenv('PAYMENTVERIFIER_WALLET_ADDRESS'),
    'security_guard': os.getenv('SECURITYGUARD_WALLET_ADDRESS'),
    'dispute_resolver': os.getenv('DISPUTERESOLVER_WALLET_ADDRESS')
}

# Agent earnings per execution (in Lovelace - 1 ADA = 1,000,000 Lovelace)
AGENT_EARNINGS = {
    'orchestrator': 400000,      # 0.4 ADA
    'spot_finder': 300000,       # 0.3 ADA
    'pricing': 400000,           # 0.4 ADA
    'route_optimizer': 200000,   # 0.2 ADA
    'payment_verifier': 200000,  # 0.2 ADA
    'security_guard': 250000,    # 0.25 ADA
    'dispute_resolver': 250000   # 0.25 ADA
}

class PaymentDistributionService:
    """Service for distributing payments to agent wallets"""
    
    def __init__(self):
        self.customer_wallet = os.getenv('CUSTOMER_WALLET_ADDRESS')
        logger.info("💰 Payment Distribution Service initialized")
    
    def record_agent_earnings(self, session_id: str, agent_name: str) -> bool:
        """
        Record earnings for an agent in Firebase
        
        Args:
            session_id: Parking session ID
            agent_name: Name of the agent (orchestrator, spot_finder, etc.)
        Returns:
            True if successful
        """
        try:
            agent_key = agent_name.lower().replace(' ', '_')
            
            if agent_key not in AGENT_EARNINGS:
                logger.warning(f"⚠️ Unknown agent: {agent_name}")
                return False
            
            earnings_lovelace = AGENT_EARNINGS[agent_key]
            wallet_address = AGENT_WALLETS.get(agent_key)
            
            if not wallet_address:
                logger.error(f"❌ No wallet address for agent: {agent_name}")
                return False
            
            # Record in Firebase
            firebase_service.record_agent_earning(
                agent_name=agent_name,
                amount_cents=earnings_lovelace,
                session_id=session_id,
                wallet_address=wallet_address
            )
            
            logger.info(f"✅ Recorded {earnings_lovelace / 1000000:.2f} ADA for {agent_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to record earnings for {agent_name}: {e}")
            return False
    
    def get_total_earnings_by_agent(self) -> Dict[str, float]:
        """
        Get total earnings for each agent in ADA
        
        Returns:
            Dictionary of {agent_name: total_ada}
        """
        try:
            all_earnings = firebase_service.get_agent_earnings()
            
            if not all_earnings:
                return {agent: 0.0 for agent in AGENT_EARNINGS.keys()}
            
            totals = {}
            for agent_name in AGENT_EARNINGS.keys():
                agent_total = all_earnings.get(agent_name, 0)
                totals[agent_name] = agent_total / 100000000  # Convert to ADA
            
            return totals
            
        except Exception as e:
            logger.error(f"❌ Failed to get agent earnings: {e}")
            return {}
    
    def get_customer_balance(self) -> float:
        """
        Calculate total customer wallet balance from all agent earnings
        (In real implementation, this would query Cardano blockchain)
        
        Returns:
            Balance in ADA
        """
        try:
            all_earnings = firebase_service.get_agent_earnings()
            
            if not all_earnings:
                return 0.0
            
            total_lovelace = sum(all_earnings.values())
            return total_lovelace / 100000000  # Convert to ADA
            
        except Exception as e:
            logger.error(f"❌ Failed to calculate balance: {e}")
            return 0.0
    
    def distribute_parking_payment(self, session_id: str, total_amount_ada: float) -> bool:
        """
        Distribute parking payment to all agents
        
        Args:
            session_id: Parking session ID
            total_amount_ada: Total parking fee in ADA
        Returns:
            True if successful
        """
        try:
            logger.info(f"💸 Distributing {total_amount_ada} ADA for session {session_id}")
            
            # Record earnings for each agent
            for agent_name in AGENT_EARNINGS.keys():
                self.record_agent_earnings(session_id, agent_name)
            
            total_distributed = sum(AGENT_EARNINGS.values()) / 1000000
            logger.info(f"✅ Distributed {total_distributed:.2f} ADA across {len(AGENT_EARNINGS)} agents")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Payment distribution failed: {e}")
            return False
    
    def get_wallet_info(self) -> Dict:
        """
        Get comprehensive wallet information
        
        Returns:
            Dictionary with wallet details
        """
        return {
            'customer_wallet': self.customer_wallet,
            'agent_wallets': AGENT_WALLETS,
            'earnings_per_execution': {
                agent: f"{lovelace / 1000000:.2f} ADA"
                for agent, lovelace in AGENT_EARNINGS.items()
            },
            'network': 'Cardano Mainnet',
            'total_agents': len(AGENT_WALLETS)
        }

# Create singleton instance
payment_distribution_service = PaymentDistributionService()
