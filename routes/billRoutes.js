// routes/billRoutes.js
import express from 'express';
import { fetchBillCategories, fetchBillCategoryItems, fetchBillCategoryList, payBill } from '../controllers/billController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/categories', fetchBillCategories);
router.get('/categories/:categoryId/items/:itemId', fetchBillCategoryItems);
router.get('/categories/:categoryId', fetchBillCategoryList);

router.post('/pay', payBill);

export default router;