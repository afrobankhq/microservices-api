import express from 'express';
import hardcodedData from '../hardcoded-data.json' assert { type: 'json' };

const router = express.Router();

// Get country codes
router.get('/country-codes', (req, res) => {
  console.log('[GET /api/common/country-codes] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.countryCodes,
      message: 'Country codes retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/country-codes] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve country codes'
    });
  }
});

// Get app settings
router.get('/settings', (req, res) => {
  console.log('[GET /api/common/settings] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.appSettings,
      message: 'App settings retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/settings] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve app settings'
    });
  }
});

// Get default values
router.get('/defaults', (req, res) => {
  console.log('[GET /api/common/defaults] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.defaultValues,
      message: 'Default values retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/defaults] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve default values'
    });
  }
});

// Get API endpoints configuration
router.get('/api-endpoints', (req, res) => {
  console.log('[GET /api/common/api-endpoints] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.apiEndpoints,
      message: 'API endpoints configuration retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/api-endpoints] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve API endpoints configuration'
    });
  }
});

// Get dashboard widgets
router.get('/dashboard-widgets', (req, res) => {
  console.log('[GET /api/common/dashboard-widgets] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.dashboardWidgets,
      message: 'Dashboard widgets retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/dashboard-widgets] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard widgets'
    });
  }
});

// Get summary cards
router.get('/summary-cards', (req, res) => {
  console.log('[GET /api/common/summary-cards] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.summaryCards,
      message: 'Summary cards retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/summary-cards] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve summary cards'
    });
  }
});

// Get app version
router.get('/version', (req, res) => {
  console.log('[GET /api/common/version] Request received');
  try {
    const version = {
      version: '1.0.0',
      buildNumber: '100',
      releaseDate: '2024-01-15',
      minVersion: '1.0.0',
      forceUpdate: false,
      changelog: [
        {
          version: '1.0.0',
          date: '2024-01-15',
          changes: [
            'Initial release',
            'Basic banking features',
            'Bill payments',
            'Card management'
          ]
        }
      ]
    };
    
    res.json({
      success: true,
      data: version,
      message: 'App version retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/version] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve app version'
    });
  }
});

// Check app health
router.get('/health', (req, res) => {
  console.log('[GET /api/common/health] Request received');
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    };
    
    res.json({
      success: true,
      data: health,
      message: 'App health check completed'
    });
  } catch (error) {
    console.error('[GET /api/common/health] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// Get app configuration
router.get('/config', (req, res) => {
  console.log('[GET /api/common/config] Request received');
  try {
    const config = {
      app: {
        name: 'AfroBank',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      features: {
        bills: true,
        cards: true,
        wallet: true,
        transactions: true,
        support: true
      },
      limits: {
        maxTransactionAmount: 1000000,
        maxDailyTransactions: 50,
        maxCardsPerUser: 5,
        maxBankAccounts: 3
      },
      currencies: ['NGN', 'USD', 'EUR', 'GBP'],
      languages: ['en', 'fr', 'es'],
      timezones: ['Africa/Lagos', 'UTC', 'America/New_York']
    };
    
    res.json({
      success: true,
      data: config,
      message: 'App configuration retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/config] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve app configuration'
    });
  }
});

// Get supported currencies
router.get('/currencies', (req, res) => {
  console.log('[GET /api/common/currencies] Request received');
  try {
    const currencies = [
      { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' }
    ];
    
    res.json({
      success: true,
      data: currencies,
      message: 'Supported currencies retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/currencies] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve supported currencies'
    });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  console.log('[GET /api/common/languages] Request received');
  try {
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
    ];
    
    res.json({
      success: true,
      data: languages,
      message: 'Supported languages retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/languages] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve supported languages'
    });
  }
});

// Get timezones
router.get('/timezones', (req, res) => {
  console.log('[GET /api/common/timezones] Request received');
  try {
    const timezones = [
      { value: 'Africa/Lagos', label: 'Lagos (GMT+1)' },
      { value: 'UTC', label: 'UTC (GMT+0)' },
      { value: 'America/New_York', label: 'New York (GMT-5)' },
      { value: 'Europe/London', label: 'London (GMT+0)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' }
    ];
    
    res.json({
      success: true,
      data: timezones,
      message: 'Timezones retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/timezones] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve timezones'
    });
  }
});

// Get date formats
router.get('/date-formats', (req, res) => {
  console.log('[GET /api/common/date-formats] Request received');
  try {
    const dateFormats = [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
      { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' }
    ];
    
    res.json({
      success: true,
      data: dateFormats,
      message: 'Date formats retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/date-formats] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve date formats'
    });
  }
});

// Get time formats
router.get('/time-formats', (req, res) => {
  console.log('[GET /api/common/time-formats] Request received');
  try {
    const timeFormats = [
      { value: '12h', label: '12-hour (AM/PM)' },
      { value: '24h', label: '24-hour' }
    ];
    
    res.json({
      success: true,
      data: timeFormats,
      message: 'Time formats retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/time-formats] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve time formats'
    });
  }
});

// Get themes
router.get('/themes', (req, res) => {
  console.log('[GET /api/common/themes] Request received');
  try {
    const themes = [
      { value: 'light', label: 'Light Theme' },
      { value: 'dark', label: 'Dark Theme' },
      { value: 'auto', label: 'Auto (System)' }
    ];
    
    res.json({
      success: true,
      data: themes,
      message: 'Themes retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/themes] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve themes'
    });
  }
});

// Get app permissions
router.get('/permissions', (req, res) => {
  console.log('[GET /api/common/permissions] Request received');
  try {
    const permissions = [
      { id: 1, name: 'Camera', description: 'Scan QR codes and documents', required: false },
      { id: 2, name: 'Location', description: 'Find nearby ATMs and branches', required: false },
      { id: 3, name: 'Notifications', description: 'Receive transaction alerts', required: true },
      { id: 4, name: 'Biometric', description: 'Use fingerprint or face ID', required: false },
      { id: 5, name: 'Storage', description: 'Save documents and receipts', required: false }
    ];
    
    res.json({
      success: true,
      data: permissions,
      message: 'App permissions retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/permissions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve app permissions'
    });
  }
});

// Get app features
router.get('/features', (req, res) => {
  console.log('[GET /api/common/features] Request received');
  try {
    const features = [
      { id: 1, name: 'Bill Payments', enabled: true, description: 'Pay utility bills' },
      { id: 2, name: 'Card Management', enabled: true, description: 'Manage virtual and physical cards' },
      { id: 3, name: 'Money Transfer', enabled: true, description: 'Send money to others' },
      { id: 4, name: 'Transaction History', enabled: true, description: 'View all transactions' },
      { id: 5, name: 'Support Chat', enabled: true, description: 'Get help from support team' }
    ];
    
    res.json({
      success: true,
      data: features,
      message: 'App features retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/common/features] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve app features'
    });
  }
});

export default router; 