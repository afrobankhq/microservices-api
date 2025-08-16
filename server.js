import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import blockchainTransactionsRoutes from './routes/blockchainTransactionsRoutes.js';
import billRoutes from './routes/billRoutes.js';
import billsRoutes from './routes/billsRoutes.js';
import cardsRoutes from './routes/cardsRoutes.js';
import cardCustomersRoutes from './routes/cardCustomersRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import commonRoutes from './routes/commonRoutes.js';


// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Set your frontend URL in .env
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));

// Enhanced request logging middleware (before JSON parsing)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('[REQUEST] Headers:', {
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'user-agent': req.headers['user-agent']
  });
  
  // Log raw body for debugging
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    if (data) {
      console.log('[REQUEST] Raw body data:', data);
      console.log('[REQUEST] Raw body length:', data.length);
    }
  });
  
  next();
});

app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('[JSON PARSE ERROR] Invalid JSON in request body:');
      console.error('[JSON PARSE ERROR] Raw buffer:', buf.toString());
      console.error('[JSON PARSE ERROR] Parse error:', e.message);
      throw new Error('Invalid JSON format');
    }
  }
})); // Add size limit for security

app.use(express.urlencoded({ extended: true }));

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[JSON PARSE ERROR] Malformed JSON received:');
    console.error('[JSON PARSE ERROR] Error details:', {
      message: err.message,
      status: err.status,
      stack: err.stack
    });
    console.error('[JSON PARSE ERROR] Request URL:', req.originalUrl);
    console.error('[JSON PARSE ERROR] Request method:', req.method);
    console.error('[JSON PARSE ERROR] Request headers:', req.headers);
    
    return res.status(400).json({ 
      error: 'Invalid JSON format',
      message: err.message,
      details: 'The request body contains malformed JSON. Please check your request format.',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
});

// Request logging middleware (after JSON parsing)
app.use((req, res, next) => {
  console.log('[REQUEST] Parsed body:', req.body);
  console.log('[REQUEST] Body type:', typeof req.body);
  console.log('[REQUEST] Body keys:', Object.keys(req.body || {}));
  next();
});

// Handle favicon requests 
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); 
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to AfroBank API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Debug route
app.get('/debug', (req, res) => {
  const debugInfo = {
    message: 'Server is working',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      hasFirebaseConfig: !!process.env.FIREBASE_PROJECT_ID,
      hasTwilioConfig: !!process.env.TWILIO_ACCOUNT_SID,
    },
    timestamp: new Date().toISOString()
  };
  res.json(debugInfo);
});

// API Routes
try {
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/bill', billRoutes);
  app.use('/api/blockchain-transactions', blockchainTransactionsRoutes);
  
  // New routes for hardcoded data
  app.use('/api/bills', billsRoutes);
  app.use('/api/cards', cardsRoutes);
  app.use('/api/card-customers', cardCustomersRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/transactions', transactionsRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/common', commonRoutes);
} catch (error) {
  console.error('[SERVER] Error loading routes:', error);
}


// 404 handler 
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /debug',
      'POST /api/auth/*',
      'GET /api/user/*',
      'GET /api/bills/*',
      'GET /api/cards/*',
      'GET /api/card-customers/*',
      'GET /api/wallet/*',
      'GET /api/profile/*',
      'GET /api/transactions/*',
      'GET /api/support/*',
      'GET /api/common/*'
    ]
  });
});

// Global error handler 
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  console.error('[GLOBAL ERROR HANDLER] Error caught:', err);
  console.error('[GLOBAL ERROR HANDLER] Request URL:', req.originalUrl);
  console.error('[GLOBAL ERROR HANDLER] Request method:', req.method);
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDev ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(isDev && { stack: err.stack })
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[SERVER] Server started on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;