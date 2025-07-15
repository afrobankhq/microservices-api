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

/**
 * GET /api/transactions/:address
 */
export const getTransactionsByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const lowercaseAddress = address.toLowerCase();

    console.log('🔎 Fetching all transactions to filter by address:', lowercaseAddress);

    // Get all transactions
    const allTxs = await blockradar.getTransactions();

    const filtered = allTxs.data.filter((tx) =>
      [
        tx.senderAddress,
        tx.recipientAddress,
        tx.assetSweptSenderAddress,
        tx.assetSweptRecipientAddress,
      ]
        .filter(Boolean)
        .some((addr) => addr.toLowerCase() === lowercaseAddress)
    );

    return res.status(200).json({
      message: 'Filtered transactions for address',
      statusCode: 200,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.error('❌ Error filtering transactions by address:', error.message);
    res.status(500).json({ error: 'Failed to filter transactions by address' });
  }
};
