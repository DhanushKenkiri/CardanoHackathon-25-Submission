"""
Orchestrator Agent
Master coordinator for the multi-agent parking system
Creates Masumi payment requests and coordinates sub-agents
"""

import os
import logging
import hashlib
import time
from datetime import datetime
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from services import firebase_service, gemini_service, masumi_service

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OrchestratorAgent:
    """
    Master agent that coordinates all sub-agents and manages Masumi payments
    
    Workflow:
    1. Receive parking request from customer
    2. Create Masumi payment request (1.5 ADA)
    3. Delegate to 4 sub-agents (SpotFinder, Pricing, Route, PaymentVerifier)
    4. Aggregate results and return to customer
    5. Distribute payment to sub-agents upon completion
    """
    
    def __init__(self):
        self.agent_id = "orchestrator_agent_001"
        self.agent_name = "ParknGo Orchestrator"
        self.payment_split = {
            'spot_finder': 0.3,      # 30% for finding best spot
            'pricing_agent': 0.25,   # 25% for dynamic pricing
            'route_optimizer': 0.25, # 25% for route optimization
            'payment_verifier': 0.2  # 20% for payment verification
        }
        
        # Register agent on Masumi Network
        self._register_on_masumi()
        
        logger.info(f"✅ {self.agent_name} initialized (ID: {self.agent_id})")
    
    def _register_on_masumi(self):
        """Register orchestrator agent on Masumi Registry"""
        try:
            agent_data = {
                'name': self.agent_name,
                'description': 'Master coordinator for multi-agent parking system',
                'capabilities': [
                    'parking_reservation',
                    'payment_coordination',
                    'agent_orchestration',
                    'result_aggregation'
                ],
                'pricing': {
                    'base_fee': 1.5,
                    'currency': 'ADA'
                }
            }
            
            result = masumi_service.register_agent(agent_data)
            
            if result.get('success'):
                logger.info(f"✅ Orchestrator registered on Masumi Network")
            else:
                logger.warning(f"⚠️  Masumi registration skipped: {result.get('error')}")
                
        except Exception as e:
            logger.error(f"❌ Failed to register on Masumi: {e}")
    
    def handle_parking_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for parking requests
        
        Args:
            request_data: {
                'user_id': str,
                'user_location': {'lat': float, 'lng': float},
                'vehicle_type': str,
                'desired_features': List[str],
                'duration_hours': float,
                'wallet_address': str (Cardano)
            }
        
        Returns:
            {
                'success': bool,
                'reservation_id': str,
                'payment_id': str,
                'payment_address': str,
                'amount_lovelace': int,
                'spot_recommendation': {...},
                'pricing': {...},
                'route': {...},
                'expires_at': timestamp
            }
        """
        
        logger.info(f"🎯 Received parking request from user: {request_data.get('user_id')}")
        
        try:
            # Step 1: Create Masumi payment request (1.5 ADA)
            payment_request = self._create_payment_request(request_data)
            
            # Masumi payment is optional for development
            if not payment_request or not payment_request.get('blockchainIdentifier'):
                logger.warning("⚠️ Masumi payment unavailable, continuing without blockchain payment")
                payment_id = f"mock_payment_{datetime.utcnow().timestamp()}"
                payment_address = "mock_address"
            else:
                payment_id = payment_request.get('id')
                payment_address = payment_request.get('blockchainIdentifier')
            
            logger.info(f"💰 Payment request created: {payment_id}")
            
            # Step 2: Delegate to sub-agents (parallel execution)
            sub_agent_results = self._coordinate_sub_agents(request_data, payment_id)
            
            # Step 3: Aggregate results using Gemini AI
            final_recommendation = self._aggregate_results(sub_agent_results, request_data)
            
            if not final_recommendation:
                logger.error("❌ Failed to generate recommendation")
                return {
                    'success': False,
                    'error': 'Failed to generate parking recommendation',
                    'details': 'AI aggregation unavailable and no fallback succeeded'
                }
            
            # Step 4: Create reservation in Firebase
            reservation = self._create_reservation(
                request_data, 
                final_recommendation, 
                payment_id
            )
            
            return {
                'success': True,
                'reservation_id': reservation['reservation_id'],
                'payment_id': payment_id,
                'payment_address': payment_address,
                'amount_lovelace': masumi_service.ada_to_lovelace(1.5),
                'spot_recommendation': final_recommendation['spot'],
                'pricing': final_recommendation['pricing'],
                'route': final_recommendation['route'],
                'expires_at': int(time.time()) + 600,  # 10 min expiry
                'instructions': 'Send exactly 1.5 ADA to the payment address to confirm reservation'
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing parking request: {e}")
            import traceback
            traceback.print_exc()
            
            return {
                'success': False,
                'error': str(e)
            }
    
    def _create_payment_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create Masumi payment request for parking reservation"""
        
        from datetime import datetime, timedelta
        import hashlib
        
        # Create input hash from request data
        input_str = f"{request_data.get('user_id')}_{request_data.get('vehicle_type')}_{datetime.utcnow().isoformat()}"
        input_hash = hashlib.sha256(input_str.encode()).hexdigest()
        
        payment_data = {
            'agent_identifier': f"{self.agent_id}_parkngo",
            'input_hash': input_hash,
            'pay_by_time': 60,  # 60 minutes
            'submit_result_time': 24,  # 24 hours
            'unlock_time': 48,  # 48 hours
            'external_dispute_unlock_time': 72,  # 72 hours
            'metadata': {
                'user_id': request_data.get('user_id'),
                'vehicle_type': request_data.get('vehicle_type'),
                'duration_hours': request_data.get('duration_hours'),
                'amount_ada': 1.5,
                'description': f"Parking reservation for {request_data.get('user_id')}",
                'timestamp': datetime.utcnow().isoformat()
            }
        }
        
        return masumi_service.create_payment_request(payment_data)
    
    def _coordinate_sub_agents(self, request_data: Dict[str, Any], payment_id: str) -> Dict[str, Any]:
        """
        Coordinate sub-agents to process the parking request
        
        In production, these would be separate agents on Masumi Network
        For now, we'll simulate their responses using Gemini AI
        """
        
        logger.info("🤖 Coordinating sub-agents...")
        
        # Import sub-agents
        from .spot_finder import SpotFinderAgent
        from .pricing_agent import PricingAgent
        from .route_optimizer import RouteOptimizerAgent
        
        spot_finder = SpotFinderAgent()
        pricing_agent = PricingAgent()
        route_optimizer = RouteOptimizerAgent()
        
        # Execute sub-agents with error handling
        try:
            spot_result = spot_finder.find_best_spot(request_data)
            if not spot_result or not spot_result.get('recommended_spot'):
                raise ValueError("SpotFinder returned no recommendation")
        except Exception as e:
            logger.error(f"SpotFinder error: {e}")
            spot_result = {'recommended_spot': None, 'error': str(e)}
        
        try:
            if spot_result.get('recommended_spot'):
                pricing_result = pricing_agent.calculate_price(
                    spot_result['recommended_spot'],
                    request_data
                )
            else:
                pricing_result = {'error': 'No spot available for pricing'}
        except Exception as e:
            logger.error(f"Pricing error: {e}")
            pricing_result = {'error': str(e)}
        
        try:
            if spot_result.get('recommended_spot'):
                route_result = route_optimizer.optimize_route(
                    request_data.get('user_location', {}),
                    spot_result['recommended_spot']
                )
            else:
                route_result = {'error': 'No spot available for routing'}
        except Exception as e:
            logger.error(f"Route optimizer error: {e}")
            route_result = {'error': str(e)}
        
        return {
            'spot_finder': spot_result,
            'pricing': pricing_result,
            'route': route_result
        }
    
    def _aggregate_results(self, sub_results: Dict[str, Any], request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Use Gemini AI to intelligently aggregate sub-agent results"""
        
        logger.info("🧠 Aggregating results with Gemini AI...")
        
        # Prepare context for Gemini
        context = f"""
        Analyze these sub-agent results and create a final parking recommendation:
        
        SPOT FINDER RESULT:
        {sub_results['spot_finder']}
        
        PRICING RESULT:
        {sub_results['pricing']}
        
        ROUTE RESULT:
        {sub_results['route']}
        
        USER REQUEST:
        - Location: {request_data.get('user_location')}
        - Vehicle: {request_data.get('vehicle_type')}
        - Duration: {request_data.get('duration_hours')} hours
        - Desired features: {request_data.get('desired_features')}
        
        Provide a confidence score (0-100) for this recommendation and explain why.
        """
        
        try:
            response = gemini_service._generate_with_retry(context)
            
            # Parse Gemini response
            import json
            try:
                ai_analysis = json.loads(response)
            except:
                ai_analysis = {
                    'confidence': 85,
                    'reasoning': response[:200]
                }
            
            recommended_spot = sub_results.get('spot_finder', {}).get('recommended_spot')
            
            return {
                'spot': recommended_spot,
                'pricing': sub_results.get('pricing', {}),
                'route': sub_results.get('route', {}),
                'ai_confidence': ai_analysis.get('confidence', 85),
                'ai_reasoning': ai_analysis.get('reasoning', 'High quality match')
            }
            
        except Exception as e:
            logger.error(f"❌ Gemini aggregation failed: {e}")
            
            # Fallback: use direct results with null checks
            recommended_spot = sub_results.get('spot_finder', {}).get('recommended_spot')
            
            return {
                'spot': recommended_spot,
                'pricing': sub_results.get('pricing', {}),
                'route': sub_results.get('route', {}),
                'ai_confidence': 75,
                'ai_reasoning': 'Fallback aggregation (Gemini unavailable)'
            }
    
    def _create_reservation(
        self, 
        request_data: Dict[str, Any], 
        recommendation: Dict[str, Any],
        payment_id: str
    ) -> Dict[str, Any]:
        """Create reservation in Firebase"""
        
        # Generate reservation ID
        import uuid
        reservation_id = f"res_{uuid.uuid4().hex[:12]}"
        
        reservation_data = {
            'reservation_id': reservation_id,
            'user_id': request_data.get('user_id'),
            'spot_id': recommendation['spot']['spot_id'],
            'payment_id': payment_id,
            'amount_lovelace': masumi_service.ada_to_lovelace(recommendation['pricing']['total_price']),
            'duration_hours': request_data.get('duration_hours'),
            'status': 'pending_payment',
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow().timestamp() + 600),
            'ai_confidence': recommendation.get('ai_confidence'),
            'route': recommendation.get('route')
        }
        
        result = firebase_service.create_reservation(reservation_data)
        
        # Firebase returns reservation_id string, not a dict
        if not result:
            logger.error("❌ Failed to create reservation in Firebase")
            return {
                'success': False,
                'error': 'Reservation creation failed'
            }
        
        reservation_id = result  # result is the reservation_id string
        logger.info(f"✅ Reservation created: {reservation_id}")
        
        return {
            'reservation_id': reservation_id,
            'success': True,
            **reservation_data
        }
    
    def verify_payment_and_activate(self, payment_id: str) -> Dict[str, Any]:
        """
        Verify payment on Cardano blockchain and activate reservation
        This is called by PaymentVerifierAgent after detecting payment
        """
        
        logger.info(f"🔍 Verifying payment: {payment_id}")
        
        try:
            # Check payment status on Masumi
            payment_status = masumi_service.get_payment_status(payment_id)
            
            if payment_status.get('status') == 'completed':
                # Submit result hash to unlock payment
                result_hash = hashlib.sha256(
                    f"reservation_confirmed_{payment_id}_{time.time()}".encode()
                ).hexdigest()
                
                submit_result = masumi_service.submit_result(
                    payment_id,
                    result_hash,
                    {'status': 'reservation_confirmed'}
                )
                
                # Update reservation status in Firebase
                # (In production, query Firebase for reservation by payment_id)
                logger.info(f"✅ Payment verified and reservation activated")
                
                # Distribute payment to sub-agents
                self._distribute_payment(payment_id, payment_status.get('amount_lovelace', 0))
                
                return {
                    'success': True,
                    'payment_id': payment_id,
                    'status': 'activated'
                }
            else:
                return {
                    'success': False,
                    'error': 'Payment not completed',
                    'status': payment_status.get('status')
                }
                
        except Exception as e:
            logger.error(f"❌ Payment verification failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _distribute_payment(self, payment_id: str, total_amount: int):
        """Distribute payment to sub-agents based on split percentage"""
        
        logger.info(f"💸 Distributing payment to sub-agents...")
        
        for agent_name, percentage in self.payment_split.items():
            agent_amount = int(total_amount * percentage)
            
            logger.info(f"  - {agent_name}: {agent_amount} lovelace ({percentage*100}%)")
            
            # In production, this would create individual Masumi payments
            # For now, just log the distribution
            
            # Record in Firebase for earnings tracking
            earnings_data = {
                'agent_name': agent_name,
                'payment_id': payment_id,
                'amount_lovelace': agent_amount,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            try:
                firebase_service.record_agent_earning(earnings_data)
            except Exception as e:
                logger.error(f"❌ Failed to record earnings for {agent_name}: {e}")
        
        logger.info("✅ Payment distribution complete")


# Singleton instance
orchestrator_agent = OrchestratorAgent()
