import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const SWERVPAY_BASE_URL = process.env.NODE_ENV === 'production' 
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
export const getValidToken = async () => {
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
export const swervpayRequest = async (endpoint, method = 'GET', body = null) => {
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