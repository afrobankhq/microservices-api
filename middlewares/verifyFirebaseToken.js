import { admin } from '../firebase.js';

export const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No Firebase token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.phoneNumber = decodedToken.phone_number;
    next();
  } catch (error) {
    console.error('Invalid Firebase token:', error);
    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
};
