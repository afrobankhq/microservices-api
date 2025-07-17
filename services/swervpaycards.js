// services/swervpaycards.js
import axios from 'axios';

const SWERVPAY_BASE_URL = 'https://api.swervpay.co/card';
const SWERVPAY_SECRET_KEY = process.env.SWERVPAY_SECRET_KEY;

const headers = {
  Authorization: `Bearer ${SWERVPAY_SECRET_KEY}`,
  'Content-Type': 'application/json',
};

const createCard = async (payload) => {
  const url = `${SWERVPAY_BASE_URL}/create`;
  return axios.post(url, payload, { headers });
};

export default {
  createCard,
};
