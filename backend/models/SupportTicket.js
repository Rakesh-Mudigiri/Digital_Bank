import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['account_issue', 'transaction_issue', 'card_issue', 'technical_issue', 'fraud_report', 'general_query'],
    default: 'general_query'
  },
  messages: [
    {
      sender: { type: String, enum: ['user', 'admin'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  status: {
    type: String,
    enum: ['open', 'in_review', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  repliedAt: { type: Date },
}, { timestamps: true });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;
