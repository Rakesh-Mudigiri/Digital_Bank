import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfers from './pages/Transfers';
import Profile from './pages/Profile';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import BillPayments from './pages/BillPayments';
import Deposits from './pages/Deposits';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import MiniStatement from './pages/MiniStatement';
import ComingSoon from './pages/ComingSoon';
import Support from './pages/Support';

import { NotificationProvider } from './context/NotificationContext';
import NotificationAlert from './components/NotificationAlert';

const AppContent = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-screen text-center mt-4">Initializing IndiaBank...</div>;

  return (
    <div className={`app-layout ${user ? 'has-sidebar' : 'auth-flow'}`}>
      <NotificationAlert />
      {user && <Sidebar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          
          {/* Customer Routes */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/transfers" element={user ? <Transfers /> : <Navigate to="/login" />} />
          <Route path="/history" element={user ? <TransactionHistoryPage /> : <Navigate to="/login" />} />
          <Route path="/bills" element={user ? <BillPayments /> : <Navigate to="/login" />} />
          <Route path="/deposits" element={user ? <Deposits /> : <Navigate to="/login" />} />
          <Route path="/statements" element={user ? <MiniStatement /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/security" element={user ? <ComingSoon title="Security" /> : <Navigate to="/login" />} />
          <Route path="/support" element={user ? <Support /> : <Navigate to="/login" />} />

          {/* Admin Routes */}
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
