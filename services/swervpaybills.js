// services/swervpaybills.js
import { swervpayRequest, getValidToken } from '../utils/swervpayUtil.js';

/**
 * Get all bill categories
 * @returns {Promise<Object>} List of bill categories
 */
export const getBillCategories = async () => {
  try {
    const token = await getValidToken();
    const response = await swervpayRequest('/bills/categories', 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching bill categories:', error);
    throw new Error(`Failed to fetch bill categories: ${error.message}`);
  }
};

/**
 * Get all items in a specific bill category
 * @param {string} categoryId - The category ID
 * @returns {Promise<Object>} List of items in the category
 */
export const getBillCategoryList = async (categoryId) => {
  try {
    if (!categoryId) {
      throw new Error('Category ID is required');
    }

    const token = await getValidToken();
    const response = await swervpayRequest(`/bills/categories/${categoryId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching bill category list:', error);
    throw new Error(`Failed to fetch bill category list: ${error.message}`);
  }
};

/**
 * Get specific item details for a category and item
 * @param {string} categoryId - The category ID
 * @param {string} itemId - The item ID
 * @returns {Promise<Object>} Item details including amount, fee, etc.
 */
export const getBillCategoryItems = async (categoryId, itemId) => {
  try {
    if (!categoryId || !itemId) {
      throw new Error('Both category ID and item ID are required');
    }

    const token = await getValidToken();
    const response = await swervpayRequest(`/bills/categories/${categoryId}/items/${itemId}`, 'GET');
    return response;
  } catch (error) {
    console.error('Error fetching bill category items:', error);
    throw new Error(`Failed to fetch bill category items: ${error.message}`);
  }
};

/**
 * Validate customer for a specific biller
 * @param {string} billerCode - The biller code
 * @param {string} customerId - The customer ID to validate
 * @returns {Promise<Object>} Validation result
 */
export const validateBillCustomer = async (billerCode, customerId) => {
  try {
    if (!billerCode || !customerId) {
      throw new Error('Biller code and customer ID are required');
    }

    const token = await getValidToken();
    const response = await swervpayRequest('/bills/validate-customer', 'POST', {
      biller_code: billerCode,
      customer_id: customerId
    });
    return response;
  } catch (error) {
    console.error('Error validating bill customer:', error);
    throw new Error(`Failed to validate customer: ${error.message}`);
  }
};

/**
 * Create a bill payment
 * @param {Object} payload - Payment details
 * @param {number} payload.amount - Payment amount
 * @param {string} payload.billerCode - Biller code
 * @param {string} payload.customerId - Customer ID
 * @param {string} [payload.reference] - Payment reference
 * @param {Object} [payload.metadata] - Additional metadata
 * @returns {Promise<Object>} Payment result
 */
export const createBillPayment = async (payload) => {
  try {
    // Validate required fields
    const { amount, billerCode, customerId } = payload;
    
    if (!amount || !billerCode || !customerId) {
      throw new Error('Amount, biller code, and customer ID are required');
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const token = await getValidToken();
    
    // Prepare the payment payload
    const paymentData = {
      amount,
      biller_code: billerCode,
      customer_id: customerId,
      reference: payload.reference || `bill_${Date.now()}`,
      metadata: payload.metadata || {}
    };

    const response = await swervpayRequest('/bills/create-bill', 'POST', paymentData);
    return response;
  } catch (error) {
    console.error('Error creating bill payment:', error);
    throw new Error(`Failed to create bill payment: ${error.message}`);
  }
};