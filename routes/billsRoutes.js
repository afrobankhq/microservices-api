import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hardcodedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../hardcoded-data.json'), 'utf8'));

const router = express.Router();

// Get all bill categories
router.get('/categories', (req, res) => {
  console.log('[GET /api/bills/categories] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.billCategories,
      message: 'Bill categories retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/bills/categories] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bill categories'
    });
  }
});

// Get bill category by ID
router.get('/categories/:id', (req, res) => {
  console.log('[GET /api/bills/categories/:id] Request received, ID:', req.params.id);
  try {
    const category = hardcodedData.billCategories.find(cat => cat.id === parseInt(req.params.id));
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Bill category not found'
      });
    }
    res.json({
      success: true,
      data: category,
      message: 'Bill category retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/bills/categories/:id] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bill category'
    });
  }
});

// Get upcoming bills
router.get('/upcoming', authenticate, (req, res) => {
  console.log('[GET /api/bills/upcoming] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.upcomingBills,
      message: 'Upcoming bills retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/bills/upcoming] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve upcoming bills'
    });
  }
});

// Get upcoming bills by user ID
router.get('/upcoming/:userId', authenticate, (req, res) => {
  console.log('[GET /api/bills/upcoming/:userId] Request received, User ID:', req.params.userId);
  try {
    // In a real app, you would filter bills by user ID
    res.json({
      success: true,
      data: hardcodedData.upcomingBills,
      message: 'User upcoming bills retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/bills/upcoming/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user upcoming bills'
    });
  }
});

// Get bill providers by category
router.get('/providers/:category', (req, res) => {
  console.log('[GET /api/bills/providers/:category] Request received, Category:', req.params.category);
  try {
    const providers = hardcodedData.billProviders[req.params.category] || [];
    res.json({
      success: true,
      data: providers,
      message: 'Bill providers retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/bills/providers/:category] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bill providers'
    });
  }
});

// Get all bill providers
router.get('/providers', (req, res) => {
  console.log('[GET /api/bills/providers] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.billProviders,
      message: 'All bill providers retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/bills/providers] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bill providers'
    });
  }
});

// Pay a bill (simulated)
router.post('/pay', authenticate, (req, res) => {
  console.log('[POST /api/bills/pay] Request received');
  console.log('[POST /api/bills/pay] Request body:', req.body);
  
  const { billId, amount, provider, category } = req.body;
  
  if (!billId || !amount || !provider) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: billId, amount, provider'
    });
  }
  
  try {
    // Simulate payment processing
    const paymentResult = {
      id: Date.now(),
      billId,
      amount,
      provider,
      category,
      status: 'completed',
      transactionId: `TXN${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: paymentResult,
      message: 'Bill payment completed successfully'
    });
  } catch (error) {
    console.error('[POST /api/bills/pay] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bill payment'
    });
  }
});

// Get payment history
router.get('/payment-history', authenticate, (req, res) => {
  console.log('[GET /api/bills/payment-history] Request received');
  try {
    // Simulate payment history
    const paymentHistory = [
      {
        id: 1,
        billTitle: 'Electricity Bill',
        provider: 'City Power',
        amount: 'cNGN 89.50',
        status: 'completed',
        date: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        billTitle: 'Internet Bill',
        provider: 'FastNet',
        amount: 'cNGN 45.00',
        status: 'completed',
        date: '2024-01-10T14:20:00Z'
      }
    ];
    
    res.json({
      success: true,
      data: paymentHistory,
      message: 'Payment history retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/bills/payment-history] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment history'
    });
  }
});

// Get payment history by user ID
router.get('/payment-history/:userId', authenticate, (req, res) => {
  console.log('[GET /api/bills/payment-history/:userId] Request received, User ID:', req.params.userId);
  try {
    // Simulate user-specific payment history
    const paymentHistory = [
      {
        id: 1,
        billTitle: 'Electricity Bill',
        provider: 'City Power',
        amount: 'cNGN 89.50',
        status: 'completed',
        date: '2024-01-15T10:30:00Z',
        userId: req.params.userId
      }
    ];
    
    res.json({
      success: true,
      data: paymentHistory,
      message: 'User payment history retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/bills/payment-history/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user payment history'
    });
  }
});

export default router; 