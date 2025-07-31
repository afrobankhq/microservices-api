import { auth, db } from '../firebase.js';
import blockradar from '../services/blockradar.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';

/**
 * Validate PIN format
 */
const validatePin = (pin) => {
  if (!pin || typeof pin !== 'string') {
    return { valid: false, message: 'PIN is required' };
  }
  if (pin.length !== 6) {
    return { valid: false, message: 'PIN must be exactly 6 digits' };
  }
  if (!/^\d+$/.test(pin)) {
    return { valid: false, message: 'PIN must contain only numbers' };
  }
  return { valid: true };
};

/**
 * Register user with phone number and PIN (after OTP verification)
 */
export const registerUser = async (req, res) => {
  const { phoneNumber, pin, firstName, lastName, email } = req.body;

  if (!phoneNumber || !pin) {
    return res.status(400).json({ error: 'Phone number and PIN are required' });
  }

  const pinValidation = validatePin(pin);
  if (!pinValidation.valid) {
    return res.status(400).json({ error: pinValidation.message });
  }

  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const userSnapshot = await userRef.get();

    if (userSnapshot.exists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    const blockchain = 'base';
    const label = `user_${phoneNumber}`;

    console.log('📡 Calling Blockradar to create address with:', { blockchain, label });

    let addressData;
    try {
      addressData = await blockradar.createAddress(blockchain, label);
      console.log('✅ Address created:', addressData);
    } catch (err) {
      console.error('❌ BlockRadar wallet creation failed:', err.message);
      return res.status(500).json({ error: 'Failed to create blockchain address' });
    }

    const { address, id: walletId } = addressData.data;

    if (!address || !walletId) {
      console.error('❌ Invalid BlockRadar response structure:', addressData);
      return res.status(500).json({ error: 'Invalid blockchain address response' });
    }

    const userData = {
      phoneNumber,
      pin: hashedPin,
      blockchain,
      walletAddress: address,
      walletId,
      createdAt: new Date(),
      updatedAt: new Date(),

      // New fields
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      tier: 'First Tier',
      image: 'default.jpeg',
    };

    await userRef.set(userData);

    const token = generateToken({ phoneNumber });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        phoneNumber,
        blockchain,
        walletAddress: address,
        walletId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        tier: userData.tier,
        image: userData.image,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user with phone number and PIN
 */
export const loginUser = async (req, res) => {
  const { phoneNumber, pin } = req.body;

  if (!phoneNumber || !pin) {
    return res.status(400).json({ error: 'Phone number and PIN are required' });
  }

  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userSnapshot.data();
    const isMatch = await bcrypt.compare(pin, user.pin);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    await userRef.update({ lastLogin: new Date() });

    const token = generateToken({ phoneNumber });

    res.json({
      message: 'Login successful',
      token,
      user: {
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        blockchain: user.blockchain,
        walletAddress: user.walletAddress,
        walletId: user.walletId,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Get authenticated user info
 */
export const getUser = async (req, res) => {
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userSnapshot = await db.collection('users').doc(phoneNumber).get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userSnapshot.data();

    res.json({
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      blockchain: user.blockchain,
      walletAddress: user.walletAddress,
      walletId: user.walletId,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Change PIN (requires current PIN)
 */
export const changePin = async (req, res) => {
  const { currentPin, newPin } = req.body;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!currentPin || !newPin) {
    return res.status(400).json({ error: 'Current PIN and new PIN are required' });
  }

  if (currentPin === newPin) {
    return res.status(400).json({ error: 'New PIN must be different from current PIN' });
  }

  const pinValidation = validatePin(newPin);
  if (!pinValidation.valid) {
    return res.status(400).json({ error: pinValidation.message });
  }

  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userSnapshot.data();
    const isMatch = await bcrypt.compare(currentPin, user.pin);

    if (!isMatch) {
      return res.status(401).json({ error: 'Current PIN is incorrect' });
    }

    const hashedNewPin = await bcrypt.hash(newPin, 10);
    await userRef.update({ pin: hashedNewPin, updatedAt: new Date() });

    res.json({ message: 'PIN changed successfully' });
  } catch (error) {
    console.error('❌ Change PIN error:', error);
    res.status(500).json({ error: 'Failed to change PIN' });
  }
};

/**
 * Reset PIN (requires prior OTP verification)
 */
export const resetPin = async (req, res) => {
  const { phoneNumber, newPin, otpVerified } = req.body;

  if (!phoneNumber || !newPin || !otpVerified) {
    return res.status(400).json({ error: 'Phone number, new PIN, and OTP verification are required' });
  }

  const pinValidation = validatePin(newPin);
  if (!pinValidation.valid) {
    return res.status(400).json({ error: pinValidation.message });
  }

  try {
    const userRef = db.collection('users').doc(phoneNumber);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedNewPin = await bcrypt.hash(newPin, 10);
    await userRef.update({ pin: hashedNewPin, updatedAt: new Date() });

    res.json({ message: 'PIN reset successfully' });
  } catch (error) {
    console.error('❌ Reset PIN error:', error);
    res.status(500).json({ error: 'Failed to reset PIN' });
  }
};
