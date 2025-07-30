import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import hardcodedData from '../hardcoded-data.json' assert { type: 'json' };

const router = express.Router();

// Get profile options
router.get('/options', (req, res) => {
  console.log('[GET /api/profile/options] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.profileOptions,
      message: 'Profile options retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/profile/options] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile options'
    });
  }
});

// Get profile options by user ID
router.get('/options/:userId', authenticate, (req, res) => {
  console.log('[GET /api/profile/options/:userId] Request received, User ID:', req.params.userId);
  try {
    res.json({
      success: true,
      data: hardcodedData.profileOptions,
      message: 'User profile options retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/profile/options/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile options'
    });
  }
});

// Get user profile
router.get('/', authenticate, (req, res) => {
  console.log('[GET /api/profile] Request received');
  try {
    const userProfile = {
      id: req.user?.phoneNumber || 'user123',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: req.user?.phoneNumber || '+2341234567890',
      dateOfBirth: '1990-01-01',
      bvn: '12345678901',
      address: '123 Main Street, Lagos, Nigeria',
      profilePicture: 'https://example.com/profile.jpg',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: userProfile,
      message: 'User profile retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/profile] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile'
    });
  }
});

// Get user profile by ID
router.get('/:userId', authenticate, (req, res) => {
  console.log('[GET /api/profile/:userId] Request received, User ID:', req.params.userId);
  try {
    const userProfile = {
      id: req.params.userId,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+2341234567890',
      dateOfBirth: '1990-01-01',
      bvn: '12345678901',
      address: '123 Main Street, Lagos, Nigeria',
      profilePicture: 'https://example.com/profile.jpg',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: userProfile,
      message: 'User profile retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/profile/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile'
    });
  }
});

// Update user profile
router.put('/', authenticate, (req, res) => {
  console.log('[PUT /api/profile] Request received');
  console.log('[PUT /api/profile] Request body:', req.body);
  
  try {
    const updatedProfile = {
      id: req.user?.phoneNumber || 'user123',
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedProfile,
      message: 'User profile updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/profile] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// Update user profile by ID
router.put('/:userId', authenticate, (req, res) => {
  console.log('[PUT /api/profile/:userId] Request received, User ID:', req.params.userId);
  console.log('[PUT /api/profile/:userId] Request body:', req.body);
  
  try {
    const updatedProfile = {
      id: req.params.userId,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedProfile,
      message: 'User profile updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/profile/:userId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// Get security settings
router.get('/security', authenticate, (req, res) => {
  console.log('[GET /api/profile/security] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.securitySettings.options,
      message: 'Security settings retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/profile/security] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve security settings'
    });
  }
});

// Update security settings
router.put('/security', authenticate, (req, res) => {
  console.log('[PUT /api/profile/security] Request received');
  console.log('[PUT /api/profile/security] Request body:', req.body);
  
  try {
    const updatedSettings = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedSettings,
      message: 'Security settings updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/profile/security] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update security settings'
    });
  }
});

// Change PIN
router.post('/change-pin', authenticate, (req, res) => {
  console.log('[POST /api/profile/change-pin] Request received');
  console.log('[POST /api/profile/change-pin] Request body:', req.body);
  
  const { currentPin, newPin } = req.body;
  
  if (!currentPin || !newPin) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: currentPin, newPin'
    });
  }
  
  if (newPin.length !== 6) {
    return res.status(400).json({
      success: false,
      error: 'New PIN must be 6 digits'
    });
  }
  
  try {
    res.json({
      success: true,
      data: {
        message: 'PIN changed successfully',
        changedAt: new Date().toISOString()
      },
      message: 'PIN changed successfully'
    });
  } catch (error) {
    console.error('[POST /api/profile/change-pin] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change PIN'
    });
  }
});

// Reset PIN
router.post('/reset-pin', authenticate, (req, res) => {
  console.log('[POST /api/profile/reset-pin] Request received');
  console.log('[POST /api/profile/reset-pin] Request body:', req.body);
  
  const { phoneNumber, otpVerified } = req.body;
  
  if (!phoneNumber || !otpVerified) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: phoneNumber, otpVerified'
    });
  }
  
  try {
    res.json({
      success: true,
      data: {
        message: 'PIN reset successfully',
        resetAt: new Date().toISOString()
      },
      message: 'PIN reset successfully'
    });
  } catch (error) {
    console.error('[POST /api/profile/reset-pin] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset PIN'
    });
  }
});

// Get notification settings
router.get('/notifications', authenticate, (req, res) => {
  console.log('[GET /api/profile/notifications] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.notificationSettings.types,
      message: 'Notification settings retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/profile/notifications] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notification settings'
    });
  }
});

// Update notification settings
router.put('/notifications', authenticate, (req, res) => {
  console.log('[PUT /api/profile/notifications] Request received');
  console.log('[PUT /api/profile/notifications] Request body:', req.body);
  
  try {
    const updatedSettings = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedSettings,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/profile/notifications] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification settings'
    });
  }
});

// Update notification preferences
router.post('/notifications/preferences', authenticate, (req, res) => {
  console.log('[POST /api/profile/notifications/preferences] Request received');
  console.log('[POST /api/profile/notifications/preferences] Request body:', req.body);
  
  const { preferences } = req.body;
  
  if (!preferences) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: preferences'
    });
  }
  
  try {
    res.json({
      success: true,
      data: {
        preferences,
        updatedAt: new Date().toISOString()
      },
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('[POST /api/profile/notifications/preferences] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification preferences'
    });
  }
});

// Get payment methods
router.get('/payment-methods', authenticate, (req, res) => {
  console.log('[GET /api/profile/payment-methods] Request received');
  try {
    const paymentMethods = [
      {
        id: 1,
        type: 'bank_account',
        name: 'First Bank',
        accountNumber: '****1234',
        status: 'active'
      },
      {
        id: 2,
        type: 'debit_card',
        name: 'Visa Debit',
        cardNumber: '****5678',
        status: 'active'
      }
    ];
    
    res.json({
      success: true,
      data: paymentMethods,
      message: 'Payment methods retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/profile/payment-methods] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment methods'
    });
  }
});

// Add payment method
router.post('/payment-methods', authenticate, (req, res) => {
  console.log('[POST /api/profile/payment-methods] Request received');
  console.log('[POST /api/profile/payment-methods] Request body:', req.body);
  
  const { type, name, accountNumber, cardNumber } = req.body;
  
  if (!type || !name) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: type, name'
    });
  }
  
  try {
    const newPaymentMethod = {
      id: Date.now(),
      type,
      name,
      accountNumber: accountNumber ? `****${accountNumber.slice(-4)}` : undefined,
      cardNumber: cardNumber ? `****${cardNumber.slice(-4)}` : undefined,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: newPaymentMethod,
      message: 'Payment method added successfully'
    });
  } catch (error) {
    console.error('[POST /api/profile/payment-methods] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add payment method'
    });
  }
});

// Delete payment method
router.delete('/payment-methods/:id', authenticate, (req, res) => {
  console.log('[DELETE /api/profile/payment-methods/:id] Request received, ID:', req.params.id);
  try {
    res.json({
      success: true,
      data: {
        id: req.params.id,
        deletedAt: new Date().toISOString()
      },
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('[DELETE /api/profile/payment-methods/:id] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete payment method'
    });
  }
});

export default router; 