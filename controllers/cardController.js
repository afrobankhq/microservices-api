// controllers/cardController.js
import * as swervpay from '../services/swervpay.js';
import { db } from '../firebase.js';
import { users } from '../constants/collections.js';
import admin from 'firebase-admin';

// ===== CUSTOMER CONTROLLERS =====

/**
 * Create a new customer in Swervpay
 */
export const createCustomer = async (req, res) => {
  const { firstname, lastname, email, phone, country, middlename } = req.body;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!firstname || !lastname || !email || !phone || !country) {
    return res.status(400).json({
      error: 'firstname, lastname, email, phone, and country are required'
    });
  }

  try {
    // Check if customer already exists in Swervpay
    const existingCustomers = await swervpay.getAllCustomers();
    const existingCustomer = existingCustomers.data?.find(
      customer => customer.phone === phone
    );

    if (existingCustomer) {
      return res.status(400).json({
        error: 'Customer already exists',
        customer_id: existingCustomer.id
      });
    }

    // Create customer in Swervpay
    const customerData = {
      firstname,
      middlename: middlename || '',
      lastname,
      email,
      phoneNumber: phone,
      country
    };

    const customer = await swervpay.createCustomer(customerData);
    console.log('✅ Customer created:', customer);  

    // Store Swervpay customer ID in Firebase
    await db.collection(users).doc(phoneNumber).update({
      swervpay_customer_id: customer.id,
      updatedAt: new Date()
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer: customer
    });
  } catch (error) {
    console.error('❌ Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

/**
 * Get customer details
 */
export const getCustomer = async (req, res) => {
  const phoneNumber = req.user?.phoneNumber;
  

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get user from Firebase to find Swervpay customer ID
    const userSnapshot = await db.collection(users).doc(phoneNumber).get();
    

    if (!userSnapshot.exists) {

      return res.status(404).json({ error: 'User not found' });
    }

    const user = userSnapshot.data();
    const customerId = user.swervpay_customer_id;

    if (!customerId) {
      return res.status(404).json({ error: 'Customer not found in Swervpay' });
    }

    const customer = await swervpay.getCustomer(customerId);
    await db.collection(users).doc(phoneNumber).update({
      firstname: customer.firstname,
      middlename: customer.middlename,
      lastname: customer.lastname,
      email: customer.email,
      phone: customer.phone,
      country: customer.country,
      swervpay_customer_id: customer.id,
      updatedAt: new Date()
    });
    res.json(customer);
  } catch (error) {
    console.error('❌ Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

// ===== CARD CONTROLLERS =====

/**
 * Create a card for authenticated user
 */
export const createCard = async (req, res) => {
  const { currency, issuer, name_on_card, expiry_date, amount, type } = req.body;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!currency || !issuer || !name_on_card || !expiry_date || !type) {
    return res.status(400).json({
      error: 'currency, issuer, name_on_card, expiry_date, and type are required'
    });
  }

  try {
    // Get user from Firebase to find Swervpay customer ID
    const userSnapshot = await db.collection(users).doc(phoneNumber).get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userSnapshot.data();
    const customerId = user.swervpay_customer_id;

    if (!customerId) {
      return res.status(400).json({
        error: 'Customer must be created before issuing a card'
      });
    }

    // Create card data
    const cardData = {
      customer_id: customerId,
      currency,
      issuer,
      name_on_card,
      expiry_date,
      type,
      ...(amount && { amount })
    };

    const card = await swervpay.createCard(cardData);

    // Store card info in Firebase
    await db.collection(users).doc(phoneNumber).update({
      cards: admin.firestore.FieldValue.arrayUnion({
        id: card.data.id,
        type: card.data.type,
        currency: card.data.currency,
        created_at: new Date()
      }),
      updatedAt: new Date()
    });

    res.status(201).json({
      message: 'Card created successfully',
      card: card.data
    });
  } catch (error) {
    console.error('❌ Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
};

/**
 * Get card details
 */
export const getCard = async (req, res) => {
  const { cardId } = req.params;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const card = await swervpay.getCard(cardId);
    res.json(card.data);
  } catch (error) {
    console.error('❌ Get card error:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
};

/**
 * Get all cards for authenticated user
 */
export const getAllCards = async (req, res) => {
  const phoneNumber = req.user?.phoneNumber;
  const { page = 1, limit = 10 } = req.query;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const cards = await swervpay.getAllCards(page, limit);
    res.json(cards);
  } catch (error) {
    console.error('❌ Get all cards error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

/**
 * Fund a card
 */
export const fundCard = async (req, res) => {
  const { cardId } = req.params;
  const { amount } = req.body;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  try {
    const result = await swervpay.fundCard(cardId, amount);
    res.json({
      message: 'Card funded successfully',
      result: result.data
    });
  } catch (error) {
    console.error('❌ Fund card error:', error);
    res.status(500).json({ error: 'Failed to fund card' });
  }
};

/**
 * Withdraw from card
 */
export const withdrawFromCard = async (req, res) => {
  const { cardId } = req.params;
  const { amount } = req.body;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  try {
    const result = await swervpay.withdrawFromCard(cardId, amount);
    res.json({
      message: 'Withdrawal successful',
      result: result.data
    });
  } catch (error) {
    console.error('❌ Withdraw from card error:', error);
    res.status(500).json({ error: 'Failed to withdraw from card' });
  }
};

/**
 * Freeze a card
 */
export const freezeCard = async (req, res) => {
  const { cardId } = req.params;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await swervpay.freezeCard(cardId);
    res.json({
      message: 'Card frozen successfully',
      result: result.data
    });
  } catch (error) {
    console.error('❌ Freeze card error:', error);
    res.status(500).json({ error: 'Failed to freeze card' });
  }
};

/**
 * Unfreeze a card
 */
export const unfreezeCard = async (req, res) => {
  const { cardId } = req.params;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await swervpay.unfreezeCard(cardId);
    res.json({
      message: 'Card unfrozen successfully',
      result: result.data
    });
  } catch (error) {
    console.error('❌ Unfreeze card error:', error);
    res.status(500).json({ error: 'Failed to unfreeze card' });
  }
};

/**
 * Terminate a card
 */
export const terminateCard = async (req, res) => {
  const { cardId } = req.params;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await swervpay.terminateCard(cardId);

    // Remove card from Firebase user record
    await db.collection(users).doc(phoneNumber).update({
      cards: admin.firestore.FieldValue.arrayRemove({
        id: cardId
      }),
      updatedAt: new Date()
    });

    res.json({
      message: 'Card terminated successfully',
      result: result.data
    });
  } catch (error) {
    console.error('❌ Terminate card error:', error);
    res.status(500).json({ error: 'Failed to terminate card' });
  }
};

/**
 * Get card transactions
 */
export const getCardTransactions = async (req, res) => {
  const { cardId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const transactions = await swervpay.getCardTransactions(cardId, page, limit);
    res.json(transactions);
  } catch (error) {
    console.error('❌ Get card transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch card transactions' });
  }
};