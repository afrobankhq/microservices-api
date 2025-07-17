// routes/cardsRoutes.js
import express from 'express';
import { createCardForUser } from '../controllers/cardsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', verifyToken, createCardForUser);

export default router;
