import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hardcodedData = JSON.parse(fs.readFileSync(path.join(__dirname, '../hardcoded-data.json'), 'utf8'));

const router = express.Router();

// Get help categories
router.get('/categories', (req, res) => {
  console.log('[GET /api/support/categories] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.helpSupport.categories,
      message: 'Help categories retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/categories] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve help categories'
    });
  }
});

// Get FAQ
router.get('/faq', (req, res) => {
  console.log('[GET /api/support/faq] Request received');
  try {
    res.json({
      success: true,
      data: hardcodedData.helpSupport.faq,
      message: 'FAQ retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/faq] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve FAQ'
    });
  }
});

// Get FAQ by category
router.get('/faq/:category', (req, res) => {
  console.log('[GET /api/support/faq/:category] Request received, Category:', req.params.category);
  try {
    // Filter FAQ by category
    const categoryFaq = hardcodedData.helpSupport.faq.filter(item => 
      item.question.toLowerCase().includes(req.params.category.toLowerCase())
    );
    
    res.json({
      success: true,
      data: categoryFaq,
      message: 'Category FAQ retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/faq/:category] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve category FAQ'
    });
  }
});

// Search FAQ
router.get('/faq/search/:query', (req, res) => {
  console.log('[GET /api/support/faq/search/:query] Request received, Query:', req.params.query);
  try {
    const searchResults = hardcodedData.helpSupport.faq.filter(item => 
      item.question.toLowerCase().includes(req.params.query.toLowerCase()) ||
      item.answer.toLowerCase().includes(req.params.query.toLowerCase())
    );
    
    res.json({
      success: true,
      data: searchResults,
      message: 'FAQ search results retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/faq/search/:query] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search FAQ'
    });
  }
});

// Create support ticket
router.post('/tickets', authenticate, (req, res) => {
  console.log('[POST /api/support/tickets] Request received');
  console.log('[POST /api/support/tickets] Request body:', req.body);
  
  const { category, subject, description, priority } = req.body;
  
  if (!category || !subject || !description) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: category, subject, description'
    });
  }
  
  try {
    const newTicket = {
      id: Date.now(),
      category,
      subject,
      description,
      priority: priority || 'medium',
      status: 'open',
      userId: req.user?.phoneNumber || 'user123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: newTicket,
      message: 'Support ticket created successfully'
    });
  } catch (error) {
    console.error('[POST /api/support/tickets] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create support ticket'
    });
  }
});

// Get user support tickets
router.get('/tickets', authenticate, (req, res) => {
  console.log('[GET /api/support/tickets] Request received');
  try {
    const tickets = [
      {
        id: 1,
        category: 'Account Issues',
        subject: 'Cannot login to account',
        description: 'I am unable to login to my account',
        priority: 'high',
        status: 'open',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        category: 'Payment Problems',
        subject: 'Transaction failed',
        description: 'My transaction was declined',
        priority: 'medium',
        status: 'in_progress',
        createdAt: '2024-01-14T14:20:00Z',
        updatedAt: '2024-01-14T16:45:00Z'
      }
    ];
    
    res.json({
      success: true,
      data: tickets,
      message: 'Support tickets retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/tickets] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve support tickets'
    });
  }
});

// Get support ticket by ID
router.get('/tickets/:ticketId', authenticate, (req, res) => {
  console.log('[GET /api/support/tickets/:ticketId] Request received, Ticket ID:', req.params.ticketId);
  try {
    const ticket = {
      id: req.params.ticketId,
      category: 'Account Issues',
      subject: 'Cannot login to account',
      description: 'I am unable to login to my account',
      priority: 'high',
      status: 'open',
      userId: req.user?.phoneNumber || 'user123',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'I am unable to login to my account',
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          sender: 'support',
          message: 'We are looking into this issue. Please try clearing your cache.',
          timestamp: '2024-01-15T11:00:00Z'
        }
      ]
    };
    
    res.json({
      success: true,
      data: ticket,
      message: 'Support ticket details retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/tickets/:ticketId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve support ticket details'
    });
  }
});

// Update support ticket
router.put('/tickets/:ticketId', authenticate, (req, res) => {
  console.log('[PUT /api/support/tickets/:ticketId] Request received, Ticket ID:', req.params.ticketId);
  console.log('[PUT /api/support/tickets/:ticketId] Request body:', req.body);
  
  try {
    const updatedTicket = {
      id: req.params.ticketId,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: updatedTicket,
      message: 'Support ticket updated successfully'
    });
  } catch (error) {
    console.error('[PUT /api/support/tickets/:ticketId] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update support ticket'
    });
  }
});

