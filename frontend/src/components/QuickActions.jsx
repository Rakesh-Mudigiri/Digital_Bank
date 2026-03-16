import { useNavigate } from 'react-router-dom';
import { Send, ArrowDownToLine, Receipt, PiggyBank } from 'lucide-react';
import './QuickActions.css';

const QuickActions = ({ onTransferClick }) => {
  const navigate = useNavigate();

  const actions = [
    { id: 'send', icon: Send, label: 'Send Money', onClick: onTransferClick, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
    { id: 'deposit', icon: ArrowDownToLine, label: 'Deposit', onClick: () => navigate('/deposits'), gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
    { id: 'bills', icon: Receipt, label: 'Pay Bills', onClick: () => navigate('/bills'), gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
    { id: 'fd', icon: PiggyBank, label: 'Fixed Deposit', onClick: () => navigate('/deposits'), gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  ];

  return (
    <div className="glass-panel quick-actions-panel">
      <h4 className="quick-actions-title">Quick Actions</h4>
      <div className="quick-actions-grid">
        {actions.map(action => (
          <button key={action.id} className="action-card" onClick={action.onClick}>
            <div className="action-icon-circle" style={{ background: action.gradient }}>
              <action.icon size={20} color="white" />
            </div>
            <span className="action-card-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
