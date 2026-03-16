import { useState, useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  ClipboardList,
  FileText,
  Receipt,
  PiggyBank,
  Bell,
  LifeBuoy,
  LogOut,
  Wallet,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Settings
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', '260px');
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    document.documentElement.style.setProperty('--sidebar-width', nextState ? '80px' : '260px');
  };

  const customerMenu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ArrowRightLeft, label: 'Transfers', path: '/transfers' },
    { icon: ClipboardList, label: 'History', path: '/history' },
    { icon: FileText, label: 'Statements', path: '/statements' },
    { icon: Receipt, label: 'Bill Pay', path: '/bills' },
    { icon: PiggyBank, label: 'Deposits', path: '/deposits' },
    { icon: Bell, label: 'Alerts', path: '/notifications' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
  ];

  const adminMenu = [
    ...customerMenu,
    { icon: Settings, label: 'Admin', path: '/admin' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenu : customerMenu;

  return (
    <aside className={`sidebar-nav ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="collapse-toggle" onClick={toggleCollapse}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="sidebar-header">
        <NavLink to="/dashboard" style={{ textDecoration: 'none', display: 'flex' }}>
          <div className="logo-wrapper">
            <img src="/bank-logo.png" alt="IndiaBank" className="logo-img" />
            {!isCollapsed && (
              <div className="logo-text-block">
                <span className="logo-text">IndiaBank</span>
                <span className="logo-tagline">Secure &amp; Digital Banking</span>
              </div>
            )}
          </div>
        </NavLink>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink key={item.label} to={item.path}
            className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
            title={isCollapsed ? item.label : ''}>
            <div className="icon-badge-wrapper">
              <item.icon size={20} className="menu-icon" />
              {item.label === 'Alerts' && unreadCount > 0 && (
                <span className="sidebar-notification-dot"></span>
              )}
            </div>
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/support" className="menu-link support-link" title={isCollapsed ? "Support" : ""}>
          <LifeBuoy size={20} className="menu-icon" />
          {!isCollapsed && <span>Support</span>}
        </NavLink>
        <button onClick={logout} className="menu-link logout-btn" title={isCollapsed ? "Logout" : ""}>
          <LogOut size={20} className="menu-icon" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
