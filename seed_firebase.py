"""
Seed Firebase with sample parking spots and data for testing
"""

import os
import sys
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv

# Load environment
load_dotenv()

def seed_parking_spots():
    """Add sample parking spots"""
    
    spots = {
        'A1': {
            'spot_id': 'A1',
            'zone': 'Zone A',
            'type': 'covered',
            'features': ['covered', 'ev_charging', 'handicap'],
            'location': {
                'lat': 17.385044,
                'lng': 78.486671,
                'floor': '1',
                'section': 'A'
            },
            'pricing': {
                'base_rate_cents': 100,  # $1.00/hour
                'currency': 'USD'
            },
            'occupied': False,
            'last_updated': datetime.utcnow().isoformat() + 'Z'
        },
        'A2': {
            'spot_id': 'A2',
            'zone': 'Zone A',
            'type': 'covered',
            'features': ['covered', 'ev_charging'],
            'location': {
                'lat': 17.385054,
                'lng': 78.486681,
                'floor': '1',
                'section': 'A'
            },
            'pricing': {
                'base_rate_cents': 100,
                'currency': 'USD'
            },
            'occupied': False,
            'last_updated': datetime.utcnow().isoformat() + 'Z'
        },
        'B1': {
            'spot_id': 'B1',
            'zone': 'Zone B',
            'type': 'standard',
            'features': ['covered'],
            'location': {
                'lat': 17.385064,
                'lng': 78.486691,
                'floor': '2',
                'section': 'B'
            },
            'pricing': {
                'base_rate_cents': 75,  # $0.75/hour
                'currency': 'USD'
            },
            'occupied': False,
            'last_updated': datetime.utcnow().isoformat() + 'Z'
        },
        'B2': {
            'spot_id': 'B2',
            'zone': 'Zone B',
            'type': 'standard',
            'features': [],
            'location': {
                'lat': 17.385074,
                'lng': 78.486701,
                'floor': '2',
                'section': 'B'
            },
            'pricing': {
                'base_rate_cents': 50,  # $0.50/hour
                'currency': 'USD'
            },
            'occupied': False,
            'last_updated': datetime.utcnow().isoformat() + 'Z'
        },
        'C1': {
            'spot_id': 'C1',
            'zone': 'Zone C',
            'type': 'compact',
            'features': ['compact'],
            'location': {
                'lat': 17.385084,
                'lng': 78.486711,
                'floor': '3',
                'section': 'C'
            },
            'pricing': {
                'base_rate_cents': 40,  # $0.40/hour
                'currency': 'USD'
            },
            'occupied': False,
            'last_updated': datetime.utcnow().isoformat() + 'Z'
        }
    }
    
    ref = db.reference('parking_spots')
    ref.set(spots)
    print(f"✅ Added {len(spots)} parking spots to Firebase")
    
    return spots

def seed_test_data():
    """Add additional test data"""
    
    # Add system status
    status_ref = db.reference('system_status')
    status_ref.set({
        'services_running': True,
        'active_sessions': 0,
        'total_transactions': 0,
        'last_updated': datetime.utcnow().isoformat() + 'Z'
    })
    print("✅ Added system status")
    
    # Add wallet config (for testing)
    wallet_ref = db.reference('wallet_config')
    wallet_ref.set({
        'network': 'Preprod',
        'agent_identifier': '7e8bdaf2b2b919a3a4b94002cafb50086c0c845fe535d07a77ab7f7727e485b7a06a61281dabfa5d9f3bc768675898dafeeaadc3c75d663cf2e860e6',
        'last_updated': datetime.utcnow().isoformat() + 'Z'
    })
    print("✅ Added wallet config")

def main():
    """Initialize Firebase and seed data"""
    
    try:
        # Initialize Firebase
        creds_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
        database_url = os.getenv('FIREBASE_DATABASE_URL')
        
        if not creds_path or not database_url:
            print("❌ Missing Firebase configuration in .env file")
            sys.exit(1)
        
        cred = credentials.Certificate(creds_path)
        firebase_admin.initialize_app(cred, {
            'databaseURL': database_url
        })
        
        print("✅ Connected to Firebase")
        print("\nSeeding database...")
        
        # Seed parking spots
        spots = seed_parking_spots()
        
        # Seed additional data
        seed_test_data()
        
        print("\n" + "=" * 50)
        print("SEEDING COMPLETE!")
        print("=" * 50)
        print(f"\nAdded:")
        print(f"  - {len(spots)} parking spots")
        print(f"  - System status")
        print(f"  - Wallet configuration")
        print("\nYour Firebase database is ready for testing!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
