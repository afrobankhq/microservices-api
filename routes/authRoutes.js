import express from 'express';
// import AfricasTalking from 'africastalking'; // Commented out - no longer using SMS
import { db } from '../firebase.js';
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
// JSON Error Handling Middleware
// ===================
router.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[JSON PARSE ERROR] Malformed JSON received:');
    console.error('[JSON PARSE ERROR] Error details:', {
      message: err.message,
      status: err.status,
      stack: err.stack
    });
    console.error('[JSON PARSE ERROR] Raw request body:', req.body);
    console.error('[JSON PARSE ERROR] Request headers:', req.headers);
    return res.status(400).json({ 
      error: 'Invalid JSON format',
      message: err.message,
      details: 'The request body contains malformed JSON'
    });
  }
  next();
});

// ===================
// Request Logging Middleware
// ===================
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('[REQUEST] Headers:', req.headers);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('[REQUEST] Body:', JSON.stringify(req.body, null, 2));
  } else {
    console.log('[REQUEST] Body: Empty or undefined');
  }
  
  next();
});

// ===================
// Default OTP Configuration
// ===================
const DEFAULT_OTP = '639140';
console.log('[AUTH ROUTES] Using default OTP for all accounts:', DEFAULT_OTP);

// ===================
// Firestore Collections
// ===================
const OTP_COLLECTION = 'otps';
const VERIFIED_NUMBERS_COLLECTION = 'verified_numbers';

// ===================
// Helper Functions
// ===================
// function generateOTP() {
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   console.log('[generateOTP] Generated OTP:', otp);
//   return otp;
// }

function getDefaultOTP() {
  console.log('[getDefaultOTP] Using default OTP:', DEFAULT_OTP);
  return DEFAULT_OTP;
}

// Commented out SMS functionality - no longer needed
// async function sendOTPViaSMS(phoneNumber, otp) {
//   console.log('[sendOTPViaSMS] SMS functionality disabled - using default OTP');
//   return true; // Always return success since we're not actually sending SMS
// }

