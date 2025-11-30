/**
 * Firebase Service for Real-Time Database Integration
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, get } from 'firebase/database';
import { FIREBASE_CONFIG } from '@/config/api';

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const database = getDatabase(app);

export interface FirebaseParkingSpot {
  id: string;
  zone: string;
  occupied: boolean;
  features?: string[];
  pricing?: {
    base_rate: number;
    demand_multiplier?: number;
  };
  floor?: string;
  row?: string;
  column?: number;
}

export interface VerificationFlags {
  camera_detected?: boolean;
  cameraVerified?: boolean;
  vehicle_detected?: boolean;
  qr_verified?: boolean;
  qr_scanned?: boolean;
  qr?: boolean;
  slot_confirmed?: boolean;
  last_updated?: string | number;
}

const buildSpotIdCandidates = (spotId?: string): string[] => {
  if (!spotId) return [];
  const trimmed = spotId.trim();
  const lower = trimmed.toLowerCase();
  const underscores = lower.replace(/[^a-z0-9]/g, '_');
  const prefixed = underscores.startsWith('spot_') ? underscores : `spot_${underscores}`;
  return Array.from(new Set([trimmed, lower, underscores, prefixed].filter(Boolean)));
};

const fetchSnapshotFromCandidates = async <T = any>(
  basePath: string,
  candidates: string[],
): Promise<{ key: string; data: T } | null> => {
  for (const candidate of candidates) {
    try {
      const snapshot = await get(ref(database, `${basePath}/${candidate}`));
      if (snapshot.exists()) {
        return { key: candidate, data: snapshot.val() as T };
      }
    } catch (error) {
      console.error(`Failed to read Firebase path ${basePath}/${candidate}`, error);
    }
  }
  return null;
};

/**
 * Subscribe to real-time parking spots updates
 */
export const subscribeToParkingSpots = (
  callback: (spots: FirebaseParkingSpot[]) => void
) => {
  const spotsRef = ref(database, 'parking_spots');
  
  const unsubscribe = onValue(spotsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const spotsArray = Object.entries(data).map(([key, value]: [string, any]) => ({
        id: value.id || key,
        zone: value.zone || 'A',
        occupied: value.occupied || false,
        features: value.features || [],
        pricing: value.pricing || { base_rate: 1200000 },
        floor: value.floor || 'Basement 1',
        row: value.row || 'A',
        column: value.column || 1,
      }));
      callback(spotsArray);
    }
  });

  return () => off(spotsRef);
};

/**
 * Subscribe to QR scan events under `qr_scans`
 * Returns the latest record (if multiple exist we send the most recent snapshot payload)
 */
export const subscribeToQrScans = (
  callback: (scan: any | null) => void
) => {
  const qrRef = ref(database, 'qr_scans');

  console.log('🔗 Firebase: Subscribing to qr_scans node...');

  const unsubscribe = onValue(qrRef, (snapshot) => {
    console.log('📡 Firebase: qr_scans snapshot received', snapshot.exists());
    const data = snapshot.val();
    
    if (!data) {
      console.log('⚠️ Firebase: No qr_scans data found');
      callback(null);
      return;
    }

    console.log('📦 Firebase: qr_scans raw data:', data);
    const entries = Object.values(data);
    
    if (entries.length === 0) {
      console.log('⚠️ Firebase: qr_scans is empty');
      callback(null);
      return;
    }

    // Assume last inserted entry is latest (firebase push IDs are time-ordered)
    const latest = entries[entries.length - 1];
    console.log('✅ Firebase: Latest QR scan:', latest);
    callback(latest);
  });

  return () => {
    console.log('🔌 Firebase: Unsubscribing from qr_scans');
    off(qrRef);
  };
};

/**
 * Subscribe to specific parking spot
 */
export const subscribeToSpot = (
  spotId: string,
  callback: (spot: FirebaseParkingSpot | null) => void
) => {
  const spotRef = ref(database, `parking_spots/${spotId}`);
  
  const unsubscribe = onValue(spotRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || null);
  });

  return () => off(spotRef);
};

/**
 * Subscribe to active session
 */
export const subscribeToSession = (
  sessionId: string,
  callback: (session: any) => void
) => {
  const sessionRef = ref(database, `active_sessions/${sessionId}`);
  
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });

  return () => off(sessionRef);
};

/**
 * Fetch a parking spot's latest state once (used for polling loops)
 */
export const fetchSpotStatusOnce = async (spotId: string) => {
  const candidates = buildSpotIdCandidates(spotId);
  if (candidates.length === 0) return null;
  const snapshot = await fetchSnapshotFromCandidates<FirebaseParkingSpot>(
    'parking_spots',
    candidates,
  );
  return snapshot?.data ?? null;
};

/**
 * Fetch verification flags (camera + QR) for a spot.
 * Attempts multiple Firebase paths to support different hardware publishers.
 */
export const fetchVerificationFlagsOnce = async (spotId: string) => {
  const candidates = buildSpotIdCandidates(spotId);
  if (candidates.length === 0) return null;

  const verificationPaths = ['verifications', 'vehicle_verifications', 'qr_scans'];

  for (const base of verificationPaths) {
    const snapshot = await fetchSnapshotFromCandidates<VerificationFlags>(base, candidates);
    if (snapshot) {
      return snapshot.data;
    }
  }

  return null;
};

export { database };
