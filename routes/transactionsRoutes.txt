// routes/transactionsRoutes.js

import express from 'express';
import { getAllTransactions } from '../controllers/transactionsController.js';

const router = express.Router();

// GET /api/transactions
router.get('/', getAllTransactions);

export default router;
