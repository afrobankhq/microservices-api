import express from 'express';
import {
  registerUser,
  loginUser,
  getUser,
  changePin,
  resetPin,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


// Step 1: Send OTP
router.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    // Generate a new OTP
    const otp = generateOTP();
    
    // Store OTP with phone number and expiration (5 minutes)
    const expirationTime = Date.now() + (5 * 60 * 1000); // 5 minutes
    otpStore.set(phoneNumber, { otp, expiresAt: expirationTime });
    
    // Simulate OTP send
    console.log(`OTP ${otp} sent to: ${phoneNumber}`);
    res.status(200).json({
      message: 'OTP sent successfully',
      otp: otp, // In production, don't send OTP in response
      phoneNumber,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Step 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    return res.status(400).json({ error: 'Phone number and OTP code are required' });
  }

  try {
    const storedOTPData = otpStore.get(phoneNumber);
    
    if (!storedOTPData) {
      return res.status(400).json({ error: 'No OTP found for this phone number' });
    }
    
    // Check if OTP has expired
    if (Date.now() > storedOTPData.expiresAt) {
      otpStore.delete(phoneNumber); // Clean up expired OTP
      return res.status(400).json({ error: 'OTP has expired' });
    }
    
    if (code === storedOTPData.otp) {
      console.log('OTP verified for:', phoneNumber);
      // Remove OTP after successful verification
      otpStore.delete(phoneNumber);
      res.status(200).json({
        message: 'OTP verified successfully',
        phoneNumber,
        verified: true,
      });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('OTP verification failed:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Step 3: Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Get User Profile
router.get('/user', authenticate, getUser);

// Change PIN
router.put('/change-pin', authenticate, changePin);

// Reset PIN
router.post('/reset-pin', resetPin);

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    // Generate a new OTP
    const otp = generateOTP();
    
    // Store new OTP with phone number and expiration (5 minutes)
    const expirationTime = Date.now() + (5 * 60 * 1000); // 5 minutes
    otpStore.set(phoneNumber, { otp, expiresAt: expirationTime });
    
    // Simulate resend
    console.log(`OTP ${otp} resent to: ${phoneNumber}`);
    res.status(200).json({
      message: 'OTP resent successfully',
      otp: otp, // In production, don't send OTP in response
      phoneNumber,
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});


// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Auth routes are working',
    timestamp: new Date().toISOString(),
  });
});

export default router;
