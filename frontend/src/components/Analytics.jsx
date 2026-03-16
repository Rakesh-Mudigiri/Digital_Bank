import './Analytics.css';

const Analytics = ({ transactions, currentAccountId }) => {
  const isIncome = (t) => {
    if (t.type === 'deposit') return true;
    if (t.type === 'transfer' && t.account?._id !== currentAccountId) return true;
    return false;
  };

  const income = transactions.filter(t => isIncome(t)).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => !isIncome(t)).reduce((s, t) => s + t.amount, 0);
  const total = income + expenses || 1;
  const incomePct = Math.round((income / total) * 100);
  const expensePct = 100 - incomePct;
  const formatINR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  // Category breakdown
  const categories = [
    { label: 'Sent Transfers', color: '#6366f1', amount: transactions.filter(t => t.type === 'transfer' && !isIncome(t)).reduce((s, t) => s + t.amount, 0) },
    { label: 'Received Transfers', color: '#8b5cf6', amount: transactions.filter(t => t.type === 'transfer' && isIncome(t)).reduce((s, t) => s + t.amount, 0) },
    { label: 'Bills', color: '#f59e0b', amount: transactions.filter(t => t.type === 'bill_payment').reduce((s, t) => s + t.amount, 0) },
    { label: 'Deposits', color: '#10b981', amount: transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0) },
    { label: 'Withdrawals', color: '#ef4444', amount: transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0) },
    { label: 'Other', color: '#06b6d4', amount: transactions.filter(t => !['transfer','bill_payment','deposit','withdrawal'].includes(t.type)).reduce((s, t) => s + t.amount, 0) },
  ];
  const catTotal = categories.reduce((s, c) => s + c.amount, 0) || 1;

  return (
    <div className="analytics-container glass-panel">
      <h4 className="analytics-heading">Spending Overview</h4>
      
      {/* Donut Chart */}
      <div className="donut-row">
        <div className="donut-chart">
          <svg viewBox="0 0 120 120" className="donut-svg">
            <circle cx="60" cy="60" r="50" className="donut-bg" />
            <circle cx="60" cy="60" r="50" className="donut-income"
              strokeDasharray={`${incomePct * 3.14} ${(100 - incomePct) * 3.14}`}
              strokeDashoffset="0" />
            <circle cx="60" cy="60" r="50" className="donut-expense"
              strokeDasharray={`${expensePct * 3.14} ${(100 - expensePct) * 3.14}`}
              strokeDashoffset={`${-incomePct * 3.14}`} />
          </svg>
          <div className="donut-center">
            <span className="donut-total">{formatINR(income + expenses)}</span>
            <span className="donut-label">Total</span>
          </div>
        </div>

        <div className="donut-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#10b981' }}></div>
            <div className="legend-text">
              <span className="legend-name">Income</span>
              <span className="legend-val income">{formatINR(income)}</span>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#f43f5e' }}></div>
            <div className="legend-text">
              <span className="legend-name">Expenses</span>
              <span className="legend-val expense">{formatINR(expenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Bars */}
      <div className="category-section">
        <h5 className="cat-heading">By Category</h5>
        {categories.filter(c => c.amount > 0).map(cat => (
          <div key={cat.label} className="cat-row">
            <div className="cat-info">
              <div className="cat-dot" style={{ background: cat.color }}></div>
              <span className="cat-name">{cat.label}</span>
              <span className="cat-amount">{formatINR(cat.amount)}</span>
            </div>
            <div className="cat-bar-track">
              <div className="cat-bar-fill" style={{ width: `${(cat.amount / catTotal) * 100}%`, background: cat.color }}></div>
            </div>
          </div>
        ))}
        {categories.every(c => c.amount === 0) && (
          <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '1rem 0' }}>No activity yet</p>
        )}
      </div>

      <div className="analytics-footer">
        <span>{transactions.length} transactions</span>
      </div>
    </div>
  );
};

export default Analytics;
