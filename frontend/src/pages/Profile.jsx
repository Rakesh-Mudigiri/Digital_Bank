import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { User, Mail, Phone, Shield, Key, Save } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', config);
        setProfile({ name: res.data.name, email: res.data.email, phone: res.data.phone || '' });
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setMessage(''); }
    else { setMessage(msg); setError(''); }
    setTimeout(() => { setMessage(''); setError(''); }, 3000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/auth/profile', 
        { name: profile.name, phone: profile.phone }, config);
      showMsg('Profile updated successfully!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Update failed', true);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/auth/change-password', passwords, config);
      setPasswords({ currentPassword: '', newPassword: '' });
      showMsg('Password changed successfully!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to change password', true);
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/auth/set-pin', { pin }, config);
      setPin('');
      showMsg('Transaction PIN set successfully!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to set PIN', true);
    }
  };

  return (
    <div className="profile-page animate-fade-in">
      <h2 className="page-title">My Profile</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          <User size={16} /> Personal Info
        </button>
        <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          <Shield size={16} /> Security
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="glass-panel profile-section">
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label"><User size={14} /> Full Name</label>
              <input type="text" className="form-input" value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label"><Mail size={14} /> Email</label>
              <input type="email" className="form-input" value={profile.email} disabled />
              <small className="text-muted">Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label className="form-label"><Phone size={14} /> Phone Number</label>
              <input type="tel" className="form-input" value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="+91 9876543210" />
            </div>
            <button type="submit" className="btn btn-primary mt-4">
              <Save size={16} /> Save Changes
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="security-forms">
          <div className="glass-panel profile-section">
            <h3><Key size={16} /> Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} minLength="6" required />
              </div>
              <button type="submit" className="btn btn-primary mt-4">Update Password</button>
            </form>
          </div>

          <div className="glass-panel profile-section mt-6">
            <h3><Shield size={16} /> Transaction PIN</h3>
            <p className="text-muted text-sm">Set a 4-digit PIN for transaction verification.</p>
            <form onSubmit={handleSetPin}>
              <div className="form-group">
                <label className="form-label">4-Digit PIN</label>
                <input type="password" className="form-input" value={pin} maxLength="4" pattern="\d{4}"
                  onChange={(e) => setPin(e.target.value)} placeholder="••••" required />
              </div>
              <button type="submit" className="btn btn-primary mt-4">Set PIN</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
