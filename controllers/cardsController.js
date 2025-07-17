// controllers/cardsController.js
import swervpay from '../services/swervpaycards.js';
import { db } from '../firebase.js';

export const createCardForUser = async (req, res) => {
  const phoneNumber = req.user?.phoneNumber;

  if (!phoneNumber) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const userDoc = await db.collection('users').doc(phoneNumber).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userDoc.data();

    const payload = {
      customer_id: phoneNumber,
      currency: 'USD',
      issuer: 'MASTERCARD',
      name_on_card: `User ${phoneNumber}`,
      expiry_date: '2026-01-01',
      amount: 0,
      type: 'DEFAULT'
    };

    const swervResponse = await swervpay.createCard(payload);

    if (!swervResponse.data?.data) {
      throw new Error('Invalid response from Swervpay');
    }

    const cardData = swervResponse.data.data;

    // Save card info to Firestore under user
    await db.collection('users').doc(phoneNumber).update({
      swervCard: cardData,
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: 'Card created successfully',
      card: cardData,
    });
  } catch (err) {
    console.error('❌ Card creation error:', err.message);
    res.status(500).json({ error: 'Failed to create card' });
  }
};
