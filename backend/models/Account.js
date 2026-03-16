import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accountNumber: { type: String, required: true, unique: true },
  accountType: { type: String, enum: ['savings', 'current'], default: 'savings' },
  balance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'blocked', 'pending'], default: 'active' },
  ifscCode: { type: String, default: 'INDB0001234' },
  createdAt: { type: Date, default: Date.now }
});

const Account = mongoose.model('Account', accountSchema);
export default Account;
