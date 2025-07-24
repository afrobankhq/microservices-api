// routes/cardRoutes.js
import express from 'express';
import {
  // Customer routes
  createCustomer,
  getCustomer,

  // Card routes
  createCard,
  getCard,
  getAllCards,
  fundCard,
  withdrawFromCard,
  freezeCard,
  unfreezeCard,
  terminateCard,
  getCardTransactions
} from '../controllers/cardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ===== CUSTOMER ROUTES =====

/**
 * Create a new customer in Swervpay
 * POST /api/card/customer
 */
router.post('/customer', authenticate, createCustomer);

/**
 * Get customer details
 * GET /api/card/customer
 */
router.get('/customer', authenticate, getCustomer);

// ===== CARD ROUTES =====

/**
 * Create a new card
 * POST /api/card
 */
router.post('/create', authenticate, createCard);

/**
 * Get all cards for authenticated user
 * GET /api/card
 */
router.get('/all', authenticate, getAllCards);

/**
 * Get specific card details
 * GET /api/card/:cardId
 */
router.get('/:cardId', authenticate, getCard);

/**
 * Fund a card
 * POST /api/card/:cardId/fund
 */
router.post('/:cardId/fund', authenticate, fundCard);

/**
 * Withdraw from card
 * POST /api/card/:cardId/withdraw
 */
router.post('/:cardId/withdraw', authenticate, withdrawFromCard);

/**
 * Freeze a card
 * POST /api/card/:cardId/freeze
 */
router.post('/:cardId/freeze', authenticate, freezeCard);

/**
 * Unfreeze a card
 * POST /api/card/:cardId/unfreeze
 */
router.post('/:cardId/unfreeze', authenticate, unfreezeCard);

/**
 * Terminate a card
 * POST /api/card/:cardId/terminate
 */
router.post('/:cardId/terminate', authenticate, terminateCard);

/**
 * Get card transactions
 * GET /api/card/:cardId/transactions
 */
router.get('/:cardId/transactions', authenticate, getCardTransactions);

export default router;