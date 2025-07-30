import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import hardcodedData from '../hardcoded-data.json' assert { type: 'json' };

const router = express.Router();

// Get transaction filters
router.get('/filters', (req, res) => {
  console.log('[GET /api/transactions/filters] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.transactionFilters,
      message: 'Transaction filters retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/filters] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction filters'
    });
  }
});

// Get transaction types
router.get('/types', (req, res) => {
  console.log('[GET /api/transactions/types] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.transactionTypes,
      message: 'Transaction types retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/types] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction types'
    });
  }
});

// Get transaction history
router.get('/history', authenticate, (req, res) => {
  console.log('[GET /api/transactions/history] Request received');
  try {
    const transactions = [
      {
        id: 1,
        type: 'income',
        title: 'Salary',
        amount: 5000.00,
        currency: 'USD',
        date: '2024-01-15T10:30:00Z',
        status: 'completed',
        icon: hardcodedData.transactionTypes.income.icon,
        color: hardcodedData.transactionTypes.income.color
      },
      {
        id: 2,
        type: 'expense',
        title: 'Grocery Shopping',
        amount: -150.50,
        currency: 'USD',
        date: '2024-01-14T14:20:00Z',
        status: 'completed',
        icon: hardcodedData.transactionTypes.expense.icon,
        color: hardcodedData.transactionTypes.expense.color
      },
      {
        id: 3,
        type: 'transfer',
        title: 'Transfer to John',
        amount: -500.00,
        currency: 'USD',
        date: '2024-01-13T09:15:00Z',
        status: 'completed',
        icon: hardcodedData.transactionTypes.transfer.icon,
        color: hardcodedData.transactionTypes.transfer.color
      }
    ];
    
    res.json({
      success: true,
      data: transactions,
      message: 'Transaction history retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/history] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction history'
    });
  }
});

// Get transaction history by user ID
router.get('/history/:userId', authenticate, (req, res) => {
  console.log('[GET /api/transactions/history/:userId] Request received, User ID:', req.params.userId);
  try {
    const transactions = [
      {
        id: 1,
        type: 'income',
        title: 'Salary',
        amount: 5000.00,
        currency: 'USD',
        date: '2024-01-15T10:30:00Z',
        status: 'completed',
        userId: req.params.userId,
        icon: hardcodedData.transactionTypes.income.icon,
        color: hardcodedData.transactionTypes.income.color
      },
      {
        id: 2,
        type: 'expense',
        title: 'Grocery Shopping',
        amount: -150.50,
        currency: 'USD',
        date: '2024-01-14T14:20:00Z',
        status: 'completed',
        userId: req.params.userId,
        icon: hardcodedData.transactionTypes.expense.icon,
        color: hardcodedData.transactionTypes.expense.color
      }
    ];
    
    res.json({
      success: true,
      data: transactions,
      message: 'User transaction history retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/history/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user transaction history'
    });
  }
});

// Get transaction history with filters
router.get('/history/filtered', authenticate, (req, res) => {
  console.log('[GET /api/transactions/history/filtered] Request received');
  console.log('[GET /api/transactions/history/filtered] Query params:', req.query);
  
  const { type, period, category } = req.query;
  
  try {
    let transactions = [
      {
        id: 1,
        type: 'income',
        title: 'Salary',
        amount: 5000.00,
        currency: 'USD',
        date: '2024-01-15T10:30:00Z',
        status: 'completed',
        category: 'salary',
        icon: hardcodedData.transactionTypes.income.icon,
        color: hardcodedData.transactionTypes.income.color
      },
      {
        id: 2,
        type: 'expense',
        title: 'Grocery Shopping',
        amount: -150.50,
        currency: 'USD',
        date: '2024-01-14T14:20:00Z',
        status: 'completed',
        category: 'food',
        icon: hardcodedData.transactionTypes.expense.icon,
        color: hardcodedData.transactionTypes.expense.color
      },
      {
        id: 3,
        type: 'transfer',
        title: 'Transfer to John',
        amount: -500.00,
        currency: 'USD',
        date: '2024-01-13T09:15:00Z',
        status: 'completed',
        category: 'transfer',
        icon: hardcodedData.transactionTypes.transfer.icon,
        color: hardcodedData.transactionTypes.transfer.color
      }
    ];
    
    // Apply filters
    if (type && type !== 'All') {
      transactions = transactions.filter(t => t.type === type.toLowerCase());
    }
    
    if (category && category !== 'All') {
      transactions = transactions.filter(t => t.category === category.toLowerCase());
    }
    
    res.json({
      success: true,
      data: transactions,
      message: 'Filtered transaction history retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/history/filtered] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve filtered transaction history'
    });
  }
});

// Get transaction summary
router.get('/summary', authenticate, (req, res) => {
  console.log('[GET /api/transactions/summary] Request received');
  try {
    const summary = {
      totalIncome: 5000.00,
      totalExpense: 650.50,
      netAmount: 4349.50,
      currency: 'USD',
      period: 'This Month',
      breakdown: {
        income: [
          { category: 'salary', amount: 5000.00, count: 1 },
          { category: 'bonus', amount: 0.00, count: 0 }
        ],
        expense: [
          { category: 'food', amount: 150.50, count: 1 },
          { category: 'transport', amount: 500.00, count: 1 }
        ]
      }
    };
    
    res.json({
      success: true,
      data: summary,
      message: 'Transaction summary retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/summary] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction summary'
    });
  }
});

