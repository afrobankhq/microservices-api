import axios from 'axios';

class CardCustomersController {
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

  // Get all customers
  async getAllCustomers(req, res) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      
      let endpoint = `/v1/customers?page=${page}&limit=${limit}`;
      
      if (status) endpoint += `&status=${status}`;
      if (search) endpoint += `&search=${encodeURIComponent(search)}`;

      const customers = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: customers,
        message: 'Customers retrieved successfully'
      });
    } catch (error) {
      console.error('[GET ALL CUSTOMERS ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve customers'
      });
    }
  }

  // Get a specific customer by ID
  async getCustomer(req, res) {
    try {
      const { customerId } = req.params;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const endpoint = `/v1/customers/${customerId}`;
      const customer = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: customer,
        message: 'Customer retrieved successfully'
      });
    } catch (error) {
      console.error('[GET CUSTOMER ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve customer'
      });
    }
  }

  // Create a new customer
  async createCustomer(req, res) {
    try {
      const { 
        first_name, 
        last_name, 
        email, 
        phone, 
        date_of_birth,
        address,
        metadata = {}
      } = req.body;

      if (!first_name || !last_name || !email) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: first_name, last_name, email'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Validate phone format (basic validation)
      if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format'
        });
      }

      const customerData = {
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        metadata
      };

      const endpoint = '/v1/customers';
      const newCustomer = await this.makeSwervpayRequest(endpoint, 'POST', customerData);

      res.status(201).json({
        success: true,
        data: newCustomer,
        message: 'Customer created successfully'
      });
    } catch (error) {
      console.error('[CREATE CUSTOMER ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create customer'
      });
    }
  }

  // Update customer details
  async updateCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const updateData = req.body;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No update data provided'
        });
      }

      // Validate email if being updated
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid email format'
          });
        }
      }

      // Validate phone if being updated
      if (updateData.phone && !/^\+?[\d\s\-\(\)]+$/.test(updateData.phone)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number format'
        });
      }

      const endpoint = `/v1/customers/${customerId}`;
      const updatedCustomer = await this.makeSwervpayRequest(endpoint, 'PUT', updateData);

      res.json({
        success: true,
        data: updatedCustomer,
        message: 'Customer updated successfully'
      });
    } catch (error) {
      console.error('[UPDATE CUSTOMER ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update customer'
      });
    }
  }

  // Submit KYC (Know Your Customer) information
  async submitKYC(req, res) {
    try {
      const { customerId } = req.params;
      const { 
        document_type,
        document_number,
        document_front,
        document_back,
        selfie,
        address_proof,
        additional_documents = []
      } = req.body;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      if (!document_type || !document_number || !document_front) {
        return res.status(400).json({
          success: false,
          error: 'Missing required KYC fields: document_type, document_number, document_front'
        });
      }

      // Validate document type
      const validDocumentTypes = ['passport', 'national_id', 'drivers_license', 'voters_card'];
      if (!validDocumentTypes.includes(document_type)) {
        return res.status(400).json({
          success: false,
          error: `Invalid document type. Supported types: ${validDocumentTypes.join(', ')}`
        });
      }

      const kycData = {
        document_type,
        document_number,
        document_front,
        document_back,
        selfie,
        address_proof,
        additional_documents
      };

      const endpoint = `/v1/customers/${customerId}/kyc`;
      const kycResult = await this.makeSwervpayRequest(endpoint, 'POST', kycData);

      res.json({
        success: true,
        data: kycResult,
        message: 'KYC submitted successfully'
      });
    } catch (error) {
      console.error('[SUBMIT KYC ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to submit KYC'
      });
    }
  }

  // Get KYC status
  async getKYCStatus(req, res) {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const endpoint = `/v1/customers/${customerId}/kyc`;
      const kycStatus = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: kycStatus,
        message: 'KYC status retrieved successfully'
      });
    } catch (error) {
      console.error('[GET KYC STATUS ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve KYC status'
      });
    }
  }

  // Blacklist a customer
  async blacklistCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const { reason, notes } = req.body;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      if (!reason) {
        return res.status(400).json({
          success: false,
          error: 'Reason is required for blacklisting'
        });
      }

      const blacklistData = {
        reason,
        notes: notes || ''
      };

      const endpoint = `/v1/customers/${customerId}/blacklist`;
      const blacklistResult = await this.makeSwervpayRequest(endpoint, 'POST', blacklistData);

      res.json({
        success: true,
        data: blacklistResult,
        message: 'Customer blacklisted successfully'
      });
    } catch (error) {
      console.error('[BLACKLIST CUSTOMER ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to blacklist customer'
      });
    }
  }

  // Remove customer from blacklist
  async removeFromBlacklist(req, res) {
    try {
      const { customerId } = req.params;
      const { reason } = req.body;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const removeData = {
        reason: reason || 'Customer removed from blacklist'
      };

      const endpoint = `/v1/customers/${customerId}/blacklist/remove`;
      const removeResult = await this.makeSwervpayRequest(endpoint, 'POST', removeData);

      res.json({
        success: true,
        data: removeResult,
        message: 'Customer removed from blacklist successfully'
      });
    } catch (error) {
      console.error('[REMOVE FROM BLACKLIST ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to remove customer from blacklist'
      });
    }
  }

  // Get customer blacklist status
  async getBlacklistStatus(req, res) {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          error: 'Customer ID is required'
        });
      }

      const endpoint = `/v1/customers/${customerId}/blacklist`;
      const blacklistStatus = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: blacklistStatus,
        message: 'Blacklist status retrieved successfully'
      });
    } catch (error) {
      console.error('[GET BLACKLIST STATUS ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve blacklist status'
      });
    }
  }

  // Validate customer creation request
  async validateCustomerRequest(req, res) {
    try {
      const { first_name, last_name, email, phone, date_of_birth } = req.body;
      const errors = [];

      if (!first_name) errors.push('First name is required');
      if (!last_name) errors.push('Last name is required');
      if (!email) errors.push('Email is required');

      if (first_name && first_name.length < 2) {
        errors.push('First name must be at least 2 characters long');
      }

      if (last_name && last_name.length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push('Invalid email format');
        }
      }

      if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
        errors.push('Invalid phone number format');
      }

      if (date_of_birth) {
        const birthDate = new Date(date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (isNaN(birthDate.getTime())) {
          errors.push('Invalid date of birth format');
        } else if (age < 18) {
          errors.push('Customer must be at least 18 years old');
        } else if (age > 120) {
          errors.push('Invalid date of birth');
        }
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
        message: 'Customer request validation passed',
        data: {
          first_name,
          last_name,
          email,
          phone,
          date_of_birth
        }
      });
    } catch (error) {
      console.error('[VALIDATE CUSTOMER REQUEST ERROR]', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate customer request'
      });
    }
  }

  // Search customers
  async searchCustomers(req, res) {
    try {
      const { query, page = 1, limit = 10, status } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      let endpoint = `/v1/customers/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
      
      if (status) endpoint += `&status=${status}`;

      const searchResults = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: searchResults,
        message: 'Customer search completed successfully'
      });
    } catch (error) {
      console.error('[SEARCH CUSTOMERS ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search customers'
      });
    }
  }

  // Get customer statistics
  async getCustomerStats(req, res) {
    try {
      const { period = 'month' } = req.query;

      const validPeriods = ['day', 'week', 'month', 'year'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          error: `Invalid period. Supported periods: ${validPeriods.join(', ')}`
        });
      }

      const endpoint = `/v1/customers/stats?period=${period}`;
      const stats = await this.makeSwervpayRequest(endpoint);

      res.json({
        success: true,
        data: stats,
        message: 'Customer statistics retrieved successfully'
      });
    } catch (error) {
      console.error('[GET CUSTOMER STATS ERROR]', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve customer statistics'
      });
    }
  }
}

export default new CardCustomersController();
