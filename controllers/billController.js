// controllers/billController.js
import * as swervpaybills from '../services/swervpaybills.js';

export const fetchBillCategories = async (req, res) => {
  try {
    const categories = await swervpaybills.getBillCategories();
    res.status(200).json(categories);
  } catch (err) {
    console.error('Error fetching bill categories:', err);
    res.status(500).json({ 
      error: 'Failed to fetch bill categories',
      message: err.message 
    });
  }
};

export const fetchBillCategoryList = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const list = await swervpaybills.getBillCategoryList(categoryId);
    res.status(200).json(list);
  } catch (err) {
    console.error('Error fetching bill category list:', err);
    res.status(500).json({ 
      error: 'Failed to fetch bill category list',
      message: err.message 
    });
  }
};

export const fetchBillCategoryItems = async (req, res) => {
  try {
    const { categoryId, itemId } = req.params;
    
    if (!categoryId || !itemId) {
      return res.status(400).json({ 
        error: 'Category ID and Item ID are required' 
      });
    }

    const items = await swervpaybills.getBillCategoryItems(categoryId, itemId);
    res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching bill category items:', err);
    res.status(500).json({ 
      error: 'Failed to fetch bill category items',
      message: err.message 
    });
  }
};

export const validateBillCustomer = async (req, res) => {
  try {
    const { billerCode, customerId } = req.body;
    
    if (!billerCode || !customerId) {
      return res.status(400).json({ 
        error: 'Biller code and customer ID are required' 
      });
    }

    const validation = await swervpaybills.validateBillCustomer(billerCode, customerId);
    res.status(200).json(validation);
  } catch (err) {
    console.error('Error validating bill customer:', err);
    res.status(500).json({ 
      error: 'Failed to validate customer',
      message: err.message 
    });
  }
};

export const payBill = async (req, res) => {
  try {
    // Validate required fields
    const { amount, billerCode, customerId } = req.body;
    
    if (!amount || !billerCode || !customerId) {
      return res.status(400).json({ 
        error: 'Amount, biller code, and customer ID are required' 
      });
    }

    const result = await swervpaybills.createBillPayment(req.body);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error processing bill payment:', err);
    res.status(500).json({ 
      error: 'Failed to process bill payment',
      message: err.message 
    });
  }
};