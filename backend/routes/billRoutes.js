import express from 'express';
import BillPayment from '../models/BillPayment.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/bills/pay
router.post('/pay', protect, async (req, res) => {
  try {
    const { billerName, billerCategory, amount, consumerNumber } = req.body;
    const payAmount = Number(amount);

    const account = await Account.findOne({ user: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    if (account.balance < payAmount) return res.status(400).json({ message: 'Insufficient funds' });
    if (payAmount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });

    // Deduct balance
    account.balance -= payAmount;
    await account.save();

    // Create bill record
    const bill = await BillPayment.create({
      user: req.user.id,
      account: account._id,
      billerName,
      billerCategory,
      amount: payAmount,
      consumerNumber
    });

    // Create transaction record
    await Transaction.create({
      account: account._id,
      type: 'bill_payment',
      amount: payAmount,
      description: `${billerName} - ${billerCategory}`,
      status: 'success'
    });

    // Create notification
    await Notification.create({
      user: req.user.id,
      message: `Bill payment of ₹${payAmount.toLocaleString('en-IN')} to ${billerName} was successful.`,
      type: 'bill'
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/bills
router.get('/', protect, async (req, res) => {
  try {
    const bills = await BillPayment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
