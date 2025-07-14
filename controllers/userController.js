import { db } from '../firebase.js';
import blockradar from '../services/blockradar.js';

// CNGN contract addresses (update as needed)
const CNGN_CONTRACTS = {
  base: '0x7E29CF1D8b1F4c847D0f821b79dDF6E67A5c11F8',
};

export const getUserDashboard = async (req, res) => {
  try {
    // 🔓 Decode the phone number to handle %2B -> +
    const encodedPhoneNumber = req.params.phoneNumber;
    const phoneNumber = decodeURIComponent(encodedPhoneNumber);
    console.log('📲 Dashboard request for:', phoneNumber);

    // 🔍 Fetch user from Firestore
    const userSnapshot = await db.collection('users').doc(phoneNumber).get();
    console.log('📁 Firebase userSnapshot.exists:', userSnapshot.exists);

    if (!userSnapshot.exists) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userSnapshot.data();
    console.log('✅ User data:', user);

    const { walletAddress, blockchain } = user;

    if (!walletAddress || !blockchain) {
      console.log('⚠️ Missing walletAddress or blockchain');
      return res.status(400).json({ error: 'User does not have a blockchain wallet' });
    }

    console.log('🧠 Fetching token balances for:', walletAddress);
    const balances = await blockradar.getTokenBalances(walletAddress);
    console.log('💰 Token balances:', balances);

    const CNGNContract = CNGN_CONTRACTS[blockchain.toLowerCase()];
    if (!CNGNContract) {
      console.log('⚠️ Unsupported blockchain:', blockchain);
      return res.status(400).json({ error: 'CNGN not supported on this chain' });
    }

    const CNGN = balances.tokens?.find(
      (token) => token.contract_address.toLowerCase() === CNGNContract.toLowerCase()
    );
    console.log('✅ Found CNGN token:', CNGN);

    const result = {
      phoneNumber,
      walletAddress,
      blockchain,
      CNGNBalance: CNGN ? CNGN.balance : '0',
      CNGNSymbol: CNGN ? CNGN.symbol : 'cNGN',
    };

    console.log('📤 Sending response:', result);
    return res.json(result);
  } catch (error) {
    console.error('🔥 Error in getUserDashboard:', error);
    return res.status(500).json({ error: 'Failed to fetch user dashboard' });
  }
};
