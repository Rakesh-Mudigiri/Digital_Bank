import { Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="coming-soon-page animate-fade-in">
      <div className="glass-panel coming-soon-card">
        <Construction size={56} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-bright)' }}>
          {title}
        </h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          This feature is coming soon to your IndiaBank experience.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
