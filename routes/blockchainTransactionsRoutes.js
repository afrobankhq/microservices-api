// routes/transactionsRoutes.js

import express from 'express';
import { getAllTransactions } from '../controllers/blockchainTransactionsController.js';
import { getTransactionsByAddress } from '../controllers/blockchainTransactionsController.js';


const router = express.Router();

// GET /api/blockchain-transactions
router.get('/', getAllTransactions);
router.get('/:address', getTransactionsByAddress); 


export default router;