// Get transaction summary by user ID
router.get('/summary/:userId', authenticate, (req, res) => {
  console.log('[GET /api/transactions/summary/:userId] Request received, User ID:', req.params.userId);
  try {
    const summary = {
      totalIncome: 5000.00,
      totalExpense: 650.50,
      netAmount: 4349.50,
      currency: 'USD',
      period: 'This Month',
      userId: req.params.userId,
      breakdown: {
        income: [
          { category: 'salary', amount: 5000.00, count: 1 },
          { category: 'bonus', amount: 0.00, count: 0 }
        ],
        expense: [
          { category: 'food', amount: 150.50, count: 1 },
          { category: 'transport', amount: 500.00, count: 1 }
        ]
      }
    };
    
    res.json({
      success: true,
      data: summary,
      message: 'User transaction summary retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/summary/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user transaction summary'
    });
  }
});

// Get transaction by ID
router.get('/:transactionId', authenticate, (req, res) => {
  console.log('[GET /api/transactions/:transactionId] Request received, Transaction ID:', req.params.transactionId);
  try {
    const transaction = {
      id: req.params.transactionId,
      type: 'expense',
      title: 'Grocery Shopping',
      description: 'Purchase from Walmart',
      amount: -150.50,
      currency: 'USD',
      date: '2024-01-14T14:20:00Z',
      status: 'completed',
      category: 'food',
      merchant: 'Walmart',
      location: 'Lagos, Nigeria',
      icon: hardcodedData.transactionTypes.expense.icon,
      color: hardcodedData.transactionTypes.expense.color
    };
    
    res.json({
      success: true,
      data: transaction,
      message: 'Transaction details retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/:transactionId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction details'
    });
  }
});

// Create new transaction
router.post('/', authenticate, (req, res) => {
  console.log('[POST /api/transactions] Request received');
  console.log('[POST /api/transactions] Request body:', req.body);
  
  const { type, title, amount, currency, category, description } = req.body;
  
  if (!type || !title || !amount || !currency) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: type, title, amount, currency'
    });
  }
  
  try {
    const newTransaction = {
      id: Date.now(),
      type,
      title,
      amount: parseFloat(amount),
      currency,
      category,
      description,
      date: new Date().toISOString(),
      status: 'completed',
      icon: hardcodedData.transactionTypes[type]?.icon,
      color: hardcodedData.transactionTypes[type]?.color
    };
    
    res.json({
      success: true,
      data: newTransaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    console.error('[POST /api/transactions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction'
    });
  }
});

// Update transaction
router.put('/:transactionId', authenticate, (req, res) => {
  console.log('[PUT /api/transactions/:transactionId] Request received, Transaction ID:', req.params.transactionId);
  console.log('[PUT /api/transactions/:transactionId] Request body:', req.body);
  
  try {
    const updatedTransaction = {
      id: req.params.transactionId,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedTransaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/transactions/:transactionId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction'
    });
  }
});

// Delete transaction
router.delete('/:transactionId', authenticate, (req, res) => {
  console.log('[DELETE /api/transactions/:transactionId] Request received, Transaction ID:', req.params.transactionId);
  try {
    res.json({
      success: true,
      data: {
        id: req.params.transactionId,
        deletedAt: new Date().toISOString()
      },
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE /api/transactions/:transactionId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction'
    });
  }
});

// Get transaction categories
router.get('/categories', (req, res) => {
  console.log('[GET /api/transactions/categories] Request received');
  try {
    const categories = [
      { id: 1, name: 'Food', icon: 'Utensils', color: '#F59E0B' },
      { id: 2, name: 'Transport', icon: 'Car', color: '#3B82F6' },
      { id: 3, name: 'Shopping', icon: 'ShoppingBag', color: '#10B981' },
      { id: 4, name: 'Bills', icon: 'FileText', color: '#EF4444' },
      { id: 5, name: 'Entertainment', icon: 'Music', color: '#8B5CF6' },
      { id: 6, name: 'Others', icon: 'MoreHorizontal', color: '#6B7280' }
    ];
    
    res.json({
      success: true,
      data: categories,
      message: 'Transaction categories retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/categories] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction categories'
    });
  }
});

// Get transaction periods
router.get('/periods', (req, res) => {
  console.log('[GET /api/transactions/periods] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.transactionSummary.periods,
      message: 'Transaction periods retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/transactions/periods] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transaction periods'
    });
  }
});

// Export transaction history
router.post('/export', authenticate, (req, res) => {
  console.log('[POST /api/transactions/export] Request received');
  console.log('[POST /api/transactions/export] Request body:', req.body);
  
  const { format, period, type } = req.body;
  
  if (!format) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: format'
    });
  }
  
  try {
    const exportResult = {
      id: Date.now(),
      format,
      period,
      type,
      status: 'completed',
      downloadUrl: `https://api.example.com/exports/${Date.now()}.${format}`,
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: exportResult,
      message: 'Transaction history exported successfully'
    });
  } catch (error) {
    console.error('[POST /api/transactions/export] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export transaction history'
    });
  }
});

export default router; 