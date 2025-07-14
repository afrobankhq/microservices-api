// controllers/transactionsController.js

import blockradar from '../services/blockradar.js';

/**
 * GET /api/transactions
 * Fetch all transactions for the wallet
 */
export const getAllTransactions = async (req, res) => {
  try {
    const params = req.query; // supports pagination/filtering
    const transactions = await blockradar.getTransactions(params);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('🚨 Error in getAllTransactions:', error.message);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
};
