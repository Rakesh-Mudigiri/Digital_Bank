import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { HeadphonesIcon, PlusCircle, CheckCircle, Clock, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './Support.css';

const CATEGORIES = [
  { value: 'account_issue', label: 'Account Issue' },
  { value: 'transaction_issue', label: 'Transaction Issue' },
  { value: 'card_issue', label: 'Card Issue' },
  { value: 'technical_issue', label: 'Technical Issue' },
  { value: 'fraud_report', label: 'Fraud Report' },
  { value: 'general_query', label: 'General Query' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const statusConfig = {
  open:      { icon: Clock,         color: '#f59e0b', label: 'Open' },
  in_review: { icon: AlertCircle,   color: '#6366f1', label: 'In Review' },
  resolved:  { icon: CheckCircle,   color: '#10b981', label: 'Resolved' },
  closed:    { icon: XCircle,       color: '#64748b', label: 'Closed' },
};

const Support = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    message: '',
  });

  const [followUpText, setFollowUpText] = useState('');
  const [sendingFollowUp, setSendingFollowUp] = useState(false);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchTickets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/support/my-tickets', config);
      setTickets(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/support', form, config);
      setMsg({ type: 'success', text: 'Ticket submitted! We will get back to you soon.' });
      setForm({ subject: '', category: 'general_query', priority: 'medium', message: '' });
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to submit ticket.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/support/${id}/close`, {}, config);
      fetchTickets();
    } catch { /* silent */ }
  };

  const handleSendMessage = async (ticketId) => {
    if (!followUpText.trim()) return;
    setSendingFollowUp(true);
    try {
      await axios.post(`http://localhost:5000/api/support/${ticketId}/message`, { text: followUpText }, config);
      setFollowUpText('');
      fetchTickets();
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to send message.' });
    } finally {
      setSendingFollowUp(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) return <div className="text-center mt-4">Loading support tickets...</div>;

  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_review').length;

  return (
    <div className="support-page animate-fade-in">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Customer Support</h2>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Raise a request and our team will resolve it within 24–48 hours.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={16} /> New Ticket
        </button>
      </div>

      {/* Summary Cards */}
      <div className="support-summary-row">
        {[
          { label: 'Total Tickets', value: tickets.length, color: '#6366f1' },
          { label: 'Open / In Review', value: openCount, color: '#f59e0b' },
          { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: '#10b981' },
          { label: 'Closed', value: tickets.filter(t => t.status === 'closed').length, color: '#64748b' },
        ].map(card => (
          <div key={card.label} className="glass-panel support-stat-card">
            <span className="stat-num" style={{ color: card.color }}>{card.value}</span>
            <span className="stat-lbl">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Alert */}
      {msg.text && (
        <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1.5rem' }}>
          {msg.text}
        </div>
      )}

      {/* New Ticket Form */}
      {showForm && (
        <div className="glass-panel support-form-panel">
          <h3 className="form-section-title">
            <HeadphonesIcon size={18} /> Raise a Support Ticket
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="support-form-grid">
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief description of your issue"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div className="support-tickets-list">
        {tickets.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <HeadphonesIcon size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p className="text-muted">No support tickets yet. Click <strong>New Ticket</strong> to get help.</p>
          </div>
        ) : (
          tickets.map(ticket => {
            const s = statusConfig[ticket.status] || statusConfig.open;
            const StatusIcon = s.icon;
            const isExpanded = expandedId === ticket._id;
            return (
              <div key={ticket._id} className="glass-panel ticket-card">
                <div className="ticket-header" onClick={() => setExpandedId(isExpanded ? null : ticket._id)}>
                  <div className="ticket-left">
                    <StatusIcon size={18} style={{ color: s.color, flexShrink: 0 }} />
                    <div>
                      <p className="ticket-subject">{ticket.subject}</p>
                      <p className="ticket-meta">
                        <span className="ticket-cat">{CATEGORIES.find(c => c.value === ticket.category)?.label}</span>
                        <span>·</span>
                        <span>{formatDate(ticket.createdAt)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="ticket-right">
                    <span className="ticket-badge" style={{ background: `${s.color}22`, color: s.color }}>{s.label}</span>
                    <span className={`ticket-priority p-${ticket.priority}`}>{ticket.priority}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="ticket-body">
                    <div className="ticket-chat-thread">
                      {ticket.messages.map((m, idx) => (
                        <div key={idx} className={`chat-message ${m.sender === 'admin' ? 'admin-msg' : 'user-msg'}`}>
                          <div className="msg-header">
                            <span className="msg-sender">{m.sender === 'admin' ? 'Bank Support' : 'You'}</span>
                            <span className="msg-time">{formatDate(m.timestamp)}</span>
                          </div>
                          <p className="msg-text">{m.text}</p>
                        </div>
                      ))}
                    </div>

                    {(ticket.status === 'open' || ticket.status === 'in_review') && (
                      <div className="follow-up-area">
                        <textarea
                          className="form-input follow-up-textarea"
                          placeholder="Type a follow-up message..."
                          value={followUpText}
                          onChange={(e) => setFollowUpText(e.target.value)}
                          rows={2}
                        />
                        <div className="follow-up-actions">
                          <button 
                            className="btn btn-primary btn-sm" 
                            disabled={sendingFollowUp || !followUpText.trim()}
                            onClick={() => handleSendMessage(ticket._id)}
                          >
                            {sendingFollowUp ? 'Sending...' : 'Send Message'}
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleClose(ticket._id)}
                          >
                            Close Ticket
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FAQ Section */}
      <div className="glass-panel faq-section">
        <h3 className="faq-title">Frequently Asked Questions</h3>
        {[
          { q: 'How do I reset my transaction PIN?', a: 'Go to Profile → Security tab → Set PIN. You can update your PIN anytime.' },
          { q: 'Why is my account showing blocked?', a: 'Accounts may be blocked due to suspicious activity or admin review. Contact support for assistance.' },
          { q: 'How long does a bank transfer take?', a: 'Internal transfers are instant. NEFT may take up to 2 hours and IMPS is typically within minutes.' },
          { q: 'How do I report unauthorized transactions?', a: 'Raise a ticket with category "Fraud Report" immediately. Our team will investigate within 24 hours.' },
        ].map((faq, i) => (
          <div key={i} className="faq-item">
            <p className="faq-q">Q: {faq.q}</p>
            <p className="faq-a">A: {faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Support;
