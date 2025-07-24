// services/swervpay.js
import fetch from 'node-fetch';

const SWERVPAY_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.swervpay.co/api/v1'
  : 'https://sandbox.swervpay.co/api/v1';
const BUSINESS_ID = process.env.SWERVPAY_BUSINESS_ID;
const SECRET_KEY = process.env.SWERVPAY_SECRET_KEY;

if (!BUSINESS_ID || !SECRET_KEY) {
  throw new Error('Missing SWERVPAY_BUSINESS_ID or SWERVPAY_SECRET_KEY in .env');
}

// Store the bearer token
let bearerToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Swervpay and get bearer token
 */
const authenticateSwervpay = async () => {
  try {
    const basicAuth = Buffer.from(`${BUSINESS_ID}:${SECRET_KEY}`).toString('base64');
    const response = await fetch(`${SWERVPAY_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Authentication failed: ${response.status}`);
    }

    const authData = await response.json();
    bearerToken = authData.access_token;
    tokenExpiry = new Date(Date.now() + (authData.expires_in * 1000));
    
    console.log('✅ Swervpay authentication successful');
    return bearerToken;
  } catch (error) {
    console.error('❌ Swervpay authentication failed:', error.message);
    throw error;
  }
};

/**
 * Get valid bearer token (authenticate if needed)
 */
const getValidToken = async () => {
  // Check if we have a valid token
  if (bearerToken && tokenExpiry && new Date() < tokenExpiry) {
    return bearerToken;
  }
  
  // Authenticate to get new token
  return await authenticateSwervpay();
};

/**
 * Helper to make authenticated requests to Swervpay API
 */
const swervpayRequest = async (endpoint, method = 'GET', body = null) => {
  const url = `${SWERVPAY_BASE_URL}${endpoint}`;
  
  // Get valid bearer token
  const token = await getValidToken();
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Swervpay API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`[Swervpay Error] ${method} ${endpoint}:`, error.message);
    throw error;
  }
};

// ===== CUSTOMER ENDPOINTS =====

/**
 * Create a new customer
 */
export const createCustomer = async (customerData) => {
  return swervpayRequest('/customers', 'POST', customerData);
};

/**
 * Get customer by ID
 */
export const getCustomer = async (customerId) => {
  return swervpayRequest(`/customers/${customerId}`, 'GET');
};

/**
 * Get all customers
 */
export const getAllCustomers = async (page = 1, limit = 10) => {
  return swervpayRequest(`/customers?page=${page}&limit=${limit}`, 'GET');
};

/**
 * Update customer
 */
export const updateCustomer = async (customerId, updateData) => {
  return swervpayRequest(`/customers/${customerId}`, 'POST', updateData);
};

/**
 * Customer KYC verification
 */
export const customerKYC = async (customerId, kycData) => {
  return swervpayRequest(`/customers/${customerId}/kyc`, 'POST', kycData);
};

// ===== CARD ENDPOINTS =====

/**
 * Create a card (requires existing customer_id)
 */
export const createCard = async (cardData) => {
  return swervpayRequest('/cards', 'POST', cardData);
};

/**
 * Get card by ID
 */
export const getCard = async (cardId) => {
  return swervpayRequest(`/cards/${cardId}`, 'GET');
};

/**
 * Get all cards
 */
export const getAllCards = async (page = 1, limit = 10) => {
  return swervpayRequest(`/cards?page=${page}&limit=${limit}`, 'GET');
};

/**
 * Fund a card
 */
export const fundCard = async (cardId, amount) => {
  return swervpayRequest(`/cards/${cardId}/fund`, 'POST', { amount });
};

/**
 * Withdraw from card
 */
export const withdrawFromCard = async (cardId, amount) => {
  return swervpayRequest(`/cards/${cardId}/withdraw`, 'POST', { amount });
};

/**
 * Freeze a card
 */
export const freezeCard = async (cardId) => {
  return swervpayRequest(`/cards/${cardId}/freeze`, 'POST');
};

/**
 * Unfreeze a card
 */
export const unfreezeCard = async (cardId) => {
  return swervpayRequest(`/cards/${cardId}/unfreeze`, 'POST');
};

/**
 * Terminate a card
 */
export const terminateCard = async (cardId) => {
  return swervpayRequest(`/cards/${cardId}/terminate`, 'POST');
};

/**
 * Get card transactions
 */
export const getCardTransactions = async (cardId, page = 1, limit = 10) => {
  return swervpayRequest(`/cards/${cardId}/transactions?page=${page}&limit=${limit}`, 'GET');
};

export default {
  // Customer methods
  createCustomer,
  getCustomer,
  getAllCustomers,
  updateCustomer,
  customerKYC,
  
  // Card methods
  createCard,
  getCard,
  getAllCards,
  fundCard,
  withdrawFromCard,
  freezeCard,
  unfreezeCard,
  terminateCard,
  getCardTransactions,
};