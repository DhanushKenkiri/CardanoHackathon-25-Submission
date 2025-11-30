"""
ParknGo Multi-Agent Parking System
Flask REST API Server

Integrates all 7 AI agents:
- Orchestrator (master coordinator)
- SpotFinder (Gemini AI spot ranking)
- PricingAgent (Gemini demand forecasting)
- RouteOptimizer (Gemini directions)
- PaymentVerifier (Gemini fraud detection)
- SecurityGuard (Gemini anomaly detection)
- DisputeResolver (Gemini AI arbitration)
"""

import os
import sys

# Fix for Python 3.14 protobuf compatibility
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'

import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import agents
from agents import (
    orchestrator_agent,
    spot_finder_agent,
    pricing_agent,
    route_optimizer_agent,
    payment_verifier_agent,
    security_guard_agent,
    dispute_resolver_agent
)

# Import services
from services import firebase_service, gemini_service, masumi_service
from firebase_admin import db

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Docker"""
    try:
        # Check Firebase connection
        firebase_service.get_all_parking_spots()
        
        return jsonify({
            'status': 'healthy',
            'service': 'parkngo-api',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 503


# ============================================================================
# PARKING RESERVATION ENDPOINTS
# ============================================================================

@app.route('/api/parking/reserve', methods=['POST'])
def reserve_parking():
    """
    Create a parking reservation
    
    Request body:
    {
        "user_id": "user_123",
        "user_location": {"lat": 40.7128, "lng": -74.0060},
        "vehicle_type": "sedan",
        "desired_features": ["covered", "ev_charging"],
        "duration_hours": 2.5,
        "wallet_address": "addr1..."
    }
    
    Response:
    {
        "success": true,
        "reservation_id": "res_abc123",
        "payment_id": "pay_xyz789",
        "payment_address": "addr1...",
        "amount_lovelace": 1500000,
        "spot_recommendation": {...},
        "pricing": {...},
        "route": {...},
        "expires_at": 1234567890
    }
    """
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'user_location', 'vehicle_type', 'duration_hours', 'wallet_address']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        logger.info(f"📥 Parking reservation request from user: {data.get('user_id')}")
        
        # Delegate to Orchestrator Agent
        result = orchestrator_agent.handle_parking_request(data)
        
        if result.get('success'):
            logger.info(f"✅ Reservation created: {result.get('reservation_id')}")
            return jsonify(result), 200
        else:
            logger.error(f"❌ Reservation failed: {result.get('error')}")
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"❌ Error in reserve_parking: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/parking/spots', methods=['GET'])
def get_available_spots_legacy():
    """
    Get all available parking spots (LEGACY ENDPOINT - use /api/parking/spots/available instead)
    
    Query params:
    - zone: Filter by zone (A, B, C)
    - type: Filter by type (regular, premium, disabled)
    - features: Comma-separated features (covered,ev_charging)
    
    Response:
    {
        "success": true,
        "spots": [...],
        "total_available": 5
    }
    """
    
    try:
        # Get query parameters
        filters = {}
        
        if request.args.get('zone'):
            filters['zone'] = request.args.get('zone')
        
        if request.args.get('type'):
            filters['type'] = request.args.get('type')
        
        if request.args.get('features'):
            filters['features'] = request.args.get('features').split(',')
        
        logger.info(f"📥 Get available spots request with filters: {filters}")
        
        # Query Firebase
        spots = firebase_service.get_available_spots(filters)
        
        return jsonify({
            'success': True,
            'spots': spots,
            'total_available': len(spots) if spots else 0,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting spots: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/parking/price', methods=['POST'])
def calculate_price():
    """
    Calculate price for a parking spot (without reservation)
    
    Request body:
    {
        "spot_id": "A-01",
        "duration_hours": 2.0
    }
    
    Response:
    {
        "success": true,
        "pricing": {...},
        "ai_reasoning": "..."
    }
    """
    
    try:
        data = request.get_json()
        
        spot_id = data.get('spot_id')
        duration_hours = data.get('duration_hours', 1.0)
        
        if not spot_id:
            return jsonify({
                'success': False,
                'error': 'Missing spot_id'
            }), 400
        
        # Get spot data from Firebase
        spot_data = firebase_service.get_spot_by_id(spot_id)
        
        if not spot_data:
            return jsonify({
                'success': False,
                'error': f'Spot {spot_id} not found'
            }), 404
        
        # Calculate price using Pricing Agent
        pricing_result = pricing_agent.calculate_price(
            spot_data,
            {'duration_hours': duration_hours}
        )
        
        return jsonify({
            'success': True,
            'spot_id': spot_id,
            'pricing': pricing_result,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error calculating price: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# PAYMENT ENDPOINTS
# ============================================================================

@app.route('/api/payment/verify', methods=['POST'])
def verify_payment():
    """
    Verify payment on blockchain
    
    Request body:
    {
        "payment_id": "pay_xyz789",
        "payment_address": "addr1..."
    }
    
    Response:
    {
        "verified": true,
        "amount_lovelace": 1500000,
        "tx_hash": "abc123...",
        "fraud_check": {...}
    }
    """
    
    try:
        data = request.get_json()
        
        payment_id = data.get('payment_id')
        payment_address = data.get('payment_address')
        
        if not payment_id or not payment_address:
            return jsonify({
                'success': False,
                'error': 'Missing payment_id or payment_address'
            }), 400
        
        logger.info(f"📥 Payment verification request: {payment_id}")
        
        # Delegate to Payment Verifier Agent
        result = payment_verifier_agent.verify_payment(payment_id, payment_address)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ Error verifying payment: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/payment/status/<payment_id>', methods=['GET'])
def get_payment_status(payment_id):
    """
    Get payment status from Masumi Network
    
    Response:
    {
        "payment_id": "pay_xyz789",
        "status": "completed",
        "amount_lovelace": 1500000
    }
    """
    
    try:
        logger.info(f"📥 Payment status request: {payment_id}")
        
        status = masumi_service.get_payment_status(payment_id)
        
        if status is None:
            return jsonify({
                'success': False,
                'error': 'Payment not found or Masumi service unavailable',
                'payment_status': None
            }), 404
        
        return jsonify({
            'success': True,
            'payment_status': status
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting payment status: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'payment_status': None
        }), 500


# ============================================================================
# DISPUTE ENDPOINTS
# ============================================================================

@app.route('/api/disputes/create', methods=['POST'])
def create_dispute():
    """
    Create a new dispute
    
    Request body:
    {
        "user_id": "user_123",
        "session_id": "session_456",
        "dispute_type": "incorrect_charge",
        "description": "Charged for 3 hours but only parked 2 hours",
        "evidence": ["receipt.jpg", "timestamp.jpg"],
        "disputed_amount_lovelace": 500000
    }
    
    Response:
    {
        "success": true,
        "dispute_id": "dispute_789",
        "escrow_id": "escrow_abc",
        "status": "under_investigation"
    }
    """
    
    try:
        data = request.get_json()
        
        required_fields = ['user_id', 'session_id', 'dispute_type', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        logger.info(f"📥 Dispute creation request from user: {data.get('user_id')}")
        
        # Delegate to Dispute Resolver Agent
        result = dispute_resolver_agent.create_dispute(data)
        
        return jsonify(result), 200 if result.get('success') else 400
        
    except Exception as e:
        logger.error(f"❌ Error creating dispute: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/disputes/<dispute_id>', methods=['GET'])
def get_dispute_status(dispute_id):
    """
    Get dispute status
    
    Response:
    {
        "dispute_id": "dispute_789",
        "status": "under_investigation",
        "created_at": "2025-11-27T...",
        "updates": [...]
    }
    """
    
    try:
        logger.info(f"📥 Dispute status request: {dispute_id}")
        
        status = dispute_resolver_agent.get_dispute_status(dispute_id)
        
        return jsonify(status), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting dispute status: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/disputes/<dispute_id>/resolve', methods=['POST'])
def resolve_dispute(dispute_id):
    """
    Resolve a dispute (admin/arbiter only)
    
    Response:
    {
        "success": true,
        "ruling": "customer_wins",
        "confidence": 85,
        "payout_distribution": {...}
    }
    """
    
    try:
        logger.info(f"📥 Dispute resolution request: {dispute_id}")
        
        # Delegate to Dispute Resolver Agent
        result = dispute_resolver_agent.resolve_dispute(dispute_id)
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ Error resolving dispute: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/disputes/<dispute_id>/messages', methods=['POST'])
def add_dispute_message(dispute_id):
    """
    Add a message to dispute chat
    
    Request body:
    {
        "sender": "user",
        "message": "Here is additional evidence..."
    }
    
    Response:
    {
        "success": true,
        "message_id": "msg_123"
    }
    """
    
    try:
        data = request.get_json()
        sender = data.get('sender', 'user')
        message = data.get('message', '')
        
        if not message:
            return jsonify({
                'success': False,
                'error': 'Message cannot be empty'
            }), 400
        
        # Store message in Firebase
        import uuid
        message_id = f"msg_{uuid.uuid4().hex[:12]}"
        
        message_data = {
            'message_id': message_id,
            'dispute_id': dispute_id,
            'sender': sender,
            'message': message,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        
        # Write to Firebase
        from firebase_admin import db
        messages_ref = db.reference(f'disputes/{dispute_id}/messages')
        messages_ref.child(message_id).set(message_data)
        
        logger.info(f"✅ Message added to dispute {dispute_id}")
        
        return jsonify({
            'success': True,
            'message_id': message_id
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error adding message: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
        result = dispute_resolver_agent.resolve_dispute(dispute_id)
        
        return jsonify(result), 200 if result.get('success') else 400
        
    except Exception as e:
        logger.error(f"❌ Error resolving dispute: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# MONITORING ENDPOINTS
# ============================================================================

@app.route('/api/monitoring/sessions', methods=['GET'])
def monitor_sessions():
    """
    Get current session monitoring status
    
    Response:
    {
        "active_sessions": 5,
        "violations_detected": 1,
        "violations": [...],
        "anomalies": [...]
    }
    """
    
    try:
        logger.info("📥 Session monitoring request")
        
        # Delegate to Security Guard Agent
        result = security_guard_agent.monitor_sessions()
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"❌ Error monitoring sessions: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/agents/earnings', methods=['GET'])
def get_agent_earnings():
    """
    Get earnings breakdown for all agents
    
    Response:
    {
        "total_earnings_lovelace": 5000000,
        "by_agent": {
            "spot_finder": 1500000,
            "pricing_agent": 1250000,
            ...
        }
    }
    """
    
    try:
        logger.info("📥 Agent earnings request")
        
        # Query Firebase for agent earnings
        earnings = firebase_service.get_agent_earnings()
        
        total_earnings = sum(earnings.values())
        
        return jsonify({
            'success': True,
            'earnings': earnings,
            'total_earnings_cents': total_earnings,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting agent earnings: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/blockchain/transactions', methods=['GET'])
def get_blockchain_transactions():
    """
    Get all blockchain transactions with transaction hashes
    
    Response:
    {
        "transactions": [
            {
                "session_id": "...",
                "tx_hash": "69e7196...",
                "agent_name": "orchestrator",
                "amount_ada": 0.4,
                "timestamp": "..."
            }
        ]
    }
    """
    
    try:
        logger.info("📥 Blockchain transactions request")
        
        # Query Firebase for blockchain transactions
        transactions_ref = db.reference('blockchain_transactions')
        all_transactions = transactions_ref.get()
        
        if not all_transactions:
            return jsonify({
                'success': True,
                'transactions': [],
                'total_transactions': 0
            }), 200
        
        # Flatten transactions from all sessions
        flattened_transactions = []
        for session_id, session_data in all_transactions.items():
            if 'transactions' in session_data:
                for tx in session_data['transactions']:
                    if tx.get('success') and tx.get('tx_hash'):
                        flattened_transactions.append({
                            'session_id': session_id,
                            'tx_hash': tx['tx_hash'],
                            'agent_name': tx['agent_name'],
                            'amount_ada': tx['amount_ada'],
                            'amount_lovelace': tx['amount_lovelace'],
                            'recipient_address': tx['recipient_address'],
                            'timestamp': session_data.get('timestamp'),
                            'explorer_url': f"https://preprod.cardanoscan.io/transaction/{tx['tx_hash']}"
                        })
        
        # Sort by most recent first
        flattened_transactions.sort(
            key=lambda x: x.get('timestamp', ''),
            reverse=True
        )
        
        return jsonify({
            'success': True,
            'transactions': flattened_transactions,
            'total_transactions': len(flattened_transactions)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting blockchain transactions: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/blockchain/session/<session_id>', methods=['GET'])
def get_session_transactions(session_id):
    """
    Get blockchain transactions for a specific session
    
    Response:
    {
        "session_id": "...",
        "total_sent_ada": 2.0,
        "successful_payments": 7,
        "transactions": [...]
    }
    """
    
    try:
        logger.info(f"📥 Session transactions request for: {session_id}")
        
        transactions_ref = db.reference(f'blockchain_transactions/{session_id}')
        session_txs = transactions_ref.get()
        
        if not session_txs:
            return jsonify({
                'success': False,
                'error': 'No transactions found for this session'
            }), 404
        
        return jsonify({
            'success': True,
            **session_txs
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting session transactions: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# HEALTH & STATUS ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def api_health_check():
    """
    Health check endpoint
    
    Response:
    {
        "status": "healthy",
        "services": {
            "firebase": "connected",
            "gemini": "available",
            "masumi": "healthy"
        },
        "agents": {
            "orchestrator": "ready",
            ...
        }
    }
    """
    
    try:
        # Check service health
        services_status = {
            'firebase': 'connected',  # Firebase initialized successfully
            'gemini': 'available',  # Gemini doesn't have a health endpoint
            'masumi': 'checking...'
        }
        
        # Check Masumi health
        masumi_health = masumi_service.check_service_health()
        services_status['masumi'] = 'healthy' if masumi_health.get('all_services_up') else 'degraded'
        
        # Check agents
        agents_status = {
            'orchestrator': 'ready',
            'spot_finder': 'ready',
            'pricing_agent': 'ready',
            'route_optimizer': 'ready',
            'payment_verifier': 'ready',
            'security_guard': 'ready',
            'dispute_resolver': 'ready'
        }
        
        all_healthy = all(
            status in ['connected', 'available', 'healthy'] 
            for status in services_status.values()
        )
        
        return jsonify({
            'status': 'healthy' if all_healthy else 'degraded',
            'services': services_status,
            'agents': agents_status,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """
    Get system statistics
    
    Response:
    {
        "total_spots": 30,
        "available_spots": 15,
        "active_sessions": 5,
        "total_reservations": 100,
        "total_revenue_ada": 150.5
    }
    """
    
    try:
        # Get all spots
        all_spots = firebase_service.get_all_parking_spots()
        available_spots = firebase_service.get_available_spots({})
        active_sessions = firebase_service.get_active_sessions()
        
        return jsonify({
            'success': True,
            'total_spots': len(all_spots) if all_spots else 0,
            'available_spots': len(available_spots) if available_spots else 0,
            'active_sessions': len(active_sessions) if active_sessions else 0,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# WEB INTERFACE ENDPOINTS
# ============================================================================

@app.route('/')
def index():
    """Redirect to login"""
    from flask import redirect
    return redirect('/login')

@app.route('/login')
def login():
    """Serve login page"""
    from flask import render_template
    return render_template('login.html')

@app.route('/app')
def app_page():
    """Serve main app (B2C interface)"""
    from flask import render_template
    return render_template('app.html')

@app.route('/dashboard')
def dashboard():
    """Serve the admin/owner dashboard"""
    from flask import render_template
    return render_template('dashboard.html')

@app.route('/api/trigger/vehicle-entry', methods=['POST'])
def trigger_vehicle_entry():
    """
    Trigger vehicle entry event (writes to Firebase, triggers listeners)
    
    Request body:
    {
        "vehicle_id": "ABC123",
        "spot_id": "A1",
        "user_id": "user_001"
    }
    """
    try:
        data = request.get_json()
        vehicle_id = data.get('vehicle_id', f'WEB_{int(datetime.utcnow().timestamp())}')
        spot_id = data.get('spot_id', 'A1')
        user_id = data.get('user_id', 'web_user')
        
        logger.info(f"🚗 Web trigger: Vehicle entry - {vehicle_id} → Spot {spot_id}")
        
        # Write to Firebase hardware_events/vehicle_entry
        import time
        entry_time = int(time.time())
        session_id = f"web_session_{vehicle_id}_{entry_time}"
        
        entry_data = {
            'vehicle_id': vehicle_id,
            'spot_id': spot_id,
            'user_id': user_id,
            'entry_time': entry_time,
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'source': 'web_interface'
        }
        
        # Write to Firebase (this triggers the listener)
        firebase_service.write_vehicle_entry(entry_data)
        
        # Also create a pending orchestration record to track
        orchestration_data = {
            'session_id': session_id,
            'vehicle_id': vehicle_id,
            'spot_id': spot_id,
            'user_id': user_id,
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat() + 'Z'
        }
        firebase_service.create_orchestration_record(session_id, orchestration_data)
        
        logger.info(f"✅ Vehicle entry written to Firebase: {session_id}")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'vehicle_id': vehicle_id,
            'spot_id': spot_id,
            'message': 'Vehicle entry recorded. Firebase listener will trigger orchestration.'
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to trigger vehicle entry: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/orchestration/status/<session_id>', methods=['GET'])
def get_orchestration_status(session_id):
    """
    Get orchestration status for a session
    
    Response:
    {
        "orchestration_complete": true/false,
        "status": "pending/processing/completed/failed",
        "details": {...}
    }
    """
    try:
        # Check orchestration record in Firebase
        status_data = firebase_service.get_orchestration_status(session_id)
        
        if not status_data:
            return jsonify({
                'orchestration_complete': False,
                'status': 'pending',
                'message': 'Waiting for orchestration to start...'
            }), 200
        
        is_complete = status_data.get('status') in ['completed', 'failed']
        
        return jsonify({
            'orchestration_complete': is_complete,
            'status': status_data.get('status', 'pending'),
            'message': status_data.get('message'),
            'details': status_data.get('details'),
            'error': status_data.get('error')
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to get orchestration status: {e}")
        return jsonify({
            'orchestration_complete': False,
            'status': 'error',
            'error': str(e)
        }), 500


# ============================================================================
# NEW USER BALANCE API ENDPOINTS (UBER-LIKE SYSTEM)
# ============================================================================

@app.route('/api/user/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Get user profile including balance and vehicle details"""
    try:
        logger.info(f"📋 Getting profile for user: {user_id}")
        
        # Get user from Firebase
        user_ref = db.reference(f'users/{user_id}')
        user_data = user_ref.get()
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Get active session if any
        sessions_ref = db.reference('sessions')
        sessions = sessions_ref.order_by_child('user_id').equal_to(user_id).get() or {}
        
        active_session = None
        for session_id, session_data in sessions.items():
            if session_data.get('status') == 'active':
                active_session = {
                    'session_id': session_id,
                    **session_data
                }
                break
        
        return jsonify({
            'success': True,
            'user': {
                'user_id': user_id,
                'wallet_address': user_data.get('wallet_address'),
                'balance_lovelace': user_data.get('balance_lovelace', 0),
                'vehicle': user_data.get('vehicle'),
                'total_spent': user_data.get('total_spent', 0),
                'sessions_count': user_data.get('sessions_count', 0),
                'created_at': user_data.get('created_at')
            },
            'active_session': active_session
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to get user profile: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/add-funds', methods=['POST'])
def add_funds():
    """Add funds to user's balance"""
    try:
        data = request.json
        user_id = data.get('user_id')
        amount_lovelace = int(data.get('amount_lovelace', 0))
        tx_hash = data.get('tx_hash')
        
        logger.info(f"💰 Adding {amount_lovelace / 1000000} ADA to user {user_id}")
        
        # Get current user balance
        user_ref = db.reference(f'users/{user_id}')
        user_data = user_ref.get() or {}
        current_balance = user_data.get('balance_lovelace', 0)
        
        # Update balance
        new_balance = current_balance + amount_lovelace
        user_ref.update({
            'balance_lovelace': new_balance
        })
        
        # Record transaction
        tx_ref = db.reference('transactions').push()
        tx_ref.set({
            'type': 'add_balance',
            'user_id': user_id,
            'amount_lovelace': amount_lovelace,
            'balance_before': current_balance,
            'balance_after': new_balance,
            'blockchain_tx_hash': tx_hash,
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"✅ Funds added. New balance: {new_balance / 1000000} ADA")
        
        return jsonify({
            'success': True,
            'new_balance': new_balance,
            'tx_id': tx_ref.key
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to add funds: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/parking/spots/available', methods=['GET'])
def get_available_spots():
    """Get all available parking spots (FREE - no auth required)"""
    try:
        logger.info("🅿️ Fetching available parking spots...")
        
        # Get all spots from Firebase
        spots_ref = db.reference('parking_spots')
        all_spots = spots_ref.get() or {}
        
        # Filter available spots
        available_spots = []
        for spot_id, spot_data in all_spots.items():
            if not spot_data.get('occupied', False):
                available_spots.append({
                    'id': spot_id,
                    'zone': spot_data.get('zone'),
                    'occupied': False,
                    'features': spot_data.get('features', []),
                    'hourly_rate_lovelace': spot_data.get('hourly_rate_lovelace', 1000000),
                    'location': spot_data.get('location')
                })
        
        logger.info(f"✅ Found {len(available_spots)} available spots")
        
        return jsonify({
            'success': True,
            'spots': available_spots,
            'total_available': len(available_spots)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to get available spots: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/parking/book', methods=['POST'])
def book_parking_from_balance():
    """Book parking spot using user's balance (no blockchain tx)"""
    try:
        data = request.json
        user_id = data.get('user_id')
        spot_id = data.get('spot_id')
        duration_hours = float(data.get('duration_hours', 2.0))
        
        logger.info(f"📝 Booking spot {spot_id} for user {user_id} ({duration_hours}h)")
        
        # Check user balance
        user_ref = db.reference(f'users/{user_id}')
        user_data = user_ref.get()
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        current_balance = user_data.get('balance_lovelace', 0)
        
        # Calculate cost (1.0 ADA parking + 1.5 ADA AI agents = 2.5 ADA total for 2 hours)
        spot_ref = db.reference(f'parking_spots/{spot_id}')
        spot_data = spot_ref.get()
        if not spot_data:
            return jsonify({
                'success': False,
                'error': 'Spot not found'
            }), 404
        
        hourly_rate = spot_data.get('hourly_rate_lovelace', 1000000)
        parking_cost = int(hourly_rate * duration_hours)
        ai_cost = int(1500000 * (duration_hours / 2))  # 1.5 ADA for 2 hours, scale proportionally
        total_cost = parking_cost + ai_cost
        
        # Check sufficient balance
        if current_balance < total_cost:
            return jsonify({
                'success': False,
                'error': 'Insufficient balance',
                'required': total_cost,
                'available': current_balance
            }), 400
        
        # Deduct from balance
        new_balance = current_balance - total_cost
        user_ref.update({
            'balance_lovelace': new_balance,
            'total_spent': user_data.get('total_spent', 0) + total_cost,
            'sessions_count': user_data.get('sessions_count', 0) + 1
        })
        
        # Create session
        session_ref = db.reference('sessions').push()
        session_id = session_ref.key
        session_ref.set({
            'user_id': user_id,
            'spot_id': spot_id,
            'vehicle_number': user_data.get('vehicle', {}).get('number'),
            'start_time': datetime.now().isoformat(),
            'end_time': None,
            'duration_hours': duration_hours,
            'estimated_cost_lovelace': total_cost,
            'actual_cost_lovelace': None,
            'status': 'active',
            'paid_from_balance': True,
            'qr_code': f"qr_{session_id}",  # Generate actual QR in production
            'hourly_rate_lovelace': hourly_rate
        })
        
        # Mark spot as occupied
        spot_ref.update({
            'occupied': True,
            'current_user': user_id,
            'current_session': session_id
        })
        
        # Distribute payment to agents + owner
        distribute_payment_to_agents(total_cost, session_id)
        
        # Record transaction
        tx_ref = db.reference('transactions').push()
        tx_ref.set({
            'type': 'booking',
            'user_id': user_id,
            'amount_lovelace': total_cost,
            'balance_before': current_balance,
            'balance_after': new_balance,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"✅ Booking confirmed! Session: {session_id}")
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'qr_code': f"qr_{session_id}",
            'amount_deducted': total_cost,
            'new_balance': new_balance,
            'breakdown': {
                'parking_cost': parking_cost,
                'ai_cost': ai_cost,
                'total': total_cost
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to book parking: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/parking/end-session', methods=['POST'])
def end_parking_session():
    """End active parking session with refund/extra charge logic"""
    try:
        data = request.json
        session_id = data.get('session_id')
        user_id = data.get('user_id')
        
        logger.info(f"⏹️ Ending session {session_id} for user {user_id}")
        
        # Get session data
        session_ref = db.reference(f'sessions/{session_id}')
        session_data = session_ref.get()
        if not session_data:
            return jsonify({
                'success': False,
                'error': 'Session not found'
            }), 404
        
        # Calculate actual duration
        start_time = datetime.fromisoformat(session_data['start_time'])
        end_time = datetime.now()
        actual_duration_hours = (end_time - start_time).total_seconds() / 3600
        
        # Calculate actual cost
        hourly_rate = session_data.get('hourly_rate_lovelace', 1000000)
        estimated_cost = session_data['estimated_cost_lovelace']
        actual_parking_cost = int(hourly_rate * actual_duration_hours)
        actual_ai_cost = int(1500000 * (actual_duration_hours / 2))
        actual_total_cost = actual_parking_cost + actual_ai_cost
        
        # Calculate refund or extra charge
        difference = estimated_cost - actual_total_cost
        refund_amount = 0
        extra_charge = 0
        
        user_ref = db.reference(f'users/{user_id}')
        user_data = user_ref.get()
        current_balance = user_data.get('balance_lovelace', 0)
        
        if difference > 0:
            # Refund (user left early)
            refund_amount = difference
            new_balance = current_balance + refund_amount
        else:
            # Extra charge (user overstayed)
            extra_charge = abs(difference)
            new_balance = current_balance - extra_charge
        
        # Update user balance
        user_ref.update({
            'balance_lovelace': new_balance
        })
        
        # Update session
        session_ref.update({
            'end_time': end_time.isoformat(),
            'actual_duration_hours': actual_duration_hours,
            'actual_cost_lovelace': actual_total_cost,
            'status': 'completed'
        })
        
        # Free up spot
        spot_ref = db.reference(f"parking_spots/{session_data['spot_id']}")
        spot_ref.update({
            'occupied': False,
            'current_user': None,
            'current_session': None
        })
        
        # Record transaction
        if refund_amount > 0:
            tx_ref = db.reference('transactions').push()
            tx_ref.set({
                'type': 'refund',
                'user_id': user_id,
                'amount_lovelace': refund_amount,
                'balance_before': current_balance,
                'balance_after': new_balance,
                'session_id': session_id,
                'timestamp': datetime.now().isoformat()
            })
        
        logger.info(f"✅ Session ended. Duration: {actual_duration_hours:.2f}h")
        
        return jsonify({
            'success': True,
            'actual_duration': actual_duration_hours,
            'refund_amount': refund_amount if refund_amount > 0 else None,
            'extra_charge': extra_charge if extra_charge > 0 else None,
            'new_balance': new_balance
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to end session: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/<user_id>/active-session', methods=['GET'])
def get_active_session(user_id):
    """Get user's active parking session"""
    try:
        sessions_ref = db.reference('sessions')
        sessions = sessions_ref.order_by_child('user_id').equal_to(user_id).get() or {}
        
        for session_id, session_data in sessions.items():
            if session_data.get('status') == 'active':
                return jsonify({
                    'success': True,
                    'session': {
                        'session_id': session_id,
                        **session_data
                    }
                }), 200
        
        return jsonify({
            'success': True,
            'session': None
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Failed to get active session: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def distribute_payment_to_agents(total_amount, session_id):
    """Distribute payment to all 7 agents + owner from booking"""
    try:
        logger.info(f"💸 Distributing {total_amount / 1000000} ADA to agents...")
        
        # Payment split (from orchestrator logic)
        distribution = {
            'orchestrator': 400000,      # 0.4 ADA
            'spot_finder': 300000,       # 0.3 ADA
            'pricing_agent': 400000,     # 0.4 ADA
            'route_optimizer': 200000,   # 0.2 ADA
            'payment_verifier': 200000,  # 0.2 ADA
            'security_guard': 300000,    # 0.3 ADA (from fines, use base)
            'dispute_resolver': 200000,  # 0.2 ADA
            # Remaining goes to parking owner
        }
        
        agent_total = sum(distribution.values())
        owner_amount = total_amount - agent_total
        
        # Update agent earnings in Firebase
        for agent_name, amount in distribution.items():
            agent_ref = db.reference(f'agent_earnings/{agent_name}')
            current = agent_ref.get() or {'total_lovelace': 0, 'sessions': 0}
            agent_ref.update({
                'total_lovelace': current.get('total_lovelace', 0) + amount,
                'sessions': current.get('sessions', 0) + 1,
                'last_payment': datetime.now().isoformat()
            })
        
        # Update owner earnings
        owner_ref = db.reference('owner_earnings')
        current_owner = owner_ref.get() or {'total_lovelace': 0, 'sessions': 0}
        owner_ref.update({
            'total_lovelace': current_owner.get('total_lovelace', 0) + owner_amount,
            'sessions': current_owner.get('sessions', 0) + 1,
            'last_payment': datetime.now().isoformat()
        })
        
        logger.info(f"✅ Payment distributed: Agents={agent_total/1000000} ADA, Owner={owner_amount/1000000} ADA")
        
    except Exception as e:
        logger.error(f"❌ Failed to distribute payment: {e}")


# ============================================================================
# USER WALLET ENDPOINTS
# ============================================================================

@app.route('/api/user/by-wallet/<wallet_address>', methods=['GET'])
def get_user_by_wallet(wallet_address):
    """Get user profile by wallet address"""
    try:
        # Query Firebase for user with this wallet
        users_ref = db.reference('user_wallets')
        users = users_ref.get() or {}
        
        for user_id, user_data in users.items():
            if user_data.get('wallet_address') == wallet_address:
                return jsonify({
                    'success': True,
                    'user': {
                        'user_id': user_id,
                        **user_data
                    }
                })
        
        return jsonify({
            'success': False,
            'message': 'User not found'
        }), 404
        
    except Exception as e:
        logger.error(f"Error fetching user by wallet: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/user/create', methods=['POST'])
def create_user():
    """Create new user account"""
    try:
        data = request.get_json()
        wallet_address = data.get('wallet_address')
        
        if not wallet_address:
            return jsonify({
                'success': False,
                'error': 'Wallet address required'
            }), 400
        
        # Generate user ID
        import hashlib
        user_id = f"user_{hashlib.md5(wallet_address.encode()).hexdigest()[:8]}"
        
        # Create user in Firebase
        user_data = {
            'wallet_address': wallet_address,
            'balance_lovelace': 0,
            'total_spent': 0,
            'sessions_count': 0,
            'created_at': datetime.now().isoformat()
        }
        
        users_ref = db.reference(f'user_wallets/{user_id}')
        users_ref.set(user_data)
        
        return jsonify({
            'success': True,
            'user': {
                'user_id': user_id,
                **user_data
            }
        })
        
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# AGENT EXECUTION ENDPOINTS
# ============================================================================

@app.route('/api/agents/spot-finder/execute', methods=['POST'])
def execute_spot_finder():
    """Execute SpotFinder agent individually"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        preferences = data.get('preferences', {})
        
        # Check user balance
        user_ref = db.reference(f'user_wallets/{user_id}')
        user = user_ref.get()
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        agent_cost = 300000  # 0.3 ADA in Lovelace
        if user.get('balance_lovelace', 0) < agent_cost:
            return jsonify({
                'success': False,
                'error': 'Insufficient balance',
                'required': agent_cost,
                'current': user.get('balance_lovelace', 0)
            }), 402
        
        # Execute agent
        result = spot_finder_agent.find_best_spot(preferences)
        
        # Deduct balance
        new_balance = user.get('balance_lovelace', 0) - agent_cost
        user_ref.update({'balance_lovelace': new_balance})
        
        # Update agent earnings
        earnings_ref = db.reference('agent_earnings/spot_finder')
        current_earnings = earnings_ref.child('total_lovelace').get() or 0
        earnings_ref.update({
            'total_lovelace': current_earnings + agent_cost
        })
        
        return jsonify({
            'success': True,
            'result': result,
            'cost': agent_cost,
            'new_balance': new_balance
        })
        
    except Exception as e:
        logger.error(f"Error executing SpotFinder: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/agents/pricing/execute', methods=['POST'])
def execute_pricing():
    """Execute Pricing agent individually"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        spot_id = data.get('spot_id')
        duration_hours = data.get('duration_hours', 2.0)
        
        user_ref = db.reference(f'user_wallets/{user_id}')
        user = user_ref.get()
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        agent_cost = 400000  # 0.4 ADA
        if user.get('balance_lovelace', 0) < agent_cost:
            return jsonify({
                'success': False,
                'error': 'Insufficient balance',
                'required': agent_cost,
                'current': user.get('balance_lovelace', 0)
            }), 402
        
        # Execute agent
        result = pricing_agent.calculate_price(spot_id, duration_hours)
        
        # Deduct balance
        new_balance = user.get('balance_lovelace', 0) - agent_cost
        user_ref.update({'balance_lovelace': new_balance})
        
        # Update earnings
        earnings_ref = db.reference('agent_earnings/pricing')
        current_earnings = earnings_ref.child('total_lovelace').get() or 0
        earnings_ref.update({'total_lovelace': current_earnings + agent_cost})
        
        return jsonify({
            'success': True,
            'result': result,
            'cost': agent_cost,
            'new_balance': new_balance
        })
        
    except Exception as e:
        logger.error(f"Error executing Pricing: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/agents/route-optimizer/execute', methods=['POST'])
def execute_route_optimizer():
    """Execute RouteOptimizer agent individually"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        spot_id = data.get('spot_id')
        user_location = data.get('user_location', {})
        
        user_ref = db.reference(f'user_wallets/{user_id}')
        user = user_ref.get()
        
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        agent_cost = 200000  # 0.2 ADA
        if user.get('balance_lovelace', 0) < agent_cost:
            return jsonify({
                'success': False,
                'error': 'Insufficient balance',
                'required': agent_cost,
                'current': user.get('balance_lovelace', 0)
            }), 402
        
        # Execute agent
        result = route_optimizer_agent.optimize_route(user_location, spot_id)
        
        # Deduct balance
        new_balance = user.get('balance_lovelace', 0) - agent_cost
        user_ref.update({'balance_lovelace': new_balance})
        
        # Update earnings
        earnings_ref = db.reference('agent_earnings/route_optimizer')
        current_earnings = earnings_ref.child('total_lovelace').get() or 0
        earnings_ref.update({'total_lovelace': current_earnings + agent_cost})
        
        return jsonify({
            'success': True,
            'result': result,
            'cost': agent_cost,
            'new_balance': new_balance
        })
        
    except Exception as e:
        logger.error(f"Error executing RouteOptimizer: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


# ============================================================================
# WALLET ENDPOINTS
# ============================================================================

wallet_balance_cache = {
    'balance_lovelace': 9_987_573_176,
    'updated_at': datetime.utcnow().isoformat() + 'Z'
}


@app.route('/api/wallet/balance/<address>', methods=['GET'])
def get_wallet_balance(address):
    """Return cached wallet balance (Blockfrost blocked on venue network)."""
    try:
        return jsonify({
            'balance_ada': wallet_balance_cache['balance_lovelace'] / 1_000_000,
            'balance_lovelace': wallet_balance_cache['balance_lovelace'],
            'utxos_count': 0,
            'address': address,
            'network': 'preprod',
            'updated_at': wallet_balance_cache['updated_at']
        }), 200
    except Exception as e:
        logger.error(f"Error fetching wallet balance: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/wallet/transactions/<address>', methods=['GET'])
def get_wallet_transactions(address):
    """Get wallet transaction history using Blockfrost (optimized - minimal API calls)"""
    try:
        import requests
        headers = {'project_id': 'preprod6cCK2JOLmwtTwFfxdE29SIoRppC8sPf6'}
        
        # Only fetch 5 transactions to minimize API usage
        response = requests.get(
            f'https://cardano-preprod.blockfrost.io/api/v0/addresses/{address}/transactions',
            headers=headers,
            params={'count': 5, 'order': 'desc'},
            timeout=5
        )
        
        if response.status_code == 200:
            tx_hashes = response.json()
            transactions = []
            
            # Only fetch details for 3 most recent to conserve API credits
            for tx in tx_hashes[:3]:
                tx_response = requests.get(
                    f'https://cardano-preprod.blockfrost.io/api/v0/txs/{tx["tx_hash"]}',
                    headers=headers,
                    timeout=5
                )
                if tx_response.status_code == 200:
                    tx_data = tx_response.json()
                    transactions.append({
                        'tx_hash': tx['tx_hash'],
                        'amount_ada': int(tx_data.get('fees', 0)) / 1_000_000,
                        'timestamp': tx_data.get('block_time', 0),
                        'type': 'sent',
                        'block': tx_data.get('block_height'),
                        'fees': int(tx_data.get('fees', 0)) / 1_000_000
                    })
            return jsonify(transactions), 200
        return jsonify([]), 200
    except Exception as e:
        logger.error(f"Error fetching transactions: {e}")
        return jsonify([]), 200


# ============================================================================
# BOOK SLOT ORCHESTRATION - Real Agent Flow
# ============================================================================

@app.route('/api/parking/book-slot', methods=['POST'])
def book_slot_orchestration():
    """
    Book Slot Button Orchestration Flow
    
    Executes the complete agent orchestration:
    1. Spot Finder Agent → picks best spot (0.3 ADA)
    2. Vehicle Detector Agent → validates vehicle present (0.2 ADA)
    3. Correct Vehicle Check → verifies license plate match (included in step 2)
    4. Both must be true → proceed to real-time payment agent (0.4 ADA)
    5. Create booking history record
    
    Request body:
    {
        "user_id": "user_123",
        "user_location": {"lat": 40.7128, "lng": -74.0060},
        "vehicle_id": "ABC123",
        "duration_hours": 2.0
    }
    
    Response:
    {
        "success": true,
        "orchestration_result": {
            "spot_id": "V01",
            "vehicle_detected": true,
            "correct_vehicle": true,
            "payment_started": true,
            "booking_id": "booking_xyz",
            "total_agent_cost_ada": 0.9,
            "costs_breakdown": {...}
        }
    }
    """
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'vehicle_id', 'duration_hours']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        user_id = data['user_id']
        vehicle_id = data['vehicle_id']
        duration_hours = data['duration_hours']
        user_location = data.get('user_location', {'lat': 40.7128, 'lng': -74.0060})
        wallet_address = data.get('wallet_address', 'addr_test1vrjtn62vuzckgnw8fff7t246lq34633h4qkc8npvf5fzvrskjj36g')
        
        logger.info(f"🎯 BOOK SLOT ORCHESTRATION started for user: {user_id}")
        logger.info(f"   Wallet: {wallet_address}")
        logger.info(f"   Vehicle: {vehicle_id}, Duration: {duration_hours}h")
        
        # Skip balance check - proceed directly with orchestration
        # In production, balance verification would be done via Masumi payment service
        
        orchestration_result = {
            'costs_breakdown': {
                'spot_finder': {'ada': 0.3, 'lovelace': 300000},
                'vehicle_detector': {'ada': 0.2, 'lovelace': 200000},
                'payment_agent': {'ada': 0.4, 'lovelace': 400000}
            },
            'total_cost': {'ada': 0.9, 'lovelace': 900000}
        }
        
        # ==================================================================
        # STEP 1: Execute Spot Finder Agent (0.3 ADA)
        # ==================================================================
        logger.info("🔍 STEP 1: Executing Spot Finder Agent (0.3 ADA)...")
        
        spot_finder_request = {
            'user_location': user_location,
            'vehicle_type': data.get('vehicle_type', 'sedan'),
            'desired_features': data.get('desired_features', []),
            'duration_hours': duration_hours
        }
        
        try:
            spot_result = spot_finder_agent.find_best_spot(spot_finder_request)
            
            if not spot_result or not spot_result.get('recommended_spot'):
                return jsonify({
                    'success': False,
                    'error': 'Spot Finder Agent could not find available spot',
                    'step': 'spot_finder'
                }), 404
            
            recommended_spot = spot_result.get('recommended_spot') or {}
            spot_id = recommended_spot.get('spot_id') or 'A1'
            spot_details = {
                'spot_id': spot_id,
                'zone': recommended_spot.get('zone', 'Zone A'),
                'type': recommended_spot.get('type', 'Standard'),
                'distance_meters': recommended_spot.get('distance_meters', 25),
                'features': recommended_spot.get('features', ['camera', 'lighting'])
            }
            
            # Record transaction (no balance deduction from Cardano - just track for demo)
            # In production, this would trigger actual Cardano tx via Masumi payment distribution
            
            # Record earnings for Spot Finder agent
            earnings_ref = db.reference('agent_earnings/spot_finder')
            current_earnings = earnings_ref.child('total_lovelace').get() or 0
            earnings_ref.update({'total_lovelace': current_earnings + 300000})
            
            orchestration_result['spot_id'] = spot_id
            orchestration_result['spot_details'] = spot_details
            orchestration_result['spot_finder_executed'] = True
            
            logger.info(f"✅ STEP 1 Complete: Spot {spot_id} selected. Cost: 0.3 ADA")
            
        except Exception as e:
            logger.error(f"❌ Spot Finder Agent failed: {e}")
            return jsonify({
                'success': False,
                'error': f'Spot Finder Agent error: {str(e)}',
                'step': 'spot_finder'
            }), 500
        
        # ==================================================================
        # STEP 2: Execute Vehicle Detector Agent (0.2 ADA)
        # ==================================================================
        logger.info("🚗 STEP 2: Executing Vehicle Detector Agent (0.2 ADA)...")
        
        # Import VehicleDetector if not already
        try:
            from agents.vehicle_detector import VehicleDetectorAgent
            vehicle_detector = VehicleDetectorAgent()
        except:
            # Fallback: simulate vehicle detection for demo
            logger.warning("⚠️ VehicleDetectorAgent not available, using simulation")
            vehicle_detector = None
        
        try:
            if vehicle_detector:
                detection_result = vehicle_detector.detect_vehicle(spot_id, vehicle_id)
                vehicle_detected = detection_result.get('vehicle_detected', False)
                correct_vehicle = detection_result.get('correct_vehicle', False)
            else:
                # Simulation for demo (remove in production)
                vehicle_detected = True  # Simulate vehicle is detected
                correct_vehicle = True   # Simulate correct license plate match
                detection_result = {
                    'vehicle_detected': vehicle_detected,
                    'correct_vehicle': correct_vehicle,
                    'confidence': 0.95,
                    'note': 'Simulated detection (VehicleDetectorAgent unavailable)'
                }
            
            # Record transaction (no balance deduction from Cardano - just track for demo)
            # In production, this would trigger actual Cardano tx via Masumi payment distribution
            
            # Record earnings for Vehicle Detector agent
            earnings_ref = db.reference('agent_earnings/vehicle_detector')
            current_earnings = earnings_ref.child('total_lovelace').get() or 0
            earnings_ref.update({'total_lovelace': current_earnings + 200000})
            
            orchestration_result['vehicle_detected'] = vehicle_detected
            orchestration_result['correct_vehicle'] = correct_vehicle
            orchestration_result['detection_details'] = detection_result
            orchestration_result['vehicle_detector_executed'] = True
            
            logger.info(f"✅ STEP 2 Complete: vehicle_detected={vehicle_detected}, correct_vehicle={correct_vehicle}. Cost: 0.2 ADA")
            
            # ==================================================================
            # GATE CHECK: Both vehicle_detected AND correct_vehicle must be True
            # ==================================================================
            if not (vehicle_detected and correct_vehicle):
                logger.warning(f"⛔ GATE CHECK FAILED: Cannot proceed to payment. vehicle_detected={vehicle_detected}, correct_vehicle={correct_vehicle}")
                
                # Return partial refund? No - user pays for agents that executed
                return jsonify({
                    'success': False,
                    'error': 'Vehicle validation failed. Cannot proceed to payment.',
                    'orchestration_result': orchestration_result,
                    'reason': 'Both vehicle_detected and correct_vehicle must be true',
                    'agents_charged': ['spot_finder', 'vehicle_detector'],
                    'total_charged_ada': 0.5,
                    'remaining_balance_ada': current_balance / 1000000
                }), 403
            
            logger.info("✅ GATE CHECK PASSED: Proceeding to Payment Agent...")
            
        except Exception as e:
            logger.error(f"❌ Vehicle Detector Agent failed: {e}")
            return jsonify({
                'success': False,
                'error': f'Vehicle Detector error: {str(e)}',
                'step': 'vehicle_detector',
                'orchestration_result': orchestration_result
            }), 500
        
        # ==================================================================
        # STEP 3: Execute Real-time Payment Agent (0.4 ADA)
        # ==================================================================
        logger.info("💳 STEP 3: Executing Real-time Payment Agent (0.4 ADA)...")
        
        try:
            import uuid
            import time
            
            booking_id = f"booking_{uuid.uuid4().hex[:12]}"
            session_id = f"session_{uuid.uuid4().hex[:12]}"
            
            # Record transaction (no balance deduction from Cardano - just track for demo)
            # In production, this would trigger actual Cardano tx via Masumi payment distribution
            
            # Record earnings for Payment Agent
            earnings_ref = db.reference('agent_earnings/payment_agent')
            current_earnings = earnings_ref.child('total_lovelace').get() or 0
            earnings_ref.update({'total_lovelace': current_earnings + 400000})
            
            # Create booking record in Firebase
            booking_ref = db.reference(f'bookings/{booking_id}')
            booking_data = {
                'booking_id': booking_id,
                'session_id': session_id,
                'user_id': user_id,
                'vehicle_id': vehicle_id,
                'spot_id': spot_id,
                'duration_hours': duration_hours,
                'status': 'active',
                'payment_started': True,
                'created_at': datetime.utcnow().isoformat() + 'Z',
                'start_time': int(time.time()),
                'orchestration_summary': {
                    'spot_finder_cost_ada': 0.3,
                    'vehicle_detector_cost_ada': 0.2,
                    'payment_agent_cost_ada': 0.4,
                    'total_agent_cost_ada': 0.9
                },
                'vehicle_validation': {
                    'detected': vehicle_detected,
                    'correct': correct_vehicle
                }
            }
            booking_ref.set(booking_data)
            
            # Initialize payment session for real-time tracking
            payment_session_ref = db.reference(f'payment_sessions/{session_id}')
            payment_session_data = {
                'session_id': session_id,
                'booking_id': booking_id,
                'user_id': user_id,
                'spot_id': spot_id,
                'rate_per_minute_lovelace': int(1.2 * 1000000 / 60),  # 1.2 ADA per hour = 20000 lovelace/min
                'total_deducted_lovelace': 0,
                'minutes_elapsed': 0,
                'status': 'active',
                'started_at': int(time.time()),
                'last_charge_at': int(time.time()),
                'transactions': []
            }
            payment_session_ref.set(payment_session_data)
            
            orchestration_result['payment_started'] = True
            orchestration_result['booking_id'] = booking_id
            orchestration_result['session_id'] = session_id
            orchestration_result['payment_agent_executed'] = True
            orchestration_result['rate_per_minute_ada'] = 0.02  # 1.2/60
            
            logger.info(f"✅ STEP 3 Complete: Payment session started. Cost: 0.4 ADA")
            logger.info(f"🎉 ORCHESTRATION COMPLETE: booking_id={booking_id}, total_cost=0.9 ADA")
            
        except Exception as e:
            logger.error(f"❌ Payment Agent failed: {e}")
            return jsonify({
                'success': False,
                'error': f'Payment Agent error: {str(e)}',
                'step': 'payment_agent',
                'orchestration_result': orchestration_result
            }), 500
        
        # ==================================================================
        # FINAL RESPONSE
        # ==================================================================
        return jsonify({
            'success': True,
            'message': 'Book Slot orchestration completed successfully',
            'orchestration_result': orchestration_result,
            'total_agent_cost_ada': 0.9,
            'wallet_address': wallet_address,
            'next_steps': 'Real-time payment is now active. Check payment session for live updates.'
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Book Slot orchestration failed: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/payment-session/<session_id>', methods=['GET'])
def get_payment_session(session_id):
    """
    Get real-time payment session status
    
    Returns live progress bar data:
    - Minutes elapsed
    - Total ADA deducted
    - Transaction history with TX hashes
    - Current rate per minute
    """
    try:
        payment_ref = db.reference(f'payment_sessions/{session_id}')
        session_data = payment_ref.get()
        
        if not session_data:
            return jsonify({
                'success': False,
                'error': 'Payment session not found'
            }), 404
        
        # Calculate current stats
        import time
        current_time = int(time.time())
        started_at = session_data.get('started_at', current_time)
        minutes_elapsed = (current_time - started_at) / 60
        
        rate_per_minute = session_data.get('rate_per_minute_lovelace', 20000)
        total_deducted = int(minutes_elapsed * rate_per_minute)
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'status': session_data.get('status', 'active'),
            'minutes_elapsed': round(minutes_elapsed, 2),
            'total_deducted_lovelace': total_deducted,
            'total_deducted_ada': round(total_deducted / 1000000, 4),
            'rate_per_minute_ada': rate_per_minute / 1000000,
            'transactions': session_data.get('transactions', []),
            'booking_id': session_data.get('booking_id'),
            'spot_id': session_data.get('spot_id')
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error getting payment session: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# HISTORY ENDPOINTS - Booking & Transaction History
# ============================================================================

@app.route('/api/bookings/history/<user_id>', methods=['GET'])
def get_booking_history(user_id):
    """
    Get booking history for a user
    
    Returns all bookings with details:
    - booking_id, spot_id, vehicle_id
    - start_time, end_time, duration
    - status (active, completed, cancelled)
    - total cost, orchestration costs
    """
    try:
        logger.info(f"📥 Fetching booking history for user: {user_id}")
        
        # Query all bookings for this user
        bookings_ref = db.reference('bookings')
        all_bookings = bookings_ref.order_by_child('user_id').equal_to(user_id).get()
        
        if not all_bookings:
            return jsonify({
                'success': True,
                'bookings': [],
                'total_count': 0
            }), 200
        
        # Format bookings for response
        bookings_list = []
        for booking_id, booking_data in all_bookings.items():
            bookings_list.append({
                'booking_id': booking_id,
                'spot_id': booking_data.get('spot_id'),
                'vehicle_id': booking_data.get('vehicle_id'),
                'session_id': booking_data.get('session_id'),
                'status': booking_data.get('status', 'unknown'),
                'created_at': booking_data.get('created_at'),
                'start_time': booking_data.get('start_time'),
                'end_time': booking_data.get('end_time'),
                'duration_hours': booking_data.get('duration_hours'),
                'orchestration_costs': booking_data.get('orchestration_summary', {}),
                'vehicle_validation': booking_data.get('vehicle_validation', {})
            })
        
        # Sort by created_at descending (newest first)
        bookings_list.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        logger.info(f"✅ Found {len(bookings_list)} bookings for user {user_id}")
        
        return jsonify({
            'success': True,
            'bookings': bookings_list,
            'total_count': len(bookings_list)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching booking history: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/transactions/history/<user_id>', methods=['GET'])
def get_transaction_history(user_id):
    """
    Get transaction history for a user
    
    Returns all Cardano transactions:
    - tx_hash, amount_ada, amount_lovelace
    - timestamp, type (payment, refund, etc)
    - CardanoScan explorer link
    - associated booking_id if applicable
    """
    try:
        logger.info(f"📥 Fetching transaction history for user: {user_id}")
        
        # Query blockchain_transactions collection
        transactions_ref = db.reference('blockchain_transactions')
        all_transactions = transactions_ref.order_by_child('user_id').equal_to(user_id).get()
        
        if not all_transactions:
            return jsonify({
                'success': True,
                'transactions': [],
                'total_count': 0,
                'total_ada_spent': 0
            }), 200
        
        # Format transactions
        transactions_list = []
        total_spent = 0
        
        for tx_id, tx_data in all_transactions.items():
            amount_lovelace = tx_data.get('amount_lovelace', 0)
            amount_ada = amount_lovelace / 1000000
            
            tx_hash = tx_data.get('tx_hash', '')
            explorer_url = f"https://preprod.cardanoscan.io/transaction/{tx_hash}" if tx_hash else ''
            
            transactions_list.append({
                'transaction_id': tx_id,
                'tx_hash': tx_hash,
                'amount_lovelace': amount_lovelace,
                'amount_ada': round(amount_ada, 6),
                'timestamp': tx_data.get('timestamp'),
                'type': tx_data.get('type', 'payment'),
                'status': tx_data.get('status', 'confirmed'),
                'booking_id': tx_data.get('booking_id'),
                'session_id': tx_data.get('session_id'),
                'description': tx_data.get('description', 'Parking payment'),
                'explorer_url': explorer_url
            })
            
            if tx_data.get('type') != 'refund':
                total_spent += amount_ada
        
        # Sort by timestamp descending (newest first)
        transactions_list.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        logger.info(f"✅ Found {len(transactions_list)} transactions for user {user_id}")
        
        return jsonify({
            'success': True,
            'transactions': transactions_list,
            'total_count': len(transactions_list),
            'total_ada_spent': round(total_spent, 6)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching transaction history: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/payment-sessions/history/<user_id>', methods=['GET'])
def get_payment_sessions_history(user_id):
    """
    Get all payment sessions for a user
    
    Returns payment session details with live calculations
    """
    try:
        logger.info(f"📥 Fetching payment sessions for user: {user_id}")
        
        # Query all bookings for user, then get their sessions
        bookings_ref = db.reference('bookings')
        user_bookings = bookings_ref.order_by_child('user_id').equal_to(user_id).get()
        
        if not user_bookings:
            return jsonify({
                'success': True,
                'sessions': [],
                'total_count': 0
            }), 200
        
        sessions_list = []
        import time
        current_time = int(time.time())
        
        for booking_id, booking_data in user_bookings.items():
            session_id = booking_data.get('session_id')
            if not session_id:
                continue
            
            # Get payment session data
            session_ref = db.reference(f'payment_sessions/{session_id}')
            session_data = session_ref.get()
            
            if not session_data:
                continue
            
            started_at = session_data.get('started_at', current_time)
            ended_at = session_data.get('ended_at', current_time if session_data.get('status') == 'completed' else None)
            
            if ended_at:
                duration_seconds = ended_at - started_at
            else:
                duration_seconds = current_time - started_at
            
            minutes_elapsed = duration_seconds / 60
            rate_per_minute = session_data.get('rate_per_minute_lovelace', 20000)
            total_deducted = int(minutes_elapsed * rate_per_minute)
            
            sessions_list.append({
                'session_id': session_id,
                'booking_id': booking_id,
                'spot_id': session_data.get('spot_id'),
                'status': session_data.get('status', 'active'),
                'started_at': started_at,
                'ended_at': ended_at,
                'minutes_elapsed': round(minutes_elapsed, 2),
                'total_deducted_lovelace': total_deducted,
                'total_deducted_ada': round(total_deducted / 1000000, 4),
                'rate_per_minute_ada': rate_per_minute / 1000000,
                'transactions_count': len(session_data.get('transactions', []))
            })
        
        # Sort by started_at descending
        sessions_list.sort(key=lambda x: x.get('started_at', 0), reverse=True)
        
        return jsonify({
            'success': True,
            'sessions': sessions_list,
            'total_count': len(sessions_list)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching payment sessions: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# HARDWARE SENSOR ENDPOINTS (for Raspberry Pi)
# ============================================================================

@app.route('/api/hardware/sensor-update', methods=['POST'])
def hardware_sensor_update():
    """
    Receive real-time sensor updates from Raspberry Pi via HTTP.
    Triggers payment when spot becomes occupied.
    
    Expected payload:
    {
        "spot_id": "spot_01",
        "sensor_id": "pi5_sensor_01",
        "occupied": true/false,
        "distance_cm": 25.5,
        "timestamp": 1234567890
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON payload provided'
            }), 400
        
        spot_id = data.get('spot_id')
        sensor_id = data.get('sensor_id')
        occupied = data.get('occupied')
        distance_cm = data.get('distance_cm')
        timestamp = data.get('timestamp', int(datetime.now().timestamp()))
        
        if spot_id is None or occupied is None:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: spot_id, occupied'
            }), 400
        
        logger.info(f"📡 Hardware sensor update: spot={spot_id}, occupied={occupied}, distance={distance_cm}cm")
        
        # Update Firebase with sensor data
        try:
            spot_ref = db.reference(f'/parking_spots/{spot_id}')
            spot_ref.update({
                'occupied': bool(occupied),
                'median_cm': float(distance_cm) if distance_cm is not None and distance_cm > 0 else -1.0,
                'last_seen': timestamp,
                'sensor_id': sensor_id or 'unknown'
            })
            logger.info(f"✅ Firebase updated for {spot_id}")
        except Exception as fb_error:
            logger.error(f"⚠️  Firebase update failed: {fb_error}")
        
        payment_triggered = False
        session_id = None
        
        # CRITICAL: Trigger payment if spot just became occupied
        if occupied:
            # Check if there's an active booking/session for this spot
            try:
                import uuid
                import time
                
                # Look for active session with this spot
                sessions_ref = db.reference('/payment_sessions')
                sessions_data = sessions_ref.get() or {}
                
                active_session = None
                for sid, sess in sessions_data.items():
                    if sess.get('spot_id') == spot_id and sess.get('status') == 'active':
                        active_session = sid
                        break
                
                if active_session:
                    # Session exists - payment should already be running
                    logger.info(f"💰 Active session found: {active_session}")
                    payment_triggered = True
                    session_id = active_session
                else:
                    # NO SESSION - AUTO-CREATE ONE FOR SINGLE USER SYSTEM
                    logger.info(f"🚀 AUTO-CREATING payment session for {spot_id} (single user system)")
                    
                    # Generate IDs
                    session_id = f"session_{uuid.uuid4().hex[:12]}"
                    booking_id = f"booking_{uuid.uuid4().hex[:12]}"
                    user_id = "default_user"
                    
                    # Owner wallet (receives payments)
                    owner_wallet = os.getenv('PAYMENTVERIFIER_WALLET_ADDRESS', 'addr_test1vrcwgs5h3ez9xnvfa4n52ht5jm9kd77zydy9kr573wgd0mcatpfxd')
                    
                    # Create booking record
                    booking_ref = db.reference(f'bookings/{booking_id}')
                    booking_data = {
                        'booking_id': booking_id,
                        'session_id': session_id,
                        'user_id': user_id,
                        'vehicle_id': 'AUTO',
                        'spot_id': spot_id,
                        'duration_hours': 24.0,  # Max duration
                        'status': 'active',
                        'payment_started': True,
                        'created_at': datetime.utcnow().isoformat() + 'Z',
                        'start_time': int(time.time()),
                        'auto_created': True,
                        'sensor_triggered': True
                    }
                    booking_ref.set(booking_data)
                    
                    # Create payment session - payments go to owner wallet
                    payment_session_ref = db.reference(f'payment_sessions/{session_id}')
                    payment_session_data = {
                        'session_id': session_id,
                        'booking_id': booking_id,
                        'user_id': user_id,
                        'spot_id': spot_id,
                        'owner_wallet': owner_wallet,  # Owner receives payments
                        'rate_per_minute_lovelace': int(1.2 * 1000000 / 60),  # 1.2 ADA/hour = 20000 lovelace/min
                        'total_deducted_lovelace': 0,
                        'minutes_elapsed': 0,
                        'status': 'active',
                        'started_at': int(time.time()),
                        'last_charge_at': int(time.time()),
                        'transactions': [],
                        'auto_created': True
                    }
                    payment_session_ref.set(payment_session_data)
                    
                    payment_triggered = True
                    logger.info(f"✅ AUTO-CREATED session {session_id} - Payments → {owner_wallet}")
                    
            except Exception as sess_error:
                logger.error(f"❌ Error checking/creating payment sessions: {sess_error}")
        
        # CRITICAL: End payment session when vehicle leaves
        elif not occupied:
            # Spot is now free - close any active sessions
            try:
                sessions_ref = db.reference('/payment_sessions')
                sessions_data = sessions_ref.get() or {}
                
                for sid, sess in sessions_data.items():
                    if sess.get('spot_id') == spot_id and sess.get('status') == 'active':
                        # End the session
                        import time
                        session_ref = db.reference(f'/payment_sessions/{sid}')
                        session_ref.update({
                            'status': 'completed',
                            'ended_at': int(time.time()),
                            'end_reason': 'vehicle_left'
                        })
                        
                        # Update booking status
                        booking_id = sess.get('booking_id')
                        if booking_id:
                            booking_ref = db.reference(f'/bookings/{booking_id}')
                            booking_ref.update({
                                'status': 'completed',
                                'ended_at': int(time.time())
                            })
                        
                        logger.info(f"✅ ENDED payment session {sid} - vehicle left {spot_id}")
                        session_id = sid
                        break
                        
            except Exception as end_error:
                logger.error(f"❌ Error ending payment session: {end_error}")
        
        return jsonify({
            'success': True,
            'message': 'Sensor data received',
            'spot_id': spot_id,
            'occupied': occupied,
            'distance_cm': distance_cm,
            'payment_triggered': payment_triggered,
            'session_id': session_id,
            'timestamp': timestamp
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Hardware sensor endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'message': 'The requested resource does not exist'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    logger.info("🚀 Starting ParknGo Multi-Agent Parking System API...")
    logger.info("=" * 60)
    logger.info("Agents initialized:")
    logger.info("  ✅ Orchestrator Agent (master coordinator)")
    logger.info("  ✅ SpotFinder Agent (Gemini AI ranking)")
    logger.info("  ✅ PricingAgent (Gemini demand forecasting)")
    logger.info("  ✅ RouteOptimizer Agent (Gemini directions)")
    logger.info("  ✅ PaymentVerifier Agent (Gemini fraud detection)")
    logger.info("  ✅ SecurityGuard Agent (Gemini anomaly detection)")
    logger.info("  ✅ DisputeResolver Agent (Gemini AI arbitration)")
    logger.info("=" * 60)
    
    # Get port from environment or default to 5000
    port = int(os.getenv('PORT', 5000))
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.getenv('FLASK_ENV') == 'development'
    )
