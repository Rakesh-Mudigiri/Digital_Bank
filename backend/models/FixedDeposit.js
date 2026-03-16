import mongoose from 'mongoose';

const fixedDepositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  amount: { type: Number, required: true },
  tenure: { type: Number, required: true }, // months
  interestRate: { type: Number, default: 6.5 },
  maturityAmount: { type: Number },
  maturityDate: { type: Date },
  status: { type: String, enum: ['active', 'matured', 'broken'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

fixedDepositSchema.pre('save', function() {
  if (!this.maturityAmount) {
    const r = this.interestRate / 100;
    const t = this.tenure / 12;
    this.maturityAmount = Math.round(this.amount * (1 + r * t));
  }
  if (!this.maturityDate) {
    const d = new Date();
    d.setMonth(d.getMonth() + this.tenure);
    this.maturityDate = d;
  }
});

const FixedDeposit = mongoose.model('FixedDeposit', fixedDepositSchema);
export default FixedDeposit;
