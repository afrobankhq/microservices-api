import express from 'express';
import {
  getUserDashboard,
  getUserInfo,
  getUserWallet,
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Existing route
router.get('/dashboard/:phoneNumber', authenticate, getUserDashboard);

// ✅ New routes
router.get('/user-info/:phoneNumber', authenticate, getUserInfo);
router.get('/user-wallet/:phoneNumber', authenticate, getUserWallet);

export default router;
