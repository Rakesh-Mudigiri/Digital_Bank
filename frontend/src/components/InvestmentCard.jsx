import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './InvestmentCard.css';

const InvestmentCard = () => {
  const navigate = useNavigate();

  const investments = [
    { type: 'Fixed Deposit', amount: 500000, growth: '+6.5%' },
    { type: 'Mutual Funds', amount: 240000, growth: '+12.3%' },
  ];

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="investment-card glass-panel">
      <div className="investment-header">
        <h4><TrendingUp size={16} style={{ color: 'var(--accent)' }} /> Investments</h4>
      </div>

      <div className="investment-list">
        {investments.map((inv) => (
          <div key={inv.type} className="investment-item">
            <div className="investment-info">
              <span className="investment-name">{inv.type}</span>
              <span className="investment-type">{formatINR(inv.amount)}</span>
            </div>
            <div className="investment-growth">
              {inv.growth} <ArrowUpRight size={14} />
            </div>
          </div>
        ))}
      </div>
      
      <button className="explore-btn" onClick={() => navigate('/deposits')}>View Deposits</button>
    </div>
  );
};

export default InvestmentCard;
