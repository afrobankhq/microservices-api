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
 * Fetch transactions for a specific address (public address string)
 */
export const getTransactionsByAddress = async (req, res) => {
  try {
    const { address } = req.params;
    const params = req.query;

    const addressList = await blockradar.listAddresses();

    console.log('📬 Incoming address:', address);
    console.log('📦 Available addresses:', addressList.addresses.map(a => a.address));

    const found = addressList.addresses.find(
      (addr) => addr.address.toLowerCase().trim() === address.toLowerCase().trim()
    );

    if (!found) {
      console.warn('❌ Address not found in wallet:', address);
      return res.status(404).json({ error: 'Address not found in wallet' });
    }

    console.log('✅ Matched address ID:', found.id);

    const result = await blockradar.getAddressTransactions(found.id, params);

    console.log('📈 Transactions count:', result?.transactions?.length || 0);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error fetching transactions by address:', error.message);
    res.status(500).json({ error: 'Failed to fetch transactions for address' });
  }
};
