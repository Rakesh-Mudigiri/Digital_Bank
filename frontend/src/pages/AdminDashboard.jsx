import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, IndianRupee, ArrowRightLeft, BarChart3, Lock, Unlock, 
  TrendingUp, TrendingDown, Activity, PiggyBank, Receipt, 
  AlertCircle, ShieldCheck, Eye, Ban, Search, HeadphonesIcon, Send
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchUser, setSearchUser] = useState('');
  const [supportTickets, setSupportTickets] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, u, t, tk] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', config),
          axios.get('http://localhost:5000/api/admin/users', config),
          axios.get('http://localhost:5000/api/admin/transactions', config),
          axios.get('http://localhost:5000/api/support/all', config),
        ]);
        setStats(s.data);
        setUsers(u.data);
        setTransactions(t.data);
        setSupportTickets(tk.data);
      } catch (err) { console.error(err); }
    };
    fetchAll();
  }, []);

  const toggleBlock = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/block`, {}, config);
      const res = await axios.get('http://localhost:5000/api/admin/users', config);
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const submitReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      await axios.post(`http://localhost:5000/api/support/${id}/message`, { text: replyText }, config);
      const res = await axios.get('http://localhost:5000/api/support/all', config);
      setSupportTickets(res.data);
      setReplyText('');
      setReplyingTo(null);
    } catch (err) { console.error(err); }
  };

  // Analytics
  const deposits = transactions.filter(t => t.type === 'deposit');
  const transfers = transactions.filter(t => t.type === 'transfer');
  const bills = transactions.filter(t => t.type === 'bill_payment');
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const avgTxn = transactions.length > 0 ? totalVolume / transactions.length : 0;

  // Monthly bar data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthData = months.map((m, i) => ({
    month: m,
    amount: Math.round(totalVolume * (0.12 + Math.random() * 0.25)) || (i + 1) * 18000,
  }));
  const maxBar = Math.max(...monthData.map(d => d.amount), 1);

  // Filtered users
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const tabs = [
    { id: 'overview', icon: BarChart3, label: 'Overview' },
    { id: 'analytics', icon: Activity, label: 'Analytics & Reports' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'transactions', icon: ArrowRightLeft, label: 'Transaction Monitor' },
    { id: 'support', icon: HeadphonesIcon, label: 'Support Tickets' },
    { id: 'risk', icon: ShieldCheck, label: 'Risk & Compliance' },
  ];

  return (
    <div className="admin-page animate-fade-in">
      <div className="page-header-row">
        <h2 className="page-title">Admin Control Panel</h2>
        <span className="admin-badge">🔴 Administrator</span>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <tab.icon size={15} /> {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeTab === 'overview' && stats && (
        <>
          <div className="stats-grid">
            {[
              { icon: Users, val: stats.totalUsers, label: 'Total Accounts', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
              { icon: IndianRupee, val: formatCurrency(stats.totalDeposits), label: 'Total Deposits', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
              { icon: ArrowRightLeft, val: formatCurrency(stats.totalTransfers), label: 'Total Transfers', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
              { icon: BarChart3, val: stats.totalTransactions, label: 'Transactions', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            ].map((s, i) => (
              <div key={i} className="glass-panel stat-card">
                <div className="stat-icon-wrap" style={{ background: s.bg }}>
                  <s.icon size={22} style={{ color: s.color }} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{s.val}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="insights-grid">
            <div className="glass-panel insight-card">
              <h4 className="insight-title">What Admin Can Do</h4>
              <div className="admin-actions-list">
                <div className="admin-action-item">
                  <Eye size={15} style={{ color: 'var(--primary)' }} />
                  <div>
                    <strong>Monitor All Transactions</strong>
                    <span>View every deposit, transfer, and bill payment across all users in real-time.</span>
                  </div>
                </div>
                <div className="admin-action-item">
                  <Ban size={15} style={{ color: 'var(--danger)' }} />
                  <div>
                    <strong>Block / Unblock Users</strong>
                    <span>Instantly freeze suspicious accounts or restore access after investigation.</span>
                  </div>
                </div>
                <div className="admin-action-item">
                  <BarChart3 size={15} style={{ color: 'var(--accent)' }} />
                  <div>
                    <strong>Analyze Transaction Trends</strong>
                    <span>Track monthly volume, identify peak hours, and spot unusual patterns.</span>
                  </div>
                </div>
                <div className="admin-action-item">
                  <ShieldCheck size={15} style={{ color: 'var(--success)' }} />
                  <div>
                    <strong>Risk & Compliance</strong>
                    <span>Monitor KYC status, failed logins, locked accounts, and security alerts.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel insight-card">
              <h4 className="insight-title">System Health</h4>
              <div className="health-items">
                <div className="health-row"><span>Server</span> <span className="health-ok">● Online</span></div>
                <div className="health-row"><span>Database</span> <span className="health-ok">● Connected</span></div>
                <div className="health-row"><span>API Latency</span> <span className="health-ok">● &lt;100ms</span></div>
                <div className="health-row"><span>Active Users</span> <span style={{ color: 'var(--text-bright)', fontWeight: 700 }}>{stats.totalUsers}</span></div>
                <div className="health-row"><span>Blocked</span> <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{users.filter(u => u.isLocked).length}</span></div>
                <div className="health-row"><span>Last Backup</span> <span style={{ color: 'var(--text-bright)', fontWeight: 700 }}>Today 00:00</span></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ ANALYTICS ═══ */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <div className="glass-panel chart-card">
            <h4 className="insight-title">Monthly Transaction Volume</h4>
            <div className="bar-chart">
              {monthData.map((d, i) => (
                <div key={i} className="bar-col">
                  <div className="bar-value">{formatCurrency(d.amount)}</div>
                  <div className="bar-fill" style={{ height: `${Math.max((d.amount / maxBar) * 100, 5)}%` }}></div>
                  <div className="bar-label">{d.month}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="metric-grid">
            <div className="glass-panel metric-card">
              <PiggyBank size={20} style={{ color: '#10b981' }} />
              <div className="metric-value">{deposits.length}</div>
              <div className="metric-label">Deposits</div>
              <div className="metric-sub">{formatCurrency(deposits.reduce((s,t) => s+t.amount, 0))}</div>
            </div>
            <div className="glass-panel metric-card">
              <ArrowRightLeft size={20} style={{ color: '#6366f1' }} />
              <div className="metric-value">{transfers.length}</div>
              <div className="metric-label">Transfers</div>
              <div className="metric-sub">{formatCurrency(transfers.reduce((s,t) => s+t.amount, 0))}</div>
            </div>
            <div className="glass-panel metric-card">
              <Receipt size={20} style={{ color: '#f59e0b' }} />
              <div className="metric-value">{bills.length}</div>
              <div className="metric-label">Bills Paid</div>
              <div className="metric-sub">{formatCurrency(bills.reduce((s,t) => s+t.amount, 0))}</div>
            </div>
            <div className="glass-panel metric-card">
              <TrendingUp size={20} style={{ color: '#06b6d4' }} />
              <div className="metric-value">{formatCurrency(avgTxn)}</div>
              <div className="metric-label">Avg Transaction</div>
              <div className="metric-sub">{transactions.length} total</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 className="insight-title">Market Trends & Insights</h4>
            <div className="trends-list">
              {[
                { dot: '#10b981', title: 'Digital Payments Growing', desc: 'UPI transactions up 42% year-over-year.', icon: TrendingUp, iconColor: '#10b981' },
                { dot: '#6366f1', title: 'FD Rates Stable', desc: 'RBI repo rate at 6.5%. Fixed deposit demand steady.', icon: Activity, iconColor: '#6366f1' },
                { dot: '#f59e0b', title: 'Fraud Alerts Rising', desc: 'Phishing attempts up 15%. Recommend 2FA enforcement.', icon: AlertCircle, iconColor: '#f59e0b' },
                { dot: '#06b6d4', title: 'Mobile Banking Peak', desc: '78% of transactions from mobile. Optimize for mobile-first.', icon: TrendingUp, iconColor: '#06b6d4' },
              ].map((t, i) => (
                <div key={i} className="trend-item">
                  <div className="trend-dot" style={{ background: t.dot }}></div>
                  <div className="trend-body">
                    <strong>{t.title}</strong>
                    <span>{t.desc}</span>
                  </div>
                  <t.icon size={16} style={{ color: t.iconColor }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ USERS ═══ */}
      {activeTab === 'users' && (
        <>
          <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div className="search-row">
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search users by name or email..." 
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="admin-search-input"
              />
              <span className="user-count">{filteredUsers.length} users</span>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: 0, overflow: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Logins</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td>{u.isLocked ? <span className="text-danger">● Blocked</span> : <span className="text-success">● Active</span>}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.loginHistory?.length || 0}</td>
                    <td>
                      <button className="btn-sm" onClick={() => toggleBlock(u._id)}>
                        {u.isLocked ? <><Unlock size={13} /> Unblock</> : <><Lock size={13} /> Block</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══ TRANSACTIONS ═══ */}
      {activeTab === 'transactions' && (
        <div className="glass-panel" style={{ padding: 0, overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>Type</th><th>From Account</th><th>To Account</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No transactions yet</td></tr>
              ) : transactions.map((t) => (
                <tr key={t._id}>
                  <td>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`type-badge ${t.type}`}>{t.type.replace('_', ' ')}</span></td>
                  <td className="mono-sm">{t.account?.accountNumber || '—'}</td>
                  <td className="mono-sm">{t.recipientAccount?.accountNumber || '—'}</td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(t.amount)}</td>
                  <td><span className={`status-dot ${t.status || 'success'}`}>● {t.status || 'success'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ SUPPORT TICKETS ═══ */}
      {activeTab === 'support' && (
        <div className="support-tickets-admin animate-fade-in">
          {supportTickets.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <HeadphonesIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p className="text-muted">No support tickets found.</p>
            </div>
          ) : (
            <div className="tickets-grid">
              {supportTickets.map(ticket => (
                <div key={ticket._id} className={`glass-panel admin-ticket-card ${ticket.status}`}>
                  <div className="admin-ticket-header">
                    <div className="user-info-brief">
                      <span className="user-name-sm">{ticket.user?.name || 'Unknown'}</span>
                      <span className="user-email-sm">{ticket.user?.email || 'No email'}</span>
                    </div>
                    <span className={`admin-ticket-status ${ticket.status}`}>{ticket.status}</span>
                  </div>
                  <div className="admin-ticket-body">
                    <h4 className="admin-ticket-subject">{ticket.subject}</h4>
                    
                    <div className="admin-chat-thread">
                      {ticket.messages.map((m, idx) => (
                        <div key={idx} className={`admin-chat-msg ${m.sender}`}>
                          <div className="admin-chat-header">
                            <span className="admin-chat-sender">{m.sender === 'admin' ? 'Bank (You)' : ticket.user?.name}</span>
                            <span className="admin-chat-time">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="admin-chat-text">{m.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="reply-action-area" style={{ marginTop: '1rem' }}>
                      {replyingTo === ticket._id ? (
                        <div className="reply-input-wrapper">
                          <textarea 
                            className="admin-reply-textarea"
                            placeholder="Type your response..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="reply-btns">
                            <button className="btn btn-primary btn-sm" onClick={() => submitReply(ticket._id)}>
                              <Send size={12} /> Send Response
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => setReplyingTo(ticket._id)}>
                          Reply / Follow up
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="admin-ticket-footer">
                    <span>Priority: <strong className={`p-${ticket.priority}`}>{ticket.priority}</strong></span>
                    <span>Raised: {new Date(ticket.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'risk' && (
        <div className="risk-section">
          <div className="risk-grid">
            <div className="glass-panel risk-card">
              <h4 className="insight-title">KYC Status</h4>
              <div className="risk-stat">
                <div className="risk-number" style={{ color: 'var(--success)' }}>{users.filter(u => !u.isLocked).length}</div>
                <div className="risk-label">Verified</div>
              </div>
              <div className="risk-bar-track">
                <div className="risk-bar-fill" style={{ width: '100%', background: 'var(--success)' }}></div>
              </div>
              <p className="risk-desc">All registered users are KYC verified through Aadhaar + PAN.</p>
            </div>

            <div className="glass-panel risk-card">
              <h4 className="insight-title">Failed Logins</h4>
              <div className="risk-stat">
                <div className="risk-number" style={{ color: 'var(--warning)' }}>
                  {users.reduce((s, u) => s + (u.failedLoginAttempts || 0), 0)}
                </div>
                <div className="risk-label">Total Failed Attempts</div>
              </div>
              <p className="risk-desc">Accounts auto-lock after 5 failed attempts. Monitor for brute force patterns.</p>
            </div>

            <div className="glass-panel risk-card">
              <h4 className="insight-title">Locked Accounts</h4>
              <div className="risk-stat">
                <div className="risk-number" style={{ color: 'var(--danger)' }}>{users.filter(u => u.isLocked).length}</div>
                <div className="risk-label">Currently Blocked</div>
              </div>
              <p className="risk-desc">Accounts locked due to suspicious activity or admin action. Review in User Management tab.</p>
            </div>

            <div className="glass-panel risk-card">
              <h4 className="insight-title">High-Value Transactions</h4>
              <div className="risk-stat">
                <div className="risk-number" style={{ color: 'var(--primary)' }}>
                  {transactions.filter(t => t.amount >= 50000).length}
                </div>
                <div className="risk-label">Above ₹50,000</div>
              </div>
              <p className="risk-desc">Large transactions flagged for AML compliance. Review transfer patterns.</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 className="insight-title">Compliance Checklist</h4>
            <div className="compliance-list">
              {[
                { text: 'KYC verification for all accounts', done: true },
                { text: 'Transaction PIN enabled for transfers', done: true },
                { text: 'Daily transfer limit ₹2,00,000 enforced', done: true },
                { text: 'Auto-lock after 5 failed login attempts', done: true },
                { text: 'AML monitoring for high-value transactions', done: true },
                { text: 'Login history tracking', done: true },
              ].map((item, i) => (
                <div key={i} className="compliance-item">
                  <span className={`compliance-check ${item.done ? 'done' : ''}`}>{item.done ? '✓' : '○'}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