// Store OTP
async function storeOTP(phoneNumber, otp, expiresAt) {
  console.log('[storeOTP] Storing OTP for phone:', phoneNumber, 'OTP:', otp, 'expires at:', new Date(expiresAt));
  
  try {
    const otpData = {
      otp,
      expiresAt,
      createdAt: Date.now(),
    };
    console.log('[storeOTP] OTP data to store:', otpData);
    
    await db.collection(OTP_COLLECTION).doc(phoneNumber).set(otpData);
    console.log('[storeOTP] OTP stored successfully in Firestore');
    return true;
  } catch (error) {
    console.error('[storeOTP] Error storing OTP:', error);
    console.error('[storeOTP] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
}

// Get OTP
async function getOTP(phoneNumber) {
  console.log('[getOTP] Retrieving OTP for phone:', phoneNumber);
  
  try {
    const snapshot = await db.collection(OTP_COLLECTION).doc(phoneNumber).get();
    if (snapshot.exists) {
      const data = snapshot.data();
      console.log('[getOTP] OTP found:', {
        phoneNumber,
        otp: data.otp,
        expiresAt: new Date(data.expiresAt),
        createdAt: new Date(data.createdAt)
      });
      return data;
    }
    console.log('[getOTP] No OTP found for phone:', phoneNumber);
    return null;
  } catch (error) {
    console.error('[getOTP] Error getting OTP:', error);
    console.error('[getOTP] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return null;
  }
}

// Delete OTP
async function deleteOTP(phoneNumber) {
  console.log('[deleteOTP] Deleting OTP for phone:', phoneNumber);
  
  try {
    await db.collection(OTP_COLLECTION).doc(phoneNumber).delete();
    console.log('[deleteOTP] OTP deleted successfully');
    return true;
  } catch (error) {
    console.error('[deleteOTP] Error deleting OTP:', error);
    console.error('[deleteOTP] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
}

// Add verified number
async function addVerifiedNumber(phoneNumber) {
  console.log('[addVerifiedNumber] Adding verified number:', phoneNumber);
  
  try {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins
    const verifiedData = {
      phoneNumber,
      verifiedAt: Date.now(),
      expiresAt,
    };
    console.log('[addVerifiedNumber] Verified data to store:', verifiedData);
    
    await db.collection(VERIFIED_NUMBERS_COLLECTION).doc(phoneNumber).set(verifiedData);
    console.log('[addVerifiedNumber] Verified number stored successfully');
    return true;
  } catch (error) {
    console.error('[addVerifiedNumber] Error adding verified number:', error);
    console.error('[addVerifiedNumber] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
}

// Check if number is verified
async function isNumberVerified(phoneNumber) {
  console.log('[isNumberVerified] Checking if number is verified:', phoneNumber);
  
  try {
    const docSnap = await db.collection(VERIFIED_NUMBERS_COLLECTION).doc(phoneNumber).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      console.log('[isNumberVerified] Found verified number data:', {
        phoneNumber,
        verifiedAt: new Date(data.verifiedAt),
        expiresAt: new Date(data.expiresAt),
        currentTime: new Date()
      });
      
      if (Date.now() > data.expiresAt) {
        console.log('[isNumberVerified] Verification expired, deleting...');
        await db.collection(VERIFIED_NUMBERS_COLLECTION).doc(phoneNumber).delete();
        console.log('[isNumberVerified] Expired verification deleted');
        return false;
      }
      console.log('[isNumberVerified] Number is verified and not expired');
      return true;
    }
    console.log('[isNumberVerified] Number not found in verified collection');
    return false;
  } catch (error) {
    console.error('[isNumberVerified] Error checking verified number:', error);
    console.error('[isNumberVerified] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
}

// Delete verified number
async function deleteVerifiedNumber(phoneNumber) {
  console.log('[deleteVerifiedNumber] Deleting verified number:', phoneNumber);
  
  try {
    await db.collection(VERIFIED_NUMBERS_COLLECTION).doc(phoneNumber).delete();
    console.log('[deleteVerifiedNumber] Verified number deleted successfully');
    return true;
  } catch (error) {
    console.error('[deleteVerifiedNumber] Error deleting verified number:', error);
    console.error('[deleteVerifiedNumber] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
}

// ===================
// Routes
// ===================

router.post('/send-otp', async (req, res) => {
  console.log('[POST /send-otp] Request received');
  console.log('[POST /send-otp] Request body:', req.body);
  console.log('[POST /send-otp] Request body type:', typeof req.body);
  console.log('[POST /send-otp] Request body keys:', Object.keys(req.body || {}));
  
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    console.log('[POST /send-otp] Error: Phone number is required');
    console.log('[POST /send-otp] Available body properties:', Object.keys(req.body || {}));
    return res.status(400).json({ error: 'Phone number is required' });
  }

  console.log('[POST /send-otp] Processing request for phone:', phoneNumber);

  try {
    console.log('[POST /send-otp] Using default OTP...');
    const otp = getDefaultOTP();
    const expirationTime = Date.now() + 5 * 60 * 1000;
    console.log('[POST /send-otp] Default OTP set, expires at:', new Date(expirationTime));

    console.log('[POST /send-otp] Storing OTP in database...');
    const stored = await storeOTP(phoneNumber, otp, expirationTime);
    if (!stored) {
      console.log('[POST /send-otp] Failed to store OTP, returning error');
      return res.status(500).json({ error: 'Failed to store OTP' });
    }

    console.log('[POST /send-otp] OTP stored successfully (SMS sending skipped - using default OTP)');
    console.log('[POST /send-otp] Default OTP sent successfully, sending response');
    res.status(200).json({ 
      message: 'OTP sent successfully', 
      phoneNumber,
      note: 'Using default OTP for development: 639140'
    });
  } catch (error) {
    console.error('[POST /send-otp] Unexpected error:', error);
    console.error('[POST /send-otp] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify-otp', async (req, res) => {
  console.log('[POST /verify-otp] Request received');
  console.log('[POST /verify-otp] Request body:', req.body);
  console.log('[POST /verify-otp] Request body type:', typeof req.body);
  console.log('[POST /verify-otp] Request body keys:', Object.keys(req.body || {}));
  
  const { phoneNumber, code } = req.body;

  if (!phoneNumber || !code) {
    console.log('[POST /verify-otp] Error: Missing required fields');
    console.log('[POST /verify-otp] Available body properties:', Object.keys(req.body || {}));
    return res.status(400).json({ error: 'Phone number and OTP code are required' });
  }

  console.log('[POST /verify-otp] Processing verification for phone:', phoneNumber, 'code:', code);

  try {
    console.log('[POST /verify-otp] Retrieving stored OTP...');
    const stored = await getOTP(phoneNumber);
    if (!stored) {
      console.log('[POST /verify-otp] No OTP found for phone:', phoneNumber);
      return res.status(400).json({ error: 'No OTP found for this phone number' });
    }

    console.log('[POST /verify-otp] Checking OTP expiration...');
    if (Date.now() > stored.expiresAt) {
      console.log('[POST /verify-otp] OTP expired, deleting and returning error');
      await deleteOTP(phoneNumber);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    console.log('[POST /verify-otp] Comparing OTP codes...');
    if (code === stored.otp) {
      console.log('[POST /verify-otp] OTP verified successfully');
      await deleteOTP(phoneNumber);
      console.log('[POST /verify-otp] Adding to verified numbers...');
      await addVerifiedNumber(phoneNumber);
      console.log('[POST /verify-otp] Sending success response');
      res.status(200).json({ message: 'OTP verified successfully', phoneNumber, verified: true });
    } else {
      console.log('[POST /verify-otp] Invalid OTP provided');
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('[POST /verify-otp] Unexpected error:', error);
    console.error('[POST /verify-otp] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

router.post('/resend-otp', async (req, res) => {
  console.log('[POST /resend-otp] Request received');
  console.log('[POST /resend-otp] Request body:', req.body);
  console.log('[POST /resend-otp] Request body type:', typeof req.body);
  console.log('[POST /resend-otp] Request body keys:', Object.keys(req.body || {}));
  
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    console.log('[POST /resend-otp] Error: Phone number is required');
    console.log('[POST /resend-otp] Available body properties:', Object.keys(req.body || {}));
    return res.status(400).json({ error: 'Phone number is required' });
  }

  console.log('[POST /resend-otp] Processing resend request for phone:', phoneNumber);

  try {
    console.log('[POST /resend-otp] Using default OTP...');
    const otp = getDefaultOTP();
    const expirationTime = Date.now() + 5 * 60 * 1000;
    console.log('[POST /resend-otp] Default OTP set, expires at:', new Date(expirationTime));

    console.log('[POST /resend-otp] Storing new OTP in database...');
    const stored = await storeOTP(phoneNumber, otp, expirationTime);
    if (!stored) {
      console.log('[POST /resend-otp] Failed to store new OTP, returning error');
      return res.status(500).json({ error: 'Failed to store OTP' });
    }

    console.log('[POST /resend-otp] Default OTP stored successfully (SMS sending skipped)');
    console.log('[POST /resend-otp] New OTP sent successfully, sending response');
    res.status(200).json({ 
      message: 'OTP resent successfully', 
      phoneNumber,
      note: 'Using default OTP for development: 639140'
    });
  } catch (error) {
    console.error('[POST /resend-otp] Unexpected error:', error);
    console.error('[POST /resend-otp] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

router.get('/otp-status', async (req, res) => {
  console.log('[GET /otp-status] Request received');
  console.log('[GET /otp-status] Query params:', req.query);
  
  const { phoneNumber } = req.query;
  if (!phoneNumber) {
    console.log('[GET /otp-status] Error: Phone number is required');
    return res.status(400).json({ error: 'Phone number is required' });
  }

  console.log('[GET /otp-status] Checking status for phone:', phoneNumber);

  try {
    console.log('[GET /otp-status] Checking if number is verified...');
    const isVerified = await isNumberVerified(phoneNumber);
    console.log('[GET /otp-status] Verification status:', isVerified);
    res.status(200).json({ phoneNumber, verified: isVerified });
  } catch (error) {
    console.error('[GET /otp-status] Unexpected error:', error);
    console.error('[GET /otp-status] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to check OTP status' });
  }
});

console.log('[AUTH ROUTES] Setting up route handlers...');

router.post('/register', (req, res) => {
  console.log('[POST /register] Request received');
  console.log('[POST /register] Request body:', req.body);
  console.log('[POST /register] Request body type:', typeof req.body);
  console.log('[POST /register] Request body keys:', Object.keys(req.body || {}));
  registerUser(req, res);
});

router.post('/login', (req, res) => {
  console.log('[POST /login] Request received');
  console.log('[POST /login] Request body:', req.body);
  console.log('[POST /login] Request body type:', typeof req.body);
  console.log('[POST /login] Request body keys:', Object.keys(req.body || {}));
  loginUser(req, res);
});

router.get('/user', authenticate, (req, res) => {
  console.log('[GET /user] Request received');
  console.log('[GET /user] User from auth middleware:', req.user);
  getUser(req, res);
});

router.put('/change-pin', authenticate, (req, res) => {
  console.log('[PUT /change-pin] Request received');
  console.log('[PUT /change-pin] Request body:', req.body);
  console.log('[PUT /change-pin] Request body type:', typeof req.body);
  console.log('[PUT /change-pin] Request body keys:', Object.keys(req.body || {}));
  console.log('[PUT /change-pin] User from auth middleware:', req.user);
  changePin(req, res);
});

router.post('/reset-pin', (req, res) => {
  console.log('[POST /reset-pin] Request received');
  console.log('[POST /reset-pin] Request body:', req.body);
  console.log('[POST /reset-pin] Request body type:', typeof req.body);
  console.log('[POST /reset-pin] Request body keys:', Object.keys(req.body || {}));
  resetPin(req, res);
});

router.get('/health', (req, res) => {
  console.log('[GET /health] Health check request received');
  res.status(200).json({ message: 'Auth routes are working', timestamp: new Date().toISOString() });
});

console.log('[AUTH ROUTES] All routes configured successfully');

export default router;