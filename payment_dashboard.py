#!/usr/bin/env python3
"""
ParknGo Payment Dashboard
Professional transaction monitoring interface for judges/demo
"""

from flask import Flask, render_template, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from firebase_admin import db
import firebase_admin
from firebase_admin import credentials
from datetime import datetime
import logging

load_dotenv()

# Initialize Flask
app = Flask(__name__, 
           template_folder='dashboard_templates',
           static_folder='static')
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase (reuse existing connection or create new)
try:
    firebase_admin.get_app()
    logger.info("✅ Using existing Firebase connection")
except ValueError:
    cred = credentials.Certificate(os.getenv('FIREBASE_CREDENTIALS_PATH', './secrets/parkngo-firebase-adminsdk.json'))
    firebase_admin.initialize_app(cred, {
        'databaseURL': os.getenv('FIREBASE_DATABASE_URL')
    })
    logger.info("✅ Firebase initialized for dashboard")

# ============================================================================
# DASHBOARD ROUTES
# ============================================================================

@app.route('/')
def dashboard():
    """Main dashboard page"""
    return render_template('dashboard.html')

@app.route('/api/dashboard/stats')
def get_stats():
    """Get overall statistics"""
    try:
        # Get payment sessions
        sessions_ref = db.reference('/payment_sessions')
        sessions = sessions_ref.get() or {}
        
        # Get bookings
        bookings_ref = db.reference('/bookings')
        bookings = bookings_ref.get() or {}
        
        # Calculate stats
        active_sessions = sum(1 for s in sessions.values() if s.get('status') == 'active')
        completed_sessions = sum(1 for s in sessions.values() if s.get('status') == 'completed')
        
        total_revenue_lovelace = sum(
            s.get('total_deducted_lovelace', 0) 
            for s in sessions.values()
        )
        
        stats = {
            'active_sessions': active_sessions,
            'completed_sessions': completed_sessions,
            'total_sessions': len(sessions),
            'total_bookings': len(bookings),
            'total_revenue_ada': round(total_revenue_lovelace / 1_000_000, 2),
            'total_revenue_lovelace': total_revenue_lovelace,
            'owner_wallet': os.getenv('PAYMENTVERIFIER_WALLET_ADDRESS', 'N/A')
        }
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/sessions')
def get_sessions():
    """Get all payment sessions"""
    try:
        sessions_ref = db.reference('/payment_sessions')
        sessions_data = sessions_ref.get() or {}
        
        sessions = []
        for session_id, session in sessions_data.items():
            sessions.append({
                'session_id': session_id,
                'booking_id': session.get('booking_id', 'N/A'),
                'spot_id': session.get('spot_id', 'N/A'),
                'user_id': session.get('user_id', 'N/A'),
                'status': session.get('status', 'unknown'),
                'owner_wallet': session.get('owner_wallet', 'N/A'),
                'rate_per_minute_lovelace': session.get('rate_per_minute_lovelace', 0),
                'total_deducted_lovelace': session.get('total_deducted_lovelace', 0),
                'total_deducted_ada': round(session.get('total_deducted_lovelace', 0) / 1_000_000, 4),
                'minutes_elapsed': session.get('minutes_elapsed', 0),
                'started_at': session.get('started_at', 0),
                'ended_at': session.get('ended_at'),
                'auto_created': session.get('auto_created', False),
                'transactions': session.get('transactions', [])
            })
        
        # Sort by started_at (newest first)
        sessions.sort(key=lambda x: x['started_at'], reverse=True)
        
        return jsonify(sessions)
        
    except Exception as e:
        logger.error(f"Error getting sessions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/transactions')
def get_transactions():
    """Get all transactions from all sessions"""
    try:
        sessions_ref = db.reference('/payment_sessions')
        sessions_data = sessions_ref.get() or {}
        
        all_transactions = []
        
        for session_id, session in sessions_data.items():
            transactions = session.get('transactions', [])
            for tx in transactions:
                all_transactions.append({
                    'session_id': session_id,
                    'spot_id': session.get('spot_id', 'N/A'),
                    'timestamp': tx.get('timestamp', 0),
                    'amount_lovelace': tx.get('amount_lovelace', 0),
                    'amount_ada': round(tx.get('amount_lovelace', 0) / 1_000_000, 4),
                    'minute': tx.get('minute', 0),
                    'to_wallet': session.get('owner_wallet', 'N/A')
                })
        
        # Sort by timestamp (newest first)
        all_transactions.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify(all_transactions)
        
    except Exception as e:
        logger.error(f"Error getting transactions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/parking-spots')
def get_parking_spots():
    """Get current parking spot statuses"""
    try:
        spots_ref = db.reference('/parking_spots')
        spots_data = spots_ref.get() or {}
        
        spots = []
        for spot_id, spot in spots_data.items():
            spots.append({
                'spot_id': spot_id,
                'occupied': spot.get('occupied', False),
                'median_cm': spot.get('median_cm', -1),
                'last_seen': spot.get('last_seen', 0),
                'sensor_id': spot.get('sensor_id', 'N/A')
            })
        
        return jsonify(spots)
        
    except Exception as e:
        logger.error(f"Error getting parking spots: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ParknGo Payment Dashboard',
        'timestamp': int(datetime.now().timestamp())
    })

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    port = int(os.getenv('DASHBOARD_PORT', 3002))
    logger.info("=" * 60)
    logger.info("🎯 ParknGo Payment Dashboard")
    logger.info(f"📊 Dashboard: http://localhost:{port}")
    logger.info(f"💰 Owner Wallet: {os.getenv('PAYMENTVERIFIER_WALLET_ADDRESS', 'N/A')[:20]}...")
    logger.info("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=True)
