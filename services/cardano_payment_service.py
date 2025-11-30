"""
Cardano Payment Service
Handles real on-chain transactions for agent payments on Cardano Preprod
"""

import os
import logging
import json
from typing import Dict, Optional, List
from pycardano import (
    PaymentSigningKey,
    PaymentVerificationKey,
    Address,
    Network,
    TransactionBuilder,
    TransactionOutput,
    Value,
    BlockFrostChainContext,
    Transaction,
    UTxO
)
from blockfrost import BlockFrostApi, ApiError

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

# Agent earnings per execution (in Lovelace)
# Minimum 1.1 ADA per output to meet Cardano UTXO requirements
AGENT_EARNINGS = {
    'orchestrator': 1500000,      # 1.5 ADA
    'spot_finder': 1300000,       # 1.3 ADA
    'pricing': 1400000,           # 1.4 ADA
    'route_optimizer': 1200000,   # 1.2 ADA
    'payment_verifier': 1200000,  # 1.2 ADA
    'security_guard': 1250000,    # 1.25 ADA
    'dispute_resolver': 1150000   # 1.15 ADA
}


class CardanoPaymentService:
    """Service for executing real Cardano blockchain payments"""
    
    def __init__(self):
        self.network = Network.TESTNET
        self.blockfrost_project_id = os.getenv('BLOCKFROST_PROJECT_ID')
        
        # Load customer wallet credentials
        self._load_customer_wallet()
        
        # Initialize BlockFrost API
        try:
            self.blockfrost_api = BlockFrostApi(
                project_id=self.blockfrost_project_id,
                base_url='https://cardano-preprod.blockfrost.io/api/v0'
            )
            self.chain_context = BlockFrostChainContext(
                project_id=self.blockfrost_project_id,
                network=self.network
            )
            logger.info("✅ Cardano Payment Service initialized (Preprod)")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Cardano Payment Service: {e}")
            raise
    
    def _load_customer_wallet(self):
        """Load customer wallet signing key from JSON file"""
        try:
            wallet_file = 'CARDANO_WALLETS_PREPROD.json'
            
            if not os.path.exists(wallet_file):
                logger.error(f"❌ Wallet file not found: {wallet_file}")
                raise FileNotFoundError(f"Wallet file not found: {wallet_file}")
            
            with open(wallet_file, 'r') as f:
                wallets = json.load(f)
            
            customer_data = wallets.get('customer_wallet')
            if not customer_data:
                raise ValueError("Customer wallet not found in wallet file")
            
            # Load signing key from hex
            signing_key_hex = customer_data['signing_key']
            self.payment_skey = PaymentSigningKey.from_cbor(signing_key_hex)
            self.payment_vkey = PaymentVerificationKey.from_signing_key(self.payment_skey)
            self.customer_address = Address.from_primitive(customer_data['address'])
            
            logger.info(f"✅ Customer wallet loaded: {self.customer_address}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load customer wallet: {e}")
            raise
    
    def send_agent_payment(
        self,
        agent_name: str,
        amount_lovelace: int,
        session_id: str
    ) -> Optional[Dict]:
        """
        Send real payment to an agent wallet on Cardano blockchain
        
        Args:
            agent_name: Name of the agent (orchestrator, spot_finder, etc.)
            amount_lovelace: Amount in Lovelace (1 ADA = 1,000,000 Lovelace)
            session_id: Parking session ID for reference
        
        Returns:
            Dictionary with transaction details including tx_hash
        """
        try:
            agent_key = agent_name.lower().replace(' ', '_')
            recipient_address = AGENT_WALLETS.get(agent_key)
            
            if not recipient_address:
                logger.error(f"❌ No wallet address for agent: {agent_name}")
                return None
            
            # Convert string address to Address object
            recipient = Address.from_primitive(recipient_address)
            
            # Build transaction
            logger.info(f"💸 Sending {amount_lovelace / 1000000:.2f} ADA to {agent_name}...")
            
            builder = TransactionBuilder(self.chain_context)
            builder.add_input_address(self.customer_address)
            builder.add_output(
                TransactionOutput(
                    address=recipient,
                    amount=Value(coin=amount_lovelace)
                )
            )
            
            # Sign transaction
            signed_tx = builder.build_and_sign(
                signing_keys=[self.payment_skey],
                change_address=self.customer_address
            )
            
            # Submit transaction
            tx_hash = self.chain_context.submit_tx(signed_tx.to_cbor())
            
            logger.info(f"✅ Payment sent! TX Hash: {tx_hash}")
            
            return {
                'success': True,
                'tx_hash': tx_hash,
                'agent_name': agent_name,
                'amount_lovelace': amount_lovelace,
                'amount_ada': amount_lovelace / 1000000,
                'recipient_address': str(recipient),
                'session_id': session_id,
                'network': 'preprod'
            }
            
        except Exception as e:
            logger.error(f"❌ Payment failed for {agent_name}: {e}")
            return {
                'success': False,
                'error': str(e),
                'agent_name': agent_name
            }
    
    def distribute_parking_payment(self, session_id: str) -> Dict[str, any]:
        """
        Distribute parking payment to all agents with real blockchain transactions
        
        Args:
            session_id: Parking session ID
        
        Returns:
            Dictionary with all transaction hashes and results
        """
        results = {
            'session_id': session_id,
            'transactions': [],
            'total_sent_lovelace': 0,
            'successful_payments': 0,
            'failed_payments': 0
        }
        
        logger.info(f"🚀 Starting payment distribution for session: {session_id}")
        
        for agent_name, amount_lovelace in AGENT_EARNINGS.items():
            payment_result = self.send_agent_payment(
                agent_name=agent_name,
                amount_lovelace=amount_lovelace,
                session_id=session_id
            )
            
            if payment_result:
                results['transactions'].append(payment_result)
                
                if payment_result.get('success'):
                    results['successful_payments'] += 1
                    results['total_sent_lovelace'] += amount_lovelace
                else:
                    results['failed_payments'] += 1
        
        total_ada = results['total_sent_lovelace'] / 1000000
        logger.info(f"✅ Payment distribution complete: {total_ada:.2f} ADA sent in {results['successful_payments']} transactions")
        
        return results
    
    def verify_transaction(self, tx_hash: str) -> Optional[Dict]:
        """
        Verify a transaction on the blockchain
        
        Args:
            tx_hash: Transaction hash to verify
        
        Returns:
            Transaction details from blockchain
        """
        try:
            tx_info = self.blockfrost_api.transaction(tx_hash)
            
            return {
                'tx_hash': tx_hash,
                'block': tx_info.block,
                'block_height': tx_info.block_height,
                'slot': tx_info.slot,
                'index': tx_info.index,
                'fees': tx_info.fees,
                'size': tx_info.size,
                'valid': tx_info.valid_contract,
                'explorer_url': f'https://preprod.cardanoscan.io/transaction/{tx_hash}'
            }
            
        except ApiError as e:
            logger.error(f"❌ Failed to verify transaction {tx_hash}: {e}")
            return None
    
    def get_wallet_balance(self, address: str) -> Optional[int]:
        """
        Get balance of a wallet address in Lovelace
        
        Args:
            address: Cardano address
        
        Returns:
            Balance in Lovelace
        """
        try:
            address_info = self.blockfrost_api.address(address)
            
            # Sum all amounts (ADA is the first element)
            total_lovelace = 0
            for amount in address_info.amount:
                if amount.unit == 'lovelace':
                    total_lovelace = int(amount.quantity)
                    break
            
            return total_lovelace
            
        except ApiError as e:
            logger.error(f"❌ Failed to get balance for {address}: {e}")
            return None
    
    def get_customer_balance(self) -> float:
        """Get customer wallet balance in ADA"""
        balance_lovelace = self.get_wallet_balance(str(self.customer_address))
        
        if balance_lovelace is not None:
            return balance_lovelace / 1000000
        return 0.0


# Create singleton instance
try:
    cardano_payment_service = CardanoPaymentService()
except Exception as e:
    logger.warning(f"⚠️ Cardano Payment Service not available: {e}")
    cardano_payment_service = None
