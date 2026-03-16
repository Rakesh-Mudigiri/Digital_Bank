import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PiggyBank, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import './Deposits.css';

const Deposits = () => {
  const { user } = useContext(AuthContext);
  const [fds, setFds] = useState([]);
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState('12');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };
  const interestRate = 6.5;

  const fetchFDs = async () => {
    try { const res = await axios.get('http://localhost:5000/api/fd', config); setFds(res.data); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchFDs(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await axios.post('http://localhost:5000/api/fd/create', { amount: Number(amount), tenure: Number(tenure) }, config);
      setMessage('Fixed Deposit created successfully!');
      setAmount(''); setTenure('12'); setShowForm(false);
      fetchFDs();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create FD'); }
  };

  const handleBreak = async (id) => {
    if (!window.confirm('Are you sure? You will lose interest amount.')) return;
    try {
      await axios.put(`http://localhost:5000/api/fd/${id}/break`, {}, config);
      setMessage('FD broken. Principal returned to account.');
      fetchFDs();
    } catch (err) { setError(err.response?.data?.message || 'Failed to break FD'); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const maturityCalc = () => {
    const r = interestRate / 100;
    const t = Number(tenure) / 12;
    return Math.round(Number(amount) * (1 + r * t));
  };

  return (
    <div className="deposits-page animate-fade-in">
      <div className="page-header-row">
        <h2 className="page-title">Fixed Deposits</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PiggyBank size={16} /> {showForm ? 'Cancel' : 'New FD'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="glass-panel fd-form-card">
          <h3>Create Fixed Deposit</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Amount (₹) — Min ₹1,000</label>
              <input type="number" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} min="1000" required />
            </div>
            <div className="form-group">
              <label className="form-label">Tenure (Months)</label>
              <select className="form-input" value={tenure} onChange={(e) => setTenure(e.target.value)}>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
                <option value="60">60 Months</option>
              </select>
            </div>
            {amount && Number(amount) >= 1000 && (
              <div className="fd-preview">
                <div><span className="text-muted">Interest Rate:</span> <strong>{interestRate}% p.a.</strong></div>
                <div><span className="text-muted">Maturity Amount:</span> <strong className="text-success">{formatCurrency(maturityCalc())}</strong></div>
                <div><span className="text-muted">Interest Earned:</span> <strong className="text-success">{formatCurrency(maturityCalc() - Number(amount))}</strong></div>
              </div>
            )}
            <button type="submit" className="btn btn-primary mt-4">Create FD</button>
          </form>
        </div>
      )}

      <div className="fd-grid">
        {fds.length === 0 && !showForm && (
          <div className="glass-panel text-center" style={{ padding: '3rem' }}>
            <PiggyBank size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <p className="text-muted">No Fixed Deposits yet. Create one to start earning interest!</p>
          </div>
        )}
        {fds.map((fd) => (
          <div key={fd._id} className="glass-panel fd-card">
            <div className="fd-card-header">
              <span className={`fd-status ${fd.status}`}>{fd.status}</span>
              <span className="text-muted text-xs">{new Date(fd.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="fd-amount">{formatCurrency(fd.amount)}</div>
            <div className="fd-details">
              <div><Calendar size={14} /> <span>{fd.tenure} months @ {fd.interestRate}%</span></div>
              <div><TrendingUp size={14} /> <span>Maturity: {formatCurrency(fd.maturityAmount)}</span></div>
              <div><span className="text-muted">Matures: {new Date(fd.maturityDate).toLocaleDateString('en-IN')}</span></div>
            </div>
            {fd.status === 'active' && (
              <button className="btn btn-danger-outline mt-4" onClick={() => handleBreak(fd._id)}>
                <AlertCircle size={14} /> Break FD
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deposits;
