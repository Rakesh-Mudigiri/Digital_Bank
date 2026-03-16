import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { Bell, X } from 'lucide-react';
import './NotificationAlert.css';

const NotificationAlert = () => {
  const { latestAlert, setLatestAlert } = useContext(NotificationContext);

  if (!latestAlert) return null;

  return (
    <div className="notification-toast animate-slide-in">
      <div className="toast-content">
        <div className="toast-icon">
          <Bell size={20} />
        </div>
        <div className="toast-body">
          <p className="toast-title">New Notification</p>
          <p className="toast-msg">{latestAlert.message}</p>
        </div>
        <button className="toast-close" onClick={() => setLatestAlert(null)}>
          <X size={16} />
        </button>
      </div>
      <div className="toast-progress"></div>
    </div>
  );
};

export default NotificationAlert;
