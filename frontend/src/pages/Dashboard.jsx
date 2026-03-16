import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import TransactionHistory from '../components/TransactionHistory';
import TransferModal from '../components/TransferModal';
import AccountSummary from '../components/AccountSummary';
import QuickActions from '../components/QuickActions';
import Analytics from '../components/Analytics';
import InvestmentCard from '../components/InvestmentCard';
import SecuritySection from '../components/SecuritySection';
import Footer from '../components/Footer';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAccountData = async () => {
    try {
      const token = user.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const accRes = await axios.get('http://localhost:5000/api/accounts/my-account', config);
      setAccount(accRes.data);

      const transRes = await axios.get('http://localhost:5000/api/transactions', config);
      setTransactions(transRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccountData();
    }
  }, [user]);

  const handleTransactionSuccess = () => {
    fetchAccountData();
  };

  if (loading) return <div className="loading-screen text-center mt-4">Loading dashboard...</div>;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-grid">
        
        {/* Left Column: Account Info & Investments */}
        <div className="dashboard-left-col">
          <AccountSummary 
            name={user?.name} 
            balance={account?.balance} 
            accountNumber={account?.accountNumber}
            accountType={account?.accountType}
          />
          <QuickActions onTransferClick={() => setIsTransferModalOpen(true)} />
          <InvestmentCard />
          <SecuritySection />
        </div>

        {/* Right Column: Analytics & Transactions */}
        <div className="dashboard-right-col">
          <Analytics transactions={transactions} currentAccountId={account?._id} />
          
          <div className="glass-panel transactions-section mt-6">
            <div className="card-header">
              <h3>Recent Activity</h3>
            </div>
            <TransactionHistory transactions={transactions} currentAccountId={account?._id} />
          </div>
        </div>

      </div>

      <Footer />

      {isTransferModalOpen && (
        <TransferModal 
          onClose={() => setIsTransferModalOpen(false)} 
          onSuccess={handleTransactionSuccess} 
        />
      )}
    </div>
  );
};

export default Dashboard;
