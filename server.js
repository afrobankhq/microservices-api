import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionsRoutes from './routes/transactionsRoutes.js';


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

app.use(express.json({ limit: '10mb' })); // Add size limit for security

app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
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
} catch (error) {
}

try {
  app.use('/api/user', userRoutes);
} catch (error) {
  // Error loading user routes
}

try {
  app.use('/api/transactions', transactionsRoutes);
} catch (error) {
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
      'GET /api/transactions/*'
    ]
  });
});

// Global error handler 
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: isDev ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
    ...(isDev && { stack: err.stack })
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // Server started successfully
});

export default app;