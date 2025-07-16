// controllers/transactionsController.js
import blockradar from '../services/blockradar.js';

/**
 * GET /api/transactions
 * Fetch all transactions from master wallet, optionally filtered by sub-account address
 * Query params:
 * - address: filter transactions by sub-account address
 * Note: blockradar API only returns all master wallet transactions, filtering is done client-side
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { address } = req.query;
    
    // Always fetch all transactions from master wallet (blockradar doesn't support address filtering)
    const allTransactions = await blockradar.getTransactions();
    
    // If address filter is provided, filter the results client-side
    if (address) {
      const lowercaseAddress = address.toLowerCase();
      console.log('🔎 Filtering master wallet transactions by sub-account address:', lowercaseAddress);
      
      const filtered = allTransactions.data.filter((tx) =>
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
        ...allTransactions,
        message: `Filtered transactions for sub-account address: ${address}`,
        count: filtered.length,
        data: filtered,
      });
    }
    
    // Return all master wallet transactions if no address filter
    res.status(200).json({
      ...allTransactions,
      message: 'All master wallet transactions',
    });
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