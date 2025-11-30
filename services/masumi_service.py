"""
ParknGo - Masumi Network Service Module
Professional integration with Masumi multi-agent payment system
Documentation: https://docs.masumi.network
"""

import os
import logging
from typing import Dict, Optional, Any
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MasumiService:
    """Professional Masumi Network integration for blockchain agent payments"""
    
    _instance = None
    
    def __new__(cls):
        """Singleton pattern"""
        if cls._instance is None:
            cls._instance = super(MasumiService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize Masumi service URLs"""
        self.payment_service_url = os.getenv('MASUMI_PAYMENT_SERVICE_URL', 'http://localhost:3001')
        self.registry_service_url = os.getenv('MASUMI_REGISTRY_SERVICE_URL', 'http://localhost:3000')
        self.network = os.getenv('MASUMI_NETWORK', 'preprod')
        
        logger.info(f"✅ Masumi Service initialized (network: {self.network})")
    
    # ============================================
    # AGENT REGISTRATION
    # ============================================
    
    def register_agent(self, agent_data: Dict) -> Optional[Dict]:
        """
        Register new agent on Masumi Registry
        
        Args:
            agent_data: Dictionary with title, identifier, wallet_address, description
        Returns:
            Registration response or None
        """
        try:
            url = f"{self.registry_service_url}/api/v1/agents/register"
            
            payload = {
                "agent": {
                    "title": agent_data.get('title'),
                    "identifier": agent_data.get('identifier'),
                    "wallet_address": agent_data.get('wallet_address'),
                    "description": agent_data.get('description', ''),
                    "metadata": agent_data.get('metadata', {})
                }
            }
            
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"✅ Registered agent: {agent_data.get('title')}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Agent registration failed: {e}")
            return None
    
    def get_agent_info(self, agent_identifier: str) -> Optional[Dict]:
        """
        Get agent information from registry
        
        Args:
            agent_identifier: Unique agent identifier
        Returns:
            Agent data or None
        """
        try:
            url = f"{self.registry_service_url}/api/v1/agents/{agent_identifier}"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error fetching agent {agent_identifier}: {e}")
            return None
    
    # ============================================
    # PAYMENT REQUESTS
    # ============================================
    
    def create_payment_request(self, payment_data: Dict) -> Optional[Dict]:
        """
        Create Masumi payment request (escrow smart contract)
        
        Args:
            payment_data: Dictionary with:
                - amount_lovelace: Payment amount in Lovelace (1 ADA = 1,000,000 Lovelace)
                - agent_identifier: Agent who will fulfill the request
                - customer_wallet: Customer's wallet address
                - pay_by_time: Deadline for payment (ISO format or minutes from now)
                - submit_result_time: Deadline for result submission
                - unlock_time: When payment unlocks if no result submitted
                - metadata: Additional context
        Returns:
            Payment request response with payment_id, payment_address, etc.
        """
        try:
            url = f"{self.payment_service_url}/api/v1/payment"
            
            # Calculate deadlines if not provided
            pay_by = payment_data.get('pay_by_time')
            if isinstance(pay_by, int):  # If minutes provided
                pay_by = (datetime.utcnow() + timedelta(minutes=pay_by)).isoformat() + 'Z'
            
            submit_result = payment_data.get('submit_result_time')
            if isinstance(submit_result, int):
                submit_result = (datetime.utcnow() + timedelta(hours=submit_result)).isoformat() + 'Z'
            
            unlock = payment_data.get('unlock_time')
            if isinstance(unlock, int):
                unlock = (datetime.utcnow() + timedelta(hours=unlock)).isoformat() + 'Z'
            
            external_dispute = payment_data.get('external_dispute_unlock_time')
            if isinstance(external_dispute, int):
                external_dispute = (datetime.utcnow() + timedelta(hours=external_dispute)).isoformat() + 'Z'
            
            # Generate unique identifier from purchaser (hex format, 14-26 chars)
            import secrets
            identifier_from_purchaser = secrets.token_hex(7)  # 14 hex chars
            
            payload = {
                "network": "Preprod",
                "agentIdentifier": payment_data.get('agent_identifier', 'parkngo_orchestrator'),
                "inputHash": payment_data.get('input_hash', secrets.token_hex(32)),  # 64 hex chars
                "payByTime": pay_by,
                "submitResultTime": submit_result,
                "unlockTime": unlock,
                "externalDisputeUnlockTime": external_dispute,
                "identifierFromPurchaser": identifier_from_purchaser,
                "metadata": str(payment_data.get('metadata', {}))
            }
            
            # Add API key header if available
            headers = {}
            if hasattr(self, 'api_key') and self.api_key:
                headers['token'] = self.api_key
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            # Response format: {"status": "success", "data": {...}}
            if result.get('status') == 'success':
                payment_data_response = result.get('data', {})
                logger.info(f"✅ Created payment request: {payment_data_response.get('blockchainIdentifier')}")
                return payment_data_response
            else:
                logger.error(f"❌ Payment request failed: {result}")
                return None
            
        except Exception as e:
            logger.warning(f"⚠️ Payment request creation failed (continuing without Masumi): {e}")
            return None
    
    def get_payment_status(self, payment_id: str) -> Optional[Dict]:
        """
        Get payment request status
        
        Args:
            payment_id: Payment request ID
        Returns:
            Payment status data
        """
        try:
            url = f"{self.payment_service_url}/api/v1/payments/{payment_id}"
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error fetching payment {payment_id}: {e}")
            return None
    
    def submit_result(self, payment_id: str, result_hash: str, metadata: Optional[Dict] = None) -> Optional[Dict]:
        """
        Submit work result to unlock payment (SHA256 hash of result)
        
        Args:
            payment_id: Payment request ID
            result_hash: SHA256 hash of the work result
            metadata: Additional result metadata
        Returns:
            Submission response
        """
        try:
            url = f"{self.payment_service_url}/api/v1/payments/{payment_id}/submit-result"
            
            payload = {
                "resultHash": result_hash,
                "metadata": metadata or {}
            }
            
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"✅ Submitted result for payment {payment_id}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Result submission failed for {payment_id}: {e}")
            return None
    
    # ============================================
    # BILATERAL ESCROW (FOR DISPUTES)
    # ============================================
    
    def create_bilateral_escrow(self, escrow_data: Dict) -> Optional[Dict]:
        """
        Create bilateral escrow where both parties stake funds
        
        Args:
            escrow_data: Dictionary with:
                - party_a_wallet: First party wallet
                - party_b_wallet: Second party wallet
                - party_a_stake_lovelace: Party A stake amount
                - party_b_stake_lovelace: Party B stake amount
                - arbiter_identifier: Agent who will resolve
                - deadline: Resolution deadline
        Returns:
            Bilateral escrow response
        """
        try:
            url = f"{self.payment_service_url}/api/v1/escrow/bilateral/create"
            
            payload = {
                "partyA": {
                    "wallet": escrow_data.get('party_a_wallet'),
                    "stakeLovelace": escrow_data.get('party_a_stake_lovelace')
                },
                "partyB": {
                    "wallet": escrow_data.get('party_b_wallet'),
                    "stakeLovelace": escrow_data.get('party_b_stake_lovelace')
                },
                "arbiter": {
                    "identifier": escrow_data.get('arbiter_identifier')
                },
                "deadline": escrow_data.get('deadline'),
                "metadata": escrow_data.get('metadata', {})
            }
            
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"✅ Created bilateral escrow: {result.get('escrowId')}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Bilateral escrow creation failed: {e}")
            return None
    
    def resolve_bilateral_escrow(self, escrow_id: str, ruling: Dict) -> Optional[Dict]:
        """
        Arbiter resolves bilateral escrow and distributes funds
        
        Args:
            escrow_id: Escrow ID
            ruling: Dictionary with:
                - winner: 'party_a' | 'party_b' | 'split'
                - party_a_payout_lovelace: Amount to party A
                - party_b_payout_lovelace: Amount to party B
                - reasoning: Explanation
        Returns:
            Resolution response
        """
        try:
            url = f"{self.payment_service_url}/api/v1/escrow/bilateral/{escrow_id}/resolve"
            
            payload = {
                "ruling": {
                    "winner": ruling.get('winner'),
                    "payouts": {
                        "partyA": ruling.get('party_a_payout_lovelace'),
                        "partyB": ruling.get('party_b_payout_lovelace')
                    },
                    "reasoning": ruling.get('reasoning', '')
                }
            }
            
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"✅ Resolved escrow {escrow_id}: {ruling.get('winner')} wins")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Escrow resolution failed for {escrow_id}: {e}")
            return None
    
    # ============================================
    # UTILITY METHODS
    # ============================================
    
    def ada_to_lovelace(self, ada: float) -> int:
        """Convert ADA to Lovelace (1 ADA = 1,000,000 Lovelace)"""
        return int(ada * 1_000_000)
    
    def lovelace_to_ada(self, lovelace: int) -> float:
        """Convert Lovelace to ADA"""
        return lovelace / 1_000_000
    
    def check_service_health(self) -> Dict[str, bool]:
        """
        Check if Masumi services are running
        
        Returns:
            Dictionary with service statuses
        """
        health = {
            'payment_service': False,
            'registry_service': False
        }
        
        try:
            # Check payment service with quick timeout
            response = requests.get(f"{self.payment_service_url}/health", timeout=0.5)
            health['payment_service'] = response.status_code == 200
        except:
            pass
        
        try:
            # Check registry service with quick timeout
            response = requests.get(f"{self.registry_service_url}/health", timeout=0.5)
            health['registry_service'] = response.status_code == 200
        except:
            pass
        
        logger.info(f"Masumi services health: {health}")
        health['all_services_up'] = health['payment_service'] and health['registry_service']
        return health


# Singleton instance
masumi_service = MasumiService()
