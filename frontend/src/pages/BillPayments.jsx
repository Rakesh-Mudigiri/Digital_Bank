import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Zap, Droplets, Smartphone, Flame, Wifi, Receipt } from 'lucide-react';
import './BillPayments.css';

const billers = [
  { name: 'BESCOM Electricity', category: 'electricity', icon: Zap, color: '#f59e0b' },
  { name: 'BWSSB Water', category: 'water', icon: Droplets, color: '#3b82f6' },
  { name: 'Jio Mobile', category: 'mobile', icon: Smartphone, color: '#6366f1' },
  { name: 'HP Gas', category: 'gas', icon: Flame, color: '#ef4444' },
  { name: 'ACT Fibernet', category: 'internet', icon: Wifi, color: '#10b981' },
];

const BillPayments = () => {
  const { user } = useContext(AuthContext);
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [amount, setAmount] = useState('');
  const [consumerNo, setConsumerNo] = useState('');
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bills', config);
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await axios.post('http://localhost:5000/api/bills/pay', {
        billerName: selectedBiller.name,
        billerCategory: selectedBiller.category,
        amount: Number(amount),
        consumerNumber: consumerNo
      }, config);
      setMessage(`₹${Number(amount).toLocaleString('en-IN')} paid to ${selectedBiller.name} successfully!`);
      setAmount(''); setConsumerNo(''); setSelectedBiller(null);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="bill-page animate-fade-in">
      <h2 className="page-title">Bill Payments</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!selectedBiller ? (
        <div className="biller-grid">
          {billers.map((b) => (
            <button key={b.name} className="glass-panel biller-card" onClick={() => setSelectedBiller(b)}>
              <div className="biller-icon" style={{ background: `${b.color}20`, color: b.color }}>
                <b.icon size={24} />
              </div>
              <span className="biller-name">{b.name}</span>
              <span className="biller-cat">{b.category}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="glass-panel pay-form-card">
          <div className="pay-header">
            <div className="biller-icon" style={{ background: `${selectedBiller.color}20`, color: selectedBiller.color }}>
              <selectedBiller.icon size={24} />
            </div>
            <div>
              <h3>{selectedBiller.name}</h3>
              <span className="text-muted text-sm">{selectedBiller.category}</span>
            </div>
          </div>
          <form onSubmit={handlePay}>
            <div className="form-group">
              <label className="form-label">Consumer / Account Number</label>
              <input type="text" className="form-input" value={consumerNo}
                onChange={(e) => setConsumerNo(e.target.value)} placeholder="Enter consumer number" required />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input type="number" className="form-input" value={amount}
                onChange={(e) => setAmount(e.target.value)} placeholder="500" min="1" required />
            </div>
            <div className="btn-row">
              <button type="button" className="btn btn-outline" onClick={() => setSelectedBiller(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Pay Now</button>
            </div>
          </form>
        </div>
      )}

      {history.length > 0 && (
        <div className="glass-panel mt-6" style={{ padding: '1.5rem' }}>
          <h3 className="section-title"><Receipt size={18} /> Payment History</h3>
          <div className="bill-history">
            {history.map((b) => (
              <div key={b._id} className="history-item">
                <div>
                  <strong>{b.billerName}</strong>
                  <span className="text-muted text-xs"> • {new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <span className="text-danger font-bold">{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillPayments;
