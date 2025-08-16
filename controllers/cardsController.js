import axios from 'axios';

class CardsController {
  constructor() {
    this.baseURL = process.env.SWERVPAY_API_URL || 'https://api.swervpay.co';
    this.apiKey = process.env.SWERVPAY_API_KEY;
    this.secretKey = process.env.SWERVPAY_SECRET_KEY;
  }

  // Helper method to make authenticated requests to Swervpay
  async makeSwervpayRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Secret-Key': this.secretKey
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('[SWERVPAY API ERROR]', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Swervpay API request failed');
    }
  }

  // Get all cards for a customer
  async getAllCards(req, res) {
    try {
      const { customerId, page = 1, limit = 10 } = req.query;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const endpoint = `/v1/cards?customer_id=${customerId}&page=${page}&limit=${limit}`;
      const cards = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: cards,
        message: 'Cards retrieved successfully'
      });
    } catch (error) {
      console.error('[GET ALL CARDS ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve cards'
      });
    }
  }

  // Get a specific card by ID
  async getCard(req, res) {
    try {
      const { cardId } = req.params;
      
      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      const endpoint = `/v1/cards/${cardId}`;
      const card = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: card,
        message: 'Card retrieved successfully'
      });
    } catch (error) {
      console.error('[GET CARD ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve card'
      });
    }
  }

  // Create a new card
  async createCard(req, res) {
    try {
      const { 
        customer_id, 
        card_type, 
        cardholder_name, 
        currency = 'USD',
        metadata = {}
      } = req.body;

      if (!customer_id || !card_type || !cardholder_name) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: customer_id, card_type, cardholder_name'
        });
      }

      const cardData = {
        customer_id,
        card_type,
        cardholder_name,
        currency,
        metadata
      };

      const endpoint = '/v1/cards';
      const newCard = await this.makeSwervpayRequest(endpoint, 'POST', cardData);

      res.status(201).json({
        success: true,
        data: newCard,
        message: 'Card created successfully'
      });
    } catch (error) {
      console.error('[CREATE CARD ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create card'
      });
    }
  }

  // Fund a card
  async fundCard(req, res) {
    try {
      const { cardId } = req.params;
      const { amount, currency = 'USD', source = 'wallet', description } = req.body;

      if (!cardId || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Card ID and amount are required'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be greater than 0'
        });
      }

      const fundData = {
        amount,
        currency,
        source,
        description
      };

      const endpoint = `/v1/cards/${cardId}/fund`;
      const fundResult = await this.makeSwervpayRequest(endpoint, 'POST', fundData);

      res.json({
        success: true,
        data: fundResult,
        message: 'Card funded successfully'
      });
    } catch (error) {
      console.error('[FUND CARD ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fund card'
      });
    }
  }

  // Withdraw from a card
  async withdrawFromCard(req, res) {
    try {
      const { cardId } = req.params;
      const { amount, currency = 'USD', destination, description } = req.body;

      if (!cardId || !amount || !destination) {
        return res.status(400).json({
          success: false,
          error: 'Card ID, amount, and destination are required'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be greater than 0'
        });
      }

      const withdrawData = {
        amount,
        currency,
        destination,
        description
      };

      const endpoint = `/v1/cards/${cardId}/withdraw`;
      const withdrawResult = await this.makeSwervpayRequest(endpoint, 'POST', withdrawData);

      res.json({
        success: true,
        data: withdrawResult,
        message: 'Withdrawal from card successful'
      });
    } catch (error) {
      console.error('[WITHDRAW FROM CARD ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to withdraw from card'
      });
    }
  }

  // Freeze a card
  async freezeCard(req, res) {
    try {
      const { cardId } = req.params;
      const { reason } = req.body;

      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      const freezeData = reason ? { reason } : {};
      const endpoint = `/v1/cards/${cardId}/freeze`;
      const freezeResult = await this.makeSwervpayRequest(endpoint, 'POST', freezeData);

      res.json({
        success: true,
        data: freezeResult,
        message: 'Card frozen successfully'
      });
    } catch (error) {
      console.error('[FREEZE CARD ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to freeze card'
      });
    }
  }

  // Unfreeze a card
  async unfreezeCard(req, res) {
    try {
      const { cardId } = req.params;

      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      const endpoint = `/v1/cards/${cardId}/unfreeze`;
      const unfreezeResult = await this.makeSwervpayRequest(endpoint, 'POST');

      res.json({
        success: true,
        data: unfreezeResult,
        message: 'Card unfrozen successfully'
      });
    } catch (error) {
      console.error('[UNFREEZE CARD ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to unfreeze card'
      });
    }
  }

  // Terminate a card
  async terminateCard(req, res) {
    try {
      const { cardId } = req.params;
      const { reason } = req.body;

      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      const terminateData = reason ? { reason } : {};
      const endpoint = `/v1/cards/${cardId}/terminate`;
      const terminateResult = await this.makeSwervpayRequest(endpoint, 'POST', terminateData);

      res.json({
        success: true,
        data: terminateResult,
        message: 'Card terminated successfully'
      });
    } catch (error) {
      console.error('[TERMINATE CARD ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to terminate card'
      });
    }
  }

  // Get card transactions
  async getCardTransactions(req, res) {
    try {
      const { cardId } = req.params;
      const { page = 1, limit = 10, start_date, end_date, type } = req.query;

      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      let endpoint = `/v1/cards/${cardId}/transactions?page=${page}&limit=${limit}`;
      
      if (start_date) endpoint += `&start_date=${start_date}`;
      if (end_date) endpoint += `&end_date=${end_date}`;
      if (type) endpoint += `&type=${type}`;

      const transactions = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: transactions,
        message: 'Card transactions retrieved successfully'
      });
    } catch (error) {
      console.error('[GET CARD TRANSACTIONS ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve card transactions'
      });
    }
  }

  // Get a specific transaction
  async getTransaction(req, res) {
    try {
      const { cardId, transactionId } = req.params;

      if (!cardId || !transactionId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID and Transaction ID are required'
        });
      }

      const endpoint = `/v1/cards/${cardId}/transactions/${transactionId}`;
      const transaction = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: transaction,
        message: 'Transaction retrieved successfully'
      });
    } catch (error) {
      console.error('[GET TRANSACTION ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve transaction'
      });
    }
  }

  // Update card details
  async updateCard(req, res) {
    try {
      const { cardId } = req.params;
      const updateData = req.body;

      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No update data provided'
        });
      }

      const endpoint = `/v1/cards/${cardId}`;
      const updatedCard = await this.makeSwervpayRequest(endpoint, 'PUT', updateData);

      res.json({
        success: true,
        data: updatedCard,
        message: 'Card updated successfully'
      });
    } catch (error) {
      console.error('[UPDATE CARD ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update card'
      });
    }
  }

  // Get card balance
  async getCardBalance(req, res) {
    try {
      const { cardId } = req.params;

      if (!cardId) {
        return res.status(400).json({
          success: false,
          error: 'Card ID is required'
        });
      }

      const endpoint = `/v1/cards/${cardId}/balance`;
      const balance = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: balance,
        message: 'Card balance retrieved successfully'
      });
    } catch (error) {
      console.error('[GET CARD BALANCE ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve card balance'
      });
    }
  }

  // Validate card creation request
  async validateCardRequest(req, res) {
    try {
      const { customer_id, card_type, cardholder_name, currency } = req.body;
      const errors = [];

      if (!customer_id) errors.push('Customer ID is required');
      if (!card_type) errors.push('Card type is required');
      if (!cardholder_name) errors.push('Cardholder name is required');

      if (cardholder_name && cardholder_name.length < 2) {
        errors.push('Cardholder name must be at least 2 characters long');
      }

      if (cardholder_name && !/^[a-zA-Z\s]+$/.test(cardholder_name)) {
        errors.push('Cardholder name can only contain letters and spaces');
      }

      if (currency && !['USD', 'NGN', 'GBP', 'EUR'].includes(currency)) {
        errors.push('Invalid currency. Supported currencies: USD, NGN, GBP, EUR');
      }

      const validCardTypes = ['physical', 'virtual'];
      if (card_type && !validCardTypes.includes(card_type)) {
        errors.push(`Invalid card type. Supported types: ${validCardTypes.join(', ')}`);
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors,
          message: 'Validation failed'
        });
      }

      res.json({
        success: true,
        message: 'Card request validation passed',
        data: {
          customer_id,
          card_type,
          cardholder_name,
          currency: currency || 'USD'
        }
      });
    } catch (error) {
      console.error('[VALIDATE CARD REQUEST ERROR]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate card request'
      });
    }
  }
}

export default new CardsController();
