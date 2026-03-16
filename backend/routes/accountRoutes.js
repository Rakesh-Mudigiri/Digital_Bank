import express from 'express';
import Account from '../models/Account.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/accounts/my-account
// @desc    Get logged in user's account details
router.get('/my-account', protect, async (req, res) => {
  try {
    const account = await Account.findOne({ user: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/accounts/all
// @desc    Get all other accounts (for transfer — shows name + account number)
router.get('/all', protect, async (req, res) => {
  try {
    const accounts = await Account.find({ user: { $ne: req.user.id }, status: 'active' })
      .populate('user', 'name email');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
