import express from 'express';
import { getUserDashboard } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard/:phoneNumber', authenticate, getUserDashboard);

export default router;