// Add message to support ticket
router.post('/tickets/:ticketId/messages', authenticate, (req, res) => {
  console.log('[POST /api/support/tickets/:ticketId/messages] Request received, Ticket ID:', req.params.ticketId);
  console.log('[POST /api/support/tickets/:ticketId/messages] Request body:', req.body);
  
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: message'
    });
  }
  
  try {
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      message,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: newMessage,
      message: 'Message added to support ticket successfully'
    });
  } catch (error) {
    console.error('[POST /api/support/tickets/:ticketId/messages] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add message to support ticket'
    });
  }
});

// Close support ticket
router.post('/tickets/:ticketId/close', authenticate, (req, res) => {
  console.log('[POST /api/support/tickets/:ticketId/close] Request received, Ticket ID:', req.params.ticketId);
  try {
    res.json({
      success: true,
      data: {
        id: req.params.ticketId,
        status: 'closed',
        closedAt: new Date().toISOString()
      },
      message: 'Support ticket closed successfully'
    });
  } catch (error) {
    console.error('[POST /api/support/tickets/:ticketId/close] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close support ticket'
    });
  }
});

// Get contact information
router.get('/contact', (req, res) => {
  console.log('[GET /api/support/contact] Request received');
  try {
    const contactInfo = {
      phone: '+234-1-234-5678',
      email: 'support@afrobank.com',
      whatsapp: '+234-1-234-5678',
      address: '123 Main Street, Lagos, Nigeria',
      workingHours: 'Monday - Friday: 8:00 AM - 6:00 PM',
      emergency: '+234-1-234-9999'
    };
    
    res.json({
      success: true,
      data: contactInfo,
      message: 'Contact information retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/contact] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contact information'
    });
  }
});

// Submit feedback
router.post('/feedback', authenticate, (req, res) => {
  console.log('[POST /api/support/feedback] Request received');
  console.log('[POST /api/support/feedback] Request body:', req.body);
  
  const { type, rating, comment, category } = req.body;
  
  if (!type || !rating) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: type, rating'
    });
  }
  
  try {
    const feedback = {
      id: Date.now(),
      type,
      rating: parseInt(rating),
      comment,
      category,
      userId: req.user?.phoneNumber || 'user123',
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('[POST /api/support/feedback] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

// Get feedback types
router.get('/feedback/types', (req, res) => {
  console.log('[GET /api/support/feedback/types] Request received');
  try {
    const feedbackTypes = [
      { id: 1, name: 'App Experience', description: 'General app feedback' },
      { id: 2, name: 'Bug Report', description: 'Report a bug or issue' },
      { id: 3, name: 'Feature Request', description: 'Request new features' },
      { id: 4, name: 'Customer Service', description: 'Feedback about support' }
    ];
    
    res.json({
      success: true,
      data: feedbackTypes,
      message: 'Feedback types retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/feedback/types] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback types'
    });
  }
});

// Get user feedback
router.get('/feedback', authenticate, (req, res) => {
  console.log('[GET /api/support/feedback] Request received');
  try {
    const userFeedback = [
      {
        id: 1,
        type: 'App Experience',
        rating: 5,
        comment: 'Great app experience!',
        category: 'general',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        type: 'Feature Request',
        rating: 4,
        comment: 'Would love to see more payment options',
        category: 'features',
        createdAt: '2024-01-14T14:20:00Z'
      }
    ];
    
    res.json({
      success: true,
      data: userFeedback,
      message: 'User feedback retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/feedback] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user feedback'
    });
  }
});

// Get support statistics
router.get('/statistics', authenticate, (req, res) => {
  console.log('[GET /api/support/statistics] Request received');
  try {
    const statistics = {
      totalTickets: 15,
      openTickets: 3,
      resolvedTickets: 12,
      averageResponseTime: '2.5 hours',
      satisfactionRate: 4.2,
      topCategories: [
        { category: 'Account Issues', count: 5 },
        { category: 'Payment Problems', count: 4 },
        { category: 'Technical Support', count: 3 }
      ]
    };
    
    res.json({
      success: true,
      data: statistics,
      message: 'Support statistics retrieved successfully'
    });
  } catch (error) {
    console.error('[GET /api/support/statistics] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve support statistics'
    });
  }
});

export default router; 