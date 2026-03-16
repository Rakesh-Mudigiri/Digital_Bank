import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import billRoutes from './routes/billRoutes.js';
import fdRoutes from './routes/fdRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import User from './models/User.js';
import Account from './models/Account.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/fd', fdRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// Serve frontend statically
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});

// Seed admin user on startup
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@indiabank.com' });
    if (!adminExists) {
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@indiabank.com',
        password: 'admin',
        phone: '+91 0000000000',
        role: 'admin',
      });
      await Account.create({
        user: admin._id,
        accountNumber: '0000000001',
        accountType: 'savings',
        balance: 50000,
        ifscCode: 'INDB0001234',
      });
      console.log('✅ Admin user seeded (admin@indiabank.com / admin)');
    }
  } catch (err) {
    console.error('Admin seed error:', err.message);
  }
};

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully (Use MongoDB Compass to view)');
    seedAdmin();
  })
  .catch(err => console.error('MongoDB connection error:', err));

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message, err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

