import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import TransactionHistory from '../components/TransactionHistory';
import TransferModal from '../components/TransferModal';
import { Send, History } from 'lucide-react';
import './Transfers.css';

const Transfers = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const accRes = await axios.get('http://localhost:5000/api/accounts/my-account', config);
      setAccount(accRes.data);
      const transRes = await axios.get('http://localhost:5000/api/transactions', config);
      setTransactions(transRes.data.filter(t => t.type === 'transfer'));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="text-center mt-4">Loading transfers...</div>;

  return (
    <div className="transfers-page animate-fade-in">
      <h2 className="page-title">Fund Transfer</h2>
      <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Send money instantly to any IndiaBank account holder.</p>

      <div className="transfers-grid">
        <div className="transfers-left">
          <div className="glass-panel transfer-action-card">
            <div className="transfer-action-icon">
              <Send size={22} color="white" />
            </div>
            <h3>New Transfer</h3>
            <p className="text-muted text-sm">Transfer up to ₹2,00,000 per day to registered beneficiaries.</p>
            <button className="btn btn-primary w-full mt-4" onClick={() => setIsTransferModalOpen(true)}>
              Initiate Transfer
            </button>
          </div>

          <div className="glass-panel transfer-info-card">
            <h4>Your Account</h4>
            <div className="info-row">
              <span className="text-muted">Account No.</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{account?.accountNumber}</span>
            </div>
            <div className="info-row">
              <span className="text-muted">Balance</span>
              <span className="text-success" style={{ fontWeight: 700 }}>
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(account?.balance || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="transfers-right">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="section-header">
              <History size={18} style={{ color: 'var(--primary)' }} />
              <h3>Transfer History</h3>
            </div>
            <TransactionHistory transactions={transactions} currentAccountId={account?._id} />
          </div>
        </div>
      </div>

      {isTransferModalOpen && (
        <TransferModal 
          onClose={() => setIsTransferModalOpen(false)} 
          onSuccess={fetchData} 
        />
      )}
    </div>
  );
};

export default Transfers;
