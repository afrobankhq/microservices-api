// routes/billRoutes.js
import express from 'express';
import { 
  fetchBillCategories, 
  fetchBillCategoryItems, 
  fetchBillCategoryList, 
  validateBillCustomer,
  payBill 
} from '../controllers/billController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all bill categories
router.get('/categories', fetchBillCategories);

// Get items in a specific bill category
router.get('/categories/:categoryId', fetchBillCategoryList);

// Get specific items for a category and item ID
router.get('/categories/:categoryId/items/:itemId', fetchBillCategoryItems);

// Validate customer for a biller
router.post('/validate-customer', validateBillCustomer);

// Create a bill payment
router.post('/pay', payBill);

export default router;