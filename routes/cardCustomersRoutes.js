import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import cardCustomersController from '../controllers/cardCustomersController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ========================================
// CUSTOMER MANAGEMENT ENDPOINTS
// ========================================

// Get all customers
// GET /api/card-customers?page=1&limit=10&status=active&search=john
router.get('/', cardCustomersController.getAllCustomers);

// Get a specific customer by ID
// GET /api/card-customers/:customerId
router.get('/:customerId', cardCustomersController.getCustomer);

// Create a new customer
// POST /api/card-customers
router.post('/', cardCustomersController.createCustomer);

// Update customer details
// PUT /api/card-customers/:customerId
router.put('/:customerId', cardCustomersController.updateCustomer);

// ========================================
// KYC (Know Your Customer) ENDPOINTS
// ========================================

// Submit KYC information
// POST /api/card-customers/:customerId/kyc
router.post('/:customerId/kyc', cardCustomersController.submitKYC);

// Get KYC status
// GET /api/card-customers/:customerId/kyc
router.get('/:customerId/kyc', cardCustomersController.getKYCStatus);

// ========================================
// BLACKLIST MANAGEMENT ENDPOINTS
// ========================================

// Blacklist a customer
// POST /api/card-customers/:customerId/blacklist
router.post('/:customerId/blacklist', cardCustomersController.blacklistCustomer);

// Remove customer from blacklist
// POST /api/card-customers/:customerId/blacklist/remove
router.post('/:customerId/blacklist/remove', cardCustomersController.removeFromBlacklist);

// Get customer blacklist status
// GET /api/card-customers/:customerId/blacklist
router.get('/:customerId/blacklist', cardCustomersController.getBlacklistStatus);

// ========================================
// VALIDATION & UTILITY ENDPOINTS
// ========================================

// Validate customer creation request
// POST /api/card-customers/validate
router.post('/validate', cardCustomersController.validateCustomerRequest);

// Search customers
// GET /api/card-customers/search?query=john&page=1&limit=10&status=active
router.get('/search', cardCustomersController.searchCustomers);

// Get customer statistics
// GET /api/card-customers/stats?period=month
router.get('/stats', cardCustomersController.getCustomerStats);

// ========================================
// LEGACY ENDPOINTS (for backward compatibility)
// ========================================

// Legacy: Get customer by user ID (alias for getCustomer)
router.get('/user/:userId', (req, res) => {
  req.params.customerId = req.params.userId;
  return cardCustomersController.getCustomer(req, res);
});

// Legacy: Create customer with old endpoint
router.post('/create', (req, res) => {
  return cardCustomersController.createCustomer(req, res);
});

// Legacy: Update customer with old endpoint
router.put('/user/:userId', (req, res) => {
  req.params.customerId = req.params.userId;
  return cardCustomersController.updateCustomer(req, res);
});

// Legacy: Get customer profile
router.get('/:customerId/profile', (req, res) => {
  return cardCustomersController.getCustomer(req, res);
});

// Legacy: Update customer profile
router.put('/:customerId/profile', (req, res) => {
  return cardCustomersController.updateCustomer(req, res);
});

// Legacy: Verify customer identity
router.post('/:customerId/verify', (req, res) => {
  // This is an alias for KYC submission
  return cardCustomersController.submitKYC(req, res);
});

// Legacy: Get customer verification status
router.get('/:customerId/verify', (req, res) => {
  // This is an alias for KYC status
  return cardCustomersController.getKYCStatus(req, res);
});

// Legacy: Block customer (alias for blacklist)
router.post('/:customerId/block', (req, res) => {
  req.body.reason = req.body.reason || 'Customer blocked by admin';
  return cardCustomersController.blacklistCustomer(req, res);
});

// Legacy: Unblock customer (alias for remove from blacklist)
router.post('/:customerId/unblock', (req, res) => {
  req.body.reason = req.body.reason || 'Customer unblocked by admin';
  return cardCustomersController.removeFromBlacklist(req, res);
});

// Legacy: Get customer block status (alias for blacklist status)
router.get('/:customerId/block', (req, res) => {
  return cardCustomersController.getBlacklistStatus(req, res);
});

// Legacy: Get customer details (alias for getCustomer)
router.get('/:customerId/details', (req, res) => {
  return cardCustomersController.getCustomer(req, res);
});

// Legacy: Update customer details (alias for updateCustomer)
router.put('/:customerId/details', (req, res) => {
  return cardCustomersController.updateCustomer(req, res);
});

// Legacy: Get customer list (alias for getAllCustomers)
router.get('/list', (req, res) => {
  return cardCustomersController.getAllCustomers(req, res);
});

// Legacy: Get customer count
router.get('/count', (req, res) => {
  // This would typically get total count, but we'll redirect to stats
  req.query.period = 'all';
  return cardCustomersController.getCustomerStats(req, res);
});

export default router;
