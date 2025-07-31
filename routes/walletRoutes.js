import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hardcodedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../hardcoded-data.json'), 'utf8'));

const router = express.Router();

// Get wallet cards
router.get('/cards', authenticate, (req, res) => {
  console.log('[GET /api/wallet/cards] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.cards.walletCards,
      message: 'Wallet cards retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/wallet/cards] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve wallet cards'
    });
  }
});

// Get wallet cards by user ID
router.get('/cards/:userId', authenticate, (req, res) => {
  console.log('[GET /api/wallet/cards/:userId] Request received, User ID:', req.params.userId);
  try {
    res.json({
      success: true,
      data: hardcodedData.cards.walletCards,
      message: 'User wallet cards retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/wallet/cards/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user wallet cards'
    });
  }
});

// Get wallet balance
router.get('/balance', authenticate, (req, res) => {
  console.log('[GET /api/wallet/balance] Request received');
  try {
    const balance = {
      total: 20788.30,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      breakdown: {
        mainCard: 12547.80,
        savingsCard: 8240.50
      }
    };
    
    res.json({
      success: true,
      data: balance,
      message: 'Wallet balance retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/wallet/balance] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve wallet balance'
    });
  }
});

// Get wallet balance by user ID
router.get('/balance/:userId', authenticate, (req, res) => {
  console.log('[GET /api/wallet/balance/:userId] Request received, User ID:', req.params.userId);
  try {
    const balance = {
      total: 20788.30,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      userId: req.params.userId,
      breakdown: {
        mainCard: 12547.80,
        savingsCard: 8240.50
      }
    };
    
    res.json({
      success: true,
      data: balance,
      message: 'User wallet balance retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/wallet/balance/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user wallet balance'
    });
  }
});

// Update wallet balance
router.put('/balance', authenticate, (req, res) => {
  console.log('[PUT /api/wallet/balance] Request received');
  console.log('[PUT /api/wallet/balance] Request body:', req.body);
  
  try {
    const updatedBalance = {
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedBalance,
      message: 'Wallet balance updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/wallet/balance] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update wallet balance'
    });
  }
});

// Get payment methods
router.get('/payment-methods', authenticate, (req, res) => {
  console.log('[GET /api/wallet/payment-methods] Request received');
  try {
    const paymentMethods = [
      {
        id: 1,
        type: 'bank_account',
        name: 'First Bank',
        accountNumber: '****1234',
        status: 'active'
      },
      {
        id: 2,
        type: 'debit_card',
        name: 'Visa Debit',
        cardNumber: '****5678',
        status: 'active'
      }
    ];
    
    res.json({
      success: true,
      data: paymentMethods,
      message: 'Payment methods retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/wallet/payment-methods] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment methods'
    });
  }
});

// Add payment method
router.post('/payment-methods', authenticate, (req, res) => {
  console.log('[POST /api/wallet/payment-methods] Request received');
  console.log('[POST /api/wallet/payment-methods] Request body:', req.body);
  
  const { type, name, accountNumber, cardNumber } = req.body;
  
  if (!type || !name) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: type, name'
    });
  }
  
  try {
    const newPaymentMethod = {
      id: Date.now(),
      type,
      name,
      accountNumber: accountNumber ? `****${accountNumber.slice(-4)}` : undefined,
      cardNumber: cardNumber ? `****${cardNumber.slice(-4)}` : undefined,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: newPaymentMethod,
      message: 'Payment method added successfully'
    });
  } catch (error) {
    console.error('[POST /api/wallet/payment-methods] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add payment method'
    });
  }
});

// Delete payment method
router.delete('/payment-methods/:id', authenticate, (req, res) => {
  console.log('[DELETE /api/wallet/payment-methods/:id] Request received, ID:', req.params.id);
  try {
    res.json({
      success: true,
      data: {
        id: req.params.id,
        deletedAt: new Date().toISOString()
      },
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE /api/wallet/payment-methods/:id] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete payment method'
    });
  }
});

// Link bank account
router.post('/link-bank', authenticate, (req, res) => {
  console.log('[POST /api/wallet/link-bank] Request received');
  console.log('[POST /api/wallet/link-bank] Request body:', req.body);
  
  const { bankName, accountNumber, accountName } = req.body;
  
  if (!bankName || !accountNumber || !accountName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: bankName, accountNumber, accountName'
    });
  }
  
  try {
    const linkedBank = {
      id: Date.now(),
      bankName,
      accountNumber: `****${accountNumber.slice(-4)}`,
      accountName,
      status: 'linked',
      linkedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: linkedBank,
      message: 'Bank account linked successfully'
    });
  } catch (error) {
    console.error('[POST /api/wallet/link-bank] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to link bank account'
    });
  }
});

// Get linked banks
router.get('/linked-banks', authenticate, (req, res) => {
  console.log('[GET /api/wallet/linked-banks] Request received');
  try {
    const linkedBanks = [
      {
        id: 1,
        bankName: 'First Bank',
        accountNumber: '****1234',
        accountName: 'John Doe',
        status: 'linked',
        linkedAt: '2024-01-01T10:00:00Z'
      },
      {
        id: 2,
        bankName: 'GT Bank',
        accountNumber: '****5678',
        accountName: 'John Doe',
        status: 'linked',
        linkedAt: '2024-01-05T14:30:00Z'
      }
    ];
    
    res.json({
      success: true,
      data: linkedBanks,
      message: 'Linked banks retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/wallet/linked-banks] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve linked banks'
    });
  }
});

// Delete linked bank
router.delete('/linked-banks/:bankId', authenticate, (req, res) => {
  console.log('[DELETE /api/wallet/linked-banks/:bankId] Request received, Bank ID:', req.params.bankId);
  try {
    res.json({
      success: true,
      data: {
        bankId: req.params.bankId,
        deletedAt: new Date().toISOString()
      },
      message: 'Linked bank deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE /api/wallet/linked-banks/:bankId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete linked bank'
    });
  }
});

// Add mobile money
router.post('/mobile-money', authenticate, (req, res) => {
  console.log('[POST /api/wallet/mobile-money] Request received');
  console.log('[POST /api/wallet/mobile-money] Request body:', req.body);
  
  const { provider, phoneNumber, accountName } = req.body;
  
  if (!provider || !phoneNumber || !accountName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: provider, phoneNumber, accountName'
    });
  }
  
  try {
    const mobileMoney = {
      id: Date.now(),
      provider,
      phoneNumber: `****${phoneNumber.slice(-4)}`,
      accountName,
      status: 'linked',
      linkedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mobileMoney,
      message: 'Mobile money linked successfully'
    });
  } catch (error) {
    console.error('[POST /api/wallet/mobile-money] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to link mobile money'
    });
  }
});

// Get mobile money providers
router.get('/mobile-money-providers', (req, res) => {
  console.log('[GET /api/wallet/mobile-money-providers] Request received');
  try {
    const providers = [
      {
        id: 1,
        name: 'MTN Mobile Money',
        code: 'MTN',
        logo: 'mtn-logo.png'
      },
      {
        id: 2,
        name: 'Airtel Money',
        code: 'AIRTEL',
        logo: 'airtel-logo.png'
      },
      {
        id: 3,
        name: 'Glo Mobile Money',
        code: 'GLO',
        logo: 'glo-logo.png'
      }
    ];
    
    res.json({
      success: true,
      data: providers,
      message: 'Mobile money providers retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/wallet/mobile-money-providers] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve mobile money providers'
    });
  }
});

// Get wallet options
router.get('/options', (req, res) => {
  console.log('[GET /api/wallet/options] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.walletOptions,
      message: 'Wallet options retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/wallet/options] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve wallet options'
    });
  }
});

// Get quick actions
router.get('/quick-actions', authenticate, (req, res) => {
  console.log('[GET /api/wallet/quick-actions] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.quickActions,
      message: 'Quick actions retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/wallet/quick-actions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve quick actions'
    });
  }
});

export default router; 