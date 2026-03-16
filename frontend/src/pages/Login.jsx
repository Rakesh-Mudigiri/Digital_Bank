import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login('admin@indiabank.com', 'admin');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-panel auth-card">
        <div className="auth-header text-center">
          <h2>Welcome Back</h2>
          <p>Login to access your digital bank.</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-group">
              <Mail className="input-icon" size={18} />
              <input 
                id="email"
                name="email"
                type="email" 
                className="form-input with-icon" 
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <Lock className="input-icon" size={18} />
              <input 
                id="password"
                name="password"
                type="password" 
                className="form-input with-icon" 
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer text-center mt-4">
          <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>
      </div>

      {/* Admin Quick Login */}
      <div className="admin-login-box">
        <div className="admin-login-label">
          <ShieldCheck size={14} />
          <span>Admin Access</span>
        </div>
        <button className="admin-login-btn" onClick={handleAdminLogin} disabled={loading}>
          Login as Admin
        </button>
        <p className="admin-cred">admin@indiabank.com / admin</p>
      </div>
    </div>
  );
};

export default Login;
