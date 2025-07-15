// services/blockradar.js

const BASE_URL = 'https://api.blockradar.co/v1';
const API_KEY = process.env.BLOCKRADAR_API_KEY;
const WALLET_ID = process.env.BLOCKRADAR_WALLET_ID;

if (!API_KEY || !WALLET_ID) {
  throw new Error('Missing BLOCKRADAR_API_KEY or BLOCKRADAR_WALLET_ID in .env');
}

/**
 * Helper function to perform authenticated fetch requests to the Blockradar API
 */
const request = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error(`[Blockradar API Error] ${res.status}: ${error.message || 'Unknown error'}`);
      throw new Error(`Blockradar API error: ${error.message || `HTTP ${res.status}`}`);
    }

    return res.json();
  } catch (error) {
    console.error(`[Blockradar Error] ${options.method || 'GET'} ${url}: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new blockchain address under the configured wallet
 * @param {string} blockchain - Blockchain name (e.g., "ethereum")
 * @param {string} name - Human-readable label for the address
 */
export const createAddress = async (blockchain, name) => {
  return request(`/wallets/${WALLET_ID}/addresses`, {
    method: 'POST',
    body: JSON.stringify({ blockchain, name }),
  });
};

/**
 * Get details about a specific address by ID
 * @param {string} addressId
 */
export const getAddress = async (addressId) => {
  return request(`/wallets/${WALLET_ID}/addresses/${addressId}`, {
    method: 'GET',
  });
};

/**
 * List all addresses under the wallet
 * @param {object} params - Optional query parameters
 */
export const listAddresses = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/wallets/${WALLET_ID}/addresses${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
};

/**
 * List all deposits for a specific address by ID
 * @param {string} addressId
 */
export const listDeposits = async (addressId) => {
  return request(`/wallets/${WALLET_ID}/addresses/${addressId}/deposits`, {
    method: 'GET',
  });
};

/**
 * Get token balances for an address that exists in your wallet
 * @param {string} address - The wallet address string
 */
export const getTokenBalances = async (address) => {
  console.log('📡 Fetching balances for address:', address);

  try {
    const addressesResponse = await listAddresses();
    const foundAddress = addressesResponse.addresses?.find(
      (addr) => addr.address.toLowerCase() === address.toLowerCase()
    );

    if (!foundAddress) {
      console.warn('⚠️ Address not found in wallet. Balance lookup not supported.');
      return {
        address,
        tokens: [],
        native_balance: '0',
        error: 'Address not found in wallet. Only internal wallet addresses are supported.',
      };
    }

    const addressId = foundAddress.id;
    return request(`/wallets/${WALLET_ID}/addresses/${addressId}/balances`, {
      method: 'GET',
    });
  } catch (error) {
    console.error('❌ Failed to fetch token balances:', error.message);
    return {
      address,
      tokens: [],
      native_balance: '0',
      error: 'Error fetching balances from Blockradar.',
    };
  }
};

/**
 * Fetch all transactions under the wallet
 * @param {object} params - Optional query parameters (e.g., { limit: 10, page: 1 })
 */
export const getTransactions = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/wallets/${WALLET_ID}/transactions${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
};

/**
 * Get transactions for a specific address
 * @param {string} addressId - Blockradar address ID
 * @param {object} params - Optional query parameters (e.g., { limit, page })
 */
export const getAddressTransactions = async (addressId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/wallets/${WALLET_ID}/addresses/${addressId}/transactions${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
};


export default {
  createAddress,
  getAddress,
  listAddresses,
  listDeposits,
  getTokenBalances,
  getTransactions,
  getAddressTransactions, 
};
