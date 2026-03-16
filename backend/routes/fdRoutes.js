import express from 'express';
import FixedDeposit from '../models/FixedDeposit.js';
import Account from '../models/Account.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/fd/create
router.post('/create', protect, async (req, res) => {
  try {
    const { amount, tenure } = req.body;
    const fdAmount = Number(amount);

    const account = await Account.findOne({ user: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    if (account.balance < fdAmount) return res.status(400).json({ message: 'Insufficient funds' });
    if (fdAmount < 1000) return res.status(400).json({ message: 'Minimum FD amount is ₹1,000' });

    account.balance -= fdAmount;
    await account.save();

    const fd = await FixedDeposit.create({
      user: req.user.id,
      account: account._id,
      amount: fdAmount,
      tenure: Number(tenure)
    });

    await Notification.create({
      user: req.user.id,
      message: `Fixed Deposit of ₹${fdAmount.toLocaleString('en-IN')} created for ${tenure} months.`,
      type: 'fd'
    });

    res.status(201).json(fd);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/fd
router.get('/', protect, async (req, res) => {
  try {
    const fds = await FixedDeposit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(fds);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/fd/:id/break
router.put('/:id/break', protect, async (req, res) => {
  try {
    const fd = await FixedDeposit.findById(req.params.id);
    if (!fd || fd.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'FD not found' });
    }
    if (fd.status !== 'active') {
      return res.status(400).json({ message: 'FD is not active' });
    }

    fd.status = 'broken';
    await fd.save();

    // Return principal to account (no interest on break)
    const account = await Account.findById(fd.account);
    account.balance += fd.amount;
    await account.save();

    res.json({ message: 'FD broken. Principal returned to account.', fd });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
