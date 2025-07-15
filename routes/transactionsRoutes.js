// routes/transactionsRoutes.js

import express from 'express';
import { getAllTransactions } from '../controllers/transactionsController.js';
import { getTransactionsByAddress } from '../controllers/transactionsController.js';


const router = express.Router();

// GET /api/transactions
router.get('/', getAllTransactions);
router.get('/:address', getTransactionsByAddress); 


export default router;
