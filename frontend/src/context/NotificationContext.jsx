import { createContext, useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState(null);
  const prevCountRef = useRef(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:5000/api/notifications/unread-count', config);
      const newCount = res.data.count;

      if (newCount > prevCountRef.current) {
        // Fetch the newest notification message to show in toast
        const notificationsRes = await axios.get('http://localhost:5000/api/notifications', config);
        const newest = notificationsRes.data[0];
        if (newest) {
          setLatestAlert(newest);
          // Auto-clear alert after 5 seconds
          setTimeout(() => setLatestAlert(null), 5000);
        }
      }
      
      setUnreadCount(newCount);
      prevCountRef.current = newCount;
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000); // Poll every 15s
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setLatestAlert(null);
      prevCountRef.current = 0;
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, latestAlert, setLatestAlert, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
