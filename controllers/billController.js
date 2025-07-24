// controllers/billController.js
import * as swervpaybills from '../services/swervpaybills.js';

export const fetchBillCategories = async (req, res) => {
  try {
    const categories = await swervpaybills.getBillCategories();
    res.status(200).json(categories);
    console.log(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const fetchBillCategoryList = async (req, res) => {
    try {
      const { categoryId } = req.params;
      const list = await swervpaybills.getBillCategoryList(categoryId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const fetchBillCategoryItems = async (req, res) => {
    try {
      const { categoryId, itemId } = req.params;
      const items = await swervpaybills.getBillCategoryItems(categoryId, itemId);
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

export const payBill = async (req, res) => {
  try {
    const result = await swervpaybills.createBillPayment(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};