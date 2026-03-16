import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SecuritySection.css';

const SecuritySection = () => {
  const navigate = useNavigate();

  return (
    <div className="security-section glass-panel">
      <div className="security-header">
        <h4><ShieldCheck size={16} style={{ color: 'var(--primary)' }} /> Security</h4>
        <span className="kyc-badge">✓ KYC Verified</span>
      </div>
      <div className="security-items">
        <div className="security-item">
          <Lock size={14} />
          <span>Last login from <strong>Mumbai, India</strong></span>
        </div>
        <div className="security-item">
          <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
          <span>Enable <strong>2FA</strong> for enhanced protection</span>
        </div>
      </div>
      <button className="explore-btn mt-4" onClick={() => navigate('/profile')}>Security Settings</button>
    </div>
  );
};

export default SecuritySection;
