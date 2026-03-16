import { Copy, Landmark, Wallet } from 'lucide-react';
import './AccountSummary.css';

const AccountSummary = ({ name, balance, accountNumber, accountType }) => {
  const ifscCode = "INDB0001234";
  const typeLabel = accountType === 'current' ? 'Current Account' : 'Savings Account';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Simple feedback could be added here
  };

  return (
    <div className="account-summary-card glass-panel">
      <div className="summary-header">
        <div className="account-badge">
          <Landmark size={16} />
          <span>{typeLabel}</span>
        </div>
        <div className="bank-brand">IndiaBank</div>
      </div>

      <div className="balance-section">
        <span className="balance-label">Available Balance</span>
        <h2 className="balance-amount">{formatCurrency(balance)}</h2>
      </div>

      <div className="account-details-grid">
        <div className="detail-item">
          <span className="detail-label">Account Number</span>
          <div className="detail-value-wrapper">
            <span className="detail-value">{accountNumber || '----------'}</span>
            <button className="copy-btn" onClick={() => copyToClipboard(accountNumber)}>
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-label">IFSC Code</span>
          <div className="detail-value-wrapper">
            <span className="detail-value uppercase">{ifscCode}</span>
            <button className="copy-btn" onClick={() => copyToClipboard(ifscCode)}>
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="summary-footer">
        <div className="upi-id-badge">
          <Wallet size={12} />
          <span>UPI: {name?.toLowerCase().replace(/\s/g, '')}@api</span>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
