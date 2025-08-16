import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import cardsController from '../controllers/cardsController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ========================================
// CARD MANAGEMENT ENDPOINTS
// ========================================

// Get all cards for a customer
// GET /api/cards?customerId=123&page=1&limit=10
router.get('/', cardsController.getAllCards);

// Get a specific card by ID
// GET /api/cards/:cardId
router.get('/:cardId', cardsController.getCard);

// Create a new card
// POST /api/cards
router.post('/', cardsController.createCard);

// Update card details
// PUT /api/cards/:cardId
router.put('/:cardId', cardsController.updateCard);

// ========================================
// CARD FUNDING & WITHDRAWAL ENDPOINTS
// ========================================

// Fund a card
// POST /api/cards/:cardId/fund
router.post('/:cardId/fund', cardsController.fundCard);

// Withdraw from a card
// POST /api/cards/:cardId/withdraw
router.post('/:cardId/withdraw', cardsController.withdrawFromCard);

// ========================================
// CARD STATUS MANAGEMENT ENDPOINTS
// ========================================

// Freeze a card
// POST /api/cards/:cardId/freeze
router.post('/:cardId/freeze', cardsController.freezeCard);

// Unfreeze a card
// POST /api/cards/:cardId/unfreeze
router.post('/:cardId/unfreeze', cardsController.unfreezeCard);

// Terminate a card
// POST /api/cards/:cardId/terminate
router.post('/:cardId/terminate', cardsController.terminateCard);

// ========================================
// CARD TRANSACTION ENDPOINTS
// ========================================

// Get all transactions for a card
// GET /api/cards/:cardId/transactions?page=1&limit=10&start_date=2024-01-01&end_date=2024-01-31&type=purchase
router.get('/:cardId/transactions', cardsController.getCardTransactions);

// Get a specific transaction
// GET /api/cards/:cardId/transactions/:transactionId
router.get('/:cardId/transactions/:transactionId', cardsController.getTransaction);

// ========================================
// CARD INFORMATION ENDPOINTS
// ========================================

// Get card balance
// GET /api/cards/:cardId/balance
router.get('/:cardId/balance', cardsController.getCardBalance);

// ========================================
// VALIDATION ENDPOINTS
// ========================================

// Validate card creation request
// POST /api/cards/validate
router.post('/validate', cardsController.validateCardRequest);

// ========================================
// LEGACY ENDPOINTS (for backward compatibility)
// ========================================

// Legacy: Get cards by user ID (redirects to getAllCards)
router.get('/user/:userId', (req, res) => {
  req.query.customerId = req.params.userId;
  return cardsController.getAllCards(req, res);
});

// Legacy: Create card with old endpoint
router.post('/create', (req, res) => {
  return cardsController.createCard(req, res);
});

// Legacy: Create virtual card
router.post('/create/virtual', (req, res) => {
  req.body.card_type = 'virtual';
  return cardsController.createCard(req, res);
});

// Legacy: Get card details
router.get('/:cardId/details', (req, res) => {
  return cardsController.getCard(req, res);
});

// Legacy: Update card details
router.put('/:cardId/details', (req, res) => {
  return cardsController.updateCard(req, res);
});

// Legacy: Freeze card (alias for freeze)
router.post('/:cardId/freeze', cardsController.freezeCard);

// Legacy: Unfreeze card (alias for unfreeze)
router.post('/:cardId/unfreeze', cardsController.unfreezeCard);

// Legacy: Block card (alias for freeze)
router.post('/:cardId/block', (req, res) => {
  req.body.reason = req.body.reason || 'Card blocked by user';
  return cardsController.freezeCard(req, res);
});

// Legacy: Unblock card (alias for unfreeze)
router.post('/:cardId/unblock', (req, res) => {
  return cardsController.unfreezeCard(req, res);
});

// Legacy: Get card limits (placeholder - not in Swervpay API)
router.get('/:cardId/limits', (req, res) => {
  res.json({
    success: true,
    data: {
      dailyLimit: 1000,
      monthlyLimit: 5000,
      transactionLimit: 500,
      currency: 'USD'
    },
    message: 'Card limits retrieved successfully'
  });
});

// Legacy: Update card limits (placeholder - not in Swervpay API)
router.put('/:cardId/limits', (req, res) => {
  res.json({
    success: true,
    data: {
      ...req.body,
      cardId: req.params.cardId,
      updatedAt: new Date().toISOString()
    },
    message: 'Card limits updated successfully'
  });
});

// Legacy: Get card types (placeholder - not in Swervpay API)
router.get('/types', (req, res) => {
  res.json({
    success: true,
    data: [
      { value: 'physical', label: 'Physical Card', description: 'Traditional plastic card' },
      { value: 'virtual', label: 'Virtual Card', description: 'Digital card for online use' }
    ],
    message: 'Card types retrieved successfully'
  });
});

// Legacy: Get available card types (placeholder - not in Swervpay API)
router.get('/types/available', (req, res) => {
  res.json({
    success: true,
    data: [
      { value: 'physical', label: 'Physical Card', description: 'Traditional plastic card' },
      { value: 'virtual', label: 'Virtual Card', description: 'Digital card for online use' }
    ],
    message: 'Available card types retrieved successfully'
  });
});

// Legacy: Validate card name
router.post('/validate/name', (req, res) => {
  const { cardholderName } = req.body;
  
  if (!cardholderName) {
    return res.status(400).json({
      success: false,
      error: 'Cardholder name is required'
    });
  }
  
  const isValid = cardholderName.length >= 2 && /^[a-zA-Z\s]+$/.test(cardholderName);
  
  res.json({
    success: true,
    data: {
      isValid,
      cardholderName
    },
    message: isValid ? 'Cardholder name is valid' : 'Cardholder name is invalid'
  });
});

// Legacy: Validate card type
router.post('/validate/type', (req, res) => {
  const { cardType } = req.body;
  
  if (!cardType) {
    return res.status(400).json({
      success: false,
      error: 'Card type is required'
    });
  }
  
  const validTypes = ['physical', 'virtual'];
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
});

export default router; 