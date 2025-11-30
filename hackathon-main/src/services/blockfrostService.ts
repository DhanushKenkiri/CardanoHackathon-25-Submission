/**
 * Direct Blockfrost API integration for wallet balance
 * Fallback when backend is not available
 */

const BLOCKFROST_PROJECT_ID = import.meta.env.VITE_BLOCKFROST_PROJECT_ID || 'preprod6cCK2JOLmwtTwFfxdE29SIoRppC8sPf6';
const BLOCKFROST_API_URL = 'https://cardano-preprod.blockfrost.io/api/v0';

export interface BlockfrostBalance {
  balance_ada: number;
  balance_lovelace: number;
}

/**
 * Get wallet balance directly from Blockfrost API
 */
export const getBalanceFromBlockfrost = async (address: string): Promise<BlockfrostBalance> => {
  try {
    const response = await fetch(
      `${BLOCKFROST_API_URL}/addresses/${address}`,
      {
        headers: {
          'project_id': BLOCKFROST_PROJECT_ID,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blockfrost API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Convert lovelace to ADA (1 ADA = 1,000,000 lovelace)
    const lovelace = parseInt(data.amount.find((a: any) => a.unit === 'lovelace')?.quantity || '0');
    const ada = lovelace / 1_000_000;

    return {
      balance_ada: ada,
      balance_lovelace: lovelace,
    };
  } catch (error) {
    console.error('Blockfrost API error:', error);
    throw error;
  }
};

/**
 * Get transaction history from Blockfrost
 */
export const getTransactionsFromBlockfrost = async (address: string, count: number = 10) => {
  try {
    const response = await fetch(
      `${BLOCKFROST_API_URL}/addresses/${address}/transactions?count=${count}&order=desc`,
      {
        headers: {
          'project_id': BLOCKFROST_PROJECT_ID,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blockfrost API error: ${response.status}`);
    }

    const txHashes = await response.json();
    
    return txHashes.map((tx: any) => ({
      tx_hash: tx.tx_hash,
      block_height: tx.block_height,
      block_time: tx.block_time,
    }));
  } catch (error) {
    console.error('Blockfrost transactions error:', error);
    throw error;
  }
};
