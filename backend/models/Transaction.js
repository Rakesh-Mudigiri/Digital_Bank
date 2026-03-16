import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: ['deposit', 'withdrawal', 'transfer', 'bill_payment'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  recipientAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
  transferMode: { type: String, enum: ['internal', 'neft', 'imps', 'na'], default: 'na' },
  transactionRef: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate transaction reference before save
transactionSchema.pre('save', function() {
  if (!this.transactionRef) {
    this.transactionRef = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
