import express from 'express';
import User from '../models/User.js';
import Account from '../models/Account.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, phone: phone || '' });

    // Create a savings account with auto-generated number
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    await Account.create({
      user: user._id,
      accountNumber,
      accountType: 'savings',
      balance: 10000, // ₹10,000 starting balance for demo
      ifscCode: 'INDB0001234'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isLocked) {
      return res.status(403).json({ message: 'Account is locked. Contact support.' });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      // Reset failed attempts on success
      user.failedLoginAttempts = 0;
      user.loginHistory.push({ ip: req.ip, date: new Date() });
      await user.save();

      // Get account info for response
      const account = await Account.findOne({ user: user._id });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountNumber: account?.accountNumber || '',
        token: generateToken(user._id, user.role),
      });
    } else {
      // Track failed attempts
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
      }
      await user.save();
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -transactionPin');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/set-pin
router.put('/set-pin', protect, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ message: 'PIN must be 4 digits' });
    }

    const user = await User.findById(req.user.id);
    const salt = await bcrypt.genSalt(10);
    user.transactionPin = await bcrypt.hash(pin, salt);
    await user.save();

    res.json({ message: 'Transaction PIN set successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
