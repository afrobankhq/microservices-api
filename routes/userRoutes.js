import express from 'express';
import {
  getUserDashboard,
  getUserInfo,
  getUserWallet,
  saveUserInfo, // ✅ added
} from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard/:phoneNumber', authenticate, getUserDashboard);
router.get('/user-info/:phoneNumber', authenticate, getUserInfo);
router.post('/user-info/:phoneNumber', authenticate, saveUserInfo); // ✅ added POST route
router.get('/user-wallet/:phoneNumber', authenticate, getUserWallet);

export default router;
