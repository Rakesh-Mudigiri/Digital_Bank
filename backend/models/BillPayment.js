import mongoose from 'mongoose';

const billPaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  billerName: { type: String, required: true },
  billerCategory: { type: String, enum: ['electricity', 'water', 'mobile', 'gas', 'internet'], required: true },
  amount: { type: Number, required: true },
  consumerNumber: { type: String, required: true },
  status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
  paymentRef: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

billPaymentSchema.pre('save', function() {
  if (!this.paymentRef) {
    this.paymentRef = 'BILL' + Date.now() + Math.floor(Math.random() * 1000);
  }
});

const BillPayment = mongoose.model('BillPayment', billPaymentSchema);
export default BillPayment;
