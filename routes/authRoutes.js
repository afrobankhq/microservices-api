import express from 'express';
import AfricasTalking from 'africastalking';
import { db } from '../firebase.js'; 
import { collection, doc, setDoc, getDoc, deleteDoc, addDoc } from 'firebase/firestore';
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
  apiKey: process.env.AFRICAS_TALKING_APIKEY,       
  username: process.env.AFRICAS_TALKING_USERNAME,
};

const africasTalking = AfricasTalking(credentials);
const sms = africasTalking.SMS;

// ===================
// Firestore Collections
// ===================
const OTP_COLLECTION = 'otps';
const VERIFIED_NUMBERS_COLLECTION = 'verified_numbers';

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

// Store OTP in Firestore
async function storeOTP(phoneNumber, otp, expiresAt) {
  try {
    const otpDoc = doc(db, OTP_COLLECTION, phoneNumber);
    await setDoc(otpDoc, {
      otp,
      expiresAt,
      createdAt: Date.now(),
    });
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
}

// Get OTP from Firestore
async function getOTP(phoneNumber) {
  try {
    const otpDoc = doc(db, OTP_COLLECTION, phoneNumber);
    const docSnap = await getDoc(otpDoc);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting OTP:', error);
    return null;
  }
}

// Delete OTP from Firestore
async function deleteOTP(phoneNumber) {
  try {
    const otpDoc = doc(db, OTP_COLLECTION, phoneNumber);
    await deleteDoc(otpDoc);
    return true;
  } catch (error) {
    console.error('Error deleting OTP:', error);
    return false;
  }
}

// Add verified number to Firestore
async function addVerifiedNumber(phoneNumber) {
  try {
    const verifiedDoc = doc(db, VERIFIED_NUMBERS_COLLECTION, phoneNumber);
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
    
    await setDoc(verifiedDoc, {
      phoneNumber,
      verifiedAt: Date.now(),
      expiresAt,
    });
    return true;
  } catch (error) {
    console.error('Error adding verified number:', error);
    return false;
  }
}

// Check if number is verified
async function isNumberVerified(phoneNumber) {
  try {
    const verifiedDoc = doc(db, VERIFIED_NUMBERS_COLLECTION, phoneNumber);
    const docSnap = await getDoc(verifiedDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Check if verification has expired
      if (Date.now() > data.expiresAt) {
        await deleteDoc(verifiedDoc); // Clean up expired verification
        return false;
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking verified number:', error);
    return false;
  }
}

// Delete verified number from Firestore
async function deleteVerifiedNumber(phoneNumber) {
  try {
    const verifiedDoc = doc(db, VERIFIED_NUMBERS_COLLECTION, phoneNumber);
    await deleteDoc(verifiedDoc);
    return true;
  } catch (error) {
    console.error('Error deleting verified number:', error);
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
    
    const stored = await storeOTP(phoneNumber, otp, expirationTime);
    if (!stored) {
      return res.status(500).json({ error: 'Failed to store OTP' });
    }

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
    const stored = await getOTP(phoneNumber);
    if (!stored) {
      return res.status(400).json({ error: 'No OTP found for this phone number' });
    }

    if (Date.now() > stored.expiresAt) {
      await deleteOTP(phoneNumber);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (code === stored.otp) {
      await deleteOTP(phoneNumber);
      await addVerifiedNumber(phoneNumber);

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
    
    const stored = await storeOTP(phoneNumber, otp, expirationTime);
    if (!stored) {
      return res.status(500).json({ error: 'Failed to store OTP' });
    }

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
router.get('/otp-status', async (req, res) => {
  const { phoneNumber } = req.query;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const isVerified = await isNumberVerified(phoneNumber);
    res.status(200).json({ phoneNumber, verified: isVerified });
  } catch (error) {
    console.error('Error checking OTP status:', error);
    res.status(500).json({ error: 'Failed to check OTP status' });
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