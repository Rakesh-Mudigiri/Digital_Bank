import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Bell, CheckCheck, Mail, MailOpen } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', config);
      setNotifications(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, config);
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="text-center mt-4">Loading notifications...</div>;

  return (
    <div className="notifications-page animate-fade-in">
      <div className="page-header-row">
        <h2 className="page-title"><Bell size={22} /> Notifications</h2>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>
            <CheckCheck size={16} /> Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: '3rem' }}>
            <Bell size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
            <p className="text-muted">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className={`glass-panel notif-item ${n.isRead ? 'read' : 'unread'}`}
              onClick={() => !n.isRead && markRead(n._id)}>
              <div className="notif-icon">
                {n.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
              </div>
              <div className="notif-body">
                <p className="notif-msg">{n.message}</p>
                <span className="notif-meta">
                  <span className={`notif-type ${n.type}`}>{n.type}</span>
                  {new Date(n.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              {!n.isRead && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
