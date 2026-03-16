import { useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { X, Send, CheckCircle } from 'lucide-react';
import './TransferModal.css';

const TransferModal = ({ onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [recipientAccountNumber, setRecipientAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.post('http://localhost:5000/api/transactions/transfer', {
        recipientAccountNumber,
        amount: Number(amount),
        description
      }, config);
      
      setLoading(false);
      onSuccess();
      setSuccessMode(true);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Transfer failed');
    }
  };

  const modalContent = (
    <div className="modal-overlay">
      {successMode ? (
        <div className="modal-content glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <CheckCircle size={64} style={{ color: '#10b981' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-bright)', marginBottom: '0.5rem' }}>
            Transfer Successful
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })} has been sent securely to Account {recipientAccountNumber}.
          </p>
          <button className="btn btn-primary w-full" onClick={onClose}>
            Done
          </button>
        </div>
      ) : (
        <div className="modal-content glass-panel">
          <div className="modal-header">
            <h3>Transfer Funds</h3>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Recipient Account Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 1029384756"
                value={recipientAccountNumber}
                onChange={(e) => setRecipientAccountNumber(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0.00"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="For dinner..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
              {loading ? 'Processing...' : <><Send size={18} /> Send Money</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default TransferModal;
