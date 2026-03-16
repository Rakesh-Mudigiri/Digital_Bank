import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import './TransactionHistory.css';

const TransactionHistory = ({ transactions, currentAccountId }) => {
  if (!transactions || transactions.length === 0) {
    return <div className="no-transactions">No recent activity found.</div>;
  }

  return (
    <div className="transaction-list">
      {transactions.map(t => {
        const isSender = t.account && t.account._id === currentAccountId;
        let typeLabel = "Transfer";
        let amountPrefix = "-";
        let amountClass = "text-danger";
        let Icon = ArrowUpRight;

        if (t.type === 'deposit') {
          typeLabel = "Deposit";
          amountPrefix = "+";
          amountClass = "text-success";
          Icon = ArrowDownLeft;
        } else if (t.type === 'withdrawal') {
          typeLabel = "Withdrawal";
        } else if (t.type === 'transfer') {
          if (!isSender) {
            typeLabel = `Transfer from •••• ${t.account?.accountNumber?.slice(-4) || 'XXXX'}`;
            amountPrefix = "+";
            amountClass = "text-success";
            Icon = ArrowDownLeft;
          } else {
            typeLabel = `Transfer to •••• ${t.recipientAccount?.accountNumber?.slice(-4) || 'XXXX'}`;
          }
        } else if (t.type === 'bill_payment') {
          typeLabel = `Bill Payment`;
        }

        return (
          <div key={t._id} className="transaction-item">
            <div className="transaction-info flex items-center">
              <div className={`transaction-icon-box ${amountClass}`}>
                <Icon size={20} />
              </div>
              <div className="transaction-details">
                <h4>{typeLabel}</h4>
                <p className="transaction-date">{new Date(t.createdAt).toLocaleString()}</p>
                {t.description && <p className="transaction-desc">{t.description}</p>}
              </div>
            </div>
            <div className={`transaction-amount ${amountClass}`}>
              {amountPrefix}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionHistory;
