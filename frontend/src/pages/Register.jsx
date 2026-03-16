import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Mail, Phone } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, phone);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="glass-panel auth-card">
        <div className="auth-header text-center">
          <h2>Create Account</h2>
          <p>Join IndiaBank to manage your finances.</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input 
                id="name"
                name="name"
                type="text" 
                className="form-input with-icon" 
                placeholder="Rahul Sharma"
                autoComplete="name"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

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
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <div className="input-group">
              <Phone className="input-icon" size={18} />
              <input 
                id="phone"
                name="phone"
                type="tel" 
                className="form-input with-icon" 
                placeholder="+91 9876543210"
                autoComplete="tel"
                value={phone} onChange={(e) => setPhone(e.target.value)} />
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
                autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" required />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary w-full mt-4">
            Create Account
          </button>
        </form>
        
        <div className="auth-footer text-center mt-4">
          <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;

