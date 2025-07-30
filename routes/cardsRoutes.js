import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import hardcodedData from '../hardcoded-data.json' assert { type: 'json' };

const router = express.Router();

// Get all cards for a user
router.get('/', authenticate, (req, res) => {
  console.log('[GET /api/cards] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.cards.walletCards,
      message: 'Cards retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/cards] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cards'
    });
  }
});

// Get cards by user ID
router.get('/:userId', authenticate, (req, res) => {
  console.log('[GET /api/cards/:userId] Request received, User ID:', req.params.userId);
  try {
    res.json({
      success: true,
      data: hardcodedData.cards.walletCards,
      message: 'User cards retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/cards/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user cards'
    });
  }
});

// Create a new card
router.post('/create', authenticate, (req, res) => {
  console.log('[POST /api/cards/create] Request received');
  console.log('[POST /api/cards/create] Request body:', req.body);
  
  const { cardholderName, cardType } = req.body;
  
  if (!cardholderName || !cardType) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: cardholderName, cardType'
    });
  }
  
  try {
    // Simulate card creation
    const newCard = {
      id: Date.now(),
      type: cardType === 'debit' ? 'Debit Card' : 'Credit Card',
      number: `•••• •••• •••• ${Math.floor(Math.random() * 9000) + 1000}`,
      balance: '$0.00',
      color: cardType === 'debit' ? ['#2563EB', '#1D4ED8'] : ['#059669', '#047857'],
      cardholderName,
      cardType,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: newCard,
      message: 'Card created successfully'
    });
  } catch (error) {
    console.error('[POST /api/cards/create] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create card'
    });
  }
});

// Create virtual card
router.post('/create/virtual', authenticate, (req, res) => {
  console.log('[POST /api/cards/create/virtual] Request received');
  console.log('[POST /api/cards/create/virtual] Request body:', req.body);
  
  const { cardholderName } = req.body;
  
  if (!cardholderName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: cardholderName'
    });
  }
  
  try {
    // Simulate virtual card creation
    const virtualCard = {
      ...hardcodedData.cards.virtualCard,
      cardHolderName: cardholderName,
      id: Date.now(),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: virtualCard,
      message: 'Virtual card created successfully'
    });
  } catch (error) {
    console.error('[POST /api/cards/create/virtual] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create virtual card'
    });
  }
});

// Get card details
router.get('/:cardId/details', authenticate, (req, res) => {
  console.log('[GET /api/cards/:cardId/details] Request received, Card ID:', req.params.cardId);
  try {
    const cardDetails = {
      ...hardcodedData.cardDetails,
      cardId: req.params.cardId,
      lastUsed: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: cardDetails,
      message: 'Card details retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/cards/:cardId/details] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve card details'
    });
  }
});

// Update card details
router.put('/:cardId/details', authenticate, (req, res) => {
  console.log('[PUT /api/cards/:cardId/details] Request received, Card ID:', req.params.cardId);
  console.log('[PUT /api/cards/:cardId/details] Request body:', req.body);
  
  try {
    const updatedDetails = {
      ...hardcodedData.cardDetails,
      ...req.body,
      cardId: req.params.cardId,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedDetails,
      message: 'Card details updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/cards/:cardId/details] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update card details'
    });
  }
});

// Get card transactions
router.get('/:cardId/transactions', authenticate, (req, res) => {
  console.log('[GET /api/cards/:cardId/transactions] Request received, Card ID:', req.params.cardId);
  try {
    // Simulate card transactions
    const transactions = [
      {
        id: 1,
        type: 'purchase',
        merchant: 'Amazon',
        amount: -50.00,
        currency: 'USD',
        date: '2024-01-15T10:30:00Z',
        status: 'completed'
      },
      {
        id: 2,
        type: 'refund',
        merchant: 'Netflix',
        amount: 15.99,
        currency: 'USD',
        date: '2024-01-14T14:20:00Z',
        status: 'completed'
      }
    ];
    
    res.json({
      success: true,
      data: transactions,
      message: 'Card transactions retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/cards/:cardId/transactions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve card transactions'
    });
  }
});

// Freeze card
router.post('/:cardId/freeze', authenticate, (req, res) => {
  console.log('[POST /api/cards/:cardId/freeze] Request received, Card ID:', req.params.cardId);
  try {
    res.json({
      success: true,
      data: {
        cardId: req.params.cardId,
        status: 'frozen',
        frozenAt: new Date().toISOString()
      },
      message: 'Card frozen successfully'
    });
  } catch (error) {
    console.error('[POST /api/cards/:cardId/freeze] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to freeze card'
    });
  }
});

