import express from 'express';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = express.Router();

// @route   GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAccounts = await Account.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const depositSum = await Transaction.aggregate([
      { $match: { type: 'deposit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const transferSum = await Transaction.aggregate([
      { $match: { type: 'transfer' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalUsers,
      totalAccounts,
      totalTransactions,
      totalDeposits: depositSum[0]?.total || 0,
      totalTransfers: transferSum[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password -transactionPin').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/transactions
router.get('/transactions', protect, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('account', 'accountNumber')
      .populate('recipientAccount', 'accountNumber');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/block
router.put('/users/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isLocked = !user.isLocked;
    await user.save();
    res.json({ message: `User ${user.isLocked ? 'blocked' : 'unblocked'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/accounts/:id/status
router.put('/accounts/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    account.status = req.body.status; // 'active', 'blocked', 'pending'
    await account.save();
    res.json({ message: `Account status updated to ${account.status}`, account });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
