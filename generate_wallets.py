"""
Generate Cardano Mainnet Wallets for ParknGo Agents and Customer
This script creates secure wallets with mnemonic phrases for:
- 7 AI Agents (each receives earnings)
- 1 Customer wallet (for funding and payments)
"""

from pycardano import HDWallet, Network, PaymentSigningKey, PaymentVerificationKey, Address
from mnemonic import Mnemonic
import json

def generate_wallet(name):
    """Generate a Cardano mainnet wallet with mnemonic phrase"""
    # Generate 24-word mnemonic
    mnemo = Mnemonic("english")
    mnemonic_phrase = mnemo.generate(strength=256)
    
    # Create HD Wallet from mnemonic
    hdwallet = HDWallet.from_mnemonic(mnemonic_phrase)
    
    # Derive payment keys following CIP-1852 standard
    # m/1852'/1815'/0'/0/0
    hdwallet_spend = hdwallet.derive_from_path("m/1852'/1815'/0'/0/0")
    
    # Get signing and verification keys
    payment_skey = PaymentSigningKey.from_primitive(hdwallet_spend.xprivate_key[:32])
    payment_vkey = PaymentVerificationKey.from_signing_key(payment_skey)
    
    # Generate PREPROD TESTNET address (addr_test1...)
    payment_address = Address(payment_part=payment_vkey.hash(), network=Network.TESTNET)
    
    return {
        'name': name,
        'mnemonic': mnemonic_phrase,
        'address': str(payment_address),
        'signing_key': payment_skey.to_cbor().hex(),
        'verification_key': payment_vkey.to_cbor().hex(),
        'network': 'preprod'
    }

def main():
    print("🔐 Generating Cardano Mainnet Wallets for ParknGo System\n")
    print("=" * 70)
    
    # Define all wallets to create
    wallet_names = [
        'Orchestrator Agent',
        'SpotFinder Agent',
        'Pricing Agent',
        'RouteOptimizer Agent',
        'PaymentVerifier Agent',
        'SecurityGuard Agent',
        'DisputeResolver Agent',
        'Customer Wallet'
    ]
    
    wallets = {}
    
    for name in wallet_names:
        print(f"\n📝 Generating {name}...")
        wallet = generate_wallet(name)
        
        wallet_key = name.lower().replace(' ', '_')
        wallets[wallet_key] = wallet
        
        print(f"   Address: {wallet['address']}")
        print(f"   Mnemonic: {wallet['mnemonic'][:50]}...")
    
    # Save to secure JSON file
    output_file = 'CARDANO_WALLETS_PREPROD.json'
    with open(output_file, 'w') as f:
        json.dump(wallets, f, indent=2)
    
    print("\n" + "=" * 70)
    print(f"✅ All wallets generated and saved to {output_file}")
    print("\n⚠️  SECURITY WARNING:")
    print("   - Keep CARDANO_WALLETS_PREPROD.json in a SECURE location")
    print("   - NEVER commit this file to Git")
    print("   - Backup mnemonic phrases offline (paper wallet)")
    print("   - These wallets are for PREPROD TESTNET (addr_test1...)")
    print("\n📋 Next Steps:")
    print("   1. Get test ADA from Masumi Dispenser: https://dispenser.masumi.network")
    print("   2. Update .env with agent wallet addresses")
    print("   3. Configure masumi_service.py for preprod")
    print("   4. Test payment distribution pipeline")
    
    # Create .env template
    print("\n" + "=" * 70)
    print("📄 Environment Variables Template:\n")
    
    env_template = f"""
# Cardano Preprod Testnet Wallet Addresses
ORCHESTRATOR_WALLET_ADDRESS={wallets['orchestrator_agent']['address']}
SPOTFINDER_WALLET_ADDRESS={wallets['spotfinder_agent']['address']}
PRICING_WALLET_ADDRESS={wallets['pricing_agent']['address']}
ROUTEOPTIMIZER_WALLET_ADDRESS={wallets['routeoptimizer_agent']['address']}
PAYMENTVERIFIER_WALLET_ADDRESS={wallets['paymentverifier_agent']['address']}
SECURITYGUARD_WALLET_ADDRESS={wallets['securityguard_agent']['address']}
DISPUTERESOLVER_WALLET_ADDRESS={wallets['disputeresolver_agent']['address']}
CUSTOMER_WALLET_ADDRESS={wallets['customer_wallet']['address']}

# Masumi Network Configuration
MASUMI_NETWORK=preprod
MASUMI_API_URL=https://preprod.masumi.network/api
"""
    
    with open('.env.wallets', 'w') as f:
        f.write(env_template.strip())
    
    print(env_template)
    print("\n💾 Saved to .env.wallets (merge with your .env file)")

if __name__ == '__main__':
    main()
