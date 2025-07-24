import fetch from 'node-fetch';
import { swervpayRequest, getValidToken, SWERVPAY_BASE_URL } from '../utils/swervpayUtil.js';





// Get all items/packages for a specific biller/provider
export const getBillCategoryItems = async (categoryId, itemId) => {
  const token = await getValidToken();
  const res = await swervpayRequest(`/bills/categories/${categoryId}/items/${itemId}`, 'GET');
  return res;
};

export const getBillCategories = async () => {
  const token = await getValidToken();
  const res = await swervpayRequest('/bills/categories', 'GET');
  console.log(res);
  return res;
};

// Fetch all items in a bill category
export const getBillCategoryList = async (categoryId) => {
  const token = await getValidToken();
  const res = await swervpayRequest(`/bills/categories/${categoryId}`, 'GET');
  return res;
};

// Validate customer for a biller (optional, e.g. for TV, electricity)
export const validateBillCustomer = async (billerCode, customerId) => {
  const token = await getValidToken();
  const res = await swervpayRequest('/validate-customer', 'POST', {
    biller_code: billerCode,
    customer_id: customerId
  });
  return res;
};

// Create a bill payment
export const createBillPayment = async (payload) => {
  const token = await getValidToken();
  const res = await swervpayRequest('/create-bill', 'POST', payload);
  return res;
};