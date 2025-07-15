import express from 'express';
import AfricasTalking from 'africastalking';
import {
  registerUser,
  loginUser,
  getUser,
  changePin,
  resetPin,
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ===================
// Africa's Talking SMS Setup
// ===================
const credentials = {
  apiKey: 'MyAppAPIkey',       // 🔁 Replace with your actual API key
  username: 'MyAppUsername',   // 🔁 Replace with your actual username
};

const africasTalking = AfricasTalking(credentials);
const sms = africasTalking.SMS;

// ===================
// In-memory Stores (Use Redis or DB in production)
// ===================
const otpStore = new Map();
const verifiedNumbers = new Set();

// ===================
// Helper Functions
// ===================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
  // return '689135'; // Uncomment this for fixed OTP testing
}

async function sendOTPViaSMS(phoneNumber, otp) {
  const options = {
    to: [phoneNumber],
    message: `Your verification code is: ${otp}`,
    from: 'XXYYZZ', // 🔁 Replace with your approved sender ID
  };

  try {
    const response = await sms.send(options);
    console.log('SMS sent:', response);
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
}

// ===================
// Routes
// ===================

// Step 1: Send OTP
router.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const otp = generateOTP();
    const expirationTime = Date.now() + (5 * 60 * 1000); // 5 mins
    otpStore.set(phoneNumber, { otp, expiresAt: expirationTime });

    const sent = await sendOTPViaSMS(phoneNumber, otp);
    if (!sent) {
      return res.status(500).json({ error: 'Failed to send OTP via SMS' });
    }

    res.status(200).json({
      message: 'OTP sent successfully',
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
    const stored = otpStore.get(phoneNumber);
    if (!stored) {
      return res.status(400).json({ error: 'No OTP found for this phone number' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (code === stored.otp) {
      otpStore.delete(phoneNumber);
      verifiedNumbers.add(phoneNumber);
      setTimeout(() => verifiedNumbers.delete(phoneNumber), 10 * 60 * 1000); // Auto-clear

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
    const otp = generateOTP();
    const expirationTime = Date.now() + (5 * 60 * 1000); // 5 mins
    otpStore.set(phoneNumber, { otp, expiresAt: expirationTime });

    const sent = await sendOTPViaSMS(phoneNumber, otp);
    if (!sent) {
      return res.status(500).json({ error: 'Failed to resend OTP via SMS' });
    }

    res.status(200).json({
      message: 'OTP resent successfully',
      phoneNumber,
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// OTP Status Check (optional)
router.get('/otp-status', (req, res) => {
  const { phoneNumber } = req.query;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const isVerified = verifiedNumbers.has(phoneNumber);
  res.status(200).json({ phoneNumber, verified: isVerified });
});

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    message: 'Auth routes are working',
    timestamp: new Date().toISOString(),
  });
});

export default router;
