import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Search, Download, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';
import './TransactionHistoryPage.css';

const TransactionHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    const fetch = async () => {
      try {
        const [accRes, txRes] = await Promise.all([
          axios.get('http://localhost:5000/api/accounts/my-account', config),
          axios.get('http://localhost:5000/api/transactions', config)
        ]);
        setCurrentAccount(accRes.data);
        setTransactions(txRes.data);
        setFiltered(txRes.data);
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    let result = transactions;
    if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter);
    if (search) result = result.filter(t =>
      (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.transactionRef || '').toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, typeFilter, transactions]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const downloadCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Description', 'Status', 'Reference'];
    const rows = filtered.map(t => [
      new Date(t.createdAt).toLocaleDateString('en-IN'),
      t.type, t.amount, t.description || '-', t.status || 'success', t.transactionRef || '-'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  const statusIcon = (status) => {
    if (status === 'success') return <CheckCircle size={14} className="text-success" />;
    if (status === 'pending') return <Clock size={14} className="text-warning" />;
    return <XCircle size={14} className="text-danger" />;
  };

  if (loading) return <div className="text-center mt-4">Loading transactions...</div>;

  return (
    <div className="txn-history-page animate-fade-in">
      <div className="page-header-row">
        <h2 className="page-title">Transaction History</h2>
        <button className="btn btn-outline" onClick={downloadCSV}><Download size={16} /> Export CSV</button>
      </div>

      <div className="filters-bar glass-panel">
        <div className="search-box">
          <Search size={16} />
          <input type="text" placeholder="Search by description or ref..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          <Filter size={16} />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="transfer">Transfers</option>
            <option value="bill_payment">Bill Payments</option>
          </select>
        </div>
      </div>

      <div className="glass-panel txn-table-wrapper">
        {filtered.length === 0 ? (
          <p className="text-center text-muted py-4">No transactions found.</p>
        ) : (
          <table className="txn-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>From Account</th>
                <th>To Account</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isCredit = t.type === 'deposit' || (t.type === 'transfer' && t.recipientAccount?._id === currentAccount?._id);
                return (
                  <tr key={t._id}>
                    <td>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><span className={`type-badge ${t.type}`}>{t.type.replace('_', ' ')}</span></td>
                    <td className="mono-sm">{t.account?.accountNumber || '—'}</td>
                    <td className="mono-sm">{t.recipientAccount?.accountNumber || (t.type === 'bill_payment' ? 'BILLER' : '—')}</td>
                    <td>{t.description || '-'}</td>
                    <td className={isCredit ? 'text-success font-bold' : 'text-danger font-bold'}>
                      {isCredit ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="status-cell">{statusIcon(t.status)} {t.status || 'success'}</td>
                    <td className="ref-cell">{t.transactionRef || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
