import { db } from '../firebase.js';
import blockradar from '../services/blockradar.js';

// CNGN contract addresses (update as needed)
const CNGN_CONTRACTS = {
  base: '0x7E29CF1D8b1F4c847D0f821b79dDF6E67A5c11F8',
};

export const getUserDashboard = async (req, res) => {
  try {
    const encodedPhoneNumber = req.params.phoneNumber;
    const phoneNumber = decodeURIComponent(encodedPhoneNumber);
    console.log('📲 Dashboard request for:', phoneNumber);

    const userSnapshot = await db.collection('users').doc(phoneNumber).get();
    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userSnapshot.data();
    const {
      walletAddress,
      blockchain,
      firstName,
      lastName,
      email,
      tier,
      image
    } = user;

    if (!walletAddress || !blockchain) {
      return res.status(400).json({ error: 'User does not have a blockchain wallet' });
    }

    const balances = await blockradar.getTokenBalances(walletAddress);
    const CNGNContract = CNGN_CONTRACTS[blockchain.toLowerCase()];
    if (!CNGNContract) {
      return res.status(400).json({ error: 'CNGN not supported on this chain' });
    }

    const CNGN = balances.tokens?.find(
      (token) => token.contract_address.toLowerCase() === CNGNContract.toLowerCase()
    );

    const result = {
      phoneNumber,
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      tier: tier || 'Tier 1',
      image: image || '',
      walletAddress,
      blockchain,
      CNGNBalance: CNGN ? CNGN.balance : '0',
      CNGNSymbol: CNGN ? CNGN.symbol : 'cNGN',
    };

    return res.json(result);
  } catch (error) {
    console.error('🔥 Error in getUserDashboard:', error);
    return res.status(500).json({ error: 'Failed to fetch user dashboard' });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const encodedPhoneNumber = req.params.phoneNumber;
    const phoneNumber = decodeURIComponent(encodedPhoneNumber);
    console.log('📝 Updating profile for:', phoneNumber);

    const { firstName, lastName, email } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    const userRef = db.collection('users').doc(phoneNumber);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userRef.update({
      firstName,
      lastName,
      email,
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ User profile updated');
    return res.json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('🔥 Error in updateUserProfile:', error);
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const phoneNumber = decodeURIComponent(req.params.phoneNumber);
    console.log('📄 Fetching user info for:', phoneNumber);

    const userSnapshot = await db.collection('users').doc(phoneNumber).get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnapshot.data();
    return res.json(userData);
  } catch (error) {
    console.error('🔥 Error in getUserInfo:', error);
    return res.status(500).json({ error: 'Failed to fetch user info' });
  }
};

export const getUserWallet = async (req, res) => {
  try {
    const phoneNumber = decodeURIComponent(req.params.phoneNumber);
    console.log('💳 Fetching wallet for:', phoneNumber);

    const userSnapshot = await db.collection('users').doc(phoneNumber).get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnapshot.data();

    if (!userData.walletAddress) {
      return res.status(400).json({ error: 'Wallet address not set for user' });
    }

    return res.json({ walletAddress: userData.walletAddress });
  } catch (error) {
    console.error('🔥 Error in getUserWallet:', error);
    return res.status(500).json({ error: 'Failed to fetch wallet address' });
  }
};


export const saveUserInfo = async (req, res) => {
  try {
    const { firstname, lastname, email, tier, joined } = req.body;
    const phoneNumber = decodeURIComponent(req.params.phoneNumber);

    if (!firstname || !lastname || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userRef = db.collection('users').doc(phoneNumber);

    await userRef.set(
      {
        firstname,
        lastname,
        email,
        tier,
        joined,
      },
      { merge: true } // 🔁 merge ensures existing fields (like walletAddress) are not overwritten
    );

    return res.status(200).json({ message: 'User info saved successfully' });
  } catch (err) {
    console.error('Error saving user info:', err);
    return res.status(500).json({ error: 'Failed to save user info' });
  }
};
