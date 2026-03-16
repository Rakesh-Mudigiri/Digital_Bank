import express from 'express';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Daily transfer limit
const DAILY_LIMIT = 200000; // ₹2,00,000

// @route   GET /api/transactions
// @desc    Get all transactions for logged in user's account
router.get('/', protect, async (req, res) => {
  try {
    const account = await Account.findOne({ user: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const transactions = await Transaction.find({
      $or: [
        { account: account._id },
        { recipientAccount: account._id }
      ]
    }).sort({ createdAt: -1 })
      .populate('account', 'accountNumber')
      .populate('recipientAccount', 'accountNumber');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/transactions/transfer
// @desc    Transfer money to another account
router.post('/transfer', protect, async (req, res) => {
  try {
    const { recipientAccountNumber, amount, description, transferMode } = req.body;
    const transferAmount = Number(amount);

    const senderAccount = await Account.findOne({ user: req.user.id });
    const recipientAccount = await Account.findOne({ accountNumber: recipientAccountNumber });

    if (!senderAccount) return res.status(404).json({ message: 'Sender account not found' });
    if (!recipientAccount) return res.status(404).json({ message: 'Recipient account not found' });
    if (senderAccount._id.toString() === recipientAccount._id.toString()) {
      return res.status(400).json({ message: 'Cannot transfer to the same account' });
    }
    if (transferAmount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });
    if (senderAccount.balance < transferAmount) return res.status(400).json({ message: 'Insufficient funds' });

    // Check daily limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaysTransfers = await Transaction.aggregate([
      { $match: { account: senderAccount._id, type: 'transfer', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todayTotal = todaysTransfers[0]?.total || 0;
    if (todayTotal + transferAmount > DAILY_LIMIT) {
      return res.status(400).json({ message: `Daily transfer limit of ₹${DAILY_LIMIT.toLocaleString('en-IN')} exceeded` });
    }

    // Perform transfer
    senderAccount.balance -= transferAmount;
    recipientAccount.balance += transferAmount;
    
    await senderAccount.save();
    await recipientAccount.save();

    const transaction = await Transaction.create({
      account: senderAccount._id,
      type: 'transfer',
      amount: transferAmount,
      description: description || 'Fund Transfer',
      recipientAccount: recipientAccount._id,
      status: 'success',
      transferMode: transferMode || 'internal'
    });

    await Notification.create({
      user: senderAccount.user,
      message: `Transfer of ₹${transferAmount.toLocaleString('en-IN')} to Account ${recipientAccount.accountNumber} was successful.`,
      type: 'transfer'
    });

    await Notification.create({
      user: recipientAccount.user,
      message: `You received ₹${transferAmount.toLocaleString('en-IN')} from Account ${senderAccount.accountNumber}.`,
      type: 'transfer'
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/transactions/deposit
router.post('/deposit', protect, async (req, res) => {
  try {
    const { amount, description } = req.body;
    const depositAmount = Number(amount);
    const account = await Account.findOne({ user: req.user.id });

    if (!account) return res.status(404).json({ message: 'Account not found' });
    if (depositAmount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });

    account.balance += depositAmount;
    await account.save();

    const transaction = await Transaction.create({
      account: account._id,
      type: 'deposit',
      amount: depositAmount,
      description: description || 'Cash Deposit',
      status: 'success'
    });

    await Notification.create({
      user: account.user,
      message: `Cash deposit of ₹${depositAmount.toLocaleString('en-IN')} was successful.`,
      type: 'deposit'
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/transactions/withdraw
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, description } = req.body;
    const withdrawAmount = Number(amount);
    const account = await Account.findOne({ user: req.user.id });

    if (!account) return res.status(404).json({ message: 'Account not found' });
    if (account.balance < withdrawAmount) return res.status(400).json({ message: 'Insufficient funds' });
    if (withdrawAmount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });

    account.balance -= withdrawAmount;
    await account.save();

    const transaction = await Transaction.create({
      account: account._id,
      type: 'withdrawal',
      amount: withdrawAmount,
      description: description || 'Cash Withdrawal',
      status: 'success'
    });

    await Notification.create({
      user: account.user,
      message: `Cash withdrawal of ₹${withdrawAmount.toLocaleString('en-IN')} was successful.`,
      type: 'withdrawal'
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
