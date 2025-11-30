/**
 * API Configuration for ParknGo
 * Connects React frontend to Flask backend
 */

// Backend API base URL (Flask server)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Firebase configuration
export const FIREBASE_CONFIG = {
  databaseURL: 'https://parkngo-ai-default-rtdb.asia-southeast1.firebasedatabase.app',
};

// Cardano wallet address (customer wallet)
export const CUSTOMER_WALLET_ADDRESS = 'addr_test1vrjtn62vuzckgnw8fff7t246lq34633h4qkc8npvf5fzvrskjj36g';

// Agent wallet addresses
export const AGENT_WALLETS = {
  orchestrator: 'addr_test1vq9acp063ul3trcd4tlzwq0ssy65c9qrsvucr87dt58rpwgehf0at',
  spotFinder: 'addr_test1vrh3a4ec528dhgtdsyh0pj60xxa356nyhr66he03l58xpust478h7',
  pricing: 'addr_test1vr0cdqqggujm4y9lplp2fan3ne78kwtalqhj2amhuwa2mvqvz5gqk',
  routeOptimizer: 'addr_test1vzq2hu0xq0duledhcklv7amh69u3c8vppuecepe30cd4v5ssncadd',
  paymentVerifier: 'addr_test1vrcwgs5h3ez9xnvfa4n52ht5jm9kd77zydy9kr573wgd0mcatpfxd',
  securityGuard: 'addr_test1vptzsefqet3cf9sse9cevhjemhn3k89qu40swxct862sz4qm48w74',
  disputeResolver: 'addr_test1vprcfygphfv06053yea7ycrw9hcz9uwc5jffw8fzcdk5vjchh8d25',
};

// CardanoScan explorer URLs
export const CARDANO_EXPLORER_URL = 'https://preprod.cardanoscan.io';

export const getTransactionUrl = (txHash: string) =>
  `${CARDANO_EXPLORER_URL}/transaction/${txHash}`;

export const getAddressUrl = (address: string) =>
  `${CARDANO_EXPLORER_URL}/address/${address}`;
