/**
 * Real Parking API Service
 * Connects to Flask backend with Cardano blockchain integration
 */

import { API_BASE_URL } from '@/config/api';

export interface ParkingSpot {
  id: string;
  zone: string;
  floor: string;
  row: string;
  column: number;
  status: 'available' | 'occupied' | 'reserved' | 'selected' | 'suggested';
  occupied: boolean;
  features: string[];
  distanceFromEntrance: number;
  pricing?: {
    base_rate: number;
    demand_multiplier: number;
    total_rate: number;
  };
}

export interface ReservationRequest {
  user_id: string;
  spot_id?: string;
  user_location?: { lat: number; lng: number };
  vehicle_type: string;
  desired_features?: string[];
  duration_hours?: number;
  wallet_address: string;
}

export interface ReservationResponse {
  success: boolean;
  session_id: string;
  recommended_spot: ParkingSpot;
  pricing: {
    base_rate_lovelace: number;
    per_minute_rate_ada: number;
    estimated_cost_ada: number;
  };
  route_guidance: string;
  agents_executed: string[];
  tx_hash?: string; // Cardano transaction hash
}

export interface StartParkingRequest {
  session_id: string;
  spot_id: string;
  wallet_address: string;
}

export interface StartParkingResponse {
  success: boolean;
  booking_id: string;
  spot_id: string;
  start_time: string;
  rate_per_minute_ada: number;
  initial_payment_tx_hash: string; // Blockchain TX hash
  agents_paid: {
    agent_name: string;
    amount_ada: number;
    tx_hash: string;
  }[];
}

export interface EndParkingRequest {
  session_id: string;
  booking_id: string;
}

export interface EndParkingResponse {
  success: boolean;
  total_duration_minutes: number;
  total_cost_ada: number;
  final_payment_tx_hash: string;
  parking_verification_status: string;
}

// Fetch available parking spots (real-time from Firebase)
export const getAvailableSpots = async (): Promise<ParkingSpot[]> => {
  const response = await fetch(`${API_BASE_URL}/api/parking/spots/available`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch parking spots');
  }
  
  return data.spots;
};

// Create reservation with AI agents
export const createReservation = async (
  request: ReservationRequest
): Promise<ReservationResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/parking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create reservation');
  }
  
  return data;
};

// Start parking session (triggers initial Cardano payment)
export const startParking = async (
  request: StartParkingRequest
): Promise<StartParkingResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/parking/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to start parking session');
  }
  
  return data;
};

// End parking session (final Cardano payment)
export const endParking = async (
  request: EndParkingRequest
): Promise<EndParkingResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/parking/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to end parking session');
  }
  
  return data;
};

// Get real-time wallet balance from Cardano blockchain
export const getWalletBalance = async (walletAddress: string): Promise<number> => {
  const response = await fetch(
    `${API_BASE_URL}/api/wallet/balance/${walletAddress}`
  );
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch wallet balance');
  }
  
  return data.balance_ada;
};

// Get transaction history
export const getTransactionHistory = async (
  walletAddress: string
): Promise<any[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/wallet/transactions/${walletAddress}`
  );
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch transactions');
  }
  
  return data.transactions;
};