// Unfreeze card
router.post('/:cardId/unfreeze', authenticate, (req, res) => {
  console.log('[POST /api/cards/:cardId/unfreeze] Request received, Card ID:', req.params.cardId);
  try {
    res.json({
      success: true,
      data: {
        cardId: req.params.cardId,
        status: 'active',
        unfrozenAt: new Date().toISOString()
      },
      message: 'Card unfrozen successfully'
    });
  } catch (error) {
    console.error('[POST /api/cards/:cardId/unfreeze] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unfreeze card'
    });
  }
});

// Block card
router.post('/:cardId/block', authenticate, (req, res) => {
  console.log('[POST /api/cards/:cardId/block] Request received, Card ID:', req.params.cardId);
  try {
    res.json({
      success: true,
      data: {
        cardId: req.params.cardId,
        status: 'blocked',
        blockedAt: new Date().toISOString()
      },
      message: 'Card blocked successfully'
    });
  } catch (error) {
    console.error('[POST /api/cards/:cardId/block] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to block card'
    });
  }
});

// Unblock card
router.post('/:cardId/unblock', authenticate, (req, res) => {
  console.log('[POST /api/cards/:cardId/unblock] Request received, Card ID:', req.params.cardId);
  try {
    res.json({
      success: true,
      data: {
        cardId: req.params.cardId,
        status: 'active',
        unblockedAt: new Date().toISOString()
      },
      message: 'Card unblocked successfully'
    });
  } catch (error) {
    console.error('[POST /api/cards/:cardId/unblock] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unblock card'
    });
  }
});

// Get card limits
router.get('/:cardId/limits', authenticate, (req, res) => {
  console.log('[GET /api/cards/:cardId/limits] Request received, Card ID:', req.params.cardId);
  try {
    const limits = {
      dailyLimit: 1000,
      monthlyLimit: 5000,
      transactionLimit: 500,
      currency: 'USD'
    };
    
    res.json({
      success: true,
      data: limits,
      message: 'Card limits retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/cards/:cardId/limits] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve card limits'
    });
  }
});

// Update card limits
router.put('/:cardId/limits', authenticate, (req, res) => {
  console.log('[PUT /api/cards/:cardId/limits] Request received, Card ID:', req.params.cardId);
  console.log('[PUT /api/cards/:cardId/limits] Request body:', req.body);
  
  try {
    const updatedLimits = {
      ...req.body,
      cardId: req.params.cardId,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedLimits,
      message: 'Card limits updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/cards/:cardId/limits] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update card limits'
    });
  }
});

// Get card types
router.get('/types', (req, res) => {
  console.log('[GET /api/cards/types] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.cardTypes,
      message: 'Card types retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/cards/types] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve card types'
    });
  }
});

// Get available card types
router.get('/types/available', (req, res) => {
  console.log('[GET /api/cards/types/available] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.cardTypes,
      message: 'Available card types retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/cards/types/available] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve available card types'
    });
  }
});

// Validate card name
router.post('/validate/name', (req, res) => {
  console.log('[POST /api/cards/validate/name] Request received');
  console.log('[POST /api/cards/validate/name] Request body:', req.body);
  
  const { cardholderName } = req.body;
  
  if (!cardholderName) {
    return res.status(400).json({
      success: false,
      error: 'Cardholder name is required'
    });
  }
  
  try {
    const isValid = cardholderName.length >= 2 && /^[a-zA-Z\s]+$/.test(cardholderName);
    
    res.json({
      success: true,
      data: {
        isValid,
        cardholderName
      },
      message: isValid ? 'Cardholder name is valid' : 'Cardholder name is invalid'
    });
  } catch (error) {
    console.error('[POST /api/cards/validate/name] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate cardholder name'
    });
  }
});

// Validate card type
router.post('/validate/type', (req, res) => {
  console.log('[POST /api/cards/validate/type] Request received');
  console.log('[POST /api/cards/validate/type] Request body:', req.body);
  
  const { cardType } = req.body;
  
  if (!cardType) {
    return res.status(400).json({
      success: false,
      error: 'Card type is required'
    });
  }
  
  try {
    const validTypes = hardcodedData.cardTypes.map(type => type.value);
    const isValid = validTypes.includes(cardType);
    
    res.json({
      success: true,
      data: {
        isValid,
        cardType,
        validTypes
      },
      message: isValid ? 'Card type is valid' : 'Card type is invalid'
    });
  } catch (error) {
    console.error('[POST /api/cards/validate/type] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate card type'
    });
  }
});

export default router; 